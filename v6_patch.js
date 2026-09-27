// ============================================================
// ニワラバトル v6 パッチ
// - 実装済み17種の元データ記載・全習得技を利用可能にする
// - 技詳細モーダル
// - 選出時の型詳細表示
// - 技に必要な場・状態・持ち物・特殊処理を拡張
// ============================================================

const V6_TERRAIN_NAMES = {
  electric: "エレキフィールド",
  grassy: "グラスフィールド",
  misty: "ミストフィールド",
  psychic: "サイコフィールド"
};

const V6_CATEGORY_NAMES = {
  physical: "物理",
  special: "特殊",
  status: "変化"
};

const V6_MOVE_FLAG_LABELS = {
  contact: "接触",
  sound: "音",
  wind: "風",
  slicing: "斬る",
  bite: "かみつき",
  bullet: "弾",
  pulse: "波動",
  powder: "粉",
  dance: "踊り",
  highCrit: "急所率↑",
  priority: "優先度",
  pivot: "交代技",
  protect: "まもる系",
  protectLike: "防御系",
  multiHit: "連続技",
  recharge: "反動で次ターン行動不可",
  twoTurn: "2ターン技",
  twoTurnWeather: "天候付き2ターン技"
};

function v6EnsureFieldState() {
  if (!fieldState.v6) {
    fieldState.v6 = {
      terrain: { type: null, turns: 0 },
      gravity: 0,
      magicRoom: 0,
      wonderRoom: 0,
      sides: {
        player: {
          reflect: 0,
          lightScreen: 0,
          mist: 0,
          safeguard: 0,
          quickGuard: false,
          stealthRock: false,
          spikes: 0,
          wish: null,
          futureSight: null
        },
        enemy: {
          reflect: 0,
          lightScreen: 0,
          mist: 0,
          safeguard: 0,
          quickGuard: false,
          stealthRock: false,
          spikes: 0,
          wish: null,
          futureSight: null
        }
      }
    };
  }
  return fieldState.v6;
}

function v6GetSideState(side) {
  return v6EnsureFieldState().sides[side];
}

function v6ItemIsActive(pokemon) {
  if (!pokemon || pokemon.itemConsumed || pokemon.item.id === "none") return false;
  return v6EnsureFieldState().magicRoom <= 0;
}

// タイプ半減きのみ。ホズのみ以外は「こうかばつぐん」の該当タイプ技にのみ発動する。
const V6_RESIST_BERRIES = {
  "occa-berry": "ほのお", "passho-berry": "みず", "wacan-berry": "でんき",
  "rindo-berry": "くさ", "yache-berry": "こおり", "chople-berry": "かくとう",
  "kebia-berry": "どく", "shuca-berry": "じめん", "coba-berry": "ひこう",
  "payapa-berry": "エスパー", "tanga-berry": "むし", "charti-berry": "いわ",
  "kasib-berry": "ゴースト", "haban-berry": "ドラゴン", "colbur-berry": "あく",
  "babiri-berry": "はがね", "roseli-berry": "フェアリー", "chilan-berry": "ノーマル"
};

function v6CanTriggerResistBerry(defender, move, effectiveness) {
  if (!v6ItemIsActive(defender) || !move || move.category === "status") return false;
  const berryType = V6_RESIST_BERRIES[defender.item.id];
  if (!berryType || berryType !== move.type) return false;
  if (defender.item.id === "chilan-berry") return effectiveness > 0;
  return effectiveness > 1;
}

function v6TryResistBerry(defender, move, effectiveness, logs = null) {
  if (!v6CanTriggerResistBerry(defender, move, effectiveness)) return false;
  defender.itemConsumed = true;
  if (logs) logs.push(`${defender.name}は ${defender.item.name}で ${move.type}技のダメージを弱めた！`);
  return true;
}

function v6IsGrounded(pokemon) {
  const v6 = v6EnsureFieldState();
  if (v6.gravity > 0) return true;
  if (pokemon.smackDown) return true;
  if ((pokemon.magnetRiseTurns || 0) > 0) return false;
  if (pokemon.types.includes("ひこう")) return false;
  if (pokemon.ability.id === "levitate") return false;
  if (v6ItemIsActive(pokemon) && pokemon.item.id === "air-balloon") return false;
  return true;
}

function v6GetMoveById(moveId) {
  return MOVE_DEX[moveId] || null;
}

function v6GetMoveDescription(move) {
  if (!move) return "技データが見つかりません。";
  if (move.description) return move.description;

  const parts = [];
  if (move.selfStatChanges) {
    const list = Object.entries(move.selfStatChanges).map(([stat, amount]) => `${STAT_JP[stat] || stat}${amount > 0 ? "+" : ""}${amount}`);
    parts.push(`自分の能力変化：${list.join(" / ")}`);
  }
  if (move.targetStatChanges) {
    const list = Object.entries(move.targetStatChanges).map(([stat, amount]) => `${STAT_JP[stat] || stat}${amount > 0 ? "+" : ""}${amount}`);
    parts.push(`相手の能力変化：${list.join(" / ")}`);
  }
  if (move.secondaryStatus) parts.push(`${move.secondaryStatus.chance}%で${STATUS_NAMES[move.secondaryStatus.status] || move.secondaryStatus.status}`);
  if (move.recoilRatio) parts.push(`与えたダメージの約${Math.round(move.recoilRatio * 100)}%を反動で受ける`);
  if (move.recoilMaxHPRatio) parts.push(`最大HPの${move.recoilMaxHPRatio === 0.5 ? "1/2" : Math.round(move.recoilMaxHPRatio * 100) + "%"}を反動で失う`);
  if (move.recharge) parts.push("使用後、次のターンは反動で行動できない");
  if (move.drainRatio) parts.push(`与えたダメージの${Math.round(move.drainRatio * 100)}%を回復する`);
  if (move.healRatio) parts.push(`最大HPの${Math.round(move.healRatio * 100)}%を回復する`);
  if (move.weather) parts.push(`${WEATHER_NAMES[move.weather]}にする`);
  if (move.terrain) parts.push(`${V6_TERRAIN_NAMES[move.terrain] || move.terrain}にする`);
  if (move.tailwind) parts.push("味方の場をおいかぜ状態にする");
  if (move.trickRoom) parts.push("トリックルームを展開／解除する");
  if (!parts.length && move.category !== "status") parts.push("追加効果なし");
  if (!parts.length) parts.push("変化技");
  return parts.join("。") + "。";
}

function v6MoveTags(move) {
  const tags = [];
  ["contact", "sound", "wind", "slicing", "bite", "bullet", "pulse", "powder", "dance", "highCrit", "pivot", "recharge", "twoTurn", "twoTurnWeather"].forEach(key => {
    if (move[key]) tags.push(V6_MOVE_FLAG_LABELS[key]);
  });
  if (move.priority) tags.push(`優先度 ${move.priority > 0 ? "+" : ""}${move.priority}`);
  if (move.multiHit) tags.push(`${move.multiHit[0]}～${move.multiHit[1]}回`);
  if (move.struggle) tags.push("わるあがき");
  if (moveHasSheerForceEffect(move)) tags.push("ちからずく対象");
  return tags;
}

function showMoveDetail(moveId) {
  const move = v6GetMoveById(moveId);
  if (!move) return;
  const modal = document.getElementById("move-detail-modal");
  const title = document.getElementById("move-detail-title");
  const body = document.getElementById("move-detail-body");
  if (!modal || !title || !body) return;

  title.textContent = move.name;
  const power = move.power === null || move.power === undefined ? "-" : move.power;
  const accuracy = move.accuracy === null || move.accuracy === undefined ? "-" : move.accuracy;
  const pp = move.maxPP ?? "-";
  const priority = move.priority ?? 0;
  const tags = v6MoveTags(move);

  body.innerHTML = `
    <div class="move-detail-spec-grid">
      <div class="move-detail-spec">タイプ<strong>${move.type}</strong></div>
      <div class="move-detail-spec">分類<strong>${V6_CATEGORY_NAMES[move.category] || move.category}</strong></div>
      <div class="move-detail-spec">威力<strong>${power}</strong></div>
      <div class="move-detail-spec">命中<strong>${accuracy}</strong></div>
      <div class="move-detail-spec">PP<strong>${pp}</strong></div>
    </div>
    <div class="move-detail-spec-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
      <div class="move-detail-spec">優先度<strong>${priority > 0 ? "+" : ""}${priority}</strong></div>
      <div class="move-detail-spec">対象<strong>${move.category === "status" ? "技効果による" : "相手1体"}</strong></div>
    </div>
    <div class="move-detail-description">${v6GetMoveDescription(move)}</div>
    ${tags.length ? `<div class="move-detail-tags">${tags.map(t => `<span class="move-detail-tag">${t}</span>`).join("")}</div>` : ""}
  `;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

window.showMoveDetail = showMoveDetail;

function v6CloseMoveDetail() {
  const modal = document.getElementById("move-detail-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

const v6CloseButton = document.getElementById("move-detail-close");
if (v6CloseButton) v6CloseButton.addEventListener("click", v6CloseMoveDetail);
document.querySelectorAll("[data-close-move-modal]").forEach(el => el.addEventListener("click", v6CloseMoveDetail));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") v6CloseMoveDetail();
});

// ============================================================
// UI拡張
// ============================================================

const V52_renderBuilder = renderBuilder;
renderBuilder = function() {
  V52_renderBuilder();
  document.querySelectorAll('select[data-role="move"]').forEach(select => {
    if (select.closest(".builder-move-detail-row")) return;
    const row = document.createElement("div");
    row.className = "builder-move-detail-row";
    select.parentNode.insertBefore(row, select);
    row.appendChild(select);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inline-move-detail-button";
    button.textContent = "詳細";
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      showMoveDetail(select.value);
    });
    row.appendChild(button);
  });
};

setSummaryHtml = function(set, index) {
  const species = SPECIES_DEX[set.speciesId];
  const ability = species.abilities.find(a => a.id === set.abilityId)?.name || "-";
  const item = ITEM_DEX[set.itemId]?.name || "なし";
  const stats = calculateSetStats(set);
  const statHtml = Object.keys(STAT_LABELS).map(stat => `
    <div class="v6-preview-stat"><span>${STAT_LABELS[stat]}</span><strong>${stats[stat]}</strong></div>
  `).join("");
  const moveHtml = set.moves.map(id => {
    const move = MOVE_DEX[id];
    if (!move) return "";
    return `<button type="button" class="move-detail-chip" data-v6-move-detail="${id}">${move.name}<br><span style="font-weight:500;opacity:.7;">${move.type}/${getCategoryText(move.category)}</span></button>`;
  }).join("");

  return `
    <div class="v6-preview-top">
      <div>
        <div class="preview-name">${species.name}</div>
        <div class="v6-preview-types">${species.types.join(" / ")}</div>
      </div>
      <div style="font-size:11px;color:#728087;">No.${species.dexNo ?? "-"}</div>
    </div>
    <div class="v6-preview-meta-line">特性：<strong>${ability}</strong></div>
    <div class="v6-preview-meta-line">持ち物：<strong>${item}</strong></div>
    <div class="v6-preview-meta-line">性格：<strong>${set.nature}</strong>（${getNatureDescription(set.nature)}）</div>
    <div class="v6-preview-stat-grid">${statHtml}</div>
    <div class="v6-preview-moves">${moveHtml}</div>
  `;
};

const V52_renderSelection = renderSelection;
renderSelection = function() {
  V52_renderSelection();
  document.querySelectorAll(".preview-card").forEach(card => card.classList.add("v6-preview-card"));
};

