#!/usr/bin/env bash
# Build and test script for conda-based ML Docker image
set -e

cd "$(dirname "$0")/.."

IMAGE_NAME="${IMAGE_NAME:-ml-service:conda-cuda124}"

echo "================================"
echo "Building Conda-based ML Image"
echo "================================"
echo "Image name: ${IMAGE_NAME}"
echo ""

# Build the image
docker build \
  -f machine-learning/Dockerfile.gpu \
  -t "${IMAGE_NAME}" \
  --build-arg TORCH_CUDA_ARCH_LIST="7.5;8.0;8.6;8.9;9.0" \
  .

echo ""
echo "================================"
echo "Build Complete - Running Tests"
echo "================================"
echo ""

# Test 1: Check conda environment
echo "Test 1: Verify conda environment..."
docker run --rm "${IMAGE_NAME}" /bin/bash -c "
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
conda list | grep -E '(pytorch|spconv|cuda)'
"

echo ""
echo "Test 2: Check PyTorch and CUDA..."
docker run --rm --gpus all "${IMAGE_NAME}" /bin/bash -c "
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
python - <<'PY'
import torch
print(f'PyTorch: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'CUDA version: {torch.version.cuda}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
PY
"

echo ""
echo "Test 3: Check custom CUDA extensions..."
docker run --rm --gpus all "${IMAGE_NAME}" /bin/bash -c "
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
python - <<'PY'
import importlib
extensions = ['pointops._C', 'pointgroup_ops_cuda', 'spconv.pytorch']
for ext in extensions:
    try:
        importlib.import_module(ext)
        print(f'✓ {ext}')
    except Exception as e:
        print(f'✗ {ext}: {e}')
        exit(1)
PY
"

echo ""
echo "Test 4: spconv forward pass..."
docker run --rm --gpus all "${IMAGE_NAME}" /bin/bash -c "
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
python - <<'PY'
import torch
import spconv.pytorch as spconv
x = spconv.SparseConvTensor.from_dense(torch.randn(1, 2, 4, 4, 4, device='cuda'))
m = spconv.SparseSequential(spconv.SubMConv3d(2, 2, 3, indice_key='k'))
out = m(x)
print(f'✓ spconv forward pass OK: {out.dense().shape}')
PY
"

echo ""
echo "================================"
echo "✓ All tests passed!"
echo "================================"
echo ""
echo "Image ready: ${IMAGE_NAME}"
echo ""
echo "To run the service:"
echo "  docker run --gpus all -p 5001:5001 ${IMAGE_NAME}"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose -f docker-compose.ml.yml up"

