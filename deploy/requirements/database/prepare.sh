#!/usr/bin/env sh

docker-entrypoint.sh $@

# https://archive.is/GraWK#selection-3905.200-3905.247
until pg_isready; do sleep 1; done

present=$(psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';")

if [ $present -eq 0 ]; then
    # https://archive.is/MkS0m#selection-199.0-202.0
    pg_restore -U $POSTGRES_USER -d $POSTGRES_DB /var/local/dump.sql
fi

