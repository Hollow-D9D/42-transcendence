rm -rf /opt/homebrew/var/postgres
/opt/homebrew/opt/postgresql@14/bin/initdb --locale=C -E UTF-8 -D /opt/homebrew/var/postgres
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgres