ニワラバトル v8.5 PWA
======================

■ 主な追加
- PWA対応（Android / iPhone / iPad / PCのホーム画面・アプリ化）
- オフライン起動用Service Worker
- 安全な更新通知：新バージョンを検出しても自動適用しない
- 「今すぐ更新」を押した時だけ新版へ切替・再読み込み
- ヘッダーに「アプリをインストール」「更新確認」
- iPhone/iPadのホーム画面追加案内
- セーフエリア対応、スタンドアロン表示、スマホのタップ領域拡大

■ 重要：公開方法
PWA機能は file:// では動作しません。
HTTPSで公開するか、開発PCでは localhost のWebサーバーから開いてください。
ゲーム本体は file:// でも従来どおり動作しますが、インストール・オフラインキャッシュ・更新通知は無効です。

■ 更新方法
これまでどおり公開先のファイルを一式上書きできます。
次版を作る際は sw.js の APP_VERSION / CACHE_NAME を新しい番号へ変更してください。
例：8.5.0 → 8.6.0

1. PC側で新しいフォルダ一式を公開先へ上書き
2. スマホ/PCのPWAが新Service Workerを検出
3. 「新しいバージョンがあります」が表示
4. 対戦終了後など安全なタイミングで「今すぐ更新」
5. 新版へ切替後、自動再読み込み

古いキャッシュは新版Service Workerのactivate時に自動削除されます。
保存パーティーはlocalStorageなので、同じ公開URL（同じorigin）を維持する限り引き継がれます。

■ ファイル
manifest.webmanifest  PWAメタデータ
sw.js                 オフラインキャッシュ・更新制御
pwa.js                インストールUI・更新通知UI
icons/                 PWAアイコン

■ 推奨公開先
GitHub Pages / Cloudflare Pages / Netlify / Vercel などのHTTPS静的ホスティング。
