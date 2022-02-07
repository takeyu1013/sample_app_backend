# Setup a database

## With a single container

`docker run --rm --name postgres -e POSTGRES_USER=johndoe -e POSTGRES_PASSWORD=randompassword -dp 5432:5432 postgres`

## With Docker Compose

### Start

`docker compose up -d`

### Stop

`docker compose down -v`

# Install packages

`yarn`

# Migrate a database

`yarn migrate`

# Reset a database

`yarn reset`
