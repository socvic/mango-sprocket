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
