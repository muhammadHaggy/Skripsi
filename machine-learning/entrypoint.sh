#!/usr/bin/env sh
set -e

# Optional runtime install of pointops to leverage host GPU and avoid build env limits
if [ "${INSTALL_POINTOps_AT_RUNTIME:-1}" = "1" ]; then
  export CUDA_HOME=${CUDA_HOME:-/usr/local/cuda}
  export TORCH_CUDA_ARCH_LIST=${TORCH_CUDA_ARCH_LIST:-"7.5;8.0;8.6;8.9"}
  export FORCE_CUDA=1
  export CUDA_VISIBLE_DEVICES=${CUDA_VISIBLE_DEVICES:-0}
  # replace the current pointops install line with:
  if ls /app/wheels/*.whl 1>/dev/null 2>&1; then
    python -m pip install --no-cache-dir /app/wheels/*.whl
  else
    python -m pip install --no-cache-dir https://github.com/Silverster98/pointops/archive/refs/heads/master.zip || true
  fi
fi

exec python server.py