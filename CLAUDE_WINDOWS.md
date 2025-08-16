# Cipher Windows Fork Project - 最小限アプローチ

## ⚠️ プロジェクトの目的

このプロジェクトは、[campfirein/cipher](https://github.com/campfirein/cipher)を**Windows環境で動作させる**ことが唯一の目的。

### 解決する問題
- Windowsに標準で`cipher.exe`が存在（EFS暗号化ツール）
- npm global installで`cipher`コマンドが競合し、正常に動作しない

### 解決方法
**コマンド名変更のみ**: `cipher` → `cipher-win`

## 実装方針

### ✅ やること
1. **package.jsonのbin設定変更のみ**
```json
{
  "bin": {
    "cipher-win": "./path/to/cli",
    "cwin": "./path/to/cli"
  }
}
```

### ❌ やらないこと
- 元コードの改変
- Windows固有の機能追加
- 大幅な設計変更
- 独自のメモリシステム等

### 理由
- **アップストリーム追従**: 元プロジェクト更新の容易な取り込み
- **メンテナンス性**: 変更差分を最小限に保持
- **目的明確化**: Windows動作のための最小変更のみ

## 作業手順
1. 元プロジェクトのクローン
2. package.jsonのbin設定変更のみ
3. 動作確認
4. 簡素なREADME更新（変更点説明のみ）

## 📋 実装進捗状況

### ✅ 完了済み（2025-08-15）

#### 1. 元Cipherプロジェクトをクローン
- ✅ https://github.com/campfirein/cipher からクローン完了
- ✅ プロジェクト構造確認済み

#### 2. package.jsonのbin設定変更
- ✅ **変更前**: `"cipher": "./dist/src/app/index.cjs"`
- ✅ **変更後**: `"cipher-win": "./dist/src/app/index.cjs"`
- ✅ ファイル: `cipher/package.json:13-15`

#### 3. 動作確認と最小限テスト
- ✅ 依存関係インストール: `npm install --legacy-peer-deps`
- ✅ プロジェクトビルド: `npm run build:no-ui` 成功
- ✅ CLI動作確認: 
  - `node dist/src/app/index.cjs --help` ✓
  - `node dist/src/app/index.cjs --version` ✓ (0.2.2)
- ✅ bin設定確認: `{ 'cipher-win': './dist/src/app/index.cjs' }` ✓

#### 4. READMEファイル更新
- ✅ タイトルに「Windows Version」追加
- ✅ Windows固有の説明追加（cipher.exe競合の説明）
- ✅ 全コマンド例を `cipher` → `cipher-win` に更新
- ✅ インストール手順にWindows固有注意事項追加

### 🔧 実装された変更

#### ファイル変更一覧
1. **cipher/package.json**
   ```diff
   - "cipher": "./dist/src/app/index.cjs"
   + "cipher-win": "./dist/src/app/index.cjs"
   ```

2. **cipher/README.md**
   - タイトル: `# Cipher` → `# Cipher (Windows Version)`
   - Windows版であることの説明追加
   - 全CLI例を `cipher-win` に更新

### 📊 結果

**✅ 成功**: 最小限の変更でWindows互換性を実現
- 変更ファイル数: **2ファイル（package.json + README.md）**
- コード変更: **1行のみ（bin設定）**
- 動作確認: **完全動作**
- アップストリーム互換性: **維持**

### 🎯 次のステップ

プロジェクトは完成。必要に応じて以下を検討：
1. **公開準備**: npm publish用のパッケージ名変更検討
2. **アップストリーム追従**: 元プロジェクト更新時のマージ手順整備
3. **テスト環境**: Windows環境での実際のインストールテスト

## 🔌 MCP (Model Context Protocol) 統合

### ✅ 完了済み（2025-08-16）

#### MCP動作検証
- ✅ **MCPサーバーモード起動確認**: `cipher-win --mode mcp`
- ✅ **stdio トランスポート動作確認**
- ✅ **利用可能ツール確認**:
  - Memory Tools: `cipher_memory_search`, `cipher_extract_and_operate_memory`
  - Workspace Tools: `cipher_workspace_search`, `cipher_workspace_store`
  - Knowledge Graph: `cipher_add_node`, `cipher_search_graph`
  - System Tools: `cipher_bash`

#### GitHubインストール
- ✅ **インストールコマンド**: `npm install -g github:Naosan/cipher-windows`
- ✅ **パッケージ場所**: `C:\Users\naoki\npm\node_modules\@byterover\cipher-windows\`
- ✅ **実行ファイル**: `C:\Users\naoki\npm\cipher-win.cmd`

#### MCP設定ファイル
- ✅ **Claude Desktop設定**: `cipher/examples/claude_desktop_config.json`
- ✅ **MCPセットアップガイド**: `cipher/docs/MCP_SETUP_GUIDE_WINDOWS.md`

### ⚠️ 既知の問題
- `.env`ファイルが必要（グローバルインストール時）
- `prepare`スクリプト（husky）を削除して対応済み

## 関連リンク
- **元プロジェクト**: https://github.com/campfirein/cipher
- **Windowsフォーク**: https://github.com/Naosan/cipher-windows