FROM python:3.10-slim
WORKDIR /app

# Install runtime deps (safe apt flow to avoid Post-Invoke error)
RUN set -eux; \
    rm -f /etc/apt/apt.conf.d/docker-clean || true; \
    mkdir -p /var/cache/apt/archives/partial; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

RUN python -m pip install --no-cache-dir --progress-bar off --upgrade pip==24.3.1

COPY requirements.txt ./
ENV PIP_NO_CACHE_DIR=1 \
    PIP_PROGRESS_BAR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=1
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]


