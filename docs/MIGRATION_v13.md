# v12.0.7 → v13.0.0 移行手順

## 重要
GitHubへ新ファイルを上書きするだけでは、v12の旧ファイルや過去パッチが残ります。
v13では以下の手順で一度整理してください。

## 1. 絶対に残すもの
既存リポジトリの `icons/` フォルダは削除しないでください。

最低限、以下を維持します。

```text
icons/icon-192.png
icons/icon-512.png
icons/icon-maskable-512.png
```

今回のv13 ZIPには既存アイコンを含めていないため、GitHub上の `icons/` をそのまま使用します。

## 2. v13 ZIPを展開してアップロード
ZIP内の以下をリポジトリルートへ配置します。

```text
index.html
style.css
manifest.webmanifest
sw.js
app-config.js
js/
docs/
```

## 3. v12の旧ルートJSを削除
アップロード後、次の旧ファイルがGitHubルートに残っている場合は削除してください。

```text
game.js
game-data.js
format-engine.js
pwa.js
sim-core.js
sim-worker.js
sim-manager.js
pokedex-research.js
```

v13では対応する本体が `js/` にあります。

## 4. 過去パッチ・作業ファイルを削除
GitHubに残っている場合は、以下も削除して構いません。

- `niwara-battle-v12*.zip`
- `niwara-battle-v12*-patch/`
- `PATCH_README_v12*`
- `*_AUDIT_v12*`
- `MULTI_AUDIT_v12*`
- `UI_AUDIT_v12*`
- `BUGFIX_AUDIT_v12*`
- `AI_AUDIT_v12*`
- `AI_RESEARCH_AUDIT_v12*`
- `README_v12*`
- `ARCHITECTURE_v12*`
- `RESEARCH_GUIDE_v12*`
- `BATTLE_FORMATS_v12*`
- `inline-*.html`
- `*-test.html`
- `*.bak`
- その他、テスト用・作業用コピー

## 5. v13で残す正本
最終的にアプリ本体は次の構成にしてください。

```text
index.html
style.css
manifest.webmanifest
sw.js
app-config.js
js/
icons/
docs/
```

## 6. `app-config.js`が2か所ある理由

- `/js/app-config.js`：v13本体の正本
- `/app-config.js`：v12 PWAからv13へ更新検出するための互換ファイル

旧v12の `pwa.js` は `./app-config.js` を直接確認するため、移行直後にルート版を消すと旧インストール済みPWAがv13を検出できない場合があります。

## 7. GitHub Pages反映後
1. GitHub Pagesのデプロイ完了を確認
2. 既存PWAで「更新確認」
3. v13.0.0表示を確認
4. 古い画面のままなら一度アプリを閉じて開き直す
5. それでも古い場合のみハードリロード

通常は保存パーティーや環境研究データの削除は不要です。

## 今後のファイル追加ルール
- 実行JSは原則 `js/` に置く
- 一時テストHTML / `.bak` / パッチZIPは本番リポジトリへ置かない
- ドキュメントは `docs/` にまとめる
- 一つの責務を細かく分割しすぎず、研究UIは `research.js` のように関連機能をまとめる
