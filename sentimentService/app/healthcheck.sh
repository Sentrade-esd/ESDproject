#!/bin/sh

# Wait for the other service to be healthy
while [ "$(curl -s -o /dev/null -w ''%{http_code}'' $SENTIMENT_SERVICE_URL)" != "200" ]
do
  echo "Waiting for the other sentiment simple service to be healthy..."
  sleep 30
done

# Start the application
exec python -u app.py