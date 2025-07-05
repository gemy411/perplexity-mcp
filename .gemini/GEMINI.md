# Project Structure

This document outlines the structure of the Perplexity MCP server project.

## Root Directory

- **`docker-compose.yml`**: Docker Compose configuration for containerized deployment
- **`Dockerfile`**: Docker image configuration
- **`package.json`**: Node.js dependencies and scripts
- **`Readme.md`**: Project documentation
- **`tsconfig.json`**: TypeScript compiler configuration
- **`yarn.lock`**: Yarn lockfile for dependency management

## `src` Directory

The `src` directory contains the source code for the application, organized using Clean Architecture principles.

### Core Directories

- **`adapters/`**: Contains adapters implementing ports and interfacing with external services
  - **`gateway/`**: Gateway implementations for external service communication
    - `SearchOnlinePortImpl.ts`: Implementation of search online port
  - **`models/`**: Data transfer objects and models for external services
    - `search-remote-params.ts`: Parameters for remote search operations
    - `search-remote-result.ts`: Result models from remote search operations
  - **`ports/`**: Port definitions for external service interfaces
    - `search-online-remote.ts`: Remote search service port definition
  - **`view/`**: View adapters
  - **`viewmodel/`**: View model adapters

- **`config/`**: Application configuration management
  - `config.ts`: Main configuration file for API keys and settings

- **`entity/`**: Core business entities and domain models
  - **`model/`**: Domain model definitions

- **`framework/`**: Framework-level components and infrastructure
  - **`di/`**: Dependency injection container
    - `factory.ts`: Factory for creating and managing dependencies
  - **`network/`**: Network layer components
    - **`middleware/`**: Express middleware components
      - `auth.ts`: Authentication middleware
    - **`remote/`**: Remote service implementations
      - **`google/`**: Google service integration
        - `google-remote.ts`: Google API remote service
      - **`open_router/`**: OpenRouter service integration
        - **`models/`**: OpenRouter-specific models
          - `open-router-models.ts`: OpenRouter API models
        - `open-router-remote.ts`: OpenRouter API remote service
      - **`pplx/`**: Perplexity service integration
        - **`models/`**: Perplexity-specific models
          - `pplx-models.ts`: Perplexity API models
        - `pplx-remote.ts`: Perplexity API remote service
    - **`routes/`**: Express route handlers
      - `health.ts`: Health check endpoint
      - `mcp.ts`: MCP (Model Context Protocol) endpoints
      - `search.ts`: Search API endpoints
  - **`tools/`**: Utility tools and helpers
    - `error-fixing.ts`: Error handling and fixing utilities
    - `mapper.ts`: Data mapping utilities
    - `Search.ts`: Search tool implementation
  - **`ui/`**: User interface components
    - **`model/`**: UI model definitions
  - **`view/`**: View layer components
  - `stored-pref-fetcher.ts`: Stored preferences fetcher utility

- **`routes/`**: Additional route definitions (legacy or alternative routing)

- **`usecase/`**: Business logic and use cases
  - **`search/`**: Search-related use cases
    - **`models/`**: Use case specific models
      - `search-online-params.ts`: Search parameters for use cases
      - `search-online-results.ts`: Search results for use cases
    - **`ports/`**: Use case port definitions
      - `search-online-port.ts`: Search online port interface
    - `search-online-usecase.ts`: Main search online use case implementation

- **`index.ts`**: The main entry point of the application

## Architecture

This project follows Clean Architecture principles:

- **Entity Layer**: Core business rules and entities
- **Use Case Layer**: Application-specific business rules
- **Interface Adapters**: Controllers, gateways, and presenters
- **Framework Layer**: External frameworks, tools, and drivers

The dependency flow follows the Clean Architecture rule: dependencies point inward, with outer layers depending on inner layers, never the reverse.