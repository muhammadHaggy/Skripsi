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

exec python server.py