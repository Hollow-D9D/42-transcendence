FROM postgres:alpine
# https://archive.is/ZmBAq#selection-1497.0-1523.1
# https://archive.is/tr3yM#selection-1323.0-1326.0
COPY init.sql /docker-entrypoint-initdb.d/
RUN chown ${POSTGRES_USER}:${POSTGRES_USER} /docker-entrypoint-initdb.d/init.sql; \
 chmod +x /docker-entrypoint-initdb.d/init.sql

# quickly generate new dumps if necessary with https://archive.is/1eSeq#selection-1483.0-1558.0
# and then convert them to uncompressed `.sql` file to put into `docker-entrypoint-initdb.d` directory https://archive.is/Inj4N#selection-1231.0-1238.0

# ended up not using:
# https://archive.is/YNgsF#selection-2253.0-2253.58
# https://archive.is/GraWK#selection-3905.200-3905.247
# https://archive.is/MkS0m#selection-199.0-202.0

