# Stock Intelix — Model Context Protocol (MCP) Server

[![MCP Registry](https://img.shields.io/badge/MCP-Official-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

Official Model Context Protocol (MCP) server for [Stock Intelix](https://stockintelix.com) — quantitative equity intelligence and probabilistic price range forecasting across 34 global exchanges.

Designed for seamless integration with **Claude Desktop**, **Cursor**, **Glama**, and any AI agent supporting the [Model Context Protocol](https://modelcontextprotocol.io).

---

## Capabilities & Tools

This MCP server equips AI assistants with two specialized financial tools:

### 1. `get_forecast`
Retrieve quantitative probabilistic price forecasts and risk horizons for any covered equity ticker.
- **Parameters:**
  - `symbol` *(string, required)*: Equity ticker (e.g., `AAPL`, `NVDA`, `RELIANCE.BSE`, `SAP.XETRA`).
  - `horizon` *(integer, optional)*: Forecast horizon in trading days from 5 to 120 (default: 20).
- **Output:** Current price, directional probability (bullish/bearish odds), probabilistic percentiles (p10, p25, median p50, p75, p90), calibration metrics, and catalyst risk score.

### 2. `search_securities`
Search the Stock Intelix global database across 34 exchanges to find the exact symbol for any company.
- **Parameters:**
  - `query` *(string, required)*: Company name or ticker fragment (min 2 characters, e.g. `Microsoft` or `MSFT`).
  - `exchange` *(string, optional)*: Filter by market code (e.g. `NASDAQ`, `NYSE`, `BSE`, `LSE`, `DFM`).
- **Output:** List of matching equities, exchange codes, and operational status.

---

## Authentication & API Keys

All calls to the Stock Intelix API require an API key:
1. Sign up or log in at [stockintelix.com](https://stockintelix.com).
2. Navigate to **Console / Developers** (`https://stockintelix.com/app/developers`).
3. Generate an API Key (starts with `sik_...`).

Set the API key as an environment variable:
```bash
export STOCK_INTELIX_API_KEY="sik_your_api_key_here"
```

---

## Quickstart

### Option A: Using with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stock-intelix": {
      "command": "npx",
      "args": ["-y", "stock-intelix-mcp"],
      "env": {
        "STOCK_INTELIX_API_KEY": "sik_your_api_key_here"
      }
    }
  }
}
```

### Option B: Using with Cursor

1. Open Cursor **Settings** → **Features** → **MCP**.
2. Click **+ Add New MCP Server**.
3. Select **Command / Stdio**:
   - **Name:** `stock-intelix`
   - **Command:** `npx -y stock-intelix-mcp`
   - **Environment Variable:** `STOCK_INTELIX_API_KEY=sik_your_api_key_here`

### Option C: Using Docker / Glama

Build and run using the included Dockerfile:

```bash
# Build container
docker build -t stock-intelix-mcp .

# Run with your API key
docker run -i --rm -e STOCK_INTELIX_API_KEY="sik_your_api_key_here" stock-intelix-mcp
```

---

## Development & Local Testing

```bash
# Clone the repository
git clone https://github.com/stockintelix/stock-intelix-mcp.git
cd stock-intelix-mcp

# Install dependencies
npm install

# Test run locally
STOCK_INTELIX_API_KEY="sik_test" node index.js
```

---

## Disclaimer

All forecasts and quantitative metrics provided by Stock Intelix are informational models and data analytics only. They do not constitute financial advice, buy/sell recommendations, or endorsements.

---

## License

[MIT](LICENSE) © 2026 Stock Intelix
