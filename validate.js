#!/usr/bin/env node
/**
 * anime-archive レコードバリデータ
 *
 * 使用方法:
 *   node validate.js <file.json> [file2.json ...]
 *   node validate.js examples/minimal.json
 *   node validate.js examples/*.json
 *
 * 終了コード:
 *   0 ... 全ファイル有効
 *   1 ... バリデーションエラーあり
 *   2 ... ファイル読み込みエラー
 */

"use strict";

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv/dist/2020").default;
const addFormats = require("ajv-formats").default;

// ── スキーマ読み込み ─────────────────────────────────────────────────────────

const SCHEMA_PATH = path.join(__dirname, "schema", "anime-archive.schema.json");
let schema;
try {
  schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
} catch (err) {
  console.error(`[致命的エラー] スキーマを読み込めません: ${SCHEMA_PATH}`);
  console.error(err.message);
  process.exit(2);
}

// ── AJV 初期化 ───────────────────────────────────────────────────────────────

const ajv = new Ajv({
  allErrors: true,       // 全エラーを収集（最初のエラーで止まらない）
  strict: true,          // draft-2020-12 の厳密モード
  verbose: true,         // エラーに parentData を含める
  useDefaults: true,     // スキーマの default 値をレコードに自動挿入
});
addFormats(ajv);

const validate = ajv.compile(schema);

// ── エラーメッセージの日本語化 ───────────────────────────────────────────────

const KEYWORD_JA = {
  required:             (e) => `必須フィールド "${e.params.missingProperty}" がありません`,
  type:                 (e) => `型が正しくありません（期待: ${e.params.type}）`,
  enum:                 (e) => `許可された値ではありません（許可: ${e.params.allowedValues.join(" | ")}）`,
  const:                (e) => `値が正しくありません（期待: ${e.params.allowedValue}）`,
  format:               (e) => `フォーマットが無効です（期待: ${e.params.format}）`,
  pattern:              (e) => `パターンに一致しません（パターン: ${e.params.pattern}）`,
  minLength:            (e) => `文字数が短すぎます（最小: ${e.params.limit}）`,
  maxLength:            (e) => `文字数が長すぎます（最大: ${e.params.limit}）`,
  minimum:              (e) => `値が小さすぎます（最小: ${e.params.limit}）`,
  maximum:              (e) => `値が大きすぎます（最大: ${e.params.limit}）`,
  unevaluatedProperties:(e) => `未定義のフィールドです`,
  additionalProperties: (e) => `追加フィールドは許可されていません`,
  oneOf:                (e) => `oneOf のいずれの定義にも一致しません`,
};

function humanizeError(err) {
  const loc = err.instancePath || "(ルート)";
  const fn = KEYWORD_JA[err.keyword];
  const msg = fn ? fn(err) : `${err.keyword}: ${err.message}`;
  return `  ${loc} → ${msg}`;
}

// ── バリデーション実行 ───────────────────────────────────────────────────────

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("使用方法: node validate.js <file.json> [...]");
  process.exit(2);
}

let hasError = false;

for (const filePath of files) {
  const label = path.relative(process.cwd(), filePath);

  // ファイル読み込み
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`❌ ${label}: JSON パースエラー — ${err.message}`);
    hasError = true;
    continue;
  }

  // バリデーション
  const valid = validate(data);
  const customErrors = [];

  // カスタム検証: production.production_date.earliest <= latest
  const pd = data?.production?.production_date;
  if (pd && typeof pd.earliest === "number" && typeof pd.latest === "number") {
    if (pd.earliest > pd.latest) {
      customErrors.push(
        `  /production/production_date → earliest (${pd.earliest}) は latest (${pd.latest}) 以下でなければなりません`
      );
    }
  }

  if (valid && customErrors.length === 0) {
    console.log(`✅ ${label}: 有効`);
  } else {
    const total = (validate.errors ? validate.errors.length : 0) + customErrors.length;
    console.error(`❌ ${label}: ${total} 件のエラー`);
    if (validate.errors) {
      for (const err of validate.errors) {
        console.error(humanizeError(err));
      }
    }
    for (const msg of customErrors) {
      console.error(msg);
    }
    hasError = true;
  }
}

process.exit(hasError ? 1 : 0);
