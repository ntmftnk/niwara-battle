// ============================================================
// PB v6.3 patch
// - プレイヤーの交代技は交代先を手動選択
// - KOが発生してもターン終了処理を実行
// - どくどくだま/かえんだまは非消費
// - 消費/喪失した持ち物はバトル表示上「なし」
// ============================================================

// ------------------------------------------------------------
// 持ち物追加・説明補足
// ------------------------------------------------------------
if (!ITEM_DEX["flame-orb"]) {
  ITEM_DEX["flame-orb"] = {
    id: "flame-orb",
    name: "かえんだま",
    description: "ターン終了時、自分をやけど状態にする。発動しても消費しない。"
  };
}

if (ITEM_DEX["toxic-orb"]) {
  ITEM_DEX["toxic-orb"].description = "ターン終了時、自分をもうどく状態にする。発動しても消費しない。";
}

// ------------------------------------------------------------
// 「消費済み」は、バトル中は持ち物なしとして扱う。
// itemConsumed はリサイクル等の履歴保持のため内部的には残す。
// ------------------------------------------------------------
itemDisplay = function(pokemon) {
  if (!pokemon || pokemon.itemConsumed || !pokemon.item || pokemon.item.id === "none") return "なし";
  return pokemon.item.name;
};

function v63HasHeldItem(pokemon) {
  return Boolean(pokemon && !pokemon.itemConsumed && pokemon.item && pokemon.item.id !== "none");
}

// はたきおとすの威力判定を「現在持っているか」で統一する。
const V63_getItemDamageMultiplier = getItemDamageMultiplier;
getItemDamageMultiplier = function(attacker, move, effectiveness, defender) {
  let result = V63_getItemDamageMultiplier(attacker, move, effectiveness, defender);

  // 旧実装側が knockOff を計算していても、実際には持ち物がないなら補正を外す。
  if (move?.knockOff && defender && !v63HasHeldItem(defender)) {
    // 旧関数の中ではノックオフ分だけ x1.5 されるので戻す。
    // ただし旧関数がすでに v6ItemIsActive を見ている場合は result はそのまま。
    const rawWouldHaveBoosted = defender.item && defender.item.id !== "none" && !defender.itemConsumed;
    if (rawWouldHaveBoosted) result /= 1.5;
  }

  return result;
};

// ------------------------------------------------------------
// どくどくだま・かえんだま
// 非消費。KOが起きたターンでも、後述のターン終了処理で発動する。
// ------------------------------------------------------------
const V63_processResidualForPokemon = processResidualForPokemon;
processResidualForPokemon = function(pokemon) {
  if (!pokemon) return;

  const magicRoomActive = v6EnsureFieldState().magicRoom > 0;
  const toxicOrbWasHeld = !magicRoomActive && v63HasHeldItem(pokemon) && pokemon.item.id === "toxic-orb";
  const flameOrbWasHeld = !magicRoomActive && v63HasHeldItem(pokemon) && pokemon.item.id === "flame-orb";

  V63_processResidualForPokemon(pokemon);

  // 旧処理はどくどくだまを itemConsumed=true にしていたため戻す。
  if (toxicOrbWasHeld && pokemon.item?.id === "toxic-orb") {
    pokemon.itemConsumed = false;
  }

  // かえんだまは状態異常ダメージ等の後、ターン終了時に発動。
  if (flameOrbWasHeld && pokemon.hp > 0 && !pokemon.status) {
    const text = inflictStatus(pokemon, "burn");
    addLog(`${pokemon.name}の かえんだまが発動！ ${text}`, "log-status");
    pokemon.itemConsumed = false;
  }
};

// ------------------------------------------------------------
// プレイヤー交代技の手動選択
// ------------------------------------------------------------
let v63PendingPlayerPivot = null;
let v63PivotRequestedThisAction = false;

function v63PlayerHasBench() {
  return playerTeam.some((pokemon, index) => index !== playerActiveIndex && pokemon.hp > 0);
}

