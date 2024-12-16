CREATE TABLE events_sonic PARTITION OF "PartitionedPoolEvent" FOR VALUES IN ('SONIC');
