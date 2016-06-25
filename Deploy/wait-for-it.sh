#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

until psql -h "$host" -U "mysql" -c '\l'; do
  >&2 echo "mysql is unavailable - sleeping"
  sleep 1
done

>&2 echo "mysql is up - executing command"
exec $cmd
