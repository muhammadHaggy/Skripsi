# Conda-Based ML Environment Build Guide

## Overview

This Docker image uses **Mambaforge** (conda + mamba) to create a reproducible CUDA 12.4 + PyTorch 2.5.0 environment following the exact specification from the Pointcept project.

## Stack Components

### Base Environment
- **CUDA**: 12.4.1 with cuDNN 9
- **OS**: Ubuntu 22.04
- **Conda**: Mambaforge (includes mamba for faster solving)
- **Python**: 3.10

### Environment Specification

The environment is defined in `environment.yml` and includes:

**Conda Channels:**
- pytorch
- nvidia/label/cuda-12.4.1
- nvidia
- bioconda
- conda-forge
- defaults

**Core Dependencies (from conda):**
- pytorch=2.5.0 with pytorch-cuda=12.4
- torchvision=0.20.0
- torchaudio=2.5.0
- gcc=13.2 / gxx=13.2 (for compiling extensions)
- ninja, google-sparsehash (for pointops)
- Scientific: h5py, scipy, matplotlib
- ML utilities: tensorboard, tensorboardx, wandb
- 3D: open3d, plyfile

**Pip Dependencies:**
- PyTorch Geometric ecosystem (torch-cluster, torch-scatter, torch-sparse, torch-geometric)
- spconv-cu124 (sparse convolution)
- peft (for LoRA fine-tuning)
- OCNN, CLIP, Flash Attention (from git)
- Custom extensions: pointops, pointgroup_ops (local libs)

## Build Instructions

### Method 1: Using the Build Script (Recommended)

```bash
cd /home/user02/Skripsi
./machine-learning/build_and_test.sh
```

This script will:
1. Build the Docker image
2. Run comprehensive tests
3. Verify all extensions load correctly

### Method 2: Manual Build

```bash
cd /home/user02/Skripsi
docker build -f machine-learning/Dockerfile.gpu -t ml-service:conda-cuda124 .
```

### Build Arguments

You can customize the CUDA architectures to compile for:

```bash
docker build \
  -f machine-learning/Dockerfile.gpu \
  -t ml-service:conda-cuda124 \
  --build-arg TORCH_CUDA_ARCH_LIST="7.5;8.0;8.6;8.9;9.0" \
  .
```

**Architecture List:**
- 7.5: Turing (RTX 20 series, T4)
- 8.0: Ampere (A100)
- 8.6: Ampere (RTX 30 series, A10, A40)
- 8.9: Ada Lovelace (RTX 40 series, L4, L40)
- 9.0: Hopper (H100, H200)

## Running the Container

### Using Docker Run

```bash
docker run --gpus all -p 5001:5001 ml-service:conda-cuda124
```

### Using Docker Compose

Update `docker-compose.ml.yml` to reference the new image:

```yaml
services:
  ml_service:
    image: ml-service:conda-cuda124
    # ... rest of config
```

Then:

```bash
docker-compose -f docker-compose.ml.yml up
```

## Environment Details

### Conda Environment Name

The conda environment is named: `pointcept-torch2.5.0-cu12.4`

### Activation

Inside the container, the environment is automatically activated by the entrypoint script:

```bash
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
```

### Environment Variables

The following environment variables are set:

**CUDA-related:**
- `CUDA_HOME=/usr/local/cuda`
- `TORCH_CUDA_ARCH_LIST` (configurable via build arg)
- `FORCE_CUDA=1`

**JIT Compilation (DISABLED):**
- `SPCONV_DISABLE_JIT=1`
- `CUMM_DISABLE_JIT=1`

These disable JIT compilation in spconv/cumm to:
- Avoid NVRTC header path issues
- Use prebuilt kernels (faster startup)
- Improve reliability

**Runtime:**
- `PYTHONUNBUFFERED=1`
- `CONDA_DEFAULT_ENV=pointcept-torch2.5.0-cu12.4`
- `INSTALL_POINTOPS_AT_RUNTIME=0` (set to 1 to rebuild at runtime)

## Custom CUDA Extensions

The image builds the following custom extensions:

1. **pointops** (`libs/pointops`)
   - Point cloud operations
   - Installed with: `pip install -e libs/pointops`

2. **pointgroup_ops** (`libs/pointgroup_ops`)
   - Point grouping operations
   - Installed with: `pip install -e libs/pointgroup_ops`

These are compiled during the Docker build using the conda environment's compiler toolchain (gcc 13.2).

## Verification and Testing

