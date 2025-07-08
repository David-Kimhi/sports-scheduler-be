#!/bin/bash

cd sports-scheduler-be/

timeout 3h docker run --rm \
  --env-file .env \
  -v /root/sports-scheduler-be/logs:/app/dist/logs \
  -v /root/sports-scheduler-be/data/flags.json:/app/dist/data/flags.json \
  scheduler-scraper
