#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.STOCK_INTELIX_BASE_URL || "https://stockintelix.com";
const API_KEY = process.env.STOCK_INTELIX_API_KEY || "";

const server = new Server(
  {
    name: "stock-intelix",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 1. List Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_forecast",
        description:
          "Retrieve probabilistic stock price range forecasts, directional probability, uncertainty intervals, and catalyst risk for an equity ticker across 34 global exchanges.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "Equity symbol / ticker (e.g., AAPL, NVDA, RELIANCE.BSE, SAP.XETRA).",
            },
            horizon: {
              type: "integer",
              description: "Forecast horizon in trading days (5 to 120, default is 20).",
              minimum: 5,
              maximum: 120,
              default: 20,
            },
          },
          required: ["symbol"],
        },
      },
      {
        name: "search_securities",
        description:
          "Search for equities by company name or ticker across 34 supported global exchanges.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Company name or ticker fragment (at least 2 characters, e.g. 'Apple' or 'AAPL').",
            },
            exchange: {
              type: "string",
              description: "Optional exchange code filter (e.g., NASDAQ, NYSE, LSE, BSE, XETRA).",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// 2. Call Tool Implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!API_KEY) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "STOCK_INTELIX_API_KEY environment variable is missing. Obtain your free or pro API key at https://stockintelix.com/app/developers",
        },
      ],
    };
  }

  try {
    if (name === "get_forecast") {
      const symbol = String(args?.symbol || "").trim();
      const horizon = args?.horizon ? Number(args.horizon) : 20;

      if (!symbol) {
        return {
          isError: true,
          content: [{ type: "text", text: "Parameter 'symbol' is required." }],
        };
      }

      const url = new URL(`${BASE_URL}/api/public/v1/forecast`);
      url.searchParams.set("symbol", symbol);
      url.searchParams.set("horizon", String(horizon));

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "stock-intelix-mcp/1.0.0",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Stock Intelix API error (${res.status}): ${data?.error || JSON.stringify(data)}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === "search_securities") {
      const query = String(args?.query || "").trim();
      const exchange = args?.exchange ? String(args.exchange).trim() : undefined;

      if (!query || query.length < 2) {
        return {
          isError: true,
          content: [{ type: "text", text: "Parameter 'query' must be at least 2 characters." }],
        };
      }

      const url = new URL(`${BASE_URL}/api/public/v1/securities`);
      url.searchParams.set("query", query);
      if (exchange) url.searchParams.set("exchange", exchange);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "stock-intelix-mcp/1.0.0",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Stock Intelix API error (${res.status}): ${data?.error || JSON.stringify(data)}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Unexpected client error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
    };
  }
});

// 3. Connect via Standard I/O (Stdio) Transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stock Intelix MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error starting Stock Intelix MCP server:", error);
  process.exit(1);
});
