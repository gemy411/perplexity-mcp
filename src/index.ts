import { getSearchUseCase } from "./framework/di/factory.js";
import { addErrorFixingTool } from "./framework/tools/error-fixing.js";
import { addSearchTool } from "./framework/tools/Search.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import 'dotenv/config'

const app = express();
app.use(express.json());
const server = new McpServer({
      name: "Perplexity MCP Server",
      version: "0.0.1",
    });
const useCase = getSearchUseCase()
addSearchTool(server, useCase);
addErrorFixingTool(server, useCase);
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