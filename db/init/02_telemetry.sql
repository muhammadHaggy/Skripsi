CREATE SCHEMA IF NOT EXISTS telemetry;

CREATE TABLE IF NOT EXISTS telemetry.readings (
  device_id text NOT NULL,
  ts timestamptz NOT NULL,
  metric text NOT NULL,
  value double precision,
  tags jsonb,
  PRIMARY KEY (device_id, ts, metric)
);
SELECT create_hypertable('telemetry.readings', by_range('ts'), if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS telemetry.gps_positions (
  device_id text NOT NULL,
  ts timestamptz NOT NULL,
  position geography(Point,4326) NOT NULL,
  speed_mps double precision,
  heading_deg double precision,
  extra jsonb,
  PRIMARY KEY (device_id, ts)
);
SELECT create_hypertable('telemetry.gps_positions', by_range('ts'), if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS gps_positions_pos_gix ON telemetry.gps_positions USING GIST (position);