if (selectionScreen) {
  selectionScreen.addEventListener("click", event => {
    const button = event.target.closest("[data-v6-move-detail]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showMoveDetail(button.dataset.v6MoveDetail);
  }, true);
}

// ============================================================
// ポケモンインスタンス拡張
// ============================================================

const V52_createPokemon = createPokemon;
createPokemon = function(set, rosterIndex = 0) {
  const pokemon = V52_createPokemon(set, rosterIndex);
  const species = SPECIES_DEX[set.speciesId];
  pokemon.weight = species.weight ?? 50;
  pokemon.height = species.height ?? 1;
  pokemon.confusionTurns = 0;
  pokemon.flinched = false;
  pokemon.hasActedThisTurn = false;
  pokemon.tauntTurns = 0;
  pokemon.encoreTurns = 0;
  pokemon.encoreMoveId = null;
  pokemon.disableTurns = 0;
  pokemon.disabledMoveId = null;
  pokemon.substituteHP = 0;
  pokemon.rechargeNext = false;
  pokemon.chargingMoveId = null;
  pokemon.chargingKind = null;
  pokemon.chargeBoostApplied = false;
  pokemon.aquaRing = false;
  pokemon.magnetRiseTurns = 0;
  pokemon.stockpileCount = 0;
  pokemon.focusEnergy = 0;
  pokemon.boundTurns = 0;
  pokemon.boundSourceSide = null;
  pokemon.boundEnhanced = false;
  pokemon.cursed = false;
  pokemon.yawnTurns = 0;
  pokemon.destinyBond = false;
  pokemon.endureThisTurn = false;
  pokemon.tookDamageThisTurn = false;
  pokemon.lastDamageAmount = 0;
  pokemon.lastDamageCategory = null;
  pokemon.lastMoveFailed = false;
  pokemon.lastMoveName = null;
  pokemon.furyCutterCount = 0;
  pokemon.rolloutCount = 0;
  pokemon.rampageMoveId = null;
  pokemon.rampageTurns = 0;
  pokemon.turnsOnField = 0;
  pokemon.smackDown = false;
  pokemon.imprison = false;
  pokemon.chargeElectric = false;
  pokemon.usedWhiteHerb = false;
  pokemon.usedMentalHerb = false;
  pokemon.usedRoomService = false;
  pokemon.usedTerrainSeed = false;
  return pokemon;
};

function v6ClearVolatile(pokemon) {
  pokemon.confusionTurns = 0;
  pokemon.flinched = false;
  pokemon.hasActedThisTurn = false;
  pokemon.tauntTurns = 0;
  pokemon.encoreTurns = 0;
  pokemon.encoreMoveId = null;
  pokemon.disableTurns = 0;
  pokemon.disabledMoveId = null;
  pokemon.substituteHP = 0;
  pokemon.chargingMoveId = null;
  pokemon.chargingKind = null;
  pokemon.chargeBoostApplied = false;
  pokemon.aquaRing = false;
  pokemon.magnetRiseTurns = 0;
  pokemon.stockpileCount = 0;
  pokemon.focusEnergy = 0;
  pokemon.boundTurns = 0;
  pokemon.boundSourceSide = null;
  pokemon.boundEnhanced = false;
  pokemon.cursed = false;
  pokemon.yawnTurns = 0;
  pokemon.destinyBond = false;
  pokemon.endureThisTurn = false;
  pokemon.smackDown = false;
  pokemon.imprison = false;
  pokemon.chargeElectric = false;
  pokemon.furyCutterCount = 0;
  pokemon.rolloutCount = 0;
  pokemon.rampageMoveId = null;
  pokemon.rampageTurns = 0;
  pokemon.turnsOnField = 0;
}

const V52_resetOnSwitch = resetOnSwitch;
resetOnSwitch = function(pokemon) {
  V52_resetOnSwitch(pokemon);
  v6ClearVolatile(pokemon);
};

// ============================================================
// 技選択制限
// ============================================================

const V52_isTrappedByOpponent = isTrappedByOpponent;
isTrappedByOpponent = function(pokemon, foe) {
  if (v6ItemIsActive(pokemon) && pokemon.item.id === "shed-shell") return false;
  if ((pokemon.boundTurns || 0) > 0 || pokemon.trappedByMove) return true;
  return V52_isTrappedByOpponent(pokemon, foe);
};

function v6MoveBlockedByVolatile(pokemon, move) {
  if (pokemon.tauntTurns > 0 && move.category === "status") return true;
  if (pokemon.encoreTurns > 0 && pokemon.encoreMoveId && move.id !== pokemon.encoreMoveId) return true;
  if (pokemon.disableTurns > 0 && pokemon.disabledMoveId === move.id) return true;
  const foe = pokemon.side ? getActivePokemonBySide(getOpponentSide(pokemon.side)) : null;
  if (foe?.imprison && foe.moves.some(m => m.id === move.id)) return true;
  return false;
}

const V52_isMoveAllowedByItem = isMoveAllowedByItem;
isMoveAllowedByItem = function(pokemon, move) {
  if (v6MoveBlockedByVolatile(pokemon, move)) return false;
  if (!v6ItemIsActive(pokemon)) return true;
  return V52_isMoveAllowedByItem(pokemon, move);
};

const V52_isChoiceItem = isChoiceItem;
isChoiceItem = function(pokemon) {
  if (!v6ItemIsActive(pokemon)) return false;
  return V52_isChoiceItem(pokemon);
};

// ============================================================
// 場の状態
// ============================================================

function v6SetTerrain(type, source) {
  const v6 = v6EnsureFieldState();
  let turns = 5;
  if (source && v6ItemIsActive(source) && source.item.id === "terrain-extender") turns = 8;
  v6.terrain = { type, turns };
  addLog(`${V6_TERRAIN_NAMES[type]}になった！`, "log-system");
  v6TryTerrainItems();
}

function v6SetScreen(side, screen, source) {
  const state = v6GetSideState(side);
  let turns = 5;
  if (source && v6ItemIsActive(source) && source.item.id === "light-clay") turns = 8;
  state[screen] = turns;
  const label = screen === "reflect" ? "リフレクター" : "ひかりのかべ";
  addLog(`${side === "player" ? "自分" : "相手"}の場に ${label}が張られた！`, "log-system");
}

function v6TryTerrainItems() {
  const terrain = v6EnsureFieldState().terrain.type;
  if (!terrain) return;
  [getPlayerPokemon(), getEnemyPokemon()].filter(Boolean).forEach(pokemon => {
    if (!v6ItemIsActive(pokemon) || pokemon.usedTerrainSeed || !pokemon.item.terrainSeed) return;
    if (pokemon.item.terrainSeed !== terrain || !v6IsGrounded(pokemon)) return;
    pokemon.usedTerrainSeed = true;
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}の ${pokemon.item.name}が発動！`, "log-system");
    addLog(changeStage(pokemon, pokemon.item.seedStat, 1, pokemon));
  });
}

function v6TryRoomService() {
  if (fieldState.trickRoom <= 0) return;
  [getPlayerPokemon(), getEnemyPokemon()].filter(Boolean).forEach(pokemon => {
    if (!v6ItemIsActive(pokemon) || pokemon.item.id !== "room-service" || pokemon.usedRoomService) return;
    pokemon.usedRoomService = true;
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}の ルームサービスが発動！`, "log-system");
    addLog(changeStage(pokemon, "speed", -1, pokemon));
  });
}

const V52_toggleTrickRoom = toggleTrickRoom;
toggleTrickRoom = function() {
  V52_toggleTrickRoom();
  v6TryRoomService();
};

// ============================================================
// 能力・命中・タイプ・ダメージ拡張
// ============================================================

const V52_getModifiedStat = getModifiedStat;
getModifiedStat = function(pokemon, statName) {
  let value = V52_getModifiedStat(pokemon, statName);
  if (statName === "speed" && v6ItemIsActive(pokemon) && pokemon.item.id === "choice-scarf") value = Math.floor(value * 1.5);
  if (statName === "speed" && fieldState.tailwind?.[pokemon.side] > 0) value *= 2;
  return Math.max(1, Math.floor(value));
};

function v6GetDefenseStat(pokemon, special, critical, ignoreStages) {
  const v6 = v6EnsureFieldState();
  let statName = special ? "specialDefense" : "defense";
  if (v6.wonderRoom > 0) statName = special ? "defense" : "specialDefense";
  if (ignoreStages) return Math.max(1, pokemon[statName]);
  return getDamageStatV5(pokemon, statName, false, critical);
}

function v6GetWeightPower(weight) {
  if (weight < 10) return 20;
  if (weight < 25) return 40;
  if (weight < 50) return 60;
  if (weight < 100) return 80;
  if (weight < 200) return 100;
  return 120;
}

function v6DynamicPower(attacker, defender, move) {
  let power = move.power;
  if (move.weightPower) power = v6GetWeightPower(defender.weight || 50);
  if (move.weightRatioPower) {
    const ratio = (attacker.weight || 50) / Math.max(0.1, defender.weight || 50);
    power = ratio >= 5 ? 120 : ratio >= 4 ? 100 : ratio >= 3 ? 80 : ratio >= 2 ? 60 : 40;
  }
  if (move.gyroBall) power = Math.min(150, Math.floor(25 * getModifiedStat(defender, "speed") / Math.max(1, getModifiedStat(attacker, "speed"))) + 1);
  if (move.hardPress) power = Math.max(1, Math.floor(100 * defender.hp / defender.maxHP));
  if (move.storedPower) {
    const positive = Object.values(attacker.stages).reduce((sum, stage) => sum + Math.max(0, stage), 0);
    power = 20 + positive * 20;
  }
  if (move.reversal) {
    const ratio = attacker.hp / attacker.maxHP;
    power = ratio <= 1/48 ? 200 : ratio <= 1/5 ? 150 : ratio <= 1/4 ? 100 : ratio <= 1/3 ? 80 : ratio <= 1/2 ? 40 : 20;
  }
  if (move.doubleIfTargetStatus && defender.status) power *= 2;
  if (move.doubleIfUserStatus && attacker.status) power *= 2;
  if (move.doubleIfDamagedThisTurn && attacker.tookDamageThisTurn) power *= 2;
  if (move.doubleIfLastMoveFailed && attacker.lastMoveFailed) power *= 2;
  if (move.doubleIfNoItem && (!v6ItemIsActive(attacker) || attacker.item.id === "none")) power *= 2;
  if (move.risingVoltage && v6EnsureFieldState().terrain.type === "electric" && v6IsGrounded(defender)) power *= 2;
  if (move.boostInMisty && v6EnsureFieldState().terrain.type === "misty") power *= move.boostInMisty;
  if (move.furyCutter) power = Math.min(160, (move.power || 40) * Math.pow(2, Math.max(0, attacker.furyCutterCount || 0)));
  if (move.rollout) power = Math.min(480, (move.power || 30) * Math.pow(2, Math.max(0, attacker.rolloutCount || 0)));
  return Math.max(1, power || 1);
}

const V52_getTypeEffectivenessV5 = getTypeEffectivenessV5;
getTypeEffectivenessV5 = function(attacker, defender, move) {
  const effectiveMove = getEffectiveMove(attacker, move);
  let multiplier = 1;
  defender.types.forEach(type => {
    let part = TYPE_CHART[effectiveMove.type]?.[type];
    if (part === undefined) part = 1;
    if (effectiveMove.freezeDry && type === "みず") part = 2;
    if (part === 0 && type === "ゴースト" && attacker.ability.id === "scrappy" && ["ノーマル", "かくとう"].includes(effectiveMove.type)) part = 1;
    multiplier *= part;
  });
  return multiplier;
};

const V52_checkAccuracy = checkAccuracy;
checkAccuracy = function(move, attacker, defender) {
  const v6 = v6EnsureFieldState();
  if (move.accuracy === null) return true;
  if (move.alwaysHitInSnow && weather.type === "snow") return true;
  if (v6.gravity > 0) {
    let accuracy = move.accuracy * (5 / 3);
    if (attacker.ability.id === "compound-eyes") accuracy *= 1.3;
    return Math.random() * 100 < accuracy * (getAccuracyMultiplier(attacker.stages.accuracy) / getAccuracyMultiplier(defender.stages.evasion));
  }
  return V52_checkAccuracy(move, attacker, defender);
};

