# anicel-provenance

**アニメセル画・原画の来歴（プロビナンス）を記録するための標準メタデータスキーマ**

JSON Schema 2020-12 準拠の草案仕様です。SPECTRUM・CIDOC-CRM などの文化財記録の慣習を参考にしつつ、アニメ制作現場の実情（セルフィルムの素材・制作委員会方式の権利関係・手描き/アナログの一点物性）に合わせて設計しました。

---

## 背景

セル画・原画の取引市場では、「この資料が本当に○年代に制作されたものか」「誰がどういう経緯で持っているのか」という来歴（プロビナンス）の不透明さが、真贋問題の温床になっています。

ブロックチェーン・NFT を活用した業界の試み（J-LOD補助金採択事業、AJAデジタルアセット管理システム等）は、主にデジタルコンテンツの権利管理・流通を対象としており、物理的な一点物のプロビナンス担保には直接的には対応していません。

このスキーマは「誰もが使える・参照できる・照合できる」オープンなメタデータ形式を提供することで、記録の習慣化と相互運用性の向上を目指しています。

---

## スキーマ

`schema/anicel-provenance.schema.json`

JSON Schema 2020-12 準拠。主なフィールド：

| フィールド | 必須 | 説明 |
|---|---|---|
| `schema` | ✓ | スキーマ識別子（`"anicel-provenance/v1"` 固定） |
| `id` | ✓ | レコードの一意識別子（URN形式） |
| `work` | — | 作品タイトル（未同定の場合は `identification_note` に記述） |
| `layer` | — | 種別（`genga` / `douga` / `cel` / `bg` / `unknown`） |
| `production` | — | 制作情報（スタジオ・年代・担当者）|
| `production_date` | — | 制作年代（`earliest`/`latest`/`circa`/`evidence` で不確実年代に対応） |
| `materials` | — | 素材情報（支持体・塗料・サイズ・フィールドサイズ） |
| `condition_assessment` | — | 保存状態の評価（SPECTRUM 準拠。評価者・日時・方法を含む） |
| `custody` | — | 所有権の連鎖（取得種別・確度・証拠資料を含む） |
| `capture` | — | 撮影・スキャン記録（機器・条件・解像度） |
| `attachments` | — | 添付ファイル（表面/裏面/UV等の役割・ハッシュ） |
| `rights` / `access` | — | このレコード自体の権利・公開範囲 |
| `extensions` | — | 機関独自のフィールド拡張 |
| `recorded_by` | ✓ | 記録者 |
| `recorded_at` | ✓ | 記録日時（ISO 8601） |

---

## 使い方

### 最小構成

```json
{
  "schema": "anicel-provenance/v1",
  "id": "urn:anicel:uuid:550e8400-e29b-41d4-a716-446655440000",
  "layer": "cel",
  "identification_note": "作品タイトル調査中",
  "recorded_by": "your-name",
  "recorded_at": "2026-01-01T00:00:00Z"
}
```

詳細なサンプルは `examples/full.json` を参照してください。

### バリデーション（Python）

```bash
pip install jsonschema
python3 -c "
import json, jsonschema
schema = json.load(open('schema/anicel-provenance.schema.json'))
record = json.load(open('your-record.json'))
jsonschema.validate(record, schema)
print('Valid')
"
```

---

## 設計上の注意

- **このスキーマは物理的な真正性を保証しません。** 記録内容の誠実さは記録者に依存します。スキーマは「記録しやすく・照合しやすく」することを目的としています。
- **v1 は最小実用版です。** authority control（人物・団体典拠との連携）や多言語対応は v2 以降で検討します。
- **`extensions` フィールドを活用してください。** 機関独自の項目はここに入れることで、スキーマの互換性を維持しつつ拡張できます。

---

## ロードマップ

- [ ] v1.0 — 現在の草案のフィードバック収集
- [ ] v1.1 — 制御語彙（支持体・塗料の標準語彙）の整備
- [ ] v2.0 — `studio`・担当者のauthority control対応（`{ name, identifier }` 形式）
- [ ] CLI ツール — レコードの作成・バリデーション・照合を補助するコマンドラインツール

---

## ライセンス

スキーマ仕様自体は CC0 1.0 (パブリックドメイン) とします。各レコードのライセンスは `rights` フィールドで個別に指定してください。

---

## 関連

- [六方ブログ: プロビナンス問題をICTで解決できるか](https://blog.loppo.co.jp/ja/posts/can-ict-solve-the-provenance-problem/) （公開後リンク予定）
- [SPECTRUM — コレクション管理の標準](https://collectionstrust.org.uk/spectrum/)
- [CIDOC CRM](https://cidoc-crm.org/)
