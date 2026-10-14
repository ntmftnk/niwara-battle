ニワラバトル v13.0.4 修正パッチ
========================================
対象: v13.0.3
アプリバージョン: 13.0.4
Service Worker generation: 20

【変更1: 環境研究の詳細なスナップショット】
- 区間ごとの上位10種だけではなく、当該区間の全研究統計を snapshots[].stats に保存。
- 全種族の構築採用/選出/勝利/KO/被KO、種別の技採用・使用、特性・持ち物、
  能力P構成、技全体統計、対面/型単位直接対面とKO・ダメージなどを保持。
- これまでの区間スナップショットは古い順に250件を超えると削除されていたが、
  v13.0.4以降はその自動削除をしない。
- 研究のCSV出力に snapshot_* セクションを追加。従来CSVの先頭7列
  section,species,name,metric1,metric2,metric3,metric4 は維持。
  末尾に区間開始・終了・世代・試合数・ID・件数・勝敗などの列を追加。
  CSVの各snapshot_summary行の後にその区間の詳細行が続く。
- JSON出力にも snapshots[].stats と最終累積statsの全項目を含める。
- 旧v13.0.3以前のスナップショットは top10 だけなので、CSVには
  snapshot_top_legacy 行として記録し、欠落した情報を埋め合わせない。
  古い研究データはそのまま表示・CSV/JSON出力可能。
- 詳細スナップショットによる保存容量増加に備え、Worker完了のたびに
  大きなIndexedDBデータを書き込まず、約3秒間隔/世代確定/区間確定/
  研究完了などで保存。手動停止時は必ず保存する。

【変更2: 編成と選出の整合性】
- 有効な6匹編成を編集すると現在の編成を自動保存。編成内容が不正な
  途中状態の場合は以前の有効な保存編成を壊さない。
- 「選出へ」遷移時にも現在の編成を保存して同期する。
- 保存パーティーを新規保存した際、表示中の選択IDとパーティー名が
  既存の保存先へ巻き戻るケースを修正。上書き保存後も同一保存先の
  選択ID・名前を保つ。
- 保存パーティーの読み込みでも現在の編成と保存データが同期する。
- アプリ再読み込み時に直近の有効な編成が残る。

【上書きするファイル】
  /app-config.js
  /index.html
  /sw.js
  /js/app-config.js
  /js/battle-core.js
  /js/game.js
  /js/research.js

ZIPは上記パスのフォルダ構造を維持してリポジトリルートに上書きする。
他のファイルはv13.0.3から変更しない。icons/フォルダはそのまま保持する。
GitHub Pagesへのデプロイ後、アプリで「更新確認」→ v13.0.4 を確認。
旧PWAキャッシュが残る場合はいったん閉じて開き直す。
保存パーティーや既存の環境研究の削除は不要。

【CSV列と解釈】
- snapshot_species: metric1=区間使用率(%), metric2=区間選出率(%),
  metric3=区間選出時勝率(%), metric4=区間KO数。全種族を掲載。
- snapshot_species_move_adoption / snapshot_species_ability /
  snapshot_species_item: metric1=区間採用回数, metric2=採用率(%),
  metric3=当該採用時勝利数, metric4=勝利率(%)。
- snapshot_species_move_use: 使用回数・命中回数・ダメージ・KO。
- snapshot_species_matchup / snapshot_encounter /
  snapshot_archetype_encounter: 種族/型単位の対面・勝敗・KO・ダメージ等。
- snapshot_spread: 能力P構成の採用回数。
- snapshot_battle_outcome: A勝/B勝/引き分けの件数。
- 旧研究の情報欠損を示す snapshot_top_legacy は上位10種のみ。

【注意事項】
- 保存容量は従来より増える。100万戦級はブラウザのIndexedDB
  空き容量に注意すること。
- 履歴の詳細はv13.0.4で新規に進めた区間から記録される。
  v13.0.3以前の過去試合の詳細履歴は再構成できない。
- 研究コアの対戦仕様、学習アルゴリズムのバランス調整は変更しない。
- テストはソースの静的検証、研究コアの簡易自己対戦、Chromiumの
  DOM環境での編成/選出とCSV/JSON処理。実際の公開URL・PWAインストール
  状態でのエンドツーエンド検証や10万戦実行までは行っていない。