const V52_isCriticalHit = isCriticalHit;
isCriticalHit = function(move = null) {
  const attacker = window.__v6CurrentAttacker || null;
  const bonus = attacker?.focusEnergy || 0;
  if (bonus >= 2 || move?.highCrit) return Math.random() < (bonus >= 2 && move?.highCrit ? 1/2 : 1/8);
  return V52_isCriticalHit(move);
};

const V52_getItemDamageMultiplier = getItemDamageMultiplier;
getItemDamageMultiplier = function(attacker, move, effectiveness, defender) {
  if (!v6ItemIsActive(attacker)) return 1;
  return V52_getItemDamageMultiplier(attacker, move, effectiveness, defender);
};

calculateDamage = function(attacker, defender, originalMove, options = {}) {
  if (originalMove.category === "status") return { damage: 0, critical: false, effectiveness: 1, move: originalMove };
  const move = getEffectiveMove(attacker, originalMove);
  const effectiveness = getTypeEffectivenessV5(attacker, defender, move);
  if (effectiveness === 0) return { damage: 0, critical: false, effectiveness: 0, move };

  window.__v6CurrentAttacker = attacker;
  const critical = options.forceCritical ?? isCriticalHit(move);
  window.__v6CurrentAttacker = null;

  let attackStat;
  let defenseStat;
  if (move.category === "physical") {
    attackStat = move.useDefenseAsAttack ? getDamageStatV5(attacker, "defense", true, critical) : getDamageStatV5(attacker, "attack", true, critical);
    defenseStat = v6GetDefenseStat(defender, false, critical, move.ignoreDefenderStages);
    if (weather.type === "snow" && defender.types.includes("こおり")) defenseStat = Math.floor(defenseStat * 1.5);
  } else {
    attackStat = getDamageStatV5(attacker, "specialAttack", true, critical);
    defenseStat = v6GetDefenseStat(defender, !move.usePhysicalDefense, critical, move.ignoreDefenderStages);
    if (!move.usePhysicalDefense && weather.type === "sand" && defender.types.includes("いわ")) defenseStat = Math.floor(defenseStat * 1.5);
  }

  let power = v6DynamicPower(attacker, defender, move);
  let damage = Math.floor((((2 * LEVEL / 5 + 2) * power * attackStat / Math.max(1, defenseStat)) / 50) + 2);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const random = options.randomFactor ?? (0.85 + Math.random() * 0.15);
  const burnMultiplier = (attacker.status === "burn" && move.category === "physical" && !move.ignoreBurnAttackDrop) ? 0.5 : 1;

  let fieldMultiplier = 1;
  const v6 = v6EnsureFieldState();
  if (v6.terrain.type === "electric" && move.type === "でんき" && v6IsGrounded(attacker)) fieldMultiplier *= 1.3;
  if (v6.terrain.type === "grassy" && move.type === "くさ" && v6IsGrounded(attacker)) fieldMultiplier *= 1.3;
  if (v6.terrain.type === "psychic" && move.type === "エスパー" && v6IsGrounded(attacker)) fieldMultiplier *= 1.3;
  if (v6.terrain.type === "misty" && move.type === "ドラゴン" && v6IsGrounded(defender)) fieldMultiplier *= 0.5;
  if (v6.terrain.type === "grassy" && ["earthquake", "bulldoze", "magnitude"].includes(move.id) && v6IsGrounded(defender)) fieldMultiplier *= 0.5;

  let screenMultiplier = 1;
  const defenderSide = defender.side ? v6GetSideState(defender.side) : null;
  if (!critical && defenderSide) {
    if (move.category === "physical" && defenderSide.reflect > 0) screenMultiplier *= 0.5;
    if (move.category === "special" && defenderSide.lightScreen > 0) screenMultiplier *= 0.5;
  }

  damage = Math.floor(
    damage * stab * effectiveness * random * getWeatherDamageMultiplier(move.type) *
    getAbilityDamageMultiplier(attacker, move) * getDefensiveAbilityMultiplier(defender, move) *
    getItemDamageMultiplier(attacker, move, effectiveness, defender) * (critical ? 1.5 : 1) *
    burnMultiplier * fieldMultiplier * screenMultiplier
  );

  if (attacker.chargeElectric && move.type === "でんき") {
    damage *= 2;
    attacker.chargeElectric = false;
  }

  return { damage: Math.max(1, Math.floor(damage)), critical, effectiveness, move };
};

// ============================================================
// 状態異常・行動不能
// ============================================================

const V52_canReceiveStatus = canReceiveStatus;
canReceiveStatus = function(pokemon, status) {
  const v6 = v6EnsureFieldState();
  if (v6.terrain.type === "electric" && status === "sleep" && v6IsGrounded(pokemon)) return false;
  if (v6.terrain.type === "misty" && v6IsGrounded(pokemon)) return false;
  const side = pokemon.side ? v6GetSideState(pokemon.side) : null;
  if (side?.safeguard > 0) return false;
  return V52_canReceiveStatus(pokemon, status);
};

const V52_canPokemonAct = canPokemonAct;
canPokemonAct = function(pokemon) {
  if (pokemon.flinched) {
    pokemon.flinched = false;
    return { canAct: false, text: `${pokemon.name}は ひるんで 動けない！` };
  }
  if (pokemon.rechargeNext) {
    pokemon.rechargeNext = false;
    return { canAct: false, text: `${pokemon.name}は 反動で 動けない！` };
  }
  if (pokemon.confusionTurns > 0) {
    pokemon.confusionTurns--;
    if (pokemon.confusionTurns <= 0) return { canAct: true, text: `${pokemon.name}の こんらんが とけた！` };
    if (Math.random() < 1 / 3) {
      const defense = Math.max(1, getModifiedStat(pokemon, "defense"));
      const attack = Math.max(1, getModifiedStat(pokemon, "attack"));
      const damage = Math.max(1, Math.floor(((((2 * LEVEL / 5 + 2) * 40 * attack / defense) / 50) + 2)));
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      return { canAct: false, text: `${pokemon.name}は わけもわからず 自分を攻撃した！ ${damage} ダメージ！` };
    }
  }
  return V52_canPokemonAct(pokemon);
};

function v6Confuse(pokemon) {
  if (pokemon.confusionTurns > 0) return `${pokemon.name}は すでにこんらんしている！`;
  pokemon.confusionTurns = Math.floor(Math.random() * 4) + 2;
  return `${pokemon.name}は こんらんした！`;
}

// ============================================================
// 技の特殊効果ヘルパー
// ============================================================

function v6StatusMoveTargetsOpponent(move) {
  return statusMoveTargetsOpponent(move) || Boolean(
    move.confuse || move.tauntTurns || move.encoreTurns || move.disableTurns || move.forceSwitch ||
    move.trapTarget || move.setAbility || move.setTypes || move.healTargetRatio || move.spitUp || move.swallow
  );
}

function v6GetSelectedOpponentMove(attacker) {
  if (!window.__v6SelectedMoves || !attacker.side) return null;
  return window.__v6SelectedMoves[getOpponentSide(attacker.side)] || null;
}

function v6ConsumeMentalHerb(pokemon) {
  if (!v6ItemIsActive(pokemon) || pokemon.item.id !== "mental-herb" || pokemon.usedMentalHerb) return false;
  if (!(pokemon.tauntTurns > 0 || pokemon.encoreTurns > 0 || pokemon.disableTurns > 0)) return false;
  pokemon.tauntTurns = 0;
  pokemon.encoreTurns = 0;
  pokemon.encoreMoveId = null;
  pokemon.disableTurns = 0;
  pokemon.disabledMoveId = null;
  pokemon.usedMentalHerb = true;
  pokemon.itemConsumed = true;
  addLog(`${pokemon.name}は メンタルハーブで 技の制限を治した！`, "log-system");
  return true;
}

function v6TryWhiteHerb(pokemon) {
  if (!v6ItemIsActive(pokemon) || pokemon.item.id !== "white-herb" || pokemon.usedWhiteHerb) return false;
  const negatives = Object.keys(pokemon.stages).filter(stat => pokemon.stages[stat] < 0);
  if (!negatives.length) return false;
  negatives.forEach(stat => pokemon.stages[stat] = 0);
  pokemon.usedWhiteHerb = true;
  pokemon.itemConsumed = true;
  addLog(`${pokemon.name}は しろいハーブで 下がった能力を元に戻した！`, "log-system");
  return true;
}

function v6ResolveMultiHitCount(attacker, move) {
  if (!move.multiHit) return 1;
  const [min, max] = move.multiHit;
  if (min === max) return min;
  if (v6ItemIsActive(attacker) && attacker.item.id === "loaded-dice" && min === 2 && max === 5) return Math.random() < 0.5 ? 4 : 5;
  const r = Math.random();
  if (min === 2 && max === 5) return r < 0.35 ? 2 : r < 0.70 ? 3 : r < 0.85 ? 4 : 5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function v6UsePowerHerb(attacker, move) {
  if (!v6ItemIsActive(attacker) || attacker.item.id !== "power-herb") return false;
  if (!(move.twoTurn || move.twoTurnWeather)) return false;
  attacker.itemConsumed = true;
  return true;
}

function v6ApplyHazard(side, hazard, logs) {
  const state = v6GetSideState(side);
  if (hazard === "stealthRock") {
    if (state.stealthRock) logs.push("しかし すでにステルスロックがある！");
    else { state.stealthRock = true; logs.push(`${side === "player" ? "自分" : "相手"}の場に ステルスロックをまいた！`); }
  }
  if (hazard === "spikes") {
    if (state.spikes >= 3) logs.push("まきびしは これ以上重ねられない！");
    else { state.spikes++; logs.push(`${side === "player" ? "自分" : "相手"}の場に まきびしをまいた！（${state.spikes}段）`); }
  }
}

function v6ClearHazardsAndScreens() {
  ["player", "enemy"].forEach(side => {
    const s = v6GetSideState(side);
    s.stealthRock = false; s.spikes = 0; s.reflect = 0; s.lightScreen = 0;
  });
  v6EnsureFieldState().terrain = { type: null, turns: 0 };
}

function v6EntryHazards(pokemon) {
  if (!pokemon?.side || pokemon.hp <= 0) return;
  if (v6ItemIsActive(pokemon) && pokemon.item.id === "heavy-duty-boots") return;
  const state = v6GetSideState(pokemon.side);
  if (state.stealthRock) {
    const eff = getTypeEffectiveness("いわ", pokemon.types);
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8 * eff));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は ステルスロックで ${damage} ダメージ！`, "log-status");
  }
  if (pokemon.hp > 0 && state.spikes > 0 && v6IsGrounded(pokemon)) {
    const denom = state.spikes === 1 ? 8 : state.spikes === 2 ? 6 : 4;
    const damage = Math.max(1, Math.floor(pokemon.maxHP / denom));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は まきびしで ${damage} ダメージ！`, "log-status");
  }
}

// ============================================================
// 交代時処理
// ============================================================

const V52_activateEntryAbility = activateEntryAbility;
activateEntryAbility = function(pokemon) {
  v6EnsureFieldState();
  V52_activateEntryAbility(pokemon);
  v6EntryHazards(pokemon);
  if (pokemon.hp <= 0) return;
  v6TryTerrainItems();
  v6TryRoomService();
};

// ============================================================
// v6.2 ちからずく / 固定反動 共通処理
// ============================================================

