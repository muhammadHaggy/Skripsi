#!/usr/bin/env sh
set -e

# Optional runtime install of pointops to leverage host GPU and avoid build env limits
if [ "${INSTALL_POINTOPS_AT_RUNTIME:-1}" = "1" ]; then
  export CUDA_HOME=${CUDA_HOME:-/usr/local/cuda}
  export TORCH_CUDA_ARCH_LIST=${TORCH_CUDA_ARCH_LIST:-"7.5;8.0;8.6;8.9"}
  export FORCE_CUDA=1

  MISSING="$(python - <<'PY'
import importlib
pkgs = ["pointops", "pointops2", "pointgroup_ops"]
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
    python -m pip install --no-cache-dir --no-build-isolation \
      /app/libs/pointops \
      /app/libs/pointops2 \
      /app/libs/pointgroup_ops
  fi
fi

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
        "Torch import failed; this runtime expects the CUDA 12.4 wheels baked into the image.\n"
        f"Original error: {exc}"
    )

cuda_version = getattr(torch.version, "cuda", None)
if cuda_version != EXPECTED_CUDA:
    raise SystemExit(
        f"CUDA runtime mismatch: expected {EXPECTED_CUDA}, but torch reports {cuda_version!r}.\n"
        "Ensure the container is built from the CUDA 12.4 base image."
    )

mods = ["cumm", "spconv.pytorch", "pointops._C", "pointops2_cuda", "pointgroup_ops_cuda"]
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

print(f"CUDA runtime check passed (version {cuda_version}).")
PY

exec python server.py