# MCP Setup Guide (Windows)

This guide explains how to run Cipher as an MCP server on Windows. It covers prerequisites, installation, environment variables, transports, IDE configuration, and troubleshooting.

## 1) Prerequisites
- Node.js 20+ and pnpm 9+
- Git in PATH
- PowerShell 7+ (recommended)
- Optional (native module builds): recent Visual C++ Build Tools

Verify:
```powershell
node -v
pnpm -v
```

## 2) Install Cipher (Windows fork)
You can use either a global install or a local build.

- Global install from GitHub:
```powershell
npm install -g github:Naosan/cipher-windows
cipher-win --help
```

- From source (repo cloned locally):
```powershell
pnpm install
pnpm run build           # or: pnpm run build:no-ui
npm link                 # optional global link for `cipher-win`
```

Note: On Windows the CLI binary is named `cipher-win` to avoid conflicts with the built‑in `cipher.exe`.

## 3) Environment variables
For MCP mode, set environment variables in PowerShell before starting the client. You can also create a `~/.cipher-win.env` file; the app will read it with lower priority than explicit environment variables.

- Minimal example:
```powershell
$env:OPENAI_API_KEY = "sk-..."      # or ANTHROPIC_API_KEY / OPENROUTER_API_KEY / OLLAMA_BASE_URL
$env:MCP_SERVER_MODE = "aggregator"  # default | aggregator
$env:SERENA_COMPAT_MODE = "true"     # memory-only tool surface with OpenAI-compatible schemas
```

- Optional persistence via file:
```
%USERPROFILE%\.cipher-win.env
```
Add lines like `OPENAI_API_KEY=sk-...` (one per line). Explicit `$env:VAR` in the shell always wins.

## 4) Start MCP server
- STDIO (default, most compatible):
```powershell
cipher-win --mode mcp
```

- SSE transport (over HTTP):
```powershell
cipher-win --mode mcp --mcp-transport-type sse --mcp-port 4000
```
Client URL: `http://localhost:4000/sse`

- Streamable HTTP transport:
```powershell
cipher-win --mode mcp --mcp-transport-type streamable-http --mcp-port 4000
```
Client base URL: `http://localhost:4000/http`

## 5) Configure IDE clients
- Claude Desktop (Windows): `%APPDATA%\Claude\claude_desktop_config.json`
  - STDIO example:
    ```json
    {
      "mcpServers": {
        "cipher": {
          "type": "stdio",
          "command": "cipher-win",
          "args": ["--mode", "mcp"],
          "env": {
            "OPENAI_API_KEY": "sk-...",
            "MCP_SERVER_MODE": "aggregator",
            "SERENA_COMPAT_MODE": "true"
          }
        }
      }
    }
    ```
  - SSE example:
    ```json
    {
      "mcpServers": {
        "cipher-sse": { "url": "http://localhost:4000/sse" }
      }
    }
    ```

- Cursor/Windsurf
  - Use the same STDIO or SSE configuration style depending on client support. For URLs, clients typically treat them as SSE endpoints.

## 6) Serena/Codex compatibility
If you want a memory‑only tool surface for Serena/Codex, set:
```
SERENA_COMPAT_MODE=true
```
This automatically disables `ask_cipher` and exposes only memory and reasoning tools with OpenAI‑compatible JSON Schemas.

## 7) Verifying MCP
Use the Model Context Protocol inspector to verify discovery:
```powershell
npx @modelcontextprotocol/inspector cipher-win --mode mcp
```
You should see `list_tools` succeed and the expected tool list based on your mode.

## 8) Troubleshooting
- PATH issues: ensure `cipher-win` resolves. If building locally, run from repo root or use `npm link`.
- Missing keys: MCP mode requires keys via environment variables; `.cipher-win.env` is helpful for defaults.
- better-sqlite3 build: install C++ build tools if native addon install fails.
- Firewall: allow the chosen port (e.g., 4000) for SSE/HTTP transports.
- Reverse proxy: set `Cache-Control: no-cache` and keep-alive; ensure timeouts aren’t too aggressive for streaming.

## 9) Uninstall
- If globally installed from GitHub: `npm uninstall -g @byterover/cipher` or remove the linked package.
- If linked from source: run `npm unlink` in the project root.

## 10) Related docs
- `docs/mcp-integration.md` for cross‑platform MCP details
- `docs/vector-stores.md` for memory vector stores
- `docs/configuration.md` for general configuration

