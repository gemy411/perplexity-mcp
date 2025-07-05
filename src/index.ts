import { getSearchUseCase } from "./framework/di/factory.js";
import { addErrorFixingTool } from "./framework/tools/error-fixing.js";
import { addSearchTool } from "./framework/tools/Search.js";
import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import 'dotenv/config'
import { SearchOnlineParams } from "./usecase/search/models/search-online-params.js";
import { none } from "fp-ts/lib/Option.js";

const API_KEYS: string[] = process.env.API_KEYS
  ? process.env.API_KEYS.split(',').map(k => k.trim())
  : [];

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.get('x-api-key') || (req.query.api_key as string | undefined);
  if (!key || !API_KEYS.includes(key)) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }
  next();
}

const app = express();

app.use(requireApiKey);
app.use(express.json());
const server = new McpServer({
      name: "Online search MCP Server",
      description: "Online search MCP Server is always used to find online and up to date information. It's a search tool that can be used to find information on any topic.",
      version: "1.0.0",
    });
const useCase = getSearchUseCase()
addSearchTool(server, useCase);
addErrorFixingTool(server, useCase);
app.get('/search', async (req: Request, res: Response) => {
  const query = req.query.search_query as string;
  if (!query) {
    res.status(400).json({ error: 'search_query is required' });
    return;
  }

  const depthParam = req.query.depth as string;
  const allowedDepths = ["shallow", "medium", "deep"];
  if (depthParam && !allowedDepths.includes(depthParam)) {
    res.status(400).json({ error: `Invalid depth parameter. Allowed values are: ${allowedDepths.join(", ")}` });
    return;
  }

  const depth = (depthParam || "medium") as "shallow" | "medium" | "deep";

  try {
    const searchParams = new SearchOnlineParams(query, none, depth, "normal");
    const result = await useCase.execute(searchParams);
    res.status(200).json({
      query,
      result
    });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});
let sseTransport: SSEServerTransport | undefined;
app.post('/mcp', async (req: Request, res: Response) => {

  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    // Use the underlying Node.js response object to listen for 'close'
    (res).on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
  
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});
app.get('/sse', async (req, res) => {
  // Create SSE transport for legacy clients
  sseTransport = new SSEServerTransport('/messages', res);
  
  res.on("close", () => {
    sseTransport = undefined;
  });
    await server.connect(sseTransport);
});

// Legacy message endpoint for older clients
app.post('/messages', async (req, res) => {
  if (sseTransport) {
    await sseTransport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});