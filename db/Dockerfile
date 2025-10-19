FROM timescale/timescaledb:latest-pg16

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      postgresql-16-postgis-3 postgis \
      postgresql-16-pgrouting && \
    rm -rf /var/lib/apt/lists/*


