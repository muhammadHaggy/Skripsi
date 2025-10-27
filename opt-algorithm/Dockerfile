FROM python:3.9

RUN ln -sf /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" > /etc/timezone

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
## Limit numerical libraries to a single thread to avoid pthread_create errors
ENV OMP_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1 \
    VECLIB_MAXIMUM_THREADS=1 \
    BLIS_NUM_THREADS=1 \
    SCIPY_NUM_THREADS=1 \
    SKLEARN_NUM_THREADS=1

# Make pip quieter and avoid thread-based progress bars during constrained builds
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_PROGRESS_BAR=off
ENV PIP_PREFER_BINARY=1

WORKDIR /app



RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . /app/

RUN python -m pip install --no-cache-dir --progress-bar off --upgrade pip setuptools wheel
RUN python -m pip install --no-cache-dir --progress-bar off -r requirements.txt
RUN python -m pip install --no-cache-dir --progress-bar off ortools

WORKDIR /app/restful_routing_project

EXPOSE 8000

RUN pip list

# Run migrations before starting the development server (disable autoreload/threading to avoid spawn permission issues)
CMD sh -c "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000 --noreload --nothreading"