import { Request, Response, Router } from 'express';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { getSearchUseCase } from '../../di/factory.js';
import { addSearchTool } from '../../tools/Search.js';
import { addErrorFixingTool } from '../../tools/error-fixing.js';

const router = Router();
const server = new McpServer({
      name: "Online search MCP Server",
      description: "Online search MCP Server is always used to find online and up to date information. It's a search tool that can be used to find information on any topic.",
      version: "1.0.0",
    });
const useCase = getSearchUseCase()
addSearchTool(server, useCase);
addErrorFixingTool(server, useCase);

let sseTransport: SSEServerTransport | undefined;

router.post('/mcp', async (req: Request, res: Response) => {

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

router.get('/mcp', async (req: Request, res: Response) => {
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

router.delete('/mcp', async (req: Request, res: Response) => {
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
router.get('/sse', async (req, res) => {
  // Create SSE transport for legacy clients
  sseTransport = new SSEServerTransport('/messages', res);
  
  res.on("close", () => {
    sseTransport = undefined;
  });
    await server.connect(sseTransport);
});

// Legacy message endpoint for older clients
router.post('/messages', async (req, res) => {
  if (sseTransport) {
    await sseTransport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

export default router;
