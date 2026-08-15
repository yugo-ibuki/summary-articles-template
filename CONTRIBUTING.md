# Contributing

IssueやPull Requestを歓迎します。個人用の記事データや秘密情報は含めず、共通テンプレートとして再利用できる変更だけを送ってください。

## 開発手順

```bash
npm install
npm test
npm run typecheck
cargo test --manifest-path cli/Cargo.toml
cargo fmt --manifest-path cli/Cargo.toml --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
npm run build
```

記事データの仕様を変更する場合は、Rustのモデル、`article.schema.json`、TypeScriptの型、README、サンプル記事を同じPull Requestで更新してください。

## サンプルデータ

- 実在人物の個人情報、秘密URL、有料記事の本文を含めないでください。
- 要約は著作物の長い引用ではなく、自分の言葉で作成してください。
- OGP画像URLは元サイトの利用条件を確認してください。
