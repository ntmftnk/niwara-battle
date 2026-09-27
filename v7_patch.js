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
      return v7RunAsBlocked(attacker, defender, move, `${dampHolder.name}の ${dampHolder.ability.name}で ${move.name}は 不発になった！`);
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
