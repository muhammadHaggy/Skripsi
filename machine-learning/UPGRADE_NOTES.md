# CUDA 12.4 + Torch 2.5.0 Stack Upgrade

## Summary

Successfully migrated the machine learning environment from CUDA 12.1 + Torch 2.2.0 to the known-good Pointcept stack: **CUDA 12.4 + Torch 2.5.0**.

## Key Changes

### 1. Base Images Updated

**Before:**
- Build stage: `nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04`
- Runtime stage: `ubuntu:22.04` (no CUDA)

**After:**
- Build stage: `nvidia/cuda:12.4.1-cudnn8-devel-ubuntu22.04`
- Runtime stage: `nvidia/cuda:12.4.1-cudnn8-devel-ubuntu22.04`

### 2. PyTorch Stack

**Before:**
- torch 2.2.0+cu121
- torchvision 0.17.0+cu121
- torchaudio 2.2.0+cu121

**After:**
- torch 2.5.0+cu124
- torchvision 0.20.0+cu124
- torchaudio 2.5.0+cu124

### 3. Sparse Convolution Libraries

**Before:**
- cumm-cu121==0.7.11
- spconv-cu121==2.3.8
- JIT enabled (causing NVRTC header errors)

**After:**
- cumm-cu124==0.8.2
- spconv-cu124==2.3.8
- JIT **DISABLED** via `SPCONV_DISABLE_JIT=1` and `CUMM_DISABLE_JIT=1`

### 4. NVIDIA CUDA Python Wheels

**Before:**
```dockerfile
nvidia-cublas-cu12==12.1.3.1
nvidia-cuda-runtime-cu12==12.1.105
nvidia-cuda-nvrtc-cu12==12.1.105
nvidia-cuda-cupti-cu12==12.1.105
nvidia-cudnn-cu12==8.9.2.26
nvidia-cufft-cu12==11.0.2.54
nvidia-curand-cu12==10.3.2.106
nvidia-cusolver-cu12==11.4.5.107
nvidia-cusparse-cu12==12.1.0.106
nvidia-nccl-cu12==2.19.3
nvidia-nvjitlink-cu12==12.1.105
nvidia-nvtx-cu12==12.1.105
```

**After:**
```dockerfile
nvidia-cublas-cu12 (latest)
nvidia-cuda-runtime-cu12==12.4.127
nvidia-cuda-nvrtc-cu12==12.4.127
nvidia-cudnn-cu12 (latest)
```

> Simplified to only essential wheels; PyTorch 2.5.0+cu124 bundles most CUDA dependencies.

### 5. PyTorch Geometric

**Before:**
- torch_scatter==2.1.2+pt22cu121
- torch_geometric==2.6.1
- Wheel index: torch-2.2.0+cu121

**After:**
- torch_scatter (latest)
- torch_geometric (latest)
- Wheel index: torch-2.5.0+cu124

### 6. MMCV

**Before:**
```dockerfile
mmcv==2.2.0 -f https://download.openmmlab.com/mmcv/dist/cu121/torch2.2/index.html
```

**After:**
```dockerfile
mmcv==2.2.0 -f https://download.openmmlab.com/mmcv/dist/cu124/torch2.5/index.html
```

### 7. Architecture Support

**Before:**
- `TORCH_CUDA_ARCH_LIST="7.5;8.0;8.6;8.9"`

**After:**
- `TORCH_CUDA_ARCH_LIST="7.5;8.0;8.6;8.9;9.0"`
- Added support for Hopper architecture (9.0)

### 8. Smoke Tests

Added comprehensive smoke test in Dockerfile:

```python
import torch
import spconv.pytorch as spconv

# Test cumm headers exist
inc = pathlib.Path(cumm.__file__).parent / "include" / "tensorview" / "core" / "all.h"
assert inc.exists()

# Test spconv forward pass without JIT compilation
x = spconv.SparseConvTensor.from_dense(torch.randn(1, 2, 4, 4, 4, device="cuda"))
m = spconv.SparseSequential(spconv.SubMConv3d(2, 2, 3, indice_key="k"))
_ = m(x)
print('spconv forward OK')
```

### 9. Entrypoint Validation

Updated `entrypoint.sh` to verify CUDA 12.4:

```python
EXPECTED_CUDA = "12.4"  # was "12.1"
```

### 10. Deprecated Files

Renamed `environment.yml` → `environment.yml.deprecated-cuda11.3-py38`:
- This conda environment was pinned to Python 3.8 + CUDA 11.3
- **Do not use** with the current CUDA 12.4 stack
- Kept for historical reference only

## Why JIT is Disabled

The `SPCONV_DISABLE_JIT=1` and `CUMM_DISABLE_JIT=1` environment variables solve the NVRTC header issue:

### Problem (JIT Enabled)
```
NVRTC failed to find cumm/include/tensorview/core/all.h
```

NVRTC doesn't respect `CPATH` or system include paths; it requires explicit `-I` flags. The JIT code path in cumm/spconv didn't configure these correctly.

### Solution (JIT Disabled)
- Uses prebuilt kernels bundled in the cu124 wheels
- No runtime compilation needed
- Faster startup, more reliable
- spconv 2.3.8 cu124 wheels include prebuilt kernels for all common architectures

## Compatibility Matrix

| Component | Version | CUDA | PyTorch |
|-----------|---------|------|---------|
| Base Image | 12.4.1-cudnn8-devel | 12.4 | - |
| PyTorch | 2.5.0+cu124 | 12.4 | 2.5.0 |
| spconv | 2.3.8 (cu124) | 12.4 | 2.5.0 |
| cumm | 0.8.2 (cu124) | 12.4 | 2.5.0 |
| PyG | latest | 12.4 | 2.5.0 |
| mmcv | 2.2.0 | 12.4 | 2.5.0 |

## Verification

After building the updated image:

```bash
docker build -f Dockerfile.gpu -t ml-service:cuda124 .
docker run --gpus all ml-service:cuda124 python -c "
import torch
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'CUDA version: {torch.version.cuda}')
import spconv.pytorch as spconv
print('spconv OK')
"
```

Expected output:
```
CUDA available: True
CUDA version: 12.4
spconv OK
```

## References

- [spconv-cu124 on PyPI](https://pypi.org/project/spconv-cu124/)
- [cumm-cu124 on PyPI](https://pypi.org/project/cumm-cu124/)
- [PyTorch CUDA 12.4 wheels](https://download.pytorch.org/whl/cu124)
- [PyG wheels for torch 2.5.0+cu124](https://data.pyg.org/whl/torch-2.5.0+cu124.html)
- [MMCV cu124/torch2.5 index](https://download.openmmlab.com/mmcv/dist/cu124/torch2.5/index.html)

## Migration Checklist

- [x] Update Dockerfile base images to CUDA 12.4.1
- [x] Update PyTorch to 2.5.0+cu124
- [x] Update spconv/cumm to cu124 versions
- [x] Add JIT disable flags
- [x] Update nvidia CUDA Python wheels to 12.4.127
- [x] Update PyG wheels to torch-2.5.0+cu124
- [x] Update mmcv wheel index to cu124/torch2.5
- [x] Add smoke tests to Dockerfile
- [x] Update entrypoint.sh CUDA version check
- [x] Archive deprecated environment.yml
- [x] Document stack versions and changes

