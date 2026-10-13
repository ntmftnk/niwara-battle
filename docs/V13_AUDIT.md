# ニワラバトル v13.0.0 監査結果

## 1. 静的検証
- production JavaScript: `node --check` 全件OK
- HTML ID: 303個 / 重複0
- HTMLローカル参照: 欠損0（既存 `icons/` を除く）
- Service Worker APP_SHELL: 非アイコン参照欠損0
- manifest JSON: 正常
- app version: 13.0.0
- Service Worker updater-generation: 16

## 2. 共通コア
確認バージョン：
- `NIWARA_APP`: 13.0.0
- `NIWARA_CORE`: 13.0.0
- `NiwaraSimCore`: 13.0.0（Node/Worker相当）

共通基礎処理をシングル / 非シングル / 研究から参照できることを確認。

注意：詳細な全技・全特性の効果解決器は互換性維持のためシングルと非シングルに残っています。v13.0.0は全面的な単一resolver化ではなく、今後安全に移行するための共通コア基盤です。

## 3. 環境研究コア
同一v13コードで各30戦：

- シングル: 30戦 / NaN・Infinityなし
- ダブル: 30戦 / NaN・Infinityなし
- トリプル: 30戦 / NaN・Infinityなし
- 6vs6: 30戦 / NaN・Infinityなし
- タッグ: 30戦 / NaN・Infinityなし

初期条件制限スモーク：
- 許可8種だけの研究を20戦
- 指定外ポケモン混入0
- 指定外技混入0
- 指定外特性混入0
- 指定外持ち物混入0

## 4. ライブCPU実戦
Chromium実ブラウザ：

- ダブル: 5ターンで決着 / JS例外0
- トリプル: 6ターンで決着 / JS例外0
- 6vs6: 16ターンで決着 / JS例外0
- タッグ: 9ターンで決着 / JS例外0

各形式でCPU判断がリプレイへ保存されることを確認。

## 5. 全技ランタイムスモーク
v13開発時のinstrumented Chromium smokeで、同一対戦状態を安全にリセットしながら全350技を実行：

- ダブル: 350 / 350、JavaScript例外0
- トリプル: 350 / 350、JavaScript例外0

これは「例外なく実行できる」回帰試験であり、350技すべての公式細部仕様が完全一致することを意味するものではありません。

## 6. リプレイ / AI解析
Chromiumで確認：
- シングルCPU開始後にreplay events生成
- CPU行動選択後にdecision生成
- Analysis Lab表示
- CPU候補カード表示
- JSONリプレイschema `niwara-replay-v13`
- validation UI PASS

## 7. 共有ルールセット
Chromiumで確認：
- ルールセット保存API
- 対戦設定のルールセット選択へ即時反映
- 研究設定のルールセット選択へ即時反映
- active rule setを対戦開始時に検証
- CPU自動構築が許可集合に従う

## 8. 環境研究2.0
実装確認：
- 研究runに `snapshots` を保存
- 旧runでsnapshotsがない場合は空配列として互換読込
- 一定試合数ごとの使用率上位スナップショット
- 最新上位種と初期値との差分表示
- JSON exportへsnapshotsを含める
- v12.0.7のadaptive meta snapshotを継続

## 9. ファイル整理
本番配布から除外：
- `sim-manager.js`
- `pokedex-research.js`
- instrumented `format-engine-test.js`
- v12 README / ARCHITECTURE
- `.bak`
- inline test HTML

研究UIと図鑑研究連携は `js/research.js` に統合。

ルート直下はHTML/CSS/PWA/移行互換ファイル中心とし、実行JavaScriptを `js/` に集約。
