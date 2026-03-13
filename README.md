# anime-archive

**アニメ中間制作物（セル画・原画・背景画等）の記録を目的とした標準メタデータスキーマ**

JSON Schema 2020-12 準拠の草案仕様です。商業的動機が生じない「普通の」作品の資料を最低限記録するための共通語彙として設計しました。SPECTRUM・CIDOC-CRM などの文化財記録の慣習を参考にしつつ、アニメ制作現場の実情（制作委員会方式のコスト構造・セルフィルムの素材特性・作品名不明素材の存在）に合わせています。

---

## 背景

アニメ中間制作物の多くは「偶然残った」ものです。商業的なインセンティブがある人気作品はスタジオが体系的にアーカイブしますが、1クールで終わった作品・視聴率が振るわなかった作品には、保管コストを負担する動機が発生しません（制作委員会方式では保管費用は制作会社のみが負担します）。

その結果、新潟大学が管理するアニメ中間素材データベース（AIMDB）には「作品の題名さえ同定できない素材」が多数収録されています。記録する主体がいなかったからです。

このスキーマは「横断照合を実現する」ためではなく、「誰も記録する動機がない資料を最低限記録できる」共通語彙を提供することを目的としています。バラバラに残っている断片が同じ語彙で記録されていれば、将来の研究者が接続できる可能性が生まれます。

