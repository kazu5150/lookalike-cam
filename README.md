# LookaLikeCam (そっくりさん診断カメラ)

あなたの顔をAIが分析し、「どの有名人/スポーツ選手/偉人」に最も似ているかを診断するWebアプリケーションです。
Gemini 2.0 (または 1.5 Flash) のマルチモーダル機能を利用して、視覚情報だけでなく、ウィットに富んだコメントも生成します。

## 機能

- 📸 **写真アップロード**: ドラッグ&ドロップまたはファイル選択で写真をアップロード。
- 🤖 **AI診断**: Google Gemini AIが顔の特徴を分析し、最も似ている人物を特定。
- 📝 **理由とコメント**: なぜ似ているかの理由と、スタジアムアナウンサー風のユーモアのあるコメントを表示。
- 🖼️ **比較画像**: Wikipedia APIを使用して、似ている人物の画像を取得して表示。

## 必要要件

- Node.js (v18以上推奨)
- Google Gemini API キー

## セットアップ手順

### 1. リポジトリのクローン

このリポジトリをローカルにクローンし、ディレクトリに移動します。

```bash
git clone https://github.com/kazu5150/lookalike-cam.git
cd lookalike-cam
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

Gemini APIを使用するために、APIキーの設定が必要です。

1.  [Google AI Studio](https://aistudio.google.com/app/apikey) からAPIキーを取得してください。
2.  プロジェクトのルートディレクトリに `.env.local` ファイルを作成します（`.env.example` をコピーしてリネームすると簡単です）。

```bash
cp .env.example .env.local
```

3.  `.env.local` ファイルを開き、取得したAPIキーを設定します。

```env
GEMINI_API_KEY=あなたのAPIキーをここに貼り付け
```

> **注意**: `.env.local` ファイルには秘密鍵が含まれるため、GitHub等にはアップロードしないでください（`.gitignore` で除外されています）。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリが使用できます。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **AI Model**: Google Gemini 2.0 Flash / 1.5 Flash (@google/generative-ai)
- **Styling**: Tailwind CSS
- **API**: Wikipedia API (画像取得用)

## ライセンス

MIT License
