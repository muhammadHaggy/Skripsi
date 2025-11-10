# Ubuntu Base Image Migration

## Changes Made

### Base Image
**Changed from:** `nvidia/cuda:12.4.1-cudnn9-devel-ubuntu22.04` (doesn't exist)  
**Changed to:** `ubuntu:22.04`

## Why This Works

Since we're using **conda to manage the entire environment**, including CUDA, we don't need a NVIDIA CUDA base image. The conda environment.yml already specifies:

```yaml
dependencies:
  - cuda                    # CUDA toolkit from nvidia channel
  - conda-forge::cudnn      # cuDNN from conda-forge
  - pytorch-cuda=12.4       # PyTorch CUDA bindings
  - pytorch=2.5.0           # PyTorch compiled for CUDA 12.4
```

Conda will install CUDA 12.4 and all necessary components into the conda environment (`$CONDA_PREFIX`).

## Environment Variables

### Removed from Dockerfile ENV
These are no longer set globally since CUDA comes from conda:
```dockerfile
# Removed:
CUDA_HOME=/usr/local/cuda
PATH=${CUDA_HOME}/bin:${PATH}
LD_LIBRARY_PATH=${CUDA_HOME}/lib64:${LD_LIBRARY_PATH}
TORCH_CUDA_USE_NINJA=1
TORCH_CUDA_ARCH_LIST=...
FORCE_CUDA=1
```

### Now Set After Conda Activation

**In build scripts:**
```bash
export CUDA_HOME=$CONDA_PREFIX
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib:$LD_LIBRARY_PATH
export TORCH_CUDA_ARCH_LIST="7.5;8.0;8.6;8.9;9.0"
export FORCE_CUDA=1
export TORCH_CUDA_USE_NINJA=1
```

**In entrypoint.sh:**
```bash
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4

export CUDA_HOME=${CONDA_PREFIX}
export PATH=${CUDA_HOME}/bin:${PATH}
export LD_LIBRARY_PATH=${CUDA_HOME}/lib:${LD_LIBRARY_PATH}
```

## Benefits

1. **No dependency on NVIDIA CUDA Docker images**
   - Works with any Ubuntu base
   - No need to find specific CUDA+cuDNN combos

2. **Conda manages everything**
   - Consistent CUDA version
   - Automatic compatibility checks
   - Easy to update (just change environment.yml)

3. **Smaller base image**
   - Ubuntu 22.04 base is smaller than CUDA base
   - Conda only installs what's needed

4. **More reproducible**
   - Conda environment.yml defines everything
   - Same environment on any system

## Building

The build process remains the same:

```bash
cd /home/user02/Skripsi

# Using build script
./machine-learning/build_and_test.sh

# Or manually
docker build -f machine-learning/Dockerfile.gpu -t ml-service:conda-cuda124 .
```

## Runtime Requirements

You still need:
- NVIDIA Docker runtime (`--gpus all`)
- NVIDIA drivers >= 525.60.13 (for CUDA 12.4 support)

The CUDA toolkit comes from conda, but the **driver** must be on the host.

## Verification

After conda activates, verify CUDA is available:

```bash
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4

# Check CUDA from conda
which nvcc
# Output: /opt/conda/envs/pointcept-torch2.5.0-cu12.4/bin/nvcc

echo $CUDA_HOME
# Output: /opt/conda/envs/pointcept-torch2.5.0-cu12.4

# Check PyTorch sees CUDA
python -c "import torch; print(torch.cuda.is_available())"
# Output: True
```

## Files Changed

1. **Dockerfile.gpu**
   - Base image: `FROM ubuntu:22.04`
   - Removed global CUDA environment variables
   - Added CUDA exports in build RUN commands

2. **entrypoint.sh**
   - Added CUDA environment variable exports after conda activation
   - CUDA_HOME now points to $CONDA_PREFIX

## Summary

✅ Using plain Ubuntu 22.04 base  
✅ Conda provides CUDA 12.4 toolkit  
✅ CUDA environment variables set after conda activation  
✅ Custom extensions build with conda's CUDA  
✅ Runtime works with host NVIDIA drivers  

This is actually a **cleaner and more maintainable** approach than using NVIDIA CUDA base images!

