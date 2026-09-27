(() => {
  "use strict";

  const APP_VERSION = "9.1.1";
  const installButton = document.getElementById("pwa-install-button");
  const checkButton = document.getElementById("pwa-update-check-button");
  const banner = document.getElementById("pwa-update-banner");
  const updateNowButton = document.getElementById("pwa-update-now-button");
  const updateLaterButton = document.getElementById("pwa-update-later-button");
  const toast = document.getElementById("pwa-status-toast");
  const networkStatus = document.getElementById("pwa-network-status");
  const versionBadge = document.getElementById("pwa-version-badge");

  let deferredPrompt = null;
  let registration = null;
  let refreshing = false;
  let toastTimer = null;

  if (versionBadge) versionBadge.textContent = "v9.1.1";

  function showToast(message, ms = 2800) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), ms);
  }

  function standalone() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  function isBattleInProgress() {
    const battleScreen = document.getElementById("battle-screen");
    if (!battleScreen || battleScreen.classList.contains("hidden")) return false;
    try {
      const state = window.__PBV8?._debugState?.();
      return state ? !state.battleOver : true;
    } catch (_) {
      return true;
    }
  }

  function updateNetworkState() {
    if (!networkStatus) return;
    const online = navigator.onLine;
    networkStatus.textContent = online ? "オンライン" : "オフライン";
    networkStatus.classList.toggle("is-offline", !online);
    document.documentElement.classList.toggle("is-offline", !online);
  }

  function refreshUpdateButtonState() {
    if (!updateNowButton) return;
    const blocked = isBattleInProgress();
    updateNowButton.disabled = blocked;
    updateNowButton.textContent = blocked ? "対戦終了後に更新" : "今すぐ更新";
    if (banner) banner.classList.toggle("battle-blocked", blocked);
  }

  function showWaiting(worker) {
    if (!worker || !banner) return;
    banner.dataset.waiting = "true";
    banner.classList.remove("hidden");
    refreshUpdateButtonState();
  }

  function bindRegistration(reg) {
    registration = reg;
    if (reg.waiting && navigator.serviceWorker.controller) showWaiting(reg.waiting);

    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          showWaiting(worker);
        }
      });
    });
  }

  async function checkForUpdate(userInitiated = false) {
    if (!registration) {
      if (userInitiated) showToast("PWA更新機能はHTTPSまたはlocalhostで利用できます。", 4400);
      return;
    }
    if (!navigator.onLine) {
      if (userInitiated) showToast("オフラインです。ゲームは遊べますが、更新確認には通信が必要です。", 4400);
      return;
    }
    try {
      await registration.update();
      if (registration.waiting) showWaiting(registration.waiting);
      else if (userInitiated) showToast(`現在のバージョンが最新です。v${APP_VERSION}`);
    } catch (_) {
      if (userInitiated) showToast("更新確認に失敗しました。通信状態を確認してください。", 4400);
    }
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !standalone()) installButton?.classList.remove("hidden");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (!standalone()) installButton?.classList.remove("hidden");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installButton?.classList.add("hidden");
    showToast("ニワラバトルをインストールしました。");
  });

  installButton?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      installButton.classList.add("hidden");
      return;
    }
    if (isIOS) {
      showToast("iPhone/iPadではSafariの共有メニュー →「ホーム画面に追加」を選択してください。", 6500);
    } else {
      showToast("ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。", 6500);
    }
  });

  checkButton?.addEventListener("click", () => checkForUpdate(true));
  updateLaterButton?.addEventListener("click", () => banner?.classList.add("hidden"));
  updateNowButton?.addEventListener("click", () => {
    refreshUpdateButtonState();
    if (updateNowButton.disabled) {
      showToast("対戦中は更新を適用しません。勝負が終わってから更新してください。", 4800);
      return;
    }
    const waiting = registration?.waiting;
    if (!waiting) return checkForUpdate(true);
    updateNowButton.disabled = true;
    updateNowButton.textContent = "更新中…";
    waiting.postMessage({ type: "SKIP_WAITING" });
  });

  window.addEventListener("online", () => {
    updateNetworkState();
    showToast("オンラインに復帰しました。");
    checkForUpdate(false);
  });
  window.addEventListener("offline", () => {
    updateNetworkState();
    showToast("オフラインになりました。インストール済みならゲームはそのまま遊べます。", 4200);
  });
  updateNetworkState();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .then(reg => {
        bindRegistration(reg);
        // 起動ごとにsw.jsだけ更新確認。新しいアプリ本体は待機SWの専用キャッシュへ入り、許可するまで現行版を維持する。
        setTimeout(() => checkForUpdate(false), 700);
      })
      .catch(() => showToast("PWAの初期化に失敗しました。ゲーム本体は通常どおり遊べます。", 5200));

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshUpdateButtonState();
        checkForUpdate(false);
      }
    });

    // 対戦終了後に更新ボタンが自動で有効へ戻るよう、表示だけ軽く同期する。
    setInterval(() => {
      if (banner && !banner.classList.contains("hidden")) refreshUpdateButtonState();
    }, 1200);
  } else {
    installButton?.classList.add("hidden");
    checkButton?.setAttribute("title", "PWA更新はHTTPS/localhostで有効です");
  }

  window.__NIWARA_PWA__ = {
    version: APP_VERSION,
    checkForUpdate,
    standalone,
    isBattleInProgress
  };
})();
