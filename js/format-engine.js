/* ニワラバトル v13.0.8 multi-format live battle engine.
 * Doubles / Triples / Full 6v6 / Tag (four trainers).
 * Keeps the legacy single engine untouched and uses the same shared data.
 */
(function () {
    'use strict';
    const D = window.NIWARA_DATA, API = () => window.__PBV8, CORE = () => window.NIWARA_CORE || null;
    if (!D)
        return;
    const { SPECIES_DEX, MOVE_DEX, ITEM_DEX, NATURES, TYPE_CHART } = D;
    const $ = id => document.getElementById(id);
    const fmtSelect = $('battle-format-select'), modeSelect = $('battle-mode-select'), continueBtn = $('mode-continue-button');
    const screen = $('format-battle-screen'), board = $('format-battle-board'), cmd = $('format-command-content'), logEl = $('format-battle-log');
    if (!fmtSelect || !continueBtn || !screen)
        return;
    const FORMATS = Object.freeze({
        double: { id: 'double', name: 'ダブル', select: 4, active: 2, trainersPerSide: 1 },
        triple: { id: 'triple', name: 'トリプル', select: 6, active: 3, trainersPerSide: 1 },
        full6: { id: 'full6', name: '6vs6', select: 6, active: 1, trainersPerSide: 1 },
        tag: { id: 'tag', name: 'タッグ', select: 3, active: 2, trainersPerSide: 2 }
    });
    const STRUGGLE_MOVE = Object.freeze({ id: 'struggle', name: 'わるあがき', type: 'ノーマル', category: 'physical', power: 50, accuracy: null, priority: 0, maxPP: 1, pp: 1, struggle: true });
    const ALL_FOES = new Set(['rock-slide', 'heat-wave', 'muddy-water', 'icy-wind', 'dazzling-gleam', 'hyper-voice', 'v6-068', 'v7-breaking-swipe', 'v7-struggle-bug', 'v7-electroweb']);
    const ALL_ADJ = new Set(['earthquake', 'surf', 'discharge', 'v6-113', 'v7-explosion', 'v6-157', 'v6-136']);
    const ALL_ALLIES = new Set(['v6-141', 'v6-153']);
    const ALL_FIELD = new Set(['v6-024']);
    const ALLY_SINGLE = new Set(['v6-107', 'v6-166']);
    const SIDE_MOVES = new Set(['tailwind', 'v6-081', 'v6-140', 'v6-082', 'v6-023', 'v6-043', 'v6-044', 'v6-115', 'v7-toxic-spikes']);
    const SELF_STATUS_HINT = new Set(['v6-072', 'protect', 'v6-017', 'v6-018', 'bulk-up', 'agility', 'iron-defense', 'nasty-plot', 'quiver-dance', 'rock-polish', 'recover', 'roost', 'moonlight', 'synthesis', 'calm-mind', 'swords-dance', 'v7-dragon-dance', 'v7-coil', 'v6-056', 'v6-086', 'v6-101', 'v6-102', 'v6-117', 'v6-124', 'v6-125', 'v6-133', 'v7-ant-march', 'v7-bubble-guard', 'v7-ingrain', 'v7-seishin-toitsu']);
    const FORMAT_LABEL = { single: 'シングル', double: 'ダブル', triple: 'トリプル', full6: '6vs6', tag: 'タッグ' };
    const clamp = (n, a, b) => CORE()?.clamp ? CORE().clamp(n, a, b) : Math.max(a, Math.min(b, n));
    const clone = o => JSON.parse(JSON.stringify(o));
    let state = null, selectionSession = null, autoplayTimer = null;
    function sp(id) { return SPECIES_DEX[id]; }
    function mv(id) { return MOVE_DEX[id]; }
    function item(id) { return ITEM_DEX[id] || ITEM_DEX.none || { id: 'none', name: 'なし' }; }
    function natureMult(name, stat) { const n = NATURES[name] || NATURES['まじめ']; return n?.up === stat ? 1.1 : n?.down === stat ? 0.9 : 1; }
    function statValue(base, pt, nat, stat) { return Math.floor((base + clamp(Number(pt) || 0, 0, 32) + 20) * natureMult(nat, stat)); }
    function hpValue(base, pt) { return base + clamp(Number(pt) || 0, 0, 32) + 75; }
    function stageMult(x) { return CORE()?.stageMult ? CORE().stageMult(x) : (x = clamp(x || 0, -6, 6), x >= 0 ? (2 + x) / 2 : 2 / (2 - x)); }
    function typeEff(type, types, attAbility) { if (CORE()?.typeEffect)
        return CORE().typeEffect(type, types, attAbility); let m = 1; for (const t of types) {
        let x = TYPE_CHART?.[type]?.[t];
        if (x == null)
            x = 1;
        if (x === 0 && t === 'ゴースト' && attAbility === 'scrappy' && ['ノーマル', 'かくとう'].includes(type))
            x = 1;
        m *= x;
    } return m; }
    function effectiveSpeed(p) { let x = Math.floor(p.speed * stageMult(p.stages.speed)); if (p.status === 'paralysis')
        x = Math.floor(x * .5); if (activeItem(p) && p.item.id === 'choice-scarf')
        x = Math.floor(x * 1.5); if (state.field.tailwind[p.side] > 0)
        x *= 2; return Math.max(1, x); }
    function activeItem(p) { return !!p && !p.itemConsumed && state?.field?.magicRoom <= 0; }
    function percent(p) { return p.maxHP ? Math.max(0, Math.round(p.hp / p.maxHP * 100)) : 0; }
    function makePokemon(set, trainerId, side, index) { const s = sp(set.speciesId), pts = set.statPoints || {}, nat = set.nature || 'まじめ'; const p = { uid: `${trainerId}-${index}-${Math.random().toString(36).slice(2, 7)}`, trainerId, side, set: clone(set), id: s.id, name: s.name, baseName: s.name, types: [...s.types], baseTypes: [...s.types], weight: s.weight || 0, formKey: s.formSystem === 'halloween' ? 'treat' : s.formSystem === 'soljiend' ? 'solo' : null, ability: clone(s.abilities.find(a => a.id === set.abilityId) || s.abilities[0]), item: clone(item(set.itemId)), nature: nat, maxHP: hpValue(s.baseStats.hp, pts.hp), hp: 0, attack: statValue(s.baseStats.attack, pts.attack, nat, 'attack'), defense: statValue(s.baseStats.defense, pts.defense, nat, 'defense'), specialAttack: statValue(s.baseStats.specialAttack, pts.specialAttack, nat, 'specialAttack'), specialDefense: statValue(s.baseStats.specialDefense, pts.specialDefense, nat, 'specialDefense'), speed: statValue(s.baseStats.speed, pts.speed, nat, 'speed'), moves: set.moves.map(id => { const m = mv(id); return m ? { ...m, pp: m.maxPP ?? m.pp ?? 10, maxPP: m.maxPP ?? m.pp ?? 10 } : null; }).filter(Boolean), status: null, statusTurns: 0, toxicCounter: 1, stages: { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 }, itemConsumed: false, recharge: false, protect: false, choiceLock: null, charging: null, lastMoveId: null, seen: false, knownMoves: new Set(), abilityRevealed: false, itemRevealed: false, fainted: false, faintLogged: false, position: null, boundTurns: 0, trapped: false, yawnTurns: 0, destinyBond: false, endure: false, flinched: false, helpingHand: 0, confusedTurns: 0, substituteHP: 0, aquaRing: false, magnetRiseTurns: 0, smackDown: false, stockpileCount: 0, batonPassData: null, cursed: false, imprison: false, chargeElectric: false, furyCutterCount: 0, rolloutCount: 0, rampageMoveId: null, rampageTurns: 0, contactParalyzeProtect: false, ingrain: false, jawLockedUid: null, sameMoveCount: 0, lastConsecutiveMoveId: null, tempRemovedIce: false, protectChain: 0, recoveryBlockTurns: 0, hasActedThisTurn: false, lastDamageAmount: 0, lastDamageCategory: null, lastDamageFromSide: null, lastMoveFailed: false, previousMoveFailed: false }; p.hp = p.maxHP; return p; }
    function applyForm(p, key) { const spec = sp(p.id), form = spec?.forms?.[key]; if (!form || p.formKey === key)
        return false; const pts = p.set?.statPoints || {}, nat = p.nature || 'まじめ', oldMax = p.maxHP, oldHP = p.hp, lost = Math.max(0, oldMax - oldHP), b = form.baseStats; p.formKey = key; p.name = form.name; p.weight = form.weight ?? p.weight; p.maxHP = hpValue(b.hp, pts.hp); p.attack = statValue(b.attack, pts.attack, nat, 'attack'); p.defense = statValue(b.defense, pts.defense, nat, 'defense'); p.specialAttack = statValue(b.specialAttack, pts.specialAttack, nat, 'specialAttack'); p.specialDefense = statValue(b.specialDefense, pts.specialDefense, nat, 'specialDefense'); p.speed = statValue(b.speed, pts.speed, nat, 'speed'); p.hp = oldHP <= 0 ? 0 : Math.max(1, Math.min(p.maxHP, p.maxHP - lost)); return true; }
    function updateForecastType(p, announce = false) { if (!p || p.ability.id !== 'forecast')
        return; const before = (p.types || []).join('/'), second = { sun: 'ほのお', rain: 'みず', sand: 'いわ', snow: 'こおり' }[state.field.weather] || 'ノーマル'; p.types = [p.baseTypes[0] || 'でんき', second]; if (before !== p.types.join('/')) {
        revealAbility(p);
        if (announce)
            log(`${p.name}の ${p.ability.name}でタイプが変化した！`, 'log-system');
    } }
    function updateAllForecast() { for (const p of allPokemon())
        updateForecastType(p, false); }
    function weightOf(p) { let w = p?.weight ?? sp(p?.id)?.weight ?? 50; if (p?.ability?.id === 'light-metal')
        w /= 2; return Math.max(.1, w); }
    function checkSpecialForm(p, phase = 'end') { const spec = sp(p?.id); if (!p || !spec || p.hp <= 0)
        return; if (p.ability.id === 'schooling') {
        const key = p.hp > p.maxHP / 4 ? 'school' : 'solo';
        if (applyForm(p, key)) {
            revealAbility(p);
            log(`${p.baseName}の ${p.ability.name}！ ${p.name}に変化した！`, 'log-system');
        }
    } if (p.ability.id === 'power-construct' && phase === 'end' && p.formKey !== 'perfect' && p.hp <= p.maxHP / 2) {
        if (applyForm(p, 'perfect')) {
            revealAbility(p);
            log(`${p.baseName}の ${p.ability.name}！ ${p.name}に変化した！`, 'log-system');
        }
    } }
    function trainer(id, side, label, controller, difficulty, roster, selected) { const team = selected.map((ri, i) => makePokemon(roster[ri], id, side, i)); return { id, side, label, controller, difficulty, roster, selected, team, active: [], knowledge: {}, pending: [], human: controller === 'human' }; }
    function currentBuilder() { return clone(API()?.builderSets || []); }
    function savedPartyById(id) { return clone(API()?.savedParties?.find(p => p.id === id)?.sets || []); }
    function sourceOptions() { const out = [{ value: 'current', text: '現在の編成' }, { value: 'random', text: '強化ランダムCPU構築' }]; for (const p of API()?.savedParties || [])
        out.push({ value: `saved:${p.id}`, text: `保存：${p.name}` }); return out; }
    function resolveSource(value) { if (value === 'current')
        return currentBuilder(); if (value === 'random')
        return clone(API()?.buildStrongRandomTeam?.() || currentBuilder()); if (value?.startsWith('saved:'))
        return savedPartyById(value.slice(6)); const direct = savedPartyById(value); if (Array.isArray(direct) && direct.length === 6)
        return direct; return currentBuilder(); }
    function cpuSelect(roster, count, difficulty, oppRoster = []) { if (count >= 6)
        return [0, 1, 2, 3, 4, 5].sort((a, b) => leadScore(roster[b]) - leadScore(roster[a])); let base = []; try {
        base = API()?.chooseCpuSelection?.(roster, oppRoster, difficulty) || [];
    }
    catch (_) {
        base = [];
    } const rest = [0, 1, 2, 3, 4, 5].filter(i => !base.includes(i)).sort((a, b) => leadScore(roster[b]) - leadScore(roster[a])); return [...base, ...rest].slice(0, count); }
    function leadScore(set) { const s = sp(set.speciesId); return (s?.baseStats?.speed || 0) * 1.1 + Math.max(s?.baseStats?.attack || 0, s?.baseStats?.specialAttack || 0) + (s?.baseStats?.hp || 0) * .25; }
    function sameNameNeedsOwner(p) { if (!p || !state)
        return false; return allPokemon().some(q => q !== p && q.trainerId !== p.trainerId && (q.name === p.name || q.baseName === p.baseName)); }
    function ownedLogName(p) { return `${trainerById(p?.trainerId)?.label || p?.side || '?'}の${p?.name || '?'}`; }
    function qualifyLogPrefix(text, p) { if (!p || !sameNameNeedsOwner(p))
        return text; const raw = String(text), name = p.name, owned = ownedLogName(p); for (const sep of ['の ', 'は ', 'に ', 'が ', 'を '])
        if (raw.startsWith(`${name}${sep}`))
            return `${owned}${sep}${raw.slice((name + sep).length)}`; return raw; }
    function disambiguateLogText(text, meta = null) { let out = String(text); const target = meta?.targetUid ? allPokemon().find(p => p.uid === meta.targetUid) : null; if (target)
        out = qualifyLogPrefix(out, target); const actor = state?.currentLogActorUid ? allPokemon().find(p => p.uid === state.currentLogActorUid) : null; if (actor && out === String(text))
        out = qualifyLogPrefix(out, actor); return out; }
    function log(text, kind = '', meta = null) { if (!state)
        return; const shown = disambiguateLogText(text, meta); state.logs.push({ text: shown, kind, turn: state.turn, meta }); if (state.logs.length > 500)
        state.logs.shift(); try {
        CORE()?.replay?.event?.('format', { turn: state.turn, text: shown, className: kind, snapshot: { format: state.format?.id, phase: state.phase } });
    }
    catch (_) { } renderLog(); }
    function withLogSubject(p, fn) { const prev = state?.currentLogActorUid ?? null; if (state && p)
        state.currentLogActorUid = p.uid; try {
        return fn();
    }
    finally {
        if (state)
            state.currentLogActorUid = prev;
    } }
    function trainerById(id) { return state?.trainers.find(t => t.id === id); }
    function sideTrainers(side) { return state.trainers.filter(t => t.side === side); }
    function sideActives(side) { return sideTrainers(side).flatMap(t => t.active).filter(p => p && p.hp > 0); }
    function allActives() { return [...sideActives('A'), ...sideActives('B')]; }
    function aliveTrainer(t) { return t.team.some(p => p.hp > 0); }
    function aliveSide(side) { return sideTrainers(side).some(aliveTrainer); }
    function bench(t) { return t.team.filter(p => p.hp > 0 && !t.active.includes(p)); }
    function sideBench(side) { return sideTrainers(side).flatMap(bench); }
    function otherSide(side) { return side === 'A' ? 'B' : 'A'; }
    function revealAbility(p) { if (p)
        p.abilityRevealed = true; }
    function revealItem(p) { if (p)
        p.itemRevealed = true; }
    function grounded(p) { if (!p)
        return false; if ((state?.field?.gravity || 0) > 0)
        return true; if (p.ingrain)
        return true; if (p.smackDown)
        return true; if ((p.magnetRiseTurns || 0) > 0)
        return false; if (p.types.includes('ひこう'))
        return false; if (p.ability.id === 'levitate')
        return false; if (activeItem(p) && p.item.id === 'air-balloon')
        return false; return true; }
    function clearHazards(side) { const h = state.field.hazards[side]; h.stealthRock = false; h.spikes = 0; h.toxicSpikes = 0; h.stickyWeb = false; }
    function canRecover(p) { return (p?.recoveryBlockTurns || 0) <= 0; }
    function canSwitch(p) { if (!p || p.hp <= 0)
        return false; if (p.charging?.moveId || p.rampageMoveId)
        return false; if (p.boundTurns > 0 || p.trapped || p.ingrain)
        return false; if (p.jawLockedUid) {
        const q = allPokemon().find(x => x.uid === p.jawLockedUid);
        if (q && q.hp > 0 && allActives().includes(q))
            return false;
    } if (p.types.includes('ゴースト'))
        return true; if (activeItem(p) && p.item.id === 'shed-shell')
        return true; return !hasActiveAbility(otherSide(p.side), 'shadow-tag'); }
    function targetMode(move, actor = null) { if (move.id === 'pollen-puff')
        return 'ally-or-foe'; if (ALL_FIELD.has(move.id))
        return 'all-field'; if (ALL_ADJ.has(move.id))
        return 'all-adjacent'; if (ALL_FOES.has(move.id))
        return 'all-foes'; if (ALL_ALLIES.has(move.id))
        return 'all-allies'; if (ALLY_SINGLE.has(move.id))
        return 'ally'; if (SIDE_MOVES.has(move.id) || move.weather || move.terrain || move.screen || move.tailwind || move.trickRoom || move.hazard)
        return 'side'; if (move.curse)
        return actor?.types?.includes('ゴースト') ? 'foe' : 'self'; if (move.category === 'status' && (SELF_STATUS_HINT.has(move.id) || move.selfStatChanges || move.healRatio || move.healByWeather || move.rest || move.protect || move.substitute || move.growth || move.magnetRise || move.imprison || move.ingrain || move.destinyBond || move.wish || move.chargeElectric || move.v71AntMarch))
        return 'self'; return 'foe'; }
    function tripleAdjacent(a, b) { if (state.format.id !== 'triple')
        return true; if (a.side === b.side)
        return Math.abs((a.position ?? 0) - (b.position ?? 0)) <= 1; return Math.abs((a.position ?? 0) - (b.position ?? 0)) <= 1; }
    function legalTargets(actor, move) { const mode = targetMode(move, actor); if (mode === 'self')
        return [actor]; if (mode === 'side' || mode === 'all-field')
        return []; if (mode === 'ally')
        return sideActives(actor.side).filter(x => x !== actor && tripleAdjacent(actor, x)); if (mode === 'ally-or-foe')
        return allActives().filter(x => x !== actor && tripleAdjacent(actor, x)); if (mode === 'all-allies')
        return sideActives(actor.side); if (mode === 'all-foes')
        return sideActives(otherSide(actor.side)).filter(x => tripleAdjacent(actor, x)); if (mode === 'all-adjacent')
        return allActives().filter(x => x !== actor && tripleAdjacent(actor, x)); return sideActives(otherSide(actor.side)).filter(x => tripleAdjacent(actor, x)); }
    function isSpread(move, targets, actor = null) { return ['all-adjacent', 'all-foes', 'all-allies'].includes(targetMode(move, actor)) && targets.length > 1; }
    function accuracy(move, a, d) { if (move.accuracy == null)
        return true; let acc = move.accuracy; if (state.field.gravity > 0)
        acc *= 5 / 3; if (state.field.weather === 'rain' && move.id === 'thunder')
        acc = 100; if (state.field.weather === 'snow' && move.id === 'v6-010')
        acc = 100; const am = a.stages.accuracy || 0, ev = d?.stages?.evasion || 0; const mult = x => x >= 0 ? (3 + x) / 3 : 3 / (3 - x); return Math.random() * 100 < acc * mult(am) / mult(ev); }
    function critChance(move, a = null) { const focus = a?.focusEnergy || 0; if (focus >= 2 && move.highCrit)
        return 1 / 2; if (focus >= 2 || move.highCrit)
        return 1 / 8; return 1 / 24; }
    function effectiveMoveType(a, move) { if (move.weatherBall) {
        return { sun: 'ほのお', rain: 'みず', sand: 'いわ', snow: 'こおり' }[state.field.weather] || move.type;
    } return move.type; }
    function expectedHits(move) { return CORE()?.expectedHits ? CORE().expectedHits(move) : (!Array.isArray(move?.multiHit) ? 1 : (move.multiHit[0] === move.multiHit[1] ? move.multiHit[0] : (move.multiHit[0] === 2 && move.multiHit[1] === 5 ? 3 : (move.multiHit[0] + move.multiHit[1]) / 2))); }
    function calcPower(a, d, move) { let power = Number(move.power) || 0; if (move.weightPower) {
        const w = weightOf(d);
        power = Math.max(20, Math.min(120, Math.floor(w / 20) * 20));
    } if (move.weightRatioPower) {
        const r = weightOf(a) / Math.max(.1, weightOf(d));
        power = r >= 5 ? 120 : r >= 4 ? 100 : r >= 3 ? 80 : r >= 2 ? 60 : 40;
    } if (move.gyroBall)
        power = Math.min(150, Math.floor(25 * effectiveSpeed(d) / Math.max(1, effectiveSpeed(a))) + 1); if (move.hardPress || move.id === 'v6-126')
        power = d ? Math.max(1, Math.floor(100 * d.hp / d.maxHP)) : 100; if (move.reversal || move.id === 'v6-150')
        power = a.hp / a.maxHP <= .041 ? 200 : a.hp / a.maxHP <= .104 ? 150 : a.hp / a.maxHP <= .208 ? 100 : a.hp / a.maxHP <= .354 ? 80 : a.hp / a.maxHP <= .687 ? 40 : 20; if (move.storedPower || move.id === 'v6-158')
        power = 20 + 20 * Object.values(a.stages).filter(x => x > 0).reduce((z, x) => z + x, 0); if (move.weatherBall && state.field.weather)
        power = 100; if (move.doubleIfTargetStatus && d?.status)
        power *= 2; if (move.venoshock && ['poison', 'toxic'].includes(d?.status))
        power *= 2; if (move.doubleIfUserStatus && a.status)
        power *= 2; if (move.doubleIfDamagedThisTurn && (a.lastDamageAmount || 0) > 0)
        power *= 2; if (move.doubleIfLastMoveFailed && a.previousMoveFailed)
        power *= 2; if (move.doubleIfNoItem && (!activeItem(a) || a.item.id === 'none'))
        power *= 2; if ((move.risingVoltage || move.id === 'v6-174') && state.field.terrain === 'electric' && grounded(d))
        power *= 2; if (move.rainBonus && state.field.weather === 'rain')
        power *= move.rainBonus; if (move.boostInMisty && state.field.terrain === 'misty')
        power *= move.boostInMisty; if (move.furyCutter)
        power = Math.min(160, (Number(move.power) || 40) * Math.pow(2, Math.max(0, a.furyCutterCount || 0))); if (move.rollout)
        power = Math.min(480, (Number(move.power) || 30) * Math.pow(2, Math.max(0, a.rolloutCount || 0))); if (move.beatUp) {
        const team = trainerById(a.trainerId)?.team || [];
        const member = team.find(x => x.hp > 0 && !x.status) || a;
        const bs = sp(member.id)?.forms?.[member.formKey]?.baseStats || sp(member.id)?.baseStats;
        power = Math.floor((bs?.attack || 80) / 10) + 5;
    } if (move.knockOff && d && activeItem(d) && d.item.id !== 'none') power *= 1.5; if(move.spitUp) power = (a.stockpileCount||0)*100; return power; }
    function specialDamage(a, d, move) { if (!a || !d)
        return null; if (move?.struggle)
        return null; const type = effectiveMoveType(a, move), eff = typeEff(type, d.types, a.ability.id); if (eff === 0)
        return 0; if (move.fixedDamage === 'level')
        return Math.min(d.hp, 50); if (move.superFang)
        return Math.max(1, Math.floor(d.hp / 2)); if (move.endeavor)
        return Math.max(0, d.hp - a.hp); if (move.finalGambit)
        return Math.min(d.hp, a.hp); if (move.ohko) {
        if (d.ability.id === 'sturdy')
            return 0;
        return d.hp;
    } if (move.counter)
        return a.lastDamageCategory === 'physical' && a.lastDamageFromSide === d.side ? Math.min(d.hp, Math.max(0, (a.lastDamageAmount || 0) * 2)) : 0; if (move.mirrorCoat)
        return a.lastDamageCategory === 'special' && a.lastDamageFromSide === d.side ? Math.min(d.hp, Math.max(0, (a.lastDamageAmount || 0) * 2)) : 0; if (move.metalBurst)
        return a.lastDamageAmount > 0 && a.lastDamageFromSide === d.side ? Math.min(d.hp, Math.max(0, Math.floor((a.lastDamageAmount || 0) * 1.5))) : 0; return null; }
    function damageRoll(a, d, move, spread = false, critical = false, model = false) { const direct = specialDamage(a, d, move); if (direct !== null)
        return direct; let power = calcPower(a, d, move); if (!power)
        return 0; let cat = move.category; if (move.id === 'v7-golden-burn')
        cat = a.attack >= a.specialAttack ? 'physical' : 'special'; let atk = move.useDefenseAsAttack ? a.defense : (cat === 'physical' ? a.attack : a.specialAttack), def = move.usePhysicalDefense ? d.defense : (cat === 'physical' ? d.defense : d.specialDefense); let astage = move.useDefenseAsAttack ? a.stages.defense : (cat === 'physical' ? a.stages.attack : a.stages.specialAttack), dstage = move.usePhysicalDefense ? d.stages.defense : (cat === 'physical' ? d.stages.defense : d.stages.specialDefense); if (critical) {
        astage = Math.max(0, astage);
        dstage = Math.min(0, dstage);
    } if (a.ability.id === 'unaware')
        dstage = 0; if (d.ability.id === 'unaware')
        astage = 0; atk = Math.max(1, Math.floor(atk * stageMult(astage))); def = Math.max(1, Math.floor(def * stageMult(dstage))); if (a.ability.id === 'night-scales' && cat === 'special') {
        if (!model)
            revealAbility(a);
        atk *= 2;
    } if (cat === 'physical' && a.status === 'burn' && move.id !== 'v6-093')
        atk = Math.max(1, Math.floor(atk * .5)); if (activeItem(d) && d.item.id === 'assault-vest' && cat === 'special') def = Math.max(1, Math.floor(def * 1.5)); if (d.ability.id === 'fur-coat' && (cat === 'physical' || move.usePhysicalDefense))
        def *= 2; let base = Math.floor(Math.floor(Math.floor((2 * 50 / 5 + 2) * power * atk / def) / 50) + 2); let mod = 1; const mtype = effectiveMoveType(a, move); if (!move.struggle && a.types.includes(mtype))
        mod *= a.ability.id === 'adaptability' ? 2 : 1.5; let eff = moveEffectiveness(a, d, move); if (d.ability.id === 'levitate' && mtype === 'じめん' && grounded(d) === false)
        eff = 0; if (d.ability.id === 'earth-eater' && mtype === 'じめん')
        eff = 0; if (d.ability.id === 'lightning-rod' && mtype === 'でんき')
        eff = 0; if (d.ability.id === 'sap-sipper' && mtype === 'くさ')
        eff = 0; if (a.ability.id === 'tinted-lens' && eff > 0 && eff < 1)
        eff *= 2; if (move.beelineBeam && eff > 0 && eff < 1)
        eff *= 2; mod *= eff; if (state.field.terrain === 'electric' && mtype === 'でんき' && grounded(a))
        mod *= 1.3; if (state.field.terrain === 'grassy' && mtype === 'くさ' && grounded(a))
        mod *= 1.3; if (state.field.terrain === 'psychic' && mtype === 'エスパー' && grounded(a))
        mod *= 1.3; if (state.field.terrain === 'misty' && mtype === 'ドラゴン' && grounded(d))
        mod *= .5; if (state.field.terrain === 'grassy' && ['earthquake', 'v6-136'].includes(move.id) && grounded(d))
        mod *= .5; if (state.field.weather === 'rain') {
        if (mtype === 'みず')
            mod *= 1.5;
        if (mtype === 'ほのお')
            mod *= .5;
    } if (state.field.weather === 'sun') {
        if (mtype === 'ほのお')
            mod *= 1.5;
        if (mtype === 'みず')
            mod *= .5;
    } if (a.ability.id === 'water-bubble' && mtype === 'みず')
        mod *= 2; if (d.ability.id === 'water-bubble' && mtype === 'ほのお')
        mod *= .5; if (a.ability.id === 'fairy-aura' && mtype === 'フェアリー')
        mod *= 4 / 3; if (a.ability.id === 'sharpness' && move.slicing)
        mod *= 1.5; if (a.ability.id === 'infinite-track')
        mod *= Math.min(2, 1 + Math.max(0, (a.sameMoveCount || 1) - 1) * .2); if (a.chargeElectric && mtype === 'でんき')
        mod *= 2; if (d.ability.id === 'thick-fat' && ['ほのお', 'こおり'].includes(mtype))
        mod *= .5; if (d.ability.id === 'heatproof' && mtype === 'ほのお')
        mod *= .5; if (d.ability.id === 'dry-skin' && mtype === 'ほのお') mod *= 1.25; if (activeItem(a) && a.item.id === 'life-orb')
        mod *= 1.3; if (activeItem(a) && a.item.id === 'choice-band' && cat === 'physical')
        mod *= 1.5; if (activeItem(a) && a.item.id === 'choice-specs' && cat === 'special')
        mod *= 1.5; if (activeItem(a) && a.item.id === 'expert-belt' && eff > 1)
        mod *= 1.2; if (spread)
        mod *= .75; const sc = state.field.screens[d.side]; if (!critical && cat === 'physical' && sc.reflect > 0)
        mod *= state.format.active > 1 ? 2 / 3 : .5; if (!critical && cat === 'special' && sc.lightScreen > 0)
        mod *= state.format.active > 1 ? 2 / 3 : .5; if (critical)
        mod *= 1.5; const rand = model ? .92 : (.85 + Math.random() * .15); return Math.max(eff === 0 ? 0 : 1, Math.floor(base * mod * rand)); }
    // v13.0.8 - shared target-effect gate for the multi-format live engine.
    function moveEffectiveness(a, d, move) {
        if (move.struggle) return 1;
        const type = effectiveMoveType(a, move);
        let eff = typeEff(type, d.types, a?.ability?.id);
        if (move.freezeDry && d.types.includes('みず')) {
            // Water is always weak to Freeze-Dry (the other type still applies).
            eff = 2 * typeEff(type, d.types.filter(t => t !== 'みず'), a?.ability?.id);
        }
        if (type === 'じめん' && (d.ability.id === 'earth-eater' || (d.ability.id === 'levitate' && !grounded(d)))) eff = 0;
        if (type === 'でんき' && d.ability.id === 'lightning-rod') eff = 0;
        if (type === 'くさ' && d.ability.id === 'sap-sipper') eff = 0;
        if (type === 'みず' && d.ability.id === 'dry-skin') eff = 0;
        if (move.sound && d.ability.id === 'soundproof') eff = 0;
        return eff;
    }
    function checkTargetProtection(a, d, move, status = false, bounced = false) {
        if (!d || d.hp <= 0) return true;
        const type = effectiveMoveType(a, move);
        if (move.powder && (d.types.includes('くさ') || (activeItem(d) && d.item.id === 'safety-goggles'))) {
            if (activeItem(d) && d.item.id === 'safety-goggles') revealItem(d);
            log(`${d.name}には粉技が効かない！`, 'log-system'); return true;
        }
        if ((move.priority||0)>0 && d.ability.id==='vivid-body' && a.side!==d.side) {revealAbility(d);log(`${d.name}の ビビッドボディで先制技を防いだ！`);return true;}
        if (move.wind && d.ability.id==='windmill') { revealAbility(d); changeStages(d,{speed:1},d); return true; }
        if (move.sound && d.ability.id === 'soundproof') {
            revealAbility(d); log(`${d.name}の ${d.ability.name}で音技を無効化した！`, 'log-system'); return true;
        }
        if (!status) {
            if (type === 'みず' && d.ability.id === 'dry-skin') {
                revealAbility(d); heal(d, Math.floor(d.maxHP / 4), 'かんそうはだで回復', true); return true;
            }
            if (type === 'じめん' && d.ability.id === 'earth-eater') {
                revealAbility(d); heal(d, Math.floor(d.maxHP / 4), 'どしょくで回復', true); return true;
            }
            if (type === 'くさ' && d.ability.id === 'sap-sipper') {
                revealAbility(d); changeStages(d, { attack: 1 }, d); return true;
            }
            if (type === 'でんき' && d.ability.id === 'lightning-rod') {
                revealAbility(d); changeStages(d, { specialAttack: 1 }, d); return true;
            }
            if (moveEffectiveness(a,d,move) === 0) {
                log(`${d.name}には効果がない！`, 'log-system'); return true;
            }
        }
        if (status && d !== a && d.side !== a.side) {
            if (d.ability.id === 'good-as-gold') {
                revealAbility(d); log(`${d.name}の おうごんのからだで変化技を防いだ！`, 'log-system'); return true;
            }
            if (!bounced && d.ability.id === 'magic-bounce' && !move.selfStatChanges) {
                revealAbility(d); log(`${d.name}の マジックミラーで技を跳ね返した！`, 'log-system');
                if (move.directStatus) applyStatus(a, move.directStatus, 100, d);
                if (move.toxic) applyStatus(a, 'toxic', 100, d);
                if (move.targetStatChanges) changeStages(a, move.targetStatChanges, d);
                if (move.seedTarget && !a.types.includes('くさ')) { a.seededBy = d.side; log(`${a.name}にやどりぎを植えつけた！`); }
                return true;
            }
        }
        return false;
    }
    function consumeStatusCure(p) {
        if (!p?.status || !activeItem(p)) return;
        if (p.item.id === 'lum-berry' || (p.item.id === 'chesto-berry' && p.status === 'sleep')) {
            revealItem(p); p.itemConsumed = true;
            cureStatus(p, `${p.item.name}で状態異常が治った`);
        }
    }
    function applyTerrainSeed(p) {
        if (!p || p.hp <= 0 || !activeItem(p)) return;
        if (p.item?.terrainSeed && p.item.terrainSeed === state.field.terrain) {
            revealItem(p); p.itemConsumed = true;
            changeStages(p, { [p.item.seedStat || 'defense']: 1 }, p);
            log(`${p.name}の ${p.item.name}が発動した！`, 'log-system');
        }
    }
    function forcedSwitch(victim) {
        const t = trainerById(victim.trainerId), choices = t ? bench(t) : [];
        if (!choices.length || victim.hp <= 0 || victim.ingrain) return false;
        return switchPokemon(t, victim, t.controller === 'cpu' ? bestBench(t) : choices[Math.floor(Math.random()*choices.length)]);
    }
    function resolveFutureAttacks() {
        for (const hit of (state.futureAttacks || []).filter(x => x.due <= state.turn)) {
            const target = sideActives(hit.targetSide)[0];
            if (!target || !hit.actor) continue;
            const move = MOVE_DEX[hit.moveId];
            if (!move) continue;
            const dmg = damageRoll(hit.actor, target, {...move, futureSight:false}, false, false);
            log(`${target.name}に ${move.name}の攻撃！`, 'log-system');
            hurt(target, dmg, 'ダメージ');
        }
        state.futureAttacks = (state.futureAttacks || []).filter(x => x.due > state.turn);
    }
    function consumeResistBerry(d, move, eff, damage) { if (!activeItem(d) || move?.struggle)
        return damage; const type = effectiveMoveType(null, move), map = { 'occa-berry': 'ほのお', 'passho-berry': 'みず', 'wacan-berry': 'でんき', 'rindo-berry': 'くさ', 'yache-berry': 'こおり', 'chople-berry': 'かくとう', 'kebia-berry': 'どく', 'shuca-berry': 'じめん', 'coba-berry': 'ひこう', 'payapa-berry': 'エスパー', 'tanga-berry': 'むし', 'charti-berry': 'いわ', 'kasib-berry': 'ゴースト', 'haban-berry': 'ドラゴン', 'colbur-berry': 'あく', 'babiri-berry': 'はがね', 'roseli-berry': 'フェアリー' }; if (d.item.id === 'chilan-berry' && type === 'ノーマル') {
        d.itemRevealed = true;
        d.itemConsumed = true;
        log(`${d.name}は ${d.item.name}でダメージを弱めた！`);
        return Math.max(1, Math.floor(damage / 2));
    } if (map[d.item.id] === type && eff > 1) {
        d.itemRevealed = true;
        d.itemConsumed = true;
        log(`${d.name}は ${d.item.name}で${type}技を弱めた！`);
        return Math.max(1, Math.floor(damage / 2));
    } return damage; }
    const STAGE_NAMES = { attack: 'こうげき', defense: 'ぼうぎょ', specialAttack: 'とくこう', specialDefense: 'とくぼう', speed: 'すばやさ', accuracy: '命中率', evasion: '回避率' };
    function logMetaFor(p, extra = null) { return p ? { targetUid: p.uid, targetSide: p.side, targetTrainerId: p.trainerId, name: p.name, ...(extra || {}) } : extra; }
    function stageChangeMessage(p, k, amount, before, after) { const name = STAGE_NAMES[k] || k; if (before === after)
        return `${p.name}の ${name}は もう変わらない！`; if (amount >= 2)
        return `${p.name}の ${name}が ぐーんと あがった！`; if (amount === 1)
        return `${p.name}の ${name}が あがった！`; if (amount <= -2)
        return `${p.name}の ${name}が がくっと さがった！`; return `${p.name}の ${name}が さがった！`; }
    function changeStages(p, changes, source = null) { if (!changes || !p)
        return false; let lowered = false, changed = false; for (const [k, v0] of Object.entries(changes)) {
        const v = Number(v0) || 0;
        if (!v)
            continue;
        if (v < 0 && source && source !== p) {
            const abilityBlock = ['clear-body', 'white-smoke'].includes(p.ability.id), itemBlock = activeItem(p) && p.item.id === 'clear-amulet', mistBlock = source.side !== p.side && state.field.screens[p.side]?.mist > 0;
            if (abilityBlock || itemBlock || mistBlock) {
                if (abilityBlock) {
                    revealAbility(p);
                    log(`${p.name}の ${p.ability.name}で 能力は下がらない！`, 'log-system');
                }
                else if (itemBlock) {
                    revealItem(p);
                    log(`${p.name}は ${p.item.name}で 能力を下げられない！`, 'log-system');
                }
                else
                    log(`${p.name}側は しろいきりで 能力を下げられない！`, 'log-system');
                continue;
            }
        }
        const before = p.stages[k] || 0, after = clamp(before + v, -6, 6);
        log(stageChangeMessage(p, k, v, before, after), 'log-status', logMetaFor(p));
        if (after !== before) {
            p.stages[k] = after;
            changed = true;
            if (after < before && source && source !== p)
                lowered = true;
        }
    } if (lowered && p.ability.id === 'competitive') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        const before = p.stages.specialAttack || 0, after = clamp(before + 2, -6, 6);
        p.stages.specialAttack = after;
        log(stageChangeMessage(p, 'specialAttack', 2, before, after), 'log-status', logMetaFor(p));
    } if (changed && activeItem(p) && p.item.id === 'white-herb' && Object.values(p.stages).some(v => v < 0)) {
        for (const k of Object.keys(p.stages))
            if (p.stages[k] < 0)
                p.stages[k] = 0;
        revealItem(p);
        p.itemConsumed = true;
        log(`${p.name}は しろいハーブで下がった能力を元に戻した！`, 'log-system');
    } return changed; }
    function cureStatus(p, msg = '状態異常が治った') { if (!p?.status)
        return false; p.status = null; p.statusTurns = 0; p.toxicCounter = 1; log(`${p.name}は ${msg}！`, 'log-status', logMetaFor(p)); return true; }
    function applyStatus(p, status, chance = 100, source = null) { if (p.status || p.hp <= 0 || Math.random() * 100 >= chance)
        return false; if (source && source.side !== p.side && state.field.screens[p.side]?.safeguard > 0)
        return false; if (grounded(p) && state.field.terrain === 'misty' && source?.side !== p.side)
        return false; if (status === 'sleep' && grounded(p) && state.field.terrain === 'electric')
        return false; if (status === 'burn' && p.types.includes('ほのお'))
        return false; if (['poison', 'toxic'].includes(status) && (p.types.includes('どく') || p.types.includes('はがね')))
        return false; if (status === 'paralysis' && p.types.includes('でんき'))
        return false; if (status === 'freeze' && p.types.includes('こおり'))
        return false; if (status === 'burn' && p.ability.id === 'water-bubble') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}で やけどにならない！`, 'log-system');
        return false;
    } if (status === 'sleep' && (p.ability.id === 'sweet-veil' || sideActives(p.side).some(x => x.ability.id === 'sweet-veil'))) {
        const x = sideActives(p.side).find(x => x.ability.id === 'sweet-veil') || p;
        revealAbility(x);
        log(`${x.name}の ${x.ability.name}で ねむりにならない！`, 'log-system');
        return false;
    } p.status = status; if (status === 'sleep')
        p.statusTurns = 2; if (status === 'toxic')
        p.toxicCounter = 1; log(`${p.name}は ${D.STATUS_NAMES?.[status] || status}状態になった！`, 'log-status', logMetaFor(p)); consumeStatusCure(p); return true; }
    function heal(p, n, why = '回復', ignoreBlock = false) { if (!p || p.hp <= 0)
        return 0; if (!ignoreBlock && !canRecover(p)) {
        log(`${p.name}は かいふくふうじで回復できない！`);
        return 0;
    } const before = p.hp; p.hp = Math.min(p.maxHP, p.hp + Math.max(0, Math.floor(n))); const x = p.hp - before; if (x > 0)
        log(`${p.name}は ${x} HP ${why}した！`, '', { hpChange: 'heal', targetUid: p.uid, targetSide: p.side, targetTrainerId: p.trainerId, name: p.name, amount: x, maxHP: p.maxHP, reason: why }); return x; }
    function announceFaint(p) { if (!p || p.hp > 0 || p.faintLogged)
        return false; p.fainted = true; p.faintLogged = true; log(`${p.name}は たおれた！`, 'log-system', logMetaFor(p)); return true; }
    function hurt(p, n, why = 'ダメージ', indirect = false, deferFaint = false) { if (indirect && p.ability.id === 'magic-guard') {
        const first = !p.abilityRevealed;
        revealAbility(p);
        if (first)
            log(`${p.name}の ${p.ability.name}で 間接ダメージを受けない！`, 'log-system', logMetaFor(p));
        return 0;
    } const before = p.hp; p.hp = Math.max(0, p.hp - Math.max(0, Math.floor(n))); const x = before - p.hp; if (x > 0)
        log(`${p.name}は ${x} ${why}！`, '', logMetaFor(p, { hpChange: 'damage', amount: x, maxHP: p.maxHP, reason: why })); if (p.hp <= 0) {
        p.fainted = true;
        if (!deferFaint)
            announceFaint(p);
    } return x; }
    // v13.0.7: Contact recoil is resolved on each successful damaging hit.
    function applyRockyHelmetOnContact(attacker, defender, move, dealt) {
        if (!(dealt > 0 && move.contact && activeItem(defender) && defender.item.id === 'rocky-helmet' && attacker.hp > 0))
            return;
        revealItem(defender);
        hurt(attacker, Math.max(1, Math.floor(attacker.maxHP / 6)), 'ゴツゴツメットのダメージ', true, true);
    }
    function weatherDuration(source, w) { return activeItem(source) && ['damp-rock', 'heat-rock', 'smooth-rock', 'icy-rock'].includes(source?.item?.id) ? 8 : 5; }
    function setWeather(w, source = null) { if (state.field.weather === w && state.field.weatherTurns > 0)
        return; state.field.weather = w; state.field.weatherTurns = weatherDuration(source, w); updateAllForecast(); log(`天候が ${D.WEATHER_NAMES?.[w] || w} になった！`, 'log-system'); }
    function setTerrain(x, source = null) { state.field.terrain = x; state.field.terrainTurns = activeItem(source) && source.item.id === 'terrain-extender' ? 8 : 5; log(`フィールドが ${x} になった！`, 'log-system'); for(const p of allActives()) applyTerrainSeed(p); }
    function setTrickRoom(n = 5) { state.field.trickRoom = n; log('時空がゆがんだ！', 'log-system'); }
    function hasActiveAbility(side, id) { return sideActives(side).some(p => p.ability.id === id && p.hp > 0); }
    function entry(p) { p.seen = true; p.position = p.position ?? 0; p.turnsOnField = 0; p.fainted = false; p.faintLogged = false; const ab = p.ability.id; if (ab === 'halloween-punk' && activeItem(p) && p.item.id === 'mystery-candy' && sp(p.id)?.formSystem === 'halloween') {
        revealAbility(p);
        revealItem(p);
        if (applyForm(p, 'trick')) {
            log(`${p.baseName}の ${p.ability.name}！`, 'log-system');
            log(`${p.baseName}は ${p.item.name}で ${p.name}に変化した！`, 'log-system');
        }
    } updateForecastType(p, true); checkSpecialForm(p, 'entry'); applyTerrainSeed(p); if (ab === 'clean-land') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        state.field.trickRoom = 0;
        state.field.magicRoom = 0;
        state.field.wonderRoom = 0;
        state.field.gravity = 0;
        log('ルーム系状態が解除された！', 'log-system');
    } if (ab === 'drizzle') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        setWeather('rain', p);
    } if (ab === 'sand-stream') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        setWeather('sand', p);
    } if (ab === 'fairy-aura') {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}が発動した！`, 'log-system');
    } if (ab === 'trick-builder' && !p._trickBuilderUsed) {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        p._trickBuilderUsed = true;
        setTrickRoom(5);
    } const hz = state.field.hazards[p.side], boots = activeItem(p) && p.item.id === 'heavy-duty-boots', ground = grounded(p), hasHazard = !!(hz.stealthRock || (hz.spikes && ground) || (hz.stickyWeb && ground) || (hz.toxicSpikes && ground)); if (boots && hasHazard)
        revealItem(p); if (!boots && hz.stealthRock && p.ability.id !== 'magic-guard') {
        const e = typeEff('いわ', p.types, null);
        hurt(p, Math.max(1, Math.floor(p.maxHP * e / 8)), 'ステルスロックのダメージ', true);
    } if (p.hp > 0 && !boots && hz.spikes && ground && p.ability.id !== 'magic-guard')
        hurt(p, Math.max(1, Math.floor(p.maxHP * (hz.spikes >= 3 ? .25 : hz.spikes === 2 ? 1 / 6 : .125))), 'まきびしのダメージ', true); if (p.hp > 0 && !boots && hz.stickyWeb && ground) {
        const changed = changeStages(p, { speed: -1 }, { side: otherSide(p.side) });
        if (changed)
            log(`${p.name}は ねばねばネットで すばやさが下がった！`, 'log-status');
    } if (p.hp > 0 && hz.toxicSpikes && ground && p.types.includes('どく')) {
        hz.toxicSpikes = 0;
        log(`${p.name}は どくびしを吸収した！`, 'log-system');
    }
    else if (p.hp > 0 && !boots && hz.toxicSpikes && ground && !p.types.includes('はがね'))
        applyStatus(p, hz.toxicSpikes >= 2 ? 'toxic' : 'poison', 100, null); }
    function activateInitial(t) { const n = state.format.id === 'tag' ? 1 : state.format.active; t.active = t.team.slice(0, n); t.active.forEach((p, i) => { p.position = state.format.id === 'tag' ? sideTrainers(t.side).findIndex(x => x.id === t.id) : i; withLogSubject(p, () => entry(p)); }); }
    function sideSlotEntries(side) { return sideTrainers(side).flatMap(t => t.active.map((p, i) => ({ trainer: t, p, slot: i, pos: p.position ?? i }))); }
    function targetLabel(p) { return `${trainerById(p.trainerId)?.label || p.side}：${p.name} (${percent(p)}%)`; }
    function applyMove(actor, move, targetChoice) {
        const t = trainerById(actor.trainerId);
        move = move?.id === 'struggle' ? STRUGGLE_MOVE : move;
        if (actor.hp <= 0 || !move)
            return;
        if (actor.recharge) {
            actor.recharge = false;
            log(`${actor.name}は 反動で動けない！`);
            return;
        }
        if (actor.status === 'sleep') {
            if (actor.statusTurns > 0) {
                actor.statusTurns--;
                log(`${actor.name}は ぐうぐう眠っている……`);
                return;
            }
            actor.status = null;
        }
        if (actor.status === 'freeze') {
            if (Math.random() < .2) {
                actor.status = null;
                actor.statusTurns = 0;
                log(`${actor.name}の こおりが とけた！`, 'log-status');
            }
            else {
                log(`${actor.name}は こおっていて 動けない！`, 'log-status');
                return;
            }
        }
        if (actor.status === 'paralysis' && Math.random() < .25) {
            log(`${actor.name}は まひして動けない！`);
            return;
        }
        actor.previousMoveFailed = !!actor.lastMoveFailed;
        actor.lastMoveFailed = false;
        const chargeKind = move.twoTurn || move.twoTurnWeather || null, isSecondCharge = actor.charging?.moveId === move.id, isRampageContinuation = actor.rampageMoveId === move.id, weatherInstant = (move.twoTurn === 'solarBeam' && state.field.weather === 'sun') || (move.twoTurn === 'electroShot' && state.field.weather === 'rain'), herbInstant = !!chargeKind && activeItem(actor) && actor.item.id === 'power-herb', own = actor.moves.find(x => x.id === move.id);
        if (isSecondCharge) {
            targetChoice = allPokemon().find(p => p.uid === actor.charging.targetUid) || targetChoice;
            actor.charging = null;
        }
        else if (chargeKind && !weatherInstant && !herbInstant) {
            if (own && own.pp > 0)
                own.pp--;
            actor.lastMoveId = move.id;
            actor.knownMoves.add(move.id);
            if (move.twoTurnWeather)
                setWeather(move.twoTurnWeather, actor);
            if (move.chargeBoost)
                changeStages(actor, move.chargeBoost, actor);
            actor.charging = { moveId: move.id, targetUid: targetChoice?.uid || null };
            log(`${actor.name}は ${move.name}の準備を始めた！`, 'log-status');
            return;
        }
        else if (chargeKind) {
            if (move.twoTurnWeather)
                setWeather(move.twoTurnWeather, actor);
            if (move.chargeBoost)
                changeStages(actor, move.chargeBoost, actor);
            if (herbInstant) {
                revealItem(actor);
                actor.itemConsumed = true;
                log(`${actor.name}は ${actor.item.name}で すぐに攻撃できる！`, 'log-system');
            }
        }
        if (!move.struggle && own && own.pp > 0 && !isSecondCharge && !isRampageContinuation)
            own.pp--;
        actor.lastMoveId = move.id;
        if (!move.struggle)
            actor.knownMoves.add(move.id);
        if (move.rampage && !actor.rampageMoveId) {
            actor.rampageMoveId = move.id;
            actor.rampageTurns = 2 + Math.floor(Math.random() * 2);
        }
        log(`${actor.name}の ${move.name}！`);
        if (move.explosive && allActives().some(p => p.ability.id === 'damp')) { log('しめりけで爆発技は使えない！', 'log-system'); actor.lastMoveFailed = true; return; }
        if ((actor.tauntTurns||0)>0 && move.category==='status') { actor.lastMoveFailed=true;log('ちょうはつで変化技が出せない！'); return; }
        if (activeItem(actor) && actor.item.id === 'assault-vest' && move.category === 'status') { revealItem(actor); log('とつげきチョッキで変化技は出せない！', 'log-system'); actor.lastMoveFailed = true; return; }
        // v13.0.7: Match the single-battle HP cost/failed-use rule for ありのこうしん.
        if (move.v71AntMarch) {
            if (actor.hp <= actor.maxHP / 2) {
                actor.lastMoveFailed = true;
                log('しかし HPが 足りないため 失敗した！', 'log-status');
                return;
            }
            const cost = Math.floor(actor.maxHP / 2);
            actor.hp = Math.max(0, actor.hp - cost);
            log(`${actor.name}は HPを ${cost} 失った！`, 'log-status', logMetaFor(actor, { hpChange: 'cost', amount: cost, maxHP: actor.maxHP }));
            changeStages(actor, move.selfStatChanges || { defense: 2, specialDefense: 2, speed: 2 }, actor);
            return;
        }
        if (move.protect || move.protectLike) {
            actor.protect = true;
            return;
        }
        if (move.id === 'v6-072') {
            state.redirector[actor.side] = actor;
            log(`${actor.name}は 攻撃を引きつけている！`);
            return;
        }
        if (move.id === 'v6-087') {
            state.quickGuard[actor.side] = true;
            log(`${trainerById(actor.trainerId)?.label || actor.side}側は先制技から守られている！`);
            return;
        }
        if (move.healByWeather) { const x=state.field.weather==='sun'?2/3:state.field.weather?1/4:1/2; heal(actor,Math.floor(actor.maxHP*x)); return; }
        if (move.healRatio && targetMode(move) === 'self') {
            heal(actor, Math.floor(actor.maxHP * move.healRatio));
            return;
        }
        if (move.rest) {
            actor.status = 'sleep';
            actor.statusTurns = 2;
            actor.hp = actor.maxHP;
            return;
        }
        if (move.gravity) { state.field.gravity=5; log('じゅうりょくが強まった！','log-system'); return; }
        if (move.weather) {
            setWeather(move.weather, actor);
            return;
        }
        if (move.terrain) {
            setTerrain(move.terrain, actor);
            return;
        }
        if (move.trickRoom) {
            state.field.trickRoom = 5;
            log('時空がゆがんだ！');
            return;
        }
        if (move.tailwind) {
            state.field.tailwind[actor.side] = 4;
            return;
        }
        if (move.screen) {
            state.field.screens[actor.side][move.screen] = activeItem(actor) && actor.item.id === 'light-clay' ? 8 : 5;
            return;
        }
        if (move.hazard) {
            const hz = state.field.hazards[otherSide(actor.side)];
            if (move.hazard === 'stealthRock')
                hz.stealthRock = true;
            if (move.hazard === 'spikes')
                hz.spikes = Math.min(3, (hz.spikes || 0) + 1);
            if (move.hazard === 'stickyWeb')
                hz.stickyWeb = true;
            if (move.hazard === 'toxicSpikes')
                hz.toxicSpikes = Math.min(2, (hz.toxicSpikes || 0) + 1);
            return;
        }
        if (move.haze) { for (const p of allActives()) for(const k of Object.keys(p.stages)) p.stages[k] = 0; log('全員の能力変化が元に戻った！', 'log-system'); return; }
        if (move.futureSight) { const chosen = targetChoice || sideActives(otherSide(actor.side))[0]; if (!chosen) return; (state.futureAttacks ||= []).push({ actor, moveId:move.id, targetSide:chosen.side, due: state.turn + 2 }); log(`${move.name}の攻撃を予知した！`, 'log-system'); return; }
        if (move.magnetRise) {actor.magnetRiseTurns=5;log(`${actor.name}は宙に浮いた！`,'log-system');return;}
        if (move.chargeElectric) {actor.chargeElectric=true;}
        if (move.stockpile) {if((actor.stockpileCount||0)>=3){log('これ以上たくわえられない！');return;}actor.stockpileCount=(actor.stockpileCount||0)+1;changeStages(actor,{defense:1,specialDefense:1},actor);return;}
        if (move.swallow) {const count=actor.stockpileCount||0;if(!count){log('たくわえがないため失敗した！');return;}heal(actor,Math.floor(actor.maxHP*(count===1?.25:count===2?.5:1)));actor.stockpileCount=0;changeStages(actor,{defense:-count,specialDefense:-count},actor);return;}
        if (move.spitUp && !(actor.stockpileCount>0)){log('たくわえがないため失敗した！');return;}
        if (move.selfStatChanges && move.category === 'status') {
            changeStages(actor, move.selfStatChanges);
            return;
        }
        let targets = legalTargets(actor, move);
        const mode = targetMode(move, actor);
        if (['foe', 'ally', 'ally-or-foe'].includes(mode)) {
            let chosen = targets.find(x => x.uid === targetChoice?.uid) || targets[0];
            if (chosen && chosen.side !== actor.side && ['foe', 'ally-or-foe'].includes(mode)) {
                const redir = state.redirector[chosen.side];
                if (redir && redir.hp > 0 && tripleAdjacent(actor, redir) && move.type !== 'くさ') {
                    chosen = redir;
                    log(`${redir.name}が 攻撃を引きつけた！`);
                }
            }
            targets = chosen ? [chosen] : [];
        }
        if (mode === 'self')
            targets = [actor];
        if (mode === 'side')
            targets = [];
        if (mode === 'all-field') {
            targets = allActives();
        }
        if (mode === 'all-allies')
            targets = sideActives(actor.side);
        if (!targets.length && move.category !== 'status') {
            log('しかし 対象がいない！');
            return;
        }
        // v12.0.6: 条件不成立時に威力技として処理しない。
        if (move.requiresTerrain && !state.field.terrain) {
            actor.lastMoveFailed = true;
            log('しかし フィールドがないので失敗した！', 'log-status');
            return;
        }
        if (move.firstTurnOnly && (actor.turnsOnField || 0) > 0) {
            actor.lastMoveFailed = true;
            log('しかし 登場した直後ではないので失敗した！', 'log-status');
            return;
        }
        if (move.requiresTargetItem) {
            const d = targets[0];
            if (!d || !activeItem(d) || d.item.id === 'none') {
                actor.lastMoveFailed = true;
                log('しかし 相手が持ち物を持っていない！', 'log-status');
                return;
            }
        }
        if (move.id === 'pollen-puff' && targets[0]?.side === actor.side) {
            const d = targets[0];
            if ((actor.recoveryBlockTurns || 0) > 0) {
                log(`${actor.name}は かいふくふうじで 味方に ${move.name}を使えない！`, 'log-status');
                return;
            }
            if (d.protect && !move.ignoreProtect) {
                log(`${d.name}は 攻撃を防いだ！`);
                return;
            }
            heal(d, Math.floor(d.maxHP * (move.allyHealRatio || .5)), 'かふんだんごで回復');
            return;
        }
        const spread = isSpread(move, targets, actor);
        if (move.category === 'status') {
            for (const d of targets) {
                if (d.protect && d.side !== actor.side && !move.ignoreProtect) {
                    log(`${d.name}は 攻撃を防いだ！`);
                    continue;
                }
                if (!accuracy(move, actor, d)) {
                    log(`${d.name}には 当たらなかった！`);
                    continue;
                }
                if (checkTargetProtection(actor, d, move, true)) continue;
                if (move.directStatus)
                    applyStatus(d, move.directStatus, 100, actor);
                if (move.toxic)
                    applyStatus(d, 'toxic', 100, actor);
                if (move.targetStatChanges)
                    changeStages(d, move.targetStatChanges, actor);
                if (move.confuseChance && Math.random() * 100 < move.confuseChance)
                    log(`${d.name}は こんらんした！`);
                if (move.healTargetRatio)
                    heal(d, Math.floor(d.maxHP * move.healTargetRatio));
                if (move.id === 'v6-141')
                    heal(d, Math.floor(d.maxHP / 4));
                if (move.id === 'v6-107')
                    d.helpingHand = true;
                if (move.seedTarget && !d.types.includes('くさ')) { d.seededBy=actor.side; log(`${d.name}にやどりぎを植えつけた！`, 'log-status'); }
                if (move.swapItems && actor!==d) { const hold=actor.item; actor.item=d.item; d.item=hold; actor.itemConsumed=false; d.itemConsumed=false; actor.choiceLock=null; d.choiceLock=null; log(`${actor.name}と${d.name}は持ち物を交換した！`, 'log-system'); }
                if (move.forceSwitch) forcedSwitch(d);
                if (move.yawn && !d.status && !d.yawnTurns) {d.yawnTurns=2;log(`${d.name}は眠気に誘われた！`,'log-status');}
                if (move.tauntTurns) { d.tauntTurns=move.tauntTurns;log(`${d.name}はちょうはつされた！`,'log-status');}
                if (move.encoreTurns && d.lastMoveId) {d.encoreTurns=move.encoreTurns;d.encoreMoveId=d.lastMoveId;log(`${d.name}はアンコールを受けた！`,'log-status');}
                if (move.painSplit) {const avg=Math.floor((actor.hp+d.hp)/2);actor.hp=Math.max(1,Math.min(actor.maxHP,avg));d.hp=Math.max(1,Math.min(d.maxHP,avg));log('HPを分け合った！','log-system');}
                if (move.id === 'v6-153') {
                    changeStages(d, { attack: 1, defense: 1 });
                }
            }
            return;
        }
        let totalDealt = 0;
        for (const d of targets) {
            if (d.hp <= 0 || actor.hp <= 0)
                continue;
            if (state.quickGuard[d.side] && (move.priority || 0) > 0 && !move.feint) {
                log(`${d.name}への先制技は ファストガードで防がれた！`);
                continue;
            }
            if (d.protect && !move.feint && !move.ignoreProtect) {
                log(`${d.name}は 攻撃を防いだ！`);
                continue;
            }
            if (!accuracy(move, actor, d)) {
                log(`${d.name}には 当たらなかった！`);
                continue;
            }
            if (checkTargetProtection(actor,d,move,false)) continue;
            if (move.breakScreens) {state.field.screens[d.side].reflect=0;state.field.screens[d.side].lightScreen=0;log(`${d.side}側の壁が壊れた！`,'log-system');}
            const eff = moveEffectiveness(actor,d,move);
            let hits = 1;
            if (Array.isArray(move.multiHit)) {
                const [lo, hi] = move.multiHit;
                if (lo === hi)
                    hits = lo;
                else if (activeItem(actor) && actor.item.id === 'loaded-dice' && lo === 2 && hi === 5) {
                    revealItem(actor);
                    hits = Math.random() < .5 ? 4 : 5;
                }
                else {
                    const r = Math.random();
                    hits = lo === 2 && hi === 5 ? (r < .35 ? 2 : r < .70 ? 3 : r < .85 ? 4 : 5) : lo + Math.floor(Math.random() * (hi - lo + 1));
                }
            }
            let targetTotal = 0, landed = 0, anyCrit = false;
            for (let hit = 0; hit < hits && d.hp > 0 && actor.hp > 0; hit++) {
                const crit = Math.random() < critChance(move);
                anyCrit = anyCrit || crit;
                let dmg = damageRoll(actor, d, move, spread, crit);
                if (dmg > 0) dmg = consumeResistBerry(d, move, eff, dmg);
                if (actor.helpingHand) {
                    dmg = Math.floor(dmg * 1.5);
                    actor.helpingHand = false;
                }
                if (dmg >= d.hp && d.hp === d.maxHP) {
                    if (d.ability.id === 'sturdy') {
                        revealAbility(d);
                        dmg = Math.max(0, d.hp - 1);
                        log(`${d.name}は ${d.ability.name}で耐えた！`);
                    }
                    else if (activeItem(d) && d.item.id === 'focus-sash') {
                        d.itemRevealed = true;
                        d.itemConsumed = true;
                        dmg = Math.max(0, d.hp - 1);
                        log(`${d.name}は きあいのタスキで耐えた！`);
                    }
                }
                const dealt = hurt(d, dmg, 'ダメージ', false, true);
                targetTotal += dealt;
                totalDealt += dealt;
                if (dealt > 0)
                    landed++;
                applyRockyHelmetOnContact(actor, d, move, dealt);
            }
            if (targetTotal > 0) {
                d.lastDamageAmount = targetTotal;
                d.lastDamageCategory = move.category;
                d.lastDamageFromSide = actor.side;
            }
            if (landed > 1)
                log(`${landed}回 当たった！`, 'log-system');
            if (anyCrit)
                log('急所に当たった！');
            if (eff > 1)
                log('効果はばつぐんだ！');
            else if (eff > 0 && eff < 1)
                log('効果はいまひとつだ…');
            else if (eff === 0)
                log('効果がないようだ…');
            if (d.hp <= 0)
                announceFaint(d);
            if (targetTotal > 0 && move.targetStatChanges && d.hp > 0)
                changeStages(d, move.targetStatChanges, actor);
            if (targetTotal > 0 && !(activeItem(d) && d.item.id === 'covert-cloak') && move.targetStatChangeChance && d.hp > 0 && Math.random() * 100 < move.targetStatChangeChance.chance)
                changeStages(d, { [move.targetStatChangeChance.stat]: move.targetStatChangeChance.amount }, actor);
            if (targetTotal > 0 && !(activeItem(d) && d.item.id === 'covert-cloak') && move.secondaryStatus && d.hp > 0)
                applyStatus(d, move.secondaryStatus.status, move.secondaryStatus.chance, actor);
            if (targetTotal > 0 && !(activeItem(d) && d.item.id === 'covert-cloak') && move.flinchChance && d.hp > 0 && Math.random() * 100 < move.flinchChance)
                d.flinched = true;
            if (targetTotal > 0 && move.clearTargetStages) { for(const k of Object.keys(d.stages)) d.stages[k]=0; log(`${d.name}の能力変化が元に戻った！`, 'log-system'); }
            if (targetTotal > 0 && move.knockOff && activeItem(d) && d.item.id !== 'none') { revealItem(d); log(`${d.name}の ${d.item.name}をはたき落とした！`, 'log-system'); d.itemConsumed=true; d.choiceLock=null; }
            if (targetTotal > 0 && move.forceSwitchOnHit && d.hp > 0) forcedSwitch(d);
            if (targetTotal>0 && move.smackDown) {d.smackDown=true; d.magnetRiseTurns=0;}
            if (targetTotal>0 && move.trapDamage) {d.boundTurns=4+Math.floor(Math.random()*2); d.trapped=true;}
            if (targetTotal>0 && move.spitUp) {const ct=actor.stockpileCount||0;actor.stockpileCount=0;changeStages(actor,{defense:-ct,specialDefense:-ct},actor);}
            if (actor.hp <= 0) {
                announceFaint(actor);
                return;
            }
        }
        if (move.furyCutter) actor.furyCutterCount=totalDealt>0?Math.min(3,(actor.furyCutterCount||0)+1):0; else actor.furyCutterCount=0;
        if (move.rollout) actor.rolloutCount=totalDealt>0?Math.min(4,(actor.rolloutCount||0)+1):0; else actor.rolloutCount=0;
        if (actor.chargeElectric && totalDealt>0 && effectiveMoveType(actor,move)==='でんき') actor.chargeElectric=false;
        if (move.rapidSpin && totalDealt > 0) { clearHazards(actor.side); actor.boundTurns=0; actor.trapped=false; actor.seededBy=null; log(`${actor.name}は設置技と拘束を取り除いた！`, 'log-system'); }
        if (move.removeTerrain && totalDealt > 0 && state.field.terrain) {
            state.field.terrain = null;
            state.field.terrainTurns = 0;
            log('フィールドの効果が 消えた！', 'log-system');
        }
        if (move.selfStatChanges)
            changeStages(actor, move.selfStatChanges);
        if (move.selfStatChangeChance && Math.random() * 100 < move.selfStatChangeChance.chance)
            changeStages(actor, { [move.selfStatChangeChance.stat]: move.selfStatChangeChance.amount });
        if (move.drainRatio && totalDealt > 0)
            heal(actor, Math.max(1, Math.floor(totalDealt * move.drainRatio)));
        if (move.recoilRatio && totalDealt > 0 && actor.ability.id !== 'magic-guard')
            hurt(actor, Math.max(1, Math.round(totalDealt * move.recoilRatio)), '反動ダメージ');
        if (move.recoilMaxHPRatio && actor.ability.id !== 'magic-guard')
            hurt(actor, Math.max(1, Math.ceil(actor.maxHP * move.recoilMaxHPRatio)), '反動ダメージ');
        if (!move.struggle && activeItem(actor) && actor.item.id === 'life-orb' && totalDealt > 0 && actor.ability.id !== 'magic-guard') {
            actor.itemRevealed = true;
            hurt(actor, Math.max(1, Math.floor(actor.maxHP / 10)), 'いのちのたまの反動');
        }
        if (move.struggle && actor.hp > 0)
            hurt(actor, Math.max(1, Math.round(actor.maxHP / 4)), 'わるあがきの反動');
        if (move.finalGambit && totalDealt > 0)
            hurt(actor, actor.hp, 'いのちがけの反動');
        else if (move.selfFaint || move.selfFaintAfterDamage)
            hurt(actor, actor.hp, '反動');
        if (move.rampage && actor.rampageMoveId === move.id) {
            actor.rampageTurns = Math.max(0, (actor.rampageTurns || 1) - 1);
            if (actor.rampageTurns <= 0) {
                actor.rampageMoveId = null;
                actor.rampageTurns = 0;
                actor.confusedTurns = Math.max(actor.confusedTurns || 0, 3);
                log(`${actor.name}は こんらんした！`, 'log-status');
            }
        }
        if (move.recharge && totalDealt > 0)
            actor.recharge = true;
        if (!move.struggle && activeItem(actor) && ['choice-band', 'choice-specs', 'choice-scarf'].includes(actor.item.id))
            actor.choiceLock = move.id;
        if (move.pivot && actor.hp > 0) {
            const b = bench(t);
            if (b.length) {
                if (t.controller === 'cpu') {
                    switchPokemon(t, actor, bestBench(t));
                }
                else {
                    state.pendingPivot = { trainer: t, actor, options: b };
                    return 'pivot-pending';
                }
            }
        }
    }
    function switchPokemon(t, oldP, newP) { if (!newP || newP.hp <= 0 || t.active.includes(newP))
        return false; const idx = t.active.indexOf(oldP), pos = oldP.position; if (idx < 0)
        return false; if (oldP.ability.id === 'regenerator') {
        revealAbility(oldP);
        heal(oldP, Math.floor(oldP.maxHP / 3), '回復', true);
    } if (oldP.ability.id === 'natural-cure' && oldP.status) {
        revealAbility(oldP);
        cureStatus(oldP, '状態異常が治った');
    } oldP.choiceLock = null; oldP.charging = null; oldP.rampageMoveId = null; oldP.rampageTurns = 0; oldP.recharge = false; oldP.protect = false; oldP.protectChain = 0; oldP.flinched = false; oldP.helpingHand = 0; oldP.confusedTurns = 0; oldP.substituteHP = 0; oldP.aquaRing = false; oldP.magnetRiseTurns = 0; oldP.smackDown = false; oldP.stockpileCount = 0; oldP.boundTurns = 0; oldP.trapped = false; oldP.yawnTurns = 0; oldP.destinyBond = false; oldP.imprison = false; oldP.ingrain = false; oldP.seededBy = null; oldP.jawLockedUid = null; oldP.furyCutterCount = 0; oldP.rolloutCount = 0; oldP.sameMoveCount = 0; oldP.lastConsecutiveMoveId = null; oldP.chargeElectric = false; for (const k of Object.keys(oldP.stages))
        oldP.stages[k] = 0; t.active[idx] = newP; newP.position = pos; newP.protect = false; newP.faintLogged = false; withLogSubject(newP, () => entry(newP)); log(`${t.label}は ${newP.name}を繰り出した！`); return true; }
    function cpuLikelyOpponentMoves(p) {
        const species = sp(p.id), known = [...(p.knownMoves || [])].map(mv).filter(m => m && m.category !== 'status'), pool = (species?.movePool || []).map(mv).filter(m => m && m.category !== 'status');
        const staticScore = m => { if (m.requiresTerrain && !state.field.terrain)
            return -1e6; let power = Number(m.power) || 0; if (Array.isArray(m.multiHit))
            power *= expectedHits(m); if (m.fixedDamage === 'level')
            power = 50; if (m.superFang)
            power = 65; if (m.ohko)
            power = 70; if (m.gyroBall || m.weightPower || m.weightRatioPower)
            power = 80; if (m.hardPress || m.reversal)
            power = 75; let v = power * ((m.accuracy ?? 100) / 100); if (species?.types?.includes(m.type))
            v *= 1.35; if ((m.priority || 0) > 0)
            v += 14; if (m.recharge)
            v = v * .56 - 12; if (m.twoTurn || m.twoTurnWeather)
            v = v * .58 - 10; if (m.rampage)
            v *= .88; return v; };
        const out = [], add = m => { if (m && !out.some(x => x.id === m.id))
            out.push(m); };
        known.forEach(add);
        pool.sort((a, b) => staticScore(b) - staticScore(a)).slice(0, 6).forEach(add);
        return out;
    }
    function cpuIncomingThreat(candidate, foe) {
        if (!candidate || !foe)
            return { worst: 0, expected: 0 };
        const model = cpuModelTarget(foe), known = new Set(foe.knownMoves || []), vals = [];
        for (const m of cpuLikelyOpponentMoves(foe)) {
            if (m.requiresTerrain && !state.field.terrain)
                continue;
            if (m.requiresTargetItem && candidate.itemConsumed)
                continue;
            let dmg = damageRoll(model, candidate, m, false, false, true);
            if (Array.isArray(m.multiHit))
                dmg *= expectedHits(m);
            const hit = Math.max(0, Math.min(1, (m.accuracy ?? 100) / 100)), certainty = known.has(m.id) ? 1 : .68;
            vals.push((dmg / Math.max(1, candidate.maxHP)) * hit * certainty);
        }
        vals.sort((a, b) => b - a);
        return { worst: vals[0] || 0, expected: (vals.slice(0, 3).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(3, vals.length))) };
    }
    function cpuCombinedThreat(candidate) { const vals = sideActives(otherSide(candidate.side)).map(f => cpuIncomingThreat(candidate, f)); const worst = vals.map(x => x.worst).sort((a, b) => b - a), expected = vals.map(x => x.expected).sort((a, b) => b - a); return { worst: (worst[0] || 0) + (worst[1] || 0) * .42, expected: (expected[0] || 0) + (expected[1] || 0) * .35 }; }
    function cpuBenchScore(t, p) {
        if (!p || p.hp <= 0)
            return -1e9;
        const foes = sideActives(otherSide(p.side)), hp = p.hp / Math.max(1, p.maxHP), th = cpuCombinedThreat(p);
        let offense = 0, koChance = 0;
        for (const foe of foes) {
            const model = cpuModelTarget(foe);
            for (const m of p.moves || []) {
                if (m.category === 'status' || m.pp <= 0)
                    continue;
                let dmg = damageRoll(p, model, m, false, false, true);
                if (Array.isArray(m.multiHit))
                    dmg *= expectedHits(m);
                const hit = Math.max(0, Math.min(1, (m.accuracy ?? 100) / 100)), ratio = dmg / Math.max(1, model.maxHP) * hit;
                offense = Math.max(offense, ratio);
                if (dmg >= model.hp)
                    koChance = Math.max(koChance, hit);
            }
        }
        let score = hp * 38 + offense * 82 + koChance * 52 - th.expected * 105 - th.worst * 80;
        if (th.worst >= hp * .98)
            score -= offense >= .9 ? 95 : 310;
        else if (th.worst >= hp * .75)
            score -= 95;
        else if (th.expected < .35)
            score += 32;
        const ss = state.field.hazards?.[p.side] || {};
        if (activeItem(p) && p.item.id === 'heavy-duty-boots') { }
        else {
            if (ss.stealthRock)
                score -= typeEff('いわ', p.types, p.ability.id) * 14;
            if (ss.spikes && grounded(p))
                score -= ss.spikes * 7;
        }
        return score;
    }
    function bestBench(t) { const opts = bench(t); if (!opts.length)
        return null; return [...opts].sort((a, b) => cpuBenchScore(t, b) - cpuBenchScore(t, a))[0] || opts[0]; }
    function applyResidual(p) { if (p.hp <= 0)
        return; const poisonHeal = p.ability.id === 'poison-heal' && ['poison', 'toxic'].includes(p.status); if (poisonHeal) {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        heal(p, Math.max(1, Math.floor(p.maxHP / 8)), '回復', true);
    }
    else {
        if (p.status === 'burn') {
            const div = p.ability.id === 'heatproof' ? 32 : 16;
            if (p.ability.id === 'heatproof') {
                revealAbility(p);
                log(`${p.name}の ${p.ability.name}！`, 'log-system');
            }
            hurt(p, Math.max(1, Math.floor(p.maxHP / div)), 'やけどのダメージ');
        }
        if (p.status === 'poison')
            hurt(p, Math.max(1, Math.floor(p.maxHP / 8)), 'どくのダメージ');
        if (p.status === 'toxic') {
            hurt(p, Math.max(1, Math.floor(p.maxHP * p.toxicCounter / 16)), 'もうどくのダメージ');
            p.toxicCounter = Math.min(15, p.toxicCounter + 1);
        }
    } if (p.hp>0 && (p.boundTurns||0)>0){ hurt(p,Math.max(1,Math.floor(p.maxHP/8)),'拘束のダメージ',true); p.boundTurns--;if(!p.boundTurns)p.trapped=false;}
    if (p.hp>0 && (p.yawnTurns||0)>0 && --p.yawnTurns===0 && !p.status) applyStatus(p,'sleep',100,null);
    if(p.tauntTurns>0)p.tauntTurns--;if(p.encoreTurns>0&&--p.encoreTurns===0)p.encoreMoveId=null;
    if(p.magnetRiseTurns>0)p.magnetRiseTurns--;
    if (p.hp > 0 && state.field.weather === 'sand' && !p.types.some(t=>['いわ','じめん','はがね'].includes(t)) && !(activeItem(p) && p.item.id === 'safety-goggles')) hurt(p, Math.max(1, Math.floor(p.maxHP/16)), 'すなあらしのダメージ', true);
    if (p.hp > 0 && state.field.terrain==='grassy' && grounded(p)) heal(p, Math.max(1,Math.floor(p.maxHP/16)), 'グラスフィールドで回復');
    if (p.hp > 0 && p.ability.id==='dry-skin') { if (state.field.weather==='rain') heal(p,Math.max(1,Math.floor(p.maxHP/8)),'かんそうはだで回復'); if (state.field.weather==='sun') hurt(p,Math.max(1,Math.floor(p.maxHP/8)),'かんそうはだのダメージ',true); }
    if (p.hp > 0 && p.seededBy) { const drained=hurt(p,Math.max(1,Math.floor(p.maxHP/8)),'やどりぎのダメージ',true); const receiver=sideActives(p.seededBy)[0]; if(receiver && drained>0) heal(receiver,drained,'やどりぎで回復'); }
    if (p.hp > 0 && activeItem(p) && p.item.id === 'black-sludge') { revealItem(p); if (p.types.includes('どく')) heal(p,Math.max(1,Math.floor(p.maxHP/16)),'くろいヘドロで回復'); else hurt(p,Math.max(1,Math.floor(p.maxHP/8)),'くろいヘドロのダメージ',true); }
    if (p.hp > 0 && activeItem(p) && ['toxic-orb','flame-orb'].includes(p.item.id)) applyStatus(p, p.item.id === 'toxic-orb'?'toxic':'burn',100,null);
    if (p.hp > 0) consumeStatusCure(p);
    if (p.hp > 0 && activeItem(p) && p.item.id === 'leftovers') {
        revealItem(p);
        heal(p, Math.max(1, Math.floor(p.maxHP / 16)), 'たべのこしで回復');
    } if (p.hp > 0 && activeItem(p) && p.item.id === 'sitrus-berry' && p.hp <= p.maxHP / 2) {
        revealItem(p);
        p.itemConsumed = true;
        heal(p, Math.max(1, Math.floor(p.maxHP / 4)), 'オボンのみで回復', true);
    } if (p.hp > 0 && p.ability.id === 'speed-boost' && p.stages.speed < 6) {
        revealAbility(p);
        log(`${p.name}の ${p.ability.name}！`, 'log-system');
        changeStages(p, { speed: 1 }, p);
    } checkSpecialForm(p, 'end'); p.protect = false; p.flinched = false; }
    function tickField() { resolveFutureAttacks(); if (state.field.gravity>0)state.field.gravity--; if (state.field.weatherTurns > 0 && --state.field.weatherTurns <= 0) {
        state.field.weather = null;
        updateAllForecast();
        log('天候が 元に戻った！', 'log-system');
    } if (state.field.terrainTurns > 0 && --state.field.terrainTurns <= 0) {
        state.field.terrain = null;
        log('フィールドの効果がなくなった！', 'log-system');
    } if (state.field.trickRoom > 0 && --state.field.trickRoom === 0)
        log('時空のゆがみが元に戻った！', 'log-system'); if (state.field.magicRoom > 0 && --state.field.magicRoom === 0)
        log('マジックルームが解除された！', 'log-system'); for (const side of ['A', 'B']) {
        if (state.field.tailwind[side] > 0 && --state.field.tailwind[side] === 0)
            log(`${side}側の おいかぜが止んだ！`, 'log-system');
        for (const k of ['reflect', 'lightScreen'])
            if (state.field.screens[side][k] > 0 && --state.field.screens[side][k] === 0)
                log(`${side}側の ${k === 'reflect' ? 'リフレクター' : 'ひかりのかべ'}がなくなった！`, 'log-system');
    } const punk = allActives().filter(p => p.ability.id === 'halloween-punk' && p.formKey !== 'trick'), stats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'], targets = allActives(), dirs = new Map(targets.map(p => [p, new Map()])), pick = a => a[Math.floor(Math.random() * a.length)]; for (const h of punk) {
        revealAbility(h);
        log(`${h.name}の ${h.ability.name}！`, 'log-system');
        for (const q of targets) {
            const dir = dirs.get(q);
            let ups = stats.filter(k => dir.get(k) !== -1), up = pick(ups.length ? ups : stats), downs = stats.filter(k => k !== up && dir.get(k) !== 1);
            if (!downs.length) {
                const free = stats.filter(k => !dir.has(k));
                if (free.length)
                    up = pick(free);
                downs = stats.filter(k => k !== up && dir.get(k) !== 1);
            }
            const down = pick(downs.length ? downs : stats.filter(k => k !== up));
            dir.set(up, 1);
            dir.set(down, -1);
            changeStages(q, { [up]: 1, [down]: -1 }, h);
        }
    } for (const p of allActives())
        p.turnsOnField = (p.turnsOnField || 0) + 1; }
    function actionOrder(actions) { return [...actions].sort((x, y) => { if (x.type === 'switch' && y.type !== 'switch')
        return -1; if (y.type === 'switch' && x.type !== 'switch')
        return 1; const px = x.type === 'move' ? (mv(x.moveId)?.priority || 0) : 0, py = y.type === 'move' ? (mv(y.moveId)?.priority || 0) : 0; if (px !== py)
        return py - px; const sx = effectiveSpeed(x.actor), sy = effectiveSpeed(y.actor); if (sx === sy)
        return Math.random() < .5 ? -1 : 1; return state.field.trickRoom > 0 ? sx - sy : sy - sx; }); }
    function cpuModelTarget(p) { const s = sp(p.id), base = s.baseStats, estHP = base.hp + 91; return { id: p.id, name: p.name, side: p.side, types: [...s.types], ability: { id: p.abilityRevealed ? p.ability.id : 'unknown' }, item: { id: p.itemRevealed && !p.itemConsumed ? p.item.id : 'none' }, itemConsumed: !p.itemRevealed || p.itemConsumed, nature: 'まじめ', maxHP: estHP, hp: Math.max(1, Math.round(estHP * percent(p) / 100)), attack: base.attack + 36, defense: base.defense + 36, specialAttack: base.specialAttack + 36, specialDefense: base.specialDefense + 36, speed: base.speed + 36, status: p.status, stages: { ...p.stages } }; }
    function cpuMoveConditionAdjustment(actor, m, tar) {
        if (m.requiresTerrain && !state.field.terrain)
            return -1e6;
        if (m.v71AntMarch && actor.hp <= actor.maxHP / 2)
            return -1e6;
        if (m.firstTurnOnly && (actor.turnsOnField || 0) > 0)
            return -1e6;
        if (m.requiresTargetItem && tar?.itemRevealed && (tar.itemConsumed || tar.item.id === 'none'))
            return -1e6;
        let score = 0;
        if (m.v71AntMarch)
            score -= 12; // The stat boosts have a substantial HP cost.
        if (m.requiresTargetItem && tar && !tar.itemRevealed)
            score -= 8;
        if (m.suckerPunch)
            score -= 18;
        if (m.upperHand)
            score -= 28;
        const instant = (m.twoTurn === 'solarBeam' && state.field.weather === 'sun') || (m.twoTurn === 'electroShot' && state.field.weather === 'rain');
        if ((m.twoTurn || m.twoTurnWeather) && !instant && !(activeItem(actor) && actor.item.id === 'power-herb'))
            score -= 4;
        if (m.rampage)
            score -= 8;
        return score;
    }
    function usableMovesFor(p) { return (p?.moves || []).filter(m => m.pp > 0 && (!p.choiceLock || p.choiceLock === m.id) && !(activeItem(p) && p.item.id==='assault-vest' && m.category==='status') && !((p.tauntTurns||0)>0 && m.category==='status') && !((p.encoreTurns||0)>0 && p.encoreMoveId && m.id!==p.encoreMoveId)); }
    function cpuChoose(actor, t) {
        if (actor.charging) {
            const m = mv(actor.charging.moveId), a = { type: 'move', actor, moveId: m.id, targetUid: actor.charging.targetUid };
            try {
                CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'move', label: m.name, score: 9999 }, choices: [{ type: 'move', label: m.name, score: 9999 }], reason: '溜め状態のため同じ技を強制' });
            }
            catch (_) { }
            return a;
        }
        if (actor.rampageMoveId) {
            const m = mv(actor.rampageMoveId), a = { type: 'move', actor, moveId: m.id, targetUid: legalTargets(actor, m)[0]?.uid || null };
            try {
                CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'move', label: m.name, score: 9999 }, choices: [{ type: 'move', label: m.name, score: 9999 }], reason: 'あばれ状態のため同じ技を強制' });
            }
            catch (_) { }
            return a;
        }
        if (actor.recharge)
            return { type: 'recharge', actor };
        const foes = sideActives(otherSide(actor.side)), moves = usableMovesFor(actor);
        if (!moves.length) {
            if (canSwitch(actor)) {
                const ppBench = bench(t).filter(p => usableMovesFor(p).length > 0);
                if (ppBench.length) {
                    const b = [...ppBench].sort((a, b) => cpuBenchScore(t, b) - cpuBenchScore(t, a))[0];
                    try {
                        CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'switch', label: `交代→${b.name}`, score: cpuBenchScore(t, b) }, choices: [{ type: 'move', label: 'わるあがき', score: 0 }], reason: '使用可能PPがないため、技を使える控えへ交代' });
                    }
                    catch (_) { }
                    return { type: 'switch', actor, switchUid: b.uid, ppExhausted: true };
                }
            }
            const tar = foes[0] || null;
            try {
                CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'move', label: 'わるあがき', score: 0 }, choices: [], reason: '使用可能な技のPPがなく、有効な交代先もないため わるあがきを使用' });
            }
            catch (_) { }
            return { type: 'move', actor, moveId: 'struggle', targetUid: tar?.uid || null, forced: true };
        }
        let best = null, bestScore = -1e9;
        const scored = [];
        for (const m of moves) {
            const mode = targetMode(m);
            let targets = legalTargets(actor, m);
            const candidateTargets = ['foe', 'ally', 'ally-or-foe'].includes(mode) ? targets : [null];
            if (!candidateTargets.length)
                candidateTargets.push(null);
            for (const tar of candidateTargets) {
                let score = cpuMoveConditionAdjustment(actor, m, tar);
                if (score <= -1e5)
                    continue;
                if (m.id === 'pollen-puff' && tar?.side === actor.side) {
                    score += (1 - tar.hp / Math.max(1, tar.maxHP)) * 85 + (tar.hp / tar.maxHP < .4 ? 35 : 0);
                }
                else if (m.category !== 'status') {
                    const ts = ['foe', 'ally', 'ally-or-foe'].includes(mode) ? [tar].filter(Boolean) : targets;
                    for (const x of ts) {
                        if (!x)
                            continue;
                        const model = cpuModelTarget(x);
                        let dmg = damageRoll(actor, model, m, isSpread(m, ts), false, true);
                        if (Array.isArray(m.multiHit))
                            dmg *= expectedHits(m);
                        const hit = Math.max(0, Math.min(1, (m.accuracy ?? 100) / 100));
                        score += dmg / model.maxHP * 100 * hit;
                        if (dmg >= model.hp)
                            score += 55 * hit;
                    }
                    if (isSpread(m, ts))
                        score += 8;
                    if (m.recoilRatio)
                        score -= Math.min(24, m.recoilRatio * 42);
                    if (m.recoilMaxHPRatio)
                        score -= Math.min(42, m.recoilMaxHPRatio * 75);
                    if (m.selfFaint || m.selfFaintAfterDamage || m.finalGambit)
                        score -= actor.hp / actor.maxHP > .55 ? 78 : 35;
                    if (m.recharge) {
                        score *= .48;
                        score -= 24;
                    }
                    const instantCharge = ((m.twoTurn === 'solarBeam' && state.field.weather === 'sun') || (m.twoTurn === 'electroShot' && state.field.weather === 'rain') || (activeItem(actor) && actor.item.id === 'power-herb'));
                    if ((m.twoTurn || m.twoTurnWeather) && !instantCharge) {
                        score *= .58;
                        score -= 16;
                    }
                    if (m.priority > 0)
                        score += 8;
                }
                else {
                    if (m.healRatio)
                        score += actor.hp / actor.maxHP < .5 ? 45 : 5;
                    if (m.selfStatChanges)
                        score += 18;
                    if (m.tailwind || m.screen || m.trickRoom)
                        score += 22;
                    if (m.directStatus || m.toxic)
                        score += 15;
                    if (m.protect)
                        score += 10;
                }
                if (t.difficulty === 'normal')
                    score += Math.random() * 35;
                if (t.difficulty === 'strong')
                    score += Math.random() * 12;
                scored.push({ type: 'move', label: `${m.name}${tar ? `→${tar.name}` : ''}`, id: m.id, targetUid: tar?.uid || null, score });
                if (score > bestScore) {
                    bestScore = score;
                    best = { type: 'move', actor, moveId: m.id, targetUid: tar?.uid || null };
                }
            }
        }
        if (t.difficulty !== 'normal' && canSwitch(actor) && bench(t).length) {
            const b = bestBench(t);
            if (b) {
                const th = cpuCombinedThreat(actor), hp = actor.hp / Math.max(1, actor.maxHP), benchScore = cpuBenchScore(t, b), currentScore = bestScore + hp * 28 - th.expected * 95 - th.worst * 55, danger = th.worst >= hp * .82 || th.expected >= hp * .62, margin = t.difficulty === 'very-strong' ? 10 : 24;
                scored.push({ type: 'switch', label: `交代→${b.name}`, uid: b.uid, score: benchScore });
                if ((danger && benchScore > currentScore - 18) || benchScore > currentScore + margin) {
                    try {
                        CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'switch', label: `交代→${b.name}`, score: benchScore }, choices: scored.sort((a, b) => b.score - a.score).slice(0, 10), reason: `推定被ダメージ worst ${(th.worst * 100).toFixed(0)}% / expected ${(th.expected * 100).toFixed(0)}% を踏まえ交代` });
                    }
                    catch (_) { }
                    return { type: 'switch', actor, switchUid: b.uid };
                }
            }
        }
        const chosen = best || { type: 'move', actor, moveId: 'struggle', targetUid: foes[0]?.uid || null }, cm = chosen.moveId === 'struggle' ? STRUGGLE_MOVE : mv(chosen.moveId);
        try {
            CORE()?.replay?.decision?.('format', { turn: state.turn, actor: actor.name, side: actor.side, chosen: { type: 'move', label: cm?.name || chosen.moveId, score: bestScore }, choices: scored.sort((a, b) => b.score - a.score).slice(0, 10), reason: `行動候補の最高評価 ${Number(bestScore).toFixed(1)} を選択` });
        }
        catch (_) { }
        return chosen;
    }
    function replaceFaintsAuto() { let needsHuman = []; for (const t of state.trainers) {
        for (let i = 0; i < t.active.length; i++) {
            const p = t.active[i];
            if (p && p.hp <= 0) {
                const options = bench(t);
                if (!options.length)
                    continue;
                if (t.controller === 'cpu') {
                    const n = bestBench(t);
                    t.active[i] = n;
                    n.position = p.position;
                    withLogSubject(n, () => entry(n));
                    log(`${t.label}は ${n.name}を繰り出した！`);
                }
                else
                    needsHuman.push({ trainer: t, slot: i, old: p, options });
            }
        }
    } return needsHuman; }
    function resolveTurn() { state.phase = 'resolving'; for (const p of allActives()) {
        p.lastDamageAmount = 0;
        p.lastDamageCategory = null;
        p.lastDamageFromSide = null;
    } log(`ターン ${state.turn}`, 'log-turn'); state.resolutionQueue = actionOrder(state.actions); state.resolutionIndex = 0; render(); continueResolveTurn(); }
    function continueResolveTurn() {
        if (!state || state.over)
            return;
        const q = state.resolutionQueue || [];
        while (state.resolutionIndex < q.length) {
            const a = q[state.resolutionIndex++];
            if (!a?.actor || a.actor.hp <= 0 || a.actor.fainted)
                continue;
            const t = trainerById(a.actor.trainerId);
            if (!t?.active?.includes(a.actor))
                continue;
            let pause = false;
            state.currentLogActorUid = a.actor.uid;
            try {
                if (a.type === 'switch') {
                    const n = t.team.find(p => p.uid === a.switchUid);
                    if (canSwitch(a.actor))
                        switchPokemon(t, a.actor, n);
                    else
                        log(`${a.actor.name}は 今は交代できない！`, 'log-system', logMetaFor(a.actor));
                }
                else if (a.type === 'recharge') {
                    a.actor.recharge = false;
                    log(`${a.actor.name}は 反動で動けない！`, 'log-status', logMetaFor(a.actor));
                }
                else if (a.type === 'move') {
                    if (a.actor.flinched) {
                        log(`${a.actor.name}は ひるんで動けない！`, 'log-status', logMetaFor(a.actor));
                        a.actor.flinched = false;
                        continue;
                    }
                    pause = applyMove(a.actor, a.moveId === 'struggle' ? STRUGGLE_MOVE : mv(a.moveId), a.targetUid ? allPokemon().find(p => p.uid === a.targetUid) : null) === 'pivot-pending';
                }
            }
            finally {
                state.currentLogActorUid = null;
            }
            if (checkWinner()) {
                finishBattle();
                return;
            }
            if (pause) {
                promptPivotChoice();
                return;
            }
        }
        state.resolutionQueue = [];
        state.resolutionIndex = 0;
        if (!checkWinner()) {
            for (const p of [...allActives()].sort((a, b) => effectiveSpeed(b) - effectiveSpeed(a)))
                withLogSubject(p, () => applyResidual(p));
            tickField();
        }
        if (checkWinner()) {
            finishBattle();
            return;
        }
        const needs = replaceFaintsAuto();
        if (checkWinner()) {
            finishBattle();
            return;
        }
        if (needs.length) {
            state.replacements = needs;
            state.replacementIndex = 0;
            promptReplacement();
            return;
        }
        state.turn++;
        startCommandPhase();
    }
    function promptPivotChoice() { const r = state.pendingPivot; if (!r) {
        continueResolveTurn();
        return;
    } state.phase = 'pivot'; state.currentHuman = r.trainer.id; render(); cmd.replaceChildren(); const h = document.createElement('h3'); h.textContent = `${r.trainer.label}：${r.actor.name}の交代先を選択`; cmd.appendChild(h); const g = document.createElement('div'); g.className = 'switch-grid'; for (const p of bench(r.trainer)) {
        const b = document.createElement('button');
        b.className = 'switch-button';
        b.textContent = `${p.name} HP ${percent(p)}%`;
        b.onclick = () => { if (!switchPokemon(r.trainer, r.actor, p))
            return; state.pendingPivot = null; continueResolveTurn(); };
        g.appendChild(b);
    } cmd.appendChild(g); }
    function allPokemon() { return state.trainers.flatMap(t => t.team); }
    function checkWinner() { const a = aliveSide('A'), b = aliveSide('B'); state.winner = a && !b ? 'A' : b && !a ? 'B' : !a && !b ? 'draw' : null; return !!state.winner; }
    function finishBattle() { state.over = true; state.phase = 'over'; clearTimeout(autoplayTimer); autoplayTimer = null; log(state.winner === 'draw' ? '勝負は引き分け！' : `${state.winner === 'A' ? 'Aチーム' : 'Bチーム'}の勝利！`); try {
        CORE()?.replay?.finish?.({ format: state.format?.id, winner: state.winner, turn: state.turn });
    }
    catch (_) { } render(); }
    function promptReplacement() { const r = state.replacements[state.replacementIndex]; if (!r) {
        state.replacements = [];
        state.turn++;
        startCommandPhase();
        return;
    } state.phase = 'replacement'; state.currentHuman = r.trainer.id; render(); cmd.innerHTML = ''; const h = document.createElement('h3'); h.textContent = `${r.trainer.label}：${r.old.name}の交代先を選択`; cmd.appendChild(h); const g = document.createElement('div'); g.className = 'switch-grid'; for (const p of r.options.filter(x => !r.trainer.active.includes(x))) {
        const b = document.createElement('button');
        b.className = 'switch-button';
        b.textContent = `${p.name} HP ${percent(p)}%`;
        b.onclick = () => { r.trainer.active[r.slot] = p; p.position = r.old.position; withLogSubject(p, () => entry(p)); log(`${r.trainer.label}は ${p.name}を繰り出した！`); state.replacementIndex++; promptReplacement(); };
        g.appendChild(b);
    } cmd.appendChild(g); }
    function actorList() { return state.trainers.flatMap(t => t.active.filter(p => p.hp > 0).map(p => ({ trainer: t, p }))); }
    function startCommandPhase() { if (state.over)
        return; for (const p of allActives())
        p.hasActedThisTurn = false; state.phase = 'command'; state.actions = []; state.redirector = { A: null, B: null }; state.quickGuard = { A: false, B: false }; state.humanQueue = []; for (const { trainer: t, p } of actorList()) {
        if (p.recharge) {
            state.actions.push({ type: 'recharge', actor: p, forced: true });
            continue;
        }
        if (p.charging?.moveId) {
            state.actions.push({ type: 'move', actor: p, moveId: p.charging.moveId, targetUid: p.charging.targetUid || null, forced: true });
            continue;
        }
        if (p.rampageMoveId) {
            const m = mv(p.rampageMoveId);
            state.actions.push({ type: 'move', actor: p, moveId: p.rampageMoveId, targetUid: legalTargets(p, m)[0]?.uid || null, forced: true });
            continue;
        }
        if (t.controller === 'cpu')
            state.actions.push(cpuChoose(p, t));
        else
            state.humanQueue.push({ trainer: t, p });
    } state.humanIndex = 0; if (!state.humanQueue.length) {
        render();
        scheduleAutoplay();
        return;
    } promptHumanAction(); }
    function promptHumanAction() { const q = state.humanQueue[state.humanIndex]; if (!q) {
        resolveTurn();
        return;
    } state.currentHuman = q.trainer.id; render(); cmd.innerHTML = ''; const title = document.createElement('h3'); title.textContent = `${q.trainer.label}：${q.p.name} の行動`; cmd.appendChild(title); const mg = document.createElement('div'); mg.className = 'move-grid'; const usable = usableMovesFor(q.p), displayMoves = usable.length ? q.p.moves : [STRUGGLE_MOVE]; for (const m of displayMoves) {
        const b = document.createElement('button');
        b.className = 'move-button';
        b.disabled = !m.struggle && (m.pp <= 0 || (q.p.choiceLock && q.p.choiceLock !== m.id) || (activeItem(q.p) && q.p.item.id==='assault-vest' && m.category==='status') || ((q.p.tauntTurns||0)>0 && m.category==='status') || ((q.p.encoreTurns||0)>0 && q.p.encoreMoveId && m.id!==q.p.encoreMoveId));
        b.innerHTML = `<strong>${m.name}</strong><span>${m.type} / ${m.category === 'physical' ? '物理' : m.category === 'special' ? '特殊' : '変化'} / ${m.struggle ? 'PP ∞' : `PP ${m.pp}`}</span>`;
        b.onclick = () => chooseHumanMove(q, m);
        mg.appendChild(b);
    } cmd.appendChild(mg); const bg = document.createElement('div'); bg.className = 'switch-grid'; if (canSwitch(q.p)) {
        for (const p of bench(q.trainer)) {
            const b = document.createElement('button');
            b.className = 'switch-button';
            b.textContent = `交代：${p.name} (${percent(p)}%)`;
            b.onclick = () => acceptHumanAction({ type: 'switch', actor: q.p, switchUid: p.uid });
            bg.appendChild(b);
        }
    }
    else if (bench(q.trainer).length) {
        const n = document.createElement('div');
        n.className = 'locked-action-note';
        n.textContent = q.p.charging?.moveId ? '溜め技の実行中は交代できません。' : q.p.rampageMoveId ? 'あばれ状態の間は交代できません。' : '現在は交代できません。';
        bg.appendChild(n);
    } cmd.appendChild(bg); }
    function chooseHumanMove(q, m) { let targets = legalTargets(q.p, m); const mode = targetMode(m); if (!['foe', 'ally', 'ally-or-foe'].includes(mode)) {
        acceptHumanAction({ type: 'move', actor: q.p, moveId: m.id, targetUid: null });
        return;
    } cmd.innerHTML = ''; const h = document.createElement('h3'); h.textContent = `${m.name} の対象を選択`; cmd.appendChild(h); const g = document.createElement('div'); g.className = 'switch-grid'; for (const p of targets) {
        const b = document.createElement('button');
        b.className = 'switch-button';
        b.textContent = targetLabel(p);
        b.onclick = () => acceptHumanAction({ type: 'move', actor: q.p, moveId: m.id, targetUid: p.uid });
        g.appendChild(b);
    } cmd.appendChild(g); }
    function acceptHumanAction(a) { state.actions.push(a); state.humanIndex++; const next = state.humanQueue[state.humanIndex]; if (next && next.trainer.id !== state.currentHuman) {
        cmd.innerHTML = '';
        const p = document.createElement('div');
        p.className = 'pass-card';
        p.innerHTML = `<h3>端末を ${next.trainer.label} に渡してください</h3><p>前の参加者の入力は確定しました。</p>`;
        const b = document.createElement('button');
        b.className = 'primary-button';
        b.textContent = '続ける';
        b.onclick = promptHumanAction;
        p.appendChild(b);
        cmd.appendChild(p);
        state.currentHuman = null;
        renderOperator();
        return;
    } promptHumanAction(); }
    function scheduleAutoplay(force = false) { if (state.over || state.humanQueue.length)
        return; clearTimeout(autoplayTimer); if (state.autoplayPaused && !force) {
        render();
        return;
    } const ms = Number($('format-autoplay-speed')?.value || 650); autoplayTimer = setTimeout(() => resolveTurn(), force ? 20 : ms); }
    function renderOperator() { const el = $('format-operator-banner'); if (!el || !state)
        return; el.textContent = state.over ? '対戦終了' : state.currentHuman ? `操作中：${trainerById(state.currentHuman)?.label || state.currentHuman}` : state.phase === 'resolving' ? '行動解決中' : state.trainers.every(t => t.controller === 'cpu') ? (state.autoplayPaused ? 'CPU対戦：一時停止' : 'CPU対戦：自動進行中') : '入力待ち'; }
    function escHtml(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function natureDescription(name) { const n = NATURES[name] || NATURES['まじめ'], labels = { attack: 'A', defense: 'B', specialAttack: 'C', specialDefense: 'D', speed: 'S' }; return !n?.up || !n?.down ? '補正なし' : `${labels[n.up] || n.up}↑ / ${labels[n.down] || n.down}↓`; }
    function setPointTotal(set) { return Object.values(set?.statPoints || {}).reduce((a, b) => a + (Number(b) || 0), 0); }
    function setStatSnapshot(set) { const s = sp(set.speciesId), pts = set.statPoints || {}, nat = set.nature || 'まじめ'; return { hp: hpValue(s.baseStats.hp, pts.hp), attack: statValue(s.baseStats.attack, pts.attack, nat, 'attack'), defense: statValue(s.baseStats.defense, pts.defense, nat, 'defense'), specialAttack: statValue(s.baseStats.specialAttack, pts.specialAttack, nat, 'specialAttack'), specialDefense: statValue(s.baseStats.specialDefense, pts.specialDefense, nat, 'specialDefense'), speed: statValue(s.baseStats.speed, pts.speed, nat, 'speed') }; }
    function setCardDetailHtml(set, publicOnly = false) { const s = sp(set.speciesId); if (!s)
        return ''; if (publicOnly)
        return `<div class="preview-name">${escHtml(s.name)}</div><div class="preview-meta">${escHtml(s.types.join(' / '))}</div><div class="set-public-note">技・特性・持ち物・実数値は非公開</div>`; const stats = setStatSnapshot(set), ability = s.abilities.find(a => a.id === set.abilityId)?.name || '-', it = item(set.itemId)?.name || 'なし'; const moves = (set.moves || []).map(id => `<button type="button" class="format-set-move" data-format-move-detail="${escHtml(id)}">${escHtml(mv(id)?.name || id)}</button>`).join(''); return `<div class="preview-name">${escHtml(s.name)}</div><div class="preview-meta">${escHtml(s.types.join(' / '))}<br>特性 ${escHtml(ability)}　持ち物 ${escHtml(it)}<br>性格 ${escHtml(set.nature || 'まじめ')}（${escHtml(natureDescription(set.nature || 'まじめ'))}）　能力P ${setPointTotal(set)}/66</div><div class="set-stat-line">H${stats.hp} / A${stats.attack} / B${stats.defense} / C${stats.specialAttack} / D${stats.specialDefense} / S${stats.speed}</div><div class="set-move-list">${moves}</div>`; }
    function bindSetMoveDetails(root) { root?.querySelectorAll?.('[data-format-move-detail]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); window.showMoveDetail?.(b.dataset.formatMoveDetail); })); }
    function formatViewLabel(viewer) { if (viewer === 'god')
        return '神視点'; if (viewer === 'spectator')
        return '観戦視点'; if (viewer === 'A' || viewer === 'B')
        return `${viewer}チーム視点`; return trainerById(viewer)?.label ? `${trainerById(viewer).label}視点` : String(viewer || '公開視点'); }
    function formatStatusText(p) { const a = []; if (p.status)
        a.push(D.STATUS_NAMES?.[p.status] || p.status); if ((p.confusedTurns || 0) > 0)
        a.push('こんらん'); if ((p.tauntTurns || 0) > 0)
        a.push(`ちょうはつ${p.tauntTurns}`); if ((p.encoreTurns || 0) > 0)
        a.push(`アンコール${p.encoreTurns}`); if ((p.disableTurns || 0) > 0)
        a.push(`かなしばり${p.disableTurns}`); if ((p.recoveryBlockTurns || 0) > 0)
        a.push(`かいふくふうじ${p.recoveryBlockTurns}`); if ((p.substituteHP || 0) > 0)
        a.push('みがわり'); if (p.seeded)
        a.push('やどりぎ'); if (p.aquaRing)
        a.push('アクアリング'); if (p.ingrain)
        a.push('ねをはる'); return a.length ? a.join(' / ') : 'なし'; }
    function formatStagesText(p) { const names = { attack: 'A', defense: 'B', specialAttack: 'C', specialDefense: 'D', speed: 'S', accuracy: '命中', evasion: '回避' }, a = []; for (const [k, label] of Object.entries(names)) {
        const n = p.stages?.[k] || 0;
        if (n)
            a.push(`${label}${n > 0 ? '+' : ''}${n}`);
    } return a.length ? a.join(' / ') : '変化なし'; }
    function formatPublicPokemonText(p, viewer) { const priv = viewerOwnsSide(viewer, p.side), known = priv || p.seen; if (!known)
        return null; const hp = priv ? `${p.hp}/${p.maxHP}` : `${percent(p)}%`, ability = priv ? p.ability.name : (p.abilityRevealed ? p.ability.name : '未判明'), it = priv ? (p.itemConsumed ? '消費済み' : p.item.name) : (p.itemRevealed ? (p.itemConsumed ? '消費済み' : p.item.name) : '未判明'), moves = priv ? p.moves.map(m => `${m.name}(${m.pp}/${m.maxPP})`).join(' / ') : (p.knownMoves?.size ? [...p.knownMoves].map(id => mv(id)?.name || id).join(' / ') : 'まだなし'), stats = priv ? `H${p.maxHP} A${p.attack} B${p.defense} C${p.specialAttack} D${p.specialDefense} S${p.speed}` : '非公開'; return `${p.name} [${p.types.join('/')}] HP ${hp}\n状態: ${formatStatusText(p)} / ランク: ${formatStagesText(p)}\n特性: ${ability} / 持ち物: ${it}\n実数値: ${stats}\n${priv ? '技' : '公開済み技'}: ${moves}`; }
    function previewTrainersForViewer(viewer) { if (viewer === 'god' || viewer === 'spectator')
        return state.trainers; if (viewer === 'A' || viewer === 'B')
        return state.trainers.filter(t => t.side !== viewer); const vt = trainerById(viewer); return vt ? state.trainers.filter(t => t.side !== vt.side) : state.trainers; }
    function openFormatTeamPreview() { if (!state)
        return; const modal = $('team-preview-modal'), body = $('team-preview-body'), title = $('team-preview-title'), note = $('team-preview-note'); if (!modal || !body)
        return; const full = state.view === 'god', trainers = previewTrainersForViewer(state.view); body.replaceChildren(); for (const t of trainers) {
        const sec = document.createElement('section');
        sec.className = 'team-preview-section';
        const h = document.createElement('h3');
        h.textContent = `${t.label}の6匹`;
        sec.appendChild(h);
        const grid = document.createElement('div');
        grid.className = 'team-preview-grid';
        t.roster.forEach((set, i) => { const c = document.createElement('div'); c.className = 'preview-card'; const no = document.createElement('span'); no.className = 'team-preview-number'; no.textContent = String(i + 1); c.appendChild(no); c.insertAdjacentHTML('beforeend', setCardDetailHtml(set, !full)); grid.appendChild(c); });
        sec.appendChild(grid);
        body.appendChild(sec);
    } if (full)
        bindSetMoveDetails(body); if (title)
        title.textContent = full ? '見せ合い（神視点・完全情報）' : trainers.length > 1 ? '見せ合い' : '相手の見せ合い'; if (note)
        note.textContent = full ? '神視点：全参加者の技・特性・持ち物・実数値を表示します。選出内容・選出順は表示しません。' : '見せ合い時に公開された情報だけを表示します。相手の技・特性・持ち物・実数値・選出内容は表示しません。'; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); }
    function openFormatBenchStatus() { if (!state)
        return; const modal = $('bench-status-modal'), body = $('bench-status-body'), title = $('bench-status-title'), note = $('bench-status-note'); if (!modal || !body)
        return; body.replaceChildren(); for (const side of ['A', 'B']) {
        const sideSec = document.createElement('section');
        sideSec.className = 'bench-status-section';
        const sh = document.createElement('h3');
        sh.textContent = `${side}チームの控え`;
        sideSec.appendChild(sh);
        const list = document.createElement('div');
        list.className = 'bench-status-list';
        for (const t of sideTrainers(side)) {
            const th = document.createElement('div');
            th.className = 'format-bench-trainer-heading';
            th.textContent = t.label;
            list.appendChild(th);
            const bs = t.team.filter(p => !t.active.includes(p));
            if (!bs.length) {
                const e = document.createElement('div');
                e.className = 'bench-status-empty';
                e.textContent = '控えはいません。';
                list.appendChild(e);
                continue;
            }
            bs.forEach((p, i) => { const priv = viewerOwnsSide(state.view, p.side), known = priv || p.seen, card = document.createElement('article'); card.className = `bench-status-card${p.hp <= 0 ? ' fainted' : ''}${known ? '' : ' unknown'}`; const h = document.createElement('h4'); if (!known) {
                h.textContent = `控え${i + 1}: ???（未登場）`;
                card.appendChild(h);
            }
            else {
                h.textContent = `${p.name}${p.hp <= 0 ? '（ひんし）' : ''}`;
                card.appendChild(h);
                const pre = document.createElement('pre');
                pre.textContent = formatPublicPokemonText(p, state.view);
                card.appendChild(pre);
            } list.appendChild(card); });
        }
        sideSec.appendChild(list);
        body.appendChild(sideSec);
    } if (title)
        title.textContent = `控え状態（${formatViewLabel(state.view)}）`; if (note)
        note.textContent = state.view === 'god' ? '神視点：両チームの完全情報を表示しています。' : '現在の視点で公開されている情報だけを表示します。自チームの控えは完全情報、相手の未登場控えは ???、登場済み控えはHP%と公開済み情報を表示します。'; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); }
    function renderPokemonCard(p, viewer, enemy) { const privateInfo = viewer === 'god' || (!enemy && viewer !== 'spectator'); const hpText = privateInfo ? `${p.hp}/${p.maxHP}` : `${percent(p)}%`; const stage = Object.entries(p.stages).filter(([, v]) => v).map(([k, v]) => `${k[0].toUpperCase()}${v > 0 ? '+' : ''}${v}`).join(' ') || '変化なし'; const publicBits = []; if (p.abilityRevealed)
        publicBits.push(`特性:${p.ability.name}`); if (p.itemRevealed)
        publicBits.push(`持ち物:${p.itemConsumed ? 'なし' : p.item.name}`); const info = privateInfo ? `特性:${p.ability.name} / 持ち物:${activeItem(p) ? p.item.name : 'なし'} / ${stage}` : [stage, ...publicBits].join(' / '); return `<article class="format-pokemon-card ${p.hp <= 0 ? 'fainted' : ''}"><div class="pokemon-header"><div><h3>${p.name}</h3><span class="type-text">${p.types.join(' / ')}</span></div><span>${p.status ? D.STATUS_NAMES?.[p.status] || p.status : ''}</span></div><div class="hp-area"><div class="hp-label"><span>HP</span><span>${hpText}</span></div><div class="hp-bar"><div class="hp-fill" style="width:${percent(p)}%"></div></div></div><div class="format-small">${info}</div></article>`; }
    function renderBoard() { if (!state || !board)
        return; const viewer = state.view; const makeSide = side => { const wrap = document.createElement('section'); wrap.className = `format-side format-side-${side}`; const h = document.createElement('h3'); h.textContent = `${side === 'A' ? 'A' : 'B'}チーム`; wrap.appendChild(h); const grid = document.createElement('div'); grid.className = `format-active-grid format-active-${state.format.active}`; for (const { trainer: t, p } of sideSlotEntries(side)) {
        const own = viewer === 'god' || viewer === t.id || (viewer === 'A' && side === 'A') || (viewer === 'B' && side === 'B') || (trainerById(viewer)?.side === side);
        const div = document.createElement('div');
        div.className = 'format-slot';
        const lab = document.createElement('div');
        lab.className = 'format-trainer-label';
        lab.textContent = t.label;
        div.appendChild(lab);
        div.insertAdjacentHTML('beforeend', renderPokemonCard(p, viewer, !own));
        grid.appendChild(div);
    } wrap.appendChild(grid); const benchEl = document.createElement('div'); benchEl.className = 'format-bench-line'; benchEl.textContent = '控え：' + sideTrainers(side).flatMap(t => bench(t).map(p => { const own = viewer === 'god' || viewer === t.id || (viewer === 'A' && side === 'A') || (viewer === 'B' && side === 'B') || (viewer && trainerById(viewer)?.side === side); if (own)
        return `${t.label}:${p.name} ${p.hp}/${p.maxHP}`; if (!p.seen)
        return `${t.label}:???`; return `${t.label}:${p.name} ${percent(p)}%`; })).join(' / '); wrap.appendChild(benchEl); return wrap; }; board.replaceChildren(makeSide('B'), makeSide('A')); }
    function viewerOwnsSide(viewer, side) { if (viewer === 'god')
        return true; if (viewer === 'A' || viewer === 'B')
        return viewer === side; return trainerById(viewer)?.side === side; }
    function formatPokemonContext(p, viewer) { const priv = viewerOwnsSide(viewer, p.side); if (!priv && !p.seen)
        return '???'; const hp = priv ? `${p.hp}/${p.maxHP}` : `${percent(p)}%`, bits = [`${p.name} HP ${hp}`]; if (p.status)
        bits.push(`状態:${D.STATUS_NAMES?.[p.status] || p.status}`); const stages = Object.entries(p.stages).filter(([, v]) => v).map(([k, v]) => `${k}:${v > 0 ? '+' : ''}${v}`); if (stages.length)
        bits.push(`ランク:${stages.join(',')}`); if (priv) {
        bits.push(`特性:${p.ability.name}`, `持ち物:${p.itemConsumed ? '消費済み' : p.item.name}`, `技:${p.moves.map(m => `${m.name}(${m.pp}/${m.maxPP})`).join('/')}`);
    }
    else {
        if (p.abilityRevealed)
            bits.push(`特性:${p.ability.name}`);
        if (p.itemRevealed)
            bits.push(`持ち物:${p.itemConsumed ? '消費済み' : p.item.name}`);
        if (p.knownMoves.size)
            bits.push(`公開技:${[...p.knownMoves].map(id => mv(id)?.name || id).join('/')}`);
    } return bits.join(' / '); }
    function formatBattleContext(viewer = state?.view) { if (!state)
        return ''; const lines = [`【ニワラバトル v${window.NIWARA_APP?.version || ''} ${state.format.name} 状況＋ログ】`, `ターン ${state.turn} / 視点 ${viewer}`, `天候:${state.field.weather || 'なし'} / フィールド:${state.field.terrain || 'なし'} / トリックルーム:${state.field.trickRoom > 0 ? 'あり' : 'なし'}`]; for (const side of ['A', 'B']) {
        lines.push('', `■ ${side}チーム`);
        for (const t of sideTrainers(side)) {
            lines.push(`[${t.label}]`);
            for (const p of t.active.filter(Boolean))
                lines.push(`場: ${formatPokemonContext(p, viewer)}`);
            const bs = bench(t);
            if (bs.length)
                lines.push(`控え: ${bs.map(p => formatPokemonContext(p, viewer)).join(' | ')}`);
        }
    } lines.push('', '■ ログ', ...state.logs.map(x => `[${x.turn}] ${formatLogText(x, viewer)}`)); return lines.join('\n'); }
    function hasPrivateLogInfo(viewer, meta) { if (!meta)
        return false; if (viewer === 'god')
        return true; if (viewer === 'A' || viewer === 'B')
        return meta.targetSide === viewer; const t = trainerById(viewer); return !!t && t.side === meta.targetSide; }
    function formatLogText(e, viewer = state?.view) { const m = e.meta; if (!m?.hpChange)
        return e.text; const exact = hasPrivateLogInfo(viewer, m), amount = exact ? String(m.amount) : `${Math.max(0, Math.round((m.amount / Math.max(1, m.maxHP)) * 1000) / 10)}%`; return m.hpChange === 'cost' ? `${m.name}は HPを ${amount} 失った！` : m.hpChange === 'heal' ? `${m.name}は ${amount} HP ${m.reason || '回復'}した！` : `${m.name}は ${amount} ${m.reason || 'ダメージ'}！`; }
    function renderLog() { if (!logEl || !state)
        return; logEl.innerHTML = ''; for (const e of state.logs.slice(-120)) {
        const d = document.createElement('div');
        d.className = `log-line ${e.kind || ''}`;
        d.textContent = `[${e.turn}] ${formatLogText(e, state.view)}`;
        logEl.appendChild(d);
    } logEl.scrollTop = logEl.scrollHeight; }
    function renderViews() { const v = $('format-view-buttons'); if (!v || !state)
        return; v.replaceChildren(); const opts = []; for (const t of state.trainers.filter(t => t.human))
        opts.push([t.id, `${t.label}視点`]); if (!opts.some(x => x[0] === 'A'))
        opts.push(['A', 'Aチーム視点']); if (!opts.some(x => x[0] === 'B'))
        opts.push(['B', 'Bチーム視点']); opts.push(['spectator', '観戦'], ['god', '神視点']); for (const [id, label] of opts) {
        const b = document.createElement('button');
        b.className = 'ghost-button';
        b.dataset.active = state.view === id ? 'true' : 'false';
        b.textContent = label;
        b.onclick = () => { state.view = id; render(); };
        v.appendChild(b);
    } }
    function render() { if (!state)
        return; screen.classList.remove('hidden'); $('format-battle-title').textContent = `${state.format.name}バトル`; $('format-name-text').textContent = state.format.name; $('format-turn-text').textContent = String(state.turn); $('format-weather-text').textContent = state.field.weather ? D.WEATHER_NAMES?.[state.field.weather] || state.field.weather : 'なし'; $('format-terrain-text').textContent = state.field.terrain || 'なし'; $('format-room-text').textContent = state.field.trickRoom > 0 ? 'トリックルーム' : 'なし'; renderOperator(); renderViews(); renderBoard(); renderLog(); const auto = state.trainers.every(t => t.controller === 'cpu'); $('format-autoplay-controls')?.classList.toggle('hidden', !auto); if (auto) {
        $('format-autoplay-status').textContent = state.autoplayPaused ? '一時停止' : '自動進行中';
        $('format-autoplay-toggle').textContent = state.autoplayPaused ? '再開' : '一時停止';
    } if (state.over)
        cmd.innerHTML = `<div class="notice"><strong>${state.winner === 'draw' ? '引き分け' : `${state.winner}チームの勝利`}</strong></div>`; }
    function baseField() { return { weather: null, weatherTurns: 0, terrain: null, terrainTurns: 0, trickRoom: 0, magicRoom: 0, tailwind: { A: 0, B: 0 }, screens: { A: { reflect: 0, lightScreen: 0 }, B: { reflect: 0, lightScreen: 0 } }, hazards: { A: { stealthRock: false, spikes: 0, stickyWeb: false, toxicSpikes: 0 }, B: { stealthRock: false, spikes: 0, stickyWeb: false, toxicSpikes: 0 } } }; }
    function setupBattle(format, participants) { screen.classList.remove('format-selection-mode'); $('format-battle-exit').textContent = '対戦を終了'; $('format-command-area')?.querySelector('h2')?.replaceChildren(document.createTextNode('コマンド')); $('format-battle-subtitle').textContent = 'ダブル・トリプル・6vs6・タッグ用のバトル画面です。'; state = { format, trainers: participants, field: baseField(), turn: 1, logs: [], actions: [], humanQueue: [], humanIndex: 0, currentHuman: null, phase: 'start', over: false, winner: null, view: participants.find(t => t.human)?.id || 'spectator', autoplayPaused: false, replacements: [], redirector: { A: null, B: null }, quickGuard: { A: false, B: false }, currentLogActorUid: null }; try {
        CORE()?.replay?.start?.('format', { format: format.id, trainers: participants.map(t => ({ id: t.id, label: t.label, side: t.side, controller: t.controller, team: t.team.map(p => p.name) })) });
    }
    catch (_) { } for (const t of participants)
        activateInitial(t); log(`${format.name}バトルを開始！`); showFormatScreen(); startCommandPhase(); }
    function showFormatScreen() { document.querySelectorAll('section.screen').forEach(s => s.classList.add('hidden')); screen.classList.remove('hidden'); window.scrollTo?.({ top: 0 }); render(); }
    function leaveFormat() { clearTimeout(autoplayTimer); autoplayTimer = null; state = null; selectionSession = null; screen.classList.remove('format-selection-mode'); document.querySelectorAll('section.screen').forEach(s => s.classList.add('hidden')); $('mode-screen')?.classList.remove('hidden'); $('format-battle-exit').textContent = '対戦を終了'; window.scrollTo?.({ top: 0 }); }
    function buildParticipants(format, mode, selectionMap, configs) { const arr = []; for (const c of configs) {
        arr.push(trainer(c.id, c.side, c.label, c.controller, c.difficulty, c.roster, selectionMap[c.id]));
    } return arr; }
    function showSelection(format, mode, configs) { selectionSession = { format, mode, configs, map: {}, humanOrder: configs.filter(c => c.controller === 'human').map(c => c.id), idx: 0 }; for (const c of configs)
        if (c.controller === 'cpu')
            selectionSession.map[c.id] = cpuSelect(c.roster, format.select, c.difficulty, configs.filter(x => x.side !== c.side).flatMap(x => x.roster || [])); state = null; screen.classList.add('format-selection-mode'); showFormatScreen(); renderSelectionStep(); }
    function renderSelectionRosterPanel(titleText, configs, publicOnly) { if (!configs.length)
        return null; const panel = document.createElement('section'); panel.className = `preview-panel ${publicOnly ? 'format-selection-opponents' : 'format-selection-allies'}`; const h = document.createElement('div'); h.className = 'preview-title-row'; const title = document.createElement('h3'); title.textContent = titleText; h.appendChild(title); panel.appendChild(h); for (const oc of configs) {
        const group = document.createElement('div');
        group.className = 'format-selection-roster-group';
        if (configs.length > 1 || selectionSession?.format?.id === 'tag') {
            const label = document.createElement('strong');
            label.className = 'format-selection-trainer-name';
            label.textContent = oc.label;
            group.appendChild(label);
        }
        const grid = document.createElement('div');
        grid.className = 'preview-grid readonly';
        for (const set of oc.roster) {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = setCardDetailHtml(set, publicOnly);
            grid.appendChild(card);
        }
        group.appendChild(grid);
        panel.appendChild(group);
    } if (!publicOnly)
        bindSetMoveDetails(panel); return panel; }
    function renderSelectionPreview(ss, c) { board.replaceChildren(); const opponents = ss.configs.filter(x => x.side !== c.side), allies = ss.configs.filter(x => x.side === c.side && x.id !== c.id); const op = renderSelectionRosterPanel(ss.format.id === 'tag' ? '相手チームの見せ合い' : '相手の6匹', opponents, true); if (op)
        board.appendChild(op); if (allies.length) {
        const ally = renderSelectionRosterPanel('味方の見せ合い', allies, false);
        if (ally)
            board.appendChild(ally);
    } }
    function renderSelectionStep() {
        const ss = selectionSession;
        if (!ss)
            return;
        const id = ss.humanOrder[ss.idx];
        if (!id) {
            const parts = buildParticipants(ss.format, ss.mode, ss.map, ss.configs);
            selectionSession = null;
            setupBattle(ss.format, parts);
            return;
        }
        const c = ss.configs.find(x => x.id === id);
        state = { format: ss.format, trainers: [], field: baseField(), turn: 0, logs: [], view: id, phase: 'selection', currentHuman: id, over: false };
        screen.classList.add('format-selection-mode');
        $('format-battle-exit').textContent = '対戦設定へ戻る';
        $('format-battle-title').textContent = `${ss.format.name}：選出`;
        $('format-battle-subtitle').textContent = `${c.label}：6匹から${ss.format.select}匹を順番に選択。最初の${ss.format.id === 'tag' ? 1 : ss.format.active}匹が先発です。`;
        $('format-command-area')?.querySelector('h2')?.replaceChildren(document.createTextNode(`${c.label}の選出`));
        const op = $('format-operator-banner');
        if (op) {
            op.textContent = `選出操作中：${c.label}`;
            op.dataset.state = 'A';
        }
        renderSelectionPreview(ss, c);
        cmd.replaceChildren();
        const sel = ss.map[id] || [];
        const top = document.createElement('div');
        top.className = 'format-selection-summary';
        const count = document.createElement('strong');
        count.className = 'selection-count';
        count.textContent = `${sel.length} / ${ss.format.select}`;
        const note = document.createElement('span');
        note.className = 'view-note';
        note.textContent = sel.length ? `選出順：${sel.map((ri, i) => `${i + 1}.${sp(c.roster[ri].speciesId).name}`).join(' → ')}` : 'カードを選ぶと選出順が付きます。';
        top.append(count, note);
        cmd.appendChild(top);
        const ownTitle = document.createElement('h3');
        ownTitle.className = 'format-selection-own-title';
        ownTitle.textContent = `${c.label}の6匹（完全情報）`;
        cmd.appendChild(ownTitle);
        const grid = document.createElement('div');
        grid.className = 'preview-grid selectable format-selection-own-grid';
        c.roster.forEach((set, i) => { const card = document.createElement('div'); card.className = 'preview-card'; card.tabIndex = 0; card.setAttribute('role', 'button'); const n = sel.indexOf(i); if (n >= 0)
            card.classList.add('selected'); card.setAttribute('aria-pressed', n >= 0 ? 'true' : 'false'); const order = document.createElement('div'); order.className = 'format-selection-order'; order.textContent = n >= 0 ? `選出 ${n + 1}番` : '未選出'; card.appendChild(order); card.insertAdjacentHTML('beforeend', setCardDetailHtml(set, false)); const toggle = () => { const cur = ss.map[id] || []; const at = cur.indexOf(i); if (at >= 0)
            cur.splice(at, 1);
        else if (cur.length < ss.format.select)
            cur.push(i); ss.map[id] = cur; renderSelectionStep(); }; card.addEventListener('click', e => { if (e.target.closest('[data-format-move-detail]'))
            return; toggle(); }); card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-format-move-detail]')) {
            e.preventDefault();
            toggle();
        } }); grid.appendChild(card); });
        cmd.appendChild(grid);
        bindSetMoveDetails(grid);
        const actions = document.createElement('div');
        actions.className = 'bottom-action-bar format-selection-actions';
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'ghost-button';
        clear.textContent = '選出をやり直す';
        clear.disabled = !sel.length;
        clear.onclick = () => { ss.map[id] = []; renderSelectionStep(); };
        const ok = document.createElement('button');
        ok.type = 'button';
        ok.className = 'primary-button';
        ok.disabled = sel.length !== ss.format.select;
        ok.textContent = 'この選出で確定';
        ok.onclick = () => { ss.idx++; if (ss.idx < ss.humanOrder.length) {
            cmd.replaceChildren();
            board.replaceChildren();
            const pass = document.createElement('div');
            pass.className = 'pass-card';
            const hh = document.createElement('h3');
            hh.textContent = '端末を次のプレイヤーへ渡してください';
            const pp = document.createElement('p');
            pp.textContent = `${c.label}の選出を確定しました。選出内容が見えない状態にしてから続けてください。`;
            const nx = document.createElement('button');
            nx.className = 'primary-button';
            nx.type = 'button';
            nx.textContent = '続ける';
            nx.onclick = renderSelectionStep;
            pass.append(hh, pp, nx);
            cmd.appendChild(pass);
            if (op) {
                op.textContent = '端末受け渡し中';
                op.dataset.state = 'view';
            }
        }
        else
            renderSelectionStep(); };
        actions.append(clear, ok);
        cmd.appendChild(actions);
    }
    function nonTagConfigs(mode) { const aSource = $('player-a-party-source')?.value || 'current', bSource = $('player-b-party-source')?.value || 'random'; return [{ id: 'A1', side: 'A', label: mode === 'cpu-cpu' ? 'CPU A' : 'プレイヤーA', controller: mode === 'cpu-cpu' ? 'cpu' : 'human', difficulty: $('cpu-difficulty-a-select')?.value || 'very-strong', roster: resolveSource(aSource) }, { id: 'B1', side: 'B', label: mode === 'pvp' ? 'プレイヤーB' : 'CPU B', controller: mode === 'pvp' ? 'human' : 'cpu', difficulty: $('cpu-difficulty-b-select')?.value || 'very-strong', roster: resolveSource(bSource) }]; }
    function renderTagConfig() {
        const host = $('tag-participant-config');
        if (!host)
            return;
        const tag = fmtSelect.value === 'tag';
        host.classList.toggle('hidden', !tag);
        if (!tag)
            return;
        const prev = {};
        for (const id of ['A1', 'A2', 'B1', 'B2'])
            prev[id] = { controller: document.querySelector(`[data-tag-controller="${id}"]`)?.value, source: document.querySelector(`[data-tag-source="${id}"]`)?.value, diff: document.querySelector(`[data-tag-diff="${id}"]`)?.value };
        host.replaceChildren();
        const h = document.createElement('h3');
        h.textContent = 'タッグ参加者（A1＋A2 vs B1＋B2）';
        host.appendChild(h);
        const note = document.createElement('p');
        note.className = 'view-note';
        note.textContent = '4人それぞれを人間/CPUから自由に選べます。各参加者は6匹から3匹を選び、1匹ずつ場に出します。';
        host.appendChild(note);
        const grid = document.createElement('div');
        grid.className = 'tag-config-grid';
        host.appendChild(grid);
        const sources = sourceOptions();
        for (const [i, id] of ['A1', 'A2', 'B1', 'B2'].entries()) {
            const card = document.createElement('div');
            card.className = 'tag-config-card';
            const strong = document.createElement('strong');
            strong.textContent = id;
            card.appendChild(strong);
            const controller = document.createElement('select');
            controller.dataset.tagController = id;
            [['human', 'プレイヤー'], ['cpu', 'CPU']].forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; controller.appendChild(o); });
            controller.value = prev[id].controller || (i === 0 ? 'human' : 'cpu');
            const cl = document.createElement('label');
            cl.append('操作', controller);
            card.appendChild(cl);
            const source = document.createElement('select');
            source.dataset.tagSource = id;
            for (const x of sources) {
                const o = document.createElement('option');
                o.value = x.value;
                o.textContent = x.text;
                source.appendChild(o);
            }
            if (prev[id].source && [...source.options].some(o => o.value === prev[id].source))
                source.value = prev[id].source;
            const sl = document.createElement('label');
            sl.append('パーティー', source);
            card.appendChild(sl);
            const diff = document.createElement('select');
            diff.dataset.tagDiff = id;
            [['normal', '普通'], ['strong', '強い'], ['very-strong', '非常に強い']].forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; diff.appendChild(o); });
            diff.value = prev[id].diff || 'very-strong';
            const dl = document.createElement('label');
            dl.append('CPU強度', diff);
            card.appendChild(dl);
            grid.appendChild(card);
        }
    }
    function applyTagModePreset() { if (fmtSelect.value !== 'tag')
        return; renderTagConfig(); const mode = modeSelect.value; const map = mode === 'cpu-cpu' ? { A1: 'cpu', A2: 'cpu', B1: 'cpu', B2: 'cpu' } : mode === 'pvp' ? { A1: 'human', A2: 'cpu', B1: 'human', B2: 'cpu' } : { A1: 'human', A2: 'cpu', B1: 'cpu', B2: 'cpu' }; for (const [id, v] of Object.entries(map)) {
        const el = document.querySelector(`[data-tag-controller="${id}"]`);
        if (el)
            el.value = v;
    } }
    function tagConfigs() { return ['A1', 'A2', 'B1', 'B2'].map(id => { const side = id[0], controller = document.querySelector(`[data-tag-controller="${id}"]`)?.value || 'cpu', source = document.querySelector(`[data-tag-source="${id}"]`)?.value || 'current', difficulty = document.querySelector(`[data-tag-diff="${id}"]`)?.value || 'very-strong'; return { id, side, label: controller === 'cpu' ? `CPU ${id}` : `プレイヤー ${id}`, controller, difficulty, roster: resolveSource(source) }; }); }
    function startFromMode() { const fid = fmtSelect.value; if (fid === 'single')
        return false; const format = FORMATS[fid]; if (!format)
        return false; const mode = modeSelect.value; if (fid === 'tag')
        renderTagConfig(); const configs = fid === 'tag' ? tagConfigs() : nonTagConfigs(mode), ruleRow = CORE()?.ruleSets?.active?.(); for (const c of configs) {
        if (!Array.isArray(c.roster) || c.roster.length !== 6) {
            alert(`${c.label}の6匹パーティーを準備してください。`);
            return true;
        }
        if (ruleRow) {
            const bad = c.roster.filter(set => !CORE()?.ruleSets?.setAllowed?.(set, ruleRow.rules));
            if (bad.length) {
                alert(`${c.label}にルールセット「${ruleRow.name}」で使用できない要素を含むポケモンが${bad.length}匹います。`);
                return true;
            }
        }
    } showSelection(format, mode, configs); return true; }
    continueBtn.addEventListener('click', e => { if (startFromMode()) {
        e.preventDefault();
        e.stopImmediatePropagation();
    } }, true);
    fmtSelect.addEventListener('change', () => { renderTagConfig(); if (fmtSelect.value === 'tag')
        applyTagModePreset(); const single = fmtSelect.value === 'single'; $('mode-help-note').textContent = single ? 'シングルは従来エンジンを使用します。' : fmtSelect.value === 'tag' ? 'タッグは4人を個別にプレイヤー/CPUへ変更できます。対戦モードの選択は初期配置のプリセットとして使われます。' : 'ダブル/トリプル/6vs6はv13共通コア基盤のフォーマットエンジンを使用します。CPU戦・対人・CPU同士に対応します。'; });
    modeSelect.addEventListener('change', () => { if (fmtSelect.value === 'tag')
        applyTagModePreset(); });
    $('format-battle-exit')?.addEventListener('click', leaveFormat);
    $('format-autoplay-toggle')?.addEventListener('click', () => { if (!state)
        return; state.autoplayPaused = !state.autoplayPaused; if (!state.autoplayPaused)
        scheduleAutoplay(); render(); });
    $('format-autoplay-step')?.addEventListener('click', () => { if (state && !state.over && state.trainers.every(t => t.controller === 'cpu'))
        scheduleAutoplay(true); });
    $('format-autoplay-speed')?.addEventListener('change', () => { if (state && !state.autoplayPaused && state.trainers.every(t => t.controller === 'cpu'))
        scheduleAutoplay(); });
    $('format-team-preview-button')?.addEventListener('click', openFormatTeamPreview);
    $('format-bench-status-button')?.addEventListener('click', openFormatBenchStatus);
    $('format-pokedex-button')?.addEventListener('click', () => $('open-pokedex-button')?.click());
    $('format-copy-log-button')?.addEventListener('click', async () => { if (!state)
        return; const txt = formatBattleContext(state.view); try {
        await navigator.clipboard.writeText(txt);
        log('状況＋ログをコピーしました。');
    }
    catch (_) {
        prompt('コピーしてください', txt);
    } });
    renderTagConfig();
    window.NIWARA_FORMATS = Object.freeze({ FORMATS, get state() { return state; }, startFromMode, targetMode, FORMAT_LABEL });
})();
