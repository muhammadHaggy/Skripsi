from django.db import migrations


FORWARD_SQL = """
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS total_distance_m BIGINT;
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS total_travel_time_min NUMERIC(12, 2);
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS total_travel_time_with_waiting_min NUMERIC(12, 2);
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS total_co2_emission_g NUMERIC(14, 2);
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS routing_priority VARCHAR(16);
ALTER TABLE shipment ADD COLUMN IF NOT EXISTS routing_run_at TIMESTAMPTZ;
"""

REVERSE_SQL = """
ALTER TABLE shipment DROP COLUMN IF EXISTS total_distance_m;
ALTER TABLE shipment DROP COLUMN IF EXISTS total_travel_time_min;
ALTER TABLE shipment DROP COLUMN IF EXISTS total_travel_time_with_waiting_min;
ALTER TABLE shipment DROP COLUMN IF EXISTS total_co2_emission_g;
ALTER TABLE shipment DROP COLUMN IF EXISTS routing_priority;
ALTER TABLE shipment DROP COLUMN IF EXISTS routing_run_at;
"""


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunSQL(FORWARD_SQL, REVERSE_SQL),
    ]

