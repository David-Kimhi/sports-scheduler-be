# Sports Scheduler Backend

For now, A lightweight, Dockerized Node.js (TypeScript) scraper that fetches sports-related data (e.g., games, flags, teams) and stores it in MongoDB. Designed for automatic, recurring runs using `cron`, with persistent logging and dynamic control via flag files.

---

## Features

- Written in **TypeScript**
- Fully Dockerized
- Logs activity into timestamped log files
- Maintains persistent state using `flags.json` (for automatic daily runs via `cron`)
- Connects securely to **MongoDB Atlas**
- Easily configurable via `.env` file


