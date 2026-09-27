/* ニワラバトル v10 unified private runtime. No external patch-chain loading. */
(function(){
"use strict";
/* ===== Base engine (deduplicated active declarations only) ===== */
// ============================================================
// ニワラバトル v5.2 - 重複制限 / 性格補正表示 / Champions天候・トリックルーム修正 / フォルムログ
// ============================================================

const STORAGE_KEY = window.NIWARA_APP?.teamStorageKey || "niwaraBattleTeamV5";
const LEGACY_STORAGE_KEY = "niwaraBattleTeamV4";

// ============================================================
// DOM
// ============================================================
const builderScreen = document.getElementById("builder-screen");
const selectionScreen = document.getElementById("selection-screen");
const battleScreen = document.getElementById("battle-screen");
const goBuilderButton = document.getElementById("go-builder-button");
const resetAllButton = document.getElementById("reset-all-button");
const dataCounts = document.getElementById("data-counts");
const randomTeamButton = document.getElementById("random-team-button");

const builderSlots = document.getElementById("builder-slots");
const builderMessage = document.getElementById("builder-message");
const recommendedButton = document.getElementById("recommended-button");
const saveTeamButton = document.getElementById("save-team-button");
const toSelectionButton = document.getElementById("to-selection-button");

const enemyPreview = document.getElementById("enemy-preview");
const playerPreview = document.getElementById("player-preview");
const selectionCount = document.getElementById("selection-count");
const clearSelectionButton = document.getElementById("clear-selection-button");
const startBattleButton = document.getElementById("start-battle-button");
const backToBuilderButton = document.getElementById("back-to-builder-button");
const rerollEnemyButton = document.getElementById("reroll-enemy-button");

const weatherText = document.getElementById("weather-text");
const turnText = document.getElementById("turn-text");
const roomText = document.getElementById("room-text");
const tailwindText = document.getElementById("tailwind-text");
const forfeitButton = document.getElementById("forfeit-button");

const playerNameText = document.getElementById("player-name");
const playerTypeText = document.getElementById("player-type");
const playerHPText = document.getElementById("player-hp");
const playerHPFill = document.getElementById("player-hp-fill");
const playerStagesText = document.getElementById("player-stages");
const playerStatusText = document.getElementById("player-status");
const playerAbilityText = document.getElementById("player-ability");
const playerItemText = document.getElementById("player-item");
const playerNatureText = document.getElementById("player-nature");

const opponentNameText = document.getElementById("opponent-name");
const opponentTypeText = document.getElementById("opponent-type");
const opponentHPText = document.getElementById("opponent-hp");
const opponentHPFill = document.getElementById("opponent-hp-fill");
const opponentStagesText = document.getElementById("opponent-stages");
const opponentStatusText = document.getElementById("opponent-status");
const opponentAbilityText = document.getElementById("opponent-ability");
const opponentItemText = document.getElementById("opponent-item");
const opponentNatureText = document.getElementById("opponent-nature");

const moveContainer = document.getElementById("move-container");
const switchContainer = document.getElementById("switch-container");
const playerTeamStatus = document.getElementById("player-team-status");
const enemyTeamStatus = document.getElementById("enemy-team-status");
const battleLogElement = document.getElementById("battle-log");

// ============================================================
// 共通ユーティリティ
// ============================================================
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(name) {
  builderScreen.classList.toggle("hidden", name !== "builder");
  selectionScreen.classList.toggle("hidden", name !== "selection");
  battleScreen.classList.toggle("hidden", name !== "battle");
  goBuilderButton.classList.toggle("hidden", name === "builder");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function optionHtml(value, label, selectedValue, disabled = false) {
  const selected = value === selectedValue;
  const disabledAttr = disabled && !selected ? "disabled" : "";
  return `<option value="${value}" ${selected ? "selected" : ""} ${disabledAttr}>${label}</option>`;
}

const NATURE_STAT_NAMES = {
  attack: "こうげき(A)",
  defense: "ぼうぎょ(B)",
  specialAttack: "とくこう(C)",
  specialDefense: "とくぼう(D)",
  speed: "すばやさ(S)"
};

function getNatureDescription(natureName) {
  const nature = NATURES[natureName] || NATURES["まじめ"];
  if (!nature.up || !nature.down) return "補正なし";
  return `${NATURE_STAT_NAMES[nature.up]}↑ / ${NATURE_STAT_NAMES[nature.down]}↓`;
}

function getNatureOptionLabel(natureName) {
  return `${natureName}（${getNatureDescription(natureName)}）`;
}

// ============================================================
// Champions仕様：能力ポイント込み実数値
// 各能力0～32、合計66。Lv.50・個体値31固定。
// HP = 種族値 + 能力ポイント + 75
// その他 = floor((種族値 + 能力ポイント + 20) × 能力補正)
// ============================================================
function normalizeStatPoint(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.floor(n), 0, 32);
}

// v4で保存した従来努力値をChampionsの能力ポイントへ移行する。
// HOMEの変換則と同じく、最初の1ptは4EV、その後は8EVごとに1pt。
function legacyEVToStatPoints(value) {
  const ev = clamp(Math.floor(Number(value) || 0), 0, 252);
  if (ev < 4) return 0;
  return clamp(1 + Math.floor((ev - 4) / 8), 0, 32);
}

function getNatureMultiplier(natureName, statName) {
  const nature = NATURES[natureName] || NATURES["まじめ"];
  if (nature.up === statName) return 1.1;
  if (nature.down === statName) return 0.9;
  return 1;
}

function calculateHP(base, statPoints = 0) {
  return base + normalizeStatPoint(statPoints) + 75;
}

function calculateStat(base, statPoints = 0, natureName = "まじめ", statName = "attack") {
  const raw = base + normalizeStatPoint(statPoints) + 20;
  return Math.floor(raw * getNatureMultiplier(natureName, statName));
}

function calculateSetStats(set) {
  const species = SPECIES_DEX[set.speciesId];
  return {
    hp: calculateHP(species.baseStats.hp, set.statPoints.hp),
    attack: calculateStat(species.baseStats.attack, set.statPoints.attack, set.nature, "attack"),
    defense: calculateStat(species.baseStats.defense, set.statPoints.defense, set.nature, "defense"),
    specialAttack: calculateStat(species.baseStats.specialAttack, set.statPoints.specialAttack, set.nature, "specialAttack"),
    specialDefense: calculateStat(species.baseStats.specialDefense, set.statPoints.specialDefense, set.nature, "specialDefense"),
    speed: calculateStat(species.baseStats.speed, set.statPoints.speed, set.nature, "speed")
  };
}

function getStatPointTotal(set) {
  return Object.values(set.statPoints).reduce((sum, value) => sum + normalizeStatPoint(value), 0);
}

// ============================================================
// チーム構築状態
// ============================================================
function loadSavedTeam() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);

    // v5の保存がまだ無い場合は、v4の保存編成を引き継ぐ。
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw) return deepClone(DEFAULT_PLAYER_SETS);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 6) return deepClone(DEFAULT_PLAYER_SETS);
    return parsed;
  } catch (error) {
    console.warn("保存編成を読み込めませんでした", error);
    return deepClone(DEFAULT_PLAYER_SETS);
  }
}

let builderSets = loadSavedTeam();
let selectedRosterIndices = [];
let playerFullRoster = [];
let enemyFullRoster = [];
let enemyPreviewSets = [];

function normalizeSet(set) {
  const species = SPECIES_DEX[set.speciesId] || SPECIES_DEX.wolf;
  // 旧v4の「努力値」保存データがあれば、自動でChampions能力ポイントへ変換する。
  if (!set.statPoints && set.evs) {
    set.statPoints = {};
    Object.keys(STAT_LABELS).forEach(stat => {
      set.statPoints[stat] = legacyEVToStatPoints(set.evs[stat]);
    });
    delete set.evs;
  }
  if (!set.statPoints) set.statPoints = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  Object.keys(STAT_LABELS).forEach(stat => set.statPoints[stat] = normalizeStatPoint(set.statPoints[stat]));
  if (!NATURES[set.nature]) set.nature = "まじめ";
  if (!species.abilities.some(a => a.id === set.abilityId)) set.abilityId = species.abilities[0].id;
  if (!ITEM_DEX[set.itemId]) set.itemId = "none";
  if (!Array.isArray(set.moves)) set.moves = species.movePool.slice(0, 4);
  const validMoves = set.moves.filter(id => species.movePool.includes(id));
  species.movePool.forEach(id => {
    if (validMoves.length < 4 && !validMoves.includes(id)) validMoves.push(id);
  });
  set.moves = validMoves.slice(0, 4);
  return set;
}

builderSets = builderSets.map(normalizeSet);

function validateSet(set) {
  const species = SPECIES_DEX[set.speciesId];
  if (!species) return "種族が不正です";
  if (getStatPointTotal(set) > 66) return "能力ポイント合計が66を超えています";
  for (const stat of Object.keys(STAT_LABELS)) {
    const point = Number(set.statPoints[stat]);
    if (!Number.isFinite(point) || point < 0 || point > 32) return `${STAT_LABELS[stat]}の能力ポイントが不正です`;
  }
  if (new Set(set.moves).size !== 4) return "同じ技は2つ選べません";
  if (set.moves.some(id => !species.movePool.includes(id))) return "覚えられない技があります";
  return null;
}

function getSpeciesClauseKey(speciesId) {
  const species = SPECIES_DEX[speciesId];
  if (!species) return `id:${speciesId}`;
  return species.dexNo !== undefined && species.dexNo !== null
    ? `dex:${species.dexNo}`
    : `id:${species.id}`;
}

function countBuilderValue(key, value) {
  return builderSets.filter(set => set[key] === value).length;
}

function countBuilderSpeciesClause(speciesId) {
  const key = getSpeciesClauseKey(speciesId);
  return builderSets.filter(set => getSpeciesClauseKey(set.speciesId) === key).length;
}

function getTeamClauseErrorForSlot(index) {
  const set = builderSets[index];
  if (!set) return null;

  if (countBuilderSpeciesClause(set.speciesId) > 1) {
    const name = SPECIES_DEX[set.speciesId]?.name ?? set.speciesId;
    return `同じポケモン「${name}」は1つの構築に1匹までです`;
  }

  if (set.itemId !== "none" && countBuilderValue("itemId", set.itemId) > 1) {
    const name = ITEM_DEX[set.itemId]?.name ?? set.itemId;
    return `同じ持ち物「${name}」は1つの構築で重複できません`;
  }

  return null;
}

function validateBuilder() {
  for (let i = 0; i < builderSets.length; i++) {
    const error = validateSet(builderSets[i]);
    if (error) return `スロット${i + 1}：${error}`;
  }

  for (let i = 0; i < builderSets.length; i++) {
    const clauseError = getTeamClauseErrorForSlot(i);
    if (clauseError) return `スロット${i + 1}：${clauseError}`;
  }

  return null;
}

function setBuilderMessage(text, isError = false) {
  builderMessage.textContent = text;
  builderMessage.classList.toggle("error", isError);
}

function saveBuilderTeam() {
  const error = validateBuilder();
  if (error) {
    setBuilderMessage(error, true);
    return false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builderSets));
  setBuilderMessage("編成をこのブラウザに保存しました。", false);
  return true;
}

function renderBuilder() {
  builderSlots.innerHTML = "";

  builderSets.forEach((set, index) => {
    normalizeSet(set);
    const species = SPECIES_DEX[set.speciesId];
    const totalSP = getStatPointTotal(set);
    const error = validateSet(set) || getTeamClauseErrorForSlot(index);
    const stats = calculateSetStats(set);

    const card = document.createElement("article");
    card.className = `builder-card${error ? " invalid" : ""}`;

    const speciesOptions = Object.values(SPECIES_DEX)
      .map(s => {
        const usedByOtherSlot = builderSets.some((otherSet, otherIndex) =>
          otherIndex !== index && getSpeciesClauseKey(otherSet.speciesId) === getSpeciesClauseKey(s.id)
        );
        return optionHtml(
          s.id,
          `#${s.dexNo ?? "-"} ${s.name}（${s.types.join("/")} / BST ${Object.values(s.baseStats).reduce((a,b)=>a+b,0)}）${usedByOtherSlot && s.id !== set.speciesId ? "【使用中】" : ""}`,
          set.speciesId,
          usedByOtherSlot
        );
      })
      .join("");

    const abilityOptions = species.abilities
      .map(a => optionHtml(a.id, a.name, set.abilityId))
      .join("");

    const itemOptions = Object.values(ITEM_DEX)
      .map(item => {
        const usedByOtherSlot = item.id !== "none" && builderSets.some((otherSet, otherIndex) =>
          otherIndex !== index && otherSet.itemId === item.id
        );
        return optionHtml(
          item.id,
          `${item.name}${usedByOtherSlot && item.id !== set.itemId ? "【使用中】" : ""}`,
          set.itemId,
          usedByOtherSlot
        );
      })
      .join("");

    const natureOptions = Object.keys(NATURES)
      .map(name => optionHtml(name, getNatureOptionLabel(name), set.nature))
      .join("");

    const moveSelects = set.moves.map((moveId, moveIndex) => {
      const options = species.movePool
        .map(id => optionHtml(id, `${MOVE_DEX[id].name}［${MOVE_DEX[id].type}/${getCategoryText(MOVE_DEX[id].category)}］`, moveId))
        .join("");
      return `<div class="form-field"><label>技${moveIndex + 1}</label><select data-role="move" data-move-index="${moveIndex}">${options}</select></div>`;
    }).join("");

    const statPointInputs = Object.keys(STAT_LABELS).map(stat => `
      <div class="sp-field form-field">
        <label>${STAT_LABELS[stat]}</label>
        <input type="number" min="0" max="32" step="1" data-role="stat-point" data-stat="${stat}" value="${set.statPoints[stat]}">
      </div>
    `).join("");

    const statBoxes = Object.keys(STAT_LABELS).map(stat => `
      <div class="stat-box"><span>${STAT_LABELS[stat]}</span><strong>${stats[stat]}</strong></div>
    `).join("");

    card.innerHTML = `
      <div class="slot-title">
        <strong>スロット ${index + 1}　${species.name}</strong>
        <span class="sp-total ${totalSP > 66 ? "over" : ""}">能力P ${totalSP} / 66</span>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label>ポケモン</label>
          <select data-role="species">${speciesOptions}</select>
        </div>
        <div class="form-field">
          <label>性格</label>
          <select data-role="nature">${natureOptions}</select>
          <div class="effect-hint nature-effect">${set.nature}：${getNatureDescription(set.nature)}</div>
        </div>
        <div class="species-summary">
          図鑑No.${species.dexNo ?? "-"}　${species.classification ?? "-"}　${species.height ?? "-"}m / ${species.weight ?? "-"}kg<br>
          種族値：H${species.baseStats.hp} A${species.baseStats.attack} B${species.baseStats.defense} C${species.baseStats.specialAttack} D${species.baseStats.specialDefense} S${species.baseStats.speed}
        </div>
        <div class="form-field">
          <label>特性</label>
          <select data-role="ability">${abilityOptions}</select>
          <div class="effect-hint">${species.abilities.find(a => a.id === set.abilityId)?.description ?? ""}${species.abilities.find(a => a.id === set.abilityId)?.implemented === false ? '<br><span class="not-full">※現在は表示中心</span>' : ""}</div>
        </div>
        <div class="form-field">
          <label>持ち物</label>
          <select data-role="item">${itemOptions}</select>
          <div class="effect-hint">${ITEM_DEX[set.itemId]?.description ?? ""}</div>
        </div>
        <div class="full-width">
          <label style="font-size:12px;font-weight:800;color:#526067;">能力ポイント</label>
          <div class="sp-grid">${statPointInputs}</div>
        </div>
        <div class="full-width">
          <label style="font-size:12px;font-weight:800;color:#526067;">技4つ</label>
          <div class="move-select-grid">${moveSelects}</div>
        </div>
      </div>
      <div class="stat-preview">${statBoxes}</div>
      ${error ? `<div class="notice error" style="margin-bottom:0;">${error}</div>` : ""}
    `;

    card.querySelector('[data-role="species"]').addEventListener("change", event => {
      const newSpecies = SPECIES_DEX[event.target.value];
      set.speciesId = newSpecies.id;
      set.abilityId = newSpecies.abilities[0].id;
      set.moves = newSpecies.movePool.slice(0, 4);
      renderBuilder();
    });

    card.querySelector('[data-role="nature"]').addEventListener("change", event => {
      set.nature = event.target.value;
      renderBuilder();
    });

    card.querySelector('[data-role="ability"]').addEventListener("change", event => {
      set.abilityId = event.target.value;
      renderBuilder();
    });

    card.querySelector('[data-role="item"]').addEventListener("change", event => {
      set.itemId = event.target.value;
      renderBuilder();
    });

    card.querySelectorAll('[data-role="stat-point"]').forEach(input => {
      input.addEventListener("change", event => {
        set.statPoints[event.target.dataset.stat] = normalizeStatPoint(event.target.value);
        renderBuilder();
      });
    });

    card.querySelectorAll('[data-role="move"]').forEach(select => {
      select.addEventListener("change", event => {
        set.moves[Number(event.target.dataset.moveIndex)] = event.target.value;
        renderBuilder();
      });
    });

    builderSlots.appendChild(card);
  });
}

// ============================================================
// バトル用ポケモン生成
// ============================================================
function resetStages(pokemon) {
  pokemon.stages = {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0
  };
}

function createPokemon(set, rosterIndex = 0) {
  const species = SPECIES_DEX[set.speciesId];
  const stats = calculateSetStats(set);
  const ability = species.abilities.find(a => a.id === set.abilityId) || species.abilities[0];
  const item = ITEM_DEX[set.itemId] || ITEM_DEX.none;

  const pokemon = {
    id: species.id,
    rosterIndex,
    name: species.name,
    types: [...species.types],
    baseTypes: [...species.types],
    baseStats: { ...species.baseStats },
    nature: set.nature,
    statPoints: deepClone(set.statPoints),
    ability: { ...ability },
    item: { ...item },
    itemConsumed: false,
    moves: set.moves.map(id => ({ ...deepClone(MOVE_DEX[id]), pp: MOVE_DEX[id].maxPP })),
    maxHP: stats.hp,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    specialAttack: stats.specialAttack,
    specialDefense: stats.specialDefense,
    speed: stats.speed,
    status: null,
    statusTurns: 0,
    toxicCounter: 0,
    side: null,
    choiceLock: null,
    protectChain: 0,
    protectThisTurn: false,
    seeded: false,
    seededBySide: null,
    recoveryBlockTurns: 0,
    lastMoveId: null,
    sameMoveCount: 0,
    abilityUsed: false,
    tempRemovedIce: false,
    formName: species.id === "dolpika" ? FORECAST_FORM_DATA.clear.formName : null
  };
  resetStages(pokemon);
  return pokemon;
}

// ============================================================
// 選出画面
// ============================================================
function setSummaryHtml(set, index) {
  const species = SPECIES_DEX[set.speciesId];
  const ability = species.abilities.find(a => a.id === set.abilityId)?.name || "-";
  const item = ITEM_DEX[set.itemId]?.name || "なし";
  const moves = set.moves.map(id => MOVE_DEX[id]?.name || id).join(" / ");
  return `
    <div class="preview-name">${species.name}</div>
    <div class="preview-meta">
      ${species.types.join(" / ")}<br>
      特性 ${ability}　持ち物 ${item}<br>
      能力補正 ${set.nature}（${getNatureDescription(set.nature)}）　能力P ${getStatPointTotal(set)}/66<br>
      ${moves}
    </div>
  `;
}

function renderSelection() {
  enemyPreview.innerHTML = "";
  playerPreview.innerHTML = "";

  enemyPreviewSets.forEach((set, index) => {
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML = setSummaryHtml(set, index);
    enemyPreview.appendChild(card);
  });

  builderSets.forEach((set, index) => {
    const card = document.createElement("div");
    const order = selectedRosterIndices.indexOf(index);
    card.className = `preview-card${order >= 0 ? " selected" : ""}`;
    card.innerHTML = `${order >= 0 ? `<span class="order-badge">${order + 1}</span>` : ""}${setSummaryHtml(set, index)}`;
    card.addEventListener("click", () => toggleSelection(index));
    playerPreview.appendChild(card);
  });

  selectionCount.textContent = `${selectedRosterIndices.length} / 3`;
  startBattleButton.disabled = selectedRosterIndices.length !== 3;
}

function toggleSelection(index) {
  const existing = selectedRosterIndices.indexOf(index);
  if (existing >= 0) {
    selectedRosterIndices.splice(existing, 1);
  } else if (selectedRosterIndices.length < 3) {
    selectedRosterIndices.push(index);
  }
  renderSelection();
}

function renderDataCounts() {
  if (!dataCounts) return;
  const counts = typeof DATA_PACK_COUNTS !== "undefined"
    ? DATA_PACK_COUNTS
    : {
        species: Object.keys(SPECIES_DEX).length,
        moves: Object.keys(MOVE_DEX).length,
        items: Object.keys(ITEM_DEX).length,
        abilities: new Set(Object.values(SPECIES_DEX).flatMap(s => s.abilities.map(a => a.id))).size
      };

  dataCounts.innerHTML = `
    <span class="data-count-chip">ポケモン ${counts.species}種</span>
    <span class="data-count-chip">技 ${counts.moves}種</span>
    <span class="data-count-chip">特性 ${counts.abilities}種</span>
    <span class="data-count-chip">持ち物 ${counts.items}種</span>
  `;
}

function makeRandomSet(species, usedItemIds = new Set()) {
  const allStats = Object.keys(STAT_LABELS);
  const first = allStats[Math.floor(Math.random() * allStats.length)];
  let second = allStats[Math.floor(Math.random() * allStats.length)];
  while (second === first) second = allStats[Math.floor(Math.random() * allStats.length)];
  let third = allStats[Math.floor(Math.random() * allStats.length)];
  while (third === first || third === second) third = allStats[Math.floor(Math.random() * allStats.length)];

  const statPoints = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  statPoints[first] = 32;
  statPoints[second] = 32;
  statPoints[third] = 2;

  const ability = species.abilities[Math.floor(Math.random() * species.abilities.length)];
  let itemCandidates = Object.values(ITEM_DEX).filter(item =>
    item.id !== "none" && !usedItemIds.has(item.id)
  );
  if (itemCandidates.length === 0) itemCandidates = [ITEM_DEX.none];
  const item = itemCandidates[Math.floor(Math.random() * itemCandidates.length)];
  if (item.id !== "none") usedItemIds.add(item.id);
  const natureNames = Object.keys(NATURES);
  const nature = natureNames[Math.floor(Math.random() * natureNames.length)];
  const moves = shuffle(species.movePool).slice(0, 4);

  return {
    speciesId: species.id,
    abilityId: ability.id,
    itemId: item.id,
    nature,
    statPoints,
    moves
  };
}

function pickClauseLegalSets(library, count = 6) {
  const picked = [];
  const speciesIds = new Set();
  const itemIds = new Set();

  for (const set of shuffle(library)) {
    const speciesKey = getSpeciesClauseKey(set.speciesId);
    if (speciesIds.has(speciesKey)) continue;
    if (set.itemId !== "none" && itemIds.has(set.itemId)) continue;

    picked.push(set);
    speciesIds.add(speciesKey);
    if (set.itemId !== "none") itemIds.add(set.itemId);

    if (picked.length >= count) break;
  }

  return picked;
}

function rerollEnemyRoster(render = true) {
  const library = typeof ENEMY_SET_LIBRARY !== "undefined" ? ENEMY_SET_LIBRARY : DEFAULT_ENEMY_SETS;
  let picked = pickClauseLegalSets(library, 6);

  // 構築例だけで6匹そろわない場合も、種族・持ち物重複なしで補充する。
  if (picked.length < 6) {
    const usedSpecies = new Set(picked.map(set => getSpeciesClauseKey(set.speciesId)));
    const usedItems = new Set(picked.filter(set => set.itemId !== "none").map(set => set.itemId));
    const candidates = shuffle(Object.values(SPECIES_DEX).filter(species => !usedSpecies.has(getSpeciesClauseKey(species.id))));

    for (const species of candidates) {
      if (picked.length >= 6) break;
      const generated = makeRandomSet(species, usedItems);
      picked.push(generated);
      usedSpecies.add(getSpeciesClauseKey(species.id));
    }
  }

  enemyPreviewSets = picked.slice(0, 6).map(set => deepClone(set));
  enemyFullRoster = enemyPreviewSets.map((set, i) => createPokemon(set, i));
  if (render) renderSelection();
}

function openSelection() {
  const error = validateBuilder();
  if (error) {
    setBuilderMessage(error, true);
    return;
  }
  saveBuilderTeam();
  selectedRosterIndices = [];
  playerFullRoster = builderSets.map((set, i) => createPokemon(set, i));
  rerollEnemyRoster(false);
  renderSelection();
  showScreen("selection");
}

// ============================================================
// 対戦状態
// ============================================================
let playerTeam = [];
let enemyTeam = [];
let playerActiveIndex = 0;
let enemyActiveIndex = 0;
let awaitingPlayerSwitch = false;
let battleOver = false;
let turnNumber = 1;
let battleLog = [];
let weather = { type: null, turns: 0 };
let fieldState = { trickRoom: 0, tailwind: { player: 0, enemy: 0 } };

const STRUGGLE_MOVE = {
  id: "struggle",
  name: "わるあがき",
  type: "ノーマル",
  category: "physical",
  power: 50,
  accuracy: null,
  priority: 0,
  maxPP: 1,
  pp: 1,
  struggle: true
};

// ============================================================
// v10.1.4 共通ひんし順序トラッカー
// Champions系の「最後にひんしになった側が残る」判定に使う。
// 実際のHP減少が発生した順序を記録し、両者の最後の1匹が同じ処理中に
// 0になった場合も、反動・自爆・残ターン処理の順序を勝敗へ反映する。
// ============================================================
let v1014FaintSerial = 0;
let v1014PendingCpuDoubleReplacement = null;

function v1014MarkFaint(pokemon, reason = "") {
  if (!pokemon || pokemon.hp > 0 || pokemon.v1014FaintOrder) return;
  pokemon.v1014FaintOrder = ++v1014FaintSerial;
  pokemon.v1014FaintReason = reason || "unknown";
}

function v1014LogFaintOnce(pokemon) {
  if (!pokemon || pokemon.hp > 0 || pokemon.v8FaintLogged) return;
  pokemon.v8FaintLogged = true;
  addLog(`${pokemon.name}は たおれた！`, "log-system");
}

function v1014SideHasPokemon(side) {
  const team = side === "player" ? playerTeam : enemyTeam;
  return team.some(p => p.hp > 0);
}

function v1014LastFaintOrder(side) {
  const team = side === "player" ? playerTeam : enemyTeam;
  return Math.max(0, ...team.map(p => Number(p.v1014FaintOrder || 0)));
}

function v1014WinnerWhenBothOut() {
  const playerOrder = v1014LastFaintOrder("player");
  const enemyOrder = v1014LastFaintOrder("enemy");
  if (playerOrder && enemyOrder && playerOrder !== enemyOrder) {
    // 最後に倒れた側が勝者。
    return playerOrder > enemyOrder ? "player" : "enemy";
  }
  return null;
}

function v1014ResetFaintTrackingForBattle() {
  v1014FaintSerial = 0;
  v1014PendingCpuDoubleReplacement = null;
  [...playerTeam, ...enemyTeam].forEach(p => {
    delete p.v1014FaintOrder;
    delete p.v1014FaintReason;
    p.v8FaintLogged = false;
  });
}

function getPlayerPokemon() { return playerTeam[playerActiveIndex]; }
function getEnemyPokemon() { return enemyTeam[enemyActiveIndex]; }

// ============================================================
// ランク・タイプ相性
// ============================================================
function getStageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
}

function getAccuracyMultiplier(stage) {
  return stage >= 0 ? (3 + stage) / 3 : 3 / (3 + Math.abs(stage));
}

function getDamageStat(pokemon, statName, isAttacker, critical) {
  let stage = pokemon.stages[statName];
  if (critical) {
    if (isAttacker && stage < 0) stage = 0;
    if (!isAttacker && stage > 0) stage = 0;
  }
  return Math.max(1, Math.floor(pokemon[statName] * getStageMultiplier(stage)));
}

function getTypeEffectiveness(moveType, defenderTypes) {
  let multiplier = 1;
  defenderTypes.forEach(type => {
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][type] !== undefined) {
      multiplier *= TYPE_CHART[moveType][type];
    }
  });
  return multiplier;
}

function getEffectivenessText(multiplier) {
  if (multiplier === 4) return "こうかちょうバツグン";
  if (multiplier === 2) return "こうかバツグン";
  if (multiplier === 1) return "こうかあり";
  if (multiplier === 0.5) return "いまひとつ";
  if (multiplier === 0.25) return "かなりいまひとつ";
  if (multiplier === 0) return "こうかなし";
  return "";
}

function getCategoryText(category) {
  if (category === "physical") return "物理";
  if (category === "special") return "特殊";
  return "変化";
}

function getWeatherDamageMultiplier(moveType) {
  if (weather.type === "sun") {
    if (moveType === "ほのお") return 1.5;
    if (moveType === "みず") return 0.5;
  }
  if (weather.type === "rain") {
    if (moveType === "みず") return 1.5;
    if (moveType === "ほのお") return 0.5;
  }
  return 1;
}

function trySitrusBerry(pokemon) {
  if (pokemon.hp <= 0 || pokemon.itemConsumed || pokemon.item.id !== "sitrus-berry") return;
  if (pokemon.hp <= pokemon.maxHP / 2) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.floor(pokemon.maxHP / 4));
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}は オボンのみで ${pokemon.hp - before} HP 回復した！`, "", pokemon);
  }
}

function canPokemonAct(pokemon) {
  if (pokemon.status === "sleep") {
    if (pokemon.statusTurns > 0) {
      pokemon.statusTurns--;
      if (pokemon.statusTurns === 0) {
        pokemon.status = null;
        return { canAct: true, text: `${pokemon.name}は 目を覚ました！` };
      }
      return { canAct: false, text: `${pokemon.name}は ぐうぐう眠っている……` };
    }
  }
  if (pokemon.status === "freeze") {
    if (Math.random() < 0.2) {
      pokemon.status = null;
      return { canAct: true, text: `${pokemon.name}の こおりが とけた！` };
    }
    return { canAct: false, text: `${pokemon.name}は こおっていて 動けない！` };
  }
  if (pokemon.status === "paralysis" && Math.random() < 0.25) {
    return { canAct: false, text: `${pokemon.name}は からだが しびれて 動けない！` };
  }
  return { canAct: true, text: null };
}

function getSynthesisHealRatio() {
  if (weather.type === "sun") return 2 / 3;
  if (["rain", "sand", "snow"].includes(weather.type)) return 1 / 4;
  return 1 / 2;
}

// ============================================================
// ログ
// ============================================================
function addLog(text, className = "") {
  battleLog.push({ text, className });
  if (battleLog.length > 120) battleLog.shift();
  renderLog();
}

function addLogs(logs) {
  logs.forEach(text => addLog(text));
}

function renderLog() {
  battleLogElement.innerHTML = "";
  battleLog.forEach(log => {
    const div = document.createElement("div");
    div.textContent = log.text;
    if (log.className) div.className = log.className;
    battleLogElement.appendChild(div);
  });
  battleLogElement.scrollTop = battleLogElement.scrollHeight;
}

// ============================================================
// バトル表示
// ============================================================
function updateHPBar(pokemon, element) {
  const percent = (pokemon.hp / pokemon.maxHP) * 100;
  element.style.width = `${percent}%`;
  element.style.background = percent > 50 ? "#44a95b" : percent > 20 ? "#e6b83d" : "#d65353";
}

function renderStages(pokemon, container) {
  container.innerHTML = "";
  const labels = { attack: "A", defense: "B", specialAttack: "C", specialDefense: "D", speed: "S", accuracy: "命中", evasion: "回避" };
  Object.keys(labels).forEach(stat => {
    const stage = pokemon.stages[stat];
    if (stage === 0) return;
    const span = document.createElement("span");
    span.className = "stage-item";
    span.textContent = `${labels[stat]} ${stage > 0 ? "+" : ""}${stage}`;
    container.appendChild(span);
  });
}

function renderStatus(pokemon, element) {
  if (!pokemon.status) {
    element.classList.add("hidden");
    element.textContent = "";
    return;
  }
  element.classList.remove("hidden");
  element.textContent = STATUS_NAMES[pokemon.status];
}

function renderTeamStatus(team, activeIndex, container) {
  container.innerHTML = "";
  team.forEach((pokemon, index) => {
    const chip = document.createElement("span");
    chip.className = "team-chip";
    if (index === activeIndex) chip.classList.add("active");
    if (pokemon.hp <= 0) chip.classList.add("fainted");
    chip.textContent = `${pokemon.name}#${pokemon.rosterIndex + 1}${pokemon.status ? `［${STATUS_NAMES[pokemon.status]}］` : ""}${pokemon.hp <= 0 ? " ×" : ""}`;
    container.appendChild(chip);
  });
}

function renderAll() {
  if (!playerTeam.length || !enemyTeam.length) return;
  renderPokemon();
  renderTeamStatus(playerTeam, playerActiveIndex, playerTeamStatus);
  renderTeamStatus(enemyTeam, enemyActiveIndex, enemyTeamStatus);
  renderMoves();
  renderSwitchButtons();
}

// ============================================================
// ひんし・交代
// ============================================================
function healthyIndices(team) {
  return team.map((pokemon, index) => ({ pokemon, index })).filter(entry => entry.pokemon.hp > 0);
}

function chooseEnemyReplacement() {
  const candidates = healthyIndices(enemyTeam).filter(entry => entry.index !== enemyActiveIndex);
  if (candidates.length === 0) return -1;
  const player = getPlayerPokemon();
  let best = candidates[0];
  let bestScore = -Infinity;
  candidates.forEach(entry => {
    const score = bestDamageScoreForPokemon(entry.pokemon, player);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  return best.index;
}

function resolveFaints() {
  const enemy = getEnemyPokemon();
  const player = getPlayerPokemon();
  const enemyFainted = Boolean(enemy && enemy.hp <= 0);
  const playerFainted = Boolean(player && player.hp <= 0);

  if (!enemyFainted && !playerFainted) {
    renderAll();
    return;
  }

  if (enemyFainted) { v1014MarkFaint(enemy, "resolve"); v1014LogFaintOnce(enemy); }
  if (playerFainted) { v1014MarkFaint(player, "resolve"); v1014LogFaintOnce(player); }

  const playerAlive = v1014SideHasPokemon("player");
  const enemyAlive = v1014SideHasPokemon("enemy");

  // まずチーム全体の生存数で勝敗を決める。片側アクティブを先に処理して
  // 「両方最後の1匹なのに先にenemyを見て勝ち」などの陣営依存を起こさない。
  if (!playerAlive || !enemyAlive) {
    battleOver = true;
    awaitingPlayerSwitch = false;
    v1014PendingCpuDoubleReplacement = null;

    if (!playerAlive && !enemyAlive) {
      const winner = v1014WinnerWhenBothOut();
      if (winner === "player") addLog("あなたの勝ち！", "log-system");
      else if (winner === "enemy") addLog("あなたの負け……", "log-system");
      else addLog("両者の最後のポケモンが倒れたため 引き分け！", "log-system");
    } else if (playerAlive) {
      addLog("あなたの勝ち！", "log-system");
    } else {
      addLog("あなたの負け……", "log-system");
    }
    renderAll();
    return;
  }

  // CPU戦で両アクティブが同時に倒れた場合、CPUの交代先を先に内部決定するが、
  // プレイヤーが次ポケモンを選ぶまで公開しない。選択後に双方を同時に場へ出す。
  if (enemyFainted && playerFainted) {
    const next = chooseEnemyReplacement();
    if (next < 0) {
      battleOver = true;
      addLog("あなたの勝ち！", "log-system");
      renderAll();
      return;
    }
    v1014PendingCpuDoubleReplacement = next;
    awaitingPlayerSwitch = true;
    addLog("両者のポケモンが倒れた！ 次に出すポケモンを選んでください。", "log-system");
    renderAll();
    return;
  }

  if (enemyFainted) {
    const next = chooseEnemyReplacement();
    if (next === -1) {
      battleOver = true;
      addLog("あなたの勝ち！", "log-system");
      renderAll();
      return;
    }
    enemySwitch(next, false);
    // 設置技などで交代直後に倒れた場合も連続して判定する。
    if (getEnemyPokemon()?.hp <= 0) {
      resolveFaints();
      return;
    }
  }

  if (playerFainted) {
    awaitingPlayerSwitch = true;
    addLog("次に出すポケモンを選んでください。", "log-system");
  }

  renderAll();
}


// ============================================================
// v5 拡張バトルエンジン
// ============================================================
function getPokemonSide(pokemon) {
  return pokemon?.side || (playerTeam.includes(pokemon) ? "player" : "enemy");
}

function getOpponentSide(side) {
  return side === "player" ? "enemy" : "player";
}

function getActivePokemonBySide(side) {
  return side === "player" ? getPlayerPokemon() : getEnemyPokemon();
}

function getTeamBySide(side) {
  return side === "player" ? playerTeam : enemyTeam;
}

function getActiveIndexBySide(side) {
  return side === "player" ? playerActiveIndex : enemyActiveIndex;
}

function setActiveIndexBySide(side, index) {
  if (side === "player") playerActiveIndex = index;
  else enemyActiveIndex = index;
}

function isChoiceItem(pokemon) {
  return ["choice-band", "choice-specs", "choice-scarf"].includes(pokemon.item.id) && !pokemon.itemConsumed;
}

function isMoveAllowedByItem(pokemon, move) {
  if (pokemon.item.id === "assault-vest" && !pokemon.itemConsumed && move.category === "status") return false;
  if (isChoiceItem(pokemon) && pokemon.choiceLock && move.id !== pokemon.choiceLock) return false;
  return true;
}

function isTrappedByOpponent(pokemon, foe) {
  if (!pokemon || !foe || foe.hp <= 0) return false;
  if (foe.ability.id !== "shadow-tag") return false;
  if (pokemon.types.includes("ゴースト")) return false;
  if (pokemon.ability.id === "shadow-tag") return false;
  return true;
}

const FORECAST_FORM_DATA = {
  clear: { secondType: "ノーマル", formName: "ドルピカのすがた" },
  sun:   { secondType: "ほのお",   formName: "かいせいのすがた" },
  rain:  { secondType: "みず",     formName: "うてんのすがた" },
  sand:  { secondType: "いわ",     formName: "さじんのすがた" },
  snow:  { secondType: "こおり",   formName: "ふうせつのすがた" }
};

function isActivePokemon(pokemon) {
  return pokemon === getPlayerPokemon() || pokemon === getEnemyPokemon();
}

function updateForecastType(pokemon, logChange = false) {
  if (!pokemon || pokemon.ability.id !== "forecast") return false;

  const weatherKey = weather.type || "clear";
  const formData = FORECAST_FORM_DATA[weatherKey] || FORECAST_FORM_DATA.clear;
  const first = pokemon.baseTypes[0] || "でんき";
  const oldFormName = pokemon.formName || FORECAST_FORM_DATA.clear.formName;

  pokemon.types = [first, formData.secondType];
  pokemon.formName = formData.formName;

  const changed = oldFormName !== formData.formName;
  if (changed && logChange && isActivePokemon(pokemon)) {
    addLog(`${pokemon.name}は ${formData.formName}に フォルムチェンジした！`, "log-system");
  }

  return changed;
}

function updateAllForecastTypes(logChanges = false) {
  [...playerTeam, ...enemyTeam].forEach(pokemon => updateForecastType(pokemon, logChanges));
}

function weatherTurnsFromItem(type, source) {
  if (!source || source.itemConsumed) return 5;
  const map = { sun: "heat-rock", rain: "damp-rock", sand: "smooth-rock", snow: "icy-rock" };
  return source.item.id === map[type] ? 8 : 5;
}

function setWeather(type, source = null) {
  // Pokémon Champions仕様：すでに同じ天候なら残りターンは更新しない。
  if (weather.type === type && weather.turns > 0) {
    return false;
  }

  weather.type = type;
  weather.turns = weatherTurnsFromItem(type, source);
  addLog(`${WEATHER_NAMES[type]}になった！`, "log-weather");
  updateAllForecastTypes(true);
  return true;
}

function setTailwind(side) {
  fieldState.tailwind[side] = 4;
  addLog(`${side === "player" ? "自分" : "相手"}の場に おいかぜが吹いた！`, "log-system");
  const active = getActivePokemonBySide(side);
  if (active?.ability.id === "windmill") {
    addLog(changeStage(active, "speed", 1, active));
  }
}

function toggleTrickRoom() {
  if (fieldState.trickRoom > 0) {
    fieldState.trickRoom = 0;
    addLog("トリックルームが 解除された！", "log-system");
  } else {
    fieldState.trickRoom = 5;
    addLog("時空が ゆがんだ！ トリックルーム！", "log-system");
  }
}

function onSwitchOut(pokemon) {
  if (!pokemon) return;
  if (pokemon.ability.id === "regenerator" && pokemon.hp > 0 && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 3)));
    addLog(`${pokemon.name}は さいせいりょくで ${pokemon.hp - before} HP 回復した！`, "log-system", pokemon);
  }
  if (pokemon.ability.id === "natural-cure" && pokemon.status) {
    pokemon.status = null;
    pokemon.statusTurns = 0;
    pokemon.toxicCounter = 0;
    addLog(`${pokemon.name}の 状態異常が しぜんかいふくで治った！`, "log-status");
  }
  resetStages(pokemon);
  if (pokemon.status === "toxic") pokemon.toxicCounter = 1;
  pokemon.choiceLock = null;
  // 反動による「次ターン行動不能」は場を離れると解除される揮発状態。
  // 通常交代は反動ターン中に選べないが、ほえる等で強制交代された場合は持ち越さない。
  pokemon.rechargeNext = false;
  pokemon.protectThisTurn = false;
  pokemon.protectChain = 0;
  pokemon.seeded = false;
  pokemon.seededBySide = null;
  pokemon.lastMoveId = null;
  pokemon.sameMoveCount = 0;
  pokemon.types = [...pokemon.baseTypes];
  if (pokemon.ability.id === "forecast") {
    pokemon.formName = FORECAST_FORM_DATA.clear.formName;
  }
}

function activateEntryAbility(pokemon) {
  if (!pokemon || pokemon.hp <= 0) return;
  updateForecastType(pokemon, true);

  if (pokemon.ability.id === "drizzle") {
    const changed = setWeather("rain", pokemon);
    if (!changed) {
      addLog(`${pokemon.name}の あめふらし！ すでにあめなので残りターンは変わらない。`, "log-weather");
    }
  }

  if (pokemon.ability.id === "sand-stream") {
    const changed = setWeather("sand", pokemon);
    if (!changed) {
      addLog(`${pokemon.name}の すなおこし！ すでにすなあらしなので残りターンは変わらない。`, "log-weather");
    }
  }

  if (pokemon.ability.id === "trick-builder" && !pokemon.abilityUsed) {
    pokemon.abilityUsed = true;
    if (fieldState.trickRoom > 0) {
      addLog(`${pokemon.name}の トリックビルダー！ すでにトリックルーム状態なので残りターンは変わらない。`, "log-system");
    } else {
      fieldState.trickRoom = 5;
      addLog(`${pokemon.name}の トリックビルダー！ トリックルームになった！`, "log-system");
    }
  }
  if (pokemon.ability.id === "windmill" && fieldState.tailwind[getPokemonSide(pokemon)] > 0) {
    addLog(`${pokemon.name}の かざぐるま！`, "log-system");
    addLog(changeStage(pokemon, "speed", 1, pokemon));
  }
  if (pokemon.ability.id === "clean-land") {
    if (fieldState.trickRoom > 0) {
      fieldState.trickRoom = 0;
      addLog(`${pokemon.name}の せいち！ トリックルームを解除した！`, "log-system");
    }
  }
}

function getModifiedStat(pokemon, statName) {
  let value = Math.floor(pokemon[statName] * getStageMultiplier(pokemon.stages[statName] ?? 0));
  if (statName === "speed" && pokemon.status === "paralysis") value = Math.floor(value * 0.5);
  if (statName === "speed" && v6ItemIsActive(pokemon) && pokemon.item.id === "choice-scarf") value = Math.floor(value * 1.5);
  if (statName === "speed" && fieldState.tailwind?.[getPokemonSide(pokemon)] > 0) value *= 2;
  return Math.max(1, value);
}

function getDamageStatV5(pokemon, statName, isAttacker, critical) {
  let stage = pokemon.stages[statName] ?? 0;
  if (critical) {
    if (isAttacker && stage < 0) stage = 0;
    if (!isAttacker && stage > 0) stage = 0;
  }
  let value = Math.max(1, Math.floor(pokemon[statName] * getStageMultiplier(stage)));
  if (isAttacker && statName === "attack" && pokemon.item.id === "choice-band" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  if (isAttacker && statName === "specialAttack" && pokemon.item.id === "choice-specs" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  if (isAttacker && statName === "specialAttack" && pokemon.ability.id === "night-scales") value *= 2;
  if (!isAttacker && statName === "specialDefense" && pokemon.item.id === "assault-vest" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  return Math.max(1, value);
}

function changeStage(pokemon, statName, amount, source = null) {
  if (amount < 0 && source && source !== pokemon) {
    if (["clear-body", "white-smoke"].includes(pokemon.ability.id) || (pokemon.item.id === "clear-amulet" && !pokemon.itemConsumed)) {
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
    const before = pokemon.stages.specialAttack;
    pokemon.stages.specialAttack = clamp(before + 2, -6, 6);
    text += ` ${pokemon.name}の かちきで とくこうが上がった！`;
  }
  return text;
}

function applyStatChanges(pokemon, changes, source = null) {
  return Object.keys(changes).map(statName => changeStage(pokemon, statName, changes[statName], source));
}

function getEffectiveMove(attacker, move) {
  const effective = { ...move };
  if (move.weatherBall) {
    const typeMap = { sun: "ほのお", rain: "みず", sand: "いわ", snow: "こおり" };
    if (weather.type) {
      effective.type = typeMap[weather.type];
      effective.power = 100;
    } else {
      effective.type = "ノーマル";
      effective.power = 50;
    }
  }
  if (attacker.ability.id === "sand-skin" && effective.type === "ノーマル") {
    effective.type = "じめん";
    effective.sandSkinBoost = true;
  }
  if (move.doubleIfTargetStatus) effective.doubleIfTargetStatus = true;
  return effective;
}

function getTypeEffectivenessV5(attacker, defender, move) {
  const effectiveMove = getEffectiveMove(attacker, move);
  let multiplier = 1;
  defender.types.forEach(type => {
    let part = TYPE_CHART[effectiveMove.type]?.[type];
    if (part === undefined) part = 1;
    if (part === 0 && type === "ゴースト" && attacker.ability.id === "scrappy" && ["ノーマル", "かくとう"].includes(effectiveMove.type)) part = 1;
    multiplier *= part;
  });
  return multiplier;
}

function getImmunityResult(attacker, defender, move) {
  const effectiveMove = getEffectiveMove(attacker, move);
  const type = effectiveMove.type;

  if (move.priority > 0 && defender.ability.id === "vivid-body" && move.category !== "status") {
    return { immune: true, text: `${defender.name}の ビビットボディで 先制技を防いだ！` };
  }
  if (move.sound && defender.ability.id === "soundproof") {
    return { immune: true, text: `${defender.name}には 音技が効かない！` };
  }
  if (move.wind && defender.ability.id === "windmill") {
    return { immune: true, text: `${defender.name}は かざぐるまで風技を無効化した！`, statBoost: ["speed", 1] };
  }
  if (type === "じめん") {
    if (defender.ability.id === "levitate") return { immune: true, text: `${defender.name}は ふゆうで じめん技を無効化した！` };
    if (defender.item.id === "air-balloon" && !defender.itemConsumed) return { immune: true, text: `${defender.name}は ふうせんで じめん技を無効化した！` };
    if (defender.ability.id === "earth-eater") return { immune: true, text: `${defender.name}は どしょくで じめん技を吸収した！`, heal: 0.25 };
  }
  if (type === "でんき" && defender.ability.id === "lightning-rod") {
    return { immune: true, text: `${defender.name}の ひらいしん！`, statBoost: ["specialAttack", 1] };
  }
  if (type === "くさ" && defender.ability.id === "sap-sipper") {
    return { immune: true, text: `${defender.name}の そうしょく！`, statBoost: ["attack", 1] };
  }
  if (type === "みず" && defender.ability.id === "dry-skin") {
    return { immune: true, text: `${defender.name}は かんそうはだで みず技を吸収した！`, heal: 0.25 };
  }
  return { immune: false };
}

function applyImmunityResult(defender, result) {
  const logs = [];
  if (result.text) logs.push(result.text);
  if (result.heal && defender.hp > 0 && defender.hp < defender.maxHP) {
    const before = defender.hp;
    defender.hp = Math.min(defender.maxHP, defender.hp + Math.max(1, Math.floor(defender.maxHP * result.heal)));
    logs.push(`${defender.name}は ${defender.hp - before} HP 回復した！`);
  }
  if (result.statBoost) logs.push(changeStage(defender, result.statBoost[0], result.statBoost[1], defender));
  return logs;
}

function moveHasSheerForceEffect(move) {
  return Boolean(move.secondaryStatus || move.targetStatChangeChance || move.selfStatChangeChance);
}

function getAbilityDamageMultiplier(attacker, move) {
  let multiplier = 1;
  if (attacker.hp <= attacker.maxHP / 3) {
    if (attacker.ability.id === "blaze" && move.type === "ほのお") multiplier *= 1.5;
    if (attacker.ability.id === "overgrow" && move.type === "くさ") multiplier *= 1.5;
    if (attacker.ability.id === "torrent" && move.type === "みず") multiplier *= 1.5;
  }
  if (attacker.ability.id === "sharpness" && move.slicing) multiplier *= 1.5;
  if (attacker.ability.id === "sheer-force" && moveHasSheerForceEffect(move)) multiplier *= 1.3;
  if (attacker.ability.id === "infinite-track") multiplier *= Math.min(2, 1 + Math.max(0, attacker.sameMoveCount - 1) * 0.2);
  if (move.sandSkinBoost) multiplier *= 1.2;
  if (move.rainBonus && weather.type === "rain") multiplier *= move.rainBonus;

  const activeAbilities = [getPlayerPokemon()?.ability.id, getEnemyPokemon()?.ability.id];
  if (move.type === "フェアリー" && activeAbilities.includes("fairy-aura")) multiplier *= (4 / 3);
  return multiplier;
}

function getDefensiveAbilityMultiplier(defender, move) {
  let m = 1;
  if (defender.ability.id === "fur-coat" && move.category === "physical") m *= 0.5;
  if (defender.ability.id === "heatproof" && move.type === "ほのお") m *= 0.5;
  if (defender.ability.id === "thick-fat" && ["ほのお", "こおり"].includes(move.type)) m *= 0.5;
  if (defender.ability.id === "dry-skin" && move.type === "ほのお") m *= 1.25;
  return m;
}

function getItemDamageMultiplier(attacker, move, effectiveness, defender) {
  if (attacker.itemConsumed) return 1;
  let m = 1;
  if (attacker.item.id === "life-orb") m *= 1.3;
  if (attacker.item.id === "expert-belt" && effectiveness > 1) m *= 1.2;
  if (attacker.item.id === "muscle-band" && move.category === "physical") m *= 1.1;
  if (attacker.item.id === "wise-glasses" && move.category === "special") m *= 1.1;
  const typeBoosts = {
    "charcoal": "ほのお", "mystic-water": "みず", "miracle-seed": "くさ", "never-melt-ice": "こおり",
    "soft-sand": "じめん", "magnet": "でんき", "silver-powder": "むし", "spell-tag": "ゴースト",
    "black-glasses": "あく", "metal-coat": "はがね", "fairy-feather": "フェアリー"
  };
  if (typeBoosts[attacker.item.id] === move.type) m *= 1.2;
  if (move.knockOff && defender && defender.item.id !== "none" && !defender.itemConsumed) m *= 1.5;
  return m;
}

function checkAccuracy(move, attacker, defender) {
  if (move.accuracy === null) return true;
  if (move.id === "hurricane" || move.id === "thunder") {
    if (weather.type === "rain") return true;
    if (weather.type === "sun") return Math.random() * 100 < 50;
  }
  let accuracy = move.accuracy;
  if (attacker.ability.id === "compound-eyes") accuracy *= 1.3;
  const acc = getAccuracyMultiplier(attacker.stages.accuracy);
  const eva = getAccuracyMultiplier(defender.stages.evasion);
  return Math.random() * 100 < accuracy * (acc / eva);
}

function isCriticalHit(move = null) {
  return Math.random() < (move?.highCrit ? (1 / 8) : (1 / 24));
}

function calculateDamage(attacker, defender, originalMove, options = {}) {
  if (originalMove.category === "status") return { damage: 0, critical: false, effectiveness: 1, move: originalMove };
  const move = getEffectiveMove(attacker, originalMove);
  const effectiveness = getTypeEffectivenessV5(attacker, defender, move);
  if (effectiveness === 0) return { damage: 0, critical: false, effectiveness: 0, move };

  const critical = options.forceCritical ?? isCriticalHit(move);
  let attackStat;
  let defenseStat;

  if (move.category === "physical") {
    if (move.useDefenseAsAttack) attackStat = getDamageStatV5(attacker, "defense", true, critical);
    else attackStat = getDamageStatV5(attacker, "attack", true, critical);
    defenseStat = move.ignoreDefenderStages ? Math.max(1, defender.defense) : getDamageStatV5(defender, "defense", false, critical);
    if (weather.type === "snow" && defender.types.includes("こおり")) defenseStat = Math.floor(defenseStat * 1.5);
  } else {
    attackStat = getDamageStatV5(attacker, "specialAttack", true, critical);
    defenseStat = move.usePhysicalDefense
      ? (move.ignoreDefenderStages ? Math.max(1, defender.defense) : getDamageStatV5(defender, "defense", false, critical))
      : (move.ignoreDefenderStages ? Math.max(1, defender.specialDefense) : getDamageStatV5(defender, "specialDefense", false, critical));
    if (!move.usePhysicalDefense && weather.type === "sand" && defender.types.includes("いわ")) defenseStat = Math.floor(defenseStat * 1.5);
  }

  let power = move.power;
  if (move.doubleIfTargetStatus && defender.status) power *= 2;

  let damage = Math.floor(((((2 * LEVEL / 5 + 2) * power * attackStat / defenseStat) / 50) + 2));
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const random = options.randomFactor ?? (0.85 + Math.random() * 0.15);
  const burnMultiplier = (attacker.status === "burn" && move.category === "physical") ? 0.5 : 1;

  damage = Math.floor(
    damage * stab * effectiveness * random * getWeatherDamageMultiplier(move.type) *
    getAbilityDamageMultiplier(attacker, move) * getDefensiveAbilityMultiplier(defender, move) *
    getItemDamageMultiplier(attacker, move, effectiveness, defender) * (critical ? 1.5 : 1) * burnMultiplier
  );

  return { damage: Math.max(1, damage), critical, effectiveness, move };
}

function tryStatusBerry(pokemon) {
  if (!pokemon.status || pokemon.itemConsumed) return null;
  if (pokemon.item.id === "lum-berry" || (pokemon.item.id === "chesto-berry" && pokemon.status === "sleep")) {
    const old = STATUS_NAMES[pokemon.status];
    pokemon.status = null;
    pokemon.statusTurns = 0;
    pokemon.toxicCounter = 0;
    pokemon.itemConsumed = true;
    return `${pokemon.name}は ${pokemon.item.name}で ${old}を治した！`;
  }
  return null;
}

function canReceiveStatus(pokemon, status) {
  if (pokemon.status) return false;
  if (status === "sleep" && pokemon.ability.id === "sweet-veil") return false;
  if (status === "burn" && pokemon.types.includes("ほのお")) return false;
  if ((status === "poison" || status === "toxic") && (pokemon.types.includes("どく") || pokemon.types.includes("はがね"))) return false;
  if (status === "paralysis" && pokemon.types.includes("でんき")) return false;
  if (status === "freeze" && pokemon.types.includes("こおり")) return false;
  return true;
}

function inflictStatus(pokemon, status) {
  if (!canReceiveStatus(pokemon, status)) return `${pokemon.name}には 効かなかった！`;
  pokemon.status = status;
  if (status === "sleep") pokemon.statusTurns = Math.floor(Math.random() * 3) + 1;
  if (status === "toxic") pokemon.toxicCounter = 1;
  const base = `${pokemon.name}は ${STATUS_NAMES[status]}状態になった！`;
  const berry = tryStatusBerry(pokemon);
  return berry ? `${base} ${berry}` : base;
}

function canRecover(pokemon) {
  return (pokemon.recoveryBlockTurns || 0) <= 0;
}

function executeHealing(pokemon, ratio) {
  if (!canRecover(pokemon)) return `${pokemon.name}は かいふくふうじで 回復できない！`;
  if (pokemon.hp >= pokemon.maxHP) return `${pokemon.name}の HPは 満タンだ！`;
  const before = pokemon.hp;
  pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP * ratio)));
  return `${pokemon.name}は ${pokemon.hp - before} HP 回復した！`;
}

function executeProtect(attacker) {
  const chance = attacker.protectChain <= 0 ? 1 : Math.pow(1 / 3, attacker.protectChain);
  if (Math.random() <= chance) {
    attacker.protectThisTurn = true;
    attacker.protectChain += 1;
    return `${attacker.name}は まもりの体勢に入った！`;
  }
  attacker.protectThisTurn = false;
  attacker.protectChain += 1;
  return "しかし うまく決まらなかった！";
}

function statusMoveTargetsOpponent(move) {
  return Boolean(move.directStatus || move.seedTarget || move.targetStatChanges);
}

function applyTargetStatusMoveEffects(attacker, defender, move, logs) {
  if (move.directStatus) logs.push(inflictStatus(defender, move.directStatus));
  if (move.seedTarget) {
    if (defender.types.includes("くさ")) logs.push(`${defender.name}には やどりぎのタネが効かない！`);
    else if (defender.seeded) logs.push(`${defender.name}には すでにタネが植えつけられている！`);
    else {
      defender.seeded = true;
      defender.seededBySide = getPokemonSide(attacker);
      logs.push(`${defender.name}に やどりぎのタネを植えつけた！`);
    }
  }
  if (move.targetStatChanges) logs.push(...applyStatChanges(defender, move.targetStatChanges, attacker));
}

function autoPivot(side) {
  const team = getTeamBySide(side);
  const currentIndex = getActiveIndexBySide(side);
  const candidates = team.map((p, i) => ({ p, i })).filter(x => x.i !== currentIndex && x.p.hp > 0);
  if (!candidates.length) return;
  candidates.sort((a, b) => (b.p.hp / b.p.maxHP) - (a.p.hp / a.p.maxHP));
  const old = getActivePokemonBySide(side);
  onSwitchOut(old);
  setActiveIndexBySide(side, candidates[0].i);
  const incoming = getActivePokemonBySide(side);
  addLog(`${old.name}は 技の効果で戻った！`, "log-system");
  addLog(`${side === "player" ? "" : "相手は "}${incoming.name}を くりだした！`, "log-system");
  activateEntryAbility(incoming);
}

function useMove(attacker, defender, originalMove) {
  const logs = [];
  const move = getEffectiveMove(attacker, originalMove);

  if (!move.struggle) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    if (!isMoveAllowedByItem(attacker, move)) return [`${attacker.name}は 持ち物の効果で ${move.name}を選べない！`];
    move.pp--;
    // 元の技オブジェクトにもPP減少を反映
    const original = attacker.moves.find(m => m.id === actualOriginalMove.id);
    if (original) original.pp = move.pp;
  }

  if (isChoiceItem(attacker) && !attacker.choiceLock && !move.struggle) attacker.choiceLock = move.id;

  if (attacker.lastMoveId === move.id) attacker.sameMoveCount += 1;
  else attacker.sameMoveCount = 1;
  attacker.lastMoveId = move.id;

  if (!move.protect) attacker.protectChain = 0;

  const actionCheck = canPokemonAct(attacker);
  if (actionCheck.text) logs.push(actionCheck.text);
  if (!actionCheck.canAct) return logs;

  logs.push(`${attacker.name}の ${move.name}！`);

  if (move.category === "status") {
    if (move.protect) {
      logs.push(executeProtect(attacker));
      return logs;
    }
    if (move.accuracy !== null && !checkAccuracy(move, attacker, defender)) {
      logs.push("しかし うまく決まらなかった！");
      return logs;
    }
    if (move.powder && defender.types.includes("くさ")) {
      logs.push(`${defender.name}には こな技が効かない！`);
      return logs;
    }
    if (statusMoveTargetsOpponent(move) && defender.protectThisTurn) {
      logs.push(`${defender.name}は 攻撃を防いだ！`);
      return logs;
    }

    let actualDefender = defender;
    if (statusMoveTargetsOpponent(move) && defender.ability.id === "magic-bounce") {
      logs.push(`${defender.name}の マジックミラーで はね返した！`);
      actualDefender = attacker;
    }

    if (move.weather) {
      const changed = setWeather(move.weather, attacker);
      if (!changed) logs.push("しかし すでに同じ天候なので 効果はなかった！");
    }
    if (move.tailwind) setTailwind(getPokemonSide(attacker));
    if (move.trickRoom) toggleTrickRoom();
    if (move.healRatio) logs.push(executeHealing(attacker, move.healRatio));
    if (move.healByWeather) logs.push(executeHealing(attacker, getSynthesisHealRatio()));
    if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges, attacker));
    if (statusMoveTargetsOpponent(move)) applyTargetStatusMoveEffects(attacker, actualDefender, move, logs);

    if (move.pivot && attacker.hp > 0) autoPivot(getPokemonSide(attacker));
    return logs;
  }

  if (defender.protectThisTurn) {
    logs.push(`${defender.name}は 攻撃を防いだ！`);
    return logs;
  }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) {
    logs.push(...applyImmunityResult(defender, immunity));
    return logs;
  }

  if (!checkAccuracy(move, attacker, defender)) {
    logs.push("しかし こうげきは はずれた！");
    return logs;
  }

  const result = calculateDamage(attacker, defender, move);
  if (result.effectiveness === 0) {
    logs.push(`${defender.name}には こうかがないようだ……`);
    return logs;
  }

  let dealt = result.damage;
  const fullBefore = defender.hp === defender.maxHP;
  if (dealt >= defender.hp && fullBefore && defender.hp > 1) {
    if (defender.ability.id === "sturdy") {
      dealt = defender.hp - 1;
      logs.push(`${defender.name}は がんじょうで耐えた！`);
    } else if (defender.item.id === "focus-sash" && !defender.itemConsumed) {
      dealt = defender.hp - 1;
      defender.itemConsumed = true;
      logs.push(`${defender.name}は きあいのタスキで耐えた！`);
    }
  }

  defender.hp = Math.max(0, defender.hp - dealt);
  logs.push(`${dealt} ダメージ！ ${getEffectivenessText(result.effectiveness)}`);
  if (result.critical) logs.push("急所に当たった！");

  if (move.removeIceUntilEndTurn && attacker.types.includes("こおり")) {
    attacker.types = attacker.types.filter(type => type !== "こおり");
    attacker.tempRemovedIce = true;
    logs.push(`${attacker.name}は このターン こおりタイプではなくなった！`);
  }

  const sheerForceActive = attacker.ability.id === "sheer-force" && moveHasSheerForceEffect(move);
  const cloakBlocks = defender.item.id === "covert-cloak" && !defender.itemConsumed;

  if (move.targetStatChanges && defender.hp > 0) logs.push(...applyStatChanges(defender, move.targetStatChanges, attacker));
  if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges, attacker));

  if (!sheerForceActive && !cloakBlocks && move.targetStatChangeChance && defender.hp > 0 && Math.random() * 100 < move.targetStatChangeChance.chance) {
    logs.push(changeStage(defender, move.targetStatChangeChance.stat, move.targetStatChangeChance.amount, attacker));
  }
  if (!sheerForceActive && move.selfStatChangeChance && attacker.hp > 0 && Math.random() * 100 < move.selfStatChangeChance.chance) {
    logs.push(changeStage(attacker, move.selfStatChangeChance.stat, move.selfStatChangeChance.amount, attacker));
  }
  if (!sheerForceActive && !cloakBlocks && move.secondaryStatus && defender.hp > 0 && Math.random() * 100 < move.secondaryStatus.chance) {
    logs.push(inflictStatus(defender, move.secondaryStatus.status));
  }

  if (move.recoveryBlockTurns && defender.hp > 0) {
    defender.recoveryBlockTurns = Math.max(defender.recoveryBlockTurns || 0, move.recoveryBlockTurns);
    logs.push(`${defender.name}は ${move.recoveryBlockTurns}ターン 回復できなくなった！`);
  }
  if (move.seedTarget && defender.hp > 0 && !defender.types.includes("くさ") && !defender.seeded) {
    defender.seeded = true;
    defender.seededBySide = getPokemonSide(attacker);
    logs.push(`${defender.name}に やどりぎのタネを植えつけた！`);
  }

  if (move.drainRatio && dealt > 0 && attacker.hp > 0 && canRecover(attacker)) {
    const before = attacker.hp;
    attacker.hp = Math.min(attacker.maxHP, attacker.hp + Math.max(1, Math.floor(dealt * move.drainRatio)));
    logs.push(`${attacker.name}は ${attacker.hp - before} HP 吸収した！`);
  }

  if (move.recoilRatio && dealt > 0 && attacker.hp > 0) {
    const recoil = Math.max(1, v10RoundHalfUp(dealt * move.recoilRatio));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
  }
  if (move.recoilMaxHPRatio && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP * move.recoilMaxHPRatio));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
  }
  if (move.struggle && attacker.hp > 0) {
    const recoil = Math.max(1, v10RoundHalfUp(attacker.maxHP / 4));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は わるあがきの反動で ${recoil} ダメージ！`);
  }

  if (move.knockOff && defender.item.id !== "none" && !defender.itemConsumed && defender.hp > 0) {
    defender.itemConsumed = true;
    logs.push(`${defender.name}の ${defender.item.name}を はたき落とした！`);
  }

  if (defender.item.id === "air-balloon" && !defender.itemConsumed && dealt > 0) {
    defender.itemConsumed = true;
    logs.push(`${defender.name}の ふうせんが割れた！`);
  }

  if (move.contact && defender.item.id === "rocky-helmet" && !defender.itemConsumed && attacker.hp > 0) {
    const damage = Math.max(1, Math.floor(attacker.maxHP / 6));
    attacker.hp = Math.max(0, attacker.hp - damage);
    logs.push(`${attacker.name}は ゴツゴツメットで ${damage} ダメージ！`);
  }

  if (dealt > 0 && defender.ability.id === "stamina" && defender.hp > 0) logs.push(changeStage(defender, "defense", 1, defender));
  if (move.contact && defender.ability.id === "gooey" && attacker.hp > 0) logs.push(changeStage(attacker, "speed", -1, defender));

  if (attacker.item.id === "life-orb" && !attacker.itemConsumed && !move.struggle && dealt > 0 && attacker.hp > 0 && !sheerForceActive) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP / 10));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は いのちのたまで ${recoil} ダメージ！`);
  }

  trySitrusBerry(defender);
  trySitrusBerry(attacker);

  if (defender.hp <= 0 && attacker.hp > 0 && attacker.ability.id === "moxie") logs.push(changeStage(attacker, "attack", 1, attacker));

  if (move.pivot && attacker.hp > 0 && defender.hp > 0) autoPivot(getPokemonSide(attacker));
  return logs;
}

function getSelectableMoves(pokemon) {
  return pokemon.moves.filter(move => move.pp > 0 && isMoveAllowedByItem(pokemon, move));
}

function getUsablePlayerMoves() {
  return getSelectableMoves(getPlayerPokemon());
}

function scoreMove(attacker, defender, move) {
  if (!move.struggle && move.pp <= 0) return -9999;
  if (!isMoveAllowedByItem(attacker, move)) return -9999;
  if (move.category === "status") {
    if (move.healRatio || move.healByWeather) {
      if (!canRecover(attacker)) return -50;
      const ratio = attacker.hp / attacker.maxHP;
      if (ratio < 0.35) return 150;
      if (ratio < 0.65) return 70;
      return 5;
    }
    if (move.protect) return attacker.protectChain === 0 ? 22 : 5;
    if (move.weather) return weather.type === move.weather ? 4 : 30;
    if (move.tailwind) return fieldState.tailwind[getPokemonSide(attacker)] > 0 ? 4 : 38;
    if (move.trickRoom) return fieldState.trickRoom > 0 ? 6 : 30;
    if (move.directStatus && defender.status) return 2;
    if (move.selfStatChanges) {
      let score = 34;
      Object.keys(move.selfStatChanges).forEach(stat => { if (attacker.stages[stat] >= 5) score -= 30; });
      return score;
    }
    return 18;
  }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) return 0;
  if (getTypeEffectivenessV5(attacker, defender, move) === 0) return 0;
  const expected = calculateDamage(attacker, defender, move, { randomFactor: 0.925, forceCritical: false }).damage;
  let score = expected * ((move.accuracy ?? 100) / 100);
  if (expected >= defender.hp) score += 100;
  if (move.priority > 0 && defender.hp <= defender.maxHP * 0.3) score += 25;
  if (move.secondaryStatus && !defender.status) score += 8;
  if (move.pivot && attacker.hp < attacker.maxHP * 0.45) score += 12;
  return score;
}

function chooseBestMove(attacker, defender) {
  const available = getSelectableMoves(attacker);
  if (available.length === 0) return { ...STRUGGLE_MOVE };
  let best = available[0];
  let bestScore = -Infinity;
  available.forEach(move => {
    const score = scoreMove(attacker, defender, move) * (0.9 + Math.random() * 0.2);
    if (score > bestScore) { bestScore = score; best = move; }
  });
  return best;
}

function bestDamageScoreForPokemon(attacker, defender) {
  const moves = getSelectableMoves(attacker).filter(m => m.category !== "status");
  if (moves.length === 0) return 0;
  return Math.max(...moves.map(move => scoreMove(attacker, defender, move)));
}

function chooseEnemyAction() {
  const enemy = getEnemyPokemon();
  const player = getPlayerPokemon();
  const currentScore = bestDamageScoreForPokemon(enemy, player);
  const trapped = isTrappedByOpponent(enemy, player);
  const bench = enemyTeam.map((pokemon, index) => ({ pokemon, index }))
    .filter(entry => entry.index !== enemyActiveIndex && entry.pokemon.hp > 0);

  if (!trapped && bench.length > 0) {
    let bestSwitch = null;
    let bestSwitchScore = currentScore;
    bench.forEach(entry => {
      const score = bestDamageScoreForPokemon(entry.pokemon, player);
      if (score > bestSwitchScore) { bestSwitchScore = score; bestSwitch = entry; }
    });
    const badMatchup = bestSwitch && bestSwitchScore > Math.max(25, currentScore * 1.55);
    const endangered = enemy.hp < enemy.maxHP * 0.28 && bestSwitch && bestSwitchScore > currentScore;
    if ((badMatchup && Math.random() < 0.4) || (endangered && Math.random() < 0.55)) return { type: "switch", index: bestSwitch.index };
  }
  return { type: "move", move: chooseBestMove(enemy, player) };
}

function determineFirst(playerMove, enemyMove) {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  if (playerMove.priority > enemyMove.priority) return "player";
  if (enemyMove.priority > playerMove.priority) return "enemy";
  const ps = getModifiedStat(player, "speed");
  const es = getModifiedStat(enemy, "speed");
  if (ps === es) return Math.random() < 0.5 ? "player" : "enemy";
  if (fieldState.trickRoom > 0) return ps < es ? "player" : "enemy";
  return ps > es ? "player" : "enemy";
}

function processResidualForPokemon(pokemon) {
  if (pokemon.hp <= 0) return;

  const poisonHeal = pokemon.ability.id === "poison-heal" && ["poison", "toxic"].includes(pokemon.status);
  if (poisonHeal) {
    if (pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 8)));
      addLog(`${pokemon.name}は ポイズンヒールで ${pokemon.hp - before} HP 回復した！`, "log-status", pokemon);
    }
  } else if (pokemon.status === "burn") {
    let damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    if (pokemon.ability.id === "heatproof") damage = Math.max(1, Math.floor(damage / 2));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は やけどで ${damage} ダメージ！`, "log-status", pokemon);
  } else if (pokemon.status === "poison") {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は どくで ${damage} ダメージ！`, "log-status", pokemon);
  } else if (pokemon.status === "toxic") {
    const damage = Math.max(1, Math.floor((pokemon.maxHP * pokemon.toxicCounter) / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    pokemon.toxicCounter++;
    addLog(`${pokemon.name}は もうどくで ${damage} ダメージ！`, "log-status", pokemon);
  }

  if (pokemon.hp <= 0) return;

  if (pokemon.seeded) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は やどりぎのタネで ${damage} HP 奪われた！`, "log-status", pokemon);
    const source = getActivePokemonBySide(pokemon.seededBySide);
    if (source && source.hp > 0 && canRecover(source)) {
      const before = source.hp;
      source.hp = Math.min(source.maxHP, source.hp + damage);
      if (source.hp > before) addLog(`${source.name}は やどりぎで ${source.hp - before} HP 回復した！`, "log-status", source);
    }
  }

  if (pokemon.hp > 0 && weather.type === "sand" && !pokemon.types.some(t => ["いわ", "じめん", "はがね"].includes(t))) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は すなあらしで ${damage} ダメージ！`, "log-weather", pokemon);
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "dry-skin") {
    if (weather.type === "rain" && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 8)));
      addLog(`${pokemon.name}は かんそうはだで ${pokemon.hp - before} HP 回復した！`, "log-weather", pokemon);
    } else if (weather.type === "sun") {
      const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      addLog(`${pokemon.name}は かんそうはだで ${damage} ダメージ！`, "log-weather", pokemon);
    }
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "hydration" && weather.type === "rain" && pokemon.status) {
    pokemon.status = null; pokemon.statusTurns = 0; pokemon.toxicCounter = 0;
    addLog(`${pokemon.name}は うるおいボディで 状態異常が治った！`, "log-status");
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "leftovers" && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
    addLog(`${pokemon.name}は たべのこしで ${pokemon.hp - before} HP 回復した！`, "", pokemon);
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "black-sludge") {
    if (pokemon.types.includes("どく") && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
      addLog(`${pokemon.name}は くろいヘドロで ${pokemon.hp - before} HP 回復した！`, "", pokemon);
    } else if (!pokemon.types.includes("どく")) {
      const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      addLog(`${pokemon.name}は くろいヘドロで ${damage} ダメージ！`, "", pokemon);
    }
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "toxic-orb" && !pokemon.status) {
    const text = inflictStatus(pokemon, "toxic");
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}の どくどくだまが発動！ ${text}`, "log-status");
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "speed-boost" && pokemon.stages.speed < 6) {
    addLog(changeStage(pokemon, "speed", 1, pokemon));
  }

  trySitrusBerry(pokemon);
  const berry = tryStatusBerry(pokemon);
  if (berry) addLog(berry, "log-status");
}

function endTurn() {
  const active = [getPlayerPokemon(), getEnemyPokemon()].filter(p => p.hp > 0);
  // ターン終了効果は現在の素早さ順。同速時に常にA側先行にならないよう、そのターンだけ抽選する。
  const endTurnTie = new Map(active.map(p => [p, Math.random()]));
  active.sort((a, b) => {
    const diff = getModifiedStat(b, "speed") - getModifiedStat(a, "speed");
    return diff || (endTurnTie.get(a) - endTurnTie.get(b));
  });
  active.forEach(processResidualForPokemon);

  [...playerTeam, ...enemyTeam].forEach(p => {
    p.protectThisTurn = false;
    if (p.recoveryBlockTurns > 0) p.recoveryBlockTurns--;
    if (p.tempRemovedIce) {
      p.types = [...p.baseTypes];
      p.tempRemovedIce = false;
      updateForecastType(p);
    }
  });

  if (weather.type) {
    weather.turns--;
    if (weather.turns <= 0) {
      addLog(`${WEATHER_NAMES[weather.type]}が おさまった。`, "log-weather");
      weather = { type: null, turns: 0 };
      updateAllForecastTypes(true);
    }
  }
  if (fieldState.trickRoom > 0) {
    fieldState.trickRoom--;
    if (fieldState.trickRoom === 0) addLog("トリックルームが 元に戻った。", "log-system");
  }
  ["player", "enemy"].forEach(side => {
    if (fieldState.tailwind[side] > 0) {
      fieldState.tailwind[side]--;
      if (fieldState.tailwind[side] === 0) addLog(`${side === "player" ? "自分" : "相手"}の おいかぜが止んだ。`, "log-system");
    }
  });
}

function itemDisplay(pokemon) {
  if (pokemon.item.id === "air-balloon" && pokemon.itemConsumed) return `${pokemon.item.name}（割れた）`;
  return pokemon.itemConsumed ? `${pokemon.item.name}（使用済み）` : pokemon.item.name;
}

function renderPokemon() {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();

  playerNameText.textContent = player.name;
  playerTypeText.textContent = player.types.join(" / ");
  playerHPText.textContent = `${player.hp} / ${player.maxHP}`;
  playerAbilityText.textContent = player.ability.name;
  playerItemText.textContent = itemDisplay(player);
  playerNatureText.textContent = `${player.nature}（${getNatureDescription(player.nature)}）`;
  updateHPBar(player, playerHPFill);
  renderStages(player, playerStagesText);
  renderStatus(player, playerStatusText);

  opponentNameText.textContent = enemy.name;
  opponentTypeText.textContent = enemy.types.join(" / ");
  opponentHPText.textContent = `${enemy.hp} / ${enemy.maxHP}`;
  opponentAbilityText.textContent = enemy.ability.name;
  opponentItemText.textContent = itemDisplay(enemy);
  opponentNatureText.textContent = `${enemy.nature}（${getNatureDescription(enemy.nature)}）`;
  updateHPBar(enemy, opponentHPFill);
  renderStages(enemy, opponentStagesText);
  renderStatus(enemy, opponentStatusText);

  weatherText.textContent = weather.type ? `${WEATHER_NAMES[weather.type]}（残り${weather.turns}）` : "なし";
  roomText.textContent = fieldState.trickRoom > 0 ? `トリックルーム（残り${fieldState.trickRoom}）` : "なし";
  const tw = [];
  if (fieldState.tailwind.player > 0) tw.push(`自分${fieldState.tailwind.player}`);
  if (fieldState.tailwind.enemy > 0) tw.push(`相手${fieldState.tailwind.enemy}`);
  tailwindText.textContent = tw.length ? tw.join(" / ") : "なし";
  turnText.textContent = turnNumber;
}

function renderMoves() {
  moveContainer.innerHTML = "";
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  const usable = getSelectableMoves(player);
  const movesToRender = usable.length === 0 ? [{ ...STRUGGLE_MOVE }] : player.moves;

  movesToRender.forEach(move => {
    const effective = getEffectiveMove(player, move);
    const button = document.createElement("button");
    button.className = "move-button";
    const power = effective.power === null ? "-" : effective.power;
    const accuracy = effective.accuracy === null ? "-" : effective.accuracy;
    const effect = effective.category === "status" ? "変化技" : getEffectivenessText(getTypeEffectivenessV5(player, enemy, effective));
    const ppLine = effective.struggle ? "PP ∞" : `PP ${move.pp} / ${move.maxPP}`;
    const lockText = isChoiceItem(player) && player.choiceLock && move.id !== player.choiceLock ? " / こだわりロック" : "";
    button.innerHTML = `
      <span class="move-name">${effective.name}</span>
      <span class="move-info">${effective.type} / ${getCategoryText(effective.category)}<br>威力 ${power}　命中 ${accuracy}</span>
      <span class="pp-line">${ppLine}${lockText}</span>
      <span class="effectiveness">${effect}</span>
    `;
    button.disabled = battleOver || awaitingPlayerSwitch || player.hp <= 0 || (!effective.struggle && (move.pp <= 0 || !isMoveAllowedByItem(player, move)));
    button.addEventListener("click", () => processMoveTurn(move));
    moveContainer.appendChild(button);
  });
}

function renderSwitchButtons() {
  switchContainer.innerHTML = "";
  const active = getPlayerPokemon();
  const trapped = !awaitingPlayerSwitch && isTrappedByOpponent(active, getEnemyPokemon());
  const recharging = !awaitingPlayerSwitch && Boolean(active?.rechargeNext);
  playerTeam.forEach((pokemon, index) => {
    const button = document.createElement("button");
    button.className = "switch-button";
    button.textContent = `${pokemon.name}#${pokemon.rosterIndex + 1}　${pokemon.hp}/${pokemon.maxHP}`;
    button.disabled = battleOver || pokemon.hp <= 0 || index === playerActiveIndex || trapped || recharging;
    if (recharging && index !== playerActiveIndex) button.title = "反動で動けないターンは交代できません";
    else if (trapped && index !== playerActiveIndex) button.title = "かげふみで交代できません";
    button.addEventListener("click", () => playerSwitch(index));
    switchContainer.appendChild(button);
  });
}

function resetOnSwitch(pokemon) {
  resetStages(pokemon);
  if (pokemon.status === "toxic") pokemon.toxicCounter = 1;
  pokemon.protectThisTurn = false;
  pokemon.seeded = false;
  pokemon.seededBySide = null;
  pokemon.choiceLock = null;
  pokemon.lastMoveId = null;
  pokemon.sameMoveCount = 0;
}

function enemySwitch(newIndex, announce = true) {
  const old = getEnemyPokemon();
  if (announce) addLog(`相手は ${old.name}を 戻した！`, "log-system");
  onSwitchOut(old);
  enemyActiveIndex = newIndex;
  resetOnSwitch(getEnemyPokemon());
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  activateEntryAbility(getEnemyPokemon());
}

function playerSwitch(newIndex) {
  if (battleOver) return;
  const newPokemon = playerTeam[newIndex];
  if (!newPokemon || newPokemon.hp <= 0 || newIndex === playerActiveIndex) return;

  if (!awaitingPlayerSwitch && getPlayerPokemon()?.rechargeNext) {
    addLog(`${getPlayerPokemon().name}は 反動で交代できない！`, "log-system");
    return;
  }

  if (!awaitingPlayerSwitch && isTrappedByOpponent(getPlayerPokemon(), getEnemyPokemon())) {
    addLog(`${getPlayerPokemon().name}は かげふみで交代できない！`, "log-system");
    return;
  }

  if (awaitingPlayerSwitch) {
    playerActiveIndex = newIndex;
    resetOnSwitch(getPlayerPokemon());
    awaitingPlayerSwitch = false;
    addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
    activateEntryAbility(getPlayerPokemon());
    renderAll();
    if (getPlayerPokemon()?.hp <= 0) resolveFaints();
    return;
  }

  addLog(`ターン ${turnNumber}`, "log-turn");
  const old = getPlayerPokemon();
  const enemyAction = chooseEnemyAction();
  addLog(`${old.name} 戻れ！`);
  onSwitchOut(old);
  playerActiveIndex = newIndex;
  resetOnSwitch(getPlayerPokemon());
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`);
  activateEntryAbility(getPlayerPokemon());

  if (enemyAction.type === "switch") enemySwitch(enemyAction.index, true);
  else if (getEnemyPokemon().hp > 0) addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyAction.move));

  if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

function processMoveTurn(playerMove) {
  if (battleOver || awaitingPlayerSwitch) return;
  let player = getPlayerPokemon();
  let enemy = getEnemyPokemon();
  if (player.hp <= 0 || enemy.hp <= 0) return;
  if (!playerMove.struggle && (playerMove.pp <= 0 || !isMoveAllowedByItem(player, playerMove))) return;

  addLog(`ターン ${turnNumber}`, "log-turn");
  const enemyAction = chooseEnemyAction();

  if (enemyAction.type === "switch") {
    enemySwitch(enemyAction.index, true);
    player = getPlayerPokemon(); enemy = getEnemyPokemon();
    if (player.hp > 0 && enemy.hp > 0) addLogs(useMove(player, enemy, playerMove));
  } else {
    const enemyMove = enemyAction.move;
    const first = determineFirst(playerMove, enemyMove);
    if (first === "player") {
      addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));
      if (getEnemyPokemon().hp > 0 && getPlayerPokemon().hp > 0) addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));
    } else {
      addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));
      if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));
    }
  }

  if (getPlayerPokemon().hp <= 0 || getEnemyPokemon().hp <= 0) {
    turnNumber++;
    resolveFaints();
    renderAll();
    return;
  }

  endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

function startBattleFromSelection() {
  if (selectedRosterIndices.length !== 3) return;

  playerTeam = selectedRosterIndices.map(index => createPokemon(builderSets[index], index));
  const enemySelected = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3);
  enemyTeam = enemySelected.map(index => createPokemon(enemyPreviewSets[index], index));
  playerTeam.forEach(p => p.side = "player");
  enemyTeam.forEach(p => p.side = "enemy");

  playerActiveIndex = 0;
  enemyActiveIndex = 0;
  awaitingPlayerSwitch = false;
  battleOver = false;
  turnNumber = 1;
  battleLog = [];
  weather = { type: null, turns: 0 };
  fieldState = { trickRoom: 0, tailwind: { player: 0, enemy: 0 } };

  showScreen("battle");
  addLog("ニワラバトルを開始！", "log-system");
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  activateEntryAbility(getEnemyPokemon());
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
  activateEntryAbility(getPlayerPokemon());
  renderAll();
}

// ============================================================
// UIイベント
// ============================================================
function getRandomClauseLegalSpecies(count = 6) {
  const result = [];
  const usedKeys = new Set();

  for (const species of shuffle(Object.values(SPECIES_DEX))) {
    const key = getSpeciesClauseKey(species.id);
    if (usedKeys.has(key)) continue;
    result.push(species);
    usedKeys.add(key);
    if (result.length >= count) break;
  }

  return result;
}

randomTeamButton.addEventListener("click", () => {
  const speciesList = getRandomClauseLegalSpecies(6);
  const usedItemIds = new Set();
  builderSets = speciesList.map(species => makeRandomSet(species, usedItemIds)).map(normalizeSet);
  setBuilderMessage("種族・持ち物の重複なしで6匹をランダム編成しました。能力ポイントは各個体66/66です。", false);
  renderBuilder();
});

rerollEnemyButton.addEventListener("click", () => {
  rerollEnemyRoster(true);
  selectedRosterIndices = [];
  renderSelection();
});

recommendedButton.addEventListener("click", () => {
  builderSets = deepClone(DEFAULT_PLAYER_SETS).map(normalizeSet);
  setBuilderMessage("おすすめ編成に戻しました。保存する場合は「編成を保存」を押してください。", false);
  renderBuilder();
});

saveTeamButton.addEventListener("click", saveBuilderTeam);
toSelectionButton.addEventListener("click", openSelection);

clearSelectionButton.addEventListener("click", () => {
  selectedRosterIndices = [];
  renderSelection();
});

startBattleButton.addEventListener("click", startBattleFromSelection);
backToBuilderButton.addEventListener("click", () => showScreen("builder"));
goBuilderButton.addEventListener("click", () => showScreen("builder"));

forfeitButton.addEventListener("click", () => {
  battleOver = true;
  showScreen("selection");
  selectedRosterIndices = [];
  renderSelection();
});

resetAllButton.addEventListener("click", () => {
  if (!window.__NIWARA_RESET_CONFIRMED__) {
    const ok = window.confirm("現在の編成と保存パーティーをすべて削除して初期状態に戻します。\n最大30件の保存パーティーも削除され、元に戻せません。\n\n本当に初期化しますか？");
    if (!ok) return;
    window.__NIWARA_RESET_CONFIRMED__ = true;
  }
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  builderSets = deepClone(DEFAULT_PLAYER_SETS).map(normalizeSet);
  selectedRosterIndices = [];
  setBuilderMessage("現在の編成と保存パーティーを削除して初期状態に戻しました。", false);
  renderBuilder();
  showScreen("builder");
});

// ============================================================
// 起動
// ============================================================
renderDataCounts();
renderBuilder();
setBuilderMessage("v5.2：同じポケモン・同じ持ち物の重複禁止、性格補正表示、Champions準拠の天候再設定・トリックルーム、フォルムチェンジログに対応しました。編成変更後は「編成を保存」で保存できます。", false);
showScreen("builder");
;/* ===== v6 mechanics compatibility ===== */
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
  if (move.recoilRatio) parts.push(`相手が失ったHPの${move.recoilRatio === 1/3 ? "1/3" : move.recoilRatio === 1/4 ? "1/4" : move.recoilRatio === 1/2 ? "1/2" : Math.round(move.recoilRatio * 100) + "%"}を四捨五入（0.5切り上げ）して反動で受ける`);
  if (move.recoilMaxHPRatio) parts.push(`最大HPの${move.recoilMaxHPRatio === 0.5 ? "1/2" : Math.round(move.recoilMaxHPRatio * 100) + "%"}を反動で失う`);
  if (move.recharge) parts.push("攻撃が成功すると、次のターンは反動で技も通常交代も選べない");
  if (move.crashMaxHPRatio) parts.push(`攻撃失敗時、最大HPの${move.crashMaxHPRatio === 0.5 ? "1/2" : Math.round(move.crashMaxHPRatio * 100) + "%"}（端数切り捨て）のダメージを受ける`);
  if (move.selfFaintAfterDamage) parts.push("使用後は攻撃を防がれたり無効化された場合でもひんしになる（しめりけで不発の場合を除く）");
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
  pokemon.encoreSkipEndTurn = false;
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
  pokemon.encoreSkipEndTurn = false;
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
  if (pokemon.encoreTurns > 0 && pokemon.encoreMoveId) {
    const encored = pokemon.moves.find(m => m.id === pokemon.encoreMoveId);
    // Champions: アンコール対象技のPPが0になった時点で効果は即終了。
    if (!encored || encored.pp <= 0) {
      pokemon.encoreTurns = 0;
      pokemon.encoreMoveId = null;
      pokemon.encoreSkipEndTurn = false;
    } else if (move.id !== pokemon.encoreMoveId) {
      return true;
    }
  }
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
  pokemon.encoreSkipEndTurn = false;
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
    addLog(`${pokemon.name}は ステルスロックで ${damage} ダメージ！`, "log-status", pokemon);
  }
  if (pokemon.hp > 0 && state.spikes > 0 && v6IsGrounded(pokemon)) {
    const denom = state.spikes === 1 ? 8 : state.spikes === 2 ? 6 : 4;
    const damage = Math.max(1, Math.floor(pokemon.maxHP / denom));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は まきびしで ${damage} ダメージ！`, "log-status", pokemon);
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

// Champions系の割合反動は「0.5を切り上げる四捨五入」。
// 例: 5ダメージの1/3反動は2、202最大HPのわるあがき1/4は51。
function v10RoundHalfUp(value) {
  return Math.floor(Number(value) + 0.5);
}

function v10ApplyDamageRecoil(attacker, move, damageDealt, logs) {
  if (!move?.recoilRatio || damageDealt <= 0 || attacker.hp <= 0) return;
  const recoil = Math.max(1, v10RoundHalfUp(damageDealt * move.recoilRatio));
  attacker.hp = Math.max(0, attacker.hp - recoil);
  logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
}

function v10ApplyStruggleRecoil(attacker, logs) {
  if (!attacker || attacker.hp <= 0) return;
  const recoil = Math.max(1, v10RoundHalfUp(attacker.maxHP / 4));
  attacker.hp = Math.max(0, attacker.hp - recoil);
  logs.push(`${attacker.name}は わるあがきの反動で ${recoil} ダメージ！`);
}

function v10ApplySelfFaintAfterUse(attacker, move, logs) {
  if (!move?.selfFaintAfterDamage || !attacker || attacker.hp <= 0) return;
  attacker.hp = 0;
  logs.push(`${attacker.name}は 力尽きた！`);
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

// Champions準拠：技が実際に「使用された」時点で最後に使った技として記録する。
// 命中失敗・まもる・ふいうち条件失敗など、技そのものを使って失敗した場合も含む。
// まひ/ねむり等で行動そのものができなかった場合は記録しない。
function v1014RecordLastUsedMove(pokemon, move) {
  if (!pokemon || !move) return;
  if (pokemon.lastMoveId === move.id) pokemon.sameMoveCount = (pokemon.sameMoveCount || 0) + 1;
  else pokemon.sameMoveCount = 1;
  pokemon.lastMoveId = move.id;
  pokemon.lastMoveName = move.name;
}

const V1014_ENCORE_FORBIDDEN_NAMES = new Set([
  "アンコール","ねごと","わるあがき","ものまね","スケッチ","オウムがえし","へんしん",
  "ゆびをふる","ねこのて","まねっこ","さきどり","しぜんのちから"
]);

function v1014EncoreCandidate(pokemon) {
  if (!pokemon?.lastMoveId) return null;
  if (pokemon.lastMoveId === "struggle") return null;
  const owned = pokemon.moves?.find?.(m => m.id === pokemon.lastMoveId) || null;
  const move = owned || MOVE_DEX[pokemon.lastMoveId] || null;
  if (!move) return null;
  if (V1014_ENCORE_FORBIDDEN_NAMES.has(move.name)) return null;
  if (move.encoreTurns || move.sleepTalk || move.callOtherMove || move.transform || move.mimic || move.sketch) return null;
  if (owned && owned.pp <= 0) return null;
  return move;
}

// ============================================================
// useMove v6
// ============================================================

const V52_useMove = useMove;
useMove = function(attacker, defender, originalMove) {
  // 同じターン中に先手アンコールを受けた場合も、選択済みの別技ではなく
  // アンコール対象技を実際に使用する。
  let actualOriginalMove = originalMove;
  if (attacker.encoreTurns > 0 && attacker.encoreMoveId && originalMove?.id !== attacker.encoreMoveId) {
    const forced = attacker.moves.find(m => m.id === attacker.encoreMoveId);
    if (forced && forced.pp > 0) actualOriginalMove = forced;
  }
  const move = getEffectiveMove(attacker, actualOriginalMove);
  const logs = [];
  attacker.hasActedThisTurn = true;
  attacker.lastMoveFailed = false;

  // ギガインパクト等の反動ターンは「技を選んだ扱い」ではなく、ターンそのものを失う。
  // PPを減らさず、状態をここで1回だけ消費する。通常交代もUI/入力側で禁止する。
  if (attacker.rechargeNext) {
    attacker.rechargeNext = false;
    return [`${attacker.name}は 反動で 動けない！`];
  }

  if (!move.struggle) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    if (!isMoveAllowedByItem(attacker, move)) return [`${attacker.name}は ${move.name}を選べない！`];
  }

  // ため状態の2ターン目はPPをもう一度減らさない
  const isSecondChargeTurn = attacker.chargingMoveId === move.id;
  if (!move.struggle && !isSecondChargeTurn) {
    move.pp--;
    const original = attacker.moves.find(m => m.id === actualOriginalMove.id);
    if (original) original.pp = move.pp;
  }

  if (isChoiceItem(attacker) && !attacker.choiceLock && !move.struggle) attacker.choiceLock = move.id;

  if (move.recharge && attacker.rechargeNext) {
    return [`${attacker.name}は 反動で 動けない！`];
  }

  const actionCheck = canPokemonAct(attacker);
  if (actionCheck.text) logs.push(actionCheck.text);
  if (!actionCheck.canAct) { attacker.lastMoveFailed = true; return logs; }

  v1014RecordLastUsedMove(attacker, move);

  // ねごと
  if (move.sleepTalk) {
    logs.push(`${attacker.name}の ${move.name}！`);
    if (attacker.status !== "sleep") { logs.push("しかし うまく決まらなかった！"); attacker.lastMoveFailed = true; return logs; }
    const choices = attacker.moves.filter(m => m.id !== move.id && m.id !== "rest" && m.pp > 0);
    if (!choices.length) { logs.push("しかし うまく決まらなかった！"); return logs; }
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    const savedPP = chosen.pp;
    const savedSameMoveCount = attacker.sameMoveCount;
    const calledLogs = useMove(attacker, defender, chosen);
    // ねごとで呼び出した技は自身のPPを消費せず、「最後に使った技」はねごとのまま。
    chosen.pp = savedPP;
    attacker.lastMoveId = move.id;
    attacker.lastMoveName = move.name;
    attacker.sameMoveCount = savedSameMoveCount;
    return logs.concat(calledLogs);
  }

  // 先制条件技
  const selectedOpponentMove = v6GetSelectedOpponentMove(attacker);
  if (move.suckerPunch && (!selectedOpponentMove || selectedOpponentMove.category === "status" || defender.hasActedThisTurn)) {
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
    if (targetsOpponent && defender.substituteHP > 0 && !move.sound && !move.ignoreSubstitute) { logs.push(`${defender.name}の みがわりが 技を防いだ！`); return logs; }
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
      const encoreMove = v1014EncoreCandidate(actualDefender);
      if (actualDefender.encoreTurns > 0 || !encoreMove) {
        logs.push("しかし うまく決まらなかった！");
      } else {
        actualDefender.encoreTurns = move.encoreTurns;
        actualDefender.encoreMoveId = encoreMove.id;
        // 相手がこのターンすでに行動済みなら、付与ターン終了時には残りターンを減らさない。
        // 未行動ならこのターンの強制行動を1ターン目として数える。
        actualDefender.encoreSkipEndTurn = Boolean(actualDefender.hasActedThisTurn);
        logs.push(`${actualDefender.name}は ${encoreMove.name}を アンコールされた！`);
        v6ConsumeMentalHerb(actualDefender);
      }
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
  if (defender.protectThisTurn && !move.breakProtect) { logs.push(`${defender.name}は 攻撃を防いだ！`); v62ApplyMaxHPRecoil(attacker, move, logs); v10ApplySelfFaintAfterUse(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }
  if (move.breakProtect && defender.protectThisTurn) { defender.protectThisTurn = false; logs.push(`${defender.name}の まもるを 打ち破った！`); }
  if (v6GetSideState(defender.side).quickGuard && move.priority > 0) { logs.push("ファストガードで 先制技を防いだ！"); attacker.lastMoveFailed = true; return logs; }
  if (v6EnsureFieldState().terrain.type === "psychic" && move.priority > 0 && v6IsGrounded(defender)) { logs.push("サイコフィールドで 先制技を防いだ！"); attacker.lastMoveFailed = true; return logs; }
  if (move.requiresTargetItem && (!v6ItemIsActive(defender) || defender.item.id === "none")) { logs.push("しかし 相手が持ち物を持っていない！"); attacker.lastMoveFailed = true; return logs; }
  if (move.requiresTerrain && !v6EnsureFieldState().terrain.type) { logs.push("しかし フィールドがないので失敗した！"); attacker.lastMoveFailed = true; return logs; }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) { logs.push(...applyImmunityResult(defender, immunity)); v62ApplyMaxHPRecoil(attacker, move, logs); v10ApplySelfFaintAfterUse(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }
  if (!checkAccuracy(move, attacker, defender)) { logs.push("しかし こうげきは はずれた！"); v62ApplyMaxHPRecoil(attacker, move, logs); v10ApplySelfFaintAfterUse(attacker, move, logs); attacker.lastMoveFailed = true; attacker.furyCutterCount = 0; attacker.rolloutCount = 0; return logs; }

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

  if (effectiveness === 0) { logs.push(`${defender.name}には こうかがないようだ……`); v62ApplyMaxHPRecoil(attacker, move, logs); v10ApplySelfFaintAfterUse(attacker, move, logs); attacker.lastMoveFailed = true; return logs; }

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
  v10ApplyDamageRecoil(attacker, move, totalDealt, logs);
  v62ApplyMaxHPRecoil(attacker, move, logs);
  if (move.struggle) v10ApplyStruggleRecoil(attacker, logs);
  v10ApplySelfFaintAfterUse(attacker, move, logs);
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
    const before = pokemon.hp; pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16))); addLog(`${pokemon.name}は アクアリングで ${pokemon.hp - before} HP 回復した！`, "log-status", pokemon);
  }
  if (pokemon.cursed) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 4)); pokemon.hp = Math.max(0, pokemon.hp - damage); addLog(`${pokemon.name}は のろいで ${damage} ダメージ！`, "log-status", pokemon);
  }
  if (pokemon.hp > 0 && pokemon.boundTurns > 0) {
    const ratio = pokemon.boundEnhanced ? 1/6 : 1/8; const damage = Math.max(1, Math.floor(pokemon.maxHP * ratio)); pokemon.hp = Math.max(0, pokemon.hp - damage); pokemon.boundTurns--; addLog(`${pokemon.name}は 拘束で ${damage} ダメージ！`, "log-status", pokemon); if (pokemon.boundTurns <= 0) addLog(`${pokemon.name}は 拘束から解放された！`, "log-status");
  }
  if (pokemon.hp > 0 && pokemon.yawnTurns > 0) {
    pokemon.yawnTurns--;
    if (pokemon.yawnTurns === 0 && !pokemon.status) addLog(inflictStatus(pokemon, "sleep"), "log-status");
  }
  const v6 = v6EnsureFieldState();
  if (pokemon.hp > 0 && v6.terrain.type === "grassy" && v6IsGrounded(pokemon) && canRecover(pokemon) && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp; pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16))); addLog(`${pokemon.name}は グラスフィールドで ${pokemon.hp - before} HP 回復した！`, "log-system", pokemon);
  }
};

const V52_endTurn = endTurn;
endTurn = function() {
  V52_endTurn();
  const v6 = v6EnsureFieldState();
  const all = [...playerTeam, ...enemyTeam];
  all.forEach(p => {
    if (p.tauntTurns > 0) p.tauntTurns--;
    if (p.encoreTurns > 0) {
      if (p.encoreSkipEndTurn) {
        p.encoreSkipEndTurn = false;
      } else if (--p.encoreTurns <= 0) {
        p.encoreMoveId = null;
        p.encoreSkipEndTurn = false;
      }
    }
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
        if (p && p.hp > 0 && canRecover(p)) { const before = p.hp; p.hp = Math.min(p.maxHP, p.hp + s.wish.amount); addLog(`${p.name}の 願いがかなった！ ${p.hp - before} HP 回復！`, "log-system", p); }
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
              addLog(`${target.name}の みがわりに みらいよちの攻撃！ ${subDealt} ダメージ！`, "log-system", target);
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
              if (target.hp <= 0) v1014MarkFaint(target, "future-sight");
              addLog(`${target.name}に みらいよちの攻撃！ ${dealt} ダメージ！ ${getEffectivenessText(result.effectiveness)}`, "log-system", target);
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
;/* ===== v6.3 compatibility ===== */
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
  if (v1014PendingCpuDoubleReplacement !== null && !v63PendingPlayerPivot) {
    if (battleOver) return;
    const playerIncoming = playerTeam[newIndex];
    const enemyIndex = v1014PendingCpuDoubleReplacement;
    const enemyIncoming = enemyTeam[enemyIndex];
    if (!playerIncoming || playerIncoming.hp <= 0 || newIndex === playerActiveIndex || !enemyIncoming || enemyIncoming.hp <= 0) return;

    playerActiveIndex = newIndex;
    enemyActiveIndex = enemyIndex;
    resetOnSwitch(playerIncoming);
    resetOnSwitch(enemyIncoming);
    playerIncoming.v8FaintLogged = false;
    enemyIncoming.v8FaintLogged = false;
    v1014PendingCpuDoubleReplacement = null;
    awaitingPlayerSwitch = false;

    // 両者の交代先はプレイヤー選択後に同時公開。登場特性は実効S順で処理。
    const incoming = [
      { side:"player", p:playerIncoming },
      { side:"enemy", p:enemyIncoming }
    ].sort((a,b) => {
      const sa = getModifiedStat(a.p,"speed"), sb = getModifiedStat(b.p,"speed");
      return fieldState.trickRoom > 0 ? sa - sb : sb - sa;
    });
    incoming.forEach(({side,p}) => {
      addLog(`${side === "player" ? "" : "相手は "}${p.name}${side === "player" ? "！ キミにきめた！" : "を くりだした！"}`, "log-system");
      activateEntryAbility(p);
    });
    renderAll();
    if (getPlayerPokemon()?.hp <= 0 || getEnemyPokemon()?.hp <= 0) resolveFaints();
    return;
  }

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
;/* ===== v7 mechanics compatibility ===== */
// ============================================================
// ニワラバトル v7 パッチ
// - 未実装の元データ種 No.33 / 294-300
// - ぎょぐん / スワームチェンジ / おうごんのからだ等の既存仕様
// - ハロウィンパンク + ふしぎなアメ（ゲンシカイキ用の珠型）
// - 新規習得技の特殊効果
// ============================================================

function v7AbilityRef(id) {
  const info = ABILITY_INFO[id];
  return info ? { ...info } : { id, name: id, description: "", implemented: true };
}

function v7IsHalloweenSpecies(pokemon) {
  const species = pokemon && SPECIES_DEX[pokemon.id];
  return species?.formSystem === "halloween";
}

function v7IsMysteryCandyEligible(pokemon) {
  return Boolean(pokemon && v7IsHalloweenSpecies(pokemon) && pokemon.ability?.id === "halloween-punk");
}

function v7HasProtectedMysteryCandy(pokemon) {
  return Boolean(
    v7IsMysteryCandyEligible(pokemon) &&
    pokemon.item?.id === "mystery-candy" &&
    !pokemon.itemConsumed
  );
}

function v7ComputeStatsFromBase(pokemon, baseStats) {
  return {
    hp: calculateHP(baseStats.hp, pokemon.statPoints.hp),
    attack: calculateStat(baseStats.attack, pokemon.statPoints.attack, pokemon.nature, "attack"),
    defense: calculateStat(baseStats.defense, pokemon.statPoints.defense, pokemon.nature, "defense"),
    specialAttack: calculateStat(baseStats.specialAttack, pokemon.statPoints.specialAttack, pokemon.nature, "specialAttack"),
    specialDefense: calculateStat(baseStats.specialDefense, pokemon.statPoints.specialDefense, pokemon.nature, "specialDefense"),
    speed: calculateStat(baseStats.speed, pokemon.statPoints.speed, pokemon.nature, "speed")
  };
}

function v7ApplyForm(pokemon, formKey, logText = null) {
  if (!pokemon) return false;
  const species = SPECIES_DEX[pokemon.id];
  const form = species?.forms?.[formKey];
  if (!form || pokemon.v7FormKey === formKey) return false;

  const oldMax = pokemon.maxHP;
  const oldHP = pokemon.hp;
  const lostHP = Math.max(0, oldMax - oldHP);
  const newStats = v7ComputeStatsFromBase(pokemon, form.baseStats);

  pokemon.v7FormKey = formKey;
  pokemon.name = form.name;
  pokemon.height = form.height ?? pokemon.height;
  pokemon.weight = form.weight ?? pokemon.weight;
  pokemon.baseStats = { ...form.baseStats };
  pokemon.maxHP = newStats.hp;
  pokemon.attack = newStats.attack;
  pokemon.defense = newStats.defense;
  pokemon.specialAttack = newStats.specialAttack;
  pokemon.specialDefense = newStats.specialDefense;
  pokemon.speed = newStats.speed;

  if (oldHP <= 0) pokemon.hp = 0;
  else pokemon.hp = Math.max(1, Math.min(pokemon.maxHP, pokemon.maxHP - lostHP));

  if (logText) addLog(logText, "log-system");
  return true;
}

function v7CheckSoljiendForm(pokemon, phase = "end") {
  if (!pokemon || pokemon.id !== "soljiend" || pokemon.hp <= 0) return;
  if (pokemon.v7FormKey === "perfect") return;

  if (pokemon.ability.id === "schooling") {
    const shouldSchool = LEVEL >= 20 && pokemon.hp > pokemon.maxHP / 4;
    const target = shouldSchool ? "school" : "solo";
    if (pokemon.v7FormKey !== target) {
      const formName = SPECIES_DEX.soljiend.forms[target].name;
      v7ApplyForm(pokemon, target, `${pokemon.name}の ぎょぐん！ ${formName}に 変化した！`);
    }
  }

  if (pokemon.ability.id === "power-construct" && phase === "end" && pokemon.hp <= pokemon.maxHP / 2) {
    v7ApplyForm(pokemon, "perfect", `${pokemon.name}の スワームチェンジ！ パーフェクトフォルムに 変化した！`);
  }
}

function v7TryHalloweenReversion(pokemon) {
  if (!pokemon || !v7IsHalloweenSpecies(pokemon)) return false;
  if (pokemon.v7FormKey === "trick") return false;
  if (!v7HasProtectedMysteryCandy(pokemon)) return false;
  const species = SPECIES_DEX[pokemon.id];
  const targetName = species.forms.trick.name;
  addLog(`${pokemon.name}の ふしぎなアメが反応した！`, "log-system");
  const changed = v7ApplyForm(pokemon, "trick", `${pokemon.name}は ${targetName}に 変化した！`);
  pokemon.v7PrimalLikeChanged = true;
  return changed;
}

// ------------------------------------------------------------
// インスタンス初期化
// ------------------------------------------------------------
const V7_prevCreatePokemon = createPokemon;
createPokemon = function(set, rosterIndex = 0) {
  const pokemon = V7_prevCreatePokemon(set, rosterIndex);
  const species = SPECIES_DEX[set.speciesId];
  pokemon.v7FormKey = species?.formSystem === "soljiend" ? "solo" : species?.formSystem === "halloween" ? "treat" : null;
  pokemon.v7PrimalLikeChanged = false;
  pokemon.v7ProtectStyle = null;
  pokemon.v7Ingrain = false;
  pokemon.v7JawLocked = false;
  pokemon.v7LunarDancePending = false;
  return pokemon;
};

// ------------------------------------------------------------
// データ件数表示（v5時点の固定値ではなく実データを数える）
// ------------------------------------------------------------
renderDataCounts = function() {
  if (!dataCounts) return;
  const abilityIds = new Set(Object.values(SPECIES_DEX).flatMap(s => s.abilities.map(a => a.id)));
  dataCounts.innerHTML = `
    <span class="data-count-chip">ポケモン ${Object.keys(SPECIES_DEX).length}種</span>
    <span class="data-count-chip">技 ${Object.keys(MOVE_DEX).length}種</span>
    <span class="data-count-chip">特性 ${abilityIds.size}種</span>
    <span class="data-count-chip">持ち物 ${Object.keys(ITEM_DEX).length}種</span>
  `;
};

// ------------------------------------------------------------
// 場データ拡張: どくびし / みかづきのまい
// ------------------------------------------------------------
function v7EnsureSideState(side) {
  const state = v6GetSideState(side);
  if (state.toxicSpikes === undefined) state.toxicSpikes = 0;
  if (state.lunarDance === undefined) state.lunarDance = false;
  return state;
}
["player", "enemy"].forEach(v7EnsureSideState);

const V7_prevApplyHazard = v6ApplyHazard;
v6ApplyHazard = function(side, hazard, logs) {
  if (hazard === "toxicSpikes") {
    const state = v7EnsureSideState(side);
    if (state.toxicSpikes >= 2) logs.push("どくびしは これ以上重ねられない！");
    else {
      state.toxicSpikes++;
      logs.push(`${side === "player" ? "自分" : "相手"}の場に どくびしをまいた！（${state.toxicSpikes}段）`);
    }
    return;
  }
  return V7_prevApplyHazard(side, hazard, logs);
};

const V7_prevClearHazardsAndScreens = v6ClearHazardsAndScreens;
v6ClearHazardsAndScreens = function() {
  V7_prevClearHazardsAndScreens();
  ["player", "enemy"].forEach(side => { v7EnsureSideState(side).toxicSpikes = 0; });
};

// ------------------------------------------------------------
// 既存特性
// ------------------------------------------------------------
const V7_prevCanReceiveStatus = canReceiveStatus;
canReceiveStatus = function(pokemon, status) {
  if (pokemon?.ability?.id === "water-bubble" && status === "burn") return false;
  return V7_prevCanReceiveStatus(pokemon, status);
};

const V7_prevGetEffectiveMove = getEffectiveMove;
getEffectiveMove = function(attacker, move) {
  const effective = V7_prevGetEffectiveMove(attacker, move);
  if (effective.goldenBurn) {
    const atk = getModifiedStat(attacker, "attack");
    const spa = getModifiedStat(attacker, "specialAttack");
    effective.category = atk >= spa ? "physical" : "special";
  }
  return effective;
};

const V7_prevGetImmunityResult = getImmunityResult;
getImmunityResult = function(attacker, defender, move) {
  if (move?.ignoreDefenderAbility) {
    const saved = defender.ability;
    defender.ability = { id: "v7-ignored", name: "-", description: "" };
    const result = V7_prevGetImmunityResult(attacker, defender, move);
    defender.ability = saved;
    return result;
  }
  return V7_prevGetImmunityResult(attacker, defender, move);
};

const V7_prevGetDefensiveAbilityMultiplier = getDefensiveAbilityMultiplier;
getDefensiveAbilityMultiplier = function(defender, move) {
  if (move?.ignoreDefenderAbility) return 1;
  let m = V7_prevGetDefensiveAbilityMultiplier(defender, move);
  if (defender.ability.id === "water-bubble" && move.type === "ほのお") m *= 0.5;
  return m;
};

const V7_prevGetAbilityDamageMultiplier = getAbilityDamageMultiplier;
getAbilityDamageMultiplier = function(attacker, move) {
  let m = V7_prevGetAbilityDamageMultiplier(attacker, move);
  if (attacker.ability.id === "water-bubble" && move.type === "みず") m *= 2;
  return m;
};

const V7_prevCalculateDamage = calculateDamage;
calculateDamage = function(attacker, defender, move, options = {}) {
  let attackerStageStat = null;
  let defenderStageStat = null;
  let savedAttackerStage = null;
  let savedDefenderStage = null;

  const effective = getEffectiveMove(attacker, move);
  const physical = effective.category === "physical";
  attackerStageStat = physical ? (effective.useDefenseAsAttack ? "defense" : "attack") : "specialAttack";
  defenderStageStat = physical || effective.usePhysicalDefense ? "defense" : "specialDefense";

  if (defender.ability.id === "unaware" && !effective.ignoreDefenderAbility) {
    savedAttackerStage = attacker.stages[attackerStageStat];
    attacker.stages[attackerStageStat] = 0;
  }
  if (attacker.ability.id === "unaware") {
    savedDefenderStage = defender.stages[defenderStageStat];
    defender.stages[defenderStageStat] = 0;
  }

  let savedDefAbility = null;
  if (effective.ignoreDefenderAbility) {
    savedDefAbility = defender.ability;
    defender.ability = { id: "v7-ignored", name: "-", description: "" };
  }

  const result = V7_prevCalculateDamage(attacker, defender, effective, options);

  if (savedAttackerStage !== null) attacker.stages[attackerStageStat] = savedAttackerStage;
  if (savedDefenderStage !== null) defender.stages[defenderStageStat] = savedDefenderStage;
  if (savedDefAbility) defender.ability = savedDefAbility;

  if (result.damage > 0) {
    const eff = result.effectiveness;
    if (attacker.ability.id === "adaptability" && attacker.types.includes(result.move.type)) {
      result.damage = Math.max(1, Math.floor(result.damage * 4 / 3)); // 1.5 -> 2.0
    }
    if (attacker.ability.id === "tinted-lens" && eff > 0 && eff < 1) result.damage = Math.max(1, Math.floor(result.damage * 2));
    if (effective.beelineBeam && eff > 0 && eff < 1) result.damage = Math.max(1, Math.floor(result.damage * 2));
  }
  return result;
};

// ------------------------------------------------------------
// 動的威力 / 連続回数
// ------------------------------------------------------------
const V7_prevDynamicPower = v6DynamicPower;
v6DynamicPower = function(attacker, defender, move) {
  if (move.venoshock) return ["poison", "toxic"].includes(defender.status) ? move.power * 2 : move.power;
  if (move.beatUp) {
    // 本編と同様に味方の基礎こうげき依存。打撃ごとの参加者は後述の回数判定で決める。
    const team = getTeamBySide(attacker.side) || [];
    const member = team.find(p => p.hp > 0 && !p.status) || attacker;
    const base = member.baseStats?.attack ?? attacker.baseStats.attack;
    return Math.floor(base / 10) + 5;
  }
  return V7_prevDynamicPower(attacker, defender, move);
};

const V7_prevResolveMultiHitCount = v6ResolveMultiHitCount;
v6ResolveMultiHitCount = function(attacker, move) {
  if (move.beatUp) {
    const team = getTeamBySide(attacker.side) || [];
    return Math.max(1, team.filter(p => p.hp > 0 && !p.status).length);
  }
  return V7_prevResolveMultiHitCount(attacker, move);
};

// ------------------------------------------------------------
// 交代不能: ねをはる / くらいつく
// ------------------------------------------------------------
const V7_prevIsTrappedByOpponent = isTrappedByOpponent;
isTrappedByOpponent = function(pokemon, foe) {
  if (pokemon?.v7Ingrain) return true;
  if (pokemon?.v7JawLocked && foe?.v7JawLocked && foe.hp > 0) return true;
  return V7_prevIsTrappedByOpponent(pokemon, foe);
};

const V7_prevOnSwitchOut = onSwitchOut;
onSwitchOut = function(pokemon) {
  const foe = pokemon?.side ? getActivePokemonBySide(getOpponentSide(pokemon.side)) : null;
  if (pokemon?.v7JawLocked) {
    pokemon.v7JawLocked = false;
    if (foe) foe.v7JawLocked = false;
  }
  V7_prevOnSwitchOut(pokemon);
};

// ------------------------------------------------------------
// ふしぎなアメ: 専用個体から外せない / Knock Off強化なし
// ------------------------------------------------------------
const V7_prevItemDamageMultiplier = getItemDamageMultiplier;
getItemDamageMultiplier = function(attacker, move, effectiveness, defender) {
  let m = V7_prevItemDamageMultiplier(attacker, move, effectiveness, defender);
  if (move?.knockOff && v7HasProtectedMysteryCandy(defender)) m /= 1.5;
  // Magic Guard + Life Orb 用エイリアス
  if (attacker?.item?.id === "life-orb-magic") {
    const saved = attacker.item.id;
    attacker.item.id = "life-orb";
    const exact = V7_prevItemDamageMultiplier(attacker, move, effectiveness, defender);
    attacker.item.id = saved;
    return move?.knockOff && v7HasProtectedMysteryCandy(defender) ? exact / 1.5 : exact;
  }
  return m;
};

// ------------------------------------------------------------
// Status対象判定: なかまづくりを含める
// ------------------------------------------------------------
const V7_prevStatusTargetsOpponent = v6StatusMoveTargetsOpponent;
v6StatusMoveTargetsOpponent = function(move) {
  return V7_prevStatusTargetsOpponent(move) || Boolean(move.entrainment || move.swapItems || move.painSplit || move.curse);
};

function v7MoveSucceeded(logs) {
  const joined = logs.join(" ");
  return !/(はずれた|うまく決まらなかった|効かない|防いだ|動けない|PPが ない)/.test(joined);
}

function v7RunAsBlocked(attacker, defender, move, message) {
  const saved = defender.protectThisTurn;
  defender.protectThisTurn = true;
  const logs = V7_coreUseMove(attacker, defender, move);
  defender.protectThisTurn = saved;
  let replaced = false;
  const out = logs.map(line => {
    if (line.includes("攻撃を防いだ")) { replaced = true; return message; }
    return line;
  });
  if (!replaced && v7MoveSucceeded(out)) out.push(message);
  return out;
}

// ------------------------------------------------------------
// 技処理最終ラッパー
// ------------------------------------------------------------
const V7_coreUseMove = useMove;
useMove = function(attacker, defender, originalMove) {
  let move = getEffectiveMove(attacker, originalMove);

  // であいがしら: 場に出た最初のターン（最初の行動）だけ。
  if (move.firstTurnOnly && (attacker.turnsOnField || 0) > 0) {
    return v7RunAsBlocked(attacker, defender, move, "しかし うまく決まらなかった！");
  }

  // しめりけ: だいばくはつ / ミストバースト等の爆発技を不発にする。
  // 特性の公開情報にも正しく反映できるよう、発動者名と特性名をログへ出す。
  if (move.explosive) {
    const dampHolder = [attacker, defender].find(p => p?.ability?.id === "damp");
    if (dampHolder) {
      const dampBlockedMove = move.selfFaintAfterDamage ? { ...move, selfFaintAfterDamage: false } : move;
      return v7RunAsBlocked(attacker, defender, dampBlockedMove, `${dampHolder.name}の ${dampHolder.ability.name}で ${move.name}は 不発になった！`);
    }
  }

  // おうごんのからだ: 相手からの変化技を無効化。
  if (move.category === "status" && v6StatusMoveTargetsOpponent(move) && defender.ability.id === "good-as-gold") {
    return v7RunAsBlocked(attacker, defender, move, `${defender.name}の おうごんのからだで 変化技を無効化した！`);
  }

  // 特性を書き換える技: 変更・コピー不可特性は失敗。
  if (move.setAbility && V7_UNCHANGEABLE_ABILITY_IDS.has(defender.ability.id)) {
    return v7RunAsBlocked(attacker, defender, move, "しかし 特性を変えることができない！");
  }

  // なかまづくり: 変更・コピー不可特性は失敗。
  if (move.entrainment) {
    if (V7_UNCHANGEABLE_ABILITY_IDS.has(attacker.ability.id) || V7_UNCHANGEABLE_ABILITY_IDS.has(defender.ability.id)) {
      return v7RunAsBlocked(attacker, defender, move, "しかし 特性を変えることができない！");
    }
    move = { ...move, setAbility: attacker.ability.id };
  }

  // ふしぎなアメは、対応個体からはトリック/すりかえ不可。
  if (move.swapItems && (
    v7HasProtectedMysteryCandy(attacker) || v7HasProtectedMysteryCandy(defender) ||
    (attacker.item?.id === "mystery-candy" && !attacker.itemConsumed && v7IsMysteryCandyEligible(defender)) ||
    (defender.item?.id === "mystery-candy" && !defender.itemConsumed && v7IsMysteryCandyEligible(attacker))
  )) {
    const patched = { ...move, swapItems: false };
    const logs = V7_coreUseMove(attacker, defender, patched);
    if (v7MoveSucceeded(logs)) logs.push("しかし ふしぎなアメは 入れ替えられない！");
    return logs;
  }

  const savedDefConsumed = defender.itemConsumed;
  const protectCandyFromKnock = move.knockOff && v7HasProtectedMysteryCandy(defender);
  if (protectCandyFromKnock) defender.itemConsumed = true;

  // マジックガード: 反動技といのちのたま等の間接ダメージを無効化（わるあがき除外）。
  let magicGuardItem = false;
  let savedItem = null;
  if (attacker.ability.id === "magic-guard" && !move.struggle) {
    move = { ...move, recoilRatio: null, recoilMaxHPRatio: null, crashMaxHPRatio: null };
    if (attacker.item?.id === "life-orb" && !attacker.itemConsumed) {
      savedItem = attacker.item;
      attacker.item = { ...attacker.item, id: "life-orb-magic" };
      magicGuardItem = true;
    }
  }

  const defenderProtectStyle = defender.v7ProtectStyle;
  const beforeDefHP = defender.hp;
  const beforeAttHP = attacker.hp;
  let savedDefenderAbilityForMove = null;
  if (move.ignoreDefenderAbility) {
    savedDefenderAbilityForMove = defender.ability;
    defender.ability = { id: "v7-ignored", name: "-", description: "" };
  }
  let logs = V7_coreUseMove(attacker, defender, move);
  if (savedDefenderAbilityForMove) defender.ability = savedDefenderAbilityForMove;

  if (magicGuardItem) attacker.item = savedItem;
  if (protectCandyFromKnock) defender.itemConsumed = savedDefConsumed;

  // なかまづくり成功時の表示・正式データへ差し替え。
  if (move.entrainment && v7MoveSucceeded(logs) && defender.hp > 0) {
    defender.ability = v7AbilityRef(attacker.ability.id);
    logs.push(`${defender.name}の 特性は ${defender.ability.name}になった！`);
  }

  // 防御系専用技。
  if ((move.id === "v7-bachibachi-barrier" || move.id === "v7-bubble-guard") && logs.some(x => x.includes("まもりの体勢"))) {
    attacker.v7ProtectStyle = move.id;
    if (move.cureStatusOnProtect && attacker.status) {
      const old = STATUS_NAMES[attacker.status] || attacker.status;
      attacker.status = null; attacker.statusTurns = 0; attacker.toxicCounter = 0;
      logs.push(`${attacker.name}は ${old}を治した！`);
    }
  }
  if (defenderProtectStyle === "v7-bachibachi-barrier" && move.contact && logs.some(x => x.includes("攻撃を防いだ")) && attacker.hp > 0) {
    logs.push(inflictStatus(attacker, "paralysis"));
  }

  // サンダーダイブ: 失敗時のクラッシュダメージ。
  if (move.crashMaxHPRatio && logs.some(x => /はずれた|効かない|防いだ/.test(x)) && attacker.hp > 0 && attacker.ability.id !== "magic-guard") {
    const damage = Math.max(1, Math.floor(attacker.maxHP * move.crashMaxHPRatio));
    attacker.hp = Math.max(0, attacker.hp - damage);
    logs.push(`${attacker.name}は 勢い余って ${damage} ダメージ！`);
  }

  // ねをはる
  if (move.ingrain && v7MoveSucceeded(logs) && attacker.hp > 0) {
    attacker.v7Ingrain = true;
    logs.push(`${attacker.name}は 根を張った！`);
  }

  // くらいつく
  if (move.jawLock && defender.hp > 0 && defender.hp < beforeDefHP && v7MoveSucceeded(logs)) {
    attacker.v7JawLocked = true;
    defender.v7JawLocked = true;
    logs.push(`${attacker.name}と ${defender.name}は 逃げられなくなった！`);
  }

  // とどめばり
  if (move.fellStinger && beforeDefHP > 0 && defender.hp <= 0 && attacker.hp > 0) {
    logs.push(changeStage(attacker, "attack", 3, attacker));
  }

  // フラットタックル: 設置物・壁・フィールド・ルームのみ消去（天候/追い風は残す）
  if (move.clearFieldStructures && defender.hp < beforeDefHP && v7MoveSucceeded(logs)) {
    ["player", "enemy"].forEach(side => {
      const s = v7EnsureSideState(side);
      s.stealthRock = false; s.spikes = 0; s.toxicSpikes = 0;
      s.reflect = 0; s.lightScreen = 0; s.mist = 0; s.safeguard = 0;
    });
    const f = v6EnsureFieldState();
    f.terrain = { type: null, turns: 0 };
    f.gravity = 0; f.magicRoom = 0; f.wonderRoom = 0;
    fieldState.trickRoom = 0;
    logs.push("互いの設置物・壁・フィールド・ルーム系状態が 消えた！");
  }

  // みかづきのまい
  if (move.lunarDance && logs.some(x => x.includes("力尽きた"))) {
    v7EnsureSideState(attacker.side).lunarDance = true;
    logs.push(`${attacker.name}は 次に出る味方へ 力を託した！`);
  }

  // ふしぎなアメ Knock Off: アイテムは残り、威力上昇も別関数で無効化済み。
  if (protectCandyFromKnock && v7MoveSucceeded(logs) && defender.hp < beforeDefHP) {
    logs = logs.filter(x => !x.includes("はたき落とした"));
    logs.push(`${defender.name}の ふしぎなアメは はたき落とせない！`);
  }

  // マジックガードで旧処理のいのちのたまログが万一残った場合を除去・返金。
  if (attacker.ability.id === "magic-guard") {
    let refund = 0;
    logs = logs.filter(line => {
      const m = line.match(/いのちのたまで (\d+) ダメージ/);
      if (m) { refund += Number(m[1]); return false; }
      return true;
    });
    if (refund) attacker.hp = Math.min(attacker.maxHP, attacker.hp + refund);
  }

  return logs;
};

// ------------------------------------------------------------
// どくびし / マジックガード / ねをはる ターン終了
// ------------------------------------------------------------
const V7_prevResidual = processResidualForPokemon;
processResidualForPokemon = function(pokemon) {
  if (!pokemon) return;

  if (pokemon.ability.id === "magic-guard") {
    const saved = {
      status: pokemon.status,
      statusTurns: pokemon.statusTurns,
      toxicCounter: pokemon.toxicCounter,
      seeded: pokemon.seeded,
      seededBySide: pokemon.seededBySide,
      cursed: pokemon.cursed,
      boundTurns: pokemon.boundTurns,
      boundSourceSide: pokemon.boundSourceSide,
      boundEnhanced: pokemon.boundEnhanced,
      types: [...pokemon.types],
      itemConsumed: pokemon.itemConsumed
    };
    pokemon.status = null;
    pokemon.seeded = false;
    pokemon.cursed = false;
    pokemon.boundTurns = 0;
    if (weather.type === "sand" && !pokemon.types.includes("いわ")) pokemon.types = [...pokemon.types, "いわ"];
    if (pokemon.item.id === "black-sludge" && !pokemon.types.includes("どく")) pokemon.itemConsumed = true;
    V7_prevResidual(pokemon);
    const newlyInflictedStatus = saved.status ? null : pokemon.status;
    pokemon.status = saved.status || newlyInflictedStatus;
    pokemon.statusTurns = saved.status ? saved.statusTurns : pokemon.statusTurns;
    pokemon.toxicCounter = pokemon.status === "toxic"
      ? (saved.status === "toxic" ? saved.toxicCounter + 1 : Math.max(1, pokemon.toxicCounter || 1))
      : 0;
    pokemon.seeded = saved.seeded;
    pokemon.seededBySide = saved.seededBySide;
    pokemon.cursed = saved.cursed;
    pokemon.boundTurns = saved.boundTurns;
    pokemon.boundSourceSide = saved.boundSourceSide;
    pokemon.boundEnhanced = saved.boundEnhanced;
    pokemon.types = saved.types;
    pokemon.itemConsumed = saved.itemConsumed;
  } else {
    V7_prevResidual(pokemon);
  }

  if (pokemon.hp > 0 && pokemon.v7Ingrain && canRecover(pokemon) && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
    addLog(`${pokemon.name}は ねをはるで ${pokemon.hp - before} HP 回復した！`, "log-status", pokemon);
  }
};

// マジックガードはステルスロック/まきびし等のダメージを受けない。
// どくびしの状態異常付与はこの後のEntry処理で別に行う。
const V7_prevEntryHazards = v6EntryHazards;
v6EntryHazards = function(pokemon) {
  if (pokemon?.ability?.id === "magic-guard") return;
  return V7_prevEntryHazards(pokemon);
};

// ------------------------------------------------------------
// Entry: ふしぎなアメ、ぎょぐん、どくびし、みかづきのまい
// ------------------------------------------------------------
const V7_prevActivateEntryAbility = activateEntryAbility;
activateEntryAbility = function(pokemon) {
  // 既存の登場処理（ステルスロック/まきびし等）を先に解決。
  // ふしぎなアメによる変化はゲンシカイキ用の珠と同様、設置技の後に自動発生させる。
  V7_prevActivateEntryAbility(pokemon);
  if (!pokemon || pokemon.hp <= 0) return;

  const sideState = v7EnsureSideState(pokemon.side);
  if (sideState.toxicSpikes > 0 && v6IsGrounded(pokemon)) {
    if (pokemon.types.includes("どく")) {
      sideState.toxicSpikes = 0;
      addLog(`${pokemon.name}は どくびしを 吸収した！`, "log-system");
    } else if (!pokemon.types.includes("はがね") && !pokemon.status) {
      addLog(inflictStatus(pokemon, sideState.toxicSpikes >= 2 ? "toxic" : "poison"), "log-status");
    }
  }

  // マジックルーム等の持ち物無効化状態でも、このフォーム変化は止まらない。
  v7TryHalloweenReversion(pokemon);
  v7CheckSoljiendForm(pokemon, "entry");

  if (sideState.lunarDance && pokemon.hp > 0) {
    pokemon.hp = pokemon.maxHP;
    pokemon.status = null; pokemon.statusTurns = 0; pokemon.toxicCounter = 0;
    pokemon.moves.forEach(m => m.pp = m.maxPP);
    sideState.lunarDance = false;
    addLog(`${pokemon.name}は みかづきのまいの力で 完全回復した！`, "log-system");
  }
};

// ------------------------------------------------------------
// ターン終了: ハロウィンパンク / ぎょぐん / スワームチェンジ
// ------------------------------------------------------------
const V7_prevEndTurn = endTurn;
endTurn = function() {
  V7_prevEndTurn();

  const active = [getPlayerPokemon(), getEnemyPokemon()].filter(p => p && p.hp > 0);
  const punkUsers = active.filter(p => p.ability.id === "halloween-punk" && p.v7FormKey !== "trick");
  const stats = ["attack", "defense", "specialAttack", "specialDefense", "speed"];

  punkUsers.forEach(holder => {
    addLog(`${holder.name}の ハロウィンパンク！`, "log-system");
    active.forEach(target => {
      const up = stats[Math.floor(Math.random() * stats.length)];
      let down = stats[Math.floor(Math.random() * stats.length)];
      while (down === up) down = stats[Math.floor(Math.random() * stats.length)];
      addLog(changeStage(target, up, 1, holder), "log-status");
      addLog(changeStage(target, down, -1, holder), "log-status");
    });
  });

  active.forEach(pokemon => v7CheckSoljiendForm(pokemon, "end"));
  active.forEach(pokemon => { pokemon.v7ProtectStyle = null; });
};

// ------------------------------------------------------------
// 技詳細タグ拡張
// ------------------------------------------------------------
const V7_prevMoveTags = v6MoveTags;
v6MoveTags = function(move) {
  const tags = V7_prevMoveTags(move);
  if (move.explosive) tags.push("爆発技");
  if (move.firstTurnOnly) tags.push("登場直後限定");
  if (move.ignoreDefenderAbility) tags.push("相手特性無視");
  if (move.beelineBeam) tags.push("いまひとつ時威力2倍");
  if (move.jawLock) tags.push("交代封じ");
  if (move.ingrain) tags.push("交代不可");
  return [...new Set(tags)];
};

// ------------------------------------------------------------
// Builder/選出の再描画
// ------------------------------------------------------------
if (typeof renderBuilder === "function") renderBuilder();
if (typeof renderDataCounts === "function") renderDataCounts();
;/* ===== v7.1 compatibility ===== */
// ============================================================
// ニワラバトル v7.1 パッチ
// ソルジエンド調整
// - たんどくのすがた: H100 A15 B15 C15 D15 S90
// - バトンタッチ削除 / 専用技「ありのこうしん」追加
// ============================================================

const V71_prevUseMove = useMove;
useMove = function(attacker, defender, originalMove) {
  const move = getEffectiveMove(attacker, originalMove);

  if (!move.v71AntMarch) {
    return V71_prevUseMove(attacker, defender, originalMove);
  }

  // PP・こだわり・ちょうはつ・ねむり・まひ等の通常の行動判定は
  // 既存エンジンに任せる。能力上昇だけ一時的に外し、成功後に専用処理する。
  const baseMove = {
    ...move,
    selfStatChanges: null
  };

  const logs = V71_prevUseMove(attacker, defender, baseMove);

  // 行動不能、PP不足、ちょうはつ等で技そのものを実行できなかった場合。
  // 実際に「○○の ありのこうしん！」まで到達した時だけ専用効果へ進む。
  const moveWasExecuted = logs.some(line => line.includes(`${attacker.name}の ${move.name}！`));
  if (!moveWasExecuted || !v7MoveSucceeded(logs)) {
    return logs;
  }

  // 最大HPの半分以下では失敗。
  if (attacker.hp <= attacker.maxHP / 2) {
    logs.push("しかし HPが 足りないため 失敗した！");
    attacker.lastMoveFailed = true;
    return logs;
  }

  // 最大HPの1/2を失う。奇数HPは端数切り捨て。
  const hpCost = Math.floor(attacker.maxHP / 2);
  attacker.hp = Math.max(0, attacker.hp - hpCost);
  logs.push(`${attacker.name}は HPを ${hpCost} 失った！`);

  logs.push(...applyStatChanges(attacker, {
    defense: 2,
    specialDefense: 2,
    speed: 2
  }, attacker));

  return logs;
};

// AIがHP不足時にありのこうしんを選びにくくする。
const V71_prevScoreMove = scoreMove;
scoreMove = function(attacker, defender, move) {
  const effective = getEffectiveMove(attacker, move);
  if (effective.v71AntMarch) {
    if (attacker.hp <= attacker.maxHP / 2) return -9999;
    const b = attacker.stages?.defense ?? 0;
    const d = attacker.stages?.specialDefense ?? 0;
    const s = attacker.stages?.speed ?? 0;
    if (b >= 6 && d >= 6 && s >= 6) return -50;
    return 60;
  }
  return V71_prevScoreMove(attacker, defender, move);
};
;/* ===== v7.2 compatibility ===== */
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
;/* ===== v8/v9 battle/application runtime ===== */
// ============================================================
// ニワラバトル v8.2
// - 最大30パーティー保存
// - 保存パーティーCPU戦
// - 同一端末2人対戦（非公開入力）
// - A/B/神/観戦の4視点
// - 公開情報トラッキング
// - 強化CPU / 強化ランダム構築
// ============================================================
(function () {
  "use strict";

  const V8_VERSION = globalThis.NIWARA_APP?.version || "dev";
  const V8_PARTY_LIBRARY_KEY = window.NIWARA_APP?.partyLibraryKey || "niwaraBattlePartyLibraryV8";
  const V8_MAX_PARTIES = 30;

  // ------------------------------------------------------------
  // DOM
  // ------------------------------------------------------------
  const v8ModeScreen = document.getElementById("mode-screen");
  const v8SavedPartySelect = document.getElementById("saved-party-select");
  const v8SavedPartyName = document.getElementById("saved-party-name");
  const v8SavedPartyCount = document.getElementById("saved-party-count");
  const v8SaveNewPartyButton = document.getElementById("save-new-party-button");
  const v8OverwritePartyButton = document.getElementById("overwrite-party-button");
  const v8LoadPartyButton = document.getElementById("load-party-button");
  const v8DeletePartyButton = document.getElementById("delete-party-button");
  const v8ModeBackButton = document.getElementById("mode-back-button");
  const v8BattleModeSelect = document.getElementById("battle-mode-select");
  const v8PartySourceA = document.getElementById("player-a-party-source");
  const v8PartySourceB = document.getElementById("player-b-party-source");
  const v8PlayerASourceLabel = document.getElementById("player-a-source-label");
  const v8PlayerBSourceLabel = document.getElementById("player-b-source-label");
  const v10CpuDifficultyACard = document.getElementById("cpu-difficulty-a-card");
  const v10CpuDifficultyBCard = document.getElementById("cpu-difficulty-b-card");
  const v10CpuDifficultyASelect = document.getElementById("cpu-difficulty-a-select");
  const v10CpuDifficultyBSelect = document.getElementById("cpu-difficulty-b-select");
  const v10CpuDifficultyBLabel = document.getElementById("cpu-difficulty-b-label");
  const v10ModeHelpNote = document.getElementById("mode-help-note");
  const v10CpuCpuControls = document.getElementById("cpu-cpu-controls");
  const v10CpuCpuStatus = document.getElementById("cpu-cpu-status");
  const v10CpuCpuToggle = document.getElementById("cpu-cpu-toggle-button");
  const v10CpuCpuStep = document.getElementById("cpu-cpu-step-button");
  const v10CpuCpuSpeed = document.getElementById("cpu-cpu-speed-select");
  const v8ModeContinueButton = document.getElementById("mode-continue-button");
  const v8SelectionHeading = document.getElementById("selection-heading");
  const v8SelectionDescription = document.getElementById("selection-description");
  const v8EnemyPreviewTitle = document.getElementById("enemy-preview-title");
  const v8PlayerPreviewTitle = document.getElementById("player-preview-title");
  const v8SelectionViewButtons = document.getElementById("selection-view-buttons");
  const v8SelectionOperatorBanner = document.getElementById("selection-operator-banner");
  const v8CopySelectionContextButton = document.getElementById("copy-selection-context-button");
  const v8ViewButtons = document.getElementById("view-buttons");
  const v8BattleOperatorBanner = document.getElementById("battle-operator-banner");
  const v8PlayerDetail = document.getElementById("player-private-detail");
  const v8OpponentDetail = document.getElementById("opponent-private-detail");
  const v8TopTeamHeading = document.getElementById("top-team-heading");
  const v8BottomTeamHeading = document.getElementById("bottom-team-heading");
  const v8CommandOwnerText = document.getElementById("command-owner-text");
  const v8PassOverlay = document.getElementById("pass-overlay");
  const v8PassTitle = document.getElementById("pass-title");
  const v8PassMessage = document.getElementById("pass-message");
  const v8PassContinueButton = document.getElementById("pass-continue-button");
  const v8TeamPreviewButton = document.getElementById("team-preview-button");
  const v8BenchStatusButton = document.getElementById("bench-status-button");
  const v8CopyContextButton = document.getElementById("copy-battle-context-button");
  const v8BenchStatusModal = document.getElementById("bench-status-modal");
  const v8BenchStatusTitle = document.getElementById("bench-status-title");
  const v8BenchStatusBody = document.getElementById("bench-status-body");
  const v8BenchStatusNote = document.getElementById("bench-status-note");
  const v8BenchStatusClose = document.getElementById("bench-status-close");
  const v8TeamPreviewModal = document.getElementById("team-preview-modal");
  const v8TeamPreviewTitle = document.getElementById("team-preview-title");
  const v8TeamPreviewBody = document.getElementById("team-preview-body");
  const v8TeamPreviewNote = document.getElementById("team-preview-note");
  const v8TeamPreviewClose = document.getElementById("team-preview-close");
  const v8TeamFormatInput = document.getElementById("team-format-input");
  const v8ApplyTeamFormatButton = document.getElementById("apply-team-format-button");
  const v8CopyCurrentTeamFormatButton = document.getElementById("copy-current-team-format-button");
  const v8CopyEmptyTeamFormatButton = document.getElementById("copy-empty-team-format-button");
  const v8TeamFormatMessage = document.getElementById("team-format-message");

  // ------------------------------------------------------------
  // 画面切替：modeを追加
  // ------------------------------------------------------------
  showScreen = function (name) {
    builderScreen.classList.toggle("hidden", name !== "builder");
    v8ModeScreen?.classList.toggle("hidden", name !== "mode");
    selectionScreen.classList.toggle("hidden", name !== "selection");
    battleScreen.classList.toggle("hidden", name !== "battle");
    goBuilderButton.classList.toggle("hidden", name === "builder");
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------
  // 保存パーティー
  // ------------------------------------------------------------
  let v8SavedParties = [];

  function v8Uid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function v8CloneSets(sets) {
    return deepClone(sets).map(normalizeSet);
  }

  function v8ValidateTeam(sets) {
    if (!Array.isArray(sets) || sets.length !== 6) return "6匹のパーティーが必要です";
    const species = new Set();
    const items = new Set();
    for (let i = 0; i < sets.length; i++) {
      const set = normalizeSet(sets[i]);
      const error = validateSet(set);
      if (error) return `${i + 1}匹目：${error}`;
      const key = getSpeciesClauseKey(set.speciesId);
      if (species.has(key)) return "同じポケモンは同じパーティーに入れられません";
      species.add(key);
      if (set.itemId !== "none") {
        if (items.has(set.itemId)) return "同じ持ち物は同じパーティーで重複できません";
        items.add(set.itemId);
      }
    }
    return null;
  }

  // ------------------------------------------------------------
  // テキスト編成フォーマット v1
  // ------------------------------------------------------------
  const V8_FORMAT_STAT_KEYS = { H:"hp", A:"attack", B:"defense", C:"specialAttack", D:"specialDefense", S:"speed" };

  function v8FormatNormalize(value) {
    return String(value ?? "").normalize("NFKC").trim();
  }

  function v8FormatLookup(collection, value, label) {
    const key = v8FormatNormalize(value);
    const lower = key.toLowerCase();
    const entries = Array.isArray(collection) ? collection : Object.values(collection || {});
    const found = entries.find(x => x && (v8FormatNormalize(x.name) === key || v8FormatNormalize(x.id).toLowerCase() === lower));
    if (!found) throw new Error(`${label}「${key || "(空欄)"}」が見つかりません`);
    return found;
  }

  function v8FormatSpecies(value) {
    return v8FormatLookup(SPECIES_DEX, value, "ポケモン");
  }

  function v8FormatAbility(species, value) {
    return v8FormatLookup(species.abilities, value, `${species.name}の特性`);
  }

  function v8FormatItem(value) {
    const key = v8FormatNormalize(value);
    if (!key || key === "なし" || key.toLowerCase() === "none") return ITEM_DEX.none;
    return v8FormatLookup(ITEM_DEX, key, "持ち物");
  }

  function v8FormatNature(value) {
    const key = v8FormatNormalize(value);
    if (!NATURES[key]) throw new Error(`性格「${key || "(空欄)"}」が見つかりません`);
    return key;
  }

  function v8FormatMove(species, value) {
    const key = v8FormatNormalize(value);
    const lower = key.toLowerCase();
    const foundId = species.movePool.find(id => {
      const move = MOVE_DEX[id];
      return move && (v8FormatNormalize(move.name) === key || v8FormatNormalize(id).toLowerCase() === lower);
    });
    if (!foundId) throw new Error(`${species.name}が覚えられる技「${key || "(空欄)"}」が見つかりません`);
    return foundId;
  }

  function v8ParseStatPoints(value) {
    const normalized = v8FormatNormalize(value).replace(/[，、]/g, " ");
    const result = {};
    const re = /\b([HABCDS])\s*(?:=|:)?\s*(-?\d+)\b/gi;
    let match;
    while ((match = re.exec(normalized))) {
      result[V8_FORMAT_STAT_KEYS[match[1].toUpperCase()]] = Number(match[2]);
    }
    const missing = Object.values(V8_FORMAT_STAT_KEYS).filter(k => result[k] === undefined);
    if (missing.length) throw new Error("能力Pは H/A/B/C/D/S の6項目をすべて指定してください");
    for (const [short, stat] of Object.entries(V8_FORMAT_STAT_KEYS)) {
      const n = result[stat];
      if (!Number.isInteger(n) || n < 0 || n > 32) throw new Error(`能力P ${short} は0～32の整数で指定してください`);
    }
    const total = Object.values(result).reduce((a,b)=>a+b,0);
    if (total > 66) throw new Error(`能力P合計が${total}です。66以下にしてください`);
    return result;
  }

  function v8ParseFormatBlock(block, slotNo) {
    const fields = {};
    const numberedMoves = {};
    block.split(/\n/).forEach(rawLine => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) return;
      const m = line.match(/^([^:：]+)[:：]\s*(.*)$/);
      if (!m) return;
      const key = v8FormatNormalize(m[1]).replace(/\s+/g, "");
      const value = m[2].trim();
      if (/^技[1-4]$/.test(key)) numberedMoves[Number(key.slice(1)) - 1] = value;
      else fields[key] = value;
    });

    const get = (...keys) => {
      for (const k of keys) if (fields[k] !== undefined) return fields[k];
      return "";
    };

    try {
      const species = v8FormatSpecies(get("ポケモン", "種族", "species", "Species"));
      const ability = v8FormatAbility(species, get("特性", "ability", "Ability"));
      const item = v8FormatItem(get("持ち物", "item", "Item"));
      const nature = v8FormatNature(get("性格", "nature", "Nature"));
      const statPoints = v8ParseStatPoints(get("能力P", "能力ポイント", "SP", "StatPoints", "statPoints"));

      let moveValues = [];
      const movesLine = get("技", "moves", "Moves");
      if (movesLine) moveValues = movesLine.split(/\s*(?:\/|／|\||,|、)\s*/).filter(Boolean);
      else moveValues = [0,1,2,3].map(i => numberedMoves[i] || "").filter(Boolean);
      if (moveValues.length !== 4) throw new Error(`技は4つ指定してください（現在${moveValues.length}個）`);
      const moves = moveValues.map(v => v8FormatMove(species, v));
      if (new Set(moves).size !== 4) throw new Error("同じ技は2つ指定できません");

      const set = { speciesId:species.id, abilityId:ability.id, itemId:item.id, nature, statPoints, moves };
      const setError = validateSet(set);
      if (setError) throw new Error(setError);
      return set;
    } catch (e) {
      throw new Error(`${slotNo}匹目：${e.message}`);
    }
  }

  function v8SplitTeamFormat(text) {
    const normalized = String(text || "").replace(/\r\n?/g, "\n");
    const lines = normalized.split("\n");
    const blocks = [];
    let current = null;
    lines.forEach(line => {
      const marker = line.match(/^\s*\[(\d+)\]\s*$/);
      if (marker) {
        if (current) blocks.push(current.join("\n"));
        current = [];
        return;
      }
      if (current) current.push(line);
    });
    if (current) blocks.push(current.join("\n"));
    if (blocks.length) return blocks.filter(b => b.trim());

    return normalized
      .replace(/^\s*#.*$/gm, "")
      .split(/\n\s*---+\s*\n|\n{2,}/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function v8ParseTeamFormat(text) {
    const blocks = v8SplitTeamFormat(text);
    if (blocks.length !== 6) throw new Error(`6匹分のブロックが必要です（現在${blocks.length}匹分）`);
    const sets = blocks.map((block, i) => v8ParseFormatBlock(block, i + 1));
    const teamError = v8ValidateTeam(deepClone(sets));
    if (teamError) throw new Error(teamError);
    return sets;
  }

  function v8SetToFormat(set, index) {
    const species = SPECIES_DEX[set.speciesId];
    const ability = species?.abilities?.find(a => a.id === set.abilityId);
    const item = ITEM_DEX[set.itemId] || ITEM_DEX.none;
    const sp = set.statPoints || {};
    const moves = (set.moves || []).map(id => MOVE_DEX[id]?.name || id).join(" / ");
    return [
      `[${index + 1}]`,
      `ポケモン: ${species?.name || set.speciesId}`,
      `特性: ${ability?.name || set.abilityId}`,
      `持ち物: ${item?.name || "なし"}`,
      `性格: ${set.nature}`,
      `能力P: H=${sp.hp ?? 0} A=${sp.attack ?? 0} B=${sp.defense ?? 0} C=${sp.specialAttack ?? 0} D=${sp.specialDefense ?? 0} S=${sp.speed ?? 0}`,
      `技: ${moves}`
    ].join("\n");
  }

  function v8TeamToFormat(sets) {
    return `# ニワラバトル編成フォーマット v1\n${sets.map((set,i)=>v8SetToFormat(set,i)).join("\n\n")}`;
  }

  function v8EmptyTeamFormat() {
    const blocks = Array.from({length:6},(_,i)=>[
      `[${i+1}]`,
      "ポケモン: ",
      "特性: ",
      "持ち物: なし",
      "性格: ",
      "能力P: H=0 A=0 B=0 C=0 D=0 S=0",
      "技:  /  /  / "
    ].join("\n"));
    return `# ニワラバトル編成フォーマット v1\n${blocks.join("\n\n")}`;
  }

  function v8SetFormatMessage(text, isError=false) {
    if (!v8TeamFormatMessage) return;
    v8TeamFormatMessage.textContent = text;
    v8TeamFormatMessage.classList.toggle("error", isError);
  }

  function v8ApplyTeamFormat() {
    try {
      const sets = v8ParseTeamFormat(v8TeamFormatInput?.value || "");
      builderSets = sets.map(set => normalizeSet(deepClone(set)));
      renderBuilder();
      if (v8TeamFormatInput) v8TeamFormatInput.value = v8TeamToFormat(builderSets);
      v8SetFormatMessage("6匹の編成を反映しました。内容を確認してから保存してください。", false);
      setBuilderMessage("テキストフォーマットから編成を反映しました。", false);
    } catch (e) {
      v8SetFormatMessage(e?.message || "フォーマットを読み込めませんでした。", true);
    }
  }

  async function v8CopyTeamFormat(text, button, successText) {
    const original = button?.textContent || "コピー";
    try {
      await v8WriteClipboard(text);
      if (button) button.textContent = successText;
      v8SetFormatMessage(successText, false);
    } catch (e) {
      console.warn("team format copy failed", e);
      if (button) button.textContent = "コピー失敗";
      v8SetFormatMessage("コピーに失敗しました。テキスト欄から手動でコピーしてください。", true);
    }
    setTimeout(()=>{ if(button) button.textContent=original; },1400);
  }

  function v8LoadPartyLibrary() {
    try {
      const raw = localStorage.getItem(V8_PARTY_LIBRARY_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        v8SavedParties = parsed
          .filter(p => p && Array.isArray(p.sets) && p.sets.length === 6)
          .slice(0, V8_MAX_PARTIES)
          .map(p => ({ id: p.id || v8Uid(), name: String(p.name || "パーティー").slice(0, 24), sets: v8CloneSets(p.sets) }));
      }
    } catch (e) {
      console.warn("v8 party library load failed", e);
      v8SavedParties = [];
    }

    // v10: 旧版からの自動移行は完了済み。空ライブラリは空のまま保持する。
  }

  function v8PersistPartyLibrary() {
    localStorage.setItem(V8_PARTY_LIBRARY_KEY, JSON.stringify(v8SavedParties));
  }

  function v8RenderPartyLibrary() {
    if (!v8SavedPartySelect) return;
    const selected = v8SavedPartySelect.value;
    v8SavedPartySelect.innerHTML = "";
    if (v8SavedParties.length === 0) {
      const o = document.createElement("option"); o.value = ""; o.textContent = "保存パーティーなし"; v8SavedPartySelect.appendChild(o);
    } else {
      v8SavedParties.forEach((p, i) => {
        const o = document.createElement("option"); o.value = p.id; o.textContent = `${i + 1}. ${p.name}`; v8SavedPartySelect.appendChild(o);
      });
      if (v8SavedParties.some(p => p.id === selected)) v8SavedPartySelect.value = selected;
      const current = v8SavedParties.find(p => p.id === v8SavedPartySelect.value) || v8SavedParties[0];
      if (current && v8SavedPartyName) v8SavedPartyName.value = current.name;
    }
    if (v8SavedPartyCount) v8SavedPartyCount.textContent = `${v8SavedParties.length} / ${V8_MAX_PARTIES}`;
    v8RenderBattleSourceOptions();
  }

  function v8SaveNewParty() {
    const error = v8ValidateTeam(builderSets);
    if (error) return setBuilderMessage(error, true);
    if (v8SavedParties.length >= V8_MAX_PARTIES) return setBuilderMessage(`保存できるのは最大${V8_MAX_PARTIES}個です。`, true);
    const name = (v8SavedPartyName?.value || `マイパーティー${v8SavedParties.length + 1}`).trim() || `マイパーティー${v8SavedParties.length + 1}`;
    const entry = { id: v8Uid(), name: name.slice(0, 24), sets: v8CloneSets(builderSets) };
    v8SavedParties.push(entry);
    v8PersistPartyLibrary();
    v8RenderPartyLibrary();
    v8SavedPartySelect.value = entry.id;
    setBuilderMessage(`「${entry.name}」を新規保存しました。`, false);
  }

  function v8OverwriteParty() {
    const error = v8ValidateTeam(builderSets);
    if (error) return setBuilderMessage(error, true);
    const party = v8SavedParties.find(p => p.id === v8SavedPartySelect?.value);
    if (!party) return v8SaveNewParty();
    party.name = ((v8SavedPartyName?.value || party.name).trim() || party.name).slice(0, 24);
    party.sets = v8CloneSets(builderSets);
    v8PersistPartyLibrary();
    v8RenderPartyLibrary();
    v8SavedPartySelect.value = party.id;
    setBuilderMessage(`「${party.name}」を上書き保存しました。`, false);
  }

  function v8LoadSelectedParty() {
    const party = v8SavedParties.find(p => p.id === v8SavedPartySelect?.value);
    if (!party) return;
    builderSets = v8CloneSets(party.sets);
    renderBuilder();
    setBuilderMessage(`「${party.name}」を読み込みました。`, false);
  }

  function v8DeleteSelectedParty() {
    const id = v8SavedPartySelect?.value;
    const party = v8SavedParties.find(p => p.id === id);
    if (!party) return;
    v8SavedParties = v8SavedParties.filter(p => p.id !== id);
    v8PersistPartyLibrary();
    v8RenderPartyLibrary();
    setBuilderMessage(`「${party.name}」を削除しました。`, false);
  }

  function v8GetSourceSets(value, difficulty="strong") {
    if (value === "current") return v8CloneSets(builderSets);
    if (value === "random") return v10BuildCpuTeam(difficulty);
    const p = v8SavedParties.find(x => x.id === value);
    return p ? v8CloneSets(p.sets) : v8CloneSets(builderSets);
  }

  function v8AppendSourceOption(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function v8RenderBattleSourceOptions() {
    if (!v8PartySourceA || !v8PartySourceB) return;
    const aOld = v8PartySourceA.value;
    const bOld = v8PartySourceB.value;
    const mode = v8BattleModeSelect?.value || "cpu";
    const pvp = mode === "pvp";
    const cpuCpu = mode === "cpu-cpu";

    v8PartySourceA.replaceChildren();
    if (!cpuCpu) v8AppendSourceOption(v8PartySourceA, "current", "現在の編成");
    v8AppendSourceOption(v8PartySourceA, "random", cpuCpu ? "CPUが自動構築" : "強化ランダムCPU構築");
    v8SavedParties.forEach(party => v8AppendSourceOption(v8PartySourceA, party.id, party.name));

    v8PartySourceB.replaceChildren();
    if (pvp) v8AppendSourceOption(v8PartySourceB, "current", "現在の編成");
    else v8AppendSourceOption(v8PartySourceB, "random", "CPUが自動構築");
    v8SavedParties.forEach(party => v8AppendSourceOption(v8PartySourceB, party.id, party.name));

    if ([...v8PartySourceA.options].some(o => o.value === aOld)) v8PartySourceA.value = aOld;
    if ([...v8PartySourceB.options].some(o => o.value === bOld)) v8PartySourceB.value = bOld;

    if (v8PlayerASourceLabel) v8PlayerASourceLabel.textContent = cpuCpu ? "CPU Aのパーティー" : "プレイヤーAのパーティー";
    if (v8PlayerBSourceLabel) v8PlayerBSourceLabel.textContent = pvp ? "プレイヤーBのパーティー" : (cpuCpu ? "CPU Bのパーティー" : "CPUのパーティー");
    v10CpuDifficultyACard?.classList.toggle("hidden", !cpuCpu);
    v10CpuDifficultyBCard?.classList.toggle("hidden", pvp);
    if (v10CpuDifficultyBLabel) v10CpuDifficultyBLabel.textContent = cpuCpu ? "CPU Bの強さ" : "CPUの強さ";
    if (v8ModeContinueButton) v8ModeContinueButton.textContent = cpuCpu ? "CPU同士の対戦を開始" : "選出へ";
    if (v10ModeHelpNote) {
      v10ModeHelpNote.textContent = pvp
        ? "2人対戦では、行動選択のたびに画面を隠す「端末を渡す」画面を挟みます。"
        : cpuCpu
          ? "CPU A/Bが構築・3匹選出・対戦をすべて自動で行います。観戦中は一時停止や1ターン進行もできます。AIは各自の公開情報だけで判断します。"
          : "プレイヤーA側も「強化ランダムCPU構築」を選べます。CPUは構築・3匹選出・対戦を自動で行い、難易度が上がっても、あなたの未公開技・性格・能力P・持ち物・特性・未登場控えを直接参照しません。";
    }
  }

  // ------------------------------------------------------------
  // 強化ランダム構築
  // ------------------------------------------------------------
  const V8_ABILITY_VALUE = {
    "good-as-gold": 13, "magic-guard": 12, "power-construct": 12, "night-scales": 12,
    unaware: 11, regenerator: 10, "fur-coat": 10, "water-bubble": 11, adaptability: 9,
    "sheer-force": 10, sharpness: 9, schooling: 10, "halloween-punk": 10,
    "trick-builder": 9, drizzle: 8, "sand-stream": 8, levitate: 7, "poison-heal": 10,
    "speed-boost": 10, sturdy: 7, "clear-body": 6, "thick-fat": 7, "lightning-rod": 7,
    "sap-sipper": 7, competitive: 7, moxie: 7, "magic-bounce": 10, "shadow-tag": 9,
    "compound-eyes": 6, "stamina": 8, "earth-eater": 8, "scrappy": 7, "tinted-lens": 8
  };

  function v8Role(species) {
    const b = species.baseStats;
    const phys = b.attack >= b.specialAttack + 18;
    const spec = b.specialAttack >= b.attack + 18;
    return { phys, spec, mixed: !phys && !spec, fast: b.speed >= 100, bulky: b.hp + b.defense + b.specialDefense >= 300 };
  }

  function v8NatureFor(species) {
    const r = v8Role(species);
    if (r.phys && r.fast) return "ようき";
    if (r.phys) return "いじっぱり";
    if (r.spec && r.fast) return "おくびょう";
    if (r.spec) return "ひかえめ";
    if (species.baseStats.defense >= species.baseStats.specialDefense) return "わんぱく";
    return "しんちょう";
  }

  function v8PointsFor(species) {
    const r = v8Role(species);
    const sp = { hp:0, attack:0, defense:0, specialAttack:0, specialDefense:0, speed:0 };
    if (r.fast) {
      sp.speed = 32;
      if (r.phys) sp.attack = 32; else if (r.spec) sp.specialAttack = 32; else sp.hp = 32;
      sp.hp = sp.hp || 2;
      if (sp.hp === 32) sp.specialDefense = 2;
    } else if (r.bulky) {
      sp.hp = 32;
      if (r.phys) sp.attack = 32; else if (r.spec) sp.specialAttack = 32; else if (species.baseStats.defense >= species.baseStats.specialDefense) sp.specialDefense = 32; else sp.defense = 32;
      sp.defense = sp.defense || 2;
    } else {
      if (r.phys) sp.attack = 32; else sp.specialAttack = 32;
      sp.hp = 32; sp.speed = 2;
    }
    return sp;
  }

  function v8AbilityFor(species) {
    return [...species.abilities].sort((a,b) => (V8_ABILITY_VALUE[b.id] || 0) - (V8_ABILITY_VALUE[a.id] || 0))[0] || species.abilities[0];
  }

  function v8MoveStaticScore(species, move, abilityId = null) {
    if (!move) return -999;
    const r = v8Role(species);
    if (move.category !== "status") {
      let s = (move.power || 0) * ((move.accuracy ?? 100) / 100);
      if (species.types.includes(move.type)) s += 38;
      if (r.phys && move.category === "physical") s += 18;
      if (r.spec && move.category === "special") s += 18;
      if (r.phys && move.category === "special") s -= 10;
      if (r.spec && move.category === "physical") s -= 10;
      if (move.priority > 0) s += 16;
      if (move.drainRatio) s += 11;
      if (move.pivot) s += 14;
      if (move.recoilRatio || move.recoilMaxHPRatio) s -= 8;
      if (move.recharge) s -= 22;
      if (move.selfDestruct || move.faintUser) s -= 28;
      if (move.multiHit) s += 6;
      if (move.targetStatChanges || move.targetStatChangeChance || move.secondaryStatus || move.flinchChance || move.confuseChance) s += 9;
      if (abilityId === "sharpness" && move.slicing) s += 28;
      if (abilityId === "sheer-force" && typeof moveHasSheerForceEffect === "function" && moveHasSheerForceEffect(move)) s += 24;
      if (abilityId === "water-bubble" && move.type === "みず") s += 30;
      if (abilityId === "adaptability" && species.types.includes(move.type)) s += 16;
      if (abilityId === "night-scales" && move.category === "special") s += 25;
      return s;
    }

    let s = 18;
    if (move.healRatio || move.recover || move.roost || move.moonlight || move.synthesis) s += r.bulky ? 42 : 28;
    if (move.rest) s += r.bulky ? 12 : -8;
    if (move.sleepTalk) s -= 18; // Restとセットでない単独採用を避ける。
    if (move.selfStatChanges) {
      let useful = 0;
      for (const [stat, amount] of Object.entries(move.selfStatChanges)) {
        if (amount <= 0) continue;
        if ((stat === "attack" && r.phys) || (stat === "specialAttack" && r.spec) || stat === "speed" || stat === "defense" || stat === "specialDefense") useful += amount;
      }
      s += 16 + useful * 8;
    }
    if (move.screen || move.reflect || move.lightScreen || move.tailwind || move.trickRoom) s += 30;
    if (move.hazard || move.stealthRock || move.spikes || move.toxicSpikes || move.stickyWeb) s += 28;
    if (move.protect || move.protectLike) s += abilityId === "poison-heal" ? 38 : 16;
    if (move.substitute) s += abilityId === "poison-heal" ? 34 : 14;
    if (move.status || move.toxic || move.yawn || move.taunt || move.encore || move.disable) s += 21;
    if (move.weather || move.terrain) s += 14;
    if (move.pivot || move.batonPass) s += 14;
    if (move.forceSwitch) s += 8;
    return s;
  }

  function v8MovesFor(species, ability) {
    const abilityId = ability?.id || ability || null;
    const candidates = species.movePool.map(id => MOVE_DEX[id]).filter(Boolean);
    const attacks = candidates.filter(m => m.category !== "status")
      .sort((a,b) => v8MoveStaticScore(species,b,abilityId)-v8MoveStaticScore(species,a,abilityId));
    const statuses = candidates.filter(m => m.category === "status")
      .filter(m => !(abilityId === "poison-heal" && m.rest))
      .sort((a,b) => v8MoveStaticScore(species,b,abilityId)-v8MoveStaticScore(species,a,abilityId));
    const picked = [];

    const add = move => { if (move && picked.length < 4 && !picked.includes(move.id)) picked.push(move.id); };
    const bestStab = attacks.find(m => species.types.includes(m.type)) || attacks[0];
    add(bestStab);

    // 2枠目は別タイプの高品質打点を優先して、止まりにくくする。
    const firstType = MOVE_DEX[picked[0]]?.type;
    add(attacks.find(m => m.type !== firstType && v8MoveStaticScore(species,m,abilityId) >= v8MoveStaticScore(species,attacks[0],abilityId) - 35));
    if (picked.length < 2) add(attacks.find(m => !picked.includes(m.id)));

    // 非火力枠。耐久型は2枠まで、攻撃型は原則1枠。
    const r = v8Role(species);
    const statusTarget = r.bulky ? 2 : 1;
    let statusCount = 0;
    for (const m of statuses) {
      if (picked.length >= 4 || statusCount >= statusTarget) break;
      if (m.sleepTalk && !picked.some(id => MOVE_DEX[id]?.rest)) continue;
      if (m.rest && statuses.some(x => (x.healRatio || x.recover || x.roost || x.moonlight || x.synthesis))) continue;
      add(m); statusCount++;
    }

    // 残りはタイプが被りにくい攻撃技を優先。
    const usedTypes = new Set(picked.map(id => MOVE_DEX[id]?.type).filter(Boolean));
    [...attacks.filter(m => !usedTypes.has(m.type)), ...attacks, ...statuses].forEach(add);

    // Restを採った時だけ、ねごとが上位ならセット採用を考慮。
    if (picked.some(id => MOVE_DEX[id]?.rest) && !picked.some(id => MOVE_DEX[id]?.sleepTalk)) {
      const sleepTalk = candidates.find(m => m.sleepTalk);
      if (sleepTalk && picked.length === 4) {
        const weakestStatusIndex = picked.findIndex(id => MOVE_DEX[id]?.category === "status" && !MOVE_DEX[id]?.rest);
        if (weakestStatusIndex >= 0) picked[weakestStatusIndex] = sleepTalk.id;
      }
    }
    return picked.slice(0,4);
  }

  function v8ItemFor(species, ability, moveIds, used) {
    const r = v8Role(species);
    const moves = moveIds.map(id => MOVE_DEX[id]).filter(Boolean);
    const attackCount = moves.filter(m => m.category !== "status").length;
    const allAttacks = attackCount === moves.length;
    const preferred = [];

    if (ability.id === "poison-heal") preferred.push("toxic-orb");
    if (ability.id === "halloween-punk") preferred.push("mystery-candy");
    if (ability.id === "drizzle") preferred.push("damp-rock");
    if (ability.id === "sand-stream") preferred.push("smooth-rock");
    if (moves.some(m => m.screen)) preferred.push("light-clay");
    if (moves.some(m => m.charging || m.chargeMove || m.twoTurn)) preferred.push("power-herb");
    if (moves.some(m => m.rest)) preferred.push("chesto-berry");
    if (ability.id === "magic-guard") preferred.push("life-orb");

    if (allAttacks) {
      if (r.phys) preferred.push("choice-band");
      if (r.spec) preferred.push("choice-specs");
      if (r.bulky) preferred.push("assault-vest");
    }
    if (attackCount >= 3) preferred.push("life-orb", "expert-belt");
    if (r.fast && !r.bulky) preferred.push("focus-sash");
    if (r.bulky) preferred.push("leftovers", "sitrus-berry");
    if (r.phys) preferred.push("life-orb", "expert-belt");
    if (r.spec) preferred.push("life-orb", "expert-belt");
    preferred.push("leftovers", "sitrus-berry", "focus-sash", "expert-belt", "rocky-helmet");

    const id = preferred.find(x => ITEM_DEX[x] && !used.has(x)) || "none";
    if (id !== "none") used.add(id);
    return id;
  }

  function v8BuildStrongSet(species, usedItems = new Set()) {
    const ability = v8AbilityFor(species);
    const moves = v8MovesFor(species, ability);
    return normalizeSet({
      speciesId: species.id,
      abilityId: ability.id,
      itemId: v8ItemFor(species, ability, moves, usedItems),
      nature: v8NatureFor(species),
      statPoints: v8PointsFor(species),
      moves
    });
  }

  function v8TeamQuality(sets) {
    const weaknesses = {};
    let phys=0, spec=0, fast=0, score=0;
    sets.forEach(set => {
      const s = SPECIES_DEX[set.speciesId]; const r = v8Role(s);
      if (r.phys) phys++; if (r.spec) spec++; if (r.fast) fast++;
      score += V8_ABILITY_VALUE[set.abilityId] || 0;
      Object.keys(TYPE_CHART).forEach(type => {
        const mult = getTypeEffectiveness(type, s.types);
        if (mult > 1) weaknesses[type] = (weaknesses[type] || 0) + 1;
      });
    });
    if (phys >= 2 && spec >= 2) score += 12;
    if (fast >= 2) score += 8;
    Object.values(weaknesses).forEach(n => { if (n >= 4) score -= (n - 3) * 10; });
    return score;
  }

  // ============================================================
  // v10.1 CPU AI
  // ============================================================
  const V10_AI_LEVELS = Object.freeze({
    normal: { label:"普通", moveNoise:0.22, switchMargin:72, possibleMoves:4, defenderModels:1, lookahead:false },
    strong: { label:"強い", moveNoise:0.08, switchMargin:36, possibleMoves:8, defenderModels:2, lookahead:false },
    "very-strong": { label:"非常に強い", moveNoise:0.015, switchMargin:12, possibleMoves:14, defenderModels:3, lookahead:true }
  });
  let v10CpuDifficultyA="very-strong";
  let v10CpuDifficultyB="very-strong";

  // CPUが戦闘中に自分で観測した「実ダメージ」の記憶。
  // 正本は割合ではなく、CPU自身のポケモンが実際に失ったHP実数。
  // WeakMapのキーは受けた自分自身のbattle Pokemonオブジェクトで、
  // 相手種族 + 公開済み使用技ごとに通常/急所サンプルを分離して保持する。
  // 相手の非公開set情報は一切保存しない。
  let v10AiDamageMemory={player:new WeakMap(),enemy:new WeakMap()};
  function v10AiResetBattleMemory(){v10AiDamageMemory={player:new WeakMap(),enemy:new WeakMap()};}
  function v10AiMemoryKey(attacker,move){return `${attacker?.id||"?"}|${move?.id||"?"}`;}
  function v10AiCanLearnDirectDamage(move){
    if(!move||move.category==="status")return false;
    // 相手の現在HPや直前被弾量などで威力そのものが変わる技は、通常の火力学習へ混ぜない。
    if(move.ohko||move.fixedDamage||move.superFang||move.endeavor||move.finalGambit||move.counter||move.mirrorCoat||move.metalBurst)return false;
    return true;
  }
  function v10AiRecordObservedDamage(attacker,defender,move,logs,hadSubstitute=false,hpBefore=null){
    const side=defender?.side;
    if(!attacker||!defender||!move||!side||!v10SideIsCpu(side)||hadSubstitute||!v10AiCanLearnDirectDamage(move))return;
    const before=Number(hpBefore);
    const amount=Number.isFinite(before)?Math.max(0,before-Number(defender.hp||0)):0;
    if(!(amount>0)||!(defender.maxHP>0))return;
    let perPokemon=v10AiDamageMemory[side].get(defender);
    if(!perPokemon){perPokemon=new Map();v10AiDamageMemory[side].set(defender,perPokemon);}
    const key=v10AiMemoryKey(attacker,move);
    const prev=perPokemon.get(key)||{normal:[],critical:[]};
    const lines=Array.isArray(logs)?logs.map(String):[];
    const critical=lines.some(x=>x.includes("急所に当たった"));
    const resistBerry=lines.some(x=>x.includes("ダメージを弱めた"));
    const survivalCap=lines.some(x=>x.includes("きあいのタスキで耐えた")||x.includes("がんじょうで耐えた")) || Boolean(defender.endureThisTurn&&defender.hp===1);
    const atkStat=move.category==="physical"?"attack":"specialAttack";
    const defStat=move.category==="physical"?"defense":"specialDefense";
    const sample={
      amount,turn:turnNumber,
      attackerStage:attacker.stages?.[atkStat]||0,
      defenderStage:defender.stages?.[defStat]||0,
      category:move.category,moveType:move.type,
      weather:weather.type||null,
      resistBerry,survivalCap,
      hpBefore:before,maxHP:defender.maxHP
    };
    const bucket=critical?prev.critical:prev.normal;
    bucket.push(sample);
    // 長期戦でも記憶が無制限に増えないよう、各技につき直近8サンプルを保持。
    if(bucket.length>8)bucket.splice(0,bucket.length-8);
    perPokemon.set(key,prev);
  }
  function v10AiWeatherMoveMultiplier(moveType,weatherType){
    if(weatherType==="rain"){if(moveType==="みず")return 1.5;if(moveType==="ほのお")return 0.5;}
    if(weatherType==="sun"){if(moveType==="ほのお")return 1.5;if(moveType==="みず")return 0.5;}
    return 1;
  }
  function v10AiObservedDamageEstimate(candidate,pub,move){
    const empty={samples:0,lastAmount:0,minAmount:0,maxAmount:0,avgAmount:0,likelyAmount:0,safeMaxAmount:0,criticalSamples:0,criticalMaxAmount:0};
    const mem=v10AiDamageMemory[candidate?.side]?.get(candidate);
    const obs=mem?.get(`${pub?.speciesId||"?"}|${move?.id||"?"}`);
    if(!obs)return empty;
    const atkStat=move.category==="physical"?"attack":"specialAttack";
    const defStat=move.category==="physical"?"defense":"specialDefense";
    const currentAtk=pub?.stages?.[atkStat]||0;
    const currentDef=candidate?.stages?.[defStat]||0;
    const currentWeather=v10AiWeatherMoveMultiplier(move.type,weather.type||null);
    const adjustSample=(sample,forUpper=false)=>{
      let ratio=getStageMultiplier(currentAtk)/getStageMultiplier(sample.attackerStage||0);
      ratio*=getStageMultiplier(sample.defenderStage||0)/getStageMultiplier(currentDef);
      const oldWeather=v10AiWeatherMoveMultiplier(move.type,sample.weather||null);
      if(oldWeather>0)ratio*=currentWeather/oldWeather;
      // 半減きのみを使って受けた実測は、その実が消費済みの次回には概ね2倍を警戒する。
      if(sample.resistBerry&&candidate.itemConsumed)ratio*=2;
      ratio=clamp(ratio,0.25,4);
      let value=Math.max(1,Math.round(sample.amount*ratio));
      if(forUpper){
        // 通常ダメージ乱数は最低側を引いた可能性を残し、実測から上限候補を逆算する。
        value=Math.max(value,Math.ceil(value/0.85));
        // タスキ/がんじょう/こらえるでHP減少量が頭打ちだった場合、少なくとも致死圏として扱う。
        if(sample.survivalCap)value=Math.max(value,candidate.maxHP);
      }
      return Math.min(Math.max(1,value),Math.max(candidate.maxHP*4,1));
    };
    const normal=(obs.normal||[]).map(sample=>({sample,value:adjustSample(sample,false),upper:adjustSample(sample,true)}));
    const crit=(obs.critical||[]).map(sample=>adjustSample(sample,false));
    if(!normal.length){
      return {...empty,criticalSamples:crit.length,criticalMaxAmount:crit.length?Math.max(...crit):0};
    }
    const vals=normal.map(x=>x.value),last=normal[normal.length-1].value;
    const min=Math.min(...vals),max=Math.max(...vals),avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    // 直近・平均・最大実測を主軸にする。safeMaxは乱数上振れまで含めた安全側の見積り。
    const likely=Math.max(last,avg,max*0.96);
    const safeMax=Math.max(...normal.map(x=>x.upper),Math.ceil(likely));
    return {
      samples:normal.length,lastAmount:last,minAmount:min,maxAmount:max,avgAmount:avg,
      likelyAmount:Math.ceil(likely),safeMaxAmount:safeMax,
      criticalSamples:crit.length,criticalMaxAmount:crit.length?Math.max(...crit):0
    };
  }

  function v10AiLevel(difficulty){ return V10_AI_LEVELS[difficulty] || V10_AI_LEVELS.strong; }
  function v10DifficultyForSide(side){ return side==="player" ? v10CpuDifficultyA : v10CpuDifficultyB; }
  function v10SideIsCpu(side){
    if(v8BattleMode==="cpu-cpu") return true;
    if(v8BattleMode==="cpu") return side==="enemy";
    return false;
  }
  function v10DifficultyLabel(d){ return v10AiLevel(d).label; }

  function v10BuildNormalSet(species, usedItems=new Set()){
    const rankedAbilities=[...species.abilities].sort((a,b)=>(V8_ABILITY_VALUE[b.id]||0)-(V8_ABILITY_VALUE[a.id]||0));
    const ability=rankedAbilities[Math.floor(Math.random()*Math.min(2,rankedAbilities.length))] || species.abilities[0];
    const candidates=species.movePool.map(id=>MOVE_DEX[id]).filter(Boolean)
      .sort((a,b)=>v8MoveStaticScore(species,b,ability?.id)-v8MoveStaticScore(species,a,ability?.id));
    const pool=candidates.slice(0,Math.min(10,candidates.length));
    const picked=[];
    const add=m=>{if(m&&!picked.includes(m.id)&&picked.length<4)picked.push(m.id);};
    add(pool.find(m=>m.category!=="status"&&species.types.includes(m.type))||pool[0]);
    shuffle(pool.slice(1)).forEach(add);
    candidates.forEach(add);
    const moves=picked.slice(0,4);
    return normalizeSet({speciesId:species.id,abilityId:ability.id,itemId:v8ItemFor(species,ability,moves,usedItems),nature:v8NatureFor(species),statPoints:v8PointsFor(species),moves});
  }

  function v10TeamStrategicQuality(sets){
    let score=v8TeamQuality(sets);
    const attackTypes=new Set(), roles={physical:0,special:0,fast:0,bulky:0};
    let priority=0,pivot=0,recovery=0,hazards=0,speedControl=0,status=0;
    sets.forEach(set=>{
      const sp=SPECIES_DEX[set.speciesId],r=v8Role(sp);
      if(r.phys)roles.physical++; if(r.spec)roles.special++; if(r.fast)roles.fast++; if(r.bulky)roles.bulky++;
      set.moves.map(id=>MOVE_DEX[id]).filter(Boolean).forEach(m=>{
        if(m.category!=="status"){attackTypes.add(m.type);if((m.priority||0)>0)priority++;}
        if(m.pivot) pivot++;
        if(m.healRatio||m.recover||m.roost||m.moonlight||m.synthesis||m.rest) recovery++;
        if(m.hazard||m.stealthRock||m.spikes||m.toxicSpikes||m.stickyWeb) hazards++;
        if(m.tailwind||m.trickRoom||m.stickyWeb) speedControl++;
        if(m.status||m.toxic||m.yawn||m.taunt||m.encore||m.disable) status++;
      });
    });
    score += attackTypes.size*2.2 + Math.min(priority,3)*4 + Math.min(pivot,3)*4 + Math.min(recovery,4)*3;
    score += Math.min(hazards,2)*6 + Math.min(speedControl,2)*7 + Math.min(status,3)*2;
    if(roles.physical===0||roles.special===0)score-=14;
    if(roles.fast===0)score-=12;
    if(roles.bulky===0)score-=8;
    return score;
  }

  function v10BuildCpuTeam(difficulty="strong"){
    const groups=new Map();
    Object.values(SPECIES_DEX).forEach(sp=>{const key=getSpeciesClauseKey(sp.id);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(sp);});
    const reps=[...groups.values()].map(arr=>arr[0]);
    if(difficulty==="normal"){
      const used=new Set();
      return shuffle(reps).slice(0,6).map(sp=>v10BuildNormalSet(sp,used));
    }
    const attempts=difficulty==="very-strong"?720:220;
    let best=null,bestScore=-Infinity;
    for(let n=0;n<attempts;n++){
      const picked=shuffle(reps).slice(0,6),used=new Set();
      const team=picked.map(sp=>v8BuildStrongSet(sp,used));
      const score=(difficulty==="very-strong"?v10TeamStrategicQuality(team):v8TeamQuality(team))+Math.random()*(difficulty==="very-strong"?1.2:4.5);
      if(score>bestScore&&!v8ValidateTeam(team)){bestScore=score;best=team;}
    }
    return best || reps.slice(0,6).map(sp=>v8BuildStrongSet(sp,new Set()));
  }
  function v8BuildStrongRandomTeam(){ return v10BuildCpuTeam("strong"); }

  // ---- Public-information boundary -------------------------------------------------
  // AIが相手について読むのは、このsnapshotが返すフィールドだけ。
  // hidden set / nature / statPoints / unrevealed item/ability/moves / unseen selected bench は渡さない。
  function v10AiPublicOpponent(side){
    const foe=v8Active(v8Other(side));
    if(!foe)return null;
    const k=v8EnsureKnowledge(foe);
    return Object.freeze({
      side:v8Other(side), speciesId:foe.id, types:[...foe.types], hpPercent:v8HPPercent(foe),
      status:foe.status||null, stages:{...foe.stages},
      abilityId:k.ability?foe.ability?.id:null,
      itemId:k.item?(foe.itemConsumed?"none":foe.item?.id):null,
      revealedMoves:[...k.moves],
      substitute:Boolean(foe.substituteHP>0), tauntTurns:foe.tauntTurns>0?1:0,
      confused:Boolean(foe.confusedTurns>0), seeded:Boolean(foe.seeded),
      protectChain:foe.protectThisTurn?1:0
    });
  }
  function v10AiOpponentPreviewSpecies(side){
    const roster=side==="player"?v8RosterB:v8RosterA;
    return roster.map(set=>set.speciesId); // 見せ合いで公開される種族IDのみ
  }
  function v10AiSeenOpponentSpecies(side){
    const team=v8GetTeam(v8Other(side));
    return team.filter(p=>v8EnsureKnowledge(p).seen).map(p=>p.id);
  }
  function v10AiPossibleUnseenSpecies(side){
    const preview=v10AiOpponentPreviewSpecies(side),seen=v10AiSeenOpponentSpecies(side);
    const counts=new Map();seen.forEach(id=>counts.set(id,(counts.get(id)||0)+1));
    return preview.filter(id=>{const n=counts.get(id)||0;if(n>0){counts.set(id,n-1);return false;}return true;});
  }

  function v10AiAbilityCandidates(pub,difficulty){
    const sp=SPECIES_DEX[pub.speciesId];
    if(pub.abilityId)return [pub.abilityId];
    const ids=sp.abilities.map(a=>a.id);
    if(difficulty==="normal")return ids.slice(0,1);
    return ids;
  }
  function v10AiBaseSet(speciesId,abilityId,itemId="none",nature="まじめ",points=null){
    const sp=SPECIES_DEX[speciesId];
    const moves=sp.movePool.slice(0,4);
    const statPoints=points||{hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0};
    return normalizeSet({speciesId,abilityId:abilityId||sp.abilities[0].id,itemId:itemId||"none",nature,statPoints,moves});
  }
  function v10AiBeliefDefenders(pub,move,difficulty){
    const level=v10AiLevel(difficulty),cat=move.category;
    const relevant=cat==="physical"?"defense":"specialDefense";
    const profiles=[{hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0}];
    if(level.defenderModels>=2){const x={hp:20,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0};x[relevant]=20;profiles.push(x);}
    if(level.defenderModels>=3){const x={hp:32,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:2};x[relevant]=32;profiles.push(x);}
    const result=[];
    for(const abilityId of v10AiAbilityCandidates(pub,difficulty))for(const points of profiles){
      const set=v10AiBaseSet(pub.speciesId,abilityId,pub.itemId||"none","まじめ",points);
      const p=createPokemon(set,0);p.side=pub.side;p.types=[...pub.types];p.status=pub.status;p.stages={...p.stages,...pub.stages};
      p.hp=Math.max(1,Math.floor(p.maxHP*Math.max(1,pub.hpPercent)/100));
      if(pub.substitute)p.substituteHP=Math.max(1,Math.floor(p.maxHP/4));
      result.push(p);
    }
    return result;
  }
  function v10AiBeliefAttackers(pub,move,difficulty){
    const cat=move.category,stat=cat==="physical"?"attack":"specialAttack";
    const points={hp:2,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:32};points[stat]=32;
    const nature=cat==="physical"?"いじっぱり":"ひかえめ";
    return v10AiAbilityCandidates(pub,difficulty).map(abilityId=>{
      const p=createPokemon(v10AiBaseSet(pub.speciesId,abilityId,pub.itemId||"none",nature,points),0);
      p.side=pub.side;p.types=[...pub.types];p.status=pub.status;p.stages={...p.stages,...pub.stages};return p;
    });
  }
  function v10AiExpectedDamageInfo(attacker,pub,move,difficulty){
    const eff=getEffectiveMove(attacker,move);
    if(!eff||eff.category==="status")return {mean:0,min:0,max:0,accuracy:eff?.accuracy??100};
    const vals=[];
    for(const defender of v10AiBeliefDefenders(pub,eff,difficulty)){
      try{
        const r=calculateDamage(attacker,defender,eff,{randomFactor:0.925,forceCritical:false});
        let dmg=Number(r?.damage||0);
        if(typeof v6CanTriggerResistBerry==="function"&&v6CanTriggerResistBerry(defender,eff,r?.effectiveness??1))dmg=Math.max(1,Math.floor(dmg*0.5));
        vals.push(dmg/Math.max(1,defender.maxHP));
      }catch(_){vals.push(0);}
    }
    if(!vals.length)vals.push(0);
    return {mean:vals.reduce((a,b)=>a+b,0)/vals.length,min:Math.min(...vals),max:Math.max(...vals),accuracy:eff.accuracy??100};
  }
  function v10AiMoveStaticThreat(sp,move){
    if(!move||move.category==="status")return -999;
    let x=(move.power||0)*((move.accuracy??100)/100);
    if(sp.types.includes(move.type))x*=1.35;
    if((move.priority||0)>0)x+=18;
    if(move.recharge)x-=25;
    if(move.selfDestruct||move.faintUser)x-=18;
    return x;
  }
  function v10AiPossibleOpponentMoves(pub,difficulty){
    const sp=SPECIES_DEX[pub.speciesId],limit=v10AiLevel(difficulty).possibleMoves;
    const revealed=pub.revealedMoves.map(id=>MOVE_DEX[id]).filter(Boolean);
    const candidates=sp.movePool.map(id=>MOVE_DEX[id]).filter(m=>m&&m.category!=="status")
      .sort((a,b)=>v10AiMoveStaticThreat(sp,b)-v10AiMoveStaticThreat(sp,a));
    const out=[];const add=m=>{if(m&&!out.some(x=>x.id===m.id))out.push(m);};
    revealed.forEach(add);candidates.slice(0,limit).forEach(add);return out;
  }
  function v10AiIncomingThreat(candidate,pub,difficulty){
    if(!candidate||!pub)return {expected:0,worst:0,observedWorst:0,observedLikelyAmount:0,observedWorstAmount:0,physical:0,special:0};
    const moves=v10AiPossibleOpponentMoves(pub,difficulty),revealed=new Set(pub.revealedMoves);
    const values=[];let phys=0,spec=0,observedWorst=0,observedLikelyAmount=0,observedWorstAmount=0;
    for(const move of moves){
      let modeled=0;
      for(const attacker of v10AiBeliefAttackers(pub,move,difficulty)){
        try{const r=calculateDamage(attacker,candidate,move,{randomFactor:0.925,forceCritical:false});modeled=Math.max(modeled,(Number(r?.damage||0)/Math.max(1,candidate.maxHP))*((move.accuracy??100)/100));}catch(_){}
      }
      const obs=revealed.has(move.id)?v10AiObservedDamageEstimate(candidate,pub,move):null;
      const observedLikely=obs?.likelyAmount?obs.likelyAmount/Math.max(1,candidate.maxHP):0;
      const observedSafe=obs?.safeMaxAmount?obs.safeMaxAmount/Math.max(1,candidate.maxHP):0;
      observedWorst=Math.max(observedWorst,observedSafe);
      observedLikelyAmount=Math.max(observedLikelyAmount,obs?.likelyAmount||0);
      observedWorstAmount=Math.max(observedWorstAmount,obs?.safeMaxAmount||0);
      // 実測した同一相手・同一技がある場合は、机上のタイプ相性より実測実数を優先する。
      const best=Math.max(modeled,observedLikely,observedSafe*0.93);
      const certainty=revealed.has(move.id)?1:(difficulty==="normal"?0.38:difficulty==="strong"?0.58:0.72);
      const weighted=best*certainty;values.push(weighted);
      if(move.category==="physical")phys=Math.max(phys,weighted);else spec=Math.max(spec,weighted);
    }
    values.sort((a,b)=>b-a);
    const worst=Math.max(values[0]||0,observedWorst);
    const expected=Math.max(observedWorst*0.92,values.slice(0,Math.min(3,values.length)).reduce((a,b)=>a+b,0)/Math.max(1,Math.min(3,values.length)));
    return {expected,worst,observedWorst,observedLikelyAmount,observedWorstAmount,physical:phys,special:spec};
  }

  function v10AiApproxSpeed(pub,difficulty){
    const sp=SPECIES_DEX[pub.speciesId];
    const set=v10AiBaseSet(pub.speciesId,pub.abilityId||sp.abilities[0].id,pub.itemId||"none","まじめ",{hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:difficulty==="normal"?0:16});
    const p=createPokemon(set,0);p.side=pub.side;p.stages={...p.stages,...pub.stages};
    return getModifiedStat(p,"speed");
  }
  function v10AiHazardValueAgainstOpponent(side,move){
    const ss=v6GetSideState(v8Other(side));
    const hz=move.hazard;
    if((hz==="stealthRock"&&ss.stealthRock)||(hz==="stickyWeb"&&ss.stickyWeb)||(hz==="spikes"&&(ss.spikes||0)>=3)||(hz==="toxicSpikes"&&(ss.toxicSpikes||0)>=2))return -80;
    const unseen=Math.max(0,3-v10AiSeenOpponentSpecies(side).length);
    return 28+unseen*12;
  }
  function v10AiSwitchCoverageAdjustment(side,move,difficulty){
    if(!v10AiLevel(difficulty).lookahead||move.category==="status")return 0;
    const possible=v10AiPossibleUnseenSpecies(side);if(!possible.length)return 0;
    const sample=possible.slice(0,6);let immune=0,resisted=0,superEff=0;
    sample.forEach(id=>{const mult=getTypeEffectiveness(move.type,SPECIES_DEX[id].types);if(mult===0)immune++;else if(mult<1)resisted++;else if(mult>1)superEff++;});
    return superEff*4-immune*13-resisted*4;
  }
  function v10AiRequiresChargeTurn(attacker,move){
    if(!move||(attacker?.chargingMoveId===move.id))return false;
    if(!(move.twoTurn||move.twoTurnWeather))return false;
    const weatherImmediate=(move.twoTurn==="solarBeam"&&weather.type==="sun")||(move.twoTurn==="electroShot"&&weather.type==="rain");
    const herb=Boolean(v6ItemIsActive(attacker)&&attacker.item?.id==="power-herb");
    return !weatherImmediate&&!herb;
  }
  function v10AiScoreMoveFor(attacker,side,pub,move,difficulty){
    const eff=getEffectiveMove(attacker,move);if(!eff)return -9999;
    const hp=attacker.hp/Math.max(1,attacker.maxHP),level=v10AiLevel(difficulty);
    if(eff.category!=="status"){
      const info=v10AiExpectedDamageInfo(attacker,pub,move,difficulty),visible=Math.max(.01,pub.hpPercent/100);
      const needsCharge=v10AiRequiresChargeTurn(attacker,eff);
      let score=info.mean*(needsCharge?82:205) + (info.accuracy-80)*0.25 + v10AiSwitchCoverageAdjustment(side,eff,difficulty);
      // 即時攻撃だけを「このターンのKO」として評価する。ため技は次ターンまで生存できるかを先に評価。
      if(!needsCharge){
        if(info.min>=visible)score+=155;else if(info.mean>=visible)score+=105;else if(info.max>=visible)score+=42;
        if((eff.priority||0)>0){score+=18;if(info.mean>=visible)score+=48;}
      }else{
        const threat=v10AiIncomingThreat(attacker,pub,difficulty);
        const incoming=Math.max(threat.worst||0,threat.observedWorst||0);
        const expected=Math.max(threat.expected||0,threat.observedWorst||0);
        let boostValue=0;
        if(eff.chargeBoost)for(const [stat,n] of Object.entries(eff.chargeBoost))boostValue+=Math.max(0,Math.min(n,6-(attacker.stages?.[stat]||0)))*16;
        score+=boostValue;
        // 「前回77%受けた・残り23%」のようなケースでは、タイプ相性より実測を優先してほぼ選ばない。
        if((threat.observedLikelyAmount||0)>=attacker.hp)score-=difficulty==="very-strong"?390:difficulty==="strong"?300:195;
        else if((threat.observedWorstAmount||0)>=attacker.hp)score-=difficulty==="very-strong"?315:difficulty==="strong"?245:155;
        else if(incoming>=hp)score-=difficulty==="very-strong"?285:difficulty==="strong"?220:145;
        else if(expected>=hp)score-=190;
        else{
          const margin=hp-incoming;
          if(margin<.12)score-=115;else if(margin<.25)score-=62;
          if(incoming<.22)score+=24;
        }
      }
      if(eff.pivot){const threat=v10AiIncomingThreat(attacker,pub,difficulty);score+=14+Math.max(0,threat.expected-.45)*55;}
      if(eff.drainRatio&&hp<.72)score+=26;
      if((eff.recoilRatio||eff.recoilMaxHPRatio)&&hp<.35)score-=55;
      if(eff.recharge&&info.mean<visible)score-=72;
      if(eff.futureSight){const pending=v6GetSideState(pub.side)?.futureSight;if(pending)return -9999;score=38+info.mean*75;}
      if(eff.selfDestruct||eff.faintUser){score+=info.mean>=visible?30:-85;if(hp<.22)score+=24;}
      return score;
    }
    let score=10;
    const threat=v10AiIncomingThreat(attacker,pub,difficulty);
    if(eff.healRatio||eff.recover||eff.roost||eff.moonlight||eff.synthesis){score+=hp<.32?125:hp<.55?72:hp<.75?22:-90;score+=threat.expected*45;}
    if(eff.rest){score+=hp<.36?96:hp<.58?45:-100;if(attacker.status)score+=35;}
    if(eff.selfStatChanges){let gains=0;for(const [stat,n] of Object.entries(eff.selfStatChanges))gains+=Math.max(0,Math.min(n,6-(attacker.stages[stat]||0)));score+=gains*19;if(hp<.38)score-=42;if(threat.worst<.45)score+=28;}
    if(eff.hazard||eff.stealthRock||eff.spikes||eff.toxicSpikes||eff.stickyWeb)score+=v10AiHazardValueAgainstOpponent(side,eff);
    const ownSS=v6GetSideState(side);
    if((eff.screen==="reflect"||eff.reflect))score+=ownSS.reflect>0?-70:42+threat.physical*35;
    if((eff.screen==="lightScreen"||eff.lightScreen))score+=ownSS.lightScreen>0?-70:42+threat.special*35;
    if(eff.tailwind)score+=fieldState.tailwind[side]>0?-65:(getModifiedStat(attacker,"speed")<v10AiApproxSpeed(pub,difficulty)?62:28);
    if(eff.trickRoom){const slower=getModifiedStat(attacker,"speed")<v10AiApproxSpeed(pub,difficulty);score+=fieldState.trickRoom>0?-38:(slower?64:-24);}
    if(eff.status||eff.toxic||eff.yawn)score+=pub.status? -80:54;
    if(eff.taunt)score+=pub.tauntTurns>0?-60:34;
    if(eff.encore)score+=pub.revealedMoves.length?30:8;
    if(eff.disable)score+=pub.revealedMoves.length?28:6;
    if(eff.protect||eff.protectLike){score+=hp<.28?34:12;if(attacker.status||attacker.seeded)score-=14;}
    if(eff.weather)score+=weather.type===eff.weather?-55:22;
    if(eff.terrain)score+=v6EnsureFieldState().terrain.type===eff.terrain?-50:24;
    if(eff.substitute)score+=hp>.55?24:-45;
    if(eff.forceSwitch)score+=v10AiSeenOpponentSpecies(side).length<3?18:8;
    return score;
  }
  function v10AiRankMoves(side,difficulty){
    const attacker=v8Active(side),pub=v10AiPublicOpponent(side);if(!attacker||!pub)return [];
    const selectable=getSelectableMoves(attacker),moves=selectable.length?selectable:[{...STRUGGLE_MOVE}];
    return moves.map(move=>({move,score:v10AiScoreMoveFor(attacker,side,pub,move,difficulty)})).sort((a,b)=>b.score-a.score);
  }
  function v10AiSwitchScore(side,candidate,pub,difficulty){
    const threat=v10AiIncomingThreat(candidate,pub,difficulty),hp=candidate.hp/Math.max(1,candidate.maxHP);
    let offense=-999;
    for(const move of getSelectableMoves(candidate)){offense=Math.max(offense,v10AiScoreMoveFor(candidate,side,pub,move,difficulty));}
    if(!Number.isFinite(offense))offense=0;
    let score=offense*.72 + hp*42 - threat.expected*115 - threat.worst*55;
    if(threat.observedWorst>0){
      score-=threat.observedWorst*(difficulty==="very-strong"?150:difficulty==="strong"?105:55);
      // KO可否は割合ではなく、CPU自身が覚えている実ダメージと現在HPの実数で直接比較する。
      if((threat.observedLikelyAmount||0)>=candidate.hp)score-=difficulty==="very-strong"?370:difficulty==="strong"?270:135;
      else if((threat.observedWorstAmount||0)>=candidate.hp)score-=difficulty==="very-strong"?245:difficulty==="strong"?170:90;
      else if((threat.observedWorstAmount||0)>=candidate.hp*.82)score-=difficulty==="very-strong"?145:difficulty==="strong"?95:45;
    }
    if(getModifiedStat(candidate,"speed")>v10AiApproxSpeed(pub,difficulty))score+=12;
    const ss=v6GetSideState(side);if(ss.stealthRock)score-=getTypeEffectiveness("いわ",candidate.types)*8;if((ss.spikes||0)>0&&!v6IsGrounded(candidate))score+=0;else score-=(ss.spikes||0)*5;
    if(candidate.ability?.id==="regenerator"&&candidate.hp<candidate.maxHP*.7)score+=8;
    return score;
  }
  function v10AiChooseSwitchIndex(side,difficulty,{replacement=false,pivot=false}={}){
    const pub=v10AiPublicOpponent(side),team=v8GetTeam(side),active=v8GetIndex(side);
    const list=team.map((p,i)=>({p,i})).filter(x=>x.i!==active&&x.p.hp>0);if(!list.length)return -1;
    const ranked=list.map(x=>({...x,score:v10AiSwitchScore(side,x.p,pub,difficulty)})).sort((a,b)=>b.score-a.score);
    if(difficulty==="normal"&&ranked.length>1&&Math.random()<.28)return ranked[Math.floor(Math.random()*Math.min(2,ranked.length))].i;
    return ranked[0].i;
  }
  function v10AiChooseAction(side,difficulty=v10DifficultyForSide(side)){
    const own=v8Active(side),pub=v10AiPublicOpponent(side);if(!own||!pub)return {type:"move",move:own?.moves?.[0]||{...STRUGGLE_MOVE}};
    const selectable=getSelectableMoves(own);
    if(own.chargingMoveId||own.rampageMoveId){return {type:"move",move:selectable[0]||own.moves.find(m=>m.id===own.chargingMoveId||m.id===own.rampageMoveId)||{...STRUGGLE_MOVE},forced:true};}
    if(own.rechargeNext)return {type:"move",move:{...STRUGGLE_MOVE,id:"v10-recharge-skip",name:"反動",struggle:true},forced:true};
    const ranked=v10AiRankMoves(side,difficulty);let best=ranked[0]||{move:{...STRUGGLE_MOVE},score:0};
    const level=v10AiLevel(difficulty);
    if(ranked.length>1&&level.moveNoise>0){
      const top=ranked.slice(0,Math.min(difficulty==="normal"?3:2,ranked.length));
      if(Math.random()<level.moveNoise)best=top[Math.floor(Math.random()*top.length)];
    }
    if(!isTrappedByOpponent(own,v8Active(v8Other(side)))&&v8HasBench(side)){
      const idx=v10AiChooseSwitchIndex(side,difficulty),candidate=idx>=0?v8GetTeam(side)[idx]:null;
      if(candidate){
        const switchScore=v10AiSwitchScore(side,candidate,pub,difficulty);
        const currentThreat=v10AiIncomingThreat(own,pub,difficulty);
        const danger=currentThreat.worst>=own.hp/Math.max(1,own.maxHP)||currentThreat.expected>.62;
        let threshold=best.score+level.switchMargin;
        if(danger)threshold-=difficulty==="very-strong"?58:difficulty==="strong"?35:10;
        if(switchScore>threshold&&(difficulty!=="normal"||Math.random()<.55))return {type:"switch",index:idx};
      }
    }
    return {type:"move",move:best.move};
  }

  // Compatibility hooks used by the human-vs-CPU resolver. These now use the public-information AI.
  chooseEnemyAction=function(){ return v10AiChooseAction("enemy",v10CpuDifficultyB); };
  chooseEnemyReplacement=function(){ return v10AiChooseSwitchIndex("enemy",v10CpuDifficultyB,{replacement:true}); };

  function v10AiSelectionPublic(speciesId){
    const sp=SPECIES_DEX[speciesId];return {side:"player",speciesId,types:[...sp.types],hpPercent:100,status:null,stages:{attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0,accuracy:0,evasion:0},abilityId:null,itemId:null,revealedMoves:[],substitute:false,tauntTurns:0,confused:false,seeded:false,protectChain:0};
  }
  function v10AiSelectionMatrix(roster,opponentRoster,difficulty){
    const oppSpecies=opponentRoster.map(x=>x.speciesId); // opponent set details intentionally discarded
    // 選出評価は前の対戦の天候・壁・フィールド等を引き継がない中立盤面で行う。
    const savedWeather=weather,savedField=fieldState;
    weather={type:null,turns:0};fieldState={trickRoom:0,tailwind:{player:0,enemy:0}};if(typeof v6EnsureFieldState==="function")v6EnsureFieldState();
    try{
      return roster.map((set,i)=>{
        const own=createPokemon(set,i);own.side="enemy";
        return oppSpecies.map(id=>{
          const pub=v10AiSelectionPublic(id);pub.side="player";
          let offense=0;for(const m of own.moves)offense=Math.max(offense,v10AiExpectedDamageInfo(own,pub,m,difficulty).mean);
          const threat=v10AiIncomingThreat(own,pub,difficulty);
          return offense*100-threat.expected*68-threat.worst*22;
        });
      });
    }finally{weather=savedWeather;fieldState=savedField;}
  }
  function v10AiChooseSelection(roster,opponentRoster,difficulty="strong"){
    const idx=roster.map((_,i)=>i);
    if(difficulty==="normal")return shuffle(idx).slice(0,3);
    const matrix=v10AiSelectionMatrix(roster,opponentRoster,difficulty);
    let best=[0,1,2],bestScore=-Infinity;
    for(let a=0;a<idx.length;a++)for(let b=a+1;b<idx.length;b++)for(let c=b+1;c<idx.length;c++){
      const trio=[a,b,c];let score=0;
      for(let j=0;j<opponentRoster.length;j++){
        const vals=trio.map(i=>matrix[i][j]).sort((x,y)=>y-x);score+=vals[0]+(difficulty==="very-strong"?(vals[1]||0)*.22:0);
      }
      if(difficulty==="very-strong")score+=v10TeamStrategicQuality(trio.map(i=>roster[i]))*.55;
      if(score>bestScore){bestScore=score;best=trio;}
    }
    best.sort((i,j)=>{
      const ai=matrix[i].reduce((a,b)=>a+b,0)/matrix[i].length;
      const aj=matrix[j].reduce((a,b)=>a+b,0)/matrix[j].length;return aj-ai;
    });
    return best;
  }
  function v8ChooseCpuSelection(roster,opponentRoster){ return v10AiChooseSelection(roster,opponentRoster,"strong"); }


  // ------------------------------------------------------------
  // 対戦モード / 選出
  // ------------------------------------------------------------
  let v8BattleMode = "cpu";
  let v8RosterA = [];
  let v8RosterB = [];
  let v8SelectionA = [];
  let v8SelectionB = [];
  let v8SelectionStage = "A";
  let v8SelectionView = "chooser";

  function v8OpenModeScreen() {
    // CPU vs CPUは現在の編成を使わずに両CPUが自動構築できるため、ここでは編成妥当性で入口を塞がない。
    // 「現在の編成」を実際に選んだ場合は、次画面へ進む時点でv8ValidateTeamが検証する。
    v8RenderBattleSourceOptions();
    showScreen("mode");
  }

  function v8StartSelectionSetup() {
    v8BattleMode = v8BattleModeSelect.value;
    v10CpuDifficultyA = v10CpuDifficultyASelect?.value || "very-strong";
    v10CpuDifficultyB = v10CpuDifficultyBSelect?.value || "very-strong";
    const sourceADifficulty = v8BattleMode === "cpu-cpu" ? v10CpuDifficultyA : "very-strong";
    v8RosterA = v8GetSourceSets(v8PartySourceA.value, sourceADifficulty);
    v8RosterB = v8GetSourceSets(v8PartySourceB.value, v10CpuDifficultyB);
    const errA=v8ValidateTeam(v8RosterA), errB=v8ValidateTeam(v8RosterB);
    if (errA || errB) { setBuilderMessage(errA || errB,true); showScreen("builder"); return; }
    v8SelectionA=[]; v8SelectionB=[]; v8SelectionStage="A"; v8SelectionView="chooser";
    if(v8BattleMode==="cpu"){
      v8SelectionB=v10AiChooseSelection(v8RosterB,v8RosterA,v10CpuDifficultyB);
    }else if(v8BattleMode==="cpu-cpu"){
      v8SelectionA=v10AiChooseSelection(v8RosterA,v8RosterB,v10CpuDifficultyA);
      v8SelectionB=v10AiChooseSelection(v8RosterB,v8RosterA,v10CpuDifficultyB);
      v8SelectionView="spectator";
      // CPU vs CPUは構築→6→3選出→先発決定→対戦開始まで完全自動。
      // プレイヤーに選出確定ボタンを要求しない。
      v8StartBattle();
      return;
    }
    v8RenderSelection(); showScreen("selection");
  }

  function v8SetCardDetail(set, publicOnly=false) {
    const sp=SPECIES_DEX[set.speciesId];
    if (publicOnly) return `<div class="preview-name">${sp.name}</div><div class="preview-meta">${sp.types.join(" / ")}</div><div class="set-public-note">技・特性・持ち物・実数値は非公開</div>`;
    const stats=calculateSetStats(set);
    const ability=sp.abilities.find(a=>a.id===set.abilityId)?.name || "-";
    const item=ITEM_DEX[set.itemId]?.name || "なし";
    const moveButtons=set.moves.map(id=>`<button type="button" data-v8-move-detail="${id}">${MOVE_DEX[id]?.name||id}</button>`).join("");
    return `<div class="preview-name">${sp.name}</div><div class="preview-meta">${sp.types.join(" / ")}<br>特性 ${ability}　持ち物 ${item}<br>性格 ${set.nature}（${getNatureDescription(set.nature)}）　能力P ${getStatPointTotal(set)}/66</div><div class="set-stat-line">H${stats.hp} / A${stats.attack} / B${stats.defense} / C${stats.specialAttack} / D${stats.specialDefense} / S${stats.speed}</div><div class="set-move-list">${moveButtons}</div>`;
  }

  function v8AttachPreviewDetails(container) {
    container.querySelectorAll?.("[data-v8-move-detail]").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); showMoveDetail(btn.dataset.v8MoveDetail); }));
  }

  function v8RenderSelection() {
    enemyPreview.innerHTML=""; playerPreview.innerHTML="";

    if(v8BattleMode==="cpu-cpu"){
      if(v8SelectionView==="chooser")v8SelectionView="spectator";
      const full=v8SelectionView==="god";
      const chooserButton=v8SelectionViewButtons?.querySelector?.('[data-selection-view="chooser"]');
      chooserButton?.classList.add("hidden");
      v8SelectionViewButtons?.querySelectorAll?.("[data-selection-view]").forEach(b=>b.classList.toggle("active",b.dataset.selectionView===v8SelectionView));
      if(v8SelectionOperatorBanner){v8SelectionOperatorBanner.textContent=`CPU A/B 選出済み：A ${v10DifficultyLabel(v10CpuDifficultyA)} / B ${v10DifficultyLabel(v10CpuDifficultyB)}`;v8SelectionOperatorBanner.dataset.state="view";}
      v8SelectionHeading.textContent=`③ CPU vs CPU 見せ合い（${full?"神視点":"観戦視点"}）`;
      v8SelectionDescription.textContent=full?"両CPUの完全情報を表示しています。AI自身はこの神視点情報を参照しません。":"CPU A/Bは見せ合い6匹だけを材料に3匹を自動選出済みです。選出内容は対戦開始まで非公開です。";
      v8PlayerPreviewTitle.textContent=`CPU Aの6匹（${v10DifficultyLabel(v10CpuDifficultyA)}）`;
      v8EnemyPreviewTitle.textContent=`CPU Bの6匹（${v10DifficultyLabel(v10CpuDifficultyB)}）`;
      const renderRoster=(container,roster)=>{container.classList.add("readonly");roster.forEach(set=>{const c=document.createElement("div");c.className="preview-card";c.innerHTML=v8SetCardDetail(set,!full);container.appendChild(c);});if(full)v8AttachPreviewDetails(container);};
      renderRoster(playerPreview,v8RosterA);renderRoster(enemyPreview,v8RosterB);
      selectionCount.textContent="CPU選出済み";
      const startBtn=document.getElementById("start-battle-button"),clearBtn=document.getElementById("clear-selection-button"),reroll=document.getElementById("reroll-enemy-button");
      if(startBtn){startBtn.disabled=false;startBtn.textContent="CPU同士の対戦を開始";}
      if(clearBtn)clearBtn.disabled=true;
      reroll?.classList.toggle("hidden",v8PartySourceB.value!=="random");
      return;
    }
    v8SelectionViewButtons?.querySelector?.('[data-selection-view="chooser"]')?.classList.remove("hidden");
    const isB = v8BattleMode === "pvp" && v8SelectionStage === "B";
    const chooserSide = isB ? "enemy" : "player";
    const own = isB ? v8RosterB : v8RosterA;
    const other = isB ? v8RosterA : v8RosterB;
    const sel = isB ? v8SelectionB : v8SelectionA;
    const startBtn=document.getElementById("start-battle-button");
    const clearBtn=document.getElementById("clear-selection-button");

    v8SelectionViewButtons?.querySelectorAll?.("[data-selection-view]").forEach(b=>b.classList.toggle("active",b.dataset.selectionView===v8SelectionView));
    if(v8SelectionOperatorBanner){
      if(v8SelectionView==="chooser"){
        v8SelectionOperatorBanner.textContent=`選出操作中：プレイヤー${isB?"B":"A"}`;
        v8SelectionOperatorBanner.dataset.state=isB?"B":"A";
      }else{
        v8SelectionOperatorBanner.textContent=`表示のみ：${v8SelectionView==="god"?"神視点":"観戦視点"}（選出操作はプレイヤー${isB?"B":"A"}）`;
        v8SelectionOperatorBanner.dataset.state="view";
      }
    }
    document.getElementById("reroll-enemy-button")?.classList.toggle("hidden", v8BattleMode !== "cpu" || v8PartySourceB.value !== "random" || v8SelectionView!=="chooser");

    if(v8SelectionView!=="chooser") {
      const full=v8SelectionView==="god";
      v8SelectionHeading.textContent=`③ 見せ合い確認（${full?"神視点":"観戦視点"}）`;
      v8SelectionDescription.textContent=full?"両者の6匹について、技・特性・持ち物・実数値を含む完全情報を表示しています。":"両者の6匹について、見せ合い時に公開される種族・タイプだけを表示しています。";
      v8EnemyPreviewTitle.textContent="プレイヤーBの6匹";
      v8PlayerPreviewTitle.textContent="プレイヤーAの6匹";
      const renderRoster=(container,roster)=>{
        container.classList.add("readonly");
        roster.forEach(set=>{const c=document.createElement("div");c.className="preview-card";c.innerHTML=v8SetCardDetail(set,!full);container.appendChild(c);});
        if(full)v8AttachPreviewDetails(container);
      };
      renderRoster(playerPreview,v8RosterA); renderRoster(enemyPreview,v8RosterB);
      selectionCount.textContent="表示のみ";
      if(startBtn){startBtn.disabled=true;startBtn.textContent="選出者視点に戻って選出";}
      if(clearBtn)clearBtn.disabled=true;
      return;
    }

    enemyPreview.classList.remove("readonly"); playerPreview.classList.remove("readonly");
    v8SelectionHeading.textContent = `③ 3匹を選出（プレイヤー${isB?"B":"A"}）`;
    v8SelectionDescription.textContent = "3匹を順番に選択してください。1匹目が先発です。";
    v8PlayerPreviewTitle.textContent = `プレイヤー${isB?"B":"A"}の6匹`;
    v8EnemyPreviewTitle.textContent = v8BattleMode === "cpu" ? "CPUの6匹" : `プレイヤー${isB?"A":"B"}の6匹`;

    other.forEach(set => { const c=document.createElement("div"); c.className="preview-card"; c.innerHTML=v8SetCardDetail(set,true); enemyPreview.appendChild(c); });
    own.forEach((set,index)=>{
      const order=sel.indexOf(index); const c=document.createElement("div"); c.className=`preview-card${order>=0?" selected":""}`;
      c.innerHTML=`${order>=0?`<span class="order-badge">${order+1}</span>`:""}${v8SetCardDetail(set,false)}`;
      c.addEventListener("click",()=>{ const x=sel.indexOf(index); if(x>=0)sel.splice(x,1);else if(sel.length<3)sel.push(index);v8RenderSelection(); });
      playerPreview.appendChild(c);
    });
    v8AttachPreviewDetails(playerPreview);
    selectionCount.textContent=`${sel.length} / 3`;
    if(startBtn){ startBtn.disabled=sel.length!==3; startBtn.textContent=(v8BattleMode==="pvp"&&v8SelectionStage==="A")?"Aの選出を確定":"この3匹でバトル開始"; }
    if(clearBtn)clearBtn.disabled=false;
  }

  function v8SelectionViewMode(){
    if(v8SelectionView==="god")return "god";
    if(v8SelectionView==="spectator")return "spectator";
    const isB=v8BattleMode==="pvp"&&v8SelectionStage==="B";
    return isB?"B":"A";
  }
  function v8SelectionSetText(set,side,viewMode){
    const sp=SPECIES_DEX[set.speciesId];
    const privateInfo=viewMode==="god"||(viewMode==="A"&&side==="player")||(viewMode==="B"&&side==="enemy");
    if(!privateInfo)return `${sp.name} [${sp.types.join("/")}] / 技・特性・持ち物・実数値は非公開`;
    const stats=calculateSetStats(set);
    const ability=sp.abilities.find(a=>a.id===set.abilityId)?.name||"-";
    const item=ITEM_DEX[set.itemId]?.name||"なし";
    const moves=set.moves.map(id=>MOVE_DEX[id]?.name||id).join(" / ");
    return `${sp.name} [${sp.types.join("/")}] / 特性 ${ability} / 持ち物 ${item} / 性格 ${set.nature} / H${stats.hp} A${stats.attack} B${stats.defense} C${stats.specialAttack} D${stats.specialDefense} S${stats.speed} / 技 ${moves}`;
  }
  function v8BuildSelectionContextText(){
    const viewMode=v8SelectionViewMode();
    const isB=v8BattleMode==="pvp"&&v8SelectionStage==="B";
    const labels={A:"プレイヤーA視点",B:"プレイヤーB視点",spectator:"観戦視点",god:"神視点"};
    const rosterLines=(side,roster)=>roster.map((set,i)=>`${i+1}. ${v8SelectionSetText(set,side,viewMode)}`);
    const lines=[
      `【ニワラバトル v${V8_VERSION} 見せ合い状況コピー】`,
      `視点: ${labels[viewMode]}`,
      `対戦形式: ${v8BattleMode==="pvp"?"2人対戦":v8BattleMode==="cpu-cpu"?"CPU vs CPU":"対CPU戦"}`,
      `選出操作中: ${v8BattleMode==="cpu-cpu"?"CPU A/B（自動選出済み）":`プレイヤー${isB?"B":"A"}`}`,
      "",
      "【プレイヤーAの6匹】",
      ...rosterLines("player",v8RosterA),
      "",
      "【プレイヤーBの6匹】",
      ...rosterLines("enemy",v8RosterB),
      "",
      "【選出状況】",
      viewMode==="A"?`プレイヤーA: ${v8SelectionA.length? v8SelectionA.map((i,n)=>`${n+1}:${SPECIES_DEX[v8RosterA[i].speciesId].name}`).join(" / "):"未選択"}`:
      viewMode==="B"?`プレイヤーB: ${v8SelectionB.length? v8SelectionB.map((i,n)=>`${n+1}:${SPECIES_DEX[v8RosterB[i].speciesId].name}`).join(" / "):"未選択"}`:
      "選出内容・選出順は非公開",
      "",
      "【ここまでの対戦ログ】",
      "対戦開始前のためログなし"
    ];
    return lines.join("\n");
  }
  async function v8CopySelectionContext(){
    const original=v8CopySelectionContextButton?.textContent||"状況＋ログをコピー";
    try{await v8WriteClipboard(v8BuildSelectionContextText());if(v8CopySelectionContextButton)v8CopySelectionContextButton.textContent="コピーしました";}
    catch(e){console.warn("selection context copy failed",e);if(v8CopySelectionContextButton)v8CopySelectionContextButton.textContent="コピー失敗";}
    setTimeout(()=>{if(v8CopySelectionContextButton)v8CopySelectionContextButton.textContent=original;},1400);
  }

  // ------------------------------------------------------------
  // 公開情報・4視点
  // ------------------------------------------------------------
  let v8ViewMode = "A";
  let v8WeatherMeta = { sourceSide:null, sourcePokemon:null, extended:false };
  let v8TerrainMeta = { sourceSide:null, sourcePokemon:null, extended:false };
  let v8ScreenMeta = { player:{reflect:null,lightScreen:null}, enemy:{reflect:null,lightScreen:null} };

  function v8EnsureKnowledge(p) {
    if (!p.v8Knowledge) p.v8Knowledge={seen:false,ability:false,item:false,moves:[]};
    return p.v8Knowledge;
  }

  const V8_createPokemon = createPokemon;
  createPokemon = function(set, rosterIndex=0) { const p=V8_createPokemon(set,rosterIndex); v8EnsureKnowledge(p); return p; };

  function v8MarkSeen(p){ if(p)v8EnsureKnowledge(p).seen=true; }
  function v8MarkMove(p,id){ if(!p||!id)return; const k=v8EnsureKnowledge(p); if(!k.moves.includes(id))k.moves.push(id); }
  function v8MarkAbility(p){ if(p)v8EnsureKnowledge(p).ability=true; }
  function v8MarkItem(p){ if(p)v8EnsureKnowledge(p).item=true; }

  function v8AllBattlePokemon(){ return [...(playerTeam||[]),...(enemyTeam||[])].filter(Boolean); }
  function v8ActiveBattlePokemon(){ return [getPlayerPokemon?.(),getEnemyPokemon?.()].filter(Boolean); }
  function v8MarkUniqueEffectOwnerFromLog(text,kind){
    const s=String(text);
    const candidates=v8AllBattlePokemon().filter(p=>{
      if(!p?.name||!s.includes(p.name))return false;
      if(kind==="ability")return Boolean(p.ability?.name&&s.includes(p.ability.name));
      return Boolean(p.item?.id&&p.item.id!=="none"&&p.item?.name&&s.includes(p.item.name));
    });
    if(!candidates.length)return;
    // 同名個体が両軍・控えに存在しても、場にいる一致個体が1匹だけならその個体だけを公開する。
    // それでも曖昧なら「公開しない」側へ倒し、非公開情報の誤開示を優先して防ぐ。
    const activeSet=new Set(v8ActiveBattlePokemon());
    const activeMatches=candidates.filter(p=>activeSet.has(p));
    const target=activeMatches.length===1?activeMatches[0]:(candidates.length===1?candidates[0]:null);
    if(!target)return;
    if(kind==="ability")v8MarkAbility(target);else v8MarkItem(target);
  }
  // legacy: ログごとに「HP変化の対象側」を付与する。
  // 表示時に A/B本人は実数、相手側は%へ変換するためのメタ情報であり、
  // 非公開の最大HPそのものを画面やコピーへ出すことはない。
  let v915MoveExecutionContext=null;
  let v915ResidualPokemon=null;
  const v915BatchContexts=new WeakMap();

  function v915SideOfPokemon(p){
    if(!p)return null;
    if((playerTeam||[]).includes(p))return "player";
    if((enemyTeam||[]).includes(p))return "enemy";
    return null;
  }
  function v915HasHpAmount(text){
    return /\b\d+\s+(?:HP\s+)?(?:ダメージ|回復|吸収|奪われ)|HPを\s+\d+\s+失った/.test(String(text));
  }
  function v915InferTargetFromText(text,ctx=null){
    const t=String(text);
    if(!v915HasHpAmount(t))return null;
    if(ctx?.attacker&&ctx?.defender){
      // 通常攻撃の無名ダメージ行は必ず防御側。
      if(/^\s*\d+\s+ダメージ！/.test(t))return ctx.defender;
      if(t.startsWith(`${ctx.attacker.name}は `)||t.startsWith(`${ctx.attacker.name}の `))return ctx.attacker;
      if(t.startsWith(`${ctx.defender.name}は `)||t.startsWith(`${ctx.defender.name}に `))return ctx.defender;
      if(t.includes("みがわり")&&/\d+\s+ダメージ/.test(t))return ctx.defender;
    }
    if(v915ResidualPokemon&&t.startsWith(`${v915ResidualPokemon.name}は `))return v915ResidualPokemon;
    const active=v8ActiveBattlePokemon().filter(p=>p?.name&&t.startsWith(p.name));
    if(active.length===1)return active[0];
    const all=v8AllBattlePokemon().filter(p=>p?.name&&t.startsWith(p.name));
    if(all.length===1)return all[0];
    return null;
  }
  function v915AttachLogMeta(target){
    if(!target||!battleLog?.length)return;
    const side=v915SideOfPokemon(target);
    if(!side||!target.maxHP)return;
    const entry=battleLog[battleLog.length-1];
    entry.v915HpTarget={side,maxHP:target.maxHP,name:target.name};
  }

  const V8_addLog = addLog;
  addLog = function(text,className="",v915Target=null) {
    // seen はログ文字列の名前から推測しない。実際に場へ出た個体だけを公開する。
    v8MarkUniqueEffectOwnerFromLog(text,"ability");
    v8MarkUniqueEffectOwnerFromLog(text,"item");
    const result=V8_addLog(text,className);
    const inferred=v915Target||v915InferTargetFromText(text,v915MoveExecutionContext);
    if(inferred)v915AttachLogMeta(inferred);
    return result;
  };

  const V8_ANNOUNCED_ENTRY_ABILITIES = new Set(["fairy-aura"]);
  const V8_activateEntryAbility = activateEntryAbility;
  activateEntryAbility = function(p) {
    const hpBefore=Number(p?.hp??0);
    v8MarkSeen(p);
    if(p?.ability && V8_ANNOUNCED_ENTRY_ABILITIES.has(p.ability.id)) {
      addLog(`${p.name}の ${p.ability.name}が発動した！`, "log-system");
    }
    const result=V8_activateEntryAbility(p);
    if(hpBefore>0 && p?.hp<=0)v1014MarkFaint(p,"entry");
    return result;
  };

  const V8_useMoveKnowledge = useMove;
  useMove = function(attacker, defender, selectedMove) {
    // 先手アンコールを受けて同一ターン中に行動する場合、最外層から実際の強制技を
    // 下位ランタイムへ渡す。これにより v7/v7.1/v7.2 の特殊技ラッパーも、選択時の技では
    // なくアンコール対象技を基準に処理する。ふいうちの成否判定は選択済み行動を別経路で参照する。
    let move=selectedMove;
    if(attacker?.encoreTurns>0 && attacker?.encoreMoveId && selectedMove?.id!==attacker.encoreMoveId){
      const forced=attacker.moves?.find?.(m=>m.id===attacker.encoreMoveId);
      if(forced&&forced.pp>0)move=forced;
    }
    const prev=v915MoveExecutionContext;
    const ctx={attacker,defender,move};
    const hadSubstitute=Boolean(defender?.substituteHP>0);
    const defenderHpBefore=Number(defender?.hp??0);
    const attackerHpBefore=Number(attacker?.hp??0);
    v915MoveExecutionContext=ctx;
    let logs;
    try{logs=V8_useMoveKnowledge(attacker,defender,move);}finally{v915MoveExecutionContext=prev;}

    const attackerFainted=attackerHpBefore>0&&attacker?.hp<=0;
    const defenderFainted=defenderHpBefore>0&&defender?.hp<=0;
    if(attackerFainted&&defenderFainted){
      // 自爆技/いのちがけは使用者が先に倒れる扱い。それ以外の反動・いのちのたま・
      // みちづれ等は相手へのダメージ確定後に使用者側が倒れる順として扱う。
      if(move?.selfFaintAfterDamage||move?.finalGambit){
        v1014MarkFaint(attacker,"self-ko-move");
        v1014MarkFaint(defender,"move-damage");
      }else{
        v1014MarkFaint(defender,"move-damage");
        v1014MarkFaint(attacker,"recoil-or-followup");
      }
    }else{
      if(defenderFainted)v1014MarkFaint(defender,"move-damage");
      if(attackerFainted)v1014MarkFaint(attacker,move?.selfFaintAfterDamage||move?.finalGambit||move?.selfFaint?"self-ko-move":"recoil-or-followup");
    }

    // CPU側は、自分が実際に失ったHP実数だけを学習する。相手側の正確HPは参照しない。
    v10AiRecordObservedDamage(attacker,defender,move,logs,hadSubstitute,defenderHpBefore);
    if(Array.isArray(logs))v915BatchContexts.set(logs,ctx);
    const name=move?.name || MOVE_DEX[move?.id]?.name;
    if (name && logs?.some?.(x=>String(x).includes(`${attacker.name}の ${name}`))) v8MarkMove(attacker,move.id);
    return logs;
  };

  // useMove() が返したログ配列は、各行を対象ポケモンと結び付けて保存する。
  const V915_addLogs=addLogs;
  addLogs=function(logs){
    const ctx=Array.isArray(logs)?v915BatchContexts.get(logs):null;
    if(!ctx)return V915_addLogs(logs);
    logs.forEach(text=>addLog(text,"",v915InferTargetFromText(text,ctx)));
    v915BatchContexts.delete(logs);
  };

  if(typeof processResidualForPokemon==="function"){
    const V915_processResidualForPokemon=processResidualForPokemon;
    processResidualForPokemon=function(pokemon){
      const prev=v915ResidualPokemon;v915ResidualPokemon=pokemon;
      const hpBefore=Number(pokemon?.hp??0);
      try{return V915_processResidualForPokemon(pokemon);}
      finally{
        if(hpBefore>0&&pokemon?.hp<=0)v1014MarkFaint(pokemon,"end-turn-residual");
        v915ResidualPokemon=prev;
      }
    };
  }
  // みらいよち等、processResidualForPokemon 外でターン終了時に発生するHP減少も記録。
  if(typeof endTurn==="function"){
    const V1014_endTurnFaintTrack=endTurn;
    endTurn=function(){
      const playerBefore=Number(getPlayerPokemon()?.hp??0);
      const enemyBefore=Number(getEnemyPokemon()?.hp??0);
      const result=V1014_endTurnFaintTrack();
      // v6 side処理は player -> enemy の順。通常残ダメは上の residual wrapper ですでに記録済み。
      if(playerBefore>0&&getPlayerPokemon()?.hp<=0&&!getPlayerPokemon()?.v1014FaintOrder)v1014MarkFaint(getPlayerPokemon(),"delayed-end-turn");
      if(enemyBefore>0&&getEnemyPokemon()?.hp<=0&&!getEnemyPokemon()?.v1014FaintOrder)v1014MarkFaint(getEnemyPokemon(),"delayed-end-turn");
      return result;
    };
  }
  // 交代時回復・設置物ダメージ・木の実なども同名個体を取り違えず対象側を記録する。
  if(typeof onSwitchOut==="function"){const base=onSwitchOut;onSwitchOut=function(pokemon,...args){const prev=v915ResidualPokemon;v915ResidualPokemon=pokemon;try{return base(pokemon,...args);}finally{v915ResidualPokemon=prev;}};}
  if(typeof v6EntryHazards==="function"){const base=v6EntryHazards;v6EntryHazards=function(pokemon,...args){const prev=v915ResidualPokemon;v915ResidualPokemon=pokemon;try{return base(pokemon,...args);}finally{v915ResidualPokemon=prev;}};}
  if(typeof trySitrusBerry==="function"){const base=trySitrusBerry;trySitrusBerry=function(pokemon,...args){const prev=v915ResidualPokemon;v915ResidualPokemon=pokemon;try{return base(pokemon,...args);}finally{v915ResidualPokemon=prev;}};}

  const V8_setWeather=setWeather;
  setWeather=function(type,source=null){ const changed=V8_setWeather(type,source); if(changed){v8WeatherMeta={sourceSide:source?.side||null,sourcePokemon:source||null,extended:weather.turns>5};} return changed; };
  if (typeof v6SetTerrain === "function") {
    const base=v6SetTerrain; v6SetTerrain=function(type,source){ base(type,source); v8TerrainMeta={sourceSide:source?.side||null,sourcePokemon:source||null,extended:v6EnsureFieldState().terrain.turns>5}; };
  }
  if (typeof v6SetScreen === "function") {
    const base=v6SetScreen; v6SetScreen=function(side,screen,source){ base(side,screen,source); v8ScreenMeta[side][screen]={sourceSide:side,sourcePokemon:source||null,extended:v6GetSideState(side)[screen]>5}; };
  }

  function v8CanSeePrivateForView(side, viewMode=v8ViewMode) {
    return viewMode==="god" || (viewMode==="A"&&side==="player") || (viewMode==="B"&&side==="enemy");
  }
  function v8CanSeePrivate(side) { return v8CanSeePrivateForView(side,v8ViewMode); }
  function v8PerspectiveSide(){ return v8ViewMode==="B" ? "enemy" : "player"; }
  function v8PublicItem(p){ const k=v8EnsureKnowledge(p); if(!k.item)return "未判明"; return itemDisplay(p); }
  function v8PublicAbility(p){ return v8EnsureKnowledge(p).ability ? p.ability.name : "未判明"; }
  function v8HPPercent(p){
    if(!p || !p.maxHP || p.hp<=0) return 0;
    return Math.max(1,Math.min(100,Math.floor((p.hp/p.maxHP)*100)));
  }
  // 本人/神視点は実数値、それ以外はChampions風にHPバー＋整数%を公開する。
  function v8HPText(p,side){ if(v8CanSeePrivate(side))return `${p.hp} / ${p.maxHP}`; return `${v8HPPercent(p)}%`; }
  function v8DetailHtml(p,side){
    if(v8CanSeePrivate(side)) return `<strong>実数値</strong><div class="private-stat-grid"><span>H ${p.maxHP}</span><span>A ${p.attack}</span><span>B ${p.defense}</span><span>C ${p.specialAttack}</span><span>D ${p.specialDefense}</span><span>S ${p.speed}</span></div><strong>技</strong><div class="revealed-moves">${p.moves.map(m=>`<span>${m.name} ${m.pp}/${m.maxPP}</span>`).join("")}</div>`;
    const ids=v8EnsureKnowledge(p).moves;
    return `<strong>公開済みの技</strong><div class="revealed-moves">${ids.length?ids.map(id=>`<span>${MOVE_DEX[id]?.name||id}</span>`).join(""):"<span>まだなし</span>"}</div>`;
  }

  function v8RenderOneBattleCard(p,side,position) {
    const isBottom=position==="bottom";
    const nameEl=isBottom?playerNameText:opponentNameText, typeEl=isBottom?playerTypeText:opponentTypeText;
    const hpEl=isBottom?playerHPText:opponentHPText, fill=isBottom?playerHPFill:opponentHPFill;
    const stageEl=isBottom?playerStagesText:opponentStagesText, statusEl=isBottom?playerStatusText:opponentStatusText;
    const abilityEl=isBottom?playerAbilityText:opponentAbilityText, itemEl=isBottom?playerItemText:opponentItemText, natureEl=isBottom?playerNatureText:opponentNatureText;
    const detail=isBottom?v8PlayerDetail:v8OpponentDetail;
    nameEl.textContent=p.name; typeEl.textContent=p.types.join(" / "); hpEl.textContent=v8HPText(p,side); updateHPBar(p,fill); renderStages(p,stageEl); renderStatus(p,statusEl);
    abilityEl.textContent=v8CanSeePrivate(side)?p.ability.name:v8PublicAbility(p);
    itemEl.textContent=v8CanSeePrivate(side)?itemDisplay(p):v8PublicItem(p);
    natureEl.textContent=v8CanSeePrivate(side)?`${p.nature}（${getNatureDescription(p.nature)}）`:"非公開";
    detail.innerHTML=v8DetailHtml(p,side);
  }

  function v8FieldTurnText(label,turns,meta,viewerSide,viewMode=v8ViewMode){
    if(turns<=0)return null;
    const ownerView = (viewMode === "A" && meta?.sourceSide === "player") || (viewMode === "B" && meta?.sourceSide === "enemy");
    const sourceItemKnown = Boolean(meta?.sourcePokemon && v8EnsureKnowledge(meta.sourcePokemon).item);
    if(!meta?.extended || viewMode==="god" || ownerView || sourceItemKnown) return `${label}（残り${turns}）`;

    // 延長アイテムを伏せる表示。8→5、7→4、6→3、5→2、4→1 と通常継続のように見せる。
    // その後も効果が続いた時点（実残り3）で延長が判明するため、以後は実残りを表示する。
    if(turns > 3) return `${label}（残り${turns - 3}）`;
    if(meta?.sourcePokemon) v8MarkItem(meta.sourcePokemon);
    return `${label}（残り${turns}）`;
  }

  function v8RenderField(){
    const viewer=v8PerspectiveSide();
    weatherText.textContent=weather.type ? v8FieldTurnText(WEATHER_NAMES[weather.type],weather.turns,v8WeatherMeta,viewer) : "なし";
    roomText.textContent=fieldState.trickRoom>0?`トリックルーム（残り${fieldState.trickRoom}）`:"なし";
    const v6=typeof v6EnsureFieldState==="function"?v6EnsureFieldState():null;
    if(document.getElementById("terrain-text")) document.getElementById("terrain-text").textContent=v6?.terrain?.type?v8FieldTurnText(V6_TERRAIN_NAMES[v6.terrain.type],v6.terrain.turns,v8TerrainMeta,viewer):"なし";
    const effects=[];
    ["player","enemy"].forEach(side=>{
      const ss=v6? v6GetSideState(side):null; if(!ss)return; const who=side==="player"?"A":"B";
      if(ss.reflect>0)effects.push(`${who}: ${v8FieldTurnText("リフレクター",ss.reflect,v8ScreenMeta[side].reflect,viewer)}`);
      if(ss.lightScreen>0)effects.push(`${who}: ${v8FieldTurnText("ひかりのかべ",ss.lightScreen,v8ScreenMeta[side].lightScreen,viewer)}`);
      if((ss.spikes||0)>0)effects.push(`${who}: まきびし${ss.spikes}`);
      if((ss.toxicSpikes||0)>0)effects.push(`${who}: どくびし${ss.toxicSpikes}`);
      if(ss.stealthRock)effects.push(`${who}: ステルスロック`);
      if(ss.stickyWeb)effects.push(`${who}: ねばねばネット`);
      if(ss.wish)effects.push(`${who}: ねがいごと発動待ち`);
      if(ss.futureSight)effects.push(`${who}: みらいよち発動待ち`);
    });
    const se=document.getElementById("side-effect-text"); if(se)se.textContent=effects.length?effects.join(" / "):"なし";
    const tw=[]; if(fieldState.tailwind.player>0)tw.push(`A 残り${fieldState.tailwind.player}`); if(fieldState.tailwind.enemy>0)tw.push(`B 残り${fieldState.tailwind.enemy}`); tailwindText.textContent=tw.length?tw.join(" / "):"なし";
    turnText.textContent=turnNumber;
  }

  function v8TeamChipRender(team,activeIndex,container,side){
    container.innerHTML="";
    team.forEach((p,i)=>{
      const k=v8EnsureKnowledge(p); const privateInfo=v8CanSeePrivate(side); const chip=document.createElement("span"); chip.className="team-chip";
      if(i===activeIndex)chip.classList.add("active"); if(p.hp<=0)chip.classList.add("fainted");
      const known=privateInfo||k.seen;
      if(!known) chip.textContent="???";
      else if(!privateInfo && i!==activeIndex) chip.textContent=`${p.name} ${v8HPPercent(p)}%${p.hp<=0?" ×":""}`;
      else chip.textContent=`${p.name}${p.hp<=0?" ×":""}`;
      container.appendChild(chip);
    });
  }

  function v915PerspectiveOwnSide(viewMode){
    if(viewMode==="A")return "player";
    if(viewMode==="B")return "enemy";
    return null;
  }
  function v915PercentAmount(amount,maxHP){
    if(!maxHP)return null;
    const pct=Math.round((Math.max(0,Number(amount)||0)/maxHP)*100);
    return Math.max(1,Math.min(100,pct));
  }
  function v915FormatHpAmounts(text,meta,viewMode){
    const raw=String(text);
    if(viewMode==="god")return raw;
    const own=v915PerspectiveOwnSide(viewMode);
    const exact=Boolean(own&&meta?.side===own);
    const canPercent=Boolean(meta?.side&&meta?.maxHP);
    const repl=(n)=>{
      if(exact)return String(n);
      if(canPercent){const pct=v915PercentAmount(n,meta.maxHP);return `${pct}%`;}
      return null;
    };
    let t=raw;
    t=t.replace(/\b(\d+) HP (回復|吸収)した！/g,(m,n,kind)=>{const x=repl(n);return x===null?`HPを ${kind}した！`:`${x}${exact?" HP":""} ${kind}した！`;});
    t=t.replace(/\b(\d+) HP 回復！/g,(m,n)=>{const x=repl(n);return x===null?"HP回復！":`${x}${exact?" HP":""} 回復！`;});
    t=t.replace(/\b(\d+) HP 奪われた！/g,(m,n)=>{const x=repl(n);return x===null?"HPを奪われた！":`${x}${exact?" HP":""} 奪われた！`;});
    t=t.replace(/\b(\d+) ダメージ！/g,(m,n)=>{const x=repl(n);return x===null?"ダメージ！":`${x} ダメージ！`;});
    t=t.replace(/HPを (\d+) 失った！/g,(m,n)=>{const x=repl(n);return x===null?"HPを失った！":`HPを ${x}${exact?"":""} 失った！`;});
    return t;
  }
  function v8SanitizeLogForView(entry,viewMode=v8ViewMode){
    const log=typeof entry==="object"&&entry!==null?entry:{text:String(entry)};
    return v915FormatHpAmounts(log.text,log.v915HpTarget||null,viewMode);
  }

  function v8LogTextForView(entry,viewMode=v8ViewMode){
    let t=v8SanitizeLogForView(entry,viewMode);
    // エンジン内部のログ文では常に「自分」= player(A)、「相手」= enemy(B)。
    // 観戦/神/B視点では、現在モードに応じた明示ラベルへ変換する。
    if(viewMode==="B"||viewMode==="god"||viewMode==="spectator") {
      const aLabel=v8SideLabelStatic("player"), bLabel=v8SideLabelStatic("enemy");
      t=t.replaceAll("相手は ",`${bLabel}は `)
         .replaceAll("相手の場",`${bLabel}の場`)
         .replaceAll("相手の おいかぜ",`${bLabel}の おいかぜ`)
         .replaceAll("自分の場",`${aLabel}の場`)
         .replaceAll("自分の おいかぜ",`${aLabel}の おいかぜ`);
    }
    return t;
  }

  function v8SanitizeLog(text){ return v8SanitizeLogForView({text},v8ViewMode); }

  function v8RenderLog(){
    battleLogElement.innerHTML="";
    battleLog.forEach(log=>{
      const d=document.createElement("div");
      d.textContent=v8LogTextForView(log,v8ViewMode);
      if(log.className)d.className=log.className; battleLogElement.appendChild(d);
    });
    battleLogElement.scrollTop=battleLogElement.scrollHeight;
  }

  function v8RenderViewToolbar(){
    v8ViewButtons?.querySelectorAll?.("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v8ViewMode));
    const a=v8ViewButtons?.querySelector?.('[data-view="A"]'),b=v8ViewButtons?.querySelector?.('[data-view="B"]');
    if(a)a.textContent=v8BattleMode==="cpu-cpu"?"CPU A視点":"プレイヤーA視点";
    if(b)b.textContent=v8BattleMode==="cpu-cpu"?"CPU B視点":v8BattleMode==="cpu"?"CPU視点":"プレイヤーB視点";
  }

  // ------------------------------------------------------------
  // v8.1: 見せ合い確認 / 状況＋ログ一括コピー
  // ------------------------------------------------------------
  function v8SideLabelStatic(side){ if(v8BattleMode==="cpu-cpu")return side==="player"?"CPU A":"CPU B";if(v8BattleMode==="cpu"&&side==="enemy")return "CPU";return side==="player"?"プレイヤーA":"プレイヤーB"; }
  function v8RosterForSide(side){ return side==="player"?v8RosterA:v8RosterB; }

  function v8TeamPreviewSection(side,fullInfo=false){
    const roster=v8RosterForSide(side)||[];
    const cards=roster.map((set,index)=>`<div class="preview-card"><span class="team-preview-number">${index+1}</span>${v8SetCardDetail(set,!fullInfo)}</div>`).join("");
    return `<section class="team-preview-section"><h3>${v8SideLabelStatic(side)}の6匹</h3><div class="team-preview-grid">${cards}</div></section>`;
  }

  function v8OpenTeamPreview(){
    if(!v8TeamPreviewModal||!v8TeamPreviewBody)return;
    let sides;
    if(v8ViewMode==="A") sides=["enemy"];
    else if(v8ViewMode==="B") sides=["player"];
    else sides=["player","enemy"];
    const fullInfo=v8ViewMode==="god";
    v8TeamPreviewTitle.textContent=fullInfo?"見せ合い6匹（神視点・完全情報）":(sides.length===1?`${v8SideLabelStatic(sides[0])}の見せ合い6匹`:"見せ合い6匹");
    if(v8TeamPreviewNote) v8TeamPreviewNote.textContent=fullInfo?"神視点：両者の技・特性・持ち物・実数値を含む完全情報を表示します。選出した3匹・選出順は表示しません。":"見せ合い時に公開された情報のみ表示します。技・特性・持ち物・実数値・選出内容は表示しません。";
    v8TeamPreviewBody.innerHTML=sides.map(side=>v8TeamPreviewSection(side,fullInfo)).join("");
    if(fullInfo)v8AttachPreviewDetails(v8TeamPreviewBody);
    v8TeamPreviewModal.classList.remove("hidden");
    v8TeamPreviewModal.setAttribute("aria-hidden","false");
  }
  function v8CloseTeamPreview(){
    if(!v8TeamPreviewModal)return;
    v8TeamPreviewModal.classList.add("hidden");
    v8TeamPreviewModal.setAttribute("aria-hidden","true");
  }

  function v8StatusText(p){
    const parts=[];
    if(p.status)parts.push(STATUS_NAMES[p.status]||p.status);
    if((p.confusionTurns||0)>0)parts.push("こんらん");
    if((p.tauntTurns||0)>0)parts.push(`ちょうはつ${p.tauntTurns}`);
    if((p.encoreTurns||0)>0)parts.push(`アンコール${p.encoreTurns}`);
    if((p.disableTurns||0)>0)parts.push(`かなしばり${p.disableTurns}`);
    if((p.substituteHP||0)>0)parts.push("みがわり");
    if(p.seeded)parts.push("やどりぎ");
    if(p.aquaRing)parts.push("アクアリング");
    if(p.v7Ingrain)parts.push("ねをはる");
    return parts.length?parts.join(" / "):"なし";
  }
  function v8StagesText(p){
    const names={attack:"A",defense:"B",specialAttack:"C",specialDefense:"D",speed:"S",accuracy:"命中",evasion:"回避"};
    const parts=Object.entries(names).map(([key,label])=>[label,p.stages?.[key]||0]).filter(([,n])=>n!==0).map(([label,n])=>`${label}${n>0?"+":""}${n}`);
    return parts.length?parts.join(" / "):"変化なし";
  }
  function v8PublicPokemonText(p,side,viewMode){
    const privateInfo=v8CanSeePrivateForView(side,viewMode);
    const k=v8EnsureKnowledge(p);
    const hp=privateInfo?`${p.hp}/${p.maxHP}`:`${v8HPPercent(p)}%`;
    const ability=privateInfo?p.ability.name:(k.ability?p.ability.name:"未判明");
    const item=privateInfo?itemDisplay(p):(k.item?itemDisplay(p):"未判明");
    const moves=privateInfo?p.moves.map(m=>`${m.name}(${m.pp}/${m.maxPP})`).join(" / "):(k.moves.length?k.moves.map(id=>MOVE_DEX[id]?.name||id).join(" / "):"まだなし");
    const stats=privateInfo?`H${p.maxHP} A${p.attack} B${p.defense} C${p.specialAttack} D${p.specialDefense} S${p.speed}`:"非公開";
    return [
      `${p.name} [${p.types.join("/")}] HP ${hp}`,
      `状態: ${v8StatusText(p)} / ランク: ${v8StagesText(p)}`,
      `特性: ${ability} / 持ち物: ${item}`,
      `実数値: ${stats}`,
      `${privateInfo?"技":"公開済み技"}: ${moves}`
    ].join("\n");
  }
  function v8BenchCard(side,p,index,viewMode){
    const privateInfo=v8CanSeePrivateForView(side,viewMode);
    const known=privateInfo||v8EnsureKnowledge(p).seen;
    const card=document.createElement("article");
    card.className=`bench-status-card${p.hp<=0?" fainted":""}${known?"":" unknown"}`;
    const h=document.createElement("h4");
    if(!known){h.textContent=`控え${index+1}: ???（未登場）`;card.appendChild(h);return card;}
    h.textContent=`${p.name}${p.hp<=0?"（ひんし）":""}`;card.appendChild(h);
    const pre=document.createElement("pre");pre.textContent=v8PublicPokemonText(p,side,viewMode);card.appendChild(pre);
    return card;
  }
  function v8RenderBenchStatus(){
    if(!v8BenchStatusBody)return;
    v8BenchStatusBody.innerHTML="";
    ["player","enemy"].forEach(side=>{
      const sec=document.createElement("section");sec.className="bench-status-section";
      const h=document.createElement("h3");h.textContent=`${v8SideLabelStatic(side)}の控え`;sec.appendChild(h);
      const list=document.createElement("div");list.className="bench-status-list";
      const team=v8GetTeam(side),active=v8GetIndex(side);const bench=team.map((p,i)=>({p,i})).filter(x=>x.i!==active);
      if(!bench.length){const e=document.createElement("div");e.className="bench-status-empty";e.textContent="控えはいません。";list.appendChild(e);}
      else bench.forEach(({p,i})=>list.appendChild(v8BenchCard(side,p,i,v8ViewMode)));
      sec.appendChild(list);v8BenchStatusBody.appendChild(sec);
    });
    if(v8BenchStatusTitle)v8BenchStatusTitle.textContent=`控え状態（${v8ViewLabel(v8ViewMode)}）`;
    if(v8BenchStatusNote)v8BenchStatusNote.textContent=v8ViewMode==="god"?"神視点：両者の完全情報を表示しています。":"現在の視点で公開されている情報だけを表示します。未登場の相手控えは ??? のままです。";
  }
  function v8OpenBenchStatus(){
    if(!v8BenchStatusModal)return;v8RenderBenchStatus();
    if(typeof window.v9OpenUtilityModal==="function")window.v9OpenUtilityModal(v8BenchStatusModal);
    else{v8BenchStatusModal.classList.remove("hidden");v8BenchStatusModal.setAttribute("aria-hidden","false");}
  }
  function v8CloseBenchStatus(){
    if(!v8BenchStatusModal)return;
    if(typeof window.v9CloseUtilityModal==="function")window.v9CloseUtilityModal(v8BenchStatusModal);
    else{v8BenchStatusModal.classList.add("hidden");v8BenchStatusModal.setAttribute("aria-hidden","true");}
  }

  function v8FieldSnapshot(viewMode){
    const viewer=viewMode==="B"?"enemy":"player";
    const lines=[];
    lines.push(`天候: ${weather.type?v8FieldTurnText(WEATHER_NAMES[weather.type],weather.turns,v8WeatherMeta,viewer,viewMode):"なし"}`);
    lines.push(`ルーム: ${fieldState.trickRoom>0?`トリックルーム（残り${fieldState.trickRoom}）`:"なし"}`);
    const v6=typeof v6EnsureFieldState==="function"?v6EnsureFieldState():null;
    lines.push(`フィールド: ${v6?.terrain?.type?v8FieldTurnText(V6_TERRAIN_NAMES[v6.terrain.type],v6.terrain.turns,v8TerrainMeta,viewer,viewMode):"なし"}`);
    const effects=[];
    ["player","enemy"].forEach(side=>{
      const ss=v6?v6GetSideState(side):null;if(!ss)return;const who=side==="player"?"A":"B";
      if(ss.reflect>0)effects.push(`${who}: ${v8FieldTurnText("リフレクター",ss.reflect,v8ScreenMeta[side].reflect,viewer,viewMode)}`);
      if(ss.lightScreen>0)effects.push(`${who}: ${v8FieldTurnText("ひかりのかべ",ss.lightScreen,v8ScreenMeta[side].lightScreen,viewer,viewMode)}`);
      if((ss.spikes||0)>0)effects.push(`${who}: まきびし${ss.spikes}`);
      if((ss.toxicSpikes||0)>0)effects.push(`${who}: どくびし${ss.toxicSpikes}`);
      if(ss.stealthRock)effects.push(`${who}: ステルスロック`);
      if(ss.stickyWeb)effects.push(`${who}: ねばねばネット`);
      if(ss.wish)effects.push(`${who}: ねがいごと発動待ち`);
      if(ss.futureSight)effects.push(`${who}: みらいよち発動待ち`);
    });
    lines.push(`場の効果: ${effects.length?effects.join(" / "):"なし"}`);
    const tw=[];if(fieldState.tailwind.player>0)tw.push(`A 残り${fieldState.tailwind.player}`);if(fieldState.tailwind.enemy>0)tw.push(`B 残り${fieldState.tailwind.enemy}`);
    lines.push(`おいかぜ: ${tw.length?tw.join(" / "):"なし"}`);
    return lines;
  }
  function v8TeamStatusText(side,viewMode){
    const team=side==="player"?playerTeam:enemyTeam;
    const active=side==="player"?playerActiveIndex:enemyActiveIndex;
    return team.map((p,i)=>{
      const privateInfo=v8CanSeePrivateForView(side,viewMode),known=privateInfo||v8EnsureKnowledge(p).seen;
      if(!known)return `${i+1}. ???`;
      const hp=privateInfo?`${p.hp}/${p.maxHP}`:`${v8HPPercent(p)}%`;
      return `${i+1}. ${p.name}${i===active?" [場]":""} / HP ${hp}${p.hp<=0?" / ひんし":""}`;
    }).join("\n");
  }
  function v8PreviewRosterText(side){
    return (v8RosterForSide(side)||[]).map((set,i)=>{const sp=SPECIES_DEX[set.speciesId];return `${i+1}. ${sp.name} [${sp.types.join("/")}]`;}).join("\n");
  }
  function v8CommandOptionsText(side){
    const p=side==="player"?getPlayerPokemon():getEnemyPokemon();
    if(!p)return "なし";
    const moves=getSelectableMoves(p);
    const moveText=(moves.length?moves:[STRUGGLE_MOVE]).map(m=>{const e=getEffectiveMove(p,m);return `- ${e.name} / ${e.type} / ${getCategoryText(e.category)} / 威力${e.power??"-"} / 命中${e.accuracy??"-"}${e.struggle?"":` / PP ${m.pp}/${m.maxPP}`}`;}).join("\n");
    const team=side==="player"?playerTeam:enemyTeam,active=side==="player"?playerActiveIndex:enemyActiveIndex;
    const trapped=isTrappedByOpponent(p,side==="player"?getEnemyPokemon():getPlayerPokemon());
    const switches=team.map((x,i)=>({x,i})).filter(({x,i})=>i!==active&&x.hp>0).map(({x,i})=>`- ${x.name} / HP ${x.hp}/${x.maxHP}${trapped?" / 通常交代不可":""}`).join("\n")||"- なし";
    return `技:\n${moveText}\n交代候補:\n${switches}`;
  }
  function v8CopyPerspective(){
    const viewMode=v8ViewMode;
    const side=viewMode==="B"?"enemy":"player";
    return {side,viewMode};
  }
  function v8ViewLabel(viewMode){
    if(viewMode==="A")return `${v8SideLabelStatic("player")}視点`;
    if(viewMode==="B")return `${v8SideLabelStatic("enemy")}視点`;
    return ({spectator:"観戦視点",god:"神視点"})[viewMode]||viewMode;
  }
  function v8BuildBattleContextText(){
    const {viewMode}=v8CopyPerspective();
    const a=getPlayerPokemon(),b=getEnemyPokemon();
    let commandText="表示専用視点のためコマンド情報なし";
    if(battleOver) commandText="対戦終了";
    else if(viewMode==="A") commandText=v8CommandOptionsText("player");
    else if(viewMode==="B"&&v8BattleMode==="pvp") commandText=v8CommandOptionsText("enemy");
    const lines=[
      `【ニワラバトル v${V8_VERSION} 状況コピー】`,
      `ターン: ${turnNumber}`,
      `視点: ${v8ViewLabel(viewMode)}`,
      `対戦形式: ${v8BattleMode==="pvp"?"2人対戦":v8BattleMode==="cpu-cpu"?"CPU vs CPU":"対CPU戦"}`,
      `状態: ${battleOver?"対戦終了":"対戦中"}`,
      "",
      "【場】",
      ...v8FieldSnapshot(viewMode),
      "",
      `【${v8SideLabelStatic("player")}・場のポケモン】`,
      a?v8PublicPokemonText(a,"player",viewMode):"なし",
      "",
      `【${v8SideLabelStatic("enemy")}・場のポケモン】`,
      b?v8PublicPokemonText(b,"enemy",viewMode):"なし",
      "",
      `【${v8SideLabelStatic("player")}の選出3匹】`,
      v8TeamStatusText("player",viewMode),
      "",
      `【${v8SideLabelStatic("enemy")}の選出3匹】`,
      v8TeamStatusText("enemy",viewMode),
      "",
      `【${v8SideLabelStatic("player")}の見せ合い6匹】`,
      v8PreviewRosterText("player"),
      "",
      `【${v8SideLabelStatic("enemy")}の見せ合い6匹】`,
      v8PreviewRosterText("enemy"),
      "",
      "【現在選べるコマンド】",
      commandText,
      "",
      `【ここまでの対戦ログ（${v8ViewLabel(viewMode)}）】`,
      ...(battleLog.length?battleLog.map(log=>v8LogTextForView(log,viewMode)):["ログなし"])
    ];
    return lines.join("\n");
  }
  async function v8WriteClipboard(text){
    if(navigator.clipboard?.writeText && window.isSecureContext){await navigator.clipboard.writeText(text);return;}
    const ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
    const ok=document.execCommand("copy");ta.remove();if(!ok)throw new Error("copy failed");
  }
  async function v8CopyBattleContext(){
    if(!playerTeam.length||!enemyTeam.length)return;
    const original=v8CopyContextButton?.textContent||"状況＋ログをコピー";
    try{await v8WriteClipboard(v8BuildBattleContextText());if(v8CopyContextButton)v8CopyContextButton.textContent="コピーしました";}
    catch(e){console.warn("context copy failed",e);if(v8CopyContextButton)v8CopyContextButton.textContent="コピー失敗";}
    setTimeout(()=>{if(v8CopyContextButton)v8CopyContextButton.textContent=original;},1400);
  }
  function v8RenderUtilityButtons(){
    if(v8TeamPreviewButton)v8TeamPreviewButton.disabled=!playerTeam.length||!enemyTeam.length;
    if(v8BenchStatusButton)v8BenchStatusButton.disabled=!playerTeam.length||!enemyTeam.length;
    if(v8CopyContextButton)v8CopyContextButton.disabled=!playerTeam.length||!enemyTeam.length;
  }

  // ------------------------------------------------------------
  // 2人対戦：非公開入力
  // ------------------------------------------------------------
  let v8ActionPhase="player";
  let v8PendingActions={player:null,enemy:null};
  let v8PivotChoicePending=null;
  let v8ReplacementState=null;
  let v8PassCallback=null;
  let v8ResolvingTurn=false;

  function v8SideLabel(side){if(v8BattleMode==="cpu-cpu")return side==="player"?"CPU A":"CPU B";if(v8BattleMode==="cpu"&&side==="enemy")return "CPU";return side==="player"?"プレイヤーA":"プレイヤーB";}
  function v8GetTeam(side){return side==="player"?playerTeam:enemyTeam;}
  function v8GetIndex(side){return side==="player"?playerActiveIndex:enemyActiveIndex;}
  function v8SetIndex(side,i){if(side==="player")playerActiveIndex=i;else enemyActiveIndex=i;}
  function v8Active(side){return side==="player"?getPlayerPokemon():getEnemyPokemon();}
  function v8Other(side){return side==="player"?"enemy":"player";}

  function v8ShowPass(title,message,cb){v8CloseTeamPreview();v8CloseBenchStatus();v8PassCallback=cb;v8PassTitle.textContent=title;v8PassMessage.textContent=message;v8PassOverlay.classList.remove("hidden");v8PassOverlay.setAttribute("aria-hidden","false");}
  function v8HidePass(){v8PassOverlay.classList.add("hidden");v8PassOverlay.setAttribute("aria-hidden","true");}
  function v8ControlSide(){if(v8ReplacementState?.choosingSide)return v8ReplacementState.choosingSide;if(v8PivotChoicePending?.side)return v8PivotChoicePending.side;return v8ActionPhase;}
  function v8HasBench(side){return v8GetTeam(side).some((p,i)=>i!==v8GetIndex(side)&&p.hp>0);}

  // legacy: ダメージ計算ツールへ渡す戦況は、操作者から見える情報だけに限定する。
  // 生のPokemonオブジェクトは返さず、相手の能力P・性格・未公開特性/持ち物/技を遮断する。
  function v8DamagePrivateSide(){
    // CPU戦ではプレイヤーAだけが自分側。表示視点をB/神へ切り替えてもCPU側の非公開値は渡さない。
    if(v8BattleMode!=="pvp")return "player";
    // 2人対戦は「現在その端末を操作している側」と表示視点が一致するときだけ自分情報を渡す。
    // 神/観戦視点や行動解決中に視点だけ切り替えても、相手の非公開値は取得できない。
    let control=null;
    if(v8ReplacementState?.choosingSide)control=v8ReplacementState.choosingSide;
    else if(v8PivotChoicePending?.side)control=v8PivotChoicePending.side;
    else if(!v8ResolvingTurn&&!battleOver)control=v8ActionPhase;
    if(control==="player"&&v8ViewMode==="A")return "player";
    if(control==="enemy"&&v8ViewMode==="B")return "enemy";
    return null;
  }
  function v8DamageSnapshot(p,side,privateSide){
    if(!p)return null;
    const k=v8EnsureKnowledge(p),privateInfo=privateSide===side;
    return {
      side,
      speciesId:p.id,
      hpPercent:v8HPPercent(p),
      stages:{...p.stages},
      privateInfo,
      abilityId:(privateInfo||k.ability)?p.ability?.id:null,
      itemId:(privateInfo||k.item)?(p.itemConsumed?"none":p.item?.id):null,
      nature:privateInfo?p.nature:null,
      statPoints:privateInfo?{...p.statPoints}:null,
      moveIds:privateInfo?p.moves.map(m=>m.id):[...k.moves],
      status:p.status||null,
      tailwind:Boolean(fieldState?.tailwind?.[side]>0)
    };
  }
  window.__PBV8GetDamageBattleContext=function(){
    const a=getPlayerPokemon?.(),b=getEnemyPokemon?.();
    if(!a||!b)return null;
    const privateSide=v8DamagePrivateSide();
    return {
      battleMode:v8BattleMode,
      viewMode:v8ViewMode,
      privateSide,
      player:v8DamageSnapshot(a,"player",privateSide),
      enemy:v8DamageSnapshot(b,"enemy",privateSide)
    };
  };

  function v8BeginPhase(side){
    if(battleOver||awaitingPlayerSwitch)return; v8ActionPhase=side; v8ViewMode=side==="player"?"A":"B"; renderAll();
    const p=v8Active(side); if(!p||p.hp<=0)return;
    const selectable=getSelectableMoves(p);
    if(p.chargingMoveId||p.rampageMoveId){const forced=selectable[0]||p.moves.find(m=>m.id===p.chargingMoveId||m.id===p.rampageMoveId);if(forced)setTimeout(()=>v8LockAction(side,{type:"move",move:forced,forced:true}),30);return;}
    if(p.rechargeNext){const skip={...STRUGGLE_MOVE,id:"v8-recharge-skip",name:"反動",struggle:true};setTimeout(()=>v8LockAction(side,{type:"move",move:skip,forced:true}),30);}
  }

  function v8SelectMove(side,move){
    if(side!==v8ActionPhase||battleOver||awaitingPlayerSwitch)return; const p=v8Active(side); if(!p||p.hp<=0)return;
    if(!move.struggle&&(move.pp<=0||!isMoveAllowedByItem(p,move)))return;
    // v9.1: 交代技の交代先は入力時には決めない。
    // 実際に技が解決した時点までの相手の交代・行動を確認してから選択する。
    v8LockAction(side,{type:"move",move});
  }
  function v8SelectSwitch(side,index){
    if(side!==v8ActionPhase||battleOver||awaitingPlayerSwitch)return; const p=v8GetTeam(side)[index]; if(!p||p.hp<=0||index===v8GetIndex(side))return;
    if(v8Active(side)?.rechargeNext)return;
    if(isTrappedByOpponent(v8Active(side),v8Active(v8Other(side))))return; v8LockAction(side,{type:"switch",index});
  }
  let v8PivotRequestedSide=null;

  function v8PerformResolvedPivot(side,index){
    const incoming=v8GetTeam(side)[index],old=v8Active(side);
    if(!incoming||incoming.hp<=0||index===v8GetIndex(side))return false;
    onSwitchOut(old);v8SetIndex(side,index);resetOnSwitch(incoming);
    addLog(`${old.name}は 技の効果で戻った！`,`log-system`);
    addLog(`${side==="enemy"?"相手は ":""}${incoming.name}を くりだした！`,`log-system`);
    activateEntryAbility(incoming);return true;
  }

  function v8SelectPivot(index){
    const x=v8PivotChoicePending;if(!x)return;const p=v8GetTeam(x.side)[index];if(!p||p.hp<=0||index===v8GetIndex(x.side))return;
    const side=x.side,continuation=x.continuation;v8PivotChoicePending=null;
    v8PerformResolvedPivot(side,index);renderAll();
    if(typeof continuation==="function")setTimeout(continuation,0);
  }
  function v8LockAction(side,action){
    v8PendingActions[side]=action;
    if(side==="player")v8ShowPass("プレイヤーBに端末を渡してください","Aの行動は確定しました。Bに選択内容を見せないようにしてから続けてください。",()=>v8BeginPhase("enemy"));
    else {v8ViewMode="spectator";renderAll();v8ShowPass("両者の行動が確定しました","続けると行動を解決します。入力した技は表示しません。",()=>v8ResolvePvpTurn());}
  }

  // v9.1: 2人対戦の交代技は、技が実際に解決した瞬間だけ交代要求を立てる。
  // 交代先そのものはその後に操作者が選ぶため、先に起きた相手の交代・行動を確認できる。
  const V8_autoPivot=autoPivot;
  autoPivot=function(side){
    if(v10SideIsCpu(side)){
      const index=v10AiChooseSwitchIndex(side,v10DifficultyForSide(side),{pivot:true});
      return index>=0?v8PerformResolvedPivot(side,index):false;
    }
    if(v8BattleMode==="pvp"&&v8ResolvingTurn){v8PivotRequestedSide=side;return false;}
    return V8_autoPivot(side);
  };

  function v8PauseForResolvedPivot(side,continuation){
    if(v8PivotRequestedSide!==side||!v8HasBench(side)||!v8Active(side)||v8Active(side).hp<=0)return false;
    v8PivotRequestedSide=null;v8PivotChoicePending={side,continuation};
    v8ViewMode=side==="player"?"A":"B";renderAll();
    v8ShowPass(`交代先選択：${v8SideLabel(side)}`,"ここまでに起きた相手の交代・行動を確認したうえで、交代技で出すポケモンを選べます。",()=>{v8ActionPhase=side;v8ViewMode=side==="player"?"A":"B";renderAll();});
    return true;
  }

  function v8EnemyPendingAction(a){return a?.type==="switch"?{type:"switch",index:a.index}:{type:"move",move:a?.move||chooseBestMove(getEnemyPokemon(),getPlayerPokemon())};}
  function v8DoRegularSwitch(side,index){
    const team=v8GetTeam(side),old=v8Active(side),incoming=team[index];
    if(!incoming||incoming.hp<=0||index===v8GetIndex(side))return false;
    addLog(`${side==="enemy"?"相手は ":""}${old.name}${side==="player"?" 戻れ！":"を 戻した！"}`,'log-system');
    onSwitchOut(old);v8SetIndex(side,index);resetOnSwitch(incoming);
    addLog(`${side==="enemy"?"相手は ":""}${incoming.name}${side==="player"?"！ キミにきめた！":"を くりだした！"}`,'log-system');
    activateEntryAbility(incoming);return true;
  }
  function v8CleanupResolvedPvp(){v8PendingActions={player:null,enemy:null};v8PivotRequestedSide=null;v8ResolvingTurn=false;window.__v6SelectedMoves=null;}
  function v8FinishPvpTurn(){
    endTurn();turnNumber++;resolveFaints();renderAll();v8CleanupResolvedPvp();
    if(!battleOver&&!awaitingPlayerSwitch&&!v8ReplacementState){
      if(v8BattleMode==="cpu-cpu")v10ScheduleCpuCpuTurn();
      else v8PrepareNextPvpTurn();
    }
  }
  function v8RunMove(side,move){
    const attacker=v8Active(side),defender=v8Active(v8Other(side));
    if(attacker?.hp>0&&defender?.hp>0)addLogs(useMove(attacker,defender,move));
  }
  function v8ContinueAfterMove(side,continuation){
    if(v8PauseForResolvedPivot(side,continuation))return;
    continuation();
  }
  function v8ResolvePvpTurn(){
    if(battleOver||!v8PendingActions.player||!v8PendingActions.enemy)return;
    v8HidePass();v8ResolvingTurn=true;v8PivotRequestedSide=null;
    if(typeof v63ResetTurnFlags==="function")v63ResetTurnFlags();
    addLog(`ターン ${turnNumber}`,"log-turn");
    const a=v8PendingActions.player,b=v8PendingActions.enemy;
    window.__v6SelectedMoves={player:a.type==="move"?a.move:null,enemy:b.type==="move"?b.move:null};

    // 通常交代は技より先に解決する。
    if(a.type==="switch"&&b.type==="switch"){
      // v10: 両者の通常交代は、交代前の実効すばやさで順序を決める。
      // 同速はランダム。トリックルーム中は既存の行動順ルールと同様に遅い側から。
      // 順序は両者が場にいる時点で確定し、1匹目の登場特性で再計算しない。
      const playerSpeed=getModifiedStat(v8Active("player"),"speed");
      const enemySpeed=getModifiedStat(v8Active("enemy"),"speed");
      let firstSide;
      if(playerSpeed===enemySpeed) firstSide=Math.random()<0.5?"player":"enemy";
      else if(fieldState.trickRoom>0) firstSide=playerSpeed<enemySpeed?"player":"enemy";
      else firstSide=playerSpeed>enemySpeed?"player":"enemy";
      const secondSide=v8Other(firstSide);
      const firstIndex=firstSide==="player"?a.index:b.index;
      const secondIndex=secondSide==="player"?a.index:b.index;
      v8DoRegularSwitch(firstSide,firstIndex);
      v8DoRegularSwitch(secondSide,secondIndex);
      v8FinishPvpTurn();return;
    }
    if(a.type==="switch"){
      v8DoRegularSwitch("player",a.index);
      if(b.type==="move")v8RunMove("enemy",b.move);
      v8ContinueAfterMove("enemy",v8FinishPvpTurn);return;
    }
    if(b.type==="switch"){
      v8DoRegularSwitch("enemy",b.index);
      v8RunMove("player",a.move);
      v8ContinueAfterMove("player",v8FinishPvpTurn);return;
    }

    const first=determineFirst(a.move,b.move);
    const firstSide=first==="player"?"player":"enemy",secondSide=v8Other(firstSide);
    const firstMove=firstSide==="player"?a.move:b.move,secondMove=secondSide==="player"?a.move:b.move;
    const runSecond=()=>{
      if(v8Active(secondSide)?.hp>0&&v8Active(firstSide)?.hp>0)v8RunMove(secondSide,secondMove);
      v8ContinueAfterMove(secondSide,v8FinishPvpTurn);
    };
    v8RunMove(firstSide,firstMove);
    v8ContinueAfterMove(firstSide,runSecond);
  }
  function v8PrepareNextPvpTurn(){
    if(v8BattleMode!=="pvp"||battleOver||awaitingPlayerSwitch)return;v8PendingActions={player:null,enemy:null};v8PivotChoicePending=null;v8PivotRequestedSide=null;v8ActionPhase="player";v8ViewMode="spectator";renderAll();
    v8ShowPass(`ターン${turnNumber}：プレイヤーA`,`プレイヤーAに端末を渡してください。続けるとAだけが自分の非公開情報を見て行動を選びます。`,()=>v8BeginPhase("player"));
  }

  // ------------------------------------------------------------
  // CPU vs CPU 自動進行
  // ------------------------------------------------------------
  let v10CpuCpuPaused=false;
  let v10CpuCpuTimer=null;
  function v10StopCpuCpuLoop(){if(v10CpuCpuTimer){clearTimeout(v10CpuCpuTimer);v10CpuCpuTimer=null;}}
  function v10RenderCpuCpuControls(){
    const active=v8BattleMode==="cpu-cpu";
    v10CpuCpuControls?.classList.toggle("hidden",!active);
    if(!active)return;
    const done=battleOver;
    if(v10CpuCpuStatus)v10CpuCpuStatus.textContent=done?"対戦終了":v10CpuCpuPaused?"一時停止中":`自動進行中（A ${v10DifficultyLabel(v10CpuDifficultyA)} / B ${v10DifficultyLabel(v10CpuDifficultyB)}）`;
    if(v10CpuCpuToggle){v10CpuCpuToggle.textContent=v10CpuCpuPaused?"再開":"一時停止";v10CpuCpuToggle.disabled=done;}
    if(v10CpuCpuStep)v10CpuCpuStep.disabled=done||!v10CpuCpuPaused;
  }
  function v10ScheduleCpuCpuTurn(delay=null){
    v10StopCpuCpuLoop();
    if(v8BattleMode!=="cpu-cpu"||battleOver||v10CpuCpuPaused)return;
    const ms=delay??Number(v10CpuCpuSpeed?.value||650);
    v10CpuCpuTimer=setTimeout(()=>{v10CpuCpuTimer=null;v10RunCpuCpuTurn(false);},Math.max(80,ms));
  }
  function v10RunCpuCpuTurn(stepOnly=false){
    if(v8BattleMode!=="cpu-cpu"||battleOver||v8ResolvingTurn)return;
    if(awaitingPlayerSwitch){awaitingPlayerSwitch=false;}
    const a=v10AiChooseAction("player",v10CpuDifficultyA);
    const b=v10AiChooseAction("enemy",v10CpuDifficultyB);
    v8PendingActions={player:a,enemy:b};
    v8ResolvePvpTurn();
    v8ViewMode=v8ViewMode||"spectator";
    renderAll();
    // 次ターン予約は v8FinishPvpTurn() で「実際にターン処理が完了した後」に行う。
    // stepOnly時は一時停止扱いにして自動予約を抑止する。
    if(stepOnly)v10CpuCpuPaused=true;
  }
  function v10CpuCpuReplacement(side){
    return v10AiChooseSwitchIndex(side,v10DifficultyForSide(side),{replacement:true});
  }
  function v10ResolveCpuCpuFaints(){
    const faint=[];if(getPlayerPokemon()?.hp<=0)faint.push("player");if(getEnemyPokemon()?.hp<=0)faint.push("enemy");
    if(!faint.length){renderAll();return;}
    faint.forEach(side=>{const p=v8Active(side);if(p){v1014MarkFaint(p,"resolve");if(!p.v8FaintLogged){p.v8FaintLogged=true;addLog(`${p.name}は たおれた！`,"log-system");}}});
    const alive=side=>v8GetTeam(side).some(p=>p.hp>0),aa=alive("player"),bb=alive("enemy");
    if(!aa||!bb){
      battleOver=true;awaitingPlayerSwitch=false;v10StopCpuCpuLoop();
      if(!aa&&!bb){
        const winner=v1014WinnerWhenBothOut();
        addLog(winner?`${winner==="player"?"CPU A":"CPU B"}の勝ち！`:"両CPUの最後のポケモンが倒れたため 引き分け！","log-system");
      }else addLog(`${aa?"CPU A":"CPU B"}の勝ち！`,"log-system");
      renderAll();return;
    }
    const incoming=[];
    faint.forEach(side=>{if(!alive(side))return;const idx=v10CpuCpuReplacement(side);if(idx<0)return;v8SetIndex(side,idx);const p=v8Active(side);resetOnSwitch(p);p.v8FaintLogged=false;incoming.push({side,p});});
    incoming.sort((x,y)=>{const sx=getModifiedStat(x.p,"speed"),sy=getModifiedStat(y.p,"speed");return fieldState.trickRoom>0?sx-sy:sy-sx;});
    incoming.forEach(({side,p})=>{addLog(`${side==="player"?"CPU A":"CPU B"}は ${p.name}を くりだした！`,"log-system");activateEntryAbility(p);});
    awaitingPlayerSwitch=false;
    if(getPlayerPokemon()?.hp<=0||getEnemyPokemon()?.hp<=0){v10ResolveCpuCpuFaints();return;}
    renderAll();
  }

  // 2人対戦のひんし交代は双方とも手動。両落ちなら両者が秘密裏に選んでから同時に公開。
  const V8_resolveFaints=resolveFaints;
  resolveFaints=function(){
    if(v8BattleMode==="cpu-cpu")return v10ResolveCpuCpuFaints();
    if(v8BattleMode!=="pvp")return V8_resolveFaints();
    const faint=[];if(getPlayerPokemon()?.hp<=0)faint.push("player");if(getEnemyPokemon()?.hp<=0)faint.push("enemy");if(!faint.length){renderAll();return;}
    faint.forEach(side=>{const p=v8Active(side);if(p){v1014MarkFaint(p,"resolve");if(!p.v8FaintLogged){p.v8FaintLogged=true;addLog(`${p.name}は たおれた！`,"log-system");}}});
    const alive=side=>v8GetTeam(side).some(p=>p.hp>0);const aa=alive("player"),bb=alive("enemy");
    if(!aa||!bb){
      battleOver=true;awaitingPlayerSwitch=false;
      if(!aa&&!bb){
        const winner=v1014WinnerWhenBothOut();
        addLog(winner?`${winner==="player"?"プレイヤーA":"プレイヤーB"}の勝ち！`:"両者の最後のポケモンが倒れたため 引き分け！","log-system");
      }else addLog(`${aa?"プレイヤーA":"プレイヤーB"}の勝ち！`,"log-system");
      renderAll();return;
    }
    const need=faint.filter(alive);awaitingPlayerSwitch=true;v8ReplacementState={need,choices:{player:null,enemy:null},choosingSide:need.includes("player")?"player":"enemy"};v8PromptReplacement(v8ReplacementState.choosingSide);
  };
  function v8PromptReplacement(side){v8ReplacementState.choosingSide=side;v8ShowPass(`${v8SideLabel(side)}の交代`,`${v8SideLabel(side)}だけが画面を見て、次に出すポケモンを選んでください。`,()=>{v8ViewMode=side==="player"?"A":"B";renderAll();});}
  function v8ChooseReplacement(side,index){
    const st=v8ReplacementState;if(!st||st.choosingSide!==side)return;const p=v8GetTeam(side)[index];if(!p||p.hp<=0||index===v8GetIndex(side))return;st.choices[side]=index;
    const other=st.need.find(s=>s!==side&&st.choices[s]===null);if(other){v8PromptReplacement(other);return;}
    st.need.forEach(s=>{v8SetIndex(s,st.choices[s]);const x=v8Active(s);resetOnSwitch(x);x.v8FaintLogged=false;});
    st.need.forEach(s=>{const x=v8Active(s);addLog(`${s==="enemy"?"相手は ":""}${x.name}を くりだした！`,"log-system");activateEntryAbility(x);});
    v8ReplacementState=null;awaitingPlayerSwitch=false;renderAll();if(getPlayerPokemon().hp<=0||getEnemyPokemon().hp<=0){resolveFaints();return;}v8PrepareNextPvpTurn();
  }

  // ------------------------------------------------------------
  // v8バトル描画
  // ------------------------------------------------------------
  function v8RenderOperatorBanner(){
    if(!v8BattleOperatorBanner)return;
    if(battleOver){v8BattleOperatorBanner.textContent="対戦終了：各視点に切り替えて状況＋ログをコピーできます";v8BattleOperatorBanner.dataset.state="done";return;}
    if(v8BattleMode==="cpu-cpu"){v8BattleOperatorBanner.textContent=v10CpuCpuPaused?"CPU vs CPU：一時停止中":"CPU vs CPU：自動対戦中";v8BattleOperatorBanner.dataset.state="view";return;}
    if(v8BattleMode!=="pvp"){v8BattleOperatorBanner.textContent=`操作中：プレイヤーA（CPU ${v10DifficultyLabel(v10CpuDifficultyB)}）`;v8BattleOperatorBanner.dataset.state="A";return;}
    if(v8ResolvingTurn){v8BattleOperatorBanner.textContent="両者の行動を解決中";v8BattleOperatorBanner.dataset.state="view";return;}
    if(v8ReplacementState?.choosingSide){const side=v8ReplacementState.choosingSide;v8BattleOperatorBanner.textContent=`交代先を選択中：${v8SideLabel(side)}`;v8BattleOperatorBanner.dataset.state=side==="player"?"A":"B";return;}
    const side=v8ControlSide();
    v8BattleOperatorBanner.textContent=`操作中：${v8SideLabel(side)}`;
    v8BattleOperatorBanner.dataset.state=side==="player"?"A":"B";
  }
  function v8RenderMoves(){
    moveContainer.innerHTML="";
    if(battleOver||awaitingPlayerSwitch||v8ReplacementState)return;
    if(v8BattleMode==="cpu-cpu"){v8CommandOwnerText.textContent="CPUが自動で行動を選択";const n=document.createElement("div");n.className="locked-action-note";n.textContent="AIは各自が知り得る公開情報だけで判断しています。上のCPU vs CPU操作から一時停止・1ターン進行ができます。";moveContainer.appendChild(n);return;}
    if(v8BattleMode!=="pvp"){
      const p=getPlayerPokemon(),foe=getEnemyPokemon();v8CommandOwnerText.textContent="たたかう（プレイヤーA）";
      if(p?.rechargeNext){
        const n=document.createElement("div");n.className="locked-action-note";n.textContent=`${p.name}は反動でこのターン行動できません。`;moveContainer.appendChild(n);
        setTimeout(()=>{if(!battleOver&&!awaitingPlayerSwitch&&getPlayerPokemon()===p&&p.rechargeNext){processMoveTurn({...STRUGGLE_MOVE,id:"v10-recharge-skip",name:"反動",struggle:true});}},30);
        return;
      }
      const usable=getSelectableMoves(p),list=usable.length? (p.chargingMoveId||p.rampageMoveId?usable:p.moves) : [{...STRUGGLE_MOVE}];
      list.forEach(move=>{const eff=getEffectiveMove(p,move),b=document.createElement("button");b.className="move-button";const effect=eff.category==="status"?"変化技":getEffectivenessText(getTypeEffectivenessV5(p,foe,eff));b.innerHTML=`<span class="move-name">${eff.name}</span><span class="move-info">${eff.type} / ${getCategoryText(eff.category)}<br>威力 ${eff.power??"-"}　命中 ${eff.accuracy??"-"}</span><span class="pp-line">${eff.struggle?"PP ∞":`PP ${move.pp}/${move.maxPP}`}</span><span class="effectiveness">${effect}</span>`;b.disabled=!eff.struggle&&(move.pp<=0||!isMoveAllowedByItem(p,move));b.addEventListener("click",()=>processMoveTurn(move));moveContainer.appendChild(b);});
      return;
    }
    const side=v8ControlSide();v8CommandOwnerText.textContent=`たたかう（${v8SideLabel(side)}）`;
    if(v8PivotChoicePending){const n=document.createElement("div");n.className="locked-action-note";n.textContent="交代技の交代先を下の「ポケモン」から選んでください。";moveContainer.appendChild(n);return;}
    const p=v8Active(side),foe=v8Active(v8Other(side));if(!p)return;const selectable=getSelectableMoves(p);const forced=p.chargingMoveId||p.rampageMoveId;const list=selectable.length?(forced?selectable:p.moves):[{...STRUGGLE_MOVE}];
    list.forEach(move=>{const eff=getEffectiveMove(p,move),b=document.createElement("button");b.className="move-button";const effect=eff.category==="status"?"変化技":getEffectivenessText(getTypeEffectivenessV5(p,foe,eff));b.innerHTML=`<span class="move-name">${eff.name}</span><span class="move-info">${eff.type} / ${getCategoryText(eff.category)}<br>威力 ${eff.power??"-"}　命中 ${eff.accuracy??"-"}</span><span class="pp-line">${eff.struggle?"PP ∞":`PP ${move.pp}/${move.maxPP}`}</span><span class="effectiveness">${effect}</span>`;b.disabled=!eff.struggle&&(move.pp<=0||!isMoveAllowedByItem(p,move));b.addEventListener("click",()=>v8SelectMove(side,move));moveContainer.appendChild(b);});
  }
  function v8RenderSwitch(){
    switchContainer.innerHTML="";
    if(v8BattleMode==="cpu-cpu"){const n=document.createElement("div");n.className="locked-action-note";n.textContent="交代・ひんし時の次ポケモン・交代技の交代先もCPUが自動判断します。";switchContainer.appendChild(n);return;}
    let side=v8BattleMode==="pvp"?v8ControlSide():"player";const team=v8GetTeam(side),active=v8GetIndex(side);const pivot=Boolean(v8PivotChoicePending);const replacement=Boolean(v8ReplacementState);
    const activePokemon=v8Active(side);
    const trapped=!replacement&&!pivot&&isTrappedByOpponent(activePokemon,v8Active(v8Other(side)));
    const recharging=!replacement&&!pivot&&Boolean(activePokemon?.rechargeNext);
    team.forEach((p,i)=>{const b=document.createElement("button");b.className="switch-button";b.textContent=`${p.name}　${p.hp}/${p.maxHP}`;b.disabled=p.hp<=0||i===active||(trapped&&!pivot)||recharging||battleOver;if(recharging&&i!==active)b.title="反動で動けないターンは交代できません";b.addEventListener("click",()=>{if(replacement)v8ChooseReplacement(side,i);else if(pivot)v8SelectPivot(i);else if(v8BattleMode==="pvp")v8SelectSwitch(side,i);else playerSwitch(i);});switchContainer.appendChild(b);});
  }

  renderAll=function(){
    if(!playerTeam.length||!enemyTeam.length)return;
    v8RenderOperatorBanner();
    const bottomSide=v8ViewMode==="B"?"enemy":"player",topSide=v8Other(bottomSide);const bottom=v8Active(bottomSide),top=v8Active(topSide);
    // 場の残りターンから延長アイテムが公開状態になる場合があるため、先に場を描画する。
    v8RenderField();
    v8RenderOneBattleCard(top,topSide,"top");v8RenderOneBattleCard(bottom,bottomSide,"bottom");
    v8TopTeamHeading.textContent=`${v8SideLabel(topSide)}チーム`;v8BottomTeamHeading.textContent=`${v8SideLabel(bottomSide)}チーム`;
    v8TeamChipRender(v8GetTeam(topSide),v8GetIndex(topSide),enemyTeamStatus,topSide);v8TeamChipRender(v8GetTeam(bottomSide),v8GetIndex(bottomSide),playerTeamStatus,bottomSide);
    v8RenderMoves();v8RenderSwitch();v8RenderLog();v8RenderViewToolbar();v8RenderUtilityButtons();v10RenderCpuCpuControls();
  };

  // ------------------------------------------------------------
  // バトル開始
  // ------------------------------------------------------------
  function v8StartBattle(){
    if(v8BattleMode==="cpu"&&v8SelectionB.length!==3)v8SelectionB=v10AiChooseSelection(v8RosterB,v8RosterA,v10CpuDifficultyB);
    if(v8BattleMode==="cpu-cpu"){
      if(v8SelectionA.length!==3)v8SelectionA=v10AiChooseSelection(v8RosterA,v8RosterB,v10CpuDifficultyA);
      if(v8SelectionB.length!==3)v8SelectionB=v10AiChooseSelection(v8RosterB,v8RosterA,v10CpuDifficultyB);
    }
    const selB=v8SelectionB;if(v8SelectionA.length!==3||selB.length!==3)return;
    v10StopCpuCpuLoop();v10CpuCpuPaused=false;v10AiResetBattleMemory();
    playerTeam=v8SelectionA.map(i=>createPokemon(v8RosterA[i],i));enemyTeam=selB.map(i=>createPokemon(v8RosterB[i],i));playerTeam.forEach(p=>p.side="player");enemyTeam.forEach(p=>p.side="enemy");
    v1014ResetFaintTrackingForBattle();
    playerActiveIndex=0;enemyActiveIndex=0;awaitingPlayerSwitch=false;battleOver=false;turnNumber=1;battleLog=[];weather={type:null,turns:0};fieldState={trickRoom:0,tailwind:{player:0,enemy:0}};if(typeof v6EnsureFieldState==="function"){fieldState.v6=null;v6EnsureFieldState();}
    v8WeatherMeta={sourceSide:null,sourcePokemon:null,extended:false};v8TerrainMeta={sourceSide:null,sourcePokemon:null,extended:false};v8ScreenMeta={player:{reflect:null,lightScreen:null},enemy:{reflect:null,lightScreen:null}};v8PendingActions={player:null,enemy:null};v8ReplacementState=null;v8PivotChoicePending=null;
    showScreen("battle");addLog("ポケモンバトルを開始！","log-system");
    if(v8BattleMode==="cpu-cpu"){
      addLog(`CPU Bは ${getEnemyPokemon().name}を くりだした！`,"log-system");activateEntryAbility(getEnemyPokemon());
      addLog(`CPU Aは ${getPlayerPokemon().name}を くりだした！`,"log-system");activateEntryAbility(getPlayerPokemon());
      v8ViewMode="spectator";renderAll();v10ScheduleCpuCpuTurn(850);
    }else{
      addLog(`相手は ${getEnemyPokemon().name}を くりだした！`,"log-system");activateEntryAbility(getEnemyPokemon());addLog(`${getPlayerPokemon().name}！ キミにきめた！`,"log-system");activateEntryAbility(getPlayerPokemon());
      if(v8BattleMode==="pvp"){v8ViewMode="spectator";renderAll();v8PrepareNextPvpTurn();}else{v8ViewMode="A";renderAll();}
    }
  }

  // ------------------------------------------------------------
  // UIイベント
  // ------------------------------------------------------------
  v8SaveNewPartyButton?.addEventListener("click",v8SaveNewParty);
  v8OverwritePartyButton?.addEventListener("click",v8OverwriteParty);
  v8LoadPartyButton?.addEventListener("click",v8LoadSelectedParty);
  v8DeletePartyButton?.addEventListener("click",v8DeleteSelectedParty);
  v8SavedPartySelect?.addEventListener("change",()=>{const p=v8SavedParties.find(x=>x.id===v8SavedPartySelect.value);if(p)v8SavedPartyName.value=p.name;});
  v8ApplyTeamFormatButton?.addEventListener("click",v8ApplyTeamFormat);
  v8CopyCurrentTeamFormatButton?.addEventListener("click",()=>{const text=v8TeamToFormat(builderSets);if(v8TeamFormatInput)v8TeamFormatInput.value=text;v8CopyTeamFormat(text,v8CopyCurrentTeamFormatButton,"現在の編成をコピーしました");});
  v8CopyEmptyTeamFormatButton?.addEventListener("click",()=>{const text=v8EmptyTeamFormat();if(v8TeamFormatInput)v8TeamFormatInput.value=text;v8CopyTeamFormat(text,v8CopyEmptyTeamFormatButton,"空フォーマットをコピーしました");});

  // 旧ボタンのイベントは残るので、v8ではonclickで入口を上書きし、旧click listenerの影響を避けるためクローン交換。
  function v8ReplaceButton(oldEl){if(!oldEl?.parentNode)return oldEl;const n=oldEl.cloneNode(true);oldEl.parentNode.replaceChild(n,oldEl);return n;}
  const v8ToSelection=v8ReplaceButton(document.getElementById("to-selection-button"));
  const v8Random=v8ReplaceButton(document.getElementById("random-team-button"));
  const v8SaveQuick=v8ReplaceButton(document.getElementById("save-team-button"));
  const v8Start=v8ReplaceButton(document.getElementById("start-battle-button"));
  const v8Clear=v8ReplaceButton(document.getElementById("clear-selection-button"));
  const v8Back=v8ReplaceButton(document.getElementById("back-to-builder-button"));
  const v8Reroll=v8ReplaceButton(document.getElementById("reroll-enemy-button"));
  const v8Forfeit=v8ReplaceButton(document.getElementById("forfeit-button"));

  v8ToSelection?.addEventListener("click",v8OpenModeScreen);
  v8Random?.addEventListener("click",()=>{builderSets=v8BuildStrongRandomTeam();renderBuilder();setBuilderMessage("役割・火力・素早さ・弱点の重なりを評価して、強めのランダム構築を生成しました。",false);});
  v8SaveQuick?.addEventListener("click",()=>v8SavedPartySelect?.value?v8OverwriteParty():v8SaveNewParty());
  v8ModeBackButton?.addEventListener("click",()=>showScreen("builder"));
  v8BattleModeSelect?.addEventListener("change",()=>{v10StopCpuCpuLoop();v8RenderBattleSourceOptions();});
  v8ModeContinueButton?.addEventListener("click",v8StartSelectionSetup);
  v8SelectionViewButtons?.addEventListener("click",e=>{const b=e.target.closest?.("[data-selection-view]");if(!b)return;v8SelectionView=b.dataset.selectionView;v8RenderSelection();});
  v8CopySelectionContextButton?.addEventListener("click",v8CopySelectionContext);
  v8Clear?.addEventListener("click",()=>{if(v8SelectionStage==="A")v8SelectionA=[];else v8SelectionB=[];v8RenderSelection();});
  v8Back?.addEventListener("click",()=>showScreen("mode"));
  v8Reroll?.addEventListener("click",()=>{
    if(v8BattleMode!=="cpu"&&v8BattleMode!=="cpu-cpu")return;
    if(v8PartySourceB.value==="random")v8RosterB=v10BuildCpuTeam(v10CpuDifficultyB);
    if(v8BattleMode==="cpu-cpu"){if(v8PartySourceA.value==="random")v8RosterA=v10BuildCpuTeam(v10CpuDifficultyA);v8SelectionA=v10AiChooseSelection(v8RosterA,v8RosterB,v10CpuDifficultyA);}
    v8SelectionB=v10AiChooseSelection(v8RosterB,v8RosterA,v10CpuDifficultyB);v8RenderSelection();
  });
  v8Start?.addEventListener("click",()=>{
    if(v8BattleMode==="pvp"&&v8SelectionStage==="A"){
      if(v8SelectionA.length!==3)return;v8ShowPass("プレイヤーBに端末を渡してください","Aの選出は確定しました。選出順をBに見せないようにしてから続けてください。",()=>{v8SelectionStage="B";v8SelectionB=[];v8SelectionView="chooser";v8RenderSelection();});return;
    }
    v8StartBattle();
  });
  v8PassContinueButton?.addEventListener("click",()=>{const cb=v8PassCallback;v8PassCallback=null;v8HidePass();if(cb)cb();});
  v10CpuCpuToggle?.addEventListener("click",()=>{if(v8BattleMode!=="cpu-cpu"||battleOver)return;v10CpuCpuPaused=!v10CpuCpuPaused;if(v10CpuCpuPaused)v10StopCpuCpuLoop();else v10ScheduleCpuCpuTurn(120);renderAll();});
  v10CpuCpuStep?.addEventListener("click",()=>{if(v8BattleMode==="cpu-cpu"&&v10CpuCpuPaused&&!battleOver)v10RunCpuCpuTurn(true);});
  v10CpuCpuSpeed?.addEventListener("change",()=>{if(v8BattleMode==="cpu-cpu"&&!v10CpuCpuPaused&&!battleOver)v10ScheduleCpuCpuTurn(100);});
  v8TeamPreviewButton?.addEventListener("click",v8OpenTeamPreview);
  v8TeamPreviewClose?.addEventListener("click",v8CloseTeamPreview);
  v8TeamPreviewModal?.querySelector?.("[data-close-team-preview]")?.addEventListener("click",v8CloseTeamPreview);
  v8BenchStatusButton?.addEventListener("click",v8OpenBenchStatus);
  v8BenchStatusClose?.addEventListener("click",v8CloseBenchStatus);
  v8BenchStatusModal?.querySelector?.("[data-close-bench-status]")?.addEventListener("click",v8CloseBenchStatus);
  v8CopyContextButton?.addEventListener("click",v8CopyBattleContext);
  v8ViewButtons?.addEventListener("click",e=>{const b=e.target.closest?.("[data-view]");if(!b)return;v8ViewMode=b.dataset.view;renderAll();});
  v8Forfeit?.addEventListener("click",()=>{v10StopCpuCpuLoop();battleOver=true;v8ReplacementState=null;awaitingPlayerSwitch=false;v8HidePass();showScreen("mode");});
  goBuilderButton.onclick=()=>{v10StopCpuCpuLoop();v8HidePass();v8CloseTeamPreview();v8CloseBenchStatus();showScreen("builder");};
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){v8CloseTeamPreview();v8CloseBenchStatus();}});

  // v10: 初期化はbase側の確認に同意した場合だけ、保存ライブラリまで削除する。
  resetAllButton.addEventListener("click",()=>{
    if(!window.__NIWARA_RESET_CONFIRMED__) return;
    localStorage.removeItem(V8_PARTY_LIBRARY_KEY);
    v8SavedParties=[];
    v8RenderPartyLibrary();
    window.__NIWARA_RESET_CONFIRMED__=false;
  });

  // ------------------------------------------------------------
  // 起動
  // ------------------------------------------------------------
  v8LoadPartyLibrary();v8RenderPartyLibrary();v8RenderBattleSourceOptions();renderBuilder();renderDataCounts();setBuilderMessage(`v${V8_VERSION}：v10統合ランタイムで起動しました。保存データ互換・公開情報ルールは維持されています。`,false);showScreen("builder");

  window.__PBV8={
    get savedParties(){return v8SavedParties;},buildStrongRandomTeam:v8BuildStrongRandomTeam,chooseCpuSelection:v8ChooseCpuSelection,validateTeam:v8ValidateTeam,
    teamToFormat(sets=builderSets){return v8TeamToFormat(v8CloneSets(sets));},parseTeamFormat(text){return v8ParseTeamFormat(text);},emptyTeamFormat:v8EmptyTeamFormat,
    setView(v){v8ViewMode=v;renderAll();},get view(){return v8ViewMode;},get battleMode(){return v8BattleMode;},
    _debugStartCpu(a=v8CloneSets(builderSets),b=v8BuildStrongRandomTeam()){v8BattleMode="cpu";v8RosterA=v8CloneSets(a);v8RosterB=v8CloneSets(b);v8SelectionA=[0,1,2];v8StartBattle();return{a:playerTeam.length,b:enemyTeam.length,turn:turnNumber};},
    _debugStartPvp(a=v8CloneSets(builderSets),b=v8BuildStrongRandomTeam()){v8BattleMode="pvp";v8RosterA=v8CloneSets(a);v8RosterB=v8CloneSets(b);v8SelectionA=[0,1,2];v8SelectionB=[0,1,2];v8StartBattle();return{a:playerTeam.length,b:enemyTeam.length,turn:turnNumber};},
    _debugPvpTurn(aMoveId=null,bMoveId=null){const A=getPlayerPokemon(),B=getEnemyPokemon();const am=A.moves.find(m=>m.id===aMoveId)||getSelectableMoves(A)[0]||{...STRUGGLE_MOVE};const bm=B.moves.find(m=>m.id===bMoveId)||getSelectableMoves(B)[0]||{...STRUGGLE_MOVE};v8PendingActions={player:{type:"move",move:am},enemy:{type:"move",move:bm}};v8ResolvePvpTurn();return{turn:turnNumber,aHP:getPlayerPokemon()?.hp,bHP:getEnemyPokemon()?.hp,awaitingPlayerSwitch,battleOver};},
    _debugPvpActions(a,b){v8PendingActions={player:a,enemy:b};v8ResolvePvpTurn();return{turn:turnNumber,aHP:getPlayerPokemon()?.hp,bHP:getEnemyPokemon()?.hp,awaitingPlayerSwitch,battleOver};},
    _debugState(){return{mode:v8BattleMode,view:v8ViewMode,phase:v8ActionPhase,awaitingPlayerSwitch,battleOver,turnNumber,a:getPlayerPokemon()?.name,b:getEnemyPokemon()?.name};},
    ai:Object.freeze({
      levels:Object.freeze(Object.keys(V10_AI_LEVELS)),
      buildTeam:d=>v10BuildCpuTeam(d),
      publicOpponent:side=>v10AiPublicOpponent(side),
      chooseSelection:(roster,opponentRoster,d)=>v10AiChooseSelection(roster,opponentRoster,d),
      chooseAction:(side,d)=>v10AiChooseAction(side,d||v10DifficultyForSide(side))
    })
  };
})();
;/* ===== utility tools ===== */
// ============================================================
// ニワラバトル v10 utility tools
// - 図鑑
// - ダメージ計算シミュレーター
// - 素早さ比較ツール
// ============================================================
(function(){
  "use strict";

  const $=id=>document.getElementById(id);
  const pokedexModal=$("pokedex-modal"), pokedexList=$("pokedex-list"), pokedexDetail=$("pokedex-detail"), pokedexSearch=$("pokedex-search");
  const damageModal=$("damage-calc-modal"), damageResult=$("damage-result");
  const speedModal=$("speed-check-modal"), speedResult=$("speed-result");
  let selectedSpeciesId=Object.values(SPECIES_DEX).sort((a,b)=>(a.dexNo||9999)-(b.dexNo||9999))[0]?.id||null;

  // legacy modal fix: iOS/PWA で body を position:fixed にすると、fixed 子要素の座標が
  // スクロール量や safe-area の影響でずれる場合があるため、その方式を廃止する。
  // html/body の overflow を止め、document レベルの touch/wheel ガードで
  // 開いている utility modal の外へスクロールを連鎖させない。
  const managedOpenModals=new Set();
  let lockedScrollY=0;
  let touchX=0,touchY=0;

  function activeUtilityModal(){
    const list=Array.from(managedOpenModals);
    return list.length?list[list.length-1]:null;
  }
  function lockPageScroll(){
    if(managedOpenModals.size!==1)return;
    lockedScrollY=window.scrollY||window.pageYOffset||0;
    document.documentElement.classList.add("utility-modal-open");
    document.body.classList.add("utility-modal-open");
  }
  function unlockPageScroll(){
    if(managedOpenModals.size!==0)return;
    document.documentElement.classList.remove("utility-modal-open");
    document.body.classList.remove("utility-modal-open");
    // iOS の慣性スクロール等で万一位置が動いても、開く前の位置へ戻す。
    requestAnimationFrame(()=>window.scrollTo(0,lockedScrollY));
  }
  function canScrollInDirection(node,dx,dy){
    if(!node)return false;
    const vertical=node.scrollHeight>node.clientHeight+1;
    const horizontal=node.scrollWidth>node.clientWidth+1;
    if(Math.abs(dx)>Math.abs(dy) && horizontal){
      if(dx<0 && node.scrollLeft+node.clientWidth<node.scrollWidth-1)return true;
      if(dx>0 && node.scrollLeft>1)return true;
    }
    if(vertical){
      if(dy<0 && node.scrollTop+node.clientHeight<node.scrollHeight-1)return true;
      if(dy>0 && node.scrollTop>1)return true;
    }
    return false;
  }
  function utilityTouchStart(e){
    if(!activeUtilityModal()||!e.touches?.length)return;
    touchX=e.touches[0].clientX;
    touchY=e.touches[0].clientY;
  }
  function utilityTouchMove(e){
    const modal=activeUtilityModal();
    if(!modal||!e.touches?.length)return;
    if(!modal.contains(e.target)){e.preventDefault();return;}
    const x=e.touches[0].clientX,y=e.touches[0].clientY;
    const dx=x-touchX,dy=y-touchY;
    touchX=x;touchY=y;
    // 本文・図鑑リスト・技表のうち、実際にその方向へまだスクロールできる
    // 要素がある場合だけネイティブスクロールを許可する。
    let node=e.target instanceof Element?e.target:null;
    while(node&&node!==modal){
      if(node.matches?.('[data-utility-scroll],.pokedex-list,.dex-move-table-wrap') && canScrollInDirection(node,dx,dy))return;
      node=node.parentElement;
    }
    // 上端/下端に達した後のスワイプを背景へ渡さない。
    e.preventDefault();
  }
  function utilityWheel(e){
    const modal=activeUtilityModal();
    if(!modal)return;
    if(!modal.contains(e.target)){e.preventDefault();return;}
    let node=e.target instanceof Element?e.target:null;
    const dx=-e.deltaX,dy=-e.deltaY;
    while(node&&node!==modal){
      if(node.matches?.('[data-utility-scroll],.pokedex-list,.dex-move-table-wrap') && canScrollInDirection(node,dx,dy))return;
      node=node.parentElement;
    }
    e.preventDefault();
  }
  document.addEventListener("touchstart",utilityTouchStart,{capture:true,passive:true});
  document.addEventListener("touchmove",utilityTouchMove,{capture:true,passive:false});
  document.addEventListener("wheel",utilityWheel,{capture:true,passive:false});

  function openModal(el){
    if(!el)return;
    const wasOpen=!el.classList.contains("hidden");
    el.classList.remove("hidden");
    el.setAttribute("aria-hidden","false");
    if(!wasOpen){managedOpenModals.add(el);lockPageScroll();}
    const scroller=el.querySelector("[data-utility-scroll]");
    if(scroller)scroller.scrollTop=0;
    const list=el.querySelector(".pokedex-list");
    if(list)list.scrollTop=0;
  }
  function closeModal(el){
    if(!el)return;
    const wasOpen=!el.classList.contains("hidden");
    el.classList.add("hidden");
    el.setAttribute("aria-hidden","true");
    if(wasOpen){managedOpenModals.delete(el);unlockPageScroll();}
  }
  // legacy integration: 他のパッチからも同じiOS/PWA安全モーダル管理を利用できるよう公開。
  window.v9OpenUtilityModal=openModal;
  window.v9CloseUtilityModal=closeModal;
  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function catName(c){return c==="physical"?"物理":c==="special"?"特殊":"変化";}
  const statPairs=[["hp","H"],["attack","A"],["defense","B"],["specialAttack","C"],["specialDefense","D"],["speed","S"]];

  function speciesSorted(){return Object.values(SPECIES_DEX).slice().sort((a,b)=>(a.dexNo??9999)-(b.dexNo??9999)||a.name.localeCompare(b.name,"ja"));}
  function renderDexList(){
    if(!pokedexList)return;
    const q=(pokedexSearch?.value||"").trim().toLowerCase();
    const rows=speciesSorted().filter(s=>!q||s.name.toLowerCase().includes(q)||String(s.dexNo??"").includes(q)||s.id.toLowerCase().includes(q));
    pokedexList.innerHTML="";
    rows.forEach(s=>{const b=document.createElement("button");b.type="button";b.className=`ghost-button pokedex-entry${s.id===selectedSpeciesId?" active":""}`;b.textContent=`No.${String(s.dexNo??"-").padStart(3,"0")} ${s.name}`;b.addEventListener("click",()=>{selectedSpeciesId=s.id;renderDexList();renderDexDetail();});pokedexList.appendChild(b);});
    if(!rows.length)pokedexList.innerHTML='<div class="notice">該当するポケモンがいません。</div>';
  }
  function renderDexDetail(){
    if(!pokedexDetail)return;const s=SPECIES_DEX[selectedSpeciesId];if(!s){pokedexDetail.textContent="ポケモンを選択してください。";return;}
    const total=Object.values(s.baseStats).reduce((a,b)=>a+b,0);
    const stats=[...statPairs.map(([k,l])=>`<div class="dex-stat"><span>${l}</span><strong>${s.baseStats[k]}</strong></div>`),`<div class="dex-stat"><span>合計</span><strong>${total}</strong></div>`].join("");
    const abilities=s.abilities.map(a=>`<div class="dex-ability"><strong>${esc(a.name)}</strong><div>${esc(a.description||"説明なし")}</div></div>`).join("");
    const moves=s.movePool.map(id=>MOVE_DEX[id]).filter(Boolean).slice().sort((a,b)=>a.type.localeCompare(b.type,"ja")||a.name.localeCompare(b.name,"ja"));
    const moveRows=moves.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.type)}</td><td>${catName(m.category)}</td><td>${m.power??"-"}</td><td>${m.accuracy??"-"}</td><td>${m.maxPP??"-"}</td><td>${esc(m.description||"")}</td></tr>`).join("");
    pokedexDetail.innerHTML=`
      <div class="dex-head"><div><div class="dex-number">No.${String(s.dexNo??"-").padStart(3,"0")}</div><h2>${esc(s.name)}</h2><div>${s.types.map(esc).join(" / ")}${s.classification?`　${esc(s.classification)}`:""}</div></div><div>${s.height!=null?`高さ ${s.height}m`:""}${s.weight!=null?`　重さ ${s.weight}kg`:""}</div></div>
      <h3>種族値</h3><div class="dex-stat-grid">${stats}</div>
      <h3>特性</h3><div class="dex-ability-list">${abilities}</div>
      <h3>覚える技 <span class="view-note">${moves.length}種</span></h3>
      <div class="dex-move-table-wrap"><table class="dex-move-table"><thead><tr><th>技</th><th>タイプ</th><th>分類</th><th>威力</th><th>命中</th><th>PP</th><th>効果</th></tr></thead><tbody>${moveRows}</tbody></table></div>`;
  }
  function openDex(){renderDexList();renderDexDetail();openModal(pokedexModal);}

  const ids={
    atkSpecies:$("damage-atk-species"),atkAbility:$("damage-atk-ability"),atkItem:$("damage-atk-item"),atkNature:$("damage-atk-nature"),atkHp:$("damage-atk-hp"),atkPoints:$("damage-atk-points"),atkStage:$("damage-atk-stage"),move:$("damage-move"),
    defSpecies:$("damage-def-species"),defAbility:$("damage-def-ability"),defItem:$("damage-def-item"),defNature:$("damage-def-nature"),defHp:$("damage-def-hp"),defPoints:$("damage-def-points"),defStage:$("damage-def-stage"),critical:$("damage-critical")
  };
  const damageLoadNotes={atk:$("damage-atk-load-note"),def:$("damage-def-load-note")};
  let loadedBattleSnapshots={atk:null,def:null};

  function option(value,label){const o=document.createElement("option");o.value=value;o.textContent=label;return o;}
  function populateBaseSelects(){
    const sp=speciesSorted();[ids.atkSpecies,ids.defSpecies].forEach(sel=>{if(!sel)return;sel.innerHTML="";sp.forEach(s=>sel.appendChild(option(s.id,`No.${String(s.dexNo??"-").padStart(3,"0")} ${s.name}`)));});
    const items=Object.values(ITEM_DEX).filter(i=>i.id!=="none").slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));[ids.atkItem,ids.defItem].forEach(sel=>{if(!sel)return;sel.innerHTML="";sel.appendChild(option("","持ち物を仮定して選択…"));sel.appendChild(option("none","なし"));items.forEach(i=>sel.appendChild(option(i.id,i.name)));sel.value="none";});
    [ids.atkNature,ids.defNature].forEach(sel=>{if(!sel)return;sel.innerHTML="";sel.appendChild(option("","性格を仮定して選択…"));Object.keys(NATURES).forEach(n=>sel.appendChild(option(n,n)));sel.value="まじめ";});
    [ids.atkStage,ids.defStage].forEach(sel=>{if(!sel)return;sel.innerHTML="";for(let i=-6;i<=6;i++)sel.appendChild(option(String(i),i>0?`+${i}`:String(i)));sel.value="0";});
    [[ids.atkPoints,"atk"],[ids.defPoints,"def"]].forEach(([wrap,prefix])=>{if(!wrap)return;wrap.innerHTML="";statPairs.forEach(([key,label])=>{const l=document.createElement("label");l.innerHTML=`<span>${label}</span><input type="number" min="0" max="32" value="0" data-dmg-side="${prefix}" data-stat="${key}" aria-label="${prefix} ${label}能力P">`;wrap.appendChild(l);});});
    if(ids.atkSpecies&&ids.defSpecies){ids.atkSpecies.value=sp[0]?.id||"";ids.defSpecies.value=sp[1]?.id||sp[0]?.id||"";refreshSide("atk");refreshSide("def");}
  }
  function sideSpecies(side){return SPECIES_DEX[ids[side+"Species"]?.value];}
  function prependUnknownOption(sel,label){
    if(!sel)return;
    let o=[...sel.options].find(x=>x.value==="");
    if(!o){o=option("",label);sel.insertBefore(o,sel.firstChild);}else o.textContent=label;
    sel.value="";
  }
  function refreshSide(side){
    const s=sideSpecies(side),abil=ids[side+"Ability"];if(!s||!abil)return;const prev=abil.value;abil.innerHTML="";s.abilities.forEach(a=>abil.appendChild(option(a.id,a.name)));if([...abil.options].some(o=>o.value===prev))abil.value=prev;
    if(side==="atk"){
      const prevMove=ids.move.value;ids.move.innerHTML="";ids.move.appendChild(option("","技を選択…"));
      s.movePool.map(id=>MOVE_DEX[id]).filter(Boolean).forEach(m=>ids.move.appendChild(option(m.id,`${m.name}（${m.type}/${catName(m.category)}）`)));
      if([...ids.move.options].some(o=>o.value===prevMove))ids.move.value=prevMove;else ids.move.value="";
    }
  }
  function collectPoints(side){const out={};document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>out[i.dataset.stat]=Math.max(0,Math.min(32,Number(i.value)||0)));return out;}
  function pointsTotal(p){return Object.values(p).reduce((a,b)=>a+b,0);}
  function makeSet(side){
    const s=sideSpecies(side);if(!s)throw new Error(`${side==="atk"?"攻撃側":"防御側"}のポケモンを選んでください。`);
    const abilityId=ids[side+"Ability"].value,itemId=ids[side+"Item"].value,nature=ids[side+"Nature"].value;
    if(!abilityId)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の特性は非公開です。計算上の仮定を選んでください。`);
    if(!itemId)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の持ち物は非公開です。「なし」を含め、計算上の仮定を選んでください。`);
    if(!nature)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の性格は非公開です。計算上の仮定を選んでください。`);
    const moveId=side==="atk"?ids.move.value:s.movePool[0];
    return{speciesId:s.id,abilityId,itemId,nature,statPoints:collectPoints(side),moves:[moveId].filter(Boolean)};
  }
  function setPoints(side,points,privateInfo){
    document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>{
      i.value=privateInfo?String(points?.[i.dataset.stat]??0):"";
      i.placeholder=privateInfo?"0":"0（仮定）";
    });
  }
  function setKnownOrUnknown(select,value,unknownLabel){
    if(value&&[...select.options].some(o=>o.value===value)){select.value=value;return true;}
    prependUnknownOption(select,unknownLabel);return false;
  }
  function setLoadNote(side,snapshot){
    const el=damageLoadNotes[side];if(!el)return;
    el.classList.toggle("is-private",Boolean(snapshot?.privateInfo));
    el.classList.toggle("is-public",Boolean(snapshot&&!snapshot.privateInfo));
    if(!snapshot){el.textContent="";return;}
    if(snapshot.privateInfo){el.textContent="自分側の非公開情報を含めて現在値を反映しました。";return;}
    const known=[];if(snapshot.abilityId)known.push("特性");if(snapshot.itemId)known.push("持ち物");if(snapshot.moveIds?.length)known.push("技");
    el.textContent=`相手側は公開情報のみ反映：HP%・能力ランク${known.length?`・公開済み${known.join("/ ")}`:""}。能力Pと性格、未公開の特性・持ち物・技は取得していません。空欄の能力Pは計算時0として扱います。`;
  }
  function selectSnapshotMove(snapshot){
    if(!snapshot||!ids.move)return false;
    const id=(snapshot.moveIds||[]).find(moveId=>[...ids.move.options].some(o=>o.value===moveId));
    ids.move.value=id||"";return Boolean(id);
  }
  function setSideFromSnapshot(side,snapshot){
    if(!snapshot)return;
    ids[side+"Species"].value=snapshot.speciesId;refreshSide(side);
    if(snapshot.abilityId)setKnownOrUnknown(ids[side+"Ability"],snapshot.abilityId,"特性は未公開（仮定して選択）");else prependUnknownOption(ids[side+"Ability"],"特性は未公開（仮定して選択）");
    if(snapshot.itemId&&[...ids[side+"Item"].options].some(o=>o.value===snapshot.itemId))ids[side+"Item"].value=snapshot.itemId;else ids[side+"Item"].value="";
    ids[side+"Nature"].value=snapshot.nature&&NATURES[snapshot.nature]?snapshot.nature:"";
    ids[side+"Hp"].value=Math.max(1,Math.min(100,Number(snapshot.hpPercent)||100));
    setPoints(side,snapshot.statPoints,snapshot.privateInfo);
    loadedBattleSnapshots[side]=snapshot;
    if(side==="atk")selectSnapshotMove(snapshot);
    setLoadNote(side,snapshot);
  }
  function syncLoadedStagesToMove(){
    const move=MOVE_DEX[ids.move?.value];if(!move||move.category==="status")return;
    const atkStat=move.category==="physical"?"attack":"specialAttack",defStat=move.category==="physical"?"defense":"specialDefense";
    const a=loadedBattleSnapshots.atk,d=loadedBattleSnapshots.def;
    if(a?.stages&&Number.isFinite(Number(a.stages[atkStat])))ids.atkStage.value=String(a.stages[atkStat]);
    if(d?.stages&&Number.isFinite(Number(d.stages[defStat])))ids.defStage.value=String(d.stages[defStat]);
  }
  function loadCurrent(){
    try{
      const ctx=window.__PBV8GetDamageBattleContext?.();if(!ctx?.player||!ctx?.enemy)throw new Error("対戦中の公開情報を取得できません");
      loadedBattleSnapshots={atk:null,def:null};
      setSideFromSnapshot("atk",ctx.player);setSideFromSnapshot("def",ctx.enemy);syncLoadedStagesToMove();
      const perspective=ctx.privateSide==="player"?v8SideLabelStatic("player"):ctx.privateSide==="enemy"?v8SideLabelStatic("enemy"):"公開視点";
      damageResult.textContent=`現在の対面を${perspective}基準で読み込みました。相手の非公開情報は読み込んでいません。必要な非公開項目は仮定して選択してください。`;
    }catch(e){console.warn(e);damageResult.textContent="対戦中の公開情報を取得できません。編成画面では手動で条件を指定してください。";}
  }
  function readSideForm(side){
    const pts={};document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>pts[i.dataset.stat]=i.value);
    return{speciesId:ids[side+"Species"].value,abilityId:ids[side+"Ability"].value,itemId:ids[side+"Item"].value,nature:ids[side+"Nature"].value,hp:ids[side+"Hp"].value,stage:ids[side+"Stage"].value,points:pts};
  }
  function applySideForm(side,state){
    ids[side+"Species"].value=state.speciesId;refreshSide(side);
    if(state.abilityId&&[...ids[side+"Ability"].options].some(o=>o.value===state.abilityId))ids[side+"Ability"].value=state.abilityId;else prependUnknownOption(ids[side+"Ability"],"特性を仮定して選択…");
    ids[side+"Item"].value=[...ids[side+"Item"].options].some(o=>o.value===state.itemId)?state.itemId:"";
    ids[side+"Nature"].value=[...ids[side+"Nature"].options].some(o=>o.value===state.nature)?state.nature:"";
    ids[side+"Hp"].value=state.hp;
    ids[side+"Stage"].value=state.stage;
    document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>i.value=state.points[i.dataset.stat]??"");
  }
  function swapDamageSides(){
    const a=readSideForm("atk"),d=readSideForm("def"),oldMove=ids.move.value;
    const aSnap=loadedBattleSnapshots.atk,dSnap=loadedBattleSnapshots.def;
    const aNote=damageLoadNotes.atk?.textContent||"",dNote=damageLoadNotes.def?.textContent||"";
    const aClass=damageLoadNotes.atk?.className||"damage-load-note",dClass=damageLoadNotes.def?.className||"damage-load-note";
    applySideForm("atk",d);applySideForm("def",a);
    loadedBattleSnapshots={atk:dSnap,def:aSnap};
    if(dSnap)selectSnapshotMove(dSnap);else if([...ids.move.options].some(o=>o.value===oldMove))ids.move.value=oldMove;else ids.move.value="";
    if(damageLoadNotes.atk){damageLoadNotes.atk.textContent=dNote;damageLoadNotes.atk.className=dClass;}
    if(damageLoadNotes.def){damageLoadNotes.def.textContent=aNote;damageLoadNotes.def.className=aClass;}
    syncLoadedStagesToMove();
    damageResult.textContent="攻撃側と防御側を入れ替えました。新しい攻撃側の技を確認してから計算してください。";
  }
  function calcDamage(){
    try{
      const move=MOVE_DEX[ids.move.value];if(!move){throw new Error("技を選んでください。");}if(move.category==="status"){damageResult.innerHTML=`<strong>${esc(move.name)}</strong> は変化技のため直接ダメージはありません。`;return;}
      const atkSet=makeSet("atk"),defSet=makeSet("def");const at=pointsTotal(atkSet.statPoints),dt=pointsTotal(defSet.statPoints);if(at>66||dt>66){damageResult.innerHTML=`<strong>能力Pエラー</strong><br>各ポケモンの能力P合計は66以下にしてください。（攻撃側 ${at} / 防御側 ${dt}）`;return;}
      const attacker=createPokemon(atkSet,0),defender=createPokemon(defSet,0);attacker.side="player";defender.side="enemy";
      attacker.hp=Math.max(1,Math.floor(attacker.maxHP*Math.max(1,Math.min(100,Number(ids.atkHp.value)||100))/100));defender.hp=Math.max(1,Math.floor(defender.maxHP*Math.max(1,Math.min(100,Number(ids.defHp.value)||100))/100));
      const atkStat=move.category==="physical"?"attack":"specialAttack",defStat=move.category==="physical"?"defense":"specialDefense";attacker.stages[atkStat]=Number(ids.atkStage.value)||0;defender.stages[defStat]=Number(ids.defStage.value)||0;
      const crit=Boolean(ids.critical.checked);const minR=calculateDamage(attacker,defender,move,{randomFactor:0.85,forceCritical:crit});const maxR=calculateDamage(attacker,defender,move,{randomFactor:1,forceCritical:crit});let min=minR.damage,max=maxR.damage;let berry="";
      if(typeof v6CanTriggerResistBerry==="function"&&v6CanTriggerResistBerry(defender,move,minR.effectiveness)){min=Math.max(1,Math.floor(min*.5));max=Math.max(1,Math.floor(max*.5));berry=`<br>${esc(defender.item.name)}が発動するため半減を反映。`;}
      const pctMin=(min/defender.maxHP*100),pctMax=(max/defender.maxHP*100);const currentHp=defender.hp;let ko=max<currentHp?"確定耐え":min>=currentHp?"確定1発":"乱数1発";
      damageResult.innerHTML=`<strong>${esc(attacker.name)} → ${esc(defender.name)}：${esc(move.name)}</strong><br>ダメージ <strong>${min} ～ ${max}</strong>（最大HPの ${pctMin.toFixed(1)}% ～ ${pctMax.toFixed(1)}%）<br>現在HP ${currentHp}/${defender.maxHP} に対して：<strong>${ko}</strong><br>タイプ相性：×${minR.effectiveness}${crit?"　急所指定":""}${berry}`;
    }catch(e){console.error(e);damageResult.innerHTML=`<strong>計算できませんでした。</strong><br>${esc(e?.message||e)}`;}
  }
  function openDamage(){openModal(damageModal);}

  // ------------------------------------------------------------
  // 素早さ比較ツール
  // ------------------------------------------------------------
  const speedIds={
    targetSpecies:$("speed-target-species"),targetAbility:$("speed-target-ability"),targetItem:$("speed-target-item"),targetNature:$("speed-target-nature"),targetPoints:$("speed-target-points"),targetStage:$("speed-target-stage"),targetParalysis:$("speed-target-paralysis"),targetTailwind:$("speed-target-tailwind"),
    chaserSpecies:$("speed-chaser-species"),chaserAbility:$("speed-chaser-ability"),chaserItem:$("speed-chaser-item"),chaserStage:$("speed-chaser-stage"),chaserParalysis:$("speed-chaser-paralysis"),chaserTailwind:$("speed-chaser-tailwind")
  };
  const speedLoadNotes={target:$("speed-target-load-note"),chaser:$("speed-chaser-load-note")};
  function fillItemSelect(sel,unknownLabel="持ち物を仮定して選択…"){
    if(!sel)return;
    const items=Object.values(ITEM_DEX).filter(i=>i.id!=="none").slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));
    sel.innerHTML="";sel.appendChild(option("",unknownLabel));sel.appendChild(option("none","なし"));items.forEach(i=>sel.appendChild(option(i.id,i.name)));sel.value="none";
  }
  function speedRefreshAbility(side){
    const speciesSel=speedIds[side+"Species"],abilitySel=speedIds[side+"Ability"];
    const sp=SPECIES_DEX[speciesSel?.value];if(!sp||!abilitySel)return;
    const prev=abilitySel.value;abilitySel.innerHTML="";sp.abilities.forEach(a=>abilitySel.appendChild(option(a.id,a.name)));
    abilitySel.value=[...abilitySel.options].some(o=>o.value===prev)?prev:(sp.abilities[0]?.id||"");
  }
  function populateSpeedTool(){
    const sp=speciesSorted();[speedIds.targetSpecies,speedIds.chaserSpecies].forEach(sel=>{if(!sel)return;sel.innerHTML="";sp.forEach(x=>sel.appendChild(option(x.id,`No.${String(x.dexNo??"-").padStart(3,"0")} ${x.name}`)));});
    fillItemSelect(speedIds.targetItem);fillItemSelect(speedIds.chaserItem);
    if(speedIds.targetNature){speedIds.targetNature.innerHTML="";speedIds.targetNature.appendChild(option("","性格を仮定して選択…"));Object.keys(NATURES).forEach(n=>speedIds.targetNature.appendChild(option(n,n)));speedIds.targetNature.value="まじめ";}
    [speedIds.targetStage,speedIds.chaserStage].forEach(sel=>{if(!sel)return;sel.innerHTML="";for(let i=-6;i<=6;i++)sel.appendChild(option(String(i),i>0?`+${i}`:String(i)));sel.value="0";});
    if(speedIds.targetSpecies&&speedIds.chaserSpecies){speedIds.targetSpecies.value=sp[0]?.id||"";speedIds.chaserSpecies.value=sp[1]?.id||sp[0]?.id||"";speedRefreshAbility("target");speedRefreshAbility("chaser");}
  }
  function speedUnknownSelect(sel,label){prependUnknownOption(sel,label);}
  function speedSetLoadNote(side,snapshot){
    const el=speedLoadNotes[side];if(!el)return;if(!snapshot){el.textContent="";return;}
    el.classList.toggle("is-private",Boolean(snapshot.privateInfo));el.classList.toggle("is-public",!snapshot.privateInfo);
    if(snapshot.privateInfo){el.textContent=side==="target"?"自分側の現在値を反映しました。":"自分側の特性・持ち物・現在ランクを反映しました。結果は3種類の性格補正で比較します。";return;}
    const known=[];if(snapshot.abilityId)known.push("特性");if(snapshot.itemId)known.push("持ち物");
    el.textContent=`公開情報のみ反映${known.length?`（公開済み${known.join("/ ")}を含む）`:""}。性格・S能力P・未公開特性/持ち物は取得していません。`;
  }
  function speedSetSnapshot(side,snapshot){
    if(!snapshot)return;const speciesSel=speedIds[side+"Species"],abilitySel=speedIds[side+"Ability"],itemSel=speedIds[side+"Item"];
    speciesSel.value=snapshot.speciesId;speedRefreshAbility(side);
    if(snapshot.abilityId&&[...abilitySel.options].some(o=>o.value===snapshot.abilityId))abilitySel.value=snapshot.abilityId;else speedUnknownSelect(abilitySel,"特性は未公開（仮定して選択）");
    if(snapshot.itemId&&[...itemSel.options].some(o=>o.value===snapshot.itemId))itemSel.value=snapshot.itemId;else speedUnknownSelect(itemSel,"持ち物は未公開（仮定して選択）");
    speedIds[side+"Stage"].value=String(snapshot.stages?.speed??0);
    speedIds[side+"Paralysis"].checked=snapshot.status==="paralysis";
    speedIds[side+"Tailwind"].checked=Boolean(snapshot.tailwind);
    if(side==="target"){
      speedIds.targetNature.value=snapshot.privateInfo&&snapshot.nature&&NATURES[snapshot.nature]?snapshot.nature:"";
      speedIds.targetPoints.value=snapshot.privateInfo?String(snapshot.statPoints?.speed??0):"";
      speedIds.targetPoints.placeholder=snapshot.privateInfo?"0":"0（仮定）";
    }
    speedSetLoadNote(side,snapshot);
  }
  function loadCurrentSpeed(){
    try{
      const ctx=window.__PBV8GetDamageBattleContext?.();if(!ctx?.player||!ctx?.enemy)throw new Error("対戦中の公開情報を取得できません");
      let target,chaser;
      if(ctx.privateSide==="enemy"){target=ctx.player;chaser=ctx.enemy;}else{target=ctx.enemy;chaser=ctx.player;}
      speedSetSnapshot("target",target);speedSetSnapshot("chaser",chaser);
      const perspective=ctx.privateSide==="player"?v8SideLabelStatic("player"):ctx.privateSide==="enemy"?v8SideLabelStatic("enemy"):"公開視点";
      speedResult.textContent=`現在の対面を${perspective}基準で読み込みました。相手側の非公開情報は読み込んでいません。空欄は仮定して入力してください。`;
    }catch(e){console.warn(e);speedResult.textContent="対戦中の公開情報を取得できません。手動で条件を指定してください。";}
  }
  function validateSpeedSide(side,natureName,points){
    const sp=SPECIES_DEX[speedIds[side+"Species"]?.value];if(!sp)throw new Error(`${side==="target"?"基準":"比較"}ポケモンを選んでください。`);
    const abilityId=speedIds[side+"Ability"]?.value,itemId=speedIds[side+"Item"]?.value;
    if(!abilityId)throw new Error(`${side==="target"?"基準":"比較"}側の特性を仮定して選んでください。`);
    if(!itemId)throw new Error(`${side==="target"?"基準":"比較"}側の持ち物を「なし」を含めて仮定してください。`);
    if(natureName!==undefined&&!natureName)throw new Error("基準側の性格を仮定して選んでください。");
    return{sp,abilityId,itemId,natureName,points};
  }
  function speedValue(speciesId,abilityId,itemId,natureName,points,stage,paralysis,tailwind){
    const sp=SPECIES_DEX[speciesId];if(!sp)return 0;
    // 現行エンジンの getModifiedStat と同じ順序。特性による直接S倍率は現状なく、
    // かそく/かざぐるま等は実際のSランクを指定して再現する。
    let value=calculateStat(sp.baseStats.speed,Math.max(0,Math.min(32,Number(points)||0)),natureName,"speed");
    value=Math.floor(value*getStageMultiplier(Number(stage)||0));
    if(paralysis)value=Math.floor(value*0.5);
    if(itemId==="choice-scarf")value=Math.floor(value*1.5);
    if(tailwind)value*=2;
    return Math.max(1,Math.floor(value));
  }
  function calcSpeed(){
    try{
      const targetPointsRaw=speedIds.targetPoints.value;const targetPoints=targetPointsRaw===""?0:Number(targetPointsRaw);
      if(!Number.isFinite(targetPoints)||targetPoints<0||targetPoints>32)throw new Error("基準側のS能力Pは0～32で指定してください。");
      const target=validateSpeedSide("target",speedIds.targetNature.value,targetPoints);const chaser=validateSpeedSide("chaser");
      const targetSpeed=speedValue(target.sp.id,target.abilityId,target.itemId,target.natureName,targetPoints,speedIds.targetStage.value,speedIds.targetParalysis.checked,speedIds.targetTailwind.checked);
      const classes=[
        {label:"上昇補正",nature:"ようき",examples:"ようき / おくびょう等"},
        {label:"無補正",nature:"まじめ",examples:"まじめ / がんばりや等"},
        {label:"下降補正",nature:"ゆうかん",examples:"ゆうかん / れいせい等"}
      ];
      const rows=classes.map(c=>{
        let needed=null,got=null;for(let pts=0;pts<=32;pts++){const v=speedValue(chaser.sp.id,chaser.abilityId,chaser.itemId,c.nature,pts,speedIds.chaserStage.value,speedIds.chaserParalysis.checked,speedIds.chaserTailwind.checked);if(v>targetSpeed){needed=pts;got=v;break;}}
        const max=speedValue(chaser.sp.id,chaser.abilityId,chaser.itemId,c.nature,32,speedIds.chaserStage.value,speedIds.chaserParalysis.checked,speedIds.chaserTailwind.checked);
        return `<tr><th>${esc(c.label)}<div class="view-note">${esc(c.examples)}</div></th><td>${needed===null?'<span class="speed-impossible">32でも抜けない</span>':`<strong>${needed}</strong>`}</td><td>${needed===null?`${max}（最大）`:`${got}`}</td></tr>`;
      }).join("");
      const assumptions=[];if(targetPointsRaw==="")assumptions.push("基準側S能力P=0を仮定");
      if(target.abilityId==="speed-boost"||chaser.abilityId==="speed-boost")assumptions.push("かそくの上昇分はSランク欄で指定");
      if(target.abilityId==="windmill"||chaser.abilityId==="windmill")assumptions.push("かざぐるまの上昇分はSランク欄で指定");
      speedResult.innerHTML=`<div class="speed-summary"><strong>${esc(target.sp.name)}の実効S：${targetSpeed}</strong><span>${esc(chaser.sp.name)}がこれを上回るための最小S能力P</span>${assumptions.length?`<span class="view-note">${esc(assumptions.join(" / "))}</span>`:""}</div><table class="speed-result-table"><thead><tr><th>性格補正</th><th>必要S能力P</th><th>その時の実効S</th></tr></thead><tbody>${rows}</tbody></table>`;
    }catch(e){console.error(e);speedResult.innerHTML=`<strong>計算できませんでした。</strong><br>${esc(e?.message||e)}`;}
  }
  function openSpeed(){openModal(speedModal);}

  $("open-pokedex-button")?.addEventListener("click",openDex);$("battle-pokedex-button")?.addEventListener("click",openDex);$("pokedex-close")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexModal?.querySelector("[data-close-pokedex]")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexSearch?.addEventListener("input",renderDexList);
  $("open-damage-calc-button")?.addEventListener("click",openDamage);$("battle-damage-calc-button")?.addEventListener("click",openDamage);$("damage-calc-close")?.addEventListener("click",()=>closeModal(damageModal));damageModal?.querySelector("[data-close-damage-calc]")?.addEventListener("click",()=>closeModal(damageModal));$("damage-load-current")?.addEventListener("click",loadCurrent);$("damage-swap-sides")?.addEventListener("click",swapDamageSides);$("damage-calculate")?.addEventListener("click",calcDamage);
  // v10: PC/PWAでボタン個別結線が古いDOM/キャッシュ状態に影響されないよう、
  // 素早さ比較の起動だけはdocument委譲で一元化する。ヘッダー/対戦中ボタンとも同じ経路。
  document.addEventListener("click",e=>{
    const trigger=e.target instanceof Element?e.target.closest("[data-open-speed-check]"):null;
    if(!trigger)return;
    e.preventDefault();
    openSpeed();
  },true);
  $("speed-check-close")?.addEventListener("click",()=>closeModal(speedModal));speedModal?.querySelector("[data-close-speed-check]")?.addEventListener("click",()=>closeModal(speedModal));$("speed-load-current")?.addEventListener("click",loadCurrentSpeed);$("speed-calculate")?.addEventListener("click",calcSpeed);speedIds.targetSpecies?.addEventListener("change",()=>{speedSetLoadNote("target",null);speedRefreshAbility("target");});speedIds.chaserSpecies?.addEventListener("change",()=>{speedSetLoadNote("chaser",null);speedRefreshAbility("chaser");});
  ids.atkSpecies?.addEventListener("change",()=>{loadedBattleSnapshots.atk=null;setLoadNote("atk",null);refreshSide("atk");});ids.defSpecies?.addEventListener("change",()=>{loadedBattleSnapshots.def=null;setLoadNote("def",null);refreshSide("def");});ids.move?.addEventListener("change",syncLoadedStagesToMove);
  populateBaseSelects();populateSpeedTool();renderDexList();renderDexDetail();
  window.__PBV9Tools={openDex,openDamage,calcDamage,loadCurrent,swapDamageSides,openSpeed,calcSpeed,loadCurrentSpeed};
})();
;/* ===== v10 controller ===== */
// ============================================================
// v10 UI / accessibility controller
// - one version source for visible labels
// - modal focus trap + focus restoration
// - background inert while a modal dialog is open
// ============================================================
(function v10UiController(){
  const appVersion = globalThis.NIWARA_APP?.version || "dev";
  document.querySelectorAll("[data-app-version]").forEach(el => { el.textContent = `v${appVersion}`; });
  document.title = `ニワラバトル v${appVersion}`;

  const appShell = document.querySelector(".app-shell");
  const roots = Array.from(document.querySelectorAll(".move-modal, #pass-overlay"));
  const state = new Map();
  const stack = [];

  function isOpen(root){
    return !root.classList.contains("hidden") && root.getAttribute("aria-hidden") !== "true";
  }
  function dialogOf(root){ return root.querySelector('[role="dialog"]') || root; }
  function focusables(dialog){
    return Array.from(dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hidden && el.getAttribute("aria-hidden") !== "true" && el.getClientRects().length > 0);
  }
  function topRoot(){ return stack[stack.length - 1] || null; }
  function updateBackgroundInert(){
    const top = topRoot();
    if (appShell) {
      appShell.inert = stack.length > 0;
      if (stack.length > 0) appShell.setAttribute("aria-hidden", "true");
      else appShell.removeAttribute("aria-hidden");
    }
    // 複数ダイアログが重なった場合も最上位以外は操作・フォーカス不可。
    roots.forEach(root => { root.inert = isOpen(root) && root !== top; });
  }
  function onOpened(root){
    if (state.get(root)?.open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.set(root, { open:true, previous });
    const oldIndex = stack.indexOf(root);
    if (oldIndex >= 0) stack.splice(oldIndex,1);
    stack.push(root);
    updateBackgroundInert();
    const dialog = dialogOf(root);
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex","-1");
    requestAnimationFrame(() => {
      if (isOpen(root)) dialog.focus({ preventScroll:true });
    });
  }
  function onClosed(root){
    const entry = state.get(root);
    if (!entry?.open) return;
    entry.open = false;
    const index = stack.indexOf(root);
    if (index >= 0) stack.splice(index,1);
    updateBackgroundInert();
    const target = entry.previous;
    if (stack.length === 0 && target?.isConnected) {
      requestAnimationFrame(() => target.focus?.({ preventScroll:true }));
    } else if (stack.length) {
      requestAnimationFrame(() => dialogOf(topRoot()).focus?.({ preventScroll:true }));
    }
  }
  function sync(root){ isOpen(root) ? onOpened(root) : onClosed(root); }

  roots.forEach(root => {
    state.set(root, { open:false, previous:null });
    new MutationObserver(() => sync(root)).observe(root, { attributes:true, attributeFilter:["class","aria-hidden"] });
    sync(root);
  });

  document.addEventListener("keydown", event => {
    const root = topRoot();
    if (!root) return;
    const dialog = dialogOf(root);
    if (event.key === "Escape") {
      // 端末受け渡し画面は秘密入力の境界なのでEscでは閉じない。
      if (root.id === "pass-overlay") return;
      const close = dialog.querySelector('[id$="-close"], [data-dialog-close]');
      if (close) {
        event.preventDefault();
        event.stopImmediatePropagation();
        close.click();
      }
      return;
    }
    if (event.key !== "Tab") return;
    const list = focusables(dialog);
    if (!list.length) {
      event.preventDefault();
      dialog.focus({ preventScroll:true });
      return;
    }
    const first = list[0], last = list[list.length-1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }, true);

  window.__NIWARA_UI__ = Object.freeze({
    version: appVersion,
    get openDialogCount(){ return stack.length; }
  });

  // v10 unified public surface. Legacy debug names remain only for compatibility.
  window.NIWARA = Object.freeze({
    version: appVersion,
    battle: window.__PBV8,
    tools: window.__PBV9Tools,
    ui: window.__NIWARA_UI__
  });
})();
})();
