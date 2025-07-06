#!/bin/bash

cd sports-scheduler-be/

timeout 3h docker run --rm \
  --env-file .env \
  -v /root/sports-scheduler-be/logs:/root/sports-scheduler-be/dist/logs \
  -v /root/sports-scheduler-be/data/flags.json:/root/sports-scheduler-be/dist/data/flags.json \
  sports-scheduler
