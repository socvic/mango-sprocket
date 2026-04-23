# Daily Check-In Streaks (Standalone Project)

> An on-chain daily habit tracker built on Stacks with Clarity smart contracts.

This is a standalone Stacks project outside the `stacks/` docs folder.

## Project layout

- `./.tools/clarinet` - local Clarinet binary (v3.16.0)
- `./clarity` - smart contracts + tests
- `./frontend` - Vite + React + TypeScript app

## What is implemented

- Clarity contract `daily-streaks` with:
  - `check-in`
  - `get-profile`
  - `can-check-in`
  - `next-checkin-height`
  - `get-global-stats`
- Contract tests for:
  - first check-in
  - too-soon rejection
  - streak continuation
  - streak reset after grace window
  - best-streak persistence
  - global counters
- Frontend with:
  - wallet connect/disconnect
  - check-in transaction submission
  - read-only state refresh from Stacks API

## Run contract checks/tests

```bash
cd clarity
npm install
../.tools/clarinet check
npm test
```

## Run frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Build frontend

```bash
cd frontend
npm run build
```

## Frontend environment

See `frontend/.env.example` for required variables.

- `VITE_CONTRACT_ADDRESS`
- `VITE_CONTRACT_NAME`
- `VITE_STACKS_API_BASE`
- `VITE_STACKS_NETWORK`

## Notes

- This app does not require STX transfer payments beyond normal gas fees.
- The contract enforces check-in windows and streak logic.
- Default frontend contract values are placeholders and must be updated to your deployed contract before use.
# Non-breaking comment 1
# Non-breaking comment 2
# Non-breaking comment 3
# Non-breaking comment 4
# Non-breaking comment 5
# Non-breaking comment 6
# Non-breaking comment 7
# Non-breaking comment 8
# Non-breaking comment 9
# Non-breaking comment 10
# Non-breaking comment 11
# Non-breaking comment 12
# Non-breaking comment 13
# Non-breaking comment 14
# Non-breaking comment 15
# Non-breaking comment 16
# Non-breaking comment 17
# Non-breaking comment 18
# Non-breaking comment 19
# Non-breaking comment 20
# Non-breaking comment 21
# Non-breaking comment 22
# Non-breaking comment 23
# Non-breaking comment 24
# Non-breaking comment 25
# Non-breaking comment 26
# Non-breaking comment 27
# Non-breaking comment 28
# Non-breaking comment 29
# Non-breaking comment 30
# Non-breaking comment 31
# Non-breaking comment 32
# Non-breaking comment 33
# Non-breaking comment 34
# Non-breaking comment 35
# Non-breaking comment 36
# Non-breaking comment 37
# Non-breaking comment 38
# Non-breaking comment 39
# Non-breaking comment 40
# Non-breaking comment 41
# Non-breaking comment 42
# Non-breaking comment 43
# Non-breaking comment 44
# Non-breaking comment 45
# Non-breaking comment 46
# Non-breaking comment 47
# Non-breaking comment 48
# Non-breaking comment 49
# Non-breaking comment 50
# Non-breaking comment 51
# Non-breaking comment 52
# Non-breaking comment 53
# Non-breaking comment 54
# Non-breaking comment 55
# Non-breaking comment 56
# Non-breaking comment 57
# Non-breaking comment 58
# Non-breaking comment 59
# Non-breaking comment 60
# Non-breaking comment 61
# Non-breaking comment 62
# Non-breaking comment 63
# Non-breaking comment 64
# Non-breaking comment 65
# Non-breaking comment 66
# Non-breaking comment 67
# Non-breaking comment 68
# Non-breaking comment 69
# Non-breaking comment 70
