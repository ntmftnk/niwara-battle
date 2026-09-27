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

  const V8_VERSION = "9.1";
  const V8_PARTY_LIBRARY_KEY = "niwaraBattlePartyLibraryV8";
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
  const v8PlayerBSourceLabel = document.getElementById("player-b-source-label");
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
  const v8CopyContextButton = document.getElementById("copy-battle-context-button");
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

    // 旧版の現在編成を1枠目として移行。
    if (v8SavedParties.length === 0 && !v8ValidateTeam(builderSets)) {
      v8SavedParties.push({ id: v8Uid(), name: "マイパーティー1", sets: v8CloneSets(builderSets) });
      v8PersistPartyLibrary();
    }
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

  function v8GetSourceSets(value) {
    if (value === "current") return v8CloneSets(builderSets);
    if (value === "random") return v8BuildStrongRandomTeam();
    const p = v8SavedParties.find(x => x.id === value);
    return p ? v8CloneSets(p.sets) : v8CloneSets(builderSets);
  }

  function v8RenderBattleSourceOptions() {
    if (!v8PartySourceA || !v8PartySourceB) return;
    const aOld = v8PartySourceA.value;
    const bOld = v8PartySourceB.value;
    const saved = v8SavedParties.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    v8PartySourceA.innerHTML = `<option value="current">現在の編成</option>${saved}`;
    const pvp = v8BattleModeSelect?.value === "pvp";
    v8PartySourceB.innerHTML = pvp
      ? `<option value="current">現在の編成</option>${saved}`
      : `<option value="random">強化ランダムCPU構築</option>${saved}`;
    if ([...v8PartySourceA.options].some(o => o.value === aOld)) v8PartySourceA.value = aOld;
    if ([...v8PartySourceB.options].some(o => o.value === bOld)) v8PartySourceB.value = bOld;
    if (v8PlayerBSourceLabel) v8PlayerBSourceLabel.textContent = pvp ? "プレイヤーBのパーティー" : "CPUのパーティー";
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

  function v8BuildStrongRandomTeam() {
    const groups = new Map();
    Object.values(SPECIES_DEX).forEach(s => {
      const key = getSpeciesClauseKey(s.id);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    });
    const reps = [...groups.values()].map(arr => arr[0]);
    let best = null, bestScore = -Infinity;
    for (let n=0;n<180;n++) {
      const picked = shuffle(reps).slice(0,6);
      const used = new Set();
      const team = picked.map(s => v8BuildStrongSet(s, used));
      const score = v8TeamQuality(team) + Math.random()*5;
      if (score > bestScore && !v8ValidateTeam(team)) { bestScore = score; best = team; }
    }
    return best || reps.slice(0,6).map(s => v8BuildStrongSet(s, new Set()));
  }

  // ------------------------------------------------------------
  // 強化CPU
  // ------------------------------------------------------------
  const V8_prevScoreMove = scoreMove;
  function v8ExpectedDamage(attacker, defender, move) {
    try {
      const effective = getEffectiveMove(attacker, move);
      if (!effective || effective.category === "status") return 0;
      const r = calculateDamage(attacker, defender, effective, { randomFactor: 0.925, forceCritical: false });
      let damage=Number(r?.damage || 0);
      if(typeof v6CanTriggerResistBerry==="function" && v6CanTriggerResistBerry(defender,effective,r?.effectiveness??1)) damage=Math.max(1,Math.floor(damage*0.5));
      return damage;
    } catch (_) { return 0; }
  }

  scoreMove = function(attacker, defender, move) {
    const effective = getEffectiveMove(attacker, move);
    let score = Number(V8_prevScoreMove(attacker, defender, move)) || 0;
    if (!effective) return score;
    if (effective.category !== "status") {
      const dmg = v8ExpectedDamage(attacker, defender, move);
      const ratio = dmg / Math.max(1, defender.maxHP);
      // みらいよちは即時打点ではない。予約済みなら選ばず、未予約でも遅延価値として控えめに評価する。
      if (effective.futureSight) {
        const pending = typeof v6GetSideState === "function" ? v6GetSideState(defender.side)?.futureSight : null;
        if (pending) return -9999;
        return 28 + ratio * 85 + ((effective.accuracy ?? 100) - 80) * 0.2;
      }
      score += ratio * 150;
      score += ((effective.accuracy ?? 100)-80) * 0.35;
      if (dmg >= defender.hp) score += 145;
      if (effective.priority > 0 && defender.hp <= dmg) score += 55;
      if (getTypeEffectivenessV5(attacker, defender, effective) > 1) score += 28;
      if (effective.pivot && attacker.hp < attacker.maxHP * 0.65) score += 18;
      if (effective.drainRatio && attacker.hp < attacker.maxHP * 0.65) score += 25;
      if (effective.recoilRatio && attacker.hp < attacker.maxHP * 0.28) score -= 45;
      if (effective.recharge && dmg < defender.hp) score -= 70;
      if (effective.recoilMaxHPRatio && dmg < defender.hp && attacker.hp <= attacker.maxHP * 0.6) score -= 55;
    } else {
      const hp = attacker.hp/attacker.maxHP;
      if (effective.rest && hp > 0.72 && !attacker.status) return -120;
      if ((effective.healRatio || effective.recover) && hp > 0.88) return -90;
      if (effective.healRatio || effective.rest || effective.recover) score += hp < .4 ? 100 : hp < .7 ? 35 : -35;
      if (effective.selfStatChanges) {
        const gains = Object.entries(effective.selfStatChanges).reduce((a,[k,v]) => a + Math.max(0, Math.min(v, 6-(attacker.stages[k]||0))),0);
        score += gains*16 - (hp < .35 ? 40 : 0);
      }
      if (effective.hazard || effective.stealthRock || effective.spikes || effective.toxicSpikes || effective.stickyWeb) {
        const targetSide = v6GetSideState(defender.side);
        const hz = effective.hazard;
        if ((hz === "stealthRock" && targetSide.stealthRock) ||
            (hz === "stickyWeb" && targetSide.stickyWeb) ||
            (hz === "spikes" && (targetSide.spikes || 0) >= 3) ||
            (hz === "toxicSpikes" && (targetSide.toxicSpikes || 0) >= 2)) score -= 65;
        else score += 38;
      }
      if ((effective.screen === "reflect" || effective.reflect) && v6GetSideState(attacker.side).reflect <= 0) score += 45;
      if ((effective.screen === "lightScreen" || effective.lightScreen) && v6GetSideState(attacker.side).lightScreen <= 0) score += 45;
      if (effective.tailwind && fieldState.tailwind[attacker.side] <= 0) score += 42;
      if (effective.trickRoom) score += getModifiedStat(attacker,"speed") < getModifiedStat(defender,"speed") ? 48 : -10;
      if ((effective.status || effective.toxic || effective.yawn) && !defender.status) score += 38;
      if (effective.taunt && !defender.tauntTurns) score += 28;
      if (effective.protect || effective.protectLike) score += hp < .3 ? 30 : 8;
      if (effective.weather && weather.type === effective.weather) score -= 45;
      if (effective.terrain && v6EnsureFieldState().terrain.type === effective.terrain) score -= 35;
    }
    return score;
  };

  chooseBestMove = function(attacker, defender) {
    const selectable = getSelectableMoves(attacker);
    if (!selectable.length) return { ...STRUGGLE_MOVE };
    let best = selectable[0], bestScore = -Infinity;
    selectable.forEach(move => {
      const s = scoreMove(attacker, defender, move) * (0.96 + Math.random()*0.08);
      if (s > bestScore) { bestScore=s; best=move; }
    });
    return best;
  };

  function v8IncomingThreat(defender, attacker) {
    const moves = getSelectableMoves(attacker).filter(m => getEffectiveMove(attacker,m).category !== "status");
    return moves.reduce((mx,m) => Math.max(mx, v8ExpectedDamage(attacker, defender, m)), 0);
  }

  function v8SwitchScore(candidate, foe) {
    const offense = bestDamageScoreForPokemon(candidate, foe);
    const incoming = v8IncomingThreat(candidate, foe);
    const survival = 1 - Math.min(1.5, incoming / Math.max(1,candidate.hp));
    const hp = candidate.hp/candidate.maxHP;
    return offense + survival*70 + hp*30 + (candidate.speed > foe.speed ? 8 : 0);
  }

  chooseEnemyAction = function() {
    const enemy = getEnemyPokemon(), player = getPlayerPokemon();
    if (!enemy || !player) return { type:"move", move: enemy?.moves?.[0] || STRUGGLE_MOVE };
    const bestMove = chooseBestMove(enemy, player);
    const moveScore = scoreMove(enemy, player, bestMove);
    const currentThreat = v8IncomingThreat(enemy, player);
    const currentDanger = currentThreat >= enemy.hp || getTypeEffectivenessV5(player, enemy, chooseBestMove(player, enemy)) > 1;
    let bestSwitch = null, bestSwitchScore = -Infinity;
    enemyTeam.forEach((p,i) => {
      if (i===enemyActiveIndex || p.hp<=0) return;
      const s = v8SwitchScore(p, player);
      if (s > bestSwitchScore) { bestSwitchScore=s; bestSwitch=i; }
    });
    if (bestSwitch !== null && ((currentDanger && bestSwitchScore > moveScore*0.7) || bestSwitchScore > moveScore + 95) && Math.random() < .88) {
      return { type:"switch", index:bestSwitch };
    }
    return { type:"move", move:bestMove };
  };

  function v8MatchupScore(set, enemySets) {
    const p = createPokemon(set, 0); p.side="enemy";
    let score=0;
    enemySets.forEach(es => {
      const foe=createPokemon(es,0); foe.side="player";
      const out=bestDamageScoreForPokemon(p,foe)/Math.max(1,foe.maxHP);
      const inc=v8IncomingThreat(p,foe)/Math.max(1,p.maxHP);
      score += out*80 - inc*55;
    });
    return score;
  }

  function v8ChooseCpuSelection(roster, opponentRoster) {
    const idx = roster.map((_,i)=>i);
    let best=[0,1,2], bestScore=-Infinity;
    for(let a=0;a<idx.length;a++) for(let b=a+1;b<idx.length;b++) for(let c=b+1;c<idx.length;c++) {
      const arr=[a,b,c];
      let s=arr.reduce((sum,i)=>sum+v8MatchupScore(roster[i],opponentRoster),0);
      if (s>bestScore){bestScore=s;best=arr;}
    }
    // 先発は6匹全体への平均相性で最良を先頭に。
    best.sort((i,j)=>v8MatchupScore(roster[j],opponentRoster)-v8MatchupScore(roster[i],opponentRoster));
    return best;
  }

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
    const error = v8ValidateTeam(builderSets);
    if (error) { setBuilderMessage(error,true); showScreen("builder"); return; }
    v8RenderBattleSourceOptions();
    showScreen("mode");
  }

  function v8StartSelectionSetup() {
    v8BattleMode = v8BattleModeSelect.value;
    v8RosterA = v8GetSourceSets(v8PartySourceA.value);
    v8RosterB = v8GetSourceSets(v8PartySourceB.value);
    const errA=v8ValidateTeam(v8RosterA), errB=v8ValidateTeam(v8RosterB);
    if (errA || errB) { setBuilderMessage(errA || errB,true); showScreen("builder"); return; }
    v8SelectionA=[]; v8SelectionB=[]; v8SelectionStage="A"; v8SelectionView="chooser";
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
      `【ニワラバトル v9.1 見せ合い状況コピー】`,
      `視点: ${labels[viewMode]}`,
      `対戦形式: ${v8BattleMode==="pvp"?"2人対戦":"対CPU戦"}`,
      `選出操作中: プレイヤー${isB?"B":"A"}`,
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
  const V8_addLog = addLog;
  addLog = function(text,className="") {
    const s=String(text);
    v8AllBattlePokemon().forEach(p=>{
      // 同名の特性・持ち物を持つ控えまで誤って公開しないよう、ポケモン名と効果名の両方がログに出た個体だけ公開する。
      if (p.ability?.name && s.includes(p.name) && s.includes(p.ability.name)) v8MarkAbility(p);
      if (p.item?.name && p.item.id!=="none" && s.includes(p.name) && s.includes(p.item.name)) v8MarkItem(p);
      if (s.includes(`${p.name}を くりだした`) || s.includes(`${p.name}！ キミにきめた`)) v8MarkSeen(p);
    });
    return V8_addLog(text,className);
  };

  const V8_ANNOUNCED_ENTRY_ABILITIES = new Set(["fairy-aura"]);
  const V8_activateEntryAbility = activateEntryAbility;
  activateEntryAbility = function(p) {
    v8MarkSeen(p);
    if(p?.ability && V8_ANNOUNCED_ENTRY_ABILITIES.has(p.ability.id)) {
      addLog(`${p.name}の ${p.ability.name}が発動した！`, "log-system");
    }
    return V8_activateEntryAbility(p);
  };

  const V8_useMoveKnowledge = useMove;
  useMove = function(attacker, defender, move) {
    const logs=V8_useMoveKnowledge(attacker,defender,move);
    const name=move?.name || MOVE_DEX[move?.id]?.name;
    if (name && logs?.some?.(x=>String(x).includes(`${attacker.name}の ${name}`))) v8MarkMove(attacker,move.id);
    return logs;
  };

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

  function v8SanitizeLogForView(text,viewMode=v8ViewMode){
    if(viewMode==="god")return String(text);
    // exact damage/heal/HP cost is hidden outside god view. Battle events remain visible.
    return String(text)
      .replace(/\b\d+ HP (回復|吸収)した！/g,"HPを $1した！")
      .replace(/\b\d+ HP 回復！/g,"HP回復！")
      .replace(/\b\d+ HP 奪われた！/g,"HPを奪われた！")
      .replace(/\b\d+ ダメージ！/g,"ダメージ！")
      .replace(/HPを \d+ 失った！/g,"HPを失った！")
      .replace(/で \d+ ダメージ！/g,"でダメージ！");
  }

  function v8LogTextForView(text,viewMode=v8ViewMode){
    let t=v8SanitizeLogForView(text,viewMode);
    // エンジン内部のログ文では常に「自分」= player(A)、「相手」= enemy(B)。
    // B視点でこれを反転してしまうと、Bの繰り出しや場の効果がA側として表示されるため、
    // B/観戦/神視点では陣営を明示名へ正規化する。A視点だけは従来の自然な自分/相手表記を維持。
    if(viewMode==="B"||viewMode==="god"||viewMode==="spectator") {
      t=t.replaceAll("相手は ","プレイヤーBは ")
         .replaceAll("相手の場","プレイヤーBの場")
         .replaceAll("相手の おいかぜ","プレイヤーBの おいかぜ")
         .replaceAll("自分の場","プレイヤーAの場")
         .replaceAll("自分の おいかぜ","プレイヤーAの おいかぜ");
    }
    return t;
  }

  function v8SanitizeLog(text){ return v8SanitizeLogForView(text,v8ViewMode); }

  function v8RenderLog(){
    battleLogElement.innerHTML="";
    battleLog.forEach(log=>{
      const d=document.createElement("div");
      d.textContent=v8LogTextForView(log.text,v8ViewMode);
      if(log.className)d.className=log.className; battleLogElement.appendChild(d);
    });
    battleLogElement.scrollTop=battleLogElement.scrollHeight;
  }

  function v8RenderViewToolbar(){
    v8ViewButtons?.querySelectorAll?.("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v8ViewMode));
  }

  // ------------------------------------------------------------
  // v8.1: 見せ合い確認 / 状況＋ログ一括コピー
  // ------------------------------------------------------------
  function v8SideLabelStatic(side){ return side==="player"?"プレイヤーA":"プレイヤーB"; }
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
    return ({A:"プレイヤーA視点",B:"プレイヤーB視点",spectator:"観戦視点",god:"神視点"})[viewMode]||viewMode;
  }
  function v8BuildBattleContextText(){
    const {viewMode}=v8CopyPerspective();
    const a=getPlayerPokemon(),b=getEnemyPokemon();
    let commandText="表示専用視点のためコマンド情報なし";
    if(battleOver) commandText="対戦終了";
    else if(viewMode==="A") commandText=v8CommandOptionsText("player");
    else if(viewMode==="B"&&v8BattleMode==="pvp") commandText=v8CommandOptionsText("enemy");
    const lines=[
      `【ニワラバトル v9.1 状況コピー】`,
      `ターン: ${turnNumber}`,
      `視点: ${v8ViewLabel(viewMode)}`,
      `対戦形式: ${v8BattleMode==="pvp"?"2人対戦":"対CPU戦"}`,
      `状態: ${battleOver?"対戦終了":"対戦中"}`,
      "",
      "【場】",
      ...v8FieldSnapshot(viewMode),
      "",
      "【プレイヤーA・場のポケモン】",
      a?v8PublicPokemonText(a,"player",viewMode):"なし",
      "",
      "【プレイヤーB・場のポケモン】",
      b?v8PublicPokemonText(b,"enemy",viewMode):"なし",
      "",
      "【プレイヤーAの選出3匹】",
      v8TeamStatusText("player",viewMode),
      "",
      "【プレイヤーBの選出3匹】",
      v8TeamStatusText("enemy",viewMode),
      "",
      "【プレイヤーAの見せ合い6匹】",
      v8PreviewRosterText("player"),
      "",
      "【プレイヤーBの見せ合い6匹】",
      v8PreviewRosterText("enemy"),
      "",
      "【現在選べるコマンド】",
      commandText,
      "",
      `【ここまでの対戦ログ（${v8ViewLabel(viewMode)}）】`,
      ...(battleLog.length?battleLog.map(log=>v8LogTextForView(log.text,viewMode)):["ログなし"])
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

  function v8SideLabel(side){return side==="player"?"プレイヤーA":"プレイヤーB";}
  function v8GetTeam(side){return side==="player"?playerTeam:enemyTeam;}
  function v8GetIndex(side){return side==="player"?playerActiveIndex:enemyActiveIndex;}
  function v8SetIndex(side,i){if(side==="player")playerActiveIndex=i;else enemyActiveIndex=i;}
  function v8Active(side){return side==="player"?getPlayerPokemon():getEnemyPokemon();}
  function v8Other(side){return side==="player"?"enemy":"player";}

  function v8ShowPass(title,message,cb){v8CloseTeamPreview();v8PassCallback=cb;v8PassTitle.textContent=title;v8PassMessage.textContent=message;v8PassOverlay.classList.remove("hidden");v8PassOverlay.setAttribute("aria-hidden","false");}
  function v8HidePass(){v8PassOverlay.classList.add("hidden");v8PassOverlay.setAttribute("aria-hidden","true");}
  function v8ControlSide(){if(v8ReplacementState?.choosingSide)return v8ReplacementState.choosingSide;if(v8PivotChoicePending?.side)return v8PivotChoicePending.side;return v8ActionPhase;}
  function v8HasBench(side){return v8GetTeam(side).some((p,i)=>i!==v8GetIndex(side)&&p.hp>0);}

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
    if(!battleOver&&!awaitingPlayerSwitch&&!v8ReplacementState)v8PrepareNextPvpTurn();
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
      v8DoRegularSwitch("player",a.index);v8DoRegularSwitch("enemy",b.index);v8FinishPvpTurn();return;
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

  // 2人対戦のひんし交代は双方とも手動。両落ちなら両者が秘密裏に選んでから同時に公開。
  const V8_resolveFaints=resolveFaints;
  resolveFaints=function(){
    if(v8BattleMode!=="pvp")return V8_resolveFaints();
    const faint=[];if(getPlayerPokemon()?.hp<=0)faint.push("player");if(getEnemyPokemon()?.hp<=0)faint.push("enemy");if(!faint.length){renderAll();return;}
    faint.forEach(side=>{const p=v8Active(side);if(p&&!p.v8FaintLogged){p.v8FaintLogged=true;addLog(`${p.name}は たおれた！`,"log-system");}});
    const alive=side=>v8GetTeam(side).some(p=>p.hp>0);const aa=alive("player"),bb=alive("enemy");
    if(!aa||!bb){battleOver=true;awaitingPlayerSwitch=false;addLog(!aa&&!bb?"両者のポケモンがすべて倒れた！":`${aa?"プレイヤーA":"プレイヤーB"}の勝ち！`,"log-system");renderAll();return;}
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
    if(v8BattleMode!=="pvp"){v8BattleOperatorBanner.textContent="操作中：プレイヤーA（CPU戦）";v8BattleOperatorBanner.dataset.state="A";return;}
    if(v8ResolvingTurn){v8BattleOperatorBanner.textContent="両者の行動を解決中";v8BattleOperatorBanner.dataset.state="view";return;}
    if(v8ReplacementState?.choosingSide){const side=v8ReplacementState.choosingSide;v8BattleOperatorBanner.textContent=`交代先を選択中：${v8SideLabel(side)}`;v8BattleOperatorBanner.dataset.state=side==="player"?"A":"B";return;}
    const side=v8ControlSide();
    v8BattleOperatorBanner.textContent=`操作中：${v8SideLabel(side)}`;
    v8BattleOperatorBanner.dataset.state=side==="player"?"A":"B";
  }
  function v8RenderMoves(){
    moveContainer.innerHTML="";
    if(battleOver||awaitingPlayerSwitch||v8ReplacementState)return;
    if(v8BattleMode!=="pvp"){
      const p=getPlayerPokemon(),foe=getEnemyPokemon();v8CommandOwnerText.textContent="たたかう（プレイヤーA）";
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
    switchContainer.innerHTML="";let side=v8BattleMode==="pvp"?v8ControlSide():"player";const team=v8GetTeam(side),active=v8GetIndex(side);const pivot=Boolean(v8PivotChoicePending);const replacement=Boolean(v8ReplacementState);
    const trapped=!replacement&&!pivot&&isTrappedByOpponent(v8Active(side),v8Active(v8Other(side)));
    team.forEach((p,i)=>{const b=document.createElement("button");b.className="switch-button";b.textContent=`${p.name}　${p.hp}/${p.maxHP}`;b.disabled=p.hp<=0||i===active||(trapped&&!pivot)||battleOver;b.addEventListener("click",()=>{if(replacement)v8ChooseReplacement(side,i);else if(pivot)v8SelectPivot(i);else if(v8BattleMode==="pvp")v8SelectSwitch(side,i);else playerSwitch(i);});switchContainer.appendChild(b);});
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
    v8RenderMoves();v8RenderSwitch();v8RenderLog();v8RenderViewToolbar();v8RenderUtilityButtons();
  };

  // ------------------------------------------------------------
  // バトル開始
  // ------------------------------------------------------------
  function v8StartBattle(){
    const selB=v8BattleMode==="cpu"?v8ChooseCpuSelection(v8RosterB,v8RosterA):v8SelectionB;if(v8SelectionA.length!==3||selB.length!==3)return;
    playerTeam=v8SelectionA.map(i=>createPokemon(v8RosterA[i],i));enemyTeam=selB.map(i=>createPokemon(v8RosterB[i],i));playerTeam.forEach(p=>p.side="player");enemyTeam.forEach(p=>p.side="enemy");
    playerActiveIndex=0;enemyActiveIndex=0;awaitingPlayerSwitch=false;battleOver=false;turnNumber=1;battleLog=[];weather={type:null,turns:0};fieldState={trickRoom:0,tailwind:{player:0,enemy:0}};if(typeof v6EnsureFieldState==="function"){fieldState.v6=null;v6EnsureFieldState();}
    v8WeatherMeta={sourceSide:null,sourcePokemon:null,extended:false};v8TerrainMeta={sourceSide:null,sourcePokemon:null,extended:false};v8ScreenMeta={player:{reflect:null,lightScreen:null},enemy:{reflect:null,lightScreen:null}};v8PendingActions={player:null,enemy:null};v8ReplacementState=null;v8PivotChoicePending=null;
    showScreen("battle");addLog("ポケモンバトルを開始！","log-system");addLog(`相手は ${getEnemyPokemon().name}を くりだした！`,"log-system");activateEntryAbility(getEnemyPokemon());addLog(`${getPlayerPokemon().name}！ キミにきめた！`,"log-system");activateEntryAbility(getPlayerPokemon());
    if(v8BattleMode==="pvp"){v8ViewMode="spectator";renderAll();v8PrepareNextPvpTurn();}else{v8ViewMode="A";renderAll();}
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
  v8BattleModeSelect?.addEventListener("change",v8RenderBattleSourceOptions);
  v8ModeContinueButton?.addEventListener("click",v8StartSelectionSetup);
  v8SelectionViewButtons?.addEventListener("click",e=>{const b=e.target.closest?.("[data-selection-view]");if(!b)return;v8SelectionView=b.dataset.selectionView;v8RenderSelection();});
  v8CopySelectionContextButton?.addEventListener("click",v8CopySelectionContext);
  v8Clear?.addEventListener("click",()=>{if(v8SelectionStage==="A")v8SelectionA=[];else v8SelectionB=[];v8RenderSelection();});
  v8Back?.addEventListener("click",()=>showScreen("mode"));
  v8Reroll?.addEventListener("click",()=>{if(v8BattleMode!=="cpu")return;v8RosterB=v8BuildStrongRandomTeam();v8RenderSelection();});
  v8Start?.addEventListener("click",()=>{
    if(v8BattleMode==="pvp"&&v8SelectionStage==="A"){
      if(v8SelectionA.length!==3)return;v8ShowPass("プレイヤーBに端末を渡してください","Aの選出は確定しました。選出順をBに見せないようにしてから続けてください。",()=>{v8SelectionStage="B";v8SelectionB=[];v8SelectionView="chooser";v8RenderSelection();});return;
    }
    v8StartBattle();
  });
  v8PassContinueButton?.addEventListener("click",()=>{const cb=v8PassCallback;v8PassCallback=null;v8HidePass();if(cb)cb();});
  v8TeamPreviewButton?.addEventListener("click",v8OpenTeamPreview);
  v8TeamPreviewClose?.addEventListener("click",v8CloseTeamPreview);
  v8TeamPreviewModal?.querySelector?.("[data-close-team-preview]")?.addEventListener("click",v8CloseTeamPreview);
  v8CopyContextButton?.addEventListener("click",v8CopyBattleContext);
  v8ViewButtons?.addEventListener("click",e=>{const b=e.target.closest?.("[data-view]");if(!b)return;v8ViewMode=b.dataset.view;renderAll();});
  v8Forfeit?.addEventListener("click",()=>{battleOver=true;v8ReplacementState=null;awaitingPlayerSwitch=false;v8HidePass();showScreen("mode");});
  goBuilderButton.onclick=()=>{v8HidePass();v8CloseTeamPreview();showScreen("builder");};
  document.addEventListener("keydown",e=>{if(e.key==="Escape")v8CloseTeamPreview();});

  // 初期化時はv8保存ライブラリも削除。
  resetAllButton.addEventListener("click",()=>{localStorage.removeItem(V8_PARTY_LIBRARY_KEY);v8SavedParties=[];setTimeout(()=>{v8LoadPartyLibrary();v8RenderPartyLibrary();},0);});

  // ------------------------------------------------------------
  // 起動
  // ------------------------------------------------------------
  v8LoadPartyLibrary();v8RenderPartyLibrary();v8RenderBattleSourceOptions();renderBuilder();renderDataCounts();setBuilderMessage(`v${V8_VERSION}：PWA対応、オフライン起動、安全な更新、スマホUI最適化を追加しました。`,false);showScreen("builder");

  window.__PBV8={
    get savedParties(){return v8SavedParties;},buildStrongRandomTeam:v8BuildStrongRandomTeam,chooseCpuSelection:v8ChooseCpuSelection,validateTeam:v8ValidateTeam,
    teamToFormat(sets=builderSets){return v8TeamToFormat(v8CloneSets(sets));},parseTeamFormat(text){return v8ParseTeamFormat(text);},emptyTeamFormat:v8EmptyTeamFormat,
    setView(v){v8ViewMode=v;renderAll();},get view(){return v8ViewMode;},get battleMode(){return v8BattleMode;},
    _debugStartCpu(a=v8CloneSets(builderSets),b=v8BuildStrongRandomTeam()){v8BattleMode="cpu";v8RosterA=v8CloneSets(a);v8RosterB=v8CloneSets(b);v8SelectionA=[0,1,2];v8StartBattle();return{a:playerTeam.length,b:enemyTeam.length,turn:turnNumber};},
    _debugStartPvp(a=v8CloneSets(builderSets),b=v8BuildStrongRandomTeam()){v8BattleMode="pvp";v8RosterA=v8CloneSets(a);v8RosterB=v8CloneSets(b);v8SelectionA=[0,1,2];v8SelectionB=[0,1,2];v8StartBattle();return{a:playerTeam.length,b:enemyTeam.length,turn:turnNumber};},
    _debugPvpTurn(aMoveId=null,bMoveId=null){const A=getPlayerPokemon(),B=getEnemyPokemon();const am=A.moves.find(m=>m.id===aMoveId)||getSelectableMoves(A)[0]||{...STRUGGLE_MOVE};const bm=B.moves.find(m=>m.id===bMoveId)||getSelectableMoves(B)[0]||{...STRUGGLE_MOVE};v8PendingActions={player:{type:"move",move:am},enemy:{type:"move",move:bm}};v8ResolvePvpTurn();return{turn:turnNumber,aHP:getPlayerPokemon()?.hp,bHP:getEnemyPokemon()?.hp,awaitingPlayerSwitch,battleOver};},
    _debugPvpActions(a,b){v8PendingActions={player:a,enemy:b};v8ResolvePvpTurn();return{turn:turnNumber,aHP:getPlayerPokemon()?.hp,bHP:getEnemyPokemon()?.hp,awaitingPlayerSwitch,battleOver};},
    _debugState(){return{mode:v8BattleMode,view:v8ViewMode,phase:v8ActionPhase,awaitingPlayerSwitch,battleOver,turnNumber,a:getPlayerPokemon()?.name,b:getEnemyPokemon()?.name};}
  };
})();