// 敵はAIで交代先を決める。プレイヤーは選択待ちにする。
autoPivot = function(side) {
  const team = getTeamBySide(side);
  const currentIndex = getActiveIndexBySide(side);
  const candidates = team
    .map((pokemon, index) => ({ pokemon, index }))
    .filter(entry => entry.index !== currentIndex && entry.pokemon.hp > 0);

  if (!candidates.length) return false;

  if (side === "player") {
    v63PivotRequestedThisAction = true;
    awaitingPlayerSwitch = true;
    addLog(`${getPlayerPokemon().name}は 技の効果で戻る！`, "log-system");
    addLog("交代先のポケモンを選んでください。", "log-system");
    return true;
  }

  // AI側は現在の相手に対して最も打点を持てる控えを優先。
  const target = getPlayerPokemon();
  let best = candidates[0];
  let bestScore = -Infinity;
  candidates.forEach(entry => {
    const score = bestDamageScoreForPokemon(entry.pokemon, target);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  const old = getEnemyPokemon();
  onSwitchOut(old);
  enemyActiveIndex = best.index;
  resetOnSwitch(getEnemyPokemon());
  addLog(`${old.name}は 技の効果で戻った！`, "log-system");
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  activateEntryAbility(getEnemyPokemon());
  return true;
};

function v63ResetTurnFlags() {
  [getPlayerPokemon(), getEnemyPokemon()].filter(Boolean).forEach(pokemon => {
    pokemon.hasActedThisTurn = false;
    pokemon.flinched = false;
    pokemon.tookDamageThisTurn = false;
    pokemon.lastDamageAmount = 0;
    pokemon.lastDamageCategory = null;
    pokemon.endureThisTurn = false;
  });
}

function v63FinishTurn() {
  // 相手を倒したターンでも、生存している場のポケモンには
  // どくどくだま・たべのこし・天候などのターン終了処理を行う。
  endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
  window.__v6SelectedMoves = null;
}

function v63PauseForPivot(context) {
  v63PendingPlayerPivot = context;
  v63PivotRequestedThisAction = false;
  renderAll();
}

// v6.2 最終版 processMoveTurn を、交代技の途中停止に対応した進行へ置換。
processMoveTurn = function(playerMove) {
  if (battleOver || awaitingPlayerSwitch) return;

  let player = getPlayerPokemon();
  let enemy = getEnemyPokemon();
  if (!player || !enemy || player.hp <= 0 || enemy.hp <= 0) return;
  if (!playerMove.struggle && (playerMove.pp <= 0 || !isMoveAllowedByItem(player, playerMove))) return;

  v63ResetTurnFlags();
  v63PivotRequestedThisAction = false;

  addLog(`ターン ${turnNumber}`, "log-turn");
  const enemyAction = chooseEnemyAction();
  window.__v6SelectedMoves = {
    player: playerMove,
    enemy: enemyAction?.type === "move" ? enemyAction.move : null
  };

  // 相手が通常交代を選んだ場合
  if (enemyAction?.type === "switch") {
    enemySwitch(enemyAction.index, true);
    player = getPlayerPokemon();
    enemy = getEnemyPokemon();

    if (player.hp > 0 && enemy.hp > 0) {
      addLogs(useMove(player, enemy, playerMove));
    }

    if (v63PivotRequestedThisAction && getPlayerPokemon().hp > 0 && v63PlayerHasBench()) {
      v63PauseForPivot({
        enemyAction,
        enemyAlreadyActed: true,
        playerMove
      });
      return;
    }

    v63FinishTurn();
    return;
  }

  const enemyMove = enemyAction.move;
  const first = determineFirst(playerMove, enemyMove);

  if (first === "player") {
    addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));

    if (v63PivotRequestedThisAction && getPlayerPokemon().hp > 0 && v63PlayerHasBench()) {
      v63PauseForPivot({
        enemyAction,
        enemyAlreadyActed: false,
        playerMove
      });
      return;
    }

    if (getEnemyPokemon().hp > 0 && getPlayerPokemon().hp > 0) {
      addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));
    }
  } else {
    addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));

    if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) {
      addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));
    }

    if (v63PivotRequestedThisAction && getPlayerPokemon().hp > 0 && v63PlayerHasBench()) {
      v63PauseForPivot({
        enemyAction,
        enemyAlreadyActed: true,
        playerMove
      });
      return;
    }
  }

  v63FinishTurn();
};

// ------------------------------------------------------------
// 交代ボタン
// 交代技の選択待ちの場合だけ、選択後に残りのターンを再開する。
// ------------------------------------------------------------
const V63_playerSwitchBase = playerSwitch;
playerSwitch = function(newIndex) {
  if (!v63PendingPlayerPivot) {
    return V63_playerSwitchBase(newIndex);
  }

  if (battleOver) return;
  const newPokemon = playerTeam[newIndex];
  if (!newPokemon || newPokemon.hp <= 0 || newIndex === playerActiveIndex) return;

  const context = v63PendingPlayerPivot;
  const old = getPlayerPokemon();

  onSwitchOut(old);
  playerActiveIndex = newIndex;
  resetOnSwitch(getPlayerPokemon());
  awaitingPlayerSwitch = false;
  v63PendingPlayerPivot = null;

  addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
  activateEntryAbility(getPlayerPokemon());
  renderAll();

  // 交代先が設置技で倒れた場合は、まずひんし処理へ。
  if (getPlayerPokemon().hp <= 0) {
    endTurn();
    turnNumber++;
    resolveFaints();
    renderAll();
    window.__v6SelectedMoves = null;
    return;
  }

  // プレイヤーが先に交代技を使っていたなら、相手の選択済み技は
  // 新しく出たポケモンを対象にして続行する。
  if (!context.enemyAlreadyActed && context.enemyAction?.type === "move" && getEnemyPokemon().hp > 0) {
    window.__v6SelectedMoves = {
      player: context.playerMove,
      enemy: context.enemyAction.move
    };
    addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), context.enemyAction.move));
  }

  v63FinishTurn();
};

// ------------------------------------------------------------
// 交代技待ちの表示補足
// ------------------------------------------------------------
const V63_renderSwitchButtonsBase = renderSwitchButtons;
renderSwitchButtons = function() {
  V63_renderSwitchButtonsBase();

  if (v63PendingPlayerPivot) {
    switchContainer.querySelectorAll("button").forEach((button, index) => {
      if (!button.disabled && index !== playerActiveIndex) {
        button.title = "交代技で出すポケモンを選択";
      }
    });
  }
};

// ------------------------------------------------------------
// 初期化時は保留中交代を破棄
// ------------------------------------------------------------
const V63_startBattleFromSelectionBase = startBattleFromSelection;
startBattleFromSelection = function() {
  v63PendingPlayerPivot = null;
  v63PivotRequestedThisAction = false;
  V63_startBattleFromSelectionBase();
};

// Builderに追加持ち物を反映
if (typeof renderBuilder === "function") renderBuilder();