### Built-in Smoke Tests

The Dockerfile includes smoke tests that verify:

1. **PyTorch installation**
   - Version check
   - CUDA availability
   - CUDA version match

2. **Spconv/cumm**
   - Import successful
   - Headers present
   - Forward pass without JIT compilation

3. **PyTorch Geometric**
   - torch_scatter, torch_geometric imports

4. **Custom extensions**
   - pointops._C
   - pointgroup_ops_cuda

### Manual Testing

Run tests inside the container:

```bash
docker run --rm --gpus all ml-service:conda-cuda124 /bin/bash -c "
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
python /app/test_cuda124_stack.sh
"
```

## Troubleshooting

### Issue: Conda environment not activated

**Symptom:** Python can't find packages

**Solution:** Always source conda before activating:
```bash
source /opt/conda/etc/profile.d/conda.sh
conda activate pointcept-torch2.5.0-cu12.4
```

### Issue: CUDA out of memory during build

**Symptom:** Build fails during extension compilation

**Solution:** Reduce parallel jobs:
```bash
docker build --build-arg MAX_JOBS=4 ...
```

### Issue: Extension compilation fails

**Symptom:** pointops or pointgroup_ops build error

**Solution:** 
1. Check CUDA_HOME is set
2. Verify TORCH_CUDA_ARCH_LIST matches your GPU
3. Check gcc/g++ version (should be 13.2 from conda)

### Issue: Runtime CUDA version mismatch

**Symptom:** "CUDA runtime mismatch" error

**Solution:** Ensure host NVIDIA driver supports CUDA 12.4:
```bash
nvidia-smi  # Check driver version
# Need driver >= 525.60.13 for CUDA 12.4
```

## Updating Dependencies

### Updating Conda Packages

Edit `environment.yml`:

```yaml
dependencies:
  - pytorch=2.5.1  # Update version
  - new-package    # Add new package
```

Then rebuild:

```bash
docker build -f machine-learning/Dockerfile.gpu -t ml-service:conda-cuda124 .
```

### Updating Pip Packages

Edit the `pip:` section in `environment.yml`:

```yaml
  - pip:
    - new-pip-package==1.0.0
```

### Pinning Versions

For reproducibility, pin all versions:

```yaml
dependencies:
  - pytorch=2.5.0
  - numpy=1.26.4
```

Use `conda list --export` inside a built container to get exact versions.

## Performance Considerations

### Mamba vs Conda

This build uses **mamba** (included in Mambaforge) instead of conda because:
- 10-100x faster dependency solving
- Parallel downloads
- Better error messages

### Build Time

Approximate build times:
- Initial build: 30-60 minutes (depends on network speed)
- Cached rebuild: 5-10 minutes
- Extension only rebuild: 2-5 minutes

### Image Size

Expected image size: ~12-15 GB

To reduce size:
- Use multi-stage build (separate build/runtime)
- Clean conda cache: `mamba clean -afy`
- Remove build tools in runtime stage

## Comparison: Conda vs Pure Pip

| Aspect | Conda Build (Current) | Pure Pip Build (Previous) |
|--------|----------------------|---------------------------|
| **Reproducibility** | ✅ Excellent (environment.yml) | ⚠️ Good (requirements.txt) |
| **Dependency Solving** | ✅ Comprehensive (binary compat) | ⚠️ Basic (version only) |
| **CUDA Matching** | ✅ Automatic (pytorch-cuda) | ⚠️ Manual (wheel URLs) |
| **Compiler Toolchain** | ✅ Included (gcc 13.2) | ⚠️ System (varies) |
| **Build Speed** | ⚠️ Slower (mamba helps) | ✅ Faster (smaller downloads) |
| **Image Size** | ⚠️ Larger (~15GB) | ✅ Smaller (~10GB) |
| **Flexibility** | ⚠️ Limited to channels | ✅ Any PyPI package |

## References

- [Mambaforge](https://github.com/conda-forge/miniforge)
- [PyTorch Conda Packages](https://pytorch.org/get-started/locally/)
- [NVIDIA CUDA Conda Channel](https://anaconda.org/nvidia/cuda)
- [PyTorch Geometric Installation](https://pytorch-geometric.readthedocs.io/en/latest/install/installation.html)
- [Spconv Documentation](https://github.com/traveller59/spconv)

## License & Acknowledgments

This build configuration is based on the [Pointcept](https://github.com/Pointcept/Pointcept) project's environment specification.

