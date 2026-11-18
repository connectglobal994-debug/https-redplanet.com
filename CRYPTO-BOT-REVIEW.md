# Red Planet Crypto Bot — Review and Integration Plan

## Current decision
Do not connect an unreviewed trading bot to a live exchange or embed exchange credentials in the public website. First inspect the bot, correct defects, test it offline, then run paper trading. Live trading is a separate, explicitly approved stage.

## What to provide for the review
Upload the bot source as a ZIP or its complete project folder, including:
- Main source files and supporting modules.
- Dependency manifest (for example, requirements.txt, pyproject.toml, package.json or equivalent).
- A sample configuration with all secrets removed.
- Strategy description: markets/pairs, timeframes, entry/exit rules and intended order types.
- Recent logs and error messages, with account identifiers and secrets removed.
- Backtest data/results and the exchange/API integration code, if present.

Never upload API secret keys, seed phrases, private keys, passwords, recovery codes or unredacted account exports. If any secret was previously committed to a repository, revoke and rotate it.

## Review sequence
1. Map the project structure and identify the actual entry point.
2. Inspect dependencies, configuration handling, network calls and exchange adapter.
3. Check strategy logic, order sizing, precision/minimum-order handling, fees, slippage and time synchronization.
4. Check risk controls: maximum position size, exposure limits, daily loss limit, stop conditions, duplicate-order protection and emergency shutdown.
5. Add or repair unit tests and deterministic simulation tests.
6. Run backtests with realistic fees and slippage; avoid treating past performance as a guarantee.
7. Run paper trading with live market data but no real orders.
8. Review logs, monitoring, restart behaviour and recovery after network/API failures.
9. Only then design a restricted live connection with user-approved limits.

## Red Planet integration architecture
- Run the bot as a separate private service, not inside GitHub Pages or browser JavaScript.
- Keep exchange credentials in server-side secret storage, never in HTML, JavaScript, Git history or browser storage.
- Give API keys the minimum permissions required; disable withdrawals and transfers.
- Expose a small authenticated backend API for read-only status, positions, recent signals, health and approved controls.
- Require explicit confirmation for live mode and high-impact actions.
- Record every signal, order request, response, error and operator action in an audit log.
- Provide a kill switch and automatic stop on stale data, repeated errors or risk-limit breaches.

## Website dashboard scope
The Red Planet Crypto channel can later show bot health, paper/live mode, supported markets, recent signals, open positions, performance metrics, risk status and an event log. It must clearly distinguish simulated results from live account results.

## What is not yet known
The bot language, exchange, supported markets, strategy, current test coverage and deployment environment have not yet been inspected. No exchange integration or claim of bot correctness should be made until the actual source is reviewed.
