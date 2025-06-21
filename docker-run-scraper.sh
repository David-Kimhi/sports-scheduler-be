#!/bin/bash

cd sports-scheduler-be/

timeout 3h docker run --rm \
  --env-file .env \
  -v sports-scheduler-be/logs:sports-scheduler-be/dist/logs \
  -v sports-scheduler-be/data/flags.json:sports-scheduler-be/dist/scraper/src/sports/football/flags/flags.json \
  sport-scheduler