詳細な背景は六方ブログ記事「[消えゆく「普通の」アニメのために——中間制作物アーカイブの空白地帯](https://blog.loppo.co.jp/ja/posts/can-ict-solve-the-provenance-problem/)」を参照してください。

---

## 既存の標準との関係

アニメ中間制作物の記録には、既存の文化財・映像メタデータ標準が直接適用できない理由があります。

| 標準 | 用途 | アニメ中間制作物への適用上の制約 |
|---|---|---|
| **Dublin Core** | 汎用書誌メタデータ | アニメ制作工程に特化した語彙を持たない。未同定素材をそのまま扱うことを主眼にしていない。 |
| **VRA Core 4.0** | 美術資料の視覚資源 | 完成した美術オブジェクトが主対象。制作工程の層（原画・動画・セル等）の専用分類を備えていない。 |
| **EN 15907** | 映像作品の書誌記録（欧州規格） | 完成した映像作品を対象とする作品レベルの標準。カット単位の中間制作物の記述は中心ユースケースではない。 |
| **SPECTRUM** | 博物館コレクション管理手順 | 手続き標準（プロセス記述）であり、交換可能なデータスキーマではない。本格運用には相応の体制を要することが多い。 |

このスキーマが追加する主な要素：

- **`layer` フィールド**（`genga` / `douga` / `cel` / `bg` / `layout` / `settei` / `konte`）——アニメ制作工程に固有の素材種別分類。少なくともこのような工程専用の列挙語彙として設計された標準は現時点では見当たらない。
- **タイトル不明素材の記録**——`work` フィールドを省略可能にし、`identification_note` で調査中の旨を記述できる。EN 15907 や Dublin Core は未同定素材の扱いを主眼としていない。
- **MADB 連携**（`madb_id`）——完成作品の書誌情報を持つメディア芸術データベースとの照合起点。国内インフラとの接続性。
- **非専門家による記録を想定した最小設計**——必須フィールドは `id` / `recorded_by` / `recorded_at` の 3 項目のみ。SPECTRUM のような手順標準を支える機関インフラがない環境でも使える。

なお、このスキーマは既存の標準を置き換えるものではありません。SPECTRUM の手順に従って管理されているコレクションや、EN 15907 準拠の書誌データが存在する場合は、それらとの併用・相互参照を推奨します。

---

## スキーマ

`schema/anime-archive.schema.json`

JSON Schema 2020-12 準拠。主なフィールド：

| フィールド | 必須 | 説明 |
|---|---|---|
| `schema` | ✓ | スキーマ識別子（`"anime-archive/v2"` 固定） |
| `id` | ✓ | レコードの一意識別子（URN形式） |
| `work` | — | 作品タイトル（未同定の場合は省略して `identification_note` に記述） |
| `layer` | — | 種別（`genga` / `douga` / `cel` / `bg` / `layout` / `settei` / `konte` / `unknown`） |
| `production` | — | 制作情報（スタジオ・年代・担当者）|
| `production_date` | — | 制作年代（`earliest`/`latest`/`circa`/`evidence` で不確実年代に対応） |
| `current_custodian` | — | 現在の所蔵機関または個人（「今誰が持っているか」のみを記録） |
| `madb_id` | — | メディア芸術データベース（MADB）の作品識別子 |
| `materials` | — | 素材情報（支持体・サイズ・フィールドサイズ。塗料は `extensions` 推奨） |
| `condition_assessment` | — | 保存状態の評価（SPECTRUM 準拠。評価者・日時・方法を含む） |
| `capture` | — | 撮影・スキャン記録（機器・条件・解像度） |
| `attachments` | — | 添付ファイル（表面/裏面/UV等の役割・ハッシュ） |
| `rights` / `access` | — | このレコード自体の権利・公開範囲 |
| `extensions` | — | 機関独自の拡張フィールド（custody・塗料詳細等もここへ） |
| `recorded_by` | ✓ | 記録者 |
| `recorded_at` | ✓ | 記録日時（ISO 8601） |

---

## 使い方

### 最小構成

```json
{
  "schema": "anime-archive/v2",
  "id": "urn:anime-archive:uuid:550e8400-e29b-41d4-a716-446655440000",
  "layer": "cel",
  "identification_note": "作品タイトル調査中",
  "current_custodian": "所蔵機関名または個人名",
  "recorded_by": "your-name",
  "recorded_at": "2026-01-01T00:00:00Z"
}
```

詳細なサンプルは `examples/full.json` を参照してください。

### バリデーション（Node.js CLI）

```bash
# 依存パッケージのインストール
npm install

# レコードの検証
node validate.js your-record.json

# 複数ファイルを一括検証
node validate.js examples/*.json

# npm test（付属サンプルの全検証）
npm test
```

エラーがある場合は、フィールドパスと日本語の説明が出力されます：

```
❌ your-record.json: 1 件のエラー
  /layer → 許可された値ではありません（許可: genga | douga | cel | bg | layout | settei | konte | unknown）
```

### バリデーション（Python）

```bash
pip install "jsonschema[format-nongpl]"
python3 - <<'EOF'
import json
from jsonschema import validate, Draft202012Validator
from jsonschema.exceptions import ValidationError

schema = json.load(open('schema/anime-archive.schema.json'))
record = json.load(open('your-record.json'))
try:
    validate(instance=record, schema=schema, cls=Draft202012Validator)
    print('Valid')
except ValidationError as e:
    print('Invalid:', e.message)
EOF
```

> **注意**: このスキーマは JSON Schema 2020-12 を使用しています。Python の `jsonschema` ライブラリではバージョンによって自動選択の挙動が異なるため、`Draft202012Validator` を明示的に指定すると確実です。

---

## 設計上の注意

- **このスキーマは物理的な真正性を保証しません。** 記録内容の誠実さは記録者に依存します。スキーマは「記録しやすく・照合しやすく」することを目的としています。
- **v2 は最小実用版です。** authority control（人物・団体典拠との連携）や多言語対応は v3 以降で検討します。
- **`extensions` フィールドを活用してください。** 機関独自の項目はここに入れることで、スキーマの互換性を維持しつつ拡張できます。

---

## ロードマップ

- [x] v1.0 — 初稿（2026-03）
- [x] v2.0 — custody 削除・current_custodian / madb_id 追加・layer 拡張（2026-03）
- [ ] v2.1 — 制御語彙（支持体の標準語彙）の整備
- [ ] v3.0 — `studio`・担当者の authority control 対応（`{ name, identifier }` 形式）
- [x] CLI ツール — `validate.js`（Node.js / ajv）によるバリデーション、日本語エラーメッセージ付き（2026-03）

---

## ライセンス

スキーマ仕様自体は CC0 1.0 (パブリックドメイン) とします。各レコードのライセンスは `rights` フィールドで個別に指定してください。

---

## 関連

- [六方ブログ: プロビナンス問題をICTで解決できるか](https://blog.loppo.co.jp/ja/posts/can-ict-solve-the-provenance-problem/) （公開後リンク予定）
- [SPECTRUM — コレクション管理の標準](https://collectionstrust.org.uk/spectrum/)
- [CIDOC CRM](https://cidoc-crm.org/)
