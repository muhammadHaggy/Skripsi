# Machine Learning Stack Configuration

This document describes the current ML environment stack versions aligned with the Pointcept project.

## Current Stack (CUDA 12.4)

### Base Image
- **CUDA**: 12.4.1 with cuDNN 8
- **OS**: Ubuntu 22.04
- **Python**: 3.10

### Core ML Framework
- **PyTorch**: 2.5.0+cu124
- **TorchVision**: 0.20.0+cu124
- **TorchAudio**: 2.5.0+cu124
- **Index URL**: https://download.pytorch.org/whl/cu124

### CUDA Python Wheels
- **nvidia-cuda-runtime-cu12**: 12.4.127
- **nvidia-cuda-nvrtc-cu12**: 12.4.127
- **nvidia-cublas-cu12**: latest compatible
- **nvidia-cudnn-cu12**: latest compatible

### Sparse Convolution
- **spconv-cu124**: 2.3.8
- **cumm-cu124**: 0.8.2
- **JIT Compilation**: DISABLED (via `SPCONV_DISABLE_JIT=1` and `CUMM_DISABLE_JIT=1`)

### PyTorch Geometric
- **torch_scatter**: latest for torch 2.5.0+cu124
- **torch_geometric**: latest for torch 2.5.0+cu124
- **Wheel Index**: https://data.pyg.org/whl/torch-2.5.0+cu124.html

### OpenMMLab
- **mmcv**: 2.2.0
- **Wheel Index**: https://download.openmmlab.com/mmcv/dist/cu124/torch2.5/index.html

### CUDA Architecture List
- Build targets: `7.5;8.0;8.6;8.9;9.0`
- Supports: Turing, Ampere, Ada Lovelace, Hopper architectures

## Why JIT is Disabled

The environment variables `SPCONV_DISABLE_JIT=1` and `CUMM_DISABLE_JIT=1` disable just-in-time compilation to:
1. Avoid NVRTC header file path issues during runtime
2. Use prebuilt kernels included in the wheels
3. Improve startup time and reliability
4. Prevent compilation failures in environments without full CUDA development tools

## Smoke Tests

The Dockerfile includes smoke tests that verify:
1. All CUDA extensions can be imported
2. cumm header files exist
3. spconv can perform a forward pass without triggering JIT compilation

## Deprecated Files

- `environment.yml.deprecated-cuda11.3-py38`: Old conda environment pinned to Python 3.8 + CUDA 11.3 era
  - **DO NOT USE** - incompatible with current CUDA 12.4 runtime

## References

- spconv PyPI: https://pypi.org/project/spconv-cu124/
- cumm PyPI: https://pypi.org/project/cumm-cu124/
- PyTorch CUDA wheels: https://pytorch.org/get-started/locally/
- PyG wheels: https://pytorch-geometric.readthedocs.io/en/latest/install/installation.html

