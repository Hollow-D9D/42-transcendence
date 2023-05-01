reset postgres with

```sh
rm -rf /opt/homebrew/var/postgres
/opt/homebrew/opt/postgresql@14/bin/initdb --locale=C -E UTF-8 -D /opt/homebrew/var/postgres
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgres
```

`/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgres` to run a local instance of postgres

`/opt/homebrew/opt/postgresql@14/bin/createuser --superuser --pwprompt --interactive` to create a superuser (use `postgres`/`password` for that)

`/opt/homebrew/opt/postgresql@14/bin/createuser --interactive --pwprompt -U postgres` to create a user (use `newuser`/`password`/`n`/`n`/`y` for that)