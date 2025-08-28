# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cipher is a memory-powered AI agent framework with MCP (Model Context Protocol) integration. This is a Windows-compatible fork of [campfirein/cipher](https://github.com/campfirein/cipher) where the command has been renamed from `cipher` to `cipher-win` to avoid conflicts with Windows' built-in cipher.exe.

**Repository**: [https://github.com/Naosan/cipher-windows](https://github.com/Naosan/cipher-windows)  
**Purpose**: Provide Windows compatibility for the original Cipher project while maintaining full functionality.

## Key Features
- 🔌 MCP integration with IDEs (Cursor, Windsurf, Claude Desktop/Code, VS Code)
- 🧠 Auto-generated AI coding memories that scale with codebases
- 🔄 Seamless switching between IDEs without losing context
- 🤝 Real-time memory sharing across development teams

## Commands

### Build & Development
```bash
pnpm run build          # Full build including UI
pnpm run build:no-ui    # Build without UI (faster)
pnpm run dev           # Development mode (TypeScript watch)
pnpm run typecheck     # Type checking
```

### Testing & Quality
```bash
pnpm run test:unit      # Run unit tests
pnpm run lint          # Run ESLint
pnpm run lint:fix      # Fix linting issues
pnpm run format        # Format with Prettier
pnpm run precommit     # Run all checks (lint, typecheck, format, test, build)
```

### Running the Application
```bash
cipher-win              # Interactive CLI mode
cipher-win --mode api   # API server mode
cipher-win --mode mcp   # MCP server mode
cipher-win --mode ui    # Web UI mode
```

## High-Level Architecture

The project follows a layered architecture:

1. **Application Layer** (`/src/app/`)
   - CLI interface with commands and parser
   - REST API server with Express
   - MCP server for IDE integrations
   - Next.js web UI
   - WebSocket support for real-time features

2. **Core Layer** (`/src/core/`)
   - **Brain**: LLM providers (OpenAI, Anthropic, etc.) and embedding services
   - **Memory**: Dual-layer memory system with knowledge and reflection storage
   - **Tools**: Built-in tools for memory operations, workspace, and knowledge graphs
   - **Storage**: Pluggable backends (SQLite, PostgreSQL, Redis)
   - **Vector Storage**: Support for Qdrant, Milvus, Chroma, and in-memory stores

3. **Configuration** (`/memAgent/`)
   - Agent configurations and system prompts
   - YAML-based configuration system

## Code Style & Conventions

- **TypeScript**: Strict mode, explicit return types, `import type` for type-only imports
- **File naming**: kebab-case for files, PascalCase for classes/interfaces
- **Testing**: Co-located `__test__` directories, `.test.ts` for unit tests
- **Formatting**: Tabs, single quotes, semicolons (enforced by Prettier)
- **Imports**: External → Internal → Types

## Important Development Notes

1. **Windows Fork**: This fork only changes the command name. All source code is identical to upstream.
2. **Environment Variables**: 
   - Create `.env` file in current directory OR
   - Create `.cipher-win.env` file in home directory OR
   - Set environment variables directly
   - Required: One of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, or `OLLAMA_BASE_URL`
3. **MCP Mode**: When running in terminal, export all env vars as Cipher won't read `.env`
4. **Testing**: Always run `pnpm run test:unit` before committing
5. **Pre-commit**: Use `pnpm run precommit` to run all checks

## Common Tasks

### Adding a New LLM Provider
1. Implement provider in `/src/core/brain/llm/services/`
2. Add to factory in `/src/core/brain/llm/services/factory.ts`
3. Update configuration types
4. Add tests

### Adding a New Tool
1. Create tool definition in `/src/core/tools/definitions/`
2. Register in tool manager
3. Add schema validation
4. Write unit tests

### Working with Memory
- Knowledge memory: Stores extracted information
- Reflection memory: Stores reasoning traces
- Workspace memory: Team-shared context
- Use appropriate search tools to query memories

## Debugging Tips

- Logs: Check `CIPHER_LOG_LEVEL` env var (error, warn, info, debug, silly)
- MCP logs: `C:\Users\%USERNAME%\AppData\Local\Temp\cipher-mcp.log`
- Use `cipher-win --version` to verify installation
- For API issues, check the WebSocket connection manager