// Championsの「ちからずく」対象判定。
// 対象：攻撃技の、自分に有利な追加効果（100%発動を含む）。
// 非対象：自分の能力低下、反動、交代、吸収、急所率、持ち物操作など。
moveHasSheerForceEffect = function(move) {
  if (!move || move.category === "status") return false;

  if (move.sheerForceEligible === true) return true;
  if (move.sheerForceEligible === false) return false;

  if (move.secondaryStatus) return true;
  if (move.targetStatChangeChance) return true;
  if (move.selfStatChangeChance && (move.selfStatChangeChance.amount ?? 0) > 0) return true;
  if (move.flinchChance) return true;
  if (move.confuseChance) return true;
  if (move.confuseIfTargetRaised) return true;
  if (move.allStatBoostChance) return true;

  // 100%で発動する能力変化も「追加効果」に含まれる。
  if (move.targetStatChanges && Object.values(move.targetStatChanges).some(amount => amount < 0)) return true;
  if (move.selfStatChanges && Object.values(move.selfStatChanges).some(amount => amount > 0)) return true;

  return false;
};

function v62ApplyGuaranteedStatChanges(attacker, defender, move, sheerForceActive, logs, hitSubstitute = false) {
  if (move.targetStatChanges && defender.hp > 0 && !hitSubstitute) {
    const changes = {};
    for (const [stat, amount] of Object.entries(move.targetStatChanges)) {
      // ちからずく対象時は「相手を下げる」追加効果だけ消す。
      if (sheerForceActive && amount < 0) continue;
      changes[stat] = amount;
    }
    if (Object.keys(changes).length) logs.push(...applyStatChanges(defender, changes, attacker));
  }

  if (move.selfStatChanges) {
    const changes = {};
    for (const [stat, amount] of Object.entries(move.selfStatChanges)) {
      // ちからずく対象時は「自分を上げる」追加効果だけ消す。
      // オーバーヒート等の自己能力低下は反動扱いなので残す。
      if (sheerForceActive && amount > 0) continue;
      changes[stat] = amount;
    }
    if (Object.keys(changes).length) logs.push(...applyStatChanges(attacker, changes, attacker));
  }
}

function v62ApplyMaxHPRecoil(attacker, move, logs) {
  if (!move?.recoilMaxHPRatio || attacker.hp <= 0) return;
  // てっていこうせん系は最大HP基準・端数切り上げ。
  // マジックガードが将来追加された場合は反動を無効化する。
  if (attacker.ability?.id === "magic-guard") return;
  const recoil = Math.max(1, Math.ceil(attacker.maxHP * move.recoilMaxHPRatio));
  attacker.hp = Math.max(0, attacker.hp - recoil);
  logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
}

// ============================================================
// useMove v6
// ============================================================

