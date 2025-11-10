#!/usr/bin/env bash
set -e

# Activate conda environment
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4

# Set CUDA environment variables (conda provides CUDA)
export CUDA_HOME=${CONDA_PREFIX}
export PATH=${CUDA_HOME}/bin:${PATH}
export LD_LIBRARY_PATH=${CUDA_HOME}/lib:${LD_LIBRARY_PATH}

# Optional runtime install of pointops to leverage host GPU and avoid build env limits
if [ "${INSTALL_POINTOPS_AT_RUNTIME:-0}" = "1" ]; then
  export TORCH_CUDA_ARCH_LIST=${TORCH_CUDA_ARCH_LIST:-"7.5;8.0;8.6;8.9;9.0"}
  export FORCE_CUDA=1
  export TORCH_CUDA_USE_NINJA=1

  MISSING="$(python - <<'PY'
import importlib
pkgs = ["pointops", "pointgroup_ops"]
missing = []
for pkg in pkgs:
    try:
        importlib.import_module(pkg)
    except Exception:
        missing.append(pkg)
print(" ".join(missing))
PY
)"

  if [ -n "$MISSING" ]; then
    echo "Installing missing packages at runtime: $MISSING"
    export MAX_JOBS=$(nproc)
    [ -d /app/libs/pointops ] && pip install --no-cache-dir -e /app/libs/pointops
    [ -d /app/libs/pointgroup_ops ] && pip install --no-cache-dir -e /app/libs/pointgroup_ops
  fi
fi

# CUDA sanity checks
python - <<'PY'
import importlib
import os
import sys

EXPECTED_CUDA = "12.4"

if os.getenv("SKIP_CUDA_SANITY") == "1":
    print("Skipping CUDA sanity checks (SKIP_CUDA_SANITY=1).")
    sys.exit(0)

try:
    import torch
except Exception as exc:
    raise SystemExit(
        "Torch import failed; this runtime expects the CUDA 12.4 wheels in the conda environment.\n"
        f"Original error: {exc}"
    )

cuda_version = getattr(torch.version, "cuda", None)
if cuda_version != EXPECTED_CUDA:
    raise SystemExit(
        f"CUDA runtime mismatch: expected {EXPECTED_CUDA}, but torch reports {cuda_version!r}.\n"
        "Ensure the container is built from the CUDA 12.4 base image and conda environment."
    )

mods = ["cumm", "spconv.pytorch", "pointops._C", "pointgroup_ops_cuda"]
failures = []
for mod in mods:
    try:
        importlib.import_module(mod)
    except Exception as exc:
        failures.append(f"{mod}: {exc}")

if failures:
    raise SystemExit(
        "CUDA extension import check failed:\n" + "\n".join(failures)
    )

print(f"✓ CUDA runtime check passed (version {cuda_version})")
print(f"✓ PyTorch version: {torch.__version__}")
print(f"✓ All CUDA extensions loaded successfully")
PY

# Start the application
exec python server.py
