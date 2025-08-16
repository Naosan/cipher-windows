# Cipher Windows MCP Setup Guide

## 🚀 Quick Setup for Claude Code

### 1. Prerequisites
- Windows環境
- Node.js 20以上
- cipher-winのインストール
```bash
npm install -g github:Naosan/cipher-windows
```

### 2. Claude Desktop/Code MCP Configuration

`claude_desktop_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "cipher-memory": {
      "command": "cipher-win",
      "args": [
        "--mode", "mcp",
        "--mcp-transport-type", "stdio"
      ],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here",
        "MCP_SERVER_MODE": "aggregator"
      }
    }
  }
}
```

### 3. 利用可能なツール

#### 🧠 Memory Tools
- `cipher_memory_search` - セマンティック検索でナレッジを取得
- `cipher_extract_and_operate_memory` - 知識の抽出と操作
- `cipher_store_reasoning_memory` - 推論プロセスの保存

#### 📊 Workspace Memory Tools
- `cipher_workspace_search` - チーム/プロジェクトメモリの検索
- `cipher_workspace_store` - チームコンテキストの保存

#### 🔗 Knowledge Graph Tools
- `cipher_add_node`, `cipher_update_node`, `cipher_delete_node`
- `cipher_search_graph`, `cipher_enhanced_search`
- `cipher_extract_entities`

#### 🛠️ System Tools
- `cipher_bash` - Bashコマンド実行

### 4. 動作確認

```bash
# MCPサーバー起動テスト
cipher-win --mode mcp --mcp-transport-type stdio

# バージョン確認
cipher-win --version
```

### 5. 環境変数（オプション）

```bash
# ベクトルストア設定
VECTOR_STORE_TYPE=in-memory
VECTOR_STORE_DIMENSION=1536

# メモリ設定
SEARCH_MEMORY_TYPE=knowledge
DISABLE_REFLECTION_MEMORY=false

# ワークスペースメモリ有効化
USE_WORKSPACE_MEMORY=true

# ナレッジグラフ有効化
KNOWLEDGE_GRAPH_ENABLED=true
```

### 6. トラブルシューティング

- **APIキーエラー**: `OPENAI_API_KEY`が正しく設定されているか確認
- **コマンド不明エラー**: `cipher-win --version`で正しくインストールされているか確認
- **MCPサーバー起動失敗**: ログファイル `C:\Users\%USERNAME%\AppData\Local\Temp\cipher-mcp.log` を確認

## 🎯 使用例

Claude CodeでMCPツールを使用する例：

1. **コードパターンの記憶**:
   - `cipher_extract_and_operate_memory` でコーディングパターンを保存

2. **過去の解決策を検索**:
   - `cipher_memory_search` で類似の問題解決例を検索

3. **プロジェクト進捗の追跡**:
   - `cipher_workspace_store` でタスクやバグの状況を記録

4. **知識グラフの構築**:
   - `cipher_extract_entities` でコード関連のエンティティを抽出
   - `cipher_add_edge` で関係性を定義

これで、Claude CodeとCipher Windowsの強力な組み合わせを活用できます！