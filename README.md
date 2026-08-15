# Yoyaku

URL、要約、ジャンル、技術、日付、読了時間をGitで管理し、検索できる記事アーカイブです。リポジトリをフォークして、`content/articles`だけを自分の記事へ置き換えて使えます。

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-4-E36002)
![Rust](https://img.shields.io/badge/Rust-CLI-000000?logo=rust)

## 構成

- Hono/TypeScript: `/api/health`と`/api/articles`を提供するCloudflare Worker
- Vite/TypeScript/CSS: 3列カード、固定サイドバー、複合検索、要約モーダル
- Rust CLI: 記事JSONの検証、OGP取得、配信用索引の生成
- GitHub Actions: CIと、明示的に有効化したフォークだけのCloudflareデプロイ

HonoはTypeScript/JavaScriptのフレームワークです。Cloudflare Workersは[workers-rsを使ったRust Worker](https://developers.cloudflare.com/workers/languages/rust/)もサポートしますが、このテンプレートでは配信を[Hono](https://hono.dev/docs/getting-started/cloudflare-workers)、ローカルの記事処理をRustへ分けています。静的ファイルはCloudflareが新規サイトに推奨する[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)で配信します。

## 必要な環境

- Node.js 22.12以降（CIは24）
- npm
- Rust 1.87以降

## ローカルで起動

```bash
npm install
npm run validate:data
npm run dev
```

Viteが表示したローカルURLを開きます。`npm run dev`は起動前にRust CLIで`public/data/articles.json`を再生成します。

## 記事を追加

1. `content/articles`のサンプルをコピーし、重複しない`id`と`url`を設定します。
2. ローカルで作成・確認した要約を`summary`の配列へ入れます。
3. ジャンル、技術、読了時間、作成日、更新日を設定します。
4. 必要ならURLからOGPを取得します。
5. 検証と索引生成を実行します。

```bash
cargo run --manifest-path cli/Cargo.toml -- enrich content/articles/my-article.json
npm run validate:data
npm run generate:data
```

`enrich`は対象URLへアクセスし、`og:title`、`og:description`、`og:image`を保存します。10秒のタイムアウト、5回までのリダイレクト、2MBのHTML上限があります。LLMは使いません。外部から渡された未確認URLでは実行しないでください。

記事スキーマは[article.schema.json](./article.schema.json)にあります。Rust CLIは次も検証します。

- 必須文字列、技術、要約が空でない
- URLがHTTPまたはHTTPS
- 日付が`YYYY-MM-DD`
- `updated_at`が`created_at`以降
- `reading_minutes`が1以上
- IDとURLがコレクション内で重複しない

## 検索条件

キーワード、ジャンル、使用技術、掲載元、作成日の範囲、読了時間をANDで組み合わせます。キーワードはタイトル、要約、掲載元、ジャンル、技術を対象にし、更新日、作成日、タイトルで並び替えられます。

カード全体でモーダルを開きます。元記事へ移動するのはモーダル内の「元記事を開く」リンクだけです。

## サイト名とリンクを変える

[src/site-config.ts](./src/site-config.ts)の3項目を変更します。

```ts
export const siteConfig = {
  title: 'Yoyaku',
  headerTitle: '要約記事録',
  repositoryUrl: 'https://github.com/your-name/your-repository',
} as const
```

## テストとビルド

```bash
npm test
npm run types:check
npm run typecheck
cargo test --manifest-path cli/Cargo.toml
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
npm run build
npm run deploy:dry-run
```

## Cloudflareへデプロイ

手元から確認してデプロイする場合:

```bash
npm run deploy:dry-run
npm run deploy
```

GitHub Actionsから自動デプロイする場合は、フォーク先のSettingsで次を設定します。

- Actions secret `CLOUDFLARE_API_TOKEN`
- Actions secret `CLOUDFLARE_ACCOUNT_ID`
- Actions variable `CLOUDFLARE_DEPLOY_ENABLED`を`true`

変数を設定しないフォークではDeploy jobがスキップされ、CIだけが動きます。トークン、アカウントID、カスタムドメイン、非公開記事をリポジトリへコミットしないでください。

## Commonと個人フォークの境界

このリポジトリへ含めるもの:

- アプリ本体とRust CLI
- 汎用スキーマ、テスト、CI
- 個人情報を含まないサンプル記事

個人用フォークだけへ置くもの:

- 自分の記事JSON
- 自分のサイト名とリポジトリURL
- Cloudflare Secretsとドメイン設定

上流の更新を取り込むときは、共通コードと自分の記事データを別コミットに分けておくと衝突を整理しやすくなります。

## License

MIT
