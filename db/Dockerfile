FROM postgis/postgis:16-3.4

RUN apt-get update && \
    apt-get install -y --no-install-recommends gnupg ca-certificates curl lsb-release && \
    echo "deb [signed-by=/usr/share/keyrings/timescale.gpg] https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/timescale_timescaledb.list && \
    curl -fsSL https://packagecloud.io/timescale/timescaledb/gpgkey | gpg --dearmor -o /usr/share/keyrings/timescale.gpg && \
    apt-get update && \
    apt-get install -y --no-install-recommends timescaledb-2-postgresql-16 postgresql-16-pgrouting && \
    rm -rf /var/lib/apt/lists/*


