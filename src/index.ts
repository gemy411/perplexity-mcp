import express from 'express';
import { requireApiKey } from './framework/network/middleware/auth.js';
import searchRoutes from './framework/network/routes/search.js';
import mcpRoutes from './framework/network/routes/mcp.js';
import healthRoutes from './framework/network/routes/health.js';

const app = express();

app.use(requireApiKey);
app.use(express.json());

app.use(searchRoutes);
app.use(mcpRoutes);
app.use(healthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
