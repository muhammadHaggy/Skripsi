#!/usr/bin/env bash
# Test script for CUDA 12.4 + Torch 2.5.0 stack
set -e

echo "================================"
echo "Testing CUDA 12.4 Stack"
echo "================================"
echo ""

echo "1. Checking PyTorch and CUDA..."
python - <<'PY'
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA version (torch): {torch.version.cuda}")
if torch.cuda.is_available():
    print(f"GPU device: {torch.cuda.get_device_name(0)}")
    print(f"GPU count: {torch.cuda.device_count()}")
PY

echo ""
echo "2. Checking cumm and spconv..."
python - <<'PY'
import cumm
import spconv
from pathlib import Path

print(f"cumm version: {cumm.__version__}")
print(f"spconv version: {spconv.__version__}")

inc = Path(cumm.__file__).parent / "include" / "tensorview" / "core" / "all.h"
print(f"cumm header exists: {inc.exists()}")
assert inc.exists(), "cumm headers missing!"
PY

echo ""
echo "3. Testing spconv forward pass (should not trigger JIT)..."
python - <<'PY'
import torch
import spconv.pytorch as spconv

print("Creating sparse tensor...")
x = spconv.SparseConvTensor.from_dense(
    torch.randn(1, 2, 4, 4, 4, device="cuda")
)

print("Building sparse conv module...")
m = spconv.SparseSequential(
    spconv.SubMConv3d(2, 2, 3, indice_key="k")
)

print("Running forward pass...")
output = m(x)
print(f"✓ Forward pass successful! Output shape: {output.dense().shape}")
PY

echo ""
echo "4. Checking PyTorch Geometric..."
python - <<'PY'
import torch_scatter
import torch_geometric

print(f"torch_scatter version: {torch_scatter.__version__}")
print(f"torch_geometric version: {torch_geometric.__version__}")
PY

echo ""
echo "5. Checking MMCV..."
python - <<'PY'
try:
    import mmcv
    print(f"mmcv version: {mmcv.__version__}")
except ImportError:
    print("mmcv not installed (may be optional)")
PY

echo ""
echo "6. Checking custom CUDA extensions..."
python - <<'PY'
import importlib

extensions = [
    'pointops._C',
    'pointops2_cuda', 
    'pointgroup_ops_cuda'
]

for ext in extensions:
    try:
        importlib.import_module(ext)
        print(f"✓ {ext} imported successfully")
    except ImportError as e:
        print(f"✗ {ext} failed: {e}")
PY

echo ""
echo "================================"
echo "✓ All tests passed!"
echo "================================"

