#!/usr/bin/env node

/**
 * LEGACY IMPLEMENTATION NOTICE
 * 
 * This file has been replaced by a refactored implementation following clean architecture principles.
 * The original implementation has been preserved in src/legacy/original-implementation.ts for reference.
 * 
 * Please use the new entry point src/main.ts instead.
 * 
 * The new implementation includes:
 * - Proper separation of concerns with domain, infrastructure, application, and presentation layers
 * - Dependency injection for better testability and maintenance
 * - Improved error handling and resource management
 * - Type safety throughout the application
 */

// Simply re-export from the new entry point for backward compatibility
export * from './main.js';