const V52_useMove = useMove;
useMove = function(attacker, defender, originalMove) {
  const move = getEffectiveMove(attacker, originalMove);
  const logs = [];
  attacker.hasActedThisTurn = true;
  attacker.lastMoveFailed = false;

  if (!move.struggle) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    if (!isMoveAllowedByItem(attacker, move)) return [`${attacker.name}は ${move.name}を選べない！`];
  }

  // ため状態の2ターン目はPPをもう一度減らさない
  const isSecondChargeTurn = attacker.chargingMoveId === move.id;
  if (!move.struggle && !isSecondChargeTurn) {
    move.pp--;
    const original = attacker.moves.find(m => m.id === originalMove.id);
    if (original) original.pp = move.pp;
  }

  if (isChoiceItem(attacker) && !attacker.choiceLock && !move.struggle) attacker.choiceLock = move.id;

  if (move.recharge && attacker.rechargeNext) {
    return [`${attacker.name}は 反動で 動けない！`];
  }

  const actionCheck = canPokemonAct(attacker);
  if (actionCheck.text) logs.push(actionCheck.text);
  if (!actionCheck.canAct) { attacker.lastMoveFailed = true; return logs; }

  // ねごと
  if (move.sleepTalk) {
    logs.push(`${attacker.name}の ${move.name}！`);
    if (attacker.status !== "sleep") { logs.push("しかし うまく決まらなかった！"); attacker.lastMoveFailed = true; return logs; }
    const choices = attacker.moves.filter(m => m.id !== move.id && m.id !== "rest" && m.pp > 0);
    if (!choices.length) { logs.push("しかし うまく決まらなかった！"); return logs; }
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    return logs.concat(useMove(attacker, defender, chosen));
  }

  // 先制条件技
  const selectedOpponentMove = v6GetSelectedOpponentMove(attacker);
  if (move.suckerPunch && (!selectedOpponentMove || selectedOpponentMove.category === "status")) {
    logs.push(`${attacker.name}の ${move.name}！`, "しかし うまく決まらなかった！");
    attacker.lastMoveFailed = true; return logs;
  }
  if (move.upperHand && (!selectedOpponentMove || selectedOpponentMove.priority <= 0)) {
    logs.push(`${attacker.name}の ${move.name}！`, "しかし うまく決まらなかった！");
    attacker.lastMoveFailed = true; return logs;
  }
  if (move.firstTurnOnly && attacker.turnsOnField > 0) {
    logs.push(`${attacker.name}の ${move.name}！`, "しかし うまく決まらなかった！");
    attacker.lastMoveFailed = true; return logs;
  }
  if (move.singlesFail) {
    logs.push(`${attacker.name}の ${move.name}！`, "シングルバトルでは うまく決まらなかった！");
    attacker.lastMoveFailed = true; return logs;
  }

  // 2ターン技
  if ((move.twoTurn || move.twoTurnWeather) && !isSecondChargeTurn) {
    const immediateByWeather = (move.twoTurn === "solarBeam" && weather.type === "sun") || (move.twoTurn === "electroShot" && weather.type === "rain");
    const herb = v6UsePowerHerb(attacker, move);
    if (!immediateByWeather && !herb) {
      logs.push(`${attacker.name}の ${move.name}！`);
      if (move.twoTurnWeather) setWeather(move.twoTurnWeather, attacker);
      if (move.chargeBoost) logs.push(...applyStatChanges(attacker, move.chargeBoost, attacker));
      attacker.chargingMoveId = move.id;
      attacker.chargingKind = move.twoTurn || move.twoTurnWeather;
      logs.push(`${attacker.name}は 力をためている！`);
      return logs;
    }
    if (herb) logs.push(`${attacker.name}は パワフルハーブで すぐに攻撃した！`);
    if (move.twoTurnWeather) setWeather(move.twoTurnWeather, attacker);
    if (move.chargeBoost) logs.push(...applyStatChanges(attacker, move.chargeBoost, attacker));
  } else if (isSecondChargeTurn) {
    attacker.chargingMoveId = null;
    attacker.chargingKind = null;
  }

  logs.push(`${attacker.name}の ${move.name}！`);

  // みらいよち：攻撃技だが、その場ではダメージを与えず対象側へ遅延攻撃を予約する。
  // 同じ側に既に予約がある場合は上書きせず失敗する。
  if (move.futureSight) {
    const targetSide = v6GetSideState(defender.side);
    if (targetSide.futureSight) {
      logs.push("しかし すでに みらいよちの攻撃が仕掛けられている！");
      attacker.lastMoveFailed = true;
      attacker.lastMoveId = move.id; attacker.lastMoveName = move.name;
      return logs;
    }
    // 命中判定は予約時ではなく、実際に攻撃が発生するターンに行う。
    targetSide.futureSight = { turns: 3, source: attacker, moveId: move.id };
    logs.push(`${defender.name}側に みらいよちの攻撃を仕掛けた！`);
    attacker.lastMoveId = move.id; attacker.lastMoveName = move.name;
    return logs;
  }

  // 変化技
  if (move.category === "status") {
    if (move.protect || move.protectLike) {
      if (move.endure) {
        attacker.endureThisTurn = true;
        logs.push(`${attacker.name}は こらえる体勢に入った！`);
      } else if (move.quickGuard) {
        v6GetSideState(attacker.side).quickGuard = true;
        logs.push(`${attacker.name}側は 先制技に備えた！`);
      } else logs.push(executeProtect(attacker));
      return logs;
    }
    if (move.accuracy !== null && !checkAccuracy(move, attacker, defender)) { logs.push("しかし うまく決まらなかった！"); attacker.lastMoveFailed = true; return logs; }
    if (move.powder && (defender.types.includes("くさ") || (v6ItemIsActive(defender) && defender.item.id === "safety-goggles"))) { logs.push(`${defender.name}には こな技が効かない！`); return logs; }

    let actualDefender = defender;
    const targetsOpponent = v6StatusMoveTargetsOpponent(move);
    if (targetsOpponent && defender.substituteHP > 0 && !move.sound) { logs.push(`${defender.name}の みがわりが 技を防いだ！`); return logs; }
    if (targetsOpponent && defender.protectThisTurn) { logs.push(`${defender.name}は 攻撃を防いだ！`); return logs; }
    if (targetsOpponent && defender.ability.id === "magic-bounce") { logs.push(`${defender.name}の マジックミラーで はね返した！`); actualDefender = attacker; }

    if (move.weather) {
      const changed = setWeather(move.weather, attacker);
      if (!changed) logs.push("しかし すでに同じ天候なので 残りターンは変わらない！");
    }
    if (move.terrain) v6SetTerrain(move.terrain, attacker);
    if (move.tailwind) setTailwind(attacker.side);
    if (move.trickRoom) toggleTrickRoom();
    if (move.gravity) { v6EnsureFieldState().gravity = 5; logs.push("じゅうりょくが 強くなった！"); }
    if (move.magicRoom) { v6EnsureFieldState().magicRoom = v6EnsureFieldState().magicRoom > 0 ? 0 : 5; logs.push(v6EnsureFieldState().magicRoom ? "マジックルームが 発生した！" : "マジックルームが 解除された！"); }
    if (move.wonderRoom) { v6EnsureFieldState().wonderRoom = v6EnsureFieldState().wonderRoom > 0 ? 0 : 5; logs.push(v6EnsureFieldState().wonderRoom ? "ワンダールームが 発生した！" : "ワンダールームが 解除された！"); }
    if (move.screen) v6SetScreen(attacker.side, move.screen, attacker);
    if (move.mist) { v6GetSideState(attacker.side).mist = 5; logs.push(`${attacker.name}側は しろいきりに包まれた！`); }
    if (move.safeguard) { v6GetSideState(attacker.side).safeguard = 5; logs.push(`${attacker.name}側は しんぴのまもりに包まれた！`); }
    if (move.hazard) v6ApplyHazard(getOpponentSide(attacker.side), move.hazard, logs);
    if (move.removeTerrain) { v6EnsureFieldState().terrain = { type: null, turns: 0 }; logs.push("フィールドの効果が 消えた！"); }
    if (move.defog) { v6ClearHazardsAndScreens(); logs.push("場の設置物・壁・フィールドが 吹き飛ばされた！"); }

    if (move.healRatio) logs.push(executeHealing(attacker, move.healRatio));
    if (move.healByWeather) logs.push(executeHealing(attacker, getSynthesisHealRatio()));
    if (move.healTargetRatio) {
      if (!canRecover(actualDefender)) logs.push(`${actualDefender.name}は 回復できない！`);
      else {
        const before = actualDefender.hp;
        actualDefender.hp = Math.min(actualDefender.maxHP, actualDefender.hp + Math.max(1, Math.floor(actualDefender.maxHP * move.healTargetRatio)));
        logs.push(`${actualDefender.name}は ${actualDefender.hp - before} HP 回復した！`);
      }
    }
    if (move.rest) {
      if (!canRecover(attacker) || attacker.hp === attacker.maxHP) logs.push("しかし うまく決まらなかった！");
      else {
        attacker.hp = attacker.maxHP; attacker.status = "sleep"; attacker.statusTurns = 2; attacker.toxicCounter = 0;
        logs.push(`${attacker.name}は 眠って HPと状態異常を回復した！`);
      }
    }
    if (move.substitute) {
      const cost = Math.floor(attacker.maxHP / 4);
      if (attacker.substituteHP > 0 || attacker.hp <= cost) logs.push("しかし みがわりを作れなかった！");
      else { attacker.hp -= cost; attacker.substituteHP = cost; logs.push(`${attacker.name}は HPを削って みがわりを作った！`); }
    }
    if (move.bellyDrum) {
      const cost = Math.floor(attacker.maxHP / 2);
      if (attacker.hp <= cost || attacker.stages.attack >= 6) logs.push("しかし うまく決まらなかった！");
      else { attacker.hp -= cost; attacker.stages.attack = 6; logs.push(`${attacker.name}は HPを削って こうげきを最大まで上げた！`); }
    }
    if (move.growth) {
      const amount = weather.type === "sun" ? 2 : 1;
      logs.push(changeStage(attacker, "attack", amount, attacker)); logs.push(changeStage(attacker, "specialAttack", amount, attacker));
    }
    if (move.haze) {
      [attacker, actualDefender].forEach(p => Object.keys(p.stages).forEach(stat => p.stages[stat] = 0));
      logs.push("すべての能力変化が 元に戻った！");
    }
    if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges, attacker));
    if (move.directStatus) logs.push(inflictStatus(actualDefender, move.directStatus));
    if (move.seedTarget) {
      if (actualDefender.types.includes("くさ")) logs.push(`${actualDefender.name}には やどりぎのタネが効かない！`);
      else if (actualDefender.seeded) logs.push(`${actualDefender.name}には すでにタネが植えつけられている！`);
      else { actualDefender.seeded = true; actualDefender.seededBySide = attacker.side; logs.push(`${actualDefender.name}に やどりぎのタネを植えつけた！`); }
    }
    if (move.targetStatChanges) logs.push(...applyStatChanges(actualDefender, move.targetStatChanges, attacker));
    if (move.confuse) logs.push(v6Confuse(actualDefender));
    if (move.tauntTurns) { actualDefender.tauntTurns = move.tauntTurns; logs.push(`${actualDefender.name}は ちょうはつされた！`); v6ConsumeMentalHerb(actualDefender); }
    if (move.encoreTurns) {
      if (!actualDefender.lastMoveId) logs.push("しかし うまく決まらなかった！");
      else { actualDefender.encoreTurns = move.encoreTurns; actualDefender.encoreMoveId = actualDefender.lastMoveId; logs.push(`${actualDefender.name}は アンコールを受けた！`); v6ConsumeMentalHerb(actualDefender); }
    }
    if (move.disableTurns) {
      if (!actualDefender.lastMoveId) logs.push("しかし うまく決まらなかった！");
      else { actualDefender.disableTurns = move.disableTurns; actualDefender.disabledMoveId = actualDefender.lastMoveId; logs.push(`${actualDefender.name}の ${MOVE_DEX[actualDefender.lastMoveId]?.name || "最後の技"}を かなしばりした！`); v6ConsumeMentalHerb(actualDefender); }
    }
    if (move.spitePP && actualDefender.lastMoveId) {
      const targetMove = actualDefender.moves.find(m => m.id === actualDefender.lastMoveId);
      if (targetMove) { const old = targetMove.pp; targetMove.pp = Math.max(0, targetMove.pp - move.spitePP); logs.push(`${targetMove.name}の PPを ${old - targetMove.pp} 減らした！`); }
    }
    if (move.setAbility) { actualDefender.ability = { id: move.setAbility, name: move.setAbility === "insomnia" ? "ふみん" : move.setAbility, description: "技によって変更された特性" }; logs.push(`${actualDefender.name}の 特性が変化した！`); }
    if (move.setTypes) { actualDefender.types = [...move.setTypes]; logs.push(`${actualDefender.name}は ${move.setTypes.join(" / ")}タイプになった！`); }
    if (move.trapTarget) { actualDefender.trappedByMove = true; logs.push(`${actualDefender.name}は 逃げられなくなった！`); }
    if (move.aquaRing) { attacker.aquaRing = true; logs.push(`${attacker.name}は アクアリングをまとった！`); }
    if (move.magnetRise) { attacker.magnetRiseTurns = 5; logs.push(`${attacker.name}は 電磁力で浮かび上がった！`); }
    if (move.focusEnergy) { attacker.focusEnergy = Math.max(attacker.focusEnergy, 2); logs.push(`${attacker.name}は 急所を狙っている！`); }
    if (move.chargeElectric) { attacker.chargeElectric = true; logs.push(`${attacker.name}は 電気をためた！`); }
    if (move.stockpile) { if (attacker.stockpileCount < 3) { attacker.stockpileCount++; logs.push(changeStage(attacker, "defense", 1, attacker)); logs.push(changeStage(attacker, "specialDefense", 1, attacker)); logs.push(`${attacker.name}は ${attacker.stockpileCount}回 たくわえた！`); } else logs.push("これ以上 たくわえられない！"); }
    if (move.swallow) {
      if (!attacker.stockpileCount) logs.push("しかし うまく決まらなかった！");
      else { const ratio = attacker.stockpileCount === 1 ? 0.25 : attacker.stockpileCount === 2 ? 0.5 : 1; logs.push(executeHealing(attacker, ratio)); attacker.stockpileCount = 0; }
    }
    if (move.painSplit) {
      const average = Math.floor((attacker.hp + actualDefender.hp) / 2);
      attacker.hp = Math.min(attacker.maxHP, average); actualDefender.hp = Math.min(actualDefender.maxHP, average); logs.push("お互いの HPを 分け合った！");
    }
    if (move.wish) { v6GetSideState(attacker.side).wish = { turns: 2, amount: Math.floor(attacker.maxHP / 2) }; logs.push(`${attacker.name}は 願いをかけた！`); }
    if (move.imprison) { attacker.imprison = true; logs.push(`${attacker.name}は 相手の同じ技を ふういんした！`); }
    if (move.recycle) {
      if (attacker.itemConsumed && attacker.item.id !== "none") { attacker.itemConsumed = false; logs.push(`${attacker.name}は ${attacker.item.name}を リサイクルした！`); }
      else logs.push("しかし うまく決まらなかった！");
    }
    if (move.swapItems) {
      const a = attacker.item; attacker.item = actualDefender.item; actualDefender.item = a;
      const ac = attacker.itemConsumed; attacker.itemConsumed = actualDefender.itemConsumed; actualDefender.itemConsumed = ac;
      logs.push(`${attacker.name}と ${actualDefender.name}は 持ち物を入れ替えた！`);
    }
    if (move.curse) {
      if (attacker.types.includes("ゴースト")) {
        if (attacker.hp <= Math.floor(attacker.maxHP / 2)) logs.push("しかし うまく決まらなかった！");
        else { attacker.hp -= Math.floor(attacker.maxHP / 2); actualDefender.cursed = true; logs.push(`${actualDefender.name}は のろわれた！`); }
      } else {
        logs.push(changeStage(attacker, "attack", 1, attacker)); logs.push(changeStage(attacker, "defense", 1, attacker)); logs.push(changeStage(attacker, "speed", -1, attacker));
      }
    }
    if (move.destinyBond) { attacker.destinyBond = true; logs.push(`${attacker.name}は 相手を みちづれにしようとしている！`); }
    if (move.selfFaint) { attacker.hp = 0; logs.push(`${attacker.name}は 力尽きた！`); }
    if (move.forceSwitch && actualDefender.hp > 0) v6ForceSwitch(actualDefender.side, logs);
    if (move.pivot && attacker.hp > 0) autoPivot(attacker.side);
    v6TryWhiteHerb(attacker); v6TryWhiteHerb(actualDefender);
    attacker.lastMoveId = move.id; attacker.lastMoveName = move.name;
    return logs;
  }

  // 攻撃技
  if (defender.protectThisTurn && !move.breakProtect) { logs.push(`${defender.name}は 攻撃を防いだ！`); v62ApplyMaxHPRecoil(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }
  if (move.breakProtect && defender.protectThisTurn) { defender.protectThisTurn = false; logs.push(`${defender.name}の まもるを 打ち破った！`); }
  if (v6GetSideState(defender.side).quickGuard && move.priority > 0) { logs.push("ファストガードで 先制技を防いだ！"); attacker.lastMoveFailed = true; return logs; }
  if (v6EnsureFieldState().terrain.type === "psychic" && move.priority > 0 && v6IsGrounded(defender)) { logs.push("サイコフィールドで 先制技を防いだ！"); attacker.lastMoveFailed = true; return logs; }
  if (move.requiresTargetItem && (!v6ItemIsActive(defender) || defender.item.id === "none")) { logs.push("しかし 相手が持ち物を持っていない！"); attacker.lastMoveFailed = true; return logs; }
  if (move.requiresTerrain && !v6EnsureFieldState().terrain.type) { logs.push("しかし フィールドがないので失敗した！"); attacker.lastMoveFailed = true; return logs; }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) { logs.push(...applyImmunityResult(defender, immunity)); v62ApplyMaxHPRecoil(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }
  if (!checkAccuracy(move, attacker, defender)) { logs.push("しかし こうげきは はずれた！"); v62ApplyMaxHPRecoil(attacker, move, logs); attacker.lastMoveFailed = true; attacker.furyCutterCount = 0; attacker.rolloutCount = 0; return logs; }

  if (move.ohko) {
    if (defender.types.includes("こおり") && move.name === "ぜったいれいど") { logs.push(`${defender.name}には 効かない！`); return logs; }
    defender.lastDamageAmount = defender.hp; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true;
    defender.hp = 0; logs.push("一撃必殺！"); attacker.lastMoveId = move.id; return logs;
  }

  if (move.fixedDamage === "level") {
    const dealt = Math.min(defender.hp, LEVEL); defender.hp -= dealt; defender.lastDamageAmount = dealt; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true;
    logs.push(`${dealt} ダメージ！`); attacker.lastMoveId = move.id; return logs;
  }
  if (move.superFang) {
    const dealt = Math.max(1, Math.floor(defender.hp / 2)); defender.hp = Math.max(0, defender.hp - dealt); defender.lastDamageAmount = dealt; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true;
    logs.push(`${dealt} ダメージ！`); attacker.lastMoveId = move.id; return logs;
  }
  if (move.endeavor) {
    if (defender.hp <= attacker.hp) { logs.push("しかし うまく決まらなかった！"); return logs; }
    const dealt = defender.hp - attacker.hp; defender.hp = attacker.hp; defender.lastDamageAmount = dealt; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true; logs.push(`${dealt} ダメージ！`); return logs;
  }
  if (move.finalGambit) {
    const dealt = Math.min(defender.hp, attacker.hp); defender.hp = Math.max(0, defender.hp - attacker.hp); defender.lastDamageAmount = dealt; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true; attacker.hp = 0; logs.push(`${dealt} ダメージ！ ${attacker.name}は 力尽きた！`); return logs;
  }
  if (move.counter || move.mirrorCoat || move.metalBurst) {
    const categoryOk = move.metalBurst || (move.counter && attacker.lastDamageCategory === "physical") || (move.mirrorCoat && attacker.lastDamageCategory === "special");
    if (!categoryOk || !attacker.lastDamageAmount) { logs.push("しかし うまく決まらなかった！"); return logs; }
    const mult = move.metalBurst ? 1.5 : 2;
    const dealt = Math.min(defender.hp, Math.max(1, Math.floor(attacker.lastDamageAmount * mult)));
    defender.hp -= dealt; defender.lastDamageAmount = dealt; defender.lastDamageCategory = move.category; defender.tookDamageThisTurn = true; logs.push(`${dealt} ダメージ！`); return logs;
  }

  // みがわりを攻撃（音技は貫通）
  const hitSubstitute = defender.substituteHP > 0 && !move.sound;
  const hits = v6ResolveMultiHitCount(attacker, move);
  let totalDealt = 0;
  let anyCritical = false;
  let effectiveness = getTypeEffectivenessV5(attacker, defender, move);

  if (effectiveness === 0) { logs.push(`${defender.name}には こうかがないようだ……`); v62ApplyMaxHPRecoil(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }

  for (let i = 0; i < hits; i++) {
    if (defender.hp <= 0) break;
    const result = calculateDamage(attacker, defender, move);
    anyCritical ||= result.critical;
    let dealt = result.damage;

    // タイプ半減きのみは本体が受ける最初の該当ヒットだけ半減して消費。
    // みがわりが攻撃を受ける場合は発動しない。
    if (!hitSubstitute && v6TryResistBerry(defender, move, effectiveness, logs)) {
      dealt = Math.max(1, Math.floor(dealt * 0.5));
    }

    if (hitSubstitute && defender.substituteHP > 0) {
      const subDealt = Math.min(defender.substituteHP, dealt);
      defender.substituteHP = Math.max(0, defender.substituteHP - dealt);
      totalDealt += subDealt;
      if (defender.substituteHP <= 0) logs.push(`${defender.name}の みがわりは 壊れた！`);
      continue;
    }

    const fullBefore = defender.hp === defender.maxHP;
    if (dealt >= defender.hp && fullBefore && defender.hp > 1) {
      if (defender.ability.id === "sturdy") { dealt = defender.hp - 1; logs.push(`${defender.name}は がんじょうで耐えた！`); }
      else if (v6ItemIsActive(defender) && defender.item.id === "focus-sash") { dealt = defender.hp - 1; defender.itemConsumed = true; logs.push(`${defender.name}は きあいのタスキで耐えた！`); }
    }
    if (defender.endureThisTurn && dealt >= defender.hp && defender.hp > 1) dealt = defender.hp - 1;

    defender.hp = Math.max(0, defender.hp - dealt);
    totalDealt += dealt;
    defender.lastDamageAmount = dealt;
    defender.lastDamageCategory = move.category;
    defender.tookDamageThisTurn = true;
  }

  if (hits > 1) logs.push(`${hits}回 当たった！`);
  logs.push(`${totalDealt} ダメージ！ ${getEffectivenessText(effectiveness)}`);
  if (anyCritical) logs.push("急所に当たった！");

  if (move.breakScreens) {
    const s = v6GetSideState(defender.side); s.reflect = 0; s.lightScreen = 0; logs.push(`${defender.name}側の 壁を壊した！`);
  }
  if (move.removeTerrain && v6EnsureFieldState().terrain.type) { v6EnsureFieldState().terrain = { type: null, turns: 0 }; logs.push("フィールドの効果が 消えた！"); }
  if (move.smackDown) { defender.smackDown = true; defender.magnetRiseTurns = 0; if (defender.item.id === "air-balloon") defender.itemConsumed = true; logs.push(`${defender.name}は 地面に落とされた！`); }
  if (move.clearTargetStages) { Object.keys(defender.stages).forEach(stat => defender.stages[stat] = 0); logs.push(`${defender.name}の 能力変化が 元に戻った！`); }

  const sheerForceActive = attacker.ability.id === "sheer-force" && moveHasSheerForceEffect(move);
  v62ApplyGuaranteedStatChanges(attacker, defender, move, sheerForceActive, logs, hitSubstitute);
  const cloakBlocks = v6ItemIsActive(defender) && defender.item.id === "covert-cloak";
  if (!sheerForceActive && !cloakBlocks && !hitSubstitute && move.targetStatChangeChance && defender.hp > 0 && Math.random() * 100 < move.targetStatChangeChance.chance) logs.push(changeStage(defender, move.targetStatChangeChance.stat, move.targetStatChangeChance.amount, attacker));
  if (!sheerForceActive && move.selfStatChangeChance && attacker.hp > 0 && Math.random() * 100 < move.selfStatChangeChance.chance) logs.push(changeStage(attacker, move.selfStatChangeChance.stat, move.selfStatChangeChance.amount, attacker));
  if (!sheerForceActive && !cloakBlocks && !hitSubstitute && move.secondaryStatus && defender.hp > 0 && Math.random() * 100 < move.secondaryStatus.chance) logs.push(inflictStatus(defender, move.secondaryStatus.status));
  if (!sheerForceActive && !cloakBlocks && !hitSubstitute && move.flinchChance && defender.hp > 0 && !defender.hasActedThisTurn && Math.random() * 100 < move.flinchChance) defender.flinched = true;
  if (!sheerForceActive && !hitSubstitute && move.confuseChance && defender.hp > 0 && Math.random() * 100 < move.confuseChance) logs.push(v6Confuse(defender));
  if (!sheerForceActive && !hitSubstitute && move.confuseIfTargetRaised && Object.values(defender.stages).some(x => x > 0)) logs.push(v6Confuse(defender));

  if (!sheerForceActive && move.allStatBoostChance && Math.random() * 100 < move.allStatBoostChance) {
    ["attack", "defense", "specialAttack", "specialDefense", "speed"].forEach(stat => logs.push(changeStage(attacker, stat, 1, attacker)));
  }
  if (move.recoveryBlockTurns && defender.hp > 0) { defender.recoveryBlockTurns = Math.max(defender.recoveryBlockTurns || 0, move.recoveryBlockTurns); logs.push(`${defender.name}は ${move.recoveryBlockTurns}ターン 回復できなくなった！`); }
  // 攻撃技に付随するやどりぎ効果（例：ツリーホーン）。
  if (move.seedTarget && defender.hp > 0 && !hitSubstitute) {
    if (defender.types.includes("くさ")) logs.push(`${defender.name}には やどりぎのタネが効かない！`);
    else if (defender.seeded) logs.push(`${defender.name}には すでにタネが植えつけられている！`);
    else { defender.seeded = true; defender.seededBySide = attacker.side; logs.push(`${defender.name}に やどりぎのタネを植えつけた！`); }
  }
  if (move.trapDamage && defender.hp > 0 && !hitSubstitute) {
    defender.boundTurns = v6ItemIsActive(attacker) && attacker.item.id === "grip-claw" ? 7 : Math.floor(Math.random() * 2) + 4;
    defender.boundSourceSide = attacker.side;
    defender.boundEnhanced = v6ItemIsActive(attacker) && attacker.item.id === "binding-band";
    logs.push(`${defender.name}は ${move.name}に 閉じ込められた！`);
  }
  if (move.drainRatio && totalDealt > 0 && attacker.hp > 0 && canRecover(attacker)) {
    const before = attacker.hp; attacker.hp = Math.min(attacker.maxHP, attacker.hp + Math.max(1, Math.floor(totalDealt * move.drainRatio))); logs.push(`${attacker.name}は ${attacker.hp - before} HP 吸収した！`);
  }
  if (move.recoilRatio && totalDealt > 0 && attacker.hp > 0) { const recoil = Math.max(1, Math.floor(totalDealt * move.recoilRatio)); attacker.hp = Math.max(0, attacker.hp - recoil); logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`); }
  v62ApplyMaxHPRecoil(attacker, move, logs);
  if (move.selfFaintAfterDamage && attacker.hp > 0) { attacker.hp = 0; logs.push(`${attacker.name}は 力尽きた！`); }
  if (move.recharge && attacker.hp > 0) attacker.rechargeNext = true;
  if (move.knockOff && v6ItemIsActive(defender) && defender.item.id !== "none" && defender.hp > 0) { defender.itemConsumed = true; logs.push(`${defender.name}の ${defender.item.name}を はたき落とした！`); }
  if (move.bugBite && v6ItemIsActive(defender) && /berry|オボン|ラム|カゴ/.test(defender.item.id + defender.item.name)) { defender.itemConsumed = true; logs.push(`${attacker.name}は ${defender.name}の ${defender.item.name}を 食べた！`); }
  if (move.rapidSpin) {
    const s = v6GetSideState(attacker.side); s.stealthRock = false; s.spikes = 0; attacker.boundTurns = 0; attacker.seeded = false; logs.push(`${attacker.name}側の 設置技・拘束が取り除かれた！`);
  }
  if (move.forceSwitchOnHit && defender.hp > 0) v6ForceSwitch(defender.side, logs);
  if (move.pivot && attacker.hp > 0) autoPivot(attacker.side);
  if (move.furyCutter) attacker.furyCutterCount = Math.min(3, (attacker.furyCutterCount || 0) + 1); else attacker.furyCutterCount = 0;
  if (move.rollout) attacker.rolloutCount = Math.min(4, (attacker.rolloutCount || 0) + 1); else attacker.rolloutCount = 0;
  if (move.rampage) { if (!attacker.rampageMoveId) { attacker.rampageMoveId = move.id; attacker.rampageTurns = Math.floor(Math.random() * 2) + 2; } attacker.rampageTurns--; if (attacker.rampageTurns <= 0) { attacker.rampageMoveId = null; logs.push(v6Confuse(attacker)); } }

  if (move.contact && v6ItemIsActive(defender) && defender.item.id === "rocky-helmet" && attacker.hp > 0) { const damage = Math.max(1, Math.floor(attacker.maxHP / 6)); attacker.hp = Math.max(0, attacker.hp - damage); logs.push(`${attacker.name}は ゴツゴツメットで ${damage} ダメージ！`); }
  if (defender.item.id === "air-balloon" && !defender.itemConsumed && totalDealt > 0) { defender.itemConsumed = true; logs.push(`${defender.name}の ふうせんが割れた！`); }
  if (totalDealt > 0 && defender.ability.id === "stamina" && defender.hp > 0) logs.push(changeStage(defender, "defense", 1, defender));
  if (move.contact && defender.ability.id === "gooey" && attacker.hp > 0) logs.push(changeStage(attacker, "speed", -1, defender));
  if (v6ItemIsActive(attacker) && attacker.item.id === "life-orb" && !move.struggle && totalDealt > 0 && attacker.hp > 0 && !sheerForceActive) { const recoil = Math.max(1, Math.floor(attacker.maxHP / 10)); attacker.hp = Math.max(0, attacker.hp - recoil); logs.push(`${attacker.name}は いのちのたまで ${recoil} ダメージ！`); }

  if (defender.hp <= 0 && defender.destinyBond && attacker.hp > 0) { attacker.hp = 0; logs.push(`${attacker.name}は みちづれにされた！`); }
  if (defender.hp <= 0 && attacker.hp > 0 && attacker.ability.id === "moxie") logs.push(changeStage(attacker, "attack", 1, attacker));

  trySitrusBerry(defender); trySitrusBerry(attacker);
  v6TryWhiteHerb(attacker); v6TryWhiteHerb(defender);
  attacker.lastMoveId = move.id; attacker.lastMoveName = move.name;
  return logs;
};

function v6ForceSwitch(side, logs) {
  const team = getTeamBySide(side);
  const current = getActiveIndexBySide(side);
  const choices = team.map((p, i) => ({ p, i })).filter(x => x.i !== current && x.p.hp > 0);
  if (!choices.length) { logs.push("しかし 交代できるポケモンがいない！"); return; }
  const pick = choices[Math.floor(Math.random() * choices.length)];
  const old = getActivePokemonBySide(side);
  onSwitchOut(old);
  setActiveIndexBySide(side, pick.i);
  const incoming = getActivePokemonBySide(side);
  resetOnSwitch(incoming);
  logs.push(`${old.name}は 強制的に戻された！`);
  logs.push(`${side === "player" ? "" : "相手は "}${incoming.name}を くりだした！`);
  activateEntryAbility(incoming);
}

// ============================================================
// 技選択・AI・行動順
// ============================================================

getSelectableMoves = function(pokemon) {
  let moves = pokemon.moves.filter(move => move.pp > 0 && isMoveAllowedByItem(pokemon, move));
  if (pokemon.rampageMoveId) moves = moves.filter(move => move.id === pokemon.rampageMoveId);
  if (pokemon.chargingMoveId) moves = moves.filter(move => move.id === pokemon.chargingMoveId);
  return moves;
};

const V52_determineFirst = determineFirst;
determineFirst = function(playerMove, enemyMove) {
  return V52_determineFirst(playerMove, enemyMove);
};

const V52_processMoveTurn = processMoveTurn;
processMoveTurn = function(playerMove) {
  [getPlayerPokemon(), getEnemyPokemon()].filter(Boolean).forEach(p => { p.hasActedThisTurn = false; p.flinched = false; p.tookDamageThisTurn = false; p.lastDamageAmount = 0; p.lastDamageCategory = null; p.endureThisTurn = false; });
  const enemyAction = chooseEnemyAction();
  if (enemyAction?.type === "move") {
    window.__v6SelectedMoves = { player: playerMove, enemy: enemyAction.move };
    // 元関数でもAIを再抽選してしまうため、1回だけ固定する
    const originalChooser = chooseEnemyAction;
    chooseEnemyAction = () => enemyAction;
    try { V52_processMoveTurn(playerMove); } finally { chooseEnemyAction = originalChooser; window.__v6SelectedMoves = null; }
  } else {
    window.__v6SelectedMoves = { player: playerMove, enemy: null };
    const originalChooser = chooseEnemyAction;
    chooseEnemyAction = () => enemyAction;
    try { V52_processMoveTurn(playerMove); } finally { chooseEnemyAction = originalChooser; window.__v6SelectedMoves = null; }
  }
};

// ============================================================
// ターン終了処理
// ============================================================

const V52_processResidualForPokemon = processResidualForPokemon;
processResidualForPokemon = function(pokemon) {
  V52_processResidualForPokemon(pokemon);
  if (pokemon.hp <= 0) return;

  if (pokemon.aquaRing && canRecover(pokemon) && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp; pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16))); addLog(`${pokemon.name}は アクアリングで ${pokemon.hp - before} HP 回復した！`, "log-status");
  }
  if (pokemon.cursed) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 4)); pokemon.hp = Math.max(0, pokemon.hp - damage); addLog(`${pokemon.name}は のろいで ${damage} ダメージ！`, "log-status");
  }
  if (pokemon.hp > 0 && pokemon.boundTurns > 0) {
    const ratio = pokemon.boundEnhanced ? 1/6 : 1/8; const damage = Math.max(1, Math.floor(pokemon.maxHP * ratio)); pokemon.hp = Math.max(0, pokemon.hp - damage); pokemon.boundTurns--; addLog(`${pokemon.name}は 拘束で ${damage} ダメージ！`, "log-status"); if (pokemon.boundTurns <= 0) addLog(`${pokemon.name}は 拘束から解放された！`, "log-status");
  }
  if (pokemon.hp > 0 && pokemon.yawnTurns > 0) {
    pokemon.yawnTurns--;
    if (pokemon.yawnTurns === 0 && !pokemon.status) addLog(inflictStatus(pokemon, "sleep"), "log-status");
  }
  const v6 = v6EnsureFieldState();
  if (pokemon.hp > 0 && v6.terrain.type === "grassy" && v6IsGrounded(pokemon) && canRecover(pokemon) && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp; pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16))); addLog(`${pokemon.name}は グラスフィールドで ${pokemon.hp - before} HP 回復した！`, "log-system");
  }
};

const V52_endTurn = endTurn;
endTurn = function() {
  V52_endTurn();
  const v6 = v6EnsureFieldState();
  const all = [...playerTeam, ...enemyTeam];
  all.forEach(p => {
    if (p.tauntTurns > 0) p.tauntTurns--;
    if (p.encoreTurns > 0 && --p.encoreTurns <= 0) p.encoreMoveId = null;
    if (p.disableTurns > 0 && --p.disableTurns <= 0) p.disabledMoveId = null;
    if (p.magnetRiseTurns > 0) p.magnetRiseTurns--;
    p.destinyBond = false;
    if (isActivePokemon(p) && p.hp > 0) p.turnsOnField++;
  });

  if (v6.terrain.turns > 0) {
    v6.terrain.turns--;
    if (v6.terrain.turns <= 0) { addLog(`${V6_TERRAIN_NAMES[v6.terrain.type]}が 消えた。`, "log-system"); v6.terrain = { type: null, turns: 0 }; }
  }
  ["gravity", "magicRoom", "wonderRoom"].forEach(key => { if (v6[key] > 0) v6[key]--; });
  ["player", "enemy"].forEach(side => {
    const s = v6GetSideState(side);
    ["reflect", "lightScreen", "mist", "safeguard"].forEach(key => { if (s[key] > 0) s[key]--; });
    s.quickGuard = false;
    if (s.wish) {
      s.wish.turns--;
      if (s.wish.turns <= 0) {
        const p = getActivePokemonBySide(side);
        if (p && p.hp > 0 && canRecover(p)) { const before = p.hp; p.hp = Math.min(p.maxHP, p.hp + s.wish.amount); addLog(`${p.name}の 願いがかなった！ ${p.hp - before} HP 回復！`, "log-system"); }
        s.wish = null;
      }
    }
    if (s.futureSight) {
      s.futureSight.turns--;
      if (s.futureSight.turns <= 0) {
        const target = getActivePokemonBySide(side);
        const source = s.futureSight.source;
        const mv = MOVE_DEX[s.futureSight.moveId];
        if (target && source && mv && target.hp > 0) {
          // 現行世代準拠：命中・ダメージ計算は着弾時に行う。
          if (mv.accuracy !== null && !checkAccuracy(mv, source, target)) {
            addLog(`${target.name}への みらいよちの攻撃は 失敗した！`, "log-system");
          } else {
            // 使用者が既に場を離れている場合、使用者自身の特性・持ち物補正は適用しない。
            const sourceStillActive = getActivePokemonBySide(source.side) === source;
            const damageSource = sourceStillActive ? source : { ...source, ability: { id: "none", name: "なし" }, itemConsumed: true };
            const result = calculateDamage(damageSource, target, mv);
            let dealt = Math.max(0, result.damage || 0);

            // みらいよちでも本体が受ける場合はタイプ半減きのみが発動する。
            if (target.substituteHP <= 0 && v6TryResistBerry(target, mv, result.effectiveness)) {
              dealt = Math.max(1, Math.floor(dealt * 0.5));
              addLog(`${target.name}は ${target.item.name}で ${mv.type}技のダメージを弱めた！`, "log-system");
            }

            // みがわりがあれば本体ではなくみがわりが受ける。
            if (target.substituteHP > 0) {
              const subDealt = Math.min(target.substituteHP, dealt);
              target.substituteHP = Math.max(0, target.substituteHP - dealt);
              addLog(`${target.name}の みがわりに みらいよちの攻撃！ ${subDealt} ダメージ！`, "log-system");
              if (target.substituteHP <= 0) addLog(`${target.name}の みがわりは 壊れた！`, "log-system");
            } else if (result.effectiveness === 0) {
              addLog(`${target.name}への みらいよちは 効果がないようだ……`, "log-system");
            } else {
              const fullBefore = target.hp === target.maxHP;
              dealt = Math.min(target.hp, dealt);
              if (dealt >= target.hp && target.hp > 1) {
                if (target.endureThisTurn) dealt = target.hp - 1;
                else if (target.ability.id === "sturdy" && fullBefore) { dealt = target.hp - 1; addLog(`${target.name}は がんじょうで耐えた！`, "log-system"); }
                else if (v6ItemIsActive(target) && target.item.id === "focus-sash" && fullBefore) { target.itemConsumed = true; dealt = target.hp - 1; addLog(`${target.name}は きあいのタスキで耐えた！`, "log-system"); }
              }
              target.hp = Math.max(0, target.hp - dealt);
              addLog(`${target.name}に みらいよちの攻撃！ ${dealt} ダメージ！ ${getEffectivenessText(result.effectiveness)}`, "log-system");
              if (result.critical) addLog("急所に当たった！", "log-system");
              trySitrusBerry(target);
            }
          }
        }
        s.futureSight = null;
      }
    }
  });
};

// ============================================================
// 描画
// ============================================================

const terrainText = document.getElementById("terrain-text");
const sideEffectText = document.getElementById("side-effect-text");
const V52_renderPokemon = renderPokemon;
renderPokemon = function() {
  V52_renderPokemon();
  const v6 = v6EnsureFieldState();
  if (terrainText) terrainText.textContent = v6.terrain.type ? `${V6_TERRAIN_NAMES[v6.terrain.type]}（残り${v6.terrain.turns}）` : "なし";
  if (sideEffectText) {
    const parts = [];
    if (v6.gravity > 0) parts.push(`じゅうりょく${v6.gravity}`);
    if (v6.magicRoom > 0) parts.push(`マジックルーム${v6.magicRoom}`);
    if (v6.wonderRoom > 0) parts.push(`ワンダールーム${v6.wonderRoom}`);
    const ps = v6GetSideState("player"), es = v6GetSideState("enemy");
    if (ps.reflect > 0) parts.push(`自R${ps.reflect}`); if (ps.lightScreen > 0) parts.push(`自L${ps.lightScreen}`);
    if (es.reflect > 0) parts.push(`相R${es.reflect}`); if (es.lightScreen > 0) parts.push(`相L${es.lightScreen}`);
    if (ps.stealthRock || ps.spikes) parts.push(`自設置`); if (es.stealthRock || es.spikes) parts.push(`相設置`);
    sideEffectText.textContent = parts.length ? parts.join(" / ") : "なし";
  }
};

let v62ForcedChargeTimer = null;

function v62QueueForcedChargeTurn(player, move) {
  if (v62ForcedChargeTimer || battleOver || awaitingPlayerSwitch || !player || player.hp <= 0) return;
  const expectedId = move.id;
  const expectedTurn = turnNumber;
  v62ForcedChargeTimer = setTimeout(() => {
    v62ForcedChargeTimer = null;
    const current = getPlayerPokemon();
    if (battleOver || awaitingPlayerSwitch || !current || current.hp <= 0) return;
    if (current.chargingMoveId !== expectedId || turnNumber !== expectedTurn) return;
    const forcedMove = current.moves.find(m => m.id === expectedId);
    if (forcedMove) processMoveTurn(forcedMove);
  }, 350);
}

renderMoves = function() {
  moveContainer.innerHTML = "";
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();

  // ため技の2ターン目は別技を選べない。Champions同様、その技を続けて自動実行する。
  if (player?.chargingMoveId && !battleOver && !awaitingPlayerSwitch && player.hp > 0) {
    const forcedMove = player.moves.find(move => move.id === player.chargingMoveId);
    if (forcedMove) {
      const effective = getEffectiveMove(player, forcedMove);
      const cell = document.createElement("div");
      cell.className = "battle-move-cell";
      const button = document.createElement("button");
      button.className = "move-button";
      button.disabled = true;
      button.innerHTML = `<span class="move-name">${effective.name}</span><span class="move-info">ため中：2ターン目はこの技を自動で使用します</span><span class="pp-line">PP ${forcedMove.pp} / ${forcedMove.maxPP}</span>`;
      const detail = document.createElement("button");
      detail.type = "button";
      detail.className = "inline-move-detail-button";
      detail.textContent = "詳細";
      detail.addEventListener("click", () => showMoveDetail(forcedMove.id));
      cell.appendChild(button);
      cell.appendChild(detail);
      moveContainer.appendChild(cell);
      v62QueueForcedChargeTurn(player, forcedMove);
      return;
    }
  }

  const usable = getSelectableMoves(player);
  const movesToRender = usable.length === 0 ? [{ ...STRUGGLE_MOVE }] : player.moves;

  movesToRender.forEach(move => {
    const effective = getEffectiveMove(player, move);
    const cell = document.createElement("div"); cell.className = "battle-move-cell";
    const button = document.createElement("button"); button.className = "move-button";
    const power = effective.power === null ? "-" : effective.power;
    const accuracy = effective.accuracy === null ? "-" : effective.accuracy;
    const effect = effective.category === "status" ? "変化技" : getEffectivenessText(getTypeEffectivenessV5(player, enemy, effective));
    const ppLine = effective.struggle ? "PP ∞" : `PP ${move.pp} / ${move.maxPP}`;
    const lockText = isChoiceItem(player) && player.choiceLock && move.id !== player.choiceLock ? " / こだわりロック" : "";
    button.innerHTML = `<span class="move-name">${effective.name}</span><span class="move-info">${effective.type} / ${getCategoryText(effective.category)}<br>威力 ${power}　命中 ${accuracy}</span><span class="pp-line">${ppLine}${lockText}</span><span class="effectiveness">${effect}</span>`;
    button.disabled = battleOver || awaitingPlayerSwitch || player.hp <= 0 || (!effective.struggle && (move.pp <= 0 || !isMoveAllowedByItem(player, move)));
    button.addEventListener("click", () => processMoveTurn(move));
    const detail = document.createElement("button"); detail.type = "button"; detail.className = "inline-move-detail-button"; detail.textContent = "詳細"; detail.addEventListener("click", () => showMoveDetail(move.id));
    cell.appendChild(button); cell.appendChild(detail); moveContainer.appendChild(cell);
  });
};


// ため技の2ターン目は交代も選択できない。
const V62_renderSwitchButtonsBase = renderSwitchButtons;
renderSwitchButtons = function() {
  V62_renderSwitchButtonsBase();
  const player = getPlayerPokemon();
  if (player?.chargingMoveId && !battleOver && !awaitingPlayerSwitch) {
    switchContainer.querySelectorAll("button").forEach(button => {
      button.disabled = true;
      button.title = "ため技の2ターン目は交代できません";
    });
  }
};

// ============================================================
// バトル開始時のv6場初期化
// ============================================================

const V52_startBattleFromSelection = startBattleFromSelection;
startBattleFromSelection = function() {
  V52_startBattleFromSelection();
  fieldState.v6 = null;
  v6EnsureFieldState();
  renderAll();
};

// 初期画面をv6データで再描画
renderDataCounts();
renderBuilder();
setBuilderMessage(`v6：実装済み17種について、元データに記載された全習得技を追加しました。登録技は ${Object.keys(MOVE_DEX).length} 種、持ち物は ${Object.keys(ITEM_DEX).length} 種です。技の「詳細」から性能を確認できます。`, false);

// ============================================================
// v6 追加修正: 持ち物無効化 / しろいきり / 未処理フラグ
// ============================================================

getModifiedStat = function(pokemon, statName) {
  let value = Math.floor(pokemon[statName] * getStageMultiplier(pokemon.stages[statName] ?? 0));
  if (statName === "speed" && pokemon.status === "paralysis") value = Math.floor(value * 0.5);
  if (statName === "speed" && v6ItemIsActive(pokemon) && pokemon.item.id === "choice-scarf") value = Math.floor(value * 1.5);
  if (statName === "speed" && fieldState.tailwind?.[getPokemonSide(pokemon)] > 0) value *= 2;
  return Math.max(1, value);
};

getDamageStatV5 = function(pokemon, statName, isAttacker, critical) {
  let stage = pokemon.stages[statName] ?? 0;
  if (critical) {
    if (isAttacker && stage < 0) stage = 0;
    if (!isAttacker && stage > 0) stage = 0;
  }
  let value = Math.max(1, Math.floor(pokemon[statName] * getStageMultiplier(stage)));
  if (v6ItemIsActive(pokemon)) {
    if (isAttacker && statName === "attack" && pokemon.item.id === "choice-band") value = Math.floor(value * 1.5);
    if (isAttacker && statName === "specialAttack" && pokemon.item.id === "choice-specs") value = Math.floor(value * 1.5);
    if (!isAttacker && statName === "specialDefense" && pokemon.item.id === "assault-vest") value = Math.floor(value * 1.5);
  }
  if (isAttacker && statName === "specialAttack" && pokemon.ability.id === "night-scales") value *= 2;
  return Math.max(1, value);
};

changeStage = function(pokemon, statName, amount, source = null) {
  if (amount < 0 && source && source !== pokemon) {
    const sideState = pokemon.side ? v6GetSideState(pokemon.side) : null;
    if (sideState?.mist > 0) return `${pokemon.name}は しろいきりで 能力を下げられない！`;
    if (["clear-body", "white-smoke"].includes(pokemon.ability.id) || (v6ItemIsActive(pokemon) && pokemon.item.id === "clear-amulet")) {
      return `${pokemon.name}は 能力を下げられない！`;
    }
  }
  const oldStage = pokemon.stages[statName];
  const newStage = clamp(oldStage + amount, -6, 6);
  pokemon.stages[statName] = newStage;
  const name = STAT_JP[statName];
  if (oldStage === newStage) return `${pokemon.name}の ${name}は もう変わらない！`;
  let text;
  if (amount >= 2) text = `${pokemon.name}の ${name}が ぐーんと あがった！`;
  else if (amount === 1) text = `${pokemon.name}の ${name}が あがった！`;
  else if (amount <= -2) text = `${pokemon.name}の ${name}が がくっと さがった！`;
  else text = `${pokemon.name}の ${name}が さがった！`;
  if (amount < 0 && source && source !== pokemon && pokemon.ability.id === "competitive") {
    pokemon.stages.specialAttack = clamp(pokemon.stages.specialAttack + 2, -6, 6);
    text += ` ${pokemon.name}の かちきで とくこうが上がった！`;
  }
  return text;
};

applyStatChanges = function(pokemon, changes, source = null) {
  return Object.keys(changes).map(statName => changeStage(pokemon, statName, changes[statName], source));
};

const V6_baseTrySitrusBerry = trySitrusBerry;
trySitrusBerry = function(pokemon) {
  if (!v6ItemIsActive(pokemon)) return null;
  return V6_baseTrySitrusBerry(pokemon);
};

const V6_baseTryStatusBerry = tryStatusBerry;
tryStatusBerry = function(pokemon) {
  if (!v6ItemIsActive(pokemon)) return null;
  return V6_baseTryStatusBerry(pokemon);
};

const V6_baseGetImmunityResult = getImmunityResult;
getImmunityResult = function(attacker, defender, move) {
  const suppressBalloon = v6EnsureFieldState().magicRoom > 0 && defender.item.id === "air-balloon" && !defender.itemConsumed;
  if (!suppressBalloon) return V6_baseGetImmunityResult(attacker, defender, move);
  const old = defender.itemConsumed;
  defender.itemConsumed = true;
  const result = V6_baseGetImmunityResult(attacker, defender, move);
  defender.itemConsumed = old;
  return result;
};

// Magic Room 中は既存のターン終了アイテム処理を一時的に止める。
const V6_residualWithItems = processResidualForPokemon;
processResidualForPokemon = function(pokemon) {
  const magicRoom = v6EnsureFieldState().magicRoom > 0;
  const oldConsumed = pokemon.itemConsumed;
  if (magicRoom && !oldConsumed && pokemon.item.id !== "none") pokemon.itemConsumed = true;
  V6_residualWithItems(pokemon);
  if (magicRoom && !oldConsumed) pokemon.itemConsumed = false;
};

// status 特殊技の対象判定を補完
const V6_prevStatusTargetsOpponent = v6StatusMoveTargetsOpponent;
v6StatusMoveTargetsOpponent = function(move) {
  return V6_prevStatusTargetsOpponent(move) || Boolean(move.yawn);
};

// 動的威力: はきだす
const V6_prevDynamicPower = v6DynamicPower;
v6DynamicPower = function(attacker, defender, move) {
  if (move.spitUp) return Math.max(1, (attacker.stockpileCount || 0) * 100);
  return V6_prevDynamicPower(attacker, defender, move);
};

// ============================================================
// useMove の軽量後処理ラッパー
// ============================================================

const V6_coreUseMove = useMove;
useMove = function(attacker, defender, originalMove) {
  const move = getEffectiveMove(attacker, originalMove);

  // こらえる / ファストガードは status の protect 分岐へ送る
  if (move.category === "status" && (move.endure || move.quickGuard) && !move.protect && !move.protectLike) {
    const patched = { ...move, protectLike: true };
    return V6_coreUseMove(attacker, defender, patched);
  }

  // あくびは対象技として先に処理
  if (move.category === "status" && move.yawn) {
    if (!move.struggle) {
      if (move.pp <= 0) return [`${move.name}は PPが ない！`];
      const original = attacker.moves.find(m => m.id === originalMove.id);
      if (original) original.pp = Math.max(0, original.pp - 1);
    }
    const logs = [`${attacker.name}の ${move.name}！`];
    const actionCheck = canPokemonAct(attacker);
    if (actionCheck.text) logs.unshift(actionCheck.text);
    if (!actionCheck.canAct) return logs.slice(0, -1);
    if (defender.substituteHP > 0) { logs.push(`${defender.name}の みがわりが 技を防いだ！`); return logs; }
    if (defender.protectThisTurn) { logs.push(`${defender.name}は 攻撃を防いだ！`); return logs; }
    if (defender.status || defender.yawnTurns > 0 || !canReceiveStatus(defender, "sleep")) { logs.push("しかし うまく決まらなかった！"); return logs; }
    defender.yawnTurns = 2;
    logs.push(`${defender.name}は ねむけを誘われた！`);
    attacker.lastMoveId = move.id;
    return logs;
  }

  // バトンタッチ: 能力ランクを引き継いで自動交代
  if (move.category === "status" && move.batonPass) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    const original = attacker.moves.find(m => m.id === originalMove.id);
    if (original) original.pp = Math.max(0, original.pp - 1);
    const logs = [`${attacker.name}の ${move.name}！`];
    const side = attacker.side;
    const team = getTeamBySide(side);
    const current = getActiveIndexBySide(side);
    const candidates = team.map((p, i) => ({p, i})).filter(x => x.i !== current && x.p.hp > 0);
    if (!candidates.length) { logs.push("しかし 交代できるポケモンがいない！"); return logs; }
    const stages = { ...attacker.stages };
    const sub = attacker.substituteHP;
    const aqua = attacker.aquaRing;
    const old = attacker;
    const chosen = candidates.sort((a,b) => b.p.hp/b.p.maxHP - a.p.hp/a.p.maxHP)[0];
    onSwitchOut(old);
    setActiveIndexBySide(side, chosen.i);
    const incoming = getActivePokemonBySide(side);
    resetOnSwitch(incoming);
    incoming.stages = stages;
    incoming.substituteHP = sub;
    incoming.aquaRing = aqua;
    logs.push(`${old.name}は 戻った！`);
    logs.push(`${side === "player" ? "" : "相手は "}${incoming.name}を くりだした！`);
    activateEntryAbility(incoming);
    return logs;
  }

  const beforeDefenderTypeIce = defender.types.includes("こおり");
  const resultLogs = V6_coreUseMove(attacker, defender, originalMove);

  // アイススピナー等: 技が成功したらこのターンだけこおりタイプ消失
  if (move.removeIceUntilEndTurn && attacker.hp > 0 && attacker.types.includes("こおり") && !resultLogs.some(x => x.includes("はずれた") || x.includes("効かない") || x.includes("防いだ"))) {
    attacker.types = attacker.types.filter(type => type !== "こおり");
    attacker.tempRemovedIce = true;
    resultLogs.push(`${attacker.name}は このターン こおりタイプではなくなった！`);
  }

  // はきだす: たくわえる回数を消費
  if (move.spitUp && attacker.stockpileCount > 0) {
    attacker.stockpileCount = 0;
    resultLogs.push(`${attacker.name}は たくわえた力を すべて使った！`);
  }

  // でんじふゆうフラグ名の互換
  if (move.magnetRise && attacker.magnetRiseTurns <= 0) attacker.magnetRiseTurns = 5;

  return resultLogs;
};

// 選択可能技の表示を再定義後にも維持
renderBuilder();
