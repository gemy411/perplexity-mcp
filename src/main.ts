#!/usr/bin/env node

import { setupDependencies } from './di/container.js';

/**
 * Main application entry point
 */
async function main() {
  try {
    console.log("Starting Perplexity MCP server...");
    
    // Set up all dependencies
    const { serverController, db } = setupDependencies();
    
    // Handle process termination
    process.on("SIGINT", async () => {
      console.log("Shutting down...");
      db.close();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      console.log("Shutting down...");
      db.close();
      process.exit(0);
    });
    
    // Start the server
    await serverController.run();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Start the application
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
