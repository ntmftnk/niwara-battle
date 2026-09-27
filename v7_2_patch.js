// ============================================================
// PB v7.2 patch
// ラムのみ / カゴのみの即時発動を統一
// ============================================================

(function () {
  "use strict";

  function v72ItemIsActive(pokemon) {
    if (!pokemon || !pokemon.item || pokemon.itemConsumed || pokemon.item.id === "none") return false;
    if (typeof v6ItemIsActive === "function") return v6ItemIsActive(pokemon);
    return true;
  }

  function v72StatusLabel(status) {
    if (typeof STATUS_NAMES !== "undefined" && STATUS_NAMES[status]) return STATUS_NAMES[status];
    return status || "状態異常";
  }

  /**
   * ラムのみ / カゴのみを、その発動条件が成立した瞬間に処理する。
   * - ラムのみ: 主要状態異常またはこんらんをすべて治す
   * - カゴのみ: ねむりだけを治す
   * - 使用後は消費扱い（画面上は既存v6.3仕様により「なし」）
   */
  function v72TryImmediateStatusBerry(pokemon) {
    if (!v72ItemIsActive(pokemon)) return null;

    const itemId = pokemon.item.id;
    const hasMajorStatus = Boolean(pokemon.status);
    const isConfused = (pokemon.confusionTurns || 0) > 0;

    if (itemId === "chesto-berry") {
      if (pokemon.status !== "sleep") return null;

      pokemon.status = null;
      pokemon.statusTurns = 0;
      pokemon.toxicCounter = 0;
      pokemon.itemConsumed = true;

      return `${pokemon.name}は ${pokemon.item.name}を食べて ねむりを治した！`;
    }

    if (itemId === "lum-berry") {
      if (!hasMajorStatus && !isConfused) return null;

      const cured = [];
      if (hasMajorStatus) cured.push(v72StatusLabel(pokemon.status));
      if (isConfused) cured.push("こんらん");

      pokemon.status = null;
      pokemon.statusTurns = 0;
      pokemon.toxicCounter = 0;
      pokemon.confusionTurns = 0;
      pokemon.itemConsumed = true;

      return `${pokemon.name}は ${pokemon.item.name}を食べて ${cured.join("と")}を治した！`;
    }

    return null;
  }

  // 既存の inflictStatus() などが呼ぶ関数そのものを差し替える。
  // これにより、やけど・まひ・どく・もうどく・ねむり・こおりは
  // 付与された直後にラムのみ / カゴのみの判定が走る。
  tryStatusBerry = function (pokemon) {
    return v72TryImmediateStatusBerry(pokemon);
  };

  // こんらんは主要状態異常とは別管理なので、発生直後にラムのみを確認する。
  if (typeof v6Confuse === "function") {
    const V72_baseConfuse = v6Confuse;
    v6Confuse = function (pokemon) {
      const text = V72_baseConfuse(pokemon);
      const berryText = v72TryImmediateStatusBerry(pokemon);
      return berryText ? `${text} ${berryText}` : text;
    };
  }

  // 「ねむる」は既存処理で status="sleep" を直接代入するため、
  // inflictStatus() を通らない。技処理終了直後に双方を再確認して、
  // ねむる＋カゴのみ / ラムのみをその場で即発動させる。
  if (typeof useMove === "function") {
    const V72_baseUseMove = useMove;
    useMove = function (attacker, defender, originalMove) {
      const logs = V72_baseUseMove(attacker, defender, originalMove);

      const attackerBerry = v72TryImmediateStatusBerry(attacker);
      if (attackerBerry) logs.push(attackerBerry);

      // 通常の inflictStatus() では既に消費済みになるため、ここでは重複しない。
      const defenderBerry = v72TryImmediateStatusBerry(defender);
      if (defenderBerry) logs.push(defenderBerry);

      return logs;
    };
  }

  // 説明文もChampionsの挙動が分かる表現に更新。
  if (typeof ITEM_DEX !== "undefined") {
    if (ITEM_DEX["lum-berry"]) {
      ITEM_DEX["lum-berry"].description = "状態異常またはこんらん状態になった時、すぐに食べて治す。1回限り。";
    }
    if (ITEM_DEX["chesto-berry"]) {
      ITEM_DEX["chesto-berry"].description = "ねむり状態になった時、すぐに食べて治す。1回限り。";
    }
  }

  // テスト用に公開（通常プレイでは使用しない）。
  window.__v72TryImmediateStatusBerry = v72TryImmediateStatusBerry;
})();
