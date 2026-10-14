/* ニワラバトル v13.0.8 headless environment simulator core.
   No DOM/localStorage access. Designed for Web Worker execution. */
(function (root) {
    'use strict';
    const DATA = root.NIWARA_DATA;
    if (!DATA)
        throw new Error('NIWARA_DATA is required before sim-core.js');
    const { LEVEL, MOVE_DEX, ITEM_DEX, NATURES, SPECIES_DEX, TYPE_CHART } = DATA;
    const SPECIES = Object.values(SPECIES_DEX);
    const ALL_TYPES = Object.keys(TYPE_CHART || {});
    const STAT_NAMES = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    const ABILITY_VALUE = {
        'good-as-gold': 13, 'magic-guard': 12, 'power-construct': 12, 'night-scales': 12, unaware: 11, regenerator: 10,
        'fur-coat': 10, 'water-bubble': 11, adaptability: 9, 'sheer-force': 10, sharpness: 9, schooling: 12, 'halloween-punk': 10,
        'trick-builder': 9, drizzle: 8, 'sand-stream': 8, levitate: 9, 'poison-heal': 10, 'speed-boost': 10, sturdy: 7,
        'clear-body': 6, 'white-smoke': 6, 'thick-fat': 7, 'lightning-rod': 10, 'sap-sipper': 10, competitive: 7, moxie: 7, 'magic-bounce': 10,
        'shadow-tag': 9, 'compound-eyes': 6, stamina: 8, 'earth-eater': 11, scrappy: 7, 'tinted-lens': 8, 'soundproof': 11,
        'dry-skin': 9, 'windmill': 9, 'vivid-body': 7, damp: 6, 'sweet-veil': 6, hydration: 6, 'natural-cure': 7, 'fairy-aura': 8,
        forecast: 7, 'sand-skin': 8, 'infinite-track': 8, 'light-metal': 3, 'clean-land': 5, gooey: 7
    };
    // Keep explicit counters valuable while reducing one-generation overshoot.
    const COUNTER_RESPONSE_GAIN = 0.78; // v13.0.6: static best-response remains exploratory, but no longer dominates observations.
    const STATUS_NAMES = ['burn', 'poison', 'toxic', 'paralysis', 'sleep', 'freeze'];
    const META_DERIVED_CACHE = new WeakMap();
    function metaDerived(meta) { if (!meta || !meta.__niwaraFrozen)
        return null; let c = META_DERIVED_CACHE.get(meta); if (!c) {
        c = { targets: null, targetSets: new Map(), speciesCounter: new Map(), abilityCounter: new Map(), moveCounter: new Map(), counterEvidence: new Map() };
        META_DERIVED_CACHE.set(meta, c);
    } return c; }
    const CORE = root.NIWARA_CORE || null;
    const DEFAULT_STAGES = () => ({ attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 });
    const STRUGGLE_MOVE = Object.freeze({ id: 'struggle', name: 'わるあがき', type: 'ノーマル', category: 'physical', power: 50, accuracy: null, priority: 0, maxPP: 1, pp: 1, struggle: true });
    const RANKED_ATTACKS = Object.create(null);
    for (const sp of SPECIES) {
        RANKED_ATTACKS[sp.id] = sp.movePool.map(id => MOVE_DEX[id]).filter(m => m && m.category !== 'status')
            .sort((a, b) => ((aiStaticPower(b) * ((b.accuracy ?? 100) / 100) + (sp.types.includes(b.type) ? 35 : 0)) - (aiStaticPower(a) * ((a.accuracy ?? 100) / 100) + (sp.types.includes(a.type) ? 35 : 0))));
    }
    const clamp = (n, min, max) => CORE?.clamp ? CORE.clamp(n, min, max) : Math.max(min, Math.min(max, n));
    const deepClone = o => JSON.parse(JSON.stringify(o));
    function seedHash(seed, index) {
        let h = 2166136261 >>> 0;
        const s = `${seed}|${index}`;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h || 0x9e3779b9;
    }
    function makeRng(seed) {
        let x = (seed >>> 0) || 0x6d2b79f5;
        const fn = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
        fn.int = (n) => Math.floor(fn() * n);
        fn.pick = (arr) => arr.length ? arr[fn.int(arr.length)] : null;
        fn.shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) {
            const j = fn.int(i + 1);
            [a[i], a[j]] = [a[j], a[i]];
        } return a; };
        return fn;
    }
    function natureMult(name, stat) { const n = NATURES[name] || NATURES['まじめ']; return n?.up === stat ? 1.1 : n?.down === stat ? 0.9 : 1; }
    function statValue(base, points, nature, stat) { return Math.floor((base + clamp(Math.floor(points || 0), 0, 32) + 20) * natureMult(nature, stat)); }
    function hpValue(base, points) { return base + clamp(Math.floor(points || 0), 0, 32) + 75; }
    function stageMult(stage) { return CORE?.stageMult ? CORE.stageMult(stage) : (stage = clamp(stage || 0, -6, 6), stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage)); }
    function effectiveSpeed(p, field) {
        let s = Math.floor(p.speed * stageMult(p.stages.speed));
        if (p.status === 'paralysis')
            s = Math.floor(s * 0.5);
        if ((field?.magicRoom || 0) <= 0 && p.item?.id === 'choice-scarf' && !p.itemConsumed)
            s = Math.floor(s * 1.5);
        if (field.tailwind[p.side] > 0)
            s *= 2;
        return Math.max(1, s);
    }
    function typeEffect(moveType, defenderTypes, attackerAbility) { if (CORE?.typeEffect)
        return CORE.typeEffect(moveType, defenderTypes, attackerAbility); let m = 1; for (const t of defenderTypes) {
        let x = TYPE_CHART?.[moveType]?.[t];
        if (x == null)
            x = 1;
        if (x === 0 && t === 'ゴースト' && attackerAbility === 'scrappy' && ['ノーマル', 'かくとう'].includes(moveType))
            x = 1;
        m *= x;
    } return m; }
    const ALL_SPECIES_IDS = SPECIES.map(sp => sp.id), ALL_MOVE_IDS = Object.keys(MOVE_DEX), ALL_ITEM_IDS = Object.keys(ITEM_DEX), ALL_ABILITY_IDS = [...new Set(SPECIES.flatMap(sp => (sp.abilities || []).map(a => a.id)))];
    function compileRules(config = {}) { if (config.__niwaraCompiledRules)
        return config.__niwaraCompiledRules; const src = config.rules && typeof config.rules === 'object' ? config.rules : {}, mk = (value, all) => new Set(Array.isArray(value) ? value.filter(id => all.includes(id)) : all); const r = { format: config.format || 'single', species: mk(src.species, ALL_SPECIES_IDS), moves: mk(src.moves, ALL_MOVE_IDS), abilities: mk(src.abilities, ALL_ABILITY_IDS), items: mk(src.items, ALL_ITEM_IDS) }; try {
        Object.defineProperty(config, '__niwaraCompiledRules', { value: r, enumerable: false, configurable: true });
    }
    catch (_) { } return r; }
    function legalAbilities(sp, rules) { return (sp.abilities || []).filter(a => rules.abilities.has(a.id)); }
    function legalMoveIds(sp, rules) { return (sp.movePool || []).filter(id => rules.moves.has(id) && MOVE_DEX[id] && !(rules.format === 'single' && MOVE_DEX[id].singlesFail)); }
    function buildableSpecies(rules) { const reps = [], keys = new Set(); for (const sp of SPECIES) {
        if (!rules.species.has(sp.id) || !legalAbilities(sp, rules).length || !legalMoveIds(sp, rules).length)
            continue;
        const key = sp.dexNo != null ? `dex:${sp.dexNo}` : `id:${sp.id}`;
        if (!keys.has(key)) {
            keys.add(key);
            reps.push(sp);
        }
    } return reps; }
    function assertRules(rules) { const reps = buildableSpecies(rules); if (reps.length < 6)
        throw new Error(`研究条件で構築可能なポケモンが${reps.length}種です。6種以上必要です。`); if (!rules.items.size)
        throw new Error('研究条件で使用可能な持ち物が0個です。'); const nonNone = [...rules.items].filter(id => id !== 'none' && ITEM_DEX[id]); if (!rules.items.has('none') && nonNone.length < 6)
        throw new Error('「持ち物なし」を禁止する場合、使用可能な持ち物が6種類以上必要です。'); return reps; }
    function startingFormKey(sp, abilityId) { if (sp?.formSystem === 'soljiend') {
        if (abilityId === 'schooling')
            return 'school';
        return 'solo';
    } return null; }
    function roleStats(sp, abilityId = null) { const key = startingFormKey(sp, abilityId), form = key ? sp.forms?.[key] : null, b = { ...(form?.baseStats || sp.baseStats) }; if (abilityId === 'night-scales')
        b.specialAttack *= 2; return b; }
    function role(sp, abilityId = null) { const b = roleStats(sp, abilityId); if (sp.id === 'soljiend')
        return { phys: true, spec: false, mixed: false, fast: b.speed >= 100, bulky: b.hp + b.defense + b.specialDefense >= 300 }; const phys = b.attack >= b.specialAttack + 18; const spec = b.specialAttack >= b.attack + 18; return { phys, spec, mixed: !phys && !spec, fast: b.speed >= 100, bulky: b.hp + b.defense + b.specialDefense >= 300 }; }
    function natureFor(sp, abilityId = null) { const r = role(sp, abilityId), b = roleStats(sp, abilityId); if (r.phys && r.fast)
        return 'ようき'; if (r.phys)
        return 'いじっぱり'; if (r.spec && r.fast)
        return 'おくびょう'; if (r.spec)
        return 'ひかえめ'; return b.defense >= b.specialDefense ? 'わんぱく' : 'しんちょう'; }
    function pointsFor(sp, abilityId = null) { if (sp.id === 'soljiend') {
        if (abilityId === 'schooling')
            return { hp: 2, attack: 32, defense: 0, specialAttack: 0, specialDefense: 0, speed: 32 };
        return { hp: 32, attack: 32, defense: 0, specialAttack: 0, specialDefense: 0, speed: 2 };
    } const r = role(sp, abilityId), b = roleStats(sp, abilityId), p = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }; if (r.fast) {
        p.speed = 32;
        if (r.phys)
            p.attack = 32;
        else if (r.spec)
            p.specialAttack = 32;
        else
            p.hp = 32;
        p.hp = p.hp || 2;
        if (p.hp === 32)
            p.specialDefense = 2;
    }
    else if (r.bulky) {
        p.hp = 32;
        if (r.phys)
            p.attack = 32;
        else if (r.spec)
            p.specialAttack = 32;
        else if (b.defense >= b.specialDefense)
            p.specialDefense = 32;
        else
            p.defense = 32;
        p.defense = p.defense || 2;
    }
    else {
        if (r.phys)
            p.attack = 32;
        else
            p.specialAttack = 32;
        p.hp = 32;
        p.speed = 2;
    } return p; }
    function abilityFor(sp, rng, mode, rules, meta = null) { const score = x => (ABILITY_VALUE[x.id] || 0) + componentExperience(meta, sp.id, 'abilities', 'abilityWins', x.id, 55) + abilityCounterBonus(sp, x.id, meta, rules); const a = legalAbilities(sp, rules).sort((x, y) => score(y) - score(x)); if (!a.length)
        return null; if (mode === 'uniform')
        return rng.pick(a); const temp = mode === 'mixed' ? 11 : 8; return weightedPick(rng, a, score, temp) || a[0]; }
    function expectedHits(m) { return CORE?.expectedHits ? CORE.expectedHits(m) : (!Array.isArray(m?.multiHit) ? 1 : (m.multiHit[0] === m.multiHit[1] ? m.multiHit[0] : (m.multiHit[0] === 2 && m.multiHit[1] === 5 ? 3 : (m.multiHit[0] + m.multiHit[1]) / 2))); }
    function weightedPick(rng, arr, scoreFn, temperature = 18) { if (!arr?.length)
        return null; const scored = arr.map(x => ({ x, s: Number(scoreFn(x)) || 0 })), best = Math.max(...scored.map(o => o.s)), weights = scored.map(o => Math.exp(Math.max(-12, Math.min(0, (o.s - best) / Math.max(1, temperature))))), total = weights.reduce((a, b) => a + b, 0); let r = rng() * total; for (let i = 0; i < scored.length; i++) {
        r -= weights[i];
        if (r <= 0)
            return scored[i].x;
    } return scored.at(-1).x; }
    function aiStaticPower(m) { if (CORE?.staticPower)
        return CORE.staticPower(m); if (!m || m.category === 'status')
        return 0; const base = Number(m.power) || 0; if (Array.isArray(m.multiHit) && base > 0)
        return base * expectedHits(m); if (m.weightPower || m.weightRatioPower || m.gyroBall)
        return 80; if (m.hardPress)
        return 75; if (m.reversal)
        return 80; if (m.storedPower)
        return 60; if (m.spitUp)
        return 80; if (m.weatherBall)
        return 70; if (m.furyCutter)
        return 65; if (m.rollout)
        return 60; if (m.beatUp)
        return 70; if ((m.doubleIfTargetStatus || m.venoshock || m.doubleIfUserStatus || m.doubleIfDamagedThisTurn || m.doubleIfLastMoveFailed || m.doubleIfNoItem) && base > 0)
        return base * 1.25; if (m.risingVoltage && base > 0)
        return base * 1.2; if (m.rainBonus && base > 0)
        return base * Math.min(1.25, Number(m.rainBonus) || 1); if (m.boostInMisty && base > 0)
        return base * 1.15; if (m.fixedDamage === 'level')
        return 50; if (m.superFang)
        return 70; if (m.endeavor)
        return 55; if (m.finalGambit)
        return 80; if (m.counter || m.mirrorCoat || m.metalBurst)
        return 60; if (m.ohko)
        return 75; if (base > 0)
        return base; return 0; }
    function moveTempoFactor(m, { instantCharge = false } = {}) { if (!m || m.category === 'status')
        return 1; if (m.recharge)
        return .48; if ((m.twoTurn || m.twoTurnWeather) && !instantCharge)
        return .55; if (m.futureSight)
        return .52; if (m.rampage)
        return .84; if (m.selfFaint || m.selfFaintAfterDamage || m.finalGambit)
        return .42; return 1; }
    function bayesRate(wins, count, prior = 40, base = .5) { count = Math.max(0, Number(count) || 0); wins = Math.max(0, Number(wins) || 0); base = clamp(Number(base) || .5, .05, .95); return (wins + prior * base) / (count + prior); }
    function speciesExperience(meta, sid) { const x = meta?.species?.[sid]; if (!x || !(x.roster > 0))
        return 0; const rate = bayesRate(x.teamWins, x.roster, 80, .5), conf = x.roster / (x.roster + 180), explore = Math.sqrt(Math.log1p(Math.max(1, meta?.battles || 1)) / (x.roster + 6)) * 4; return clamp((rate - .5) * 78 * conf + explore, -18, 18); }
    function selectedExperience(meta, sid) { const x = meta?.species?.[sid]; if (!x || !(x.selected > 0))
        return 0; const rate = bayesRate(x.selectedWins, x.selected, 60, .5), conf = x.selected / (x.selected + 140); return clamp((rate - .5) * 70 * conf, -18, 18); }
    function componentExperience(meta, sid, countKey, winKey, id, scale = 70) { const x = meta?.species?.[sid], counts = x?.[countKey], wins = x?.[winKey]; if (!x || !counts || !wins || wins[id] == null || !(counts[id] > 0))
        return 0; const base = bayesRate(x.teamWins, x.roster, 70, .5), count = Number(counts[id] || 0), rate = bayesRate(wins[id], count, 36, base), conf = count / (count + 70); return clamp((rate - base) * scale * conf, -24, 24); }
    function matchupExperience(meta, sid, oid) { const m = meta?.species?.[sid]?.matchups?.[oid]; if (!m || !(m.games > 0))
        return 0; const rate = bayesRate(m.wins, m.games, 30, .5), conf = m.games / (m.games + 60); return clamp((rate - .5) * 55 * conf, -16, 16); }
    function moveStaticScore(sp, m, abilityId) { if (!m)
        return -999; const r = role(sp, abilityId); if (m.category !== 'status') {
        let s = aiStaticPower(m) * ((m.accuracy ?? 100) / 100);
        if (sp.types.includes(m.type))
            s += 38;
        if (r.phys && m.category === 'physical')
            s += 18;
        if (r.spec && m.category === 'special')
            s += 18;
        if (r.phys && m.category === 'special')
            s -= 10;
        if (r.spec && m.category === 'physical')
            s -= 10;
        if ((m.priority || 0) > 0)
            s += 16;
        if (m.drainRatio)
            s += 11;
        if (m.pivot)
            s += 14;
        if (m.recoilRatio)
            s -= Math.min(24, Math.round(m.recoilRatio * 42));
        if (m.recoilMaxHPRatio)
            s -= Math.min(38, Math.round(m.recoilMaxHPRatio * 70));
        s *= moveTempoFactor(m);
        if (m.selfFaint || m.selfFaintAfterDamage || m.finalGambit)
            s -= 55;
        if (m.futureSight)
            s -= 10;
        if (m.multiHit)
            s += 6;
        if (m.secondaryStatus || m.targetStatChanges || m.targetStatChangeChance || m.flinchChance || m.confuseChance)
            s += 9;
        if (abilityId === 'sharpness' && m.slicing)
            s += 28;
        if (abilityId === 'water-bubble' && m.type === 'みず')
            s += 30;
        if (abilityId === 'adaptability' && sp.types.includes(m.type))
            s += 16;
        if (abilityId === 'tinted-lens')
            s += 5;
        if (abilityId === 'night-scales' && m.category === 'special')
            s += 28;
        if (m.requiresTerrain) {
            const ownTerrain = sp.movePool.some(id => MOVE_DEX[id]?.terrain);
            s -= ownTerrain ? 42 : 105;
        }
        if (m.requiresTargetItem)
            s -= 10;
        if (m.firstTurnOnly)
            s -= 22;
        if (m.suckerPunch)
            s -= 14;
        if (m.upperHand)
            s -= 28;
        return s;
    } let s = 18; if (m.healRatio || m.rest)
        s += r.bulky ? 40 : 25; if (m.selfStatChanges) {
        let useful = 0;
        for (const [stat, n] of Object.entries(m.selfStatChanges))
            if (n > 0 && ((stat === 'attack' && r.phys) || (stat === 'specialAttack' && r.spec) || ['speed', 'defense', 'specialDefense'].includes(stat)))
                useful += n;
        s += 20 + useful * 11;
    } if (m.weather || m.terrain || m.screen || m.tailwind || m.trickRoom)
        s += 28; if (m.hazard)
        s += 26; if (m.directStatus || m.toxic || m.yawn || m.tauntTurns || m.encoreTurns || m.disableTurns)
        s += 20; if (m.protect)
        s += 14; if (m.substitute)
        s += 12; return s; }
    function chooseMoves(sp, ability, rng, mode, rules, meta = null) {
        const all = legalMoveIds(sp, rules).map(id => MOVE_DEX[id]).filter(Boolean);
        if (!all.length)
            return [];
        if (mode === 'uniform')
            return rng.shuffle(all).slice(0, Math.min(4, all.length)).map(m => m.id);
        const scored = all.map(m => ({ m, s: moveStaticScore(sp, m, ability.id) + componentExperience(meta, sp.id, 'moveSets', 'moveSetWins', m.id, 62) + moveCounterBonus(sp, ability.id, m, meta, rules) })).sort((a, b) => b.s - a.s), best = scored[0]?.s || 0;
        const pool = scored.filter(x => x.s >= best - (mode === 'mixed' ? 70 : 55)).slice(0, Math.min(mode === 'mixed' ? 18 : 14, scored.length));
        const out = [], add = m => { if (m && !out.includes(m.id) && out.length < 4)
            out.push(m.id); };
        const attacks = pool.filter(x => x.m.category !== 'status'), stab = attacks.filter(x => sp.types.includes(x.m.type));
        add(weightedPick(rng, (stab.length ? stab : attacks).slice(0, 6), x => x.s, mode === 'mixed' ? 30 : 20)?.m);
        const firstType = MOVE_DEX[out[0]]?.type, coverage = attacks.filter(x => x.m.type !== firstType);
        if (coverage.length && rng() < (mode === 'mixed' ? .9 : .82))
            add(weightedPick(rng, coverage.slice(0, 8), x => x.s, mode === 'mixed' ? 34 : 24)?.m);
        const statuses = scored.filter(x => x.m.category === 'status' && x.s >= 42).slice(0, 8);
        if (statuses.length && rng() < (mode === 'mixed' ? .72 : .58))
            add(weightedPick(rng, statuses.slice(0, 7), x => x.s, mode === 'mixed' ? 26 : 18)?.m);
        while (out.length < Math.min(4, all.length)) {
            const left = pool.filter(x => !out.includes(x.m.id));
            if (!left.length)
                break;
            add(weightedPick(rng, left, x => x.s, mode === 'mixed' ? 38 : 26)?.m);
        }
        if (out.length < Math.min(4, all.length))
            for (const x of scored) {
                add(x.m);
                if (out.length >= Math.min(4, all.length))
                    break;
            }
        return out;
    }
    function itemFor(sp, ability, moves, used, rng, mode, rules, meta = null) {
        const ms = moves.map(id => MOVE_DEX[id]).filter(Boolean), allowNone = rules.items.has('none'), ids = Object.keys(ITEM_DEX).filter(id => id !== 'none' && rules.items.has(id) && !used.has(id));
        const preferred = [], priority = new Map(), add = (id, w = 10) => { if (rules.items.has(id) && ITEM_DEX[id] && id !== 'none' && !used.has(id) && !preferred.includes(id)) {
            preferred.push(id);
            priority.set(id, w);
        } };
        if (ability.id === 'halloween-punk' && sp.formSystem === 'halloween')
            add('mystery-candy', 55);
        if (ability.id === 'poison-heal')
            add('toxic-orb', 52);
        if (ms.some(m => m.twoTurn || m.twoTurnWeather))
            add('power-herb', 38);
        if (ms.some(m => m.rest))
            add('chesto-berry', 34);
        if (role(sp, ability.id).fast)
            add('focus-sash', 28);
        if (ms.filter(m => m.category !== 'status').length >= 3)
            add('life-orb', 26);
        if (sp.baseStats.speed < 90)
            add('choice-scarf', 19);
        add('leftovers', 18);
        add('sitrus-berry', 17);
        add('life-orb', 16);
        add('expert-belt', 13);
        let id = null;
        if (mode === 'uniform')
            id = rng.pick([...(allowNone ? ['none'] : []), ...ids]) || null;
        else if (preferred.length) {
            // 専用シナジーは高確率、汎用品は複数候補から確率的に選び型を固定化しない。
            const candy = preferred.includes('mystery-candy');
            if (candy && rng() < .68)
                id = 'mystery-candy';
            else
                id = weightedPick(rng, preferred, x => (priority.get(x) || 10) + componentExperience(meta, sp.id, 'items', 'itemWins', x, 70), mode === 'mixed' ? 16 : 12);
            if (allowNone && rng() < (mode === 'mixed' ? .10 : .05))
                id = 'none';
        }
        else if (ids.length)
            id = (allowNone && rng() < .16) ? 'none' : weightedPick(rng, ids.slice(0, Math.min(24, ids.length)), x => componentExperience(meta, sp.id, 'items', 'itemWins', x, 70), 18);
        else if (allowNone)
            id = 'none';
        if (id && id !== 'none')
            used.add(id);
        return id;
    }
    function variantSpread(sp, rng, mode, abilityId = null) { const base = pointsFor(sp, abilityId), r = role(sp, abilityId), b = roleStats(sp, abilityId); if (mode === 'uniform') {
        const stats = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
        const a = rng.pick(stats), bb = rng.pick(stats.filter(x => x !== a)), p = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
        p[a] = 32;
        p[bb] = 32;
        p[rng.pick(stats.filter(x => x !== a && x !== bb))] = 2;
        return p;
    } if (rng() < 0.72)
        return base; const p = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }, main = r.phys ? 'attack' : r.spec ? 'specialAttack' : (b.attack >= b.specialAttack ? 'attack' : 'specialAttack'); if (r.fast && rng() < 0.5) {
        p.speed = 32;
        p.hp = 32;
        p[main] = 2;
    }
    else {
        p.hp = 32;
        p[main] = 32;
        p.speed = 2;
        if (rng() < 0.35) {
            p[main] = 2;
            p[b.defense >= b.specialDefense ? 'defense' : 'specialDefense'] = 32;
        }
    } return p; }
    function natureForSpread(sp, p, abilityId = null) { const r = role(sp, abilityId), b = roleStats(sp, abilityId), main = r.phys ? 'attack' : r.spec ? 'specialAttack' : (b.attack >= b.specialAttack ? 'attack' : 'specialAttack'); if (p.speed === 32 && p[main] >= 2)
        return main === 'attack' ? 'ようき' : 'おくびょう'; if (p[main] === 32)
        return main === 'attack' ? 'いじっぱり' : 'ひかえめ'; if (p.defense === 32)
        return 'わんぱく'; if (p.specialDefense === 32)
        return 'しんちょう'; return natureFor(sp, abilityId); }
    function buildSet(sp, used, rng, buildMode = 'strong', rules, meta = null) {
        const mode = buildMode === 'uniform' ? 'uniform' : buildMode === 'mixed' ? 'mixed' : 'strong', ab = abilityFor(sp, rng, mode, rules, meta);
        if (!ab)
            return null;
        const moves = chooseMoves(sp, ab, rng, mode, rules, meta);
        if (!moves.length)
            return null;
        const itemId = itemFor(sp, ab, moves, used, rng, mode, rules, meta);
        if (itemId == null)
            return null; // Sample legal spreads and use the actual species-specific win history (smoothed),
        // rather than a global average. Keep a genuine exploration probability.
        const chosenSpread = variantSpread(sp, rng, mode, ab.id);
        let chosen = { statPoints: chosenSpread, nature: natureForSpread(sp, chosenSpread, ab.id) };
        if (mode !== 'uniform' && meta?.species?.[sp.id]?.roster > 0) {
            const options = [chosen], seen = new Set([Object.values(chosenSpread).join('/')]);
            for (let k = 0; k < 7; k++) {
                const points = variantSpread(sp, rng, k < 3 ? 'uniform' : mode, ab.id);
                const key = [points.hp, points.attack, points.defense, points.specialAttack, points.specialDefense, points.speed].join('/');
                if (seen.has(key))
                    continue;
                seen.add(key);
                options.push({ statPoints: points, nature: natureForSpread(sp, points, ab.id) });
            }
            const score = o => {
                const p = o.statPoints, key = [p.hp, p.attack, p.defense, p.specialAttack, p.specialDefense, p.speed].join('/');
                const ss = meta.species[sp.id];
                // Prior for conventional spread; performance bonuses are deliberately mild.
                const baseline = Object.values(pointsFor(sp, ab.id)).join('/');
                return (key === baseline ? 5 : 0)
                    + componentExperience(meta, sp.id, 'pointSpreads', 'pointSpreadWins', key, 28)
                    + componentExperience(meta, sp.id, 'natures', 'natureWins', o.nature, 20);
            };
            chosen = weightedPick(rng, options, score, mode === 'mixed' ? 9 : 7) || chosen;
        }
        return { speciesId: sp.id, abilityId: ab.id, itemId, nature: chosen.nature, statPoints: chosen.statPoints, moves };
    }
    function weaknessPenalty(team) { const count = {}; for (const set of team) {
        const sp = SPECIES_DEX[set.speciesId];
        for (const t of ALL_TYPES) {
            if (typeEffect(t, sp.types, null) > 1)
                count[t] = (count[t] || 0) + 1;
        }
    } let p = 0; for (const n of Object.values(count))
        if (n >= 4)
            p += (n - 3) * 10; return p; }
    function topMapKey(map, allowed = null, fallback = null) { let best = fallback, score = -1; for (const [k, v] of Object.entries(map || {})) {
        if (allowed && !allowed.has(k))
            continue;
        if (Number(v) > score) {
            score = Number(v);
            best = k;
        }
    } return best; }
    function metaTargets(meta) { if (!meta?.species)
        return []; const cache = metaDerived(meta); if (cache?.targets)
        return cache.targets; const teams = Math.max(1, Number(meta.battles || 1) * (meta.format === 'tag' ? 4 : 2)), rows = Object.entries(meta.species).map(([id, x]) => { const roster = Number(x.roster || 0), wins = Number(x.teamWins || 0), usage = roster / teams, win = roster ? wins / roster : .5; return { id, roster, usage, win, pressure: Math.max(.01, usage) * (.7 + Math.max(0, win - .5) * 1.8) }; }).filter(x => SPECIES_DEX[x.id] && x.roster > 0).sort((a, b) => b.pressure - a.pressure); const out = rows.slice(0, 8); if (cache)
        cache.targets = out; return out; }
    function metaTargetSet(meta, targetId, rules) {
        const cache = metaDerived(meta);
        if (cache?.targetSets.has(targetId))
            return cache.targetSets.get(targetId);
        const sp = SPECIES_DEX[targetId], x = meta?.species?.[targetId];
        if (!sp)
            return null;
        const legalAb = new Set(legalAbilities(sp, rules).map(a => a.id)), abilityId = topMapKey(x?.abilities, legalAb, legalAbilities(sp, rules)[0]?.id || sp.abilities[0]?.id), legalMoves = new Set(legalMoveIds(sp, rules)), rankedMoves = Object.entries(x?.moveSets || {}).filter(([id]) => legalMoves.has(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id), fallback = (RANKED_ATTACKS[targetId] || []).map(m => m.id).filter(id => legalMoves.has(id));
        const moves = [...new Set([...rankedMoves, ...fallback, ...legalMoves])].slice(0, 4), itemId = topMapKey(x?.items, rules.items, rules.items.has('none') ? 'none' : [...rules.items][0]);
        const spreadKey = topMapKey(x?.spreads, null, null);
        const parts = spreadKey?.split('|') || [];
        const pv = parts[1]?.split('/').map(Number) || [];
        const valid = pv.length === 6 && pv.every(v => Number.isFinite(v) && v >= 0 && v <= 32) && pv.reduce((a, b) => a + b, 0) <= 66;
        const points = valid ? Object.fromEntries(['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].map((k, i) => [k, pv[i]])) : pointsFor(sp, abilityId);
        const nature = valid && NATURES[parts[0]] ? parts[0] : natureFor(sp, abilityId);
        const out = { speciesId: targetId, abilityId, itemId: itemId || 'none', nature, statPoints: points, moves: moves.length ? moves : legalMoveIds(sp, rules).slice(0, 1) };
        if (cache)
            cache.targetSets.set(targetId, out);
        return out;
    }
    // True direct combat: 'games' counts attack attempts, NOT matches. Never divide KOs by
    // attack attempts and label it a win rate (this previously generated false negatives).
    function directArchetypeExperience(meta, set, targetSet) {
        if (!meta?.archetypeEncounters || !set || !targetSet)
            return 0;
        const k = `${set.speciesId}|${set.abilityId}>${targetSet.speciesId}|${targetSet.abilityId}`;
        const reverse = `${targetSet.speciesId}|${targetSet.abilityId}>${set.speciesId}|${set.abilityId}`;
        const a = meta.archetypeEncounters[k], b = meta.archetypeEncounters[reverse];
        const ko = Number(a?.kos || 0), koAgainst = Number(b?.kos || 0), attempts = Number(a?.games || 0) + Number(b?.games || 0);
        if (attempts < 12 || ko + koAgainst < 3)
            return 0;
        const balance = (ko - koAgainst) / (ko + koAgainst + 12);
        const reliability = attempts / (attempts + 100);
        return clamp(24 * balance * reliability, -14, 14);
    }
    // These are selected-team outcomes with both sets on opposite sides, NOT direct 1v1
    // battle wins. Keep a separate statistic rather than contaminating direct KO records.
    function selectedCounterEvidence(meta, set, targetSet) {
        const k = `${set.speciesId}|${set.abilityId}>${targetSet.speciesId}|${targetSet.abilityId}`;
        const cache = metaDerived(meta);
        if (cache?.counterEvidence.has(k))
            return cache.counterEvidence.get(k);
        const x = meta?.selectedCounterResults?.[k];
        const games = Math.max(0, Number(x?.games) || 0), wins = Math.max(0, Number(x?.wins) || 0), losses = Math.max(0, Number(x?.losses) || 0);
        // Use only decisive results. Draws are not wins and must not lower the posterior.
        const decided = wins + losses;
        const our = meta?.species?.[set.speciesId], their = meta?.species?.[targetSet.speciesId];
        const ownRate = bayesRate(our?.selectedWins || 0, our?.selected || 0, 100, .5);
        const opponentRate = bayesRate(their?.selectedWins || 0, their?.selected || 0, 100, .5);
        const expectation = clamp((ownRate + (1 - opponentRate) + .5) / 3, .38, .62);
        const observed = (wins + 36 * expectation) / (decided + 36);
        const trust = decided / (decided + 65);
        const out = { games, decided, expectation, observed, trust, delta: clamp((observed - expectation) * 105 * trust, -27, 27) };
        if (cache)
            cache.counterEvidence.set(k, out);
        return out;
    }
    function counterEvidenceAdjustedScore(set, targetId, rules, meta) {
        const predicted = staticCounterScore(set, targetId, rules, meta);
        const target = metaTargetSet(meta, targetId, rules);
        if (!target)
            return predicted;
        const e = selectedCounterEvidence(meta, set, target);
        // Empirical performance displaces speculative static scores as exposure grows.
        // Before exposure, the static score remains available for counter discovery.
        return clamp(clamp(predicted, -35, 43) * (1 - .85 * e.trust) + e.delta, -36, 43);
    }
    function counterEvidenceTrust(meta, set, targetId, rules) {
        const target = metaTargetSet(meta, targetId, rules);
        return target ? selectedCounterEvidence(meta, set, target).trust : 0;
    }
    function staticCounterScore(set, targetId, rules, meta = null) { const targetSet = metaTargetSet(meta, targetId, rules); if (!set || !targetSet)
        return 0; const a = makePokemon(set, 'x'), d = makePokemon(targetSet, 'y'), field = { weather: null, terrain: null, tailwind: { x: 0, y: 0 }, screens: { x: { reflect: 0, lightScreen: 0 }, y: { reflect: 0, lightScreen: 0 } }, hazards: { x: {}, y: {} }, rules }; let off = 0; for (const m of a.moves) {
        if (m.category === 'status')
            continue;
        let v = damageEstimate(a, d, m, field, .925, false) * moveAccuracy(a, m, field) / 100 * moveTempoFactor(m);
        off = Math.max(off, v / Math.max(1, d.maxHP) * 100);
    } let threat = 0, avg = 0, n = 0; for (const m of d.moves) {
        if (m.category === 'status')
            continue;
        let v = damageEstimate(d, a, m, field, .925, false) * moveAccuracy(d, m, field) / 100 * moveTempoFactor(m);
        threat = Math.max(threat, v / Math.max(1, a.maxHP) * 100);
        avg += v / Math.max(1, a.maxHP) * 100;
        n++;
    } const speed = effectiveSpeed(a, field) > effectiveSpeed(d, field) ? 8 : 0, survival = (1 - (n ? avg / n : 0) / 100) * 26; return off * .78 - threat * .62 + survival + speed + directArchetypeExperience(meta, set, targetSet); }
    function probeSet(sp, abilityId, rules, meta = null) { const mids = legalMoveIds(sp, rules).map(id => MOVE_DEX[id]).filter(Boolean).sort((a, b) => (moveStaticScore(sp, b, abilityId) + moveCounterBonusRaw(sp, abilityId, b, meta, rules)) - (moveStaticScore(sp, a, abilityId) + moveCounterBonusRaw(sp, abilityId, a, meta, rules))).slice(0, 4).map(m => m.id); return { speciesId: sp.id, abilityId, itemId: 'none', nature: natureFor(sp, abilityId), statPoints: pointsFor(sp, abilityId), moves: mids.length ? mids : legalMoveIds(sp, rules).slice(0, 1) }; }
    function abilityBlockCoverage(sp, abilityId, targetId, meta, rules) { const ts = metaTargetSet(meta, targetId, rules); if (!ts)
        return 0; const cand = makePokemon({ speciesId: sp.id, abilityId, itemId: 'none', nature: natureFor(sp, abilityId), statPoints: pointsFor(sp, abilityId), moves: legalMoveIds(sp, rules).slice(0, 1) }, 'x'), target = makePokemon(ts, 'y'), field = { weather: null, terrain: null, tailwind: { x: 0, y: 0 }, screens: { x: { reflect: 0, lightScreen: 0 }, y: { reflect: 0, lightScreen: 0 } }, hazards: { x: {}, y: {} }, rules }; const usage = meta?.species?.[targetId]?.moveSets || {}; let blocked = 0, total = 0; for (const m of target.moves) {
        if (!m || m.category === 'status')
            continue;
        const w = Math.max(1, Number(usage[m.id] || 1));
        total += w;
        if (abilityBlockInfo(target, cand, m, field))
            blocked += w;
    } return total ? blocked / total : 0; }
    function speciesCounterPotential(sp, meta, rules) { const cache = metaDerived(meta); if (cache?.speciesCounter.has(sp.id))
        return cache.speciesCounter.get(sp.id); const targets = metaTargets(meta).slice(0, 4); if (!targets.length)
        return 0; const totalPressure = targets.reduce((n, t) => n + t.pressure, 0) || 1; let best = -999; for (const ab of legalAbilities(sp, rules)) {
        const set = probeSet(sp, ab.id, rules, null);
        let weighted = 0, specialist = -999;
        for (const t of targets) {
            const share = t.pressure / totalPressure, block = abilityBlockCoverage(sp, ab.id, t.id, meta, rules), trust = counterEvidenceTrust(meta, set, t.id, rules), value = counterEvidenceAdjustedScore(set, t.id, rules, meta) + block * 21 * (1 - trust);
            weighted += share * value;
            specialist = Math.max(specialist, value * (.72 + share * .45));
        }
        const candidate = weighted * .42 + Math.max(0, specialist) * .34;
        best = Math.max(best, candidate);
    } const out = clamp(best * .66 * COUNTER_RESPONSE_GAIN, -18, 32); if (cache)
        cache.speciesCounter.set(sp.id, out); return out; }
    function abilityCounterBonus(sp, abilityId, meta, rules) { if (!meta?.species)
        return 0; const cache = metaDerived(meta), ck = `${sp.id}|${abilityId}`; if (cache?.abilityCounter.has(ck))
        return cache.abilityCounter.get(ck); const set = probeSet(sp, abilityId, rules, null), targets = metaTargets(meta).slice(0, 4); let staticSum = 0, blockSum = 0, total = 0, maxSpecial = 0; for (const t of targets) {
        const block = abilityBlockCoverage(sp, abilityId, t.id, meta, rules);
        const trust = counterEvidenceTrust(meta, set, t.id, rules);
        staticSum += t.pressure * counterEvidenceAdjustedScore(set, t.id, rules, meta);
        blockSum += t.pressure * block * (1 - trust);
        total += t.pressure;
        maxSpecial = Math.max(maxSpecial, block * (1 - trust) * (12 + Math.min(12, t.usage * 20)));
    } if (!total)
        return 0; const base = clamp((staticSum / total) * .10, -9, 13), immunity = clamp((blockSum / total) * 30, 0, 26), specialist = clamp(maxSpecial, 0, 32); const out = clamp((base + immunity + specialist) * COUNTER_RESPONSE_GAIN, -12, 27); if (cache)
        cache.abilityCounter.set(ck, out); return out; }
    function moveCounterBonusRaw(sp, abilityId, m, meta, rules) { const cache = metaDerived(meta), ck = `${sp.id}|${abilityId}|${m?.id || '?'}`; if (cache?.moveCounter.has(ck))
        return cache.moveCounter.get(ck); const targets = metaTargets(meta); if (!targets.length || m.category === 'status')
        return 0; const set = { speciesId: sp.id, abilityId, itemId: 'none', nature: natureFor(sp, abilityId), statPoints: pointsFor(sp, abilityId), moves: [m.id] }, a = makePokemon(set, 'x'), field = { weather: null, terrain: null, tailwind: { x: 0, y: 0 }, screens: { x: { reflect: 0, lightScreen: 0 }, y: { reflect: 0, lightScreen: 0 } }, hazards: { x: {}, y: {} }, rules }; let s = 0, total = 0; for (const t of targets.slice(0, 4)) {
        const ts = metaTargetSet(meta, t.id, rules);
        if (!ts)
            continue;
        const d = makePokemon(ts, 'y'), v = damageEstimate(a, d, m, field, .925, false) / Math.max(1, d.maxHP) * 100;
        s += t.pressure * v;
        total += t.pressure;
    } const out = total ? s / total : 0; if (cache)
        cache.moveCounter.set(ck, out); return out; }
    function moveCounterBonus(sp, abilityId, m, meta, rules) { return clamp(moveCounterBonusRaw(sp, abilityId, m, meta, rules) * .14 * COUNTER_RESPONSE_GAIN, 0, 14); }
    function metaPressureScore(team, meta, rules) { const targets = metaTargets(meta); if (!targets.length)
        return 0; const total = targets.reduce((a, b) => a + b.pressure, 0) || 1; let score = 0; for (const t of targets) {
        const vals = team.map(set => counterEvidenceAdjustedScore(set, t.id, rules, meta)).sort((a, b) => b - a), cover = (vals[0] || 0) + Math.max(0, vals[1] || 0) * .28;
        score += (t.pressure / total) * cover * .34 * COUNTER_RESPONSE_GAIN;
    } return score; }
    function weightedSpeciesSample(reps, count, rng, meta, rules) { const pool = [...reps], out = []; while (out.length < count && pool.length) {
        const pick = weightedPick(rng, pool, sp => speciesExperience(meta, sp.id) * .55 + speciesCounterPotential(sp, meta, rules), 22) || rng.pick(pool), idx = pool.indexOf(pick);
        out.push(pick);
        pool.splice(idx, 1);
    } return out; }
    function teamQuality(team, meta = null, rules = null) { let score = 0, phys = 0, spec = 0, fast = 0, bulky = 0; const types = new Set(); for (const set of team) {
        const sp = SPECIES_DEX[set.speciesId], r = role(sp, set.abilityId);
        phys += r.phys ? 1 : 0;
        spec += r.spec ? 1 : 0;
        fast += r.fast ? 1 : 0;
        bulky += r.bulky ? 1 : 0;
        score += (ABILITY_VALUE[set.abilityId] || 0) * .55 + (meta ? speciesExperience(meta, set.speciesId) * .55 + componentExperience(meta, set.speciesId, 'abilities', 'abilityWins', set.abilityId, 65) * .55 : 0);
        for (const id of set.moves) {
            const m = MOVE_DEX[id];
            if (m?.category !== 'status')
                types.add(m.type);
        }
    } score += types.size * 2.2 + (phys && spec ? 12 : -10) + (fast >= 2 ? 8 : -5) + (bulky ? 4 : -8) - weaknessPenalty(team); if (meta && rules)
        score += metaPressureScore(team, meta, rules); return score; }
    function buildTeam(rng, difficulty = 'very-strong', buildMode = 'auto', rules, meta = null) {
        const reps = assertRules(rules), mode = buildMode === 'uniform' ? 'uniform' : buildMode === 'mixed' ? 'mixed' : (difficulty === 'normal' ? 'mixed' : 'strong');
        if (mode === 'uniform') {
            const used = new Set(), t = rng.shuffle(reps).slice(0, 6).map(sp => buildSet(sp, used, rng, 'uniform', rules, meta));
            if (t.some(x => !x))
                throw new Error('研究条件では6匹の構築を生成できません。');
            return t;
        }
        const attempts = difficulty === 'very-strong' ? 8 : difficulty === 'strong' ? 4 : 2;
        let best = null, bestScore = -1e9;
        for (let a = 0; a < attempts; a++) {
            const used = new Set(), picked = meta?.battles >= 80 ? weightedSpeciesSample(reps, 6, rng, meta, rules) : rng.shuffle(reps).slice(0, 6), t = picked.map(sp => buildSet(sp, used, rng, mode, rules, meta));
            if (t.some(x => !x))
                continue;
            const score = teamQuality(t, meta, rules) + rng() * 6;
            if (score > bestScore) {
                bestScore = score;
                best = t;
            }
        }
        if (!best)
            throw new Error('研究条件では6匹の構築を生成できません。持ち物・技・特性条件を確認してください。');
        return best;
    }
    function calcPokemonStats(sp, set, formKey = null) { const p = set.statPoints || {}, form = formKey ? sp.forms?.[formKey] : null, b = form?.baseStats || sp.baseStats; return { maxHP: hpValue(b.hp, p.hp), attack: statValue(b.attack, p.attack, set.nature, 'attack'), defense: statValue(b.defense, p.defense, set.nature, 'defense'), specialAttack: statValue(b.specialAttack, p.specialAttack, set.nature, 'specialAttack'), specialDefense: statValue(b.specialDefense, p.specialDefense, set.nature, 'specialDefense'), speed: statValue(b.speed, p.speed, set.nature, 'speed'), weight: form?.weight ?? sp.weight ?? 0 }; }
    function makePokemon(set, side) { const sp = SPECIES_DEX[set.speciesId], ability = sp.abilities.find(a => a.id === set.abilityId) || sp.abilities[0], formKey = (sp.formSystem === 'halloween' && ability.id === 'halloween-punk' ? (set.itemId === 'mystery-candy' && sp.forms?.trick ? 'trick' : (sp.forms?.treat ? 'treat' : null)) : startingFormKey(sp, ability.id)), st = calcPokemonStats(sp, set, formKey), maxHP = st.maxHP, weight = ability.id === 'light-metal' ? st.weight / 2 : st.weight; return { id: sp.id, name: formKey && sp.forms?.[formKey]?.name || sp.name, baseName: sp.name, types: [...(sp.forms?.[formKey]?.types || sp.types)], baseTypes: [...sp.types], weight, formKey, side, set, ability, item: ITEM_DEX[set.itemId] || ITEM_DEX.none, itemConsumed: false, maxHP, hp: maxHP, attack: st.attack, defense: st.defense, specialAttack: st.specialAttack, specialDefense: st.specialDefense, speed: st.speed, status: null, statusTurns: 0, toxicCounter: 0, stages: DEFAULT_STAGES(), moves: set.moves.map(id => ({ ...MOVE_DEX[id], pp: MOVE_DEX[id].maxPP })), recharge: false, charging: null, protect: false, protectChain: 0, protectContactParalyze: false, endure: false, redirect: false, helpingHand: false, seeded: false, seedSourceSide: null, trappedTurns: 0, destinyBond: false, imprison: false, raisedThisTurn: false, iceRestoreTypes: null, substituteHP: 0, cursed: false, smackDown: false, furyCutterCount: 0, rolloutCount: 0, lastMoveId: null, choiceLock: null, turnsActive: 0, koCount: 0, lastDamageAmount: 0, lastDamageCategory: null, lastDamageFromSide: null, lastMoveFailed: false, previousMoveFailed: false, rampageMoveId: null, rampageTurns: 0, confusedTurns: 0, tauntTurns: 0, encoreTurns: 0, encoreMoveId: null, disableTurns: 0, disableMoveId: null, yawnTurns: 0, sameMoveCount: 0, lastConsecutiveMoveId: null, recoveryBlockTurns: 0, magnetRiseTurns: 0, aquaRing: false, ingrain: false, stockpileCount: 0, focusEnergy: 0, _trickBuilderUsed: false }; }
    function applyResearchForm(p, key) { const sp = SPECIES_DEX[p?.id], form = sp?.forms?.[key]; if (!p || !form || p.formKey === key)
        return false; const oldMax = p.maxHP, st = calcPokemonStats(sp, p.set, key); p.formKey = key; p.name = form.name || sp.name; p.types = [...(form.types || sp.types)]; p.weight = st.weight; p.maxHP = st.maxHP; p.hp = st.maxHP > oldMax ? Math.min(st.maxHP, p.hp + (st.maxHP - oldMax)) : Math.min(st.maxHP, p.hp); p.attack = st.attack; p.defense = st.defense; p.specialAttack = st.specialAttack; p.specialDefense = st.specialDefense; p.speed = st.speed; return true; }
    function syncResearchForm(p) { if (!p || p.hp <= 0 || p.id !== 'soljiend')
        return; if (p.ability.id === 'schooling') {
        applyResearchForm(p, p.hp > p.maxHP / 4 ? 'school' : 'solo');
    }
    else if (p.ability.id === 'power-construct' && p.formKey !== 'perfect' && p.hp <= p.maxHP / 2) {
        applyResearchForm(p, 'perfect');
    } }
    function reveal(sideState, p, kind, value) { const k = sideState.knowledge[p.id] || (sideState.knowledge[p.id] = { seen: false, moves: {}, ability: null, item: null }); if (kind === 'seen')
        k.seen = true;
    else if (kind === 'move')
        k.moves[value] = 1;
    else
        k[kind] = value; }
    function publicView(oppSide, p) { const k = oppSide.knowledge[p.id] || {}; return { speciesId: p.id, types: [...p.types], hpPercent: Math.max(0, Math.ceil(p.hp * 100 / p.maxHP)), status: p.status, stages: { ...p.stages }, revealedMoves: Object.keys(k.moves || {}), abilityId: k.ability || null, itemId: k.item || null }; }
    function neutralModel(speciesId, rules = null) { const sp = SPECIES_DEX[speciesId], p = { hp: 16, attack: 16, defense: 16, specialAttack: 16, specialDefense: 16, speed: 16 }, ab = (rules ? legalAbilities(sp, rules) : sp.abilities)[0] || sp.abilities[0], moves = (rules ? legalMoveIds(sp, rules) : sp.movePool).slice(0, 4); return makePokemon({ speciesId: sp.id, abilityId: ab.id, itemId: 'none', nature: 'まじめ', statPoints: p, moves: moves.length ? moves : sp.movePool.slice(0, 1) }, 'model'); }
    function weatherMultiplier(type, weather) { if (weather === 'rain')
        return type === 'みず' ? 1.5 : type === 'ほのお' ? 0.5 : 1; if (weather === 'sun')
        return type === 'ほのお' ? 1.5 : type === 'みず' ? 0.5 : 1; return 1; }
    function abilityAttackMult(a, m) { let x = 1; if (a.ability.id === 'sharpness' && m.slicing)
        x *= 1.5; if (a.ability.id === 'water-bubble' && m.type === 'みず')
        x *= 2; if (a.ability.id === 'adaptability' && a.types.includes(m.type))
        x *= 4 / 3; if (a.ability.id === 'sheer-force' && isSheerForceMove(m))
        x *= 1.3; if (a.ability.id === 'blaze' && m.type === 'ほのお' && a.hp <= a.maxHP / 3)
        x *= 1.5; if (a.ability.id === 'torrent' && m.type === 'みず' && a.hp <= a.maxHP / 3)
        x *= 1.5; if (a.ability.id === 'overgrow' && m.type === 'くさ' && a.hp <= a.maxHP / 3)
        x *= 1.5; return x; }
    function abilityDefenseMult(d, m) { if (m?.ignoreDefenderAbility)
        return 1; let x = 1; if (d.ability.id === 'fur-coat' && (m.category === 'physical' || m.usePhysicalDefense))
        x *= 0.5; if (d.ability.id === 'thick-fat' && ['ほのお', 'こおり'].includes(m.type))
        x *= 0.5; if (d.ability.id === 'heatproof' && m.type === 'ほのお')
        x *= 0.5; if (d.ability.id === 'dry-skin' && m.type === 'ほのお')
        x *= 1.25; if (d.ability.id === 'water-bubble' && m.type === 'ほのお')
        x *= 0.5; return x; }
    function itemAttackMult(a, m, eff, d = null, field = null) { if (a.itemConsumed || (field?.magicRoom || 0) > 0)
        return 1; let x = 1; if (a.item.id === 'life-orb')
        x *= 1.3; if (a.item.id === 'expert-belt' && eff > 1)
        x *= 1.2; if (a.item.id === 'muscle-band' && m.category === 'physical')
        x *= 1.1; if (a.item.id === 'wise-glasses' && m.category === 'special')
        x *= 1.1; if (a.item.id === 'choice-band' && m.category === 'physical')
        x *= 1.5; if (a.item.id === 'choice-specs' && m.category === 'special')
        x *= 1.5; const boosts = { 'charcoal': 'ほのお', 'mystic-water': 'みず', 'miracle-seed': 'くさ', 'never-melt-ice': 'こおり', 'soft-sand': 'じめん', 'magnet': 'でんき', 'silver-powder': 'むし', 'spell-tag': 'ゴースト', 'black-glasses': 'あく', 'metal-coat': 'はがね', 'fairy-feather': 'フェアリー' }; if (boosts[a.item.id] === m.type)
        x *= 1.2; if (m.knockOff && d && !d.itemConsumed && d.item?.id !== 'none')
        x *= 1.5; return x; }
    function simMoveType(m, field) { if (m.weatherBall && field.weather)
        return { sun: 'ほのお', rain: 'みず', sand: 'いわ', snow: 'こおり' }[field.weather] || m.type; return m.type; }
    function simPower(a, d, m, field) { let power = Number(m.power) || 0; if (m.weightPower) {
        const w = d?.weight || SPECIES_DEX[d?.id]?.weight || 80;
        power = Math.max(20, Math.min(120, Math.floor(w / 20) * 20));
    } if (m.weightRatioPower) {
        const aw = Math.max(0.1, a.weight || SPECIES_DEX[a.id]?.weight || 80), dw = Math.max(0.1, d?.weight || SPECIES_DEX[d?.id]?.weight || 80), r = aw / dw;
        power = r >= 5 ? 120 : r >= 4 ? 100 : r >= 3 ? 80 : r >= 2 ? 60 : 40;
    } if (m.gyroBall)
        power = Math.min(150, Math.floor(25 * effectiveSpeed(d, field) / Math.max(1, effectiveSpeed(a, field))) + 1); if (m.hardPress)
        power = Math.max(1, Math.floor(100 * d.hp / d.maxHP)); if (m.reversal) {
        const q = a.hp / a.maxHP;
        power = q <= .041 ? 200 : q <= .104 ? 150 : q <= .208 ? 100 : q <= .354 ? 80 : q <= .687 ? 40 : 20;
    } if (m.storedPower)
        power = 20 + 20 * Object.values(a.stages).filter(x => x > 0).reduce((z, x) => z + x, 0); if (m.spitUp)
        power = (a.stockpileCount || 0) * 100; if (m.furyCutter)
        power = Math.min(160, (Number(m.power) || 40) * Math.pow(2, Math.max(0, a.furyCutterCount || 0))); if (m.rollout)
        power = Math.min(480, (Number(m.power) || 30) * Math.pow(2, Math.max(0, a.rolloutCount || 0))); if (m.beatUp) {
        const st = field?._sideRefs?.[a.side], team = st?.team || [a];
        const eligible = team.filter(p => p && p.hp > 0 && !p.status);
        power = Math.max(1, eligible.reduce((sum, p) => { const base = SPECIES_DEX[p.id]?.baseStats?.attack || 50; return sum + Math.floor(base / 10) + 5; }, 0));
    } if (m.weatherBall && field.weather)
        power = 100; if (m.doubleIfTargetStatus && d.status)
        power *= 2; if (m.venoshock && ['poison', 'toxic'].includes(d.status))
        power *= 2; if (m.doubleIfUserStatus && a.status)
        power *= 2; if (m.doubleIfDamagedThisTurn && (a.lastDamageAmount || 0) > 0)
        power *= 2; if (m.doubleIfLastMoveFailed && a.previousMoveFailed)
        power *= 2; if (m.doubleIfNoItem && (a.itemConsumed || a.item?.id === 'none'))
        power *= 2; if (m.risingVoltage && field.terrain === 'electric' && grounded(d, field))
        power *= 2; if (m.rainBonus && field.weather === 'rain')
        power *= m.rainBonus; if (m.boostInMisty && field.terrain === 'misty')
        power *= m.boostInMisty; if (m.knockOff && d && !d.itemConsumed && d.item?.id !== 'none')
        power *= 1.5; if (a.ability?.id === 'infinite-track')
        power *= Math.min(2, 1 + Math.max(0, (a.sameMoveCount || 1) - 1) * .2); return power; }
    function damageEstimate(a, d, m, field, randomFactor = 0.925, critical = false) { if (!m || m.category === 'status')
        return 0; if (m.requiresTerrain && !field.terrain)
        return 0; if (m.firstTurnOnly && (a.turnsActive || 0) > 0)
        return 0; if (m.requiresTargetItem && (d.itemConsumed || d.item?.id === 'none'))
        return 0; if (abilityBlockInfo(a, d, m, field))
        return 0; if (m.fixedDamage === 'level')
        return Math.min(d.hp, LEVEL); if (m.superFang)
        return Math.max(1, Math.floor(d.hp / 2)); if (m.endeavor)
        return Math.max(0, d.hp - a.hp); if (m.finalGambit)
        return Math.min(d.hp, a.hp); if (m.ohko)
        return d.hp; if (m.counter) {
        return a.lastDamageCategory === 'physical' ? Math.max(0, Math.min(d.hp, (a.lastDamageAmount || 0) * 2)) : 0;
    } if (m.mirrorCoat) {
        return a.lastDamageCategory === 'special' ? Math.max(0, Math.min(d.hp, (a.lastDamageAmount || 0) * 2)) : 0;
    } if (m.metalBurst) {
        return a.lastDamageAmount > 0 ? Math.max(0, Math.min(d.hp, Math.floor(a.lastDamageAmount * 1.5))) : 0;
    } const power = simPower(a, d, m, field); if (!power)
        return 0; const cat = m.goldenBurn ? (a.attack >= a.specialAttack ? 'physical' : 'special') : m.category; const moveType = effectiveMoveType(a, m, field); let eff = m.struggle ? 1 : typeEffect(moveType, d.types, a.ability.id); if (m.freezeDry && d.types.includes('みず'))
        eff *= 4; if (a.ability.id === 'tinted-lens' && eff > 0 && eff < 1)
        eff *= 2; if (eff === 0)
        return 0; if (m.beelineBeam && eff > 0 && eff < 1)
        eff *= 2; const atkKey = m.useDefenseAsAttack ? 'defense' : (cat === 'physical' ? 'attack' : 'specialAttack'), defKey = m.usePhysicalDefense ? 'defense' : (cat === 'physical' ? 'defense' : 'specialDefense'), atkStat = m.useDefenseAsAttack ? a.defense : (cat === 'physical' ? a.attack : a.specialAttack), defStat = m.usePhysicalDefense ? d.defense : (cat === 'physical' ? (field.wonderRoom > 0 ? d.specialDefense : d.defense) : (field.wonderRoom > 0 ? d.defense : d.specialDefense)); let astage = (d.ability.id === 'unaware' && !m.ignoreDefenderAbility) ? 0 : (a.stages[atkKey] || 0), dstage = (a.ability.id === 'unaware' || m.ignoreDefenderStages) ? 0 : (d.stages[defKey] || 0); if (critical) {
        astage = Math.max(0, astage);
        dstage = Math.min(0, dstage);
    } let atk = Math.max(1, Math.floor(atkStat * stageMult(astage))), def = Math.max(1, Math.floor(defStat * stageMult(dstage))); if (cat==='special' && (field.magicRoom||0)<=0 && d.item?.id==='assault-vest' && !d.itemConsumed) def=Math.floor(def*1.5); if (a.ability.id === 'night-scales' && cat === 'special')
        atk *= 2; if (field.weather === 'snow' && cat === 'physical' && d.types.includes('こおり'))
        def = Math.floor(def * 1.5); if (field.weather === 'sand' && cat === 'special' && !m.usePhysicalDefense && d.types.includes('いわ'))
        def = Math.floor(def * 1.5); let base = Math.floor(((((2 * LEVEL / 5 + 2) * power * atk / def) / 50) + 2)); let stab = m.struggle ? 1 : (a.types.includes(moveType) ? (a.ability.id === 'adaptability' ? 2 : 1.5) : 1); let burn = (a.status === 'burn' && cat === 'physical' && !m.ignoreBurnAttackDrop) ? 0.5 : 1; let fieldMult = 1; if (field.screens && !critical) {
        if (cat === 'physical' && field.screens[d.side]?.reflect > 0)
            fieldMult *= 0.5;
        if (cat === 'special' && field.screens[d.side]?.lightScreen > 0)
            fieldMult *= 0.5;
    } if (field.terrain && grounded(a, field)) {
        if (field.terrain === 'electric' && moveType === 'でんき')
            fieldMult *= 1.3;
        if (field.terrain === 'psychic' && moveType === 'エスパー')
            fieldMult *= 1.3;
        if (field.terrain === 'grassy' && moveType === 'くさ')
            fieldMult *= 1.3;
    } if (field.terrain === 'misty' && grounded(d, field) && moveType === 'ドラゴン')
        fieldMult *= 0.5; if (field.terrain === 'grassy' && ['earthquake', 'v6-136'].includes(m.id) && grounded(d, field))
        fieldMult *= .5; let specialMult = a.helpingHand ? 1.5 : 1; if (a.chargeElectric && moveType === 'でんき')
        specialMult *= 2; if (!m.struggle && a.ability.id === 'sand-skin' && simMoveType(m, field) === 'ノーマル')
        specialMult *= 1.2; if (moveType === 'フェアリー' && (a.ability.id === 'fairy-aura' || d.ability.id === 'fairy-aura' || field?.fairyAura > 0))
        specialMult *= 4 / 3; let dmg = Math.floor(base * stab * eff * randomFactor * weatherMultiplier(moveType, field.weather) * abilityAttackMult(a, { ...m, category: cat, type: moveType }) * abilityDefenseMult(d, { ...m, category: cat, type: moveType }) * itemAttackMult(a, { ...m, category: cat, type: moveType }, eff, d, field) * (critical ? 1.5 : 1) * burn * fieldMult * specialMult); return Math.max(1, dmg); }
    function possibleThreatMoves(pub, difficulty, field) { if (!SPECIES_DEX[pub.speciesId])
        return []; const legal = field?.rules?.moves || null, revealed = pub.revealedMoves.map(id => MOVE_DEX[id]).filter(m => m && (!legal || legal.has(m.id))), ranked = (RANKED_ATTACKS[pub.speciesId] || []).filter(m => !legal || legal.has(m.id)); const cap = difficulty === 'normal' ? 3 : difficulty === 'strong' ? 5 : 8, out = [...revealed]; for (const m of ranked) {
        if (out.length >= cap)
            break;
        if (!out.some(x => x.id === m.id))
            out.push(m);
    } return out; }
    function incomingThreat(candidate, pub, field, difficulty) { const model = neutralModel(pub.speciesId, field?.rules); model.stages = { ...pub.stages }; model.status = pub.status; let worst = 0, avg = 0, n = 0; for (const m of possibleThreatMoves(pub, difficulty, field)) {
        let d = damageEstimate(model, candidate, m, field, 0.925, false);
        if (Array.isArray(m.multiHit))
            d *= expectedHits(m);
        d *= ((m.accuracy ?? 100) / 100) * moveTempoFactor(m);
        worst = Math.max(worst, d);
        avg += d;
        n++;
    } return { worst, avg: n ? avg / n : 0 }; }
    function statusScore(move, a, d, field) { let s = 0; if (move.healRatio)
        s += a.hp < a.maxHP * 0.55 ? 55 : 10; if (move.selfStatChanges)
        s += a.hp > a.maxHP * 0.45 ? 35 : 8; if (move.directStatus || move.toxic || move.yawn)
        s += d.status ? 2 : 38; if (move.hazard)
        s += 22; if (move.weather)
        s += field.weather === move.weather ? 2 : 22; if (move.tailwind)
        s += field.tailwind[a.side] > 0 ? 2 : 30; if (move.trickRoom)
        s += 25; if (move.protect)
        s += a.protectChain ? 5 : 18; if (move.encoreTurns || move.disableTurns || move.tauntTurns)
        s += 24; if (move.substitute)
        s += a.hp > a.maxHP * 0.55 ? 20 : 2; return s; }
    function moveScore(sideState, oppSide, a, d, move, field, difficulty, rng) {
        if (move.pp <= 0)
            return -1e6;
        if (a.choiceLock && a.choiceLock !== move.id)
            return -1e6;
        const pub = publicView(sideState, d); // sideState contains what this side knows about opponent via knowledge stored on sideState
        if (move.requiresTerrain && !field.terrain)
            return -1e6;
        if (move.firstTurnOnly && (a.turnsActive || 0) > 0)
            return -1e6;
        if (move.requiresTargetItem && pub.itemId === 'none')
            return -1e6;
        if (move.category === 'status')
            return statusScore(move, a, d, field) + (rng() - 0.5) * (difficulty === 'normal' ? 18 : 4);
        const model = neutralModel(pub.speciesId);
        model.stages = { ...pub.stages };
        model.status = pub.status;
        model.types = [...pub.types];
        let dmg = damageEstimate(a, model, move, field, 0.925, false);
        if (Array.isArray(move.multiHit))
            dmg *= expectedHits(move);
        let s = dmg / Math.max(1, model.maxHP) * 100;
        const acc = (move.accuracy ?? 100) / 100, instantCharge = ((move.twoTurn === 'solarBeam' && field.weather === 'sun') || (move.twoTurn === 'electroShot' && field.weather === 'rain') || ((field.magicRoom || 0) <= 0 && a.item.id === 'power-herb' && !a.itemConsumed));
        s *= acc * moveTempoFactor(move, { instantCharge });
        if (dmg >= model.hp)
            s += move.recharge ? 26 : 55;
        if ((move.priority || 0) > 0)
            s += 12;
        if (move.drainRatio)
            s += 12;
        if (move.pivot)
            s += 15;
        if (move.recoilRatio)
            s -= Math.min(24, move.recoilRatio * 42);
        if (move.recoilMaxHPRatio)
            s -= Math.min(42, move.recoilMaxHPRatio * 75);
        if (move.recharge)
            s -= 24;
        if ((move.twoTurn || move.twoTurnWeather) && !instantCharge)
            s -= difficulty === 'very-strong' ? 28 : 18;
        if (move.selfFaint || move.selfFaintAfterDamage || move.finalGambit)
            s -= a.hp / a.maxHP > .55 ? 78 : 35;
        if (move.futureSight)
            s -= 16;
        if (move.suckerPunch)
            s -= 18;
        if (move.upperHand)
            s -= 28;
        if (move.requiresTargetItem && pub.itemId == null)
            s -= 8;
        if (move.rampage)
            s -= 10;
        return s + (rng() - 0.5) * (difficulty === 'normal' ? 20 : difficulty === 'strong' ? 7 : 2);
    }
    function chooseAction(sideState, oppState, field, difficulty, rng) {
        const a = sideState.active, d = oppState.active;
        if (!a || a.hp <= 0)
            return { type: 'switch', index: bestSwitch(sideState, oppState, field, difficulty, rng, true) };
        if (a.recharge)
            return { type: 'recharge', actor: a };
        if (a.charging)
            return { type: 'move', moveId: a.charging, forced: true, actor: a };
        if (a.rampageMoveId)
            return { type: 'move', moveId: a.rampageMoveId, forced: true, actor: a };
        const pub = publicView(sideState, d);
        const threat = incomingThreat(a, pub, field, difficulty);
        const hp = a.hp;
        const imprisonIds = oppState.active?.imprison ? new Set(oppState.active.moves.map(x => x.id)) : null;
        let usable = a.moves.filter(m => m.pp > 0 && (!a.choiceLock || a.choiceLock === m.id) && !(a.tauntTurns > 0 && m.category === 'status') && !((field.magicRoom||0)<=0 && !a.itemConsumed && a.item?.id==='assault-vest' && m.category==='status') && !(a.disableTurns > 0 && a.disableMoveId === m.id) && !(imprisonIds?.has(m.id)));
        if (a.encoreTurns > 0 && a.encoreMoveId) {
            const enc = usable.find(m => m.id === a.encoreMoveId);
            if (enc)
                usable = [enc];
        }
        if (!usable.length) {
            const sw = bestSwitch(sideState, oppState, field, difficulty, rng, false, true);
            if (sw >= 0 && sideState.team[sw] !== a)
                return { type: 'switch', index: sw, actor: a, ppExhausted: true };
            return { type: 'move', moveId: 'struggle', forced: true, actor: a };
        }
        let bestMove = null, bestMoveScore = -1e9;
        for (const m of usable) {
            const sc = moveScore(sideState, oppState, a, d, m, field, difficulty, rng);
            if (sc > bestMoveScore) {
                bestMoveScore = sc;
                bestMove = m;
            }
        }
        const sw = bestSwitch(sideState, oppState, field, difficulty, rng, false);
        if (sw >= 0 && sideState.team[sw] !== a) {
            const c = sideState.team[sw];
            const t = incomingThreat(c, pub, field, difficulty);
            let swScore = (1 - t.worst / c.maxHP) * 100 + (c.hp / c.maxHP) * 35;
            const currentRisk = threat.worst >= hp ? 80 : (threat.worst / hp) * 45;
            if (difficulty === 'very-strong' && currentRisk > 55)
                swScore += 35;
            if (swScore > bestMoveScore + (difficulty === 'normal' ? 38 : difficulty === 'strong' ? 22 : 10))
                return { type: 'switch', index: sw, actor: a };
        }
        return { type: 'move', moveId: bestMove?.id || a.moves[0]?.id, actor: a };
    }
    function bestSwitch(sideState, oppState, field, difficulty, rng, replacement, requireUsablePP = false) { if (!replacement && (sideState.active?.ingrain || (sideState.active?.trappedTurns || 0) > 0))
        return -1; if (!replacement && oppState.active?.ability?.id === 'shadow-tag' && !sideState.active?.types?.includes('ゴースト'))
        return -1; const pub = oppState.active ? publicView(sideState, oppState.active) : null; let best = -1, score = -1e9; for (let i = 0; i < sideState.team.length; i++) {
        const p = sideState.team[i];
        if (p.hp <= 0 || p === sideState.active)
            continue;
        if (requireUsablePP && !p.moves.some(m => m.pp > 0))
            continue;
        const hpFrac = p.hp / Math.max(1, p.maxHP);
        let s = hpFrac * 38;
        if (pub) {
            const t = incomingThreat(p, pub, field, difficulty), threatRatio = t.worst / Math.max(1, p.maxHP), expectedRatio = t.avg / Math.max(1, p.maxHP), model = neutralModel(pub.speciesId, field?.rules);
            let bestOff = 0;
            for (const m of p.moves)
                if (m.category !== 'status') {
                    let dmg = damageEstimate(p, model, m, field, 0.925, false);
                    if (Array.isArray(m.multiHit))
                        dmg *= expectedHits(m);
                    dmg *= ((m.accuracy ?? 100) / 100) * moveTempoFactor(m);
                    bestOff = Math.max(bestOff, dmg / Math.max(1, model.maxHP));
                }
            s += bestOff * 78 + (1 - expectedRatio) * 72 - (threatRatio * 85);
            const faster = effectiveSpeed(p, field) > effectiveSpeed(model, field);
            if (threatRatio >= hpFrac * .98) {
                s -= faster && bestOff >= model.hp / model.maxHP ? 55 : 260;
            }
            else if (threatRatio >= hpFrac * .75)
                s -= 80;
            if (bestOff >= model.hp / model.maxHP)
                s += faster ? 65 : 30;
            if (bestOff < .28 && threatRatio > .55)
                s -= 55;
        }
        s += rng() * 4;
        if (s > score) {
            score = s;
            best = i;
        }
    } return best; }
    function selectionScore(set, oppSpeciesId, rules, meta = null) { const p = makePokemon(set, 'x'), model = neutralModel(oppSpeciesId, rules), f = { weather: null, terrain: null, tailwind: { x: 0, y: 0 }, screens: { x: { reflect: 0, lightScreen: 0 }, y: { reflect: 0, lightScreen: 0 } }, rules }; let off = 0, utility = 0; for (const m of p.moves) {
        if (m.category !== 'status') {
            let dmg = damageEstimate(p, model, m, f, 0.925);
            if (Array.isArray(m.multiHit))
                dmg *= expectedHits(m);
            dmg *= ((m.accuracy ?? 100) / 100) * moveTempoFactor(m);
            off = Math.max(off, dmg);
            if (m.pivot)
                utility += 4;
            if (m.priority > 0)
                utility += 2;
            continue;
        }
        if (m.selfStatChanges) {
            const n = Object.values(m.selfStatChanges).filter(x => x > 0).reduce((a, b) => a + b, 0);
            utility += Math.min(18, n * 6);
        }
        if (m.healRatio || m.rest)
            utility += 8;
        if (m.hazard)
            utility += 5;
        if (m.tailwind || m.screen || m.trickRoom)
            utility += 6;
        if (m.directStatus || m.toxic || m.yawn)
            utility += 4;
    } if (set.itemId === 'focus-sash')
        utility += 6; if (set.abilityId === 'shadow-tag')
        utility += 10; if (set.abilityId === 'regenerator')
        utility += 6; if (set.abilityId === 'schooling')
        utility += 50; if (set.abilityId === 'power-construct')
        utility += 35; if (set.abilityId === 'night-scales')
        utility += 20; if (set.abilityId === 'halloween-punk' && set.itemId === 'mystery-candy')
        utility += 10; let th = 0; for (const m of (RANKED_ATTACKS[oppSpeciesId] || []).filter(m => rules.moves.has(m.id)).slice(0, 6)) {
        let dmg = damageEstimate(model, p, m, f, 0.925);
        if (Array.isArray(m.multiHit))
            dmg *= expectedHits(m);
        dmg *= ((m.accuracy ?? 100) / 100) * moveTempoFactor(m);
        th = Math.max(th, dmg);
    } return off / model.maxHP * 100 - th / p.maxHP * 55 + utility + selectedExperience(meta, set.speciesId) + matchupExperience(meta, set.speciesId, oppSpeciesId); }
    function selectThree(roster, oppRoster, difficulty, rng, rules, meta = null) { if (difficulty === 'normal')
        return rng.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); const opp = oppRoster.map(x => x.speciesId); let best = [0, 1, 2], bestScore = -1e9; for (let a = 0; a < 6; a++)
        for (let b = a + 1; b < 6; b++)
            for (let c = b + 1; c < 6; c++) {
                const trio = [a, b, c];
                let score = 0;
                for (const oid of opp) {
                    const vals = trio.map(i => selectionScore(roster[i], oid, rules, meta)).sort((x, y) => y - x);
                    score += vals[0] + (difficulty === 'very-strong' ? (vals[1] || 0) * 0.18 : 0);
                }
                if (score > bestScore) {
                    bestScore = score;
                    best = trio;
                }
            } best.sort((i, j) => opp.reduce((sum, o) => sum + selectionScore(roster[j], o, rules, meta) - selectionScore(roster[i], o, rules, meta), 0)); return best; }
    function resetVolatileOnEntry(p) { p.stages = DEFAULT_STAGES(); p.recharge = false; p.charging = null; p.protect = false; p.protectChain = 0; p.protectContactParalyze = false; p.endure = false; p.redirect = false; p.helpingHand = false; p.seeded = false; p.seedSourceSide = null; p.trappedTurns = 0; p.destinyBond = false; p.imprison = false; p.raisedThisTurn = false; p.substituteHP = 0; p.cursed = false; p.smackDown = false; p.rampageMoveId = null; p.rampageTurns = 0; p.confusedTurns = 0; p.tauntTurns = 0; p.encoreTurns = 0; p.encoreMoveId = null; p.disableTurns = 0; p.disableMoveId = null; p.yawnTurns = 0; p.recoveryBlockTurns = 0; p.magnetRiseTurns = 0; p.aquaRing = false; p.ingrain = false; p.focusEnergy = 0; p.choiceLock = null; p.sameMoveCount = 0; p.lastConsecutiveMoveId = null; p.furyCutterCount = 0; p.rolloutCount = 0; }
    function applyEntry(p, field, ownerState, observerState) { p._fieldRef = field; resetVolatileOnEntry(p); if (field?.lunarDance?.[p.side]) {
        p.hp = p.maxHP;
        p.status = null;
        p.statusTurns = 0;
        p.toxicCounter = 0;
        for (const m of p.moves)
            m.pp = m.maxPP;
        field.lunarDance[p.side] = false;
    } syncResearchForm(p); updateForecast(p, field); p.turnsActive = 0; if (observerState)
        reveal(observerState, p, 'seen'); const id = p.ability.id; if (id === 'clean-land') {
        field.trickRoom = 0;
        field.gravity = 0;
        field.magicRoom = 0;
        field.wonderRoom = 0;
        if (observerState)
            reveal(observerState, p, 'ability', id);
    } if (id === 'drizzle') {
        field.weather = 'rain';
        field.weatherTurns = 5;
        if (observerState)
            reveal(observerState, p, 'ability', id);
    } if (id === 'sand-stream') {
        field.weather = 'sand';
        field.weatherTurns = 5;
        if (observerState)
            reveal(observerState, p, 'ability', id);
    } if (id === 'trick-builder' && !p._trickBuilderUsed) {
        field.trickRoom = Math.max(field.trickRoom, 5);
        p._trickBuilderUsed = true;
        if (observerState)
            reveal(observerState, p, 'ability', id);
    } if (id === 'speed-boost' && observerState)
        reveal(observerState, p, 'ability', id); if (ownerState?.active)
        for (const q of Array.isArray(ownerState.active) ? ownerState.active : [ownerState.active])
            updateForecast(q, field); if (observerState?.active)
        for (const q of Array.isArray(observerState.active) ? observerState.active : [observerState.active])
            updateForecast(q, field); }
    function switchTo(sideState, index, field, stats, oppState) { const old = sideState.active; if (old && old.hp > 0 && old.ability.id === 'regenerator') {
        old.hp = Math.min(old.maxHP, old.hp + Math.floor(old.maxHP / 3));
        if (oppState)
            reveal(oppState, old, 'ability', 'regenerator');
    } if (old && old.ability.id === 'natural-cure' && old.status) {
        old.status = null;
        old.statusTurns = 0;
        old.toxicCounter = 0;
        if (oppState)
            reveal(oppState, old, 'ability', 'natural-cure');
    } sideState.activeIndex = index; sideState.active = sideState.team[index]; sideState.active.protect = false; sideState.active.protectChain = 0; sideState.active.choiceLock = null; sideState.active.charging = null; sideState.active.rampageMoveId = null; sideState.active.rampageTurns = 0; stats.switches[sideState.side]++; applyEntry(sideState.active, field, sideState, oppState); }
    function consumeBerryForDamage(d, move, eff, damage, field = null) { if (move?.struggle || (field?.magicRoom || 0) > 0)
        return damage; const map = { 'occa-berry': 'ほのお', 'passho-berry': 'みず', 'wacan-berry': 'でんき', 'rindo-berry': 'くさ', 'yache-berry': 'こおり', 'chople-berry': 'かくとう', 'kebia-berry': 'どく', 'shuca-berry': 'じめん', 'coba-berry': 'ひこう', 'payapa-berry': 'エスパー', 'tanga-berry': 'むし', 'charti-berry': 'いわ', 'kasib-berry': 'ゴースト', 'haban-berry': 'ドラゴン', 'colbur-berry': 'あく', 'babiri-berry': 'はがね', 'roseli-berry': 'フェアリー' }; if (d.itemConsumed)
        return damage; if (d.item.id === 'chilan-berry' && move.type === 'ノーマル') {
        d.itemConsumed = true;
        return Math.max(1, Math.floor(damage / 2));
    } if (map[d.item.id] === move.type && eff > 1) {
        d.itemConsumed = true;
        return Math.max(1, Math.floor(damage / 2));
    } return damage; }
    function grounded(p, field = null) { if (field?.gravity > 0 || p?.smackDown)
        return true; return !p.types.includes('ひこう') && p.ability.id !== 'levitate' && !(p.item?.id === 'air-balloon' && !p.itemConsumed) && !(p.magnetRiseTurns > 0); }
    function updateForecast(p, field) { if (!p || p.ability?.id !== 'forecast' || p.id !== 'dolpika')
        return; const sp = SPECIES_DEX[p.id], key = field?.weather || 'clear', form = sp?.forms?.[key] || sp?.forms?.clear; if (form) {
        p.formKey = key;
        p.name = form.name || sp.name;
        p.types = [...(form.types || sp.types)];
        p.weight = (p.ability.id === 'light-metal' ? (form.weight ?? sp.weight ?? p.weight) / 2 : (form.weight ?? sp.weight ?? p.weight));
    } }
    function effectiveMoveType(a, m, field) { let type = simMoveType(m, field); if (!m?.struggle && a?.ability?.id === 'sand-skin' && type === 'ノーマル')
        type = 'じめん'; return type; }
    function moveAccuracy(a, m, field) { if (m?.accuracy == null)
        return 100; if (m.alwaysHitInSnow && field?.weather === 'snow')
        return 100; if ((m.id === 'hurricane' || m.id === 'thunder') && field?.weather === 'rain')
        return 100; if ((m.id === 'hurricane' || m.id === 'thunder') && field?.weather === 'sun')
        return 50; let x = Number(m.accuracy) || 100; if (field?.gravity > 0)
        x *= 5 / 3; if (a?.ability?.id === 'compound-eyes')
        x *= 1.3; return Math.min(100, x); }
    function abilityBlockInfo(a, d, m, field) { if (!a || !d || !m || m.ignoreDefenderAbility)
        return null; const type = effectiveMoveType(a, m, field), id = d.ability?.id; if (id === 'soundproof' && m.sound)
        return { kind: 'soundproof' }; if (id === 'windmill' && m.wind)
        return { kind: 'windmill', stage: ['speed', 1] }; if ((m.priority || 0) > 0 && id === 'vivid-body')
        return { kind: 'vivid-body' }; if (id === 'damp' && m.explosive)
        return { kind: 'damp' }; if (type === 'じめん') {
        if (id === 'levitate' && !d.smackDown && !(field?.gravity > 0))
            return { kind: 'levitate' };
        if (id === 'earth-eater')
            return { kind: 'earth-eater', heal: .25 };
    } if (type === 'でんき' && id === 'lightning-rod')
        return { kind: 'lightning-rod', stage: ['specialAttack', 1] }; if (type === 'くさ' && id === 'sap-sipper')
        return { kind: 'sap-sipper', stage: ['attack', 1] }; if (type === 'みず' && id === 'dry-skin')
        return { kind: 'dry-skin', heal: .25 }; return null; }
    function applyAbilityBlock(a, d, m, field) { const info = abilityBlockInfo(a, d, m, field); if (!info)
        return false; if (info.heal && d.hp > 0)
        d.hp = Math.min(d.maxHP, d.hp + Math.max(1, Math.floor(d.maxHP * info.heal))); if (info.stage)
        changeStage(d, { [info.stage[0]]: info.stage[1] }, d); return true; }
    function sideHasAbility(target, id) { const st = target?._fieldRef?._sideRefs?.[target.side], active = Array.isArray(st?.active) ? st.active : [st?.active]; return active.some(p => p && p.hp > 0 && p.ability?.id === id); }
    function statusBlockedByAbility(source, target, move, status = null) { if (!target || move?.ignoreDefenderAbility)
        return false; const id = target.ability?.id; if (id === 'good-as-gold' && source && source.side !== target.side)
        return true; if (status === 'sleep' && (id === 'sweet-veil' || sideHasAbility(target, 'sweet-veil')))
        return true; if (status === 'burn' && id === 'water-bubble')
        return true; return false; }
    function isSheerForceMove(m) { return !!(m && (m.secondaryStatus || m.targetStatChanges || m.targetStatChangeChance || m.selfStatChangeChance || m.confuseChance || m.flinchChance || m.allStatBoostChance)); }
    function criticalChance(a, m) { const stage = (m?.highCrit ? 1 : 0) + Math.max(0, a?.focusEnergy || 0); return stage >= 3 ? 1 : stage === 2 ? .5 : stage === 1 ? 1 / 8 : 1 / 24; }
    function archetypeKey(p) { return `${p.id}|${p.ability?.id || '?'}`; }
    function recordArchetypeEncounter(stats, a, d, { attempt = false, dealt = 0, ko = false } = {}) { if (!stats?.archetypeEncounters || !a || !d)
        return; const key = `${archetypeKey(a)}>${archetypeKey(d)}`, r = stats.archetypeEncounters[key] || (stats.archetypeEncounters[key] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 }); if (attempt)
        r.games++; if (dealt > 0) {
        r.hits++;
        r.damage += dealt;
    } if (ko) {
        r.wins++;
        r.kos++;
        const rk = `${archetypeKey(d)}>${archetypeKey(a)}`, rr = stats.archetypeEncounters[rk] || (stats.archetypeEncounters[rk] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
        rr.losses++;
        rr.deaths++;
    } }
    function applyStatus(d, status, rng, source = null, move = null) { if (d.status || statusBlockedByAbility(source, d, move, status))
        return false; const terrain = d._fieldRef?.terrain; if (grounded(d, d._fieldRef)) {
        if (terrain === 'misty')
            return false;
        if (terrain === 'electric' && status === 'sleep')
            return false;
    } if (source && source.side !== d.side && d._fieldRef?.safeguard?.[d.side] > 0)
        return false; if (status === 'burn' && d.types.includes('ほのお'))
        return false; if (['poison', 'toxic'].includes(status) && (d.types.includes('どく') || d.types.includes('はがね')))
        return false; if (status === 'paralysis' && d.types.includes('でんき'))
        return false; if (status === 'freeze' && d.types.includes('こおり'))
        return false; d.status = status; if (status === 'sleep')
        d.statusTurns = 1 + rng.int(3); if (status === 'toxic')
        d.toxicCounter = 1; if ((d._fieldRef?.magicRoom||0)<=0 && !d.itemConsumed && (d.item?.id==='lum-berry' || (d.item?.id==='chesto-berry' && status==='sleep'))) { d.status=null; d.statusTurns=0; d.toxicCounter=1; d.itemConsumed=true; } return true; }
    function changeStage(p, changes, source = null) { if (!changes)
        return; let lowered = false; for (const [k, v0] of Object.entries(changes)) {
        if (!(k in p.stages))
            continue;
        let v = Number(v0) || 0;
        if (v < 0 && source && source !== p && source.side !== p.side && (['clear-body', 'white-smoke'].includes(p.ability.id) || p._fieldRef?.mist?.[p.side] > 0))
            continue;
        const before = p.stages[k], after = clamp(before + v, -6, 6);
        p.stages[k] = after;
        if (after > before)
            p.raisedThisTurn = true;
        if (after < before && source && source !== p && source.side !== p.side)
            lowered = true;
    } if (lowered && p.ability.id === 'competitive')
        p.stages.specialAttack = clamp(p.stages.specialAttack + 2, -6, 6); }
    function crashOnFail(p, m) { if (m?.crashMaxHPRatio && p?.hp > 0)
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP * m.crashMaxHPRatio))); }
    function consumeBugBite(attacker, defender) { if (!attacker || !defender || defender.itemConsumed || !String(defender.item?.id || '').includes('berry'))
        return; const id = defender.item.id; defender.itemConsumed = true; if (id === 'sitrus-berry')
        attacker.hp = Math.min(attacker.maxHP, attacker.hp + Math.max(1, Math.floor(attacker.maxHP / 4))); if (id === 'lum-berry' && attacker.status) {
        attacker.status = null;
        attacker.statusTurns = 0;
        attacker.toxicCounter = 0;
    } if (id === 'chesto-berry' && attacker.status === 'sleep') {
        attacker.status = null;
        attacker.statusTurns = 0;
    } }
    function statusTargetsOpponent(m) { return !!(m && (m.directStatus || m.toxic || m.targetStatChanges || m.tauntTurns || m.encoreTurns || m.disableTurns || m.yawn || m.confuse || m.hazard || m.seedTarget || m.trapTarget || m.setAbility || m.setTypes || m.entrainment || m.spitePP)); }
    function powderBlocked(target, field) { return !!(target && (target.types?.includes('くさ') || ((field?.magicRoom || 0) <= 0 && !target.itemConsumed && target.item?.id === 'safety-goggles'))); }
    function executeMove(sideState, oppState, move, field, rng, stats) {
        const a = sideState.active, d = oppState.active;
        if (!a || !d || a.hp <= 0)
            return;
        move = move?.id === 'struggle' ? STRUGGLE_MOVE : (move || STRUGGLE_MOVE);
        if (a.recharge) {
            a.recharge = false;
            return;
        }
        if (a.flinched) {
            a.flinched = false;
            return;
        }
        if (a.status === 'sleep' && !move?.sleepTalk && !a._sleepTalkCalled) {
            if (a.statusTurns > 0) {
                a.statusTurns--;
                return;
            }
            a.status = null;
        }
        if (a.status === 'freeze') {
            if (rng() < 0.2)
                a.status = null;
            else
                return;
        }
        if (a.confusedTurns > 0) {
            a.confusedTurns--;
            if (rng() < 1 / 3) {
                const self = Math.max(1, Math.floor(a.maxHP / 8));
                a.hp = Math.max(0, a.hp - self);
                return;
            }
        }
        if (a.status === 'paralysis' && rng() < 0.25)
            return;
        a.previousMoveFailed = !!a.lastMoveFailed;
        a.lastMoveFailed = false;
        const actual = move.struggle ? STRUGGLE_MOVE : (a.moves.find(x => x.id === move.id) || move), isSecondCharge = a.charging === actual.id, isRampageContinuation = a.rampageMoveId === actual.id, weatherInstant = (actual.twoTurn === 'solarBeam' && field.weather === 'sun') || (actual.twoTurn === 'electroShot' && field.weather === 'rain'), herbInstant = !!(actual.twoTurn || actual.twoTurnWeather) && (field.magicRoom || 0) <= 0 && a.item.id === 'power-herb' && !a.itemConsumed;
        if (!actual.struggle && !isSecondCharge && !isRampageContinuation && actual.pp > 0)
            actual.pp--;
        if (!actual.struggle)
            reveal(oppState, a, 'move', actual.id);
        if (a.lastConsecutiveMoveId === actual.id)
            a.sameMoveCount = Math.min(6, (a.sameMoveCount || 1) + 1);
        else {
            a.lastConsecutiveMoveId = actual.id;
            a.sameMoveCount = 1;
        }
        a.lastMoveId = actual.id;
        const legalForSpecies = !actual.struggle && (SPECIES_DEX[a.id]?.movePool || []).includes(actual.id) && a.set?.moves?.includes(actual.id);
        if (!isSecondCharge && !isRampageContinuation && legalForSpecies) {
            stats.moves[actual.id] = stats.moves[actual.id] || { uses: 0, hits: 0, damage: 0, kos: 0 };
            stats.moves[actual.id].uses++;
            if (stats.species) {
                const ss = stats.species[a.id] || (stats.species[a.id] = newSpeciesStats());
                const sm = ss.moves[actual.id] || (ss.moves[actual.id] = { uses: 0, hits: 0, damage: 0, kos: 0 });
                sm.uses++;
            }
        }
        if (stats.encounters && d) {
            const ek = `${a.id}>${d.id}`;
            const er = stats.encounters[ek] || (stats.encounters[ek] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 });
            er.games++;
        }
        if (actual.singlesFail) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.requiresTerrain && !field.terrain) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.firstTurnOnly && (a.turnsActive || 0) > 0) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.requiresTargetItem && (d.itemConsumed || d.item.id === 'none')) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.explosive && [a, d].some(q => q?.hp > 0 && q.ability?.id === 'damp')) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.spitUp && !(a.stockpileCount > 0)) {
            a.lastMoveFailed = true;
            return;
        }
        if (applyAbilityBlock(a, d, actual, field)) {
            a.lastMoveFailed = true;
            crashOnFail(a, actual);
            return;
        }
        if ((actual.twoTurn || actual.twoTurnWeather) && !isSecondCharge && !weatherInstant && !herbInstant) {
            a.charging = actual.id;
            if (actual.twoTurnWeather) {
                field.weather = actual.twoTurnWeather;
                field.weatherTurns = 5;
            }
            if (actual.chargeBoost)
                changeStage(a, actual.chargeBoost);
            return;
        }
        if (isSecondCharge)
            a.charging = null;
        else if ((actual.twoTurn || actual.twoTurnWeather) && herbInstant) {
            a.itemConsumed = true;
            if (actual.twoTurnWeather) {
                field.weather = actual.twoTurnWeather;
                field.weatherTurns = 5;
            }
            if (actual.chargeBoost)
                changeStage(a, actual.chargeBoost);
            reveal(oppState, a, 'item', a.item.id);
        }
        else if ((actual.twoTurn || actual.twoTurnWeather) && weatherInstant && actual.chargeBoost)
            changeStage(a, actual.chargeBoost);
        if (actual.rampage && !a.rampageMoveId) {
            a.rampageMoveId = actual.id;
            a.rampageTurns = 2 + rng.int(2);
        }
        if (actual.futureSight) {
            field.futureSight = field.futureSight || { A: [], B: [] };
            field.futureSight[d.side].push({ turns: 2, attacker: a, move: actual });
            return;
        }
        if (actual.suckerPunch && !(oppState.pendingAction?.type === 'move' && MOVE_DEX[oppState.pendingAction.moveId]?.category !== 'status' && !oppState.acted)) {
            a.lastMoveFailed = true;
            return;
        }
        if (actual.category === 'status') {
            if (actual.endure || actual.protect || actual.protectLike) {
                const chance = a.protectChain ? Math.pow(1 / 3, a.protectChain) : 1;
                if (rng() < chance) {
                    a.protectChain++;
                    if (actual.endure)
                        a.endure = true;
                    else
                        a.protect = true;
                    if (actual.contactParalyzeProtect)
                        a.protectContactParalyze = true;
                    if (actual.cureStatusOnProtect && a.status) {
                        a.status = null;
                        a.statusTurns = 0;
                        a.toxicCounter = 0;
                    }
                }
                return;
            }
            a.protectChain = 0;
            const hostile = a.side !== d.side;
            if (hostile && actual.powder && powderBlocked(d, field)) {
                a.lastMoveFailed = true;
                return;
            }
            const blocked = hostile && statusBlockedByAbility(a, d, actual, actual.directStatus || (actual.toxic ? 'toxic' : null));
            const bounced = hostile && d.ability.id === 'magic-bounce' && !actual.ignoreDefenderAbility && statusTargetsOpponent(actual);
            if (blocked && !bounced) {
                a.lastMoveFailed = true;
                return;
            }
            const target = bounced ? a : d, source = bounced ? d : a;
            if (hostile && d.substituteHP > 0 && !actual.sound && !actual.ignoreSubstitute) {
                a.lastMoveFailed = true;
                return;
            }
            if (actual.sleepTalk) {
                if (a.status !== 'sleep') {
                    a.lastMoveFailed = true;
                    return;
                }
                const opts = a.moves.filter(x => x.id !== actual.id && x.pp > 0 && !x.sleepTalk && !x.twoTurn && !x.twoTurnWeather);
                if (!opts.length) {
                    a.lastMoveFailed = true;
                    return;
                }
                const called = rng.pick(opts), oldpp = called.pp;
                a._sleepTalkCalled = true;
                executeMove(sideState, oppState, called, field, rng, stats);
                a._sleepTalkCalled = false;
                called.pp = oldpp;
                return;
            }
            if (actual.v71AntMarch) {
                if (a.hp <= a.maxHP / 2) {
                    a.lastMoveFailed = true;
                    return;
                }
                a.hp = Math.max(1, a.hp - Math.floor(a.maxHP / 2));
            }
            if (actual.growth)
                changeStage(a, { attack: field.weather === 'sun' ? 2 : 1, specialAttack: field.weather === 'sun' ? 2 : 1 }, a);
            if (actual.curse) {
                if (a.types.includes('ゴースト')) {
                    if (a.hp <= a.maxHP / 2) {
                        a.lastMoveFailed = true;
                        return;
                    }
                    a.hp = Math.max(1, a.hp - Math.floor(a.maxHP / 2));
                    d.cursed = true;
                }
                else
                    changeStage(a, { attack: 1, defense: 1, speed: -1 }, a);
            }
            if (actual.destinyBond)
                a.destinyBond = true;
            if (actual.imprison)
                a.imprison = true;
            if (actual.trapTarget && !d.protect && target)
                target.trappedTurns = Math.max(target.trappedTurns || 0, 99);
            if (actual.seedTarget && !d.protect && target && !target.types.includes('くさ')) {
                target.seeded = true;
                target.seedSourceSide = source.side;
            }
            if (actual.spitePP && !d.protect && target?.lastMoveId) {
                const lm = target.moves.find(x => x.id === target.lastMoveId);
                if (lm)
                    lm.pp = Math.max(0, lm.pp - Number(actual.spitePP || 4));
            }
            if (actual.swapItems && !d.protect) {
                const ai = a.item, ac = a.itemConsumed;
                a.item = d.item;
                a.itemConsumed = d.itemConsumed;
                d.item = ai;
                d.itemConsumed = ac;
            }
            if (actual.tauntTurns && !d.protect && target)
                target.tauntTurns = Math.max(target.tauntTurns || 0, actual.tauntTurns);
            if (actual.encoreTurns && !d.protect && target?.lastMoveId) {
                target.encoreTurns = actual.encoreTurns;
                target.encoreMoveId = target.lastMoveId;
            }
            if (actual.disableTurns && !d.protect && target?.lastMoveId) {
                target.disableTurns = actual.disableTurns;
                target.disableMoveId = target.lastMoveId;
            }
            if (actual.yawn && !d.protect && target && !target.status)
                target.yawnTurns = 2;
            if (actual.substitute) {
                const cost = Math.floor(a.maxHP / 4);
                if (a.hp > cost && !a.substituteHP) {
                    a.hp -= cost;
                    a.substituteHP = cost;
                }
                else {
                    a.lastMoveFailed = true;
                    return;
                }
            }
            if (actual.wish)
                field.wish[a.side] = { turns: 2, heal: Math.max(1, Math.floor(a.maxHP / 2)) };
            if (actual.mist)
                field.mist[a.side] = 5;
            if (actual.safeguard)
                field.safeguard[a.side] = 5;
            if (actual.quickGuard)
                field.quickGuard[a.side] = 1;
            if (actual.magicRoom)
                field.magicRoom = field.magicRoom > 0 ? 0 : 5;
            if (actual.wonderRoom)
                field.wonderRoom = field.wonderRoom > 0 ? 0 : 5;
            if (actual.batonPass) {
                const oldStages = { ...a.stages }, oldSub = a.substituteHP, oldAqua = a.aquaRing, idx = bestSwitch(sideState, oppState, field, sideState.difficulty, rng, false);
                if (idx >= 0) {
                    switchTo(sideState, idx, field, stats, oppState);
                    sideState.active.stages = { ...oldStages };
                    sideState.active.substituteHP = oldSub;
                    sideState.active.aquaRing = oldAqua;
                    hazardOnEntry(sideState.active, field);
                }
                return;
            }
            if (actual.lunarDance) {
                field.lunarDance[a.side] = true;
                a.hp = 0;
                return;
            }
            if (actual.healRatio && a.hp > 0 && a.recoveryBlockTurns <= 0)
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * actual.healRatio)));
            if (actual.healByWeather && a.hp > 0 && a.recoveryBlockTurns <= 0) {
                const r = field.weather === 'sun' ? 2 / 3 : ['rain', 'sand', 'snow'].includes(field.weather) ? 1 / 4 : 1 / 2;
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * r)));
            }
            if (actual.rest && a.hp < a.maxHP && a.recoveryBlockTurns <= 0) {
                a.hp = a.maxHP;
                a.status = 'sleep';
                a.statusTurns = 2;
            }
            if (actual.bellyDrum && a.hp > a.maxHP / 2) {
                a.hp -= Math.floor(a.maxHP / 2);
                a.stages.attack = 6;
            }
            if (actual.stockpile && a.stockpileCount < 3) {
                a.stockpileCount++;
                changeStage(a, { defense: 1, specialDefense: 1 }, a);
            }
            if (actual.swallow && a.stockpileCount > 0 && a.recoveryBlockTurns <= 0) {
                const ratios = [0, .25, .5, 1], r = ratios[a.stockpileCount] || 1;
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * r)));
                a.stockpileCount = 0;
            }
            if (actual.painSplit && !d.protect) {
                const avg = Math.floor((a.hp + d.hp) / 2);
                a.hp = Math.min(a.maxHP, avg);
                d.hp = Math.min(d.maxHP, avg);
            }
            if (actual.recycle && a.itemConsumed)
                a.itemConsumed = false;
            if (actual.aquaRing)
                a.aquaRing = true;
            if (actual.ingrain)
                a.ingrain = true;
            if (actual.magnetRise)
                a.magnetRiseTurns = 5;
            if (actual.focusEnergy)
                a.focusEnergy = Math.max(a.focusEnergy || 0, 2);
            if (actual.chargeElectric)
                a.chargeElectric = true;
            changeStage(a, actual.selfStatChanges, a);
            if (actual.targetStatChanges && !d.protect)
                changeStage(target, actual.targetStatChanges, source);
            if (actual.directStatus && !d.protect)
                applyStatus(target, actual.directStatus, rng, source, actual);
            if (actual.toxic && !d.protect)
                applyStatus(target, 'toxic', rng, source, actual);
            if (actual.confuse && !d.protect)
                target.confusedTurns = Math.max(target.confusedTurns || 0, 2 + rng.int(3));
            if (actual.setTypes && !d.protect)
                target.types = [...actual.setTypes];
            if (actual.setAbility && !d.protect && !['schooling', 'power-construct'].includes(target.ability.id))
                target.ability = { id: actual.setAbility, name: actual.setAbility };
            if (actual.entrainment && !d.protect && !['schooling', 'power-construct'].includes(target.ability.id))
                target.ability = { ...a.ability };
            if (actual.haze) {
                for (const q of [a, d])
                    for (const k of Object.keys(q.stages))
                        q.stages[k] = 0;
            }
            if (actual.defog) {
                for (const sd of ['A', 'B'])
                    field.hazards[sd] = {};
                field.terrain = null;
                field.terrainTurns = 0;
                for (const sd of ['A', 'B']) {
                    field.screens[sd].reflect = 0;
                    field.screens[sd].lightScreen = 0;
                }
            }
            if (actual.weather) {
                field.weather = actual.weather;
                field.weatherTurns = 5;
                updateForecast(a, field);
                updateForecast(d, field);
            }
            if (actual.terrain) {
                field.terrain = actual.terrain;
                field.terrainTurns = 5;
            }
            if (actual.tailwind) {
                field.tailwind[a.side] = 4;
                for (const q of [a, d])
                    if (q.ability.id === 'windmill')
                        changeStage(q, { speed: 1 }, q);
            }
            if (actual.trickRoom)
                field.trickRoom = 5;
            if (actual.gravity)
                field.gravity = 5;
            if (actual.screen) {
                field.screens[a.side][actual.screen] = 5;
            }
            if (actual.hazard) {
                const hz = field.hazards[(target || d).side];
                if (actual.hazard === 'stealthRock')
                    hz.stealthRock = true;
                else if (actual.hazard === 'spikes')
                    hz.spikes = Math.min(3, (hz.spikes || 0) + 1);
                else if (actual.hazard === 'toxicSpikes')
                    hz.toxicSpikes = Math.min(2, (hz.toxicSpikes || 0) + 1);
                else if (actual.hazard === 'stickyWeb')
                    hz.stickyWeb = true;
            }
            return;
        }
        a.protectChain = 0;
        const acc = moveAccuracy(a, actual, field) * stageMult(a.stages.accuracy) / stageMult(d.stages.evasion);
        if (acc < 100 && rng() * 100 > acc) {
            a.lastMoveFailed = true;
            if (actual.furyCutter)
                a.furyCutterCount = 0;
            if (actual.rollout)
                a.rolloutCount = 0;
            crashOnFail(a, actual);
            return;
        }
        if (field.quickGuard?.[d.side] > 0 && (actual.priority || 0) > 0) {
            a.lastMoveFailed = true;
            crashOnFail(a, actual);
            return;
        }
        if (d.protect && !actual.breakProtect) {
            if (d.protectContactParalyze && actual.contact)
                applyStatus(a, 'paralysis', rng, d, actual);
            a.lastMoveFailed = true;
            crashOnFail(a, actual);
            return;
        }
        const attackType = effectiveMoveType(a, actual, field);
        let eff = actual.struggle ? 1 : typeEffect(attackType, d.types, a.ability.id);
        if (actual.freezeDry && d.types.includes('みず'))
            eff *= 4;
        if (a.ability.id === 'tinted-lens' && eff > 0 && eff < 1)
            eff *= 2;
        if (eff === 0) {
            a.lastMoveFailed = true;
            return;
        }
        const critical = rng() < criticalChance(a, actual);
        let one = damageEstimate(a, d, actual, field, 0.85 + rng() * 0.15, critical);
        let hits = 1;
        if (Array.isArray(actual.multiHit)) {
            const [lo, hi] = actual.multiHit;
            hits = lo === hi ? lo : (rng() < 0.375 ? 2 : rng() < 0.6 ? 3 : rng() < 0.8 ? 4 : 5);
            hits = clamp(hits, lo, hi);
        }
        let dmg = one * hits;
        dmg = consumeBerryForDamage(d, { ...actual, type: attackType }, eff, dmg, field);
        recordArchetypeEncounter(stats, a, d, { attempt: true });
        const before = d.hp;
        const fullBefore = d.hp === d.maxHP;
        let newHp = Math.max(0, d.hp - dmg);
        if (fullBefore && newHp <= 0 && (field.magicRoom || 0) <= 0 && !d.itemConsumed && d.item.id === 'focus-sash') {
            newHp = 1;
            d.itemConsumed = true;
            reveal(sideState, d, 'item', d.item.id);
        }
        if (fullBefore && newHp <= 0 && d.ability.id === 'sturdy') {
            newHp = 1;
            reveal(sideState, d, 'ability', d.ability.id);
        }
        if (newHp <= 0 && d.endure)
            newHp = 1;
        d.hp = newHp;
        const dealt = before - d.hp;
        if (dealt > 0) {
            d.lastDamageAmount = dealt;
            d.lastDamageCategory = actual.category;
            d.lastDamageFromSide = a.side;
        }
        if (stats.moves[actual.id]) {
            stats.moves[actual.id].hits++;
            stats.moves[actual.id].damage += dealt;
        }
        if (stats.species) {
            const sm = stats.species[a.id]?.moves?.[actual.id];
            if (sm) {
                sm.hits++;
                sm.damage += dealt;
            }
        }
        recordArchetypeEncounter(stats, a, d, { dealt, ko: before > 0 && d.hp <= 0 });
        if (dealt > 0 && d.hp > 0) {
            if (d.ability.id === 'stamina')
                changeStage(d, { defense: 1 }, d);
            if (d.ability.id === 'gooey' && actual.contact)
                changeStage(a, { speed: -1 }, d);
        }
        if (before > 0 && d.hp <= 0) {
            if (d.destinyBond)
                a.hp = 0;
            a.koCount++;
            if (a.ability.id === 'moxie')
                changeStage(a, { attack: 1 }, a);
            if (stats.moves[actual.id])
                stats.moves[actual.id].kos++;
            if (stats.species?.[a.id]?.moves?.[actual.id])
                stats.species[a.id].moves[actual.id].kos++;
            if (stats.encounters) {
                const e = stats.encounters[`${a.id}>${d.id}`] || (stats.encounters[`${a.id}>${d.id}`] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
                e.wins++;
                e.kos++;
                const r = stats.encounters[`${d.id}>${a.id}`] || (stats.encounters[`${d.id}>${a.id}`] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
                r.losses++;
                r.deaths++;
            }
        }
        if (actual.removeTerrain && dealt > 0 && field.terrain) {
            field.terrain = null;
            field.terrainTurns = 0;
        }
        if (actual.breakScreens && dealt > 0) {
            field.screens[d.side].reflect = 0;
            field.screens[d.side].lightScreen = 0;
        }
        if (actual.clearTargetStages && dealt > 0)
            for (const k of Object.keys(d.stages))
                d.stages[k] = 0;
        if (actual.smackDown && dealt > 0) {
            d.smackDown = true;
            d.magnetRiseTurns = 0;
            if (d.item?.id === 'air-balloon')
                d.itemConsumed = true;
        }
        if (dealt>0 && actual.contact && d.item?.id==='rocky-helmet' && !d.itemConsumed && (field.magicRoom||0)<=0 && a.hp>0 && a.ability.id!=='magic-guard') a.hp=Math.max(0,a.hp-Math.max(1,Math.floor(a.maxHP/6)));
        if (actual.knockOff && dealt > 0 && !d.itemConsumed && d.item.id !== 'none')
            d.itemConsumed = true;
        if (actual.recoveryBlockTurns && dealt > 0)
            d.recoveryBlockTurns = Math.max(d.recoveryBlockTurns || 0, actual.recoveryBlockTurns);
        if ((actual.forceSwitch || actual.forceSwitchOnHit) && dealt > 0 && d.hp > 0) {
            const idx = bestSwitch(oppState, sideState, field, oppState.difficulty, rng, true);
            if (idx >= 0)
                switchTo(oppState, idx, field, stats, sideState);
        }
        if (actual.rapidSpin && dealt > 0) {
            field.hazards[a.side] = {};
            a.seeded = false;
        }
        if (actual.furyCutter && dealt > 0)
            a.furyCutterCount = Math.min(3, (a.furyCutterCount || 0) + 1);
        else if (!actual.furyCutter)
            a.furyCutterCount = 0;
        if (actual.rollout && dealt > 0)
            a.rolloutCount = Math.min(4, (a.rolloutCount || 0) + 1);
        else if (!actual.rollout)
            a.rolloutCount = 0;
        if (actual.spitUp && dealt > 0)
            a.stockpileCount = 0;
        if (a.chargeElectric && effectiveMoveType(a, actual, field) === 'でんき' && dealt > 0)
            a.chargeElectric = false;
        if (actual.bugBite && dealt > 0)
            consumeBugBite(a, d);
        if (actual.seedTarget && dealt > 0 && !d.types.includes('くさ')) {
            d.seeded = true;
            d.seedSourceSide = a.side;
        }
        if ((actual.trapDamage || actual.jawLock) && dealt > 0) {
            d.trappedTurns = Math.max(d.trappedTurns || 0, 4 + rng.int(2));
            if (actual.jawLock)
                a.trappedTurns = Math.max(a.trappedTurns || 0, d.trappedTurns);
        }
        if (actual.confuseIfTargetRaised && d.raisedThisTurn && dealt > 0)
            d.confusedTurns = Math.max(d.confusedTurns || 0, 2 + rng.int(3));
        if (actual.clearFieldStructures && dealt > 0) {
            field.hazards.A = {};
            field.hazards.B = {};
            field.terrain = null;
            field.terrainTurns = 0;
            field.trickRoom = 0;
            field.magicRoom = 0;
            field.wonderRoom = 0;
            for (const sd of ['A', 'B']) {
                field.screens[sd].reflect = 0;
                field.screens[sd].lightScreen = 0;
            }
        }
        if (actual.removeIceUntilEndTurn && dealt > 0 && a.types.includes('こおり')) {
            a.iceRestoreTypes = [...a.types];
            a.types = a.types.filter(t => t !== 'こおり');
        }
        if (actual.drainRatio && a.hp > 0)
            a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(dealt * actual.drainRatio)));
        if (actual.recoilRatio && a.hp > 0 && a.ability.id !== 'magic-guard')
            a.hp = Math.max(0, a.hp - Math.max(1, Math.round(dealt * actual.recoilRatio)));
        if (actual.recoilMaxHPRatio && a.hp > 0 && a.ability.id !== 'magic-guard')
            a.hp = Math.max(0, a.hp - Math.max(1, Math.ceil(a.maxHP * actual.recoilMaxHPRatio)));
        if (actual.struggle && a.hp > 0)
            a.hp = Math.max(0, a.hp - Math.max(1, Math.round(a.maxHP / 4)));
        if ((field.magicRoom || 0) <= 0 && a.item.id === 'life-orb' && !a.itemConsumed && dealt > 0 && a.ability.id !== 'magic-guard' && !(a.ability.id === 'sheer-force' && isSheerForceMove(actual)))
            a.hp = Math.max(0, a.hp - Math.max(1, Math.floor(a.maxHP / 10)));
        if (actual.selfFaint || actual.selfFaintAfterDamage || actual.finalGambit)
            a.hp = 0;
        if (actual.recharge && dealt > 0)
            a.recharge = true;
        const sheer = a.ability.id === 'sheer-force' && isSheerForceMove(actual);
        changeStage(a, actual.selfStatChanges, a);
        if (!sheer && actual.targetStatChanges)
            changeStage(d, actual.targetStatChanges, a);
        if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && actual.targetStatChangeChance && rng() * 100 < actual.targetStatChangeChance.chance)
            changeStage(d, { [actual.targetStatChangeChance.stat]: actual.targetStatChangeChance.amount }, a);
        if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && actual.secondaryStatus && rng() * 100 < actual.secondaryStatus.chance)
            applyStatus(d, actual.secondaryStatus.status, rng, a, actual);
        if (!sheer && actual.selfStatChangeChance && rng() * 100 < actual.selfStatChangeChance.chance)
            changeStage(a, { [actual.selfStatChangeChance.stat]: actual.selfStatChangeChance.amount }, a);
        if (!sheer && actual.confuseChance && rng() * 100 < actual.confuseChance)
            d.confusedTurns = Math.max(d.confusedTurns || 0, 2 + rng.int(3));
        if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && actual.flinchChance && rng() * 100 < actual.flinchChance)
            d.flinched = true;
        if (!sheer && actual.allStatBoostChance && rng() * 100 < actual.allStatBoostChance)
            changeStage(a, { attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 }, a);
        if (actual.fellStinger && d.hp <= 0)
            changeStage(a, { attack: 3 }, a);
        if (actual.rampage && a.rampageMoveId === actual.id) {
            a.rampageTurns = Math.max(0, (a.rampageTurns || 1) - 1);
            if (a.rampageTurns <= 0) {
                a.rampageMoveId = null;
                a.rampageTurns = 0;
                a.confusedTurns = Math.max(a.confusedTurns || 0, 2 + rng.int(3));
            }
        }
        if (!actual.struggle && (field.magicRoom || 0) <= 0 && !a.itemConsumed && ['choice-band', 'choice-specs', 'choice-scarf'].includes(a.item.id))
            a.choiceLock = actual.id;
        if (actual.pivot && a.hp > 0) {
            const idx = bestSwitch(sideState, oppState, field, sideState.difficulty, rng, false);
            if (idx >= 0)
                switchTo(sideState, idx, field, stats, oppState);
        }
    }
    function processFutureSightSingle(A, B, field, rng, stats) { if (!field.futureSight)
        return; for (const side of ['A', 'B']) {
        const queue = field.futureSight[side] || [], targetSide = side === 'A' ? A : B;
        for (let i = queue.length - 1; i >= 0; i--) {
            const e = queue[i];
            e.turns--;
            if (e.turns > 0)
                continue;
            queue.splice(i, 1);
            const d = targetSide.active, a = e.attacker, m = e.move;
            if (!d || d.hp <= 0 || !a)
                continue;
            const before = d.hp, dmg = Math.min(d.hp, damageEstimate(a, d, m, field, .925, false));
            d.hp = Math.max(0, d.hp - dmg);
            const dealt = before - d.hp, ko = before > 0 && d.hp <= 0;
            if (dealt > 0) {
                d.lastDamageAmount = dealt;
                d.lastDamageCategory = m.category;
                d.lastDamageFromSide = a.side;
                const g = stats.moves[m.id] || (stats.moves[m.id] = { uses: 0, hits: 0, damage: 0, kos: 0 });
                g.hits++;
                g.damage += dealt;
                if (ko)
                    g.kos++;
                const ss = stats.species[a.id] || (stats.species[a.id] = newSpeciesStats()), sm = ss.moves[m.id] || (ss.moves[m.id] = { uses: 0, hits: 0, damage: 0, kos: 0 });
                sm.hits++;
                sm.damage += dealt;
                if (ko) {
                    sm.kos++;
                    a.koCount++;
                }
            }
        }
    } }
    function refreshFairyAura(field, ...groups) { field.fairyAura = groups.flat().filter(p => p && p.hp > 0 && p.ability?.id === 'fairy-aura').length; return field.fairyAura; }
    function halloweenPunkEndTurn(active, rng) { const living = active.filter(p => p && p.hp > 0), holders = living.filter(p => p.ability?.id === 'halloween-punk' && p.formKey === 'treat'); if (!holders.length)
        return; const stats = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'], directions = new Map(); for (const holder of holders) {
        for (const target of living) {
            let map = directions.get(target);
            if (!map) {
                map = new Map();
                directions.set(target, map);
            }
            const up = stats.filter(k => map.get(k) !== -1 && target.stages[k] < 6);
            if (!up.length)
                continue;
            const u = rng.pick(up);
            map.set(u, 1);
            const down = stats.filter(k => k !== u && map.get(k) !== 1 && target.stages[k] > -6);
            if (!down.length)
                continue;
            const d = rng.pick(down);
            map.set(d, -1);
            changeStage(target, { [u]: 1, [d]: -1 }, target);
        }
    } }
    function residual(sideState, field) { const p = sideState.active; if (!p || p.hp <= 0)
        return; syncResearchForm(p); updateForecast(p, field); if (field.weather === 'sand' && p.ability.id !== 'magic-guard' && !p.types.some(t => ['いわ', 'じめん', 'はがね'].includes(t)) && !((field.magicRoom || 0) <= 0 && !p.itemConsumed && p.item?.id === 'safety-goggles'))
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP / 16))); if (field.terrain === 'grassy' && grounded(p, field) && p.hp > 0)
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 16))); const poisonHeal = p.ability.id === 'poison-heal' && ['poison', 'toxic'].includes(p.status); if (poisonHeal) {
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 8)));
    }
    else if (p.status === 'burn') {
        let dmg = Math.max(1, Math.floor(p.maxHP / 16));
        if (p.ability.id === 'heatproof')
            dmg = Math.max(1, Math.floor(dmg / 2));
        if (p.ability.id !== 'magic-guard')
            p.hp = Math.max(0, p.hp - dmg);
    }
    else if (p.status === 'poison' && p.ability.id !== 'magic-guard')
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP / 8)));
    else if (p.status === 'toxic' && p.ability.id !== 'magic-guard') {
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP * (p.toxicCounter || 1) / 16)));
        p.toxicCounter = Math.min(15, (p.toxicCounter || 1) + 1);
    } if (p.ability.id === 'dry-skin' && p.hp > 0) {
        if (field.weather === 'rain')
            p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 8)));
        else if (field.weather === 'sun' && p.ability.id !== 'magic-guard')
            p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP / 8)));
    } if (p.ability.id === 'hydration' && field.weather === 'rain' && p.status) {
        p.status = null;
        p.statusTurns = 0;
        p.toxicCounter = 0;
    } if ((field.magicRoom||0)<=0 && !p.itemConsumed && p.hp>0) {
        if (p.item.id==='black-sludge') { if(p.types.includes('どく')) p.hp=Math.min(p.maxHP,p.hp+Math.max(1,Math.floor(p.maxHP/16))); else if(p.ability.id!=='magic-guard') p.hp=Math.max(0,p.hp-Math.max(1,Math.floor(p.maxHP/8))); }
        if (p.item.id==='toxic-orb' || p.item.id==='flame-orb') applyStatus(p,p.item.id==='toxic-orb'?'toxic':'burn',makeRng(1));
        if (p.status && (p.item.id==='lum-berry' || (p.item.id==='chesto-berry' && p.status==='sleep'))) {p.status=null;p.statusTurns=0;p.toxicCounter=1;p.itemConsumed=true;}
    } if ((field.magicRoom || 0) <= 0 && p.item.id === 'leftovers' && !p.itemConsumed && p.hp > 0)
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 16))); if ((field.magicRoom || 0) <= 0 && p.item.id === 'sitrus-berry' && !p.itemConsumed && p.hp > 0 && p.hp <= p.maxHP / 2) {
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 4)));
        p.itemConsumed = true;
    } if (p.aquaRing && p.hp > 0)
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 16))); if (p.ingrain && p.hp > 0)
        p.hp = Math.min(p.maxHP, p.hp + Math.max(1, Math.floor(p.maxHP / 16))); if (p.cursed && p.hp > 0 && p.ability.id !== 'magic-guard')
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP / 4))); if (p.seeded && p.hp > 0 && p.ability.id !== 'magic-guard') {
        const dmg = Math.max(1, Math.floor(p.maxHP / 8));
        p.hp = Math.max(0, p.hp - dmg);
        const src = field?._sideRefs?.[p.seedSourceSide];
        const healer = Array.isArray(src?.active) ? src.active.find(q => q?.hp > 0) : src?.active;
        if (healer)
            healer.hp = Math.min(healer.maxHP, healer.hp + dmg);
    } if ((p.trappedTurns || 0) > 0 && p.hp > 0) {
        if (p.ability.id !== 'magic-guard')
            p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP / 8)));
        p.trappedTurns--;
    } if (p.ability.id === 'speed-boost' && p.hp > 0)
        p.stages.speed = clamp(p.stages.speed + 1, -6, 6); if (p.recoveryBlockTurns > 0)
        p.recoveryBlockTurns--; if (p.magnetRiseTurns > 0)
        p.magnetRiseTurns--; if (p.tauntTurns > 0)
        p.tauntTurns--; if (p.encoreTurns > 0 && --p.encoreTurns <= 0)
        p.encoreMoveId = null; if (p.disableTurns > 0 && --p.disableTurns <= 0)
        p.disableMoveId = null; if (p.yawnTurns > 0 && --p.yawnTurns <= 0 && !p.status)
        applyStatus(p, 'sleep', () => 0.5, null, null); syncResearchForm(p); p.turnsActive = (p.turnsActive || 0) + 1; }
    function hazardOnEntry(p, field) { const hz = field.hazards[p.side]; if (!hz)
        return; const isGrounded = grounded(p, field), boots = (field.magicRoom || 0) <= 0 && p.item?.id === 'heavy-duty-boots' && !p.itemConsumed; if (hz.toxicSpikes && isGrounded && p.types.includes('どく'))
        hz.toxicSpikes = 0; if (boots)
        return; if (hz.stealthRock && p.ability.id !== 'magic-guard') {
        const e = typeEffect('いわ', p.types, null);
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP * e / 8)));
    } if (hz.spikes && isGrounded && p.ability.id !== 'magic-guard')
        p.hp = Math.max(0, p.hp - Math.max(1, Math.floor(p.maxHP * (hz.spikes >= 3 ? 1 / 4 : hz.spikes === 2 ? 1 / 6 : 1 / 8)))); if (hz.stickyWeb && isGrounded) {
        const blocked = ['clear-body', 'white-smoke'].includes(p.ability.id) || ((field.magicRoom || 0) <= 0 && p.item?.id === 'clear-amulet' && !p.itemConsumed);
        if (!blocked) {
            p.stages.speed = clamp(p.stages.speed - 1, -6, 6);
            if (p.ability.id === 'competitive')
                p.stages.specialAttack = clamp(p.stages.specialAttack + 2, -6, 6);
        }
    } if (hz.toxicSpikes && isGrounded && !p.types.includes('どく') && !p.types.includes('はがね'))
        applyStatus(p, hz.toxicSpikes >= 2 ? 'toxic' : 'poison', () => 0.5); }
    function tickSideField(field, A, B) { for (const sd of ['A', 'B']) {
        if (field.mist?.[sd] > 0)
            field.mist[sd]--;
        if (field.safeguard?.[sd] > 0)
            field.safeguard[sd]--;
        if (field.quickGuard?.[sd] > 0)
            field.quickGuard[sd]--;
        const w = field.wish?.[sd];
        if (w && --w.turns <= 0) {
            const st = sd === 'A' ? A : B, q = Array.isArray(st.active) ? st.active.find(x => x?.hp > 0) : st.active;
            if (q && q.recoveryBlockTurns <= 0)
                q.hp = Math.min(q.maxHP, q.hp + Math.max(1, Math.floor(w.heal)));
            field.wish[sd] = null;
        }
    } if (field.gravity > 0)
        field.gravity--; if (field.magicRoom > 0)
        field.magicRoom--; if (field.wonderRoom > 0)
        field.wonderRoom--; }
    function chooseReplacement(sideState, oppState, field, rng) { const i = bestSwitch(sideState, oppState, field, sideState.difficulty, rng, true); if (i < 0)
        return false; switchTo(sideState, i, field, sideState.stats, oppState); hazardOnEntry(sideState.active, field); return true; }
    function living(team) { return team.some(p => p.hp > 0); }
    function processFaints(A, B, field, rng) { let guard = 0; while (guard++ < 8) {
        if (!living(A.team) || !living(B.team))
            return;
        let changed = false;
        if (A.active.hp <= 0) {
            changed = chooseReplacement(A, B, field, rng) || changed;
        }
        if (B.active.hp <= 0) {
            changed = chooseReplacement(B, A, field, rng) || changed;
        }
        if (!changed || (A.active.hp > 0 && B.active.hp > 0))
            return;
    } }
    function orderActions(A, B, actA, actB, field, rng) {
        if (actA.type === 'switch' && actB.type !== 'switch')
            return [[A, B, actA], [B, A, actB]];
        if (actB.type === 'switch' && actA.type !== 'switch')
            return [[B, A, actB], [A, B, actA]];
        if (actA.type === 'switch' && actB.type === 'switch') {
            const sa = effectiveSpeed(A.active, field), sb = effectiveSpeed(B.active, field);
            if (sa === sb)
                return rng() < 0.5 ? [[A, B, actA], [B, A, actB]] : [[B, A, actB], [A, B, actA]];
            const aFirst = field.trickRoom > 0 ? sa < sb : sa > sb;
            return aFirst ? [[A, B, actA], [B, A, actB]] : [[B, A, actB], [A, B, actA]];
        }
        const ma = MOVE_DEX[actA.moveId], mb = MOVE_DEX[actB.moveId];
        const pa = ma?.priority || 0, pb = mb?.priority || 0;
        if (pa !== pb)
            return pa > pb ? [[A, B, actA], [B, A, actB]] : [[B, A, actB], [A, B, actA]];
        const sa = effectiveSpeed(A.active, field), sb = effectiveSpeed(B.active, field);
        if (sa === sb)
            return rng() < 0.5 ? [[A, B, actA], [B, A, actB]] : [[B, A, actB], [A, B, actA]];
        const af = field.trickRoom > 0 ? sa < sb : sa > sb;
        return af ? [[A, B, actA], [B, A, actB]] : [[B, A, actB], [A, B, actA]];
    }
    function initSide(side, sets, selection, difficulty) { const team = selection.map(i => makePokemon(sets[i], side)); const sideState = { side, difficulty, team, activeIndex: 0, active: team[0], knowledge: {}, previewSpecies: sets.map(x => x.speciesId), pendingAction: null, acted: false, stats: null }; for (const p of team) {
        p.side = side;
    } return sideState; }
    function newSpeciesStats() { return { roster: 0, selected: 0, leads: 0, teamWins: 0, selectedWins: 0, leadWins: 0, kos: 0, deaths: 0, moves: {}, moveSets: {}, moveSetWins: {}, abilities: {}, abilityWins: {}, items: {}, itemWins: {}, natures: {}, natureWins: {}, pointSpreads: {}, pointSpreadWins: {}, spreads: {}, spreadWins: {}, matchups: {} }; }
    function collectSetStats(result, set, selected, lead, winnerSide, side) {
        const ss = result.species[set.speciesId] || (result.species[set.speciesId] = newSpeciesStats());
        ss.roster++;
        if (selected)
            ss.selected++;
        if (lead)
            ss.leads++;
        if (winnerSide === side) {
            ss.teamWins++;
            if (selected)
                ss.selectedWins++;
            if (lead)
                ss.leadWins++;
        }
        const spv = set.statPoints || {};
        const spread = [spv.hp || 0, spv.attack || 0, spv.defense || 0, spv.specialAttack || 0, spv.specialDefense || 0, spv.speed || 0].join('/');
        const key = `${set.speciesId}|${set.nature}|${spread}`;
        result.spreads[key] = (result.spreads[key] || 0) + 1;
        result.abilities[set.abilityId] = (result.abilities[set.abilityId] || 0) + 1;
        result.items[set.itemId] = (result.items[set.itemId] || 0) + 1;
        ss.abilities[set.abilityId] = (ss.abilities[set.abilityId] || 0) + 1;
        ss.items[set.itemId] = (ss.items[set.itemId] || 0) + 1;
        if (winnerSide === side) {
            ss.abilityWins[set.abilityId] = (ss.abilityWins[set.abilityId] || 0) + 1;
            ss.itemWins[set.itemId] = (ss.itemWins[set.itemId] || 0) + 1;
        }
        const sk = `${set.nature}|${spread}`;
        ss.natures[set.nature] = (ss.natures[set.nature] || 0) + 1;
        ss.pointSpreads[spread] = (ss.pointSpreads[spread] || 0) + 1;
        ss.spreads[sk] = (ss.spreads[sk] || 0) + 1;
        if (winnerSide === side) {
            ss.natureWins[set.nature] = (ss.natureWins[set.nature] || 0) + 1;
            ss.pointSpreadWins[spread] = (ss.pointSpreadWins[spread] || 0) + 1;
            ss.spreadWins[sk] = (ss.spreadWins[sk] || 0) + 1;
        }
        for (const mid of set.moves || [])
            if ((SPECIES_DEX[set.speciesId]?.movePool || []).includes(mid) && MOVE_DEX[mid]) {
                ss.moveSets[mid] = (ss.moveSets[mid] || 0) + 1;
                if (winnerSide === side)
                    ss.moveSetWins[mid] = (ss.moveSetWins[mid] || 0) + 1;
            }
    }
    function emptyBatchStats() { return { format: 'single', battles: 0, wins: { A: 0, B: 0, draw: 0 }, turns: 0, switches: 0, species: {}, moves: {}, abilities: {}, items: {}, spreads: {}, matchups: {}, encounters: {}, archetypeEncounters: {}, selectedCounterResults: {} }; }
    function addNumMap(a, b) { for (const [k, v] of Object.entries(b || {}))
        a[k] = (a[k] || 0) + v; }
    function mergeStats(a, b) {
        if (!b)
            return a;
        a.selectedCounterResults = a.selectedCounterResults || {};
        a.format = b.format || a.format;
        a.battles += b.battles || 0;
        a.turns += b.turns || 0;
        a.switches += b.switches || 0;
        a.wins.A += (b.wins?.A || 0);
        a.wins.B += (b.wins?.B || 0);
        a.wins.draw += (b.wins?.draw || 0);
        for (const key of ['abilities', 'items', 'spreads'])
            addNumMap(a[key], b[key]);
        for (const [k, v] of Object.entries(b.species || {})) {
            const t = a.species[k] || (a.species[k] = newSpeciesStats());
            for (const x of ['roster', 'selected', 'leads', 'teamWins', 'selectedWins', 'leadWins', 'kos', 'deaths'])
                t[x] += (v[x] || 0);
            addNumMap(t.abilities, v.abilities);
            addNumMap(t.abilityWins, v.abilityWins);
            addNumMap(t.items, v.items);
            addNumMap(t.itemWins, v.itemWins);
            addNumMap(t.spreads, v.spreads);
            addNumMap(t.spreadWins, v.spreadWins);
            addNumMap(t.natures, v.natures);
            addNumMap(t.natureWins, v.natureWins);
            addNumMap(t.pointSpreads, v.pointSpreads);
            addNumMap(t.pointSpreadWins, v.pointSpreadWins);
            addNumMap(t.moveSets, v.moveSets);
            addNumMap(t.moveSetWins, v.moveSetWins);
            for (const [mid, mv] of Object.entries(v.moves || {})) {
                const mt = t.moves[mid] || (t.moves[mid] = { uses: 0, hits: 0, damage: 0, kos: 0 });
                for (const x of ['uses', 'hits', 'damage', 'kos'])
                    mt[x] += (mv[x] || 0);
            }
            for (const [oid, o] of Object.entries(v.matchups || {})) {
                const mt = t.matchups[oid] || (t.matchups[oid] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 });
                for (const x of ['games', 'wins', 'losses', 'kos', 'deaths'])
                    mt[x] += (o[x] || 0);
            }
        }
        for (const [k, v] of Object.entries(b.moves || {})) {
            const t = a.moves[k] || (a.moves[k] = { uses: 0, hits: 0, damage: 0, kos: 0 });
            for (const x of Object.keys(t))
                t[x] += (v[x] || 0);
        }
        for (const [k, v] of Object.entries(b.matchups || {})) {
            const t = a.matchups[k] || (a.matchups[k] = { games: 0, wins: 0 });
            t.games += v.games || 0;
            t.wins += v.wins || 0;
        }
        for (const [k, v] of Object.entries(b.encounters || {})) {
            const t = a.encounters[k] || (a.encounters[k] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
            for (const x of ['games', 'wins', 'losses', 'kos', 'deaths', 'damage', 'hits'])
                t[x] = (t[x] || 0) + (v[x] || 0);
        }
        for (const [k, v] of Object.entries(b.archetypeEncounters || {})) {
            const t = a.archetypeEncounters[k] || (a.archetypeEncounters[k] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
            for (const x of ['games', 'wins', 'losses', 'kos', 'deaths', 'damage', 'hits'])
                t[x] = (t[x] || 0) + (v[x] || 0);
        }
        for (const [k, v] of Object.entries(b.selectedCounterResults || {})) {
            const t = a.selectedCounterResults[k] || (a.selectedCounterResults[k] = { games: 0, wins: 0, losses: 0, draws: 0 });
            for (const x of ['games', 'wins', 'losses', 'draws'])
                t[x] = (t[x] || 0) + (v[x] || 0);
        }
        return a;
    }
    function simulateBattle(config, index) {
        const rng = makeRng(seedHash(config.seed || 'niwara', index)), rules = compileRules(config);
        const diffA = config.difficultyA || 'very-strong', diffB = config.difficultyB || 'very-strong';
        const buildMode = config.buildMode || 'auto';
        const meta = config.__metaSnapshot || config.metaSnapshot || null, rosterA = buildTeam(rng, diffA, buildMode, rules, meta), rosterB = buildTeam(rng, diffB, buildMode, rules, meta);
        const selA = selectThree(rosterA, rosterB, diffA, rng, rules, meta), selB = selectThree(rosterB, rosterA, diffB, rng, rules, meta);
        const A = initSide('A', rosterA, selA, diffA), B = initSide('B', rosterB, selB, diffB);
        const result = emptyBatchStats();
        result.format = 'single';
        result.battles = 1;
        const battleStats = { moves: result.moves, species: result.species, encounters: result.encounters, archetypeEncounters: result.archetypeEncounters, selectedCounterResults: result.selectedCounterResults, switches: { A: 0, B: 0 } };
        A.stats = B.stats = battleStats;
        const field = { weather: null, weatherTurns: 0, terrain: null, terrainTurns: 0, trickRoom: 0, gravity: 0, magicRoom: 0, wonderRoom: 0, tailwind: { A: 0, B: 0 }, screens: { A: { reflect: 0, lightScreen: 0 }, B: { reflect: 0, lightScreen: 0 } }, mist: { A: 0, B: 0 }, safeguard: { A: 0, B: 0 }, quickGuard: { A: 0, B: 0 }, wish: { A: null, B: null }, lunarDance: { A: false, B: false }, hazards: { A: {}, B: {} }, futureSight: { A: [], B: [] }, rules };
        field._sideRefs = { A, B };
        applyEntry(A.active, field, A, B);
        applyEntry(B.active, field, B, A);
        refreshFairyAura(field, [A.active], [B.active]);
        let turns = 0;
        while (turns < (config.turnLimit || 200) && living(A.team) && living(B.team)) {
            turns++;
            refreshFairyAura(field, [A.active], [B.active]);
            for (const p of [A.active, B.active])
                if (p) {
                    p.lastDamageAmount = 0;
                    p.lastDamageCategory = null;
                    p.lastDamageFromSide = null;
                    p.flinched = false;
                    p.protect = false;
                    p.endure = false;
                    p.protectContactParalyze = false;
                    p.raisedThisTurn = false;
                    p.destinyBond = false;
                }
            A.acted = B.acted = false;
            A.pendingAction = chooseAction(A, B, field, diffA, rng);
            B.pendingAction = chooseAction(B, A, field, diffB, rng);
            for (const [s, o, act] of orderActions(A, B, A.pendingAction, B.pendingAction, field, rng)) {
                const actor = act?.actor;
                if (!actor || actor !== s.active || actor.hp <= 0) {
                    s.acted = true;
                    continue;
                }
                if (act.type === 'switch') {
                    if (act.index >= 0)
                        switchTo(s, act.index, field, battleStats, o), hazardOnEntry(s.active, field);
                }
                else if (act.type === 'move') {
                    executeMove(s, o, act.moveId === 'struggle' ? STRUGGLE_MOVE : MOVE_DEX[act.moveId], field, rng, battleStats);
                }
                else if (act.type === 'recharge') {
                    actor.recharge = false;
                }
                s.acted = true;
                if (!living(A.team) || !living(B.team))
                    break;
                processFaints(A, B, field, rng);
                if (!living(A.team) || !living(B.team))
                    break;
            }
            if (!living(A.team) || !living(B.team))
                break;
            residual(A, field);
            residual(B, field);
            halloweenPunkEndTurn([A.active, B.active], rng);
            processFutureSightSingle(A, B, field, rng, battleStats);
            processFaints(A, B, field, rng);
            if (field.weatherTurns > 0 && --field.weatherTurns <= 0) {
                field.weather = null;
                for (const q of [A.active, B.active])
                    if (q)
                        updateForecast(q, field);
            }
            if (field.terrainTurns > 0 && --field.terrainTurns <= 0)
                field.terrain = null;
            if (field.trickRoom > 0)
                field.trickRoom--;
            for (const s of ['A', 'B']) {
                if (field.tailwind[s] > 0)
                    field.tailwind[s]--;
                for (const k of ['reflect', 'lightScreen'])
                    if (field.screens[s][k] > 0)
                        field.screens[s][k]--;
            }
            tickSideField(field, A, B);
            for (const q of [A.active, B.active])
                if (q?.iceRestoreTypes) {
                    q.types = q.iceRestoreTypes;
                    q.iceRestoreTypes = null;
                }
        }
        result.turns = turns;
        result.switches = battleStats.switches.A + battleStats.switches.B;
        const aliveA = living(A.team), aliveB = living(B.team);
        const winner = aliveA && !aliveB ? 'A' : aliveB && !aliveA ? 'B' : 'draw';
        result.wins[winner]++;
        for (let i = 0; i < 6; i++) {
            collectSetStats(result, rosterA[i], selA.includes(i), i === selA[0], winner, 'A');
            collectSetStats(result, rosterB[i], selB.includes(i), i === selB[0], winner, 'B');
        }
        for (const p of [...A.team, ...B.team]) {
            const s = result.species[p.id];
            if (s) {
                s.kos += p.koCount;
                if (p.hp <= 0)
                    s.deaths++;
            }
        }
        const winSets = winner === 'A' ? selA.map(i => rosterA[i]) : winner === 'B' ? selB.map(i => rosterB[i]) : [];
        const loseSets = winner === 'A' ? selB.map(i => rosterB[i]) : winner === 'B' ? selA.map(i => rosterA[i]) : [];
        if (winner !== 'draw')
            for (const w of winSets)
                for (const l of loseSets) {
                    const k = `${w.speciesId}>${l.speciesId}`;
                    const t = result.matchups[k] || (result.matchups[k] = { games: 0, wins: 0 });
                    t.games++;
                    t.wins++;
                    const kr = `${l.speciesId}>${w.speciesId}`;
                    const r = result.matchups[kr] || (result.matchups[kr] = { games: 0, wins: 0 });
                    r.games++;
                }
        recordSelectedCounterResults(result, selA.map(i => rosterA[i]), selB.map(i => rosterB[i]), winner);
        for (const a of selA.map(i => rosterA[i]))
            for (const b of selB.map(i => rosterB[i])) {
                const sa = result.species[a.speciesId] || (result.species[a.speciesId] = newSpeciesStats()), sb = result.species[b.speciesId] || (result.species[b.speciesId] = newSpeciesStats()), ma = sa.matchups[b.speciesId] || (sa.matchups[b.speciesId] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 }), mb = sb.matchups[a.speciesId] || (sb.matchups[a.speciesId] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 });
                ma.games++;
                mb.games++;
                if (winner === 'A') {
                    ma.wins++;
                    mb.losses++;
                }
                else if (winner === 'B') {
                    mb.wins++;
                    ma.losses++;
                }
            }
        return result;
    }
    const FM_ALL_FOES = new Set(['rock-slide', 'heat-wave', 'muddy-water', 'icy-wind', 'dazzling-gleam', 'hyper-voice', 'v6-068', 'v7-breaking-swipe', 'v7-struggle-bug', 'v7-electroweb']);
    const FM_ALL_ADJ = new Set(['earthquake', 'surf', 'discharge', 'v6-113', 'v7-explosion', 'v6-157', 'v6-136']);
    const FM_FORMATS = { double: { select: 4, active: 2 }, triple: { select: 6, active: 3 }, full6: { select: 6, active: 1 }, tag: { select: 6, active: 2 } };
    function fmSelectN(roster, opp, count, difficulty, rng, rules, meta = null) { if (count >= 6)
        return [0, 1, 2, 3, 4, 5].sort((a, b) => selectionScore(roster[b], opp[0]?.speciesId || opp[0], rules, meta) - selectionScore(roster[a], opp[0]?.speciesId || opp[0], rules, meta)); const base = selectThree(roster, opp, difficulty, rng, rules, meta), rest = [0, 1, 2, 3, 4, 5].filter(i => !base.includes(i)); rest.sort((a, b) => teamQuality([roster[b]], meta, rules) - teamQuality([roster[a]], meta, rules)); return [...base, ...rest].slice(0, count); }
    function fmSide(side, rosters, selections, difficulty, activeCount) { const groups = rosters.map((sets, g) => { const team = selections[g].map(i => makePokemon(sets[i], side)); team.forEach(p => p._group = g); return { sets, selection: selections[g], team }; }); const team = groups.flatMap(g => g.team); const active = []; if (groups.length === 1) {
        for (let i = 0; i < Math.min(activeCount, team.length); i++)
            active.push(team[i]);
    }
    else {
        for (const g of groups)
            if (g.team[0])
                active.push(g.team[0]);
    } return { side, difficulty, groups, team, active, knowledge: {}, stats: null }; }
    function fmBench(side, p) { return side.groups[p?._group || 0].team.filter(x => x.hp > 0 && !side.active.includes(x)); }
    function fmLiving(side) { return side.team.some(p => p.hp > 0); }
    function fmCandidateThreat(c, opp, field) { const vals = []; for (const f of opp.active.filter(x => x.hp > 0)) {
        const model = fmModel(f, field?.rules);
        let worst = 0;
        for (const m of possibleThreatMoves({ speciesId: f.id, revealedMoves: [], types: [...f.types], status: f.status, stages: { ...f.stages } }, 'very-strong', field)) {
            let d = damageEstimate(model, c, m, field, .925, false);
            if (Array.isArray(m.multiHit))
                d *= expectedHits(m);
            d *= ((m.accuracy ?? 100) / 100);
            worst = Math.max(worst, d / Math.max(1, c.maxHP));
        }
        vals.push(worst);
    } vals.sort((a, b) => b - a); return (vals[0] || 0) + (vals[1] || 0) * .4; }
    function fmCandidateOffense(c, opp, field) { let best = 0, ko = 0; for (const f of opp.active.filter(x => x.hp > 0)) {
        const model = fmModel(f, field?.rules);
        for (const m of c.moves.filter(x => x.pp > 0 && x.category !== 'status')) {
            let d = damageEstimate(c, model, m, field, .925, false);
            if (Array.isArray(m.multiHit))
                d *= expectedHits(m);
            d *= ((m.accuracy ?? 100) / 100);
            best = Math.max(best, d / Math.max(1, model.maxHP));
            if (d >= model.hp)
                ko = Math.max(ko, (m.accuracy ?? 100) / 100);
        }
    } return { best, ko }; }
    function fmSwitchScore(c, opp, field) { const hp = c.hp / Math.max(1, c.maxHP), th = fmCandidateThreat(c, opp, field), off = fmCandidateOffense(c, opp, field); let s = hp * 38 + off.best * 82 + off.ko * 48 - th * 130; if (th >= hp * .98)
        s -= off.best >= .9 ? 90 : 290;
    else if (th >= hp * .75)
        s -= 85;
    else if (th < .35)
        s += 28; return s; }
    function fmBestSwitch(side, opp, p, field, rng, requireUsablePP = false) { if (p?.ingrain || (p?.trappedTurns || 0) > 0)
        return null; if (opp.active.some(x => x?.hp > 0 && x.ability.id === 'shadow-tag') && !p?.types?.includes('ゴースト'))
        return null; const opts = fmBench(side, p).filter(c => !requireUsablePP || c.moves.some(m => m.pp > 0)); if (!opts.length)
        return null; let best = null, score = -1e9; for (const c of opts) {
        const s = fmSwitchScore(c, opp, field) + rng() * 3;
        if (s > score) {
            score = s;
            best = c;
        }
    } return best; }
    function fmReplace(side, opp, field, rng) { for (let i = 0; i < side.active.length; i++) {
        const p = side.active[i];
        if (p && p.hp > 0)
            continue;
        const group = p?._group || 0, opts = side.groups[group].team.filter(x => x.hp > 0 && !side.active.includes(x));
        if (!opts.length)
            continue;
        let best = null, score = -1e9;
        for (const c of opts) {
            const s = fmSwitchScore(c, opp, field) + rng() * 3;
            if (s > score) {
                score = s;
                best = c;
            }
        }
        best = best || opts[0];
        side.active[i] = best;
        best._pos = i;
        applyEntry(best, field, side, opp);
        hazardOnEntry(best, field);
        side.stats.switches[side.side]++;
    } }
    function fmSpreadType(m) { if (FM_ALL_ADJ.has(m.id))
        return 'all-adj'; if (FM_ALL_FOES.has(m.id))
        return 'all-foes'; return 'one'; }
    function fmModel(p, rules) { const m = neutralModel(p.id, rules); m.stages = { ...p.stages }; m.status = p.status; m.types = [...p.types]; return m; }
    function fmChoose(side, opp, p, field, rng) {
        if (p.recharge)
            return { type: 'recharge', actor: p };
        if (p.charging)
            return { type: 'move', actor: p, moveId: p.charging, target: opp.active.find(x => x.hp > 0) || null };
        if (p.rampageMoveId)
            return { type: 'move', actor: p, moveId: p.rampageMoveId, target: opp.active.find(x => x.hp > 0) || null };
        const foes = opp.active.filter(x => x.hp > 0), imprisonIds = new Set(opp.active.filter(x => x?.hp > 0 && x.imprison).flatMap(x => x.moves.map(m => m.id)));
        let usable = p.moves.filter(x => x.pp > 0 && (!p.choiceLock || p.choiceLock === x.id) && !(p.tauntTurns > 0 && x.category === 'status') && !((field.magicRoom||0)<=0 && !p.itemConsumed && p.item?.id==='assault-vest' && x.category==='status') && !(p.disableTurns > 0 && p.disableMoveId === x.id) && !imprisonIds.has(x.id));
        if (p.encoreTurns > 0 && p.encoreMoveId) {
            const enc = usable.find(x => x.id === p.encoreMoveId);
            if (enc)
                usable = [enc];
        }
        if (!usable.length) {
            const sw = fmBestSwitch(side, opp, p, field, rng, true);
            if (sw)
                return { type: 'switch', actor: p, target: sw, ppExhausted: true };
            return { type: 'move', actor: p, moveId: 'struggle', target: foes[0] || null, forced: true };
        }
        let best = null, bestScore = -1e9;
        for (const m of usable) {
            if (m.requiresTerrain && !field.terrain)
                continue;
            if (m.firstTurnOnly && (p.turnsActive || 0) > 0)
                continue;
            if (m.pollenPuff) {
                const ally = side.active.filter(x => x !== p && x.hp > 0 && x.hp < x.maxHP * .7).sort((x, y) => x.hp / x.maxHP - y.hp / y.maxHP)[0];
                if (ally) {
                    const sc = (1 - ally.hp / ally.maxHP) * 75;
                    if (sc > bestScore) {
                        bestScore = sc;
                        best = { type: 'move', actor: p, moveId: m.id, target: ally };
                    }
                    continue;
                }
            }
            if (['v6-107', 'v6-153'].includes(m.id)) {
                const ally = side.active.filter(x => x !== p && x.hp > 0).sort((x, y) => x.hp / x.maxHP - y.hp / y.maxHP)[0];
                if (ally) {
                    const sc = m.id === 'v6-107' ? 42 : 38;
                    if (sc > bestScore) {
                        bestScore = sc;
                        best = { type: 'move', actor: p, moveId: m.id, target: ally };
                    }
                    continue;
                }
            }
            if (m.category === 'status') {
                let sc = statusScore(m, p, foes[0] || p, field) + (side.difficulty === 'normal' ? rng() * 20 : rng() * 3);
                if (sc > bestScore) {
                    bestScore = sc;
                    best = { type: 'move', actor: p, moveId: m.id, target: foes[0] || null };
                }
                continue;
            }
            const spread = fmSpreadType(m);
            const targets = spread === 'one' ? (foes.length ? foes : [null]) : foes;
            let sc = 0;
            let chosen = null;
            for (const f of targets) {
                if (!f)
                    continue;
                const model = fmModel(f, field?.rules);
                let raw = damageEstimate(p, model, m, field, .925, false);
                if (Array.isArray(m.multiHit))
                    raw *= expectedHits(m);
                raw *= ((m.accuracy ?? 100) / 100);
                const d = raw / Math.max(1, model.maxHP) * 100;
                if (spread === 'one') {
                    if (d > sc) {
                        sc = d;
                        chosen = f;
                    }
                }
                else
                    sc += d * .75;
            }
            if (m.priority > 0)
                sc += 8;
            if (m.recoilRatio)
                sc -= Math.min(24, m.recoilRatio * 42);
            if (m.recoilMaxHPRatio)
                sc -= Math.min(42, m.recoilMaxHPRatio * 75);
            if (m.selfFaint || m.selfFaintAfterDamage || m.finalGambit)
                sc -= p.hp / p.maxHP > .55 ? 78 : 35;
            const instantCharge = ((m.twoTurn === 'solarBeam' && field.weather === 'sun') || (m.twoTurn === 'electroShot' && field.weather === 'rain') || ((field.magicRoom || 0) <= 0 && p.item.id === 'power-herb' && !p.itemConsumed));
            if (m.recharge) {
                sc *= .48;
                sc -= 24;
            }
            if ((m.twoTurn || m.twoTurnWeather) && !instantCharge) {
                sc *= .58;
                sc -= side.difficulty === 'very-strong' ? 24 : 16;
            }
            if (m.suckerPunch)
                sc -= 18;
            if (m.upperHand)
                sc -= 28;
            if (m.rampage)
                sc -= 10;
            if (m.futureSight)
                sc -= 16;
            sc += side.difficulty === 'normal' ? rng() * 22 : rng() * 4;
            if (sc > bestScore) {
                bestScore = sc;
                best = { type: 'move', actor: p, moveId: m.id, target: chosen || foes[0] || null };
            }
        }
        if (side.difficulty !== 'normal') {
            const candidate = fmBestSwitch(side, opp, p, field, rng);
            if (candidate) {
                const hp = p.hp / Math.max(1, p.maxHP), th = fmCandidateThreat(p, opp, field), switchScore = fmSwitchScore(candidate, opp, field), currentScore = bestScore + hp * 25 - th * 95, margin = side.difficulty === 'very-strong' ? 10 : 24;
                if ((th >= hp * .78 && switchScore > currentScore - 15) || switchScore > currentScore + margin)
                    return { type: 'switch', actor: p, target: candidate };
            }
        }
        return best || { type: 'move', actor: p, moveId: p.moves[0]?.id, target: foes[0] || null };
    }
    function fmStatsMove(stats, a, m, dealt, ko, hit = true) { const g = stats.moves[m.id] || (stats.moves[m.id] = { uses: 0, hits: 0, damage: 0, kos: 0 }); if (dealt === null) {
        g.uses++;
        const ss = stats.species[a.id] || (stats.species[a.id] = newSpeciesStats());
        const sm = ss.moves[m.id] || (ss.moves[m.id] = { uses: 0, hits: 0, damage: 0, kos: 0 });
        sm.uses++;
        return;
    } if (hit) {
        g.hits++;
        g.damage += dealt;
        const sm = stats.species[a.id]?.moves?.[m.id];
        if (sm) {
            sm.hits++;
            sm.damage += dealt;
        }
    } if (ko) {
        g.kos++;
        const sm = stats.species[a.id]?.moves?.[m.id];
        if (sm)
            sm.kos++;
    } }
    function fmEncounter(stats, a, d, ko, dealt = 0) { const key = `${a.id}>${d.id}`, r = stats.encounters[key] || (stats.encounters[key] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 }); if (!ko) {
        r.games++;
        if (dealt > 0) {
            r.hits++;
            r.damage += dealt;
        }
        recordArchetypeEncounter(stats, a, d, { attempt: true, dealt });
        return;
    } r.wins++; r.kos++; const rk = `${d.id}>${a.id}`, rr = stats.encounters[rk] || (stats.encounters[rk] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 }); rr.losses++; rr.deaths++; }
    function fmExecute(side, opp, act, field, rng, stats) {
        const a = act.actor;
        if (!a || a.hp <= 0)
            return;
        if (act.type === 'recharge') {
            a.recharge = false;
            return;
        }
        if (act.type === 'switch') {
            const idx = side.active.indexOf(a), n = act.target;
            if (idx >= 0 && n && n.hp > 0 && !side.active.includes(n)) {
                if (a.ability.id === 'regenerator')
                    a.hp = Math.min(a.maxHP, a.hp + Math.floor(a.maxHP / 3));
                if (a.ability.id === 'natural-cure' && a.status) {
                    a.status = null;
                    a.statusTurns = 0;
                    a.toxicCounter = 0;
                }
                side.active[idx] = n;
                n._pos = idx;
                applyEntry(n, field, side, opp);
                hazardOnEntry(n, field);
                stats.switches[side.side]++;
            }
            return;
        }
        const m = act.moveId === 'struggle' ? STRUGGLE_MOVE : (a.moves.find(x => x.id === act.moveId) || MOVE_DEX[act.moveId]);
        if (!m)
            return;
        a.previousMoveFailed = !!a.lastMoveFailed;
        a.lastMoveFailed = false;
        if (a.flinched) {
            a.flinched = false;
            return;
        }
        if (a.status === 'sleep' && !m?.sleepTalk && !a._sleepTalkCalled) {
            if (a.statusTurns > 0) {
                a.statusTurns--;
                return;
            }
            a.status = null;
        }
        if (a.status === 'freeze') {
            if (rng() < .2)
                a.status = null;
            else
                return;
        }
        if (a.confusedTurns > 0) {
            a.confusedTurns--;
            if (rng() < 1 / 3) {
                a.hp = Math.max(0, a.hp - Math.max(1, Math.floor(a.maxHP / 8)));
                return;
            }
        }
        if (a.status === 'paralysis' && rng() < .25)
            return;
        const isSecondCharge = a.charging === m.id, isRampageContinuation = a.rampageMoveId === m.id, weatherInstant = (m.twoTurn === 'solarBeam' && field.weather === 'sun') || (m.twoTurn === 'electroShot' && field.weather === 'rain'), herbInstant = !!(m.twoTurn || m.twoTurnWeather) && (field.magicRoom || 0) <= 0 && a.item.id === 'power-herb' && !a.itemConsumed;
        if (!m.struggle && !isSecondCharge && !isRampageContinuation && m.pp > 0)
            m.pp--;
        if (a.lastConsecutiveMoveId === m.id)
            a.sameMoveCount = Math.min(6, (a.sameMoveCount || 1) + 1);
        else {
            a.lastConsecutiveMoveId = m.id;
            a.sameMoveCount = 1;
        }
        a.lastMoveId = m.id;
        if (!m.struggle && !isSecondCharge && !isRampageContinuation && a.set?.moves?.includes(m.id) && (SPECIES_DEX[a.id]?.movePool || []).includes(m.id))
            fmStatsMove(stats, a, m, null, false);
        if (m.requiresTerrain && !field.terrain) {
            a.lastMoveFailed = true;
            return;
        }
        if (m.firstTurnOnly && (a.turnsActive || 0) > 0) {
            a.lastMoveFailed = true;
            return;
        }
        if (m.explosive && [...side.active, ...opp.active].some(q => q?.hp > 0 && q.ability.id === 'damp')) {
            a.lastMoveFailed = true;
            return;
        }
        if (m.spitUp && !(a.stockpileCount > 0)) {
            a.lastMoveFailed = true;
            return;
        }
        if ((m.twoTurn || m.twoTurnWeather) && !isSecondCharge && !weatherInstant && !herbInstant) {
            a.charging = m.id;
            if (m.twoTurnWeather) {
                field.weather = m.twoTurnWeather;
                field.weatherTurns = 5;
                for (const q of [...side.active, ...opp.active])
                    updateForecast(q, field);
            }
            if (m.chargeBoost)
                changeStage(a, m.chargeBoost, a);
            return;
        }
        if (isSecondCharge)
            a.charging = null;
        else if ((m.twoTurn || m.twoTurnWeather) && herbInstant) {
            a.itemConsumed = true;
            if (m.twoTurnWeather) {
                field.weather = m.twoTurnWeather;
                field.weatherTurns = 5;
                for (const q of [...side.active, ...opp.active])
                    updateForecast(q, field);
            }
            if (m.chargeBoost)
                changeStage(a, m.chargeBoost, a);
        }
        else if ((m.twoTurn || m.twoTurnWeather) && weatherInstant && m.chargeBoost)
            changeStage(a, m.chargeBoost, a);
        if (m.rampage && !a.rampageMoveId) {
            a.rampageMoveId = m.id;
            a.rampageTurns = 2 + rng.int(2);
        }
        if (m.futureSight) {
            field.futureSight = field.futureSight || { A: [], B: [] };
            const d = act.target && act.target.hp > 0 ? act.target : opp.active.find(x => x.hp > 0);
            if (d)
                field.futureSight[d.side].push({ turns: 2, attacker: a, move: m, targetPos: d._pos, targetGroup: d._group });
            return;
        }
        if (m.category === 'status') {
            if (m.endure || m.protect || m.protectLike) {
                const chance = a.protectChain ? Math.pow(1 / 3, a.protectChain) : 1;
                if (rng() < chance) {
                    a.protectChain++;
                    if (m.endure)
                        a.endure = true;
                    else
                        a.protect = true;
                    if (m.contactParalyzeProtect)
                        a.protectContactParalyze = true;
                    if (m.cureStatusOnProtect && a.status) {
                        a.status = null;
                        a.statusTurns = 0;
                        a.toxicCounter = 0;
                    }
                }
                return;
            }
            a.protectChain = 0;
            let d = act.target && act.target.hp > 0 ? act.target : opp.active.find(x => x.hp > 0);
            if (d && d.side !== a.side && a.ability.id !== 'stalwart' && effectiveMoveType(a, m, field) === 'でんき') {
                const rod = opp.active.find(x => x?.hp > 0 && x.ability?.id === 'lightning-rod');
                if (rod)
                    d = rod;
            }
            const hostile = d && d.side !== a.side;
            if (d && hostile && applyAbilityBlock(a, d, m, field)) {
                a.lastMoveFailed = true;
                return;
            }
            if (d && hostile && m.powder && powderBlocked(d, field)) {
                a.lastMoveFailed = true;
                return;
            }
            const bounced = d && hostile && d.ability.id === 'magic-bounce' && !m.ignoreDefenderAbility && statusTargetsOpponent(m), target = bounced ? a : d, source = bounced ? d : a;
            if (d && hostile && statusBlockedByAbility(a, d, m, m.directStatus || (m.toxic ? 'toxic' : null)) && !bounced) {
                a.lastMoveFailed = true;
                return;
            }
            if (d && hostile && d.substituteHP > 0 && !m.sound && !m.ignoreSubstitute) {
                a.lastMoveFailed = true;
                return;
            }
            if (m.sleepTalk) {
                if (a.status !== 'sleep') {
                    a.lastMoveFailed = true;
                    return;
                }
                const opts = a.moves.filter(x => x.id !== m.id && x.pp > 0 && !x.sleepTalk && !x.twoTurn && !x.twoTurnWeather);
                if (!opts.length) {
                    a.lastMoveFailed = true;
                    return;
                }
                const called = rng.pick(opts), oldpp = called.pp;
                a._sleepTalkCalled = true;
                fmExecute(side, opp, { type: 'move', actor: a, moveId: called.id, target: d }, field, rng, stats);
                a._sleepTalkCalled = false;
                called.pp = oldpp;
                return;
            }
            if (m.v71AntMarch) {
                if (a.hp <= a.maxHP / 2) {
                    a.lastMoveFailed = true;
                    return;
                }
                a.hp = Math.max(1, a.hp - Math.floor(a.maxHP / 2));
            }
            if (m.growth)
                changeStage(a, { attack: field.weather === 'sun' ? 2 : 1, specialAttack: field.weather === 'sun' ? 2 : 1 }, a);
            if (m.curse) {
                if (a.types.includes('ゴースト')) {
                    if (a.hp <= a.maxHP / 2) {
                        a.lastMoveFailed = true;
                        return;
                    }
                    a.hp = Math.max(1, a.hp - Math.floor(a.maxHP / 2));
                    if (d)
                        d.cursed = true;
                }
                else
                    changeStage(a, { attack: 1, defense: 1, speed: -1 }, a);
            }
            if (m.destinyBond)
                a.destinyBond = true;
            if (m.imprison)
                a.imprison = true;
            if (m.trapTarget && d)
                d.trappedTurns = Math.max(d.trappedTurns || 0, 99);
            if (m.seedTarget && d && !d.types.includes('くさ')) {
                d.seeded = true;
                d.seedSourceSide = a.side;
            }
            if (m.spitePP && d?.lastMoveId) {
                const lm = d.moves.find(x => x.id === d.lastMoveId);
                if (lm)
                    lm.pp = Math.max(0, lm.pp - Number(m.spitePP || 4));
            }
            if (m.swapItems && d) {
                const ai = a.item, ac = a.itemConsumed;
                a.item = d.item;
                a.itemConsumed = d.itemConsumed;
                d.item = ai;
                d.itemConsumed = ac;
            }
            if (m.tauntTurns && d)
                d.tauntTurns = Math.max(d.tauntTurns || 0, m.tauntTurns);
            if (m.encoreTurns && d?.lastMoveId) {
                d.encoreTurns = m.encoreTurns;
                d.encoreMoveId = d.lastMoveId;
            }
            if (m.disableTurns && d?.lastMoveId) {
                d.disableTurns = m.disableTurns;
                d.disableMoveId = d.lastMoveId;
            }
            if (m.yawn && d && !d.status)
                d.yawnTurns = 2;
            if (m.substitute) {
                const cost = Math.floor(a.maxHP / 4);
                if (a.hp > cost && !a.substituteHP) {
                    a.hp -= cost;
                    a.substituteHP = cost;
                }
                else {
                    a.lastMoveFailed = true;
                    return;
                }
            }
            if (m.wish)
                field.wish[a.side] = { turns: 2, heal: Math.max(1, Math.floor(a.maxHP / 2)) };
            if (m.mist)
                field.mist[a.side] = 5;
            if (m.safeguard)
                field.safeguard[a.side] = 5;
            if (m.quickGuard)
                field.quickGuard[a.side] = 1;
            if (m.magicRoom)
                field.magicRoom = field.magicRoom > 0 ? 0 : 5;
            if (m.wonderRoom)
                field.wonderRoom = field.wonderRoom > 0 ? 0 : 5;
            if (m.batonPass) {
                const n = fmBestSwitch(side, opp, a, field, rng), idx = side.active.indexOf(a);
                if (n && idx >= 0) {
                    const oldStages = { ...a.stages }, oldSub = a.substituteHP, oldAqua = a.aquaRing;
                    if (a.ability.id === 'regenerator')
                        a.hp = Math.min(a.maxHP, a.hp + Math.floor(a.maxHP / 3));
                    if (a.ability.id === 'natural-cure' && a.status) {
                        a.status = null;
                        a.statusTurns = 0;
                        a.toxicCounter = 0;
                    }
                    side.active[idx] = n;
                    n._pos = idx;
                    applyEntry(n, field, side, opp);
                    n.stages = { ...oldStages };
                    n.substituteHP = oldSub;
                    n.aquaRing = oldAqua;
                    hazardOnEntry(n, field);
                    stats.switches[side.side]++;
                }
                return;
            }
            if (m.lunarDance) {
                field.lunarDance[a.side] = true;
                a.hp = 0;
                return;
            }
            if (m.id === 'v6-072') {
                a.redirect = true;
                return;
            }
            if (m.id === 'v6-107' && target && target.side === a.side) {
                target.helpingHand = true;
                return;
            }
            if (m.id === 'v6-153' && target && target.side === a.side) {
                changeStage(target, { attack: 1, defense: 1 }, a);
                return;
            }
            if (m.healRatio && a.recoveryBlockTurns <= 0)
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * m.healRatio)));
            if (m.healByWeather && a.recoveryBlockTurns <= 0) {
                const r = field.weather === 'sun' ? 2 / 3 : ['rain', 'sand', 'snow'].includes(field.weather) ? 1 / 4 : 1 / 2;
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * r)));
            }
            if (m.rest && a.recoveryBlockTurns <= 0) {
                a.hp = a.maxHP;
                a.status = 'sleep';
                a.statusTurns = 2;
            }
            if (m.healTargetRatio && target && target.recoveryBlockTurns <= 0)
                target.hp = Math.min(target.maxHP, target.hp + Math.max(1, Math.floor(target.maxHP * m.healTargetRatio)));
            if (m.allyHealRatio && target && target.side === a.side && target.recoveryBlockTurns <= 0)
                target.hp = Math.min(target.maxHP, target.hp + Math.max(1, Math.floor(target.maxHP * m.allyHealRatio)));
            if (m.bellyDrum && a.hp > a.maxHP / 2) {
                a.hp -= Math.floor(a.maxHP / 2);
                a.stages.attack = 6;
            }
            if (m.stockpile && a.stockpileCount < 3) {
                a.stockpileCount++;
                changeStage(a, { defense: 1, specialDefense: 1 }, a);
            }
            if (m.swallow && a.stockpileCount > 0 && a.recoveryBlockTurns <= 0) {
                const ratios = [0, .25, .5, 1], r = ratios[a.stockpileCount] || 1;
                a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(a.maxHP * r)));
                a.stockpileCount = 0;
            }
            if (m.painSplit && d) {
                const avg = Math.floor((a.hp + d.hp) / 2);
                a.hp = Math.min(a.maxHP, avg);
                d.hp = Math.min(d.maxHP, avg);
            }
            if (m.recycle && a.itemConsumed)
                a.itemConsumed = false;
            if (m.aquaRing)
                a.aquaRing = true;
            if (m.magnetRise)
                a.magnetRiseTurns = 5;
            if (m.focusEnergy)
                a.focusEnergy = Math.max(a.focusEnergy || 0, 2);
            if (m.chargeElectric)
                a.chargeElectric = true;
            if (m.ingrain)
                a.ingrain = true;
            changeStage(a, m.selfStatChanges, a);
            if (target && !target.protect) {
                changeStage(target, m.targetStatChanges, source);
                if (m.directStatus)
                    applyStatus(target, m.directStatus, rng, source, m);
                if (m.toxic)
                    applyStatus(target, 'toxic', rng, source, m);
                if (m.confuse)
                    target.confusedTurns = Math.max(target.confusedTurns || 0, 2 + rng.int(3));
                if (m.setTypes)
                    target.types = [...m.setTypes];
                if (m.setAbility && !['schooling', 'power-construct'].includes(target.ability.id))
                    target.ability = { id: m.setAbility, name: m.setAbility };
                if (m.entrainment && !['schooling', 'power-construct'].includes(target.ability.id))
                    target.ability = { ...a.ability };
            }
            if (m.haze)
                for (const q of [...side.active, ...opp.active])
                    for (const k of Object.keys(q.stages))
                        q.stages[k] = 0;
            if (m.defog) {
                field.hazards.A = {};
                field.hazards.B = {};
                field.terrain = null;
                field.terrainTurns = 0;
                for (const sd of ['A', 'B']) {
                    field.screens[sd].reflect = 0;
                    field.screens[sd].lightScreen = 0;
                }
            }
            if (m.weather) {
                field.weather = m.weather;
                field.weatherTurns = 5;
                for (const q of [...side.active, ...opp.active])
                    updateForecast(q, field);
            }
            if (m.terrain) {
                field.terrain = m.terrain;
                field.terrainTurns = 5;
            }
            if (m.tailwind) {
                field.tailwind[a.side] = 4;
                for (const q of [...side.active, ...opp.active])
                    if (q.ability.id === 'windmill')
                        changeStage(q, { speed: 1 }, q);
            }
            if (m.trickRoom)
                field.trickRoom = 5;
            if (m.gravity)
                field.gravity = 5;
            if (m.screen)
                field.screens[a.side][m.screen] = 5;
            if (m.hazard) {
                const hz = field.hazards[opp.side];
                if (m.hazard === 'stealthRock')
                    hz.stealthRock = true;
                else if (m.hazard === 'spikes')
                    hz.spikes = Math.min(3, (hz.spikes || 0) + 1);
                else if (m.hazard === 'toxicSpikes')
                    hz.toxicSpikes = Math.min(2, (hz.toxicSpikes || 0) + 1);
                else if (m.hazard === 'stickyWeb')
                    hz.stickyWeb = true;
            }
            return;
        }
        const st = fmSpreadType(m);
        let chosenTarget = act.target && act.target.hp > 0 ? act.target : opp.active.find(x => x.hp > 0);
        if (st === 'one' && a.ability.id !== 'stalwart' && chosenTarget?.side !== a.side) {
            const moveType = effectiveMoveType(a, m, field), rod = moveType === 'でんき' ? opp.active.find(x => x?.hp > 0 && x.ability?.id === 'lightning-rod') : null, redir = opp.active.find(x => x?.hp > 0 && x.redirect);
            if (rod)
                chosenTarget = rod;
            else if (redir)
                chosenTarget = redir;
        }
        let targets = st === 'one' ? [chosenTarget].filter(Boolean) : st === 'all-foes' ? opp.active.filter(x => x.hp > 0) : [...side.active, ...opp.active].filter(x => x !== a && x.hp > 0);
        const spread = targets.length > 1;
        if (m.requiresTargetItem && targets[0] && (targets[0].itemConsumed || targets[0].item?.id === 'none')) {
            a.lastMoveFailed = true;
            return;
        }
        let total = 0;
        for (const d of targets) {
            fmEncounter(stats, a, d, false);
            if (field.quickGuard?.[d.side] > 0 && (m.priority || 0) > 0) {
                crashOnFail(a, m);
                continue;
            }
            if (d.protect && !m.breakProtect) {
                if (d.protectContactParalyze && m.contact)
                    applyStatus(a, 'paralysis', rng, d, m);
                crashOnFail(a, m);
                continue;
            }
            if (d.side === a.side && m.pollenPuff) {
                if (d.recoveryBlockTurns <= 0)
                    d.hp = Math.min(d.maxHP, d.hp + Math.max(1, Math.floor(d.maxHP / 2)));
                continue;
            }
            if (applyAbilityBlock(a, d, m, field)) {
                crashOnFail(a, m);
                continue;
            }
            const acc = moveAccuracy(a, m, field) * stageMult(a.stages.accuracy) / stageMult(d.stages.evasion);
            if (acc < 100 && rng() * 100 >= acc) {
                if (m.furyCutter)
                    a.furyCutterCount = 0;
                if (m.rollout)
                    a.rolloutCount = 0;
                crashOnFail(a, m);
                continue;
            }
            const before = d.hp, critical = rng() < criticalChance(a, m);
            let dmg = damageEstimate(a, d, m, field, .85 + rng() * .15, critical);
            if (Array.isArray(m.multiHit)) {
                const [lo, hi] = m.multiHit;
                let hits = lo === hi ? lo : (rng() < .375 ? 2 : rng() < .6 ? 3 : rng() < .8 ? 4 : 5);
                hits = clamp(hits, lo, hi);
                dmg *= hits;
            }
            if (spread)
                dmg = Math.max(1, Math.floor(dmg * .75));
            const mt = effectiveMoveType(a, m, field);
            let eff = m.struggle ? 1 : typeEffect(mt, d.types, a.ability.id);
            if (m.freezeDry && d.types.includes('みず'))
                eff *= 4;
            if (a.ability.id === 'tinted-lens' && eff > 0 && eff < 1)
                eff *= 2;
            dmg = consumeBerryForDamage(d, { ...m, type: mt }, eff, dmg, field);
            if (dmg >= d.hp && d.hp === d.maxHP) {
                if (d.ability.id === 'sturdy')
                    dmg = d.hp - 1;
                else if ((field.magicRoom || 0) <= 0 && d.item.id === 'focus-sash' && !d.itemConsumed) {
                    d.itemConsumed = true;
                    dmg = d.hp - 1;
                }
            }
            if (dmg >= d.hp && d.endure)
                dmg = Math.max(0, d.hp - 1);
            d.hp = Math.max(0, d.hp - dmg);
            const dealt = before - d.hp, totalKo = before > 0 && d.hp <= 0;
            if (dealt > 0) {
                d.lastDamageAmount = dealt;
                d.lastDamageCategory = m.category;
                d.lastDamageFromSide = a.side;
            }
            total += dealt;
            fmStatsMove(stats, a, m, dealt, totalKo, true);
            recordArchetypeEncounter(stats, a, d, { dealt, ko: totalKo });
            if (totalKo) {
                if (d.destinyBond)
                    a.hp = 0;
                a.koCount++;
                if (a.ability.id === 'moxie')
                    changeStage(a, { attack: 1 }, a);
                if (m.fellStinger)
                    changeStage(a, { attack: 3 }, a);
                fmEncounter(stats, a, d, true);
            }
            else if (dealt > 0) {
                if (d.ability.id === 'stamina')
                    changeStage(d, { defense: 1 }, d);
                if (d.ability.id === 'gooey' && m.contact)
                    changeStage(a, { speed: -1 }, d);
            }
            if (m.breakScreens && dealt > 0) {
                field.screens[d.side].reflect = 0;
                field.screens[d.side].lightScreen = 0;
            }
            if (m.clearTargetStages && dealt > 0)
                for (const k of Object.keys(d.stages))
                    d.stages[k] = 0;
            if (m.smackDown && dealt > 0) {
                d.smackDown = true;
                d.magnetRiseTurns = 0;
                if (d.item?.id === 'air-balloon')
                    d.itemConsumed = true;
            }
            if (dealt>0 && m.contact && d.item?.id==='rocky-helmet' && !d.itemConsumed && (field.magicRoom||0)<=0 && a.hp>0 && a.ability.id!=='magic-guard') a.hp=Math.max(0,a.hp-Math.max(1,Math.floor(a.maxHP/6)));
            if (m.knockOff && dealt > 0 && !d.itemConsumed && d.item.id !== 'none')
                d.itemConsumed = true;
            if (m.recoveryBlockTurns && dealt > 0)
                d.recoveryBlockTurns = Math.max(d.recoveryBlockTurns || 0, m.recoveryBlockTurns);
            if ((m.forceSwitch || m.forceSwitchOnHit) && dealt > 0 && d.hp > 0 && d.side !== a.side) {
                const ds = opp, os = side, rep = fmBestSwitch(ds, os, d, field, rng);
                if (rep) {
                    const pos = ds.active.indexOf(d);
                    if (pos >= 0) {
                        ds.active[pos] = rep;
                        rep._pos = pos;
                        applyEntry(rep, field, ds, os);
                        hazardOnEntry(rep, field);
                        stats.switches[ds.side]++;
                    }
                }
            }
            if (m.bugBite && dealt > 0)
                consumeBugBite(a, d);
            if (m.seedTarget && dealt > 0 && !d.types.includes('くさ')) {
                d.seeded = true;
                d.seedSourceSide = a.side;
            }
            if ((m.trapDamage || m.jawLock) && dealt > 0) {
                d.trappedTurns = Math.max(d.trappedTurns || 0, 4 + rng.int(2));
                if (m.jawLock)
                    a.trappedTurns = Math.max(a.trappedTurns || 0, d.trappedTurns);
            }
            if (m.confuseIfTargetRaised && d.raisedThisTurn && dealt > 0)
                d.confusedTurns = Math.max(d.confusedTurns || 0, 2 + rng.int(3));
            const sheer = a.ability.id === 'sheer-force' && isSheerForceMove(m);
            if (!sheer)
                changeStage(d, m.targetStatChanges, a);
            if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && m.targetStatChangeChance && rng() * 100 < m.targetStatChangeChance.chance)
                changeStage(d, { [m.targetStatChangeChance.stat]: m.targetStatChangeChance.amount }, a);
            if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && m.secondaryStatus && rng() * 100 < m.secondaryStatus.chance)
                applyStatus(d, m.secondaryStatus.status, rng, a, m);
            if (!sheer && m.confuseChance && rng() * 100 < m.confuseChance)
                d.confusedTurns = Math.max(d.confusedTurns || 0, 2 + rng.int(3));
            if (!sheer && dealt>0 && !((field.magicRoom||0)<=0 && !d.itemConsumed && d.item.id==='covert-cloak') && m.flinchChance && rng() * 100 < m.flinchChance)
                d.flinched = true;
        }
        if (m.removeTerrain && total > 0 && field.terrain) {
            field.terrain = null;
            field.terrainTurns = 0;
        }
        if (m.clearFieldStructures && total > 0) {
            field.hazards.A = {};
            field.hazards.B = {};
            field.terrain = null;
            field.terrainTurns = 0;
            field.trickRoom = 0;
            field.magicRoom = 0;
            field.wonderRoom = 0;
            for (const sd of ['A', 'B']) {
                field.screens[sd].reflect = 0;
                field.screens[sd].lightScreen = 0;
            }
        }
        if (m.removeIceUntilEndTurn && total > 0 && a.types.includes('こおり')) {
            a.iceRestoreTypes = [...a.types];
            a.types = a.types.filter(t => t !== 'こおり');
        }
        if (m.rapidSpin && total > 0) {
            field.hazards[a.side] = {};
            a.seeded = false;
        }
        if (m.furyCutter && total > 0)
            a.furyCutterCount = Math.min(3, (a.furyCutterCount || 0) + 1);
        else if (!m.furyCutter)
            a.furyCutterCount = 0;
        if (m.rollout && total > 0)
            a.rolloutCount = Math.min(4, (a.rolloutCount || 0) + 1);
        else if (!m.rollout)
            a.rolloutCount = 0;
        if (m.spitUp && total > 0)
            a.stockpileCount = 0;
        if (a.chargeElectric && effectiveMoveType(a, m, field) === 'でんき' && total > 0)
            a.chargeElectric = false;
        if (m.drainRatio && total && a.recoveryBlockTurns <= 0)
            a.hp = Math.min(a.maxHP, a.hp + Math.max(1, Math.floor(total * m.drainRatio)));
        if (m.recoilRatio && total && a.ability.id !== 'magic-guard')
            a.hp = Math.max(0, a.hp - Math.max(1, Math.round(total * m.recoilRatio)));
        if (m.recoilMaxHPRatio && a.ability.id !== 'magic-guard')
            a.hp = Math.max(0, a.hp - Math.max(1, Math.ceil(a.maxHP * m.recoilMaxHPRatio)));
        if (m.struggle && a.hp > 0)
            a.hp = Math.max(0, a.hp - Math.max(1, Math.round(a.maxHP / 4)));
        if (a.helpingHand)
            a.helpingHand = false;
        if (!m.struggle && (field.magicRoom || 0) <= 0 && a.item.id === 'life-orb' && !a.itemConsumed && total && a.ability.id !== 'magic-guard' && !(a.ability.id === 'sheer-force' && isSheerForceMove(m)))
            a.hp = Math.max(0, a.hp - Math.max(1, Math.floor(a.maxHP / 10)));
        if (m.selfFaint || m.selfFaintAfterDamage || m.finalGambit)
            a.hp = 0;
        if (m.recharge && total)
            a.recharge = true;
        if (m.rampage && a.rampageMoveId === m.id) {
            a.rampageTurns = Math.max(0, (a.rampageTurns || 1) - 1);
            if (a.rampageTurns <= 0) {
                a.rampageMoveId = null;
                a.rampageTurns = 0;
                a.confusedTurns = Math.max(a.confusedTurns || 0, 2 + rng.int(3));
            }
        }
        const sheer = a.ability.id === 'sheer-force' && isSheerForceMove(m);
        changeStage(a, m.selfStatChanges, a);
        if (!sheer && m.selfStatChangeChance && rng() * 100 < m.selfStatChangeChance.chance)
            changeStage(a, { [m.selfStatChangeChance.stat]: m.selfStatChangeChance.amount }, a);
        if (!sheer && m.allStatBoostChance && rng() * 100 < m.allStatBoostChance)
            changeStage(a, { attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 }, a);
        if (!m.struggle && (field.magicRoom || 0) <= 0 && !a.itemConsumed && ['choice-band', 'choice-specs', 'choice-scarf'].includes(a.item.id))
            a.choiceLock = m.id;
        if (m.pivot && total > 0 && a.hp > 0) {
            const idx = side.active.indexOf(a), n = fmBestSwitch(side, opp, a, field, rng);
            if (idx >= 0 && n && n.hp > 0 && !side.active.includes(n)) {
                if (a.ability.id === 'regenerator')
                    a.hp = Math.min(a.maxHP, a.hp + Math.floor(a.maxHP / 3));
                if (a.ability.id === 'natural-cure' && a.status) {
                    a.status = null;
                    a.statusTurns = 0;
                    a.toxicCounter = 0;
                }
                side.active[idx] = n;
                n._pos = idx;
                applyEntry(n, field, side, opp);
                hazardOnEntry(n, field);
                stats.switches[side.side]++;
            }
        }
    }
    function fmOrder(actions, field, rng) { return actions.sort((x, y) => { if (x.type === 'switch' && y.type !== 'switch')
        return -1; if (y.type === 'switch' && x.type !== 'switch')
        return 1; const px = x.type === 'move' ? (MOVE_DEX[x.moveId]?.priority || 0) : 0, py = y.type === 'move' ? (MOVE_DEX[y.moveId]?.priority || 0) : 0; if (px !== py)
        return py - px; const sx = effectiveSpeed(x.actor, field), sy = effectiveSpeed(y.actor, field); if (sx === sy)
        return rng() < .5 ? -1 : 1; return field.trickRoom > 0 ? sx - sy : sy - sx; }); }
    function fmProcessFutureSight(A, B, field, stats) { if (!field.futureSight)
        return; for (const targetSide of ['A', 'B']) {
        const queue = field.futureSight[targetSide] || [], side = targetSide === 'A' ? A : B;
        for (let i = queue.length - 1; i >= 0; i--) {
            const e = queue[i];
            e.turns--;
            if (e.turns > 0)
                continue;
            queue.splice(i, 1);
            const d = side.active.find(x => x && x.hp > 0 && x._pos === e.targetPos && (e.targetGroup == null || x._group === e.targetGroup)) || side.active.find(x => x?.hp > 0), a = e.attacker, m = e.move;
            if (!d || !a)
                continue;
            const before = d.hp, dmg = Math.min(d.hp, damageEstimate(a, d, m, field, .925, false));
            d.hp = Math.max(0, d.hp - dmg);
            const dealt = before - d.hp, ko = before > 0 && d.hp <= 0;
            if (dealt > 0) {
                d.lastDamageAmount = dealt;
                d.lastDamageCategory = m.category;
                d.lastDamageFromSide = a.side;
                fmStatsMove(stats, a, m, dealt, ko, true);
                if (ko)
                    a.koCount++;
            }
        }
    } }
    function fmResidualSide(side, field) { for (const p of side.active)
        if (p && p.hp > 0) {
            const wrapper = { active: p };
            residual(wrapper, field);
        } }
    function recordSelectedCounterResults(stats, setsA, setsB, winner) {
        if (!stats?.selectedCounterResults)
            return;
        // Each pair is selected on opposing teams. 'wins' is the match outcome of
        // the selected candidate's team, NOT a KO or an individual head-to-head win.
        for (const a of setsA)
            for (const b of setsB) {
                for (const [x, y, side] of [[a, b, 'A'], [b, a, 'B']]) {
                    const k = `${x.speciesId}|${x.abilityId}>${y.speciesId}|${y.abilityId}`;
                    const r = stats.selectedCounterResults[k] || (stats.selectedCounterResults[k] = { games: 0, wins: 0, losses: 0, draws: 0 });
                    r.games++;
                    if (winner === 'draw')
                        r.draws++;
                    else if (winner === side)
                        r.wins++;
                    else
                        r.losses++;
                }
            }
    }
    function fmCollectMatchups(result, selectedA, selectedB, winner) { for (const sa of selectedA)
        for (const sb of selectedB) {
            const ka = `${sa.speciesId}>${sb.speciesId}`, kb = `${sb.speciesId}>${sa.speciesId}`;
            const a = result.matchups[ka] || (result.matchups[ka] = { games: 0, wins: 0 }), b = result.matchups[kb] || (result.matchups[kb] = { games: 0, wins: 0 });
            a.games++;
            b.games++;
            if (winner === 'A')
                a.wins++;
            if (winner === 'B')
                b.wins++;
            const ssa = result.species[sa.speciesId] || (result.species[sa.speciesId] = newSpeciesStats()), ssb = result.species[sb.speciesId] || (result.species[sb.speciesId] = newSpeciesStats());
            const ma = ssa.matchups[sb.speciesId] || (ssa.matchups[sb.speciesId] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 }), mb = ssb.matchups[sa.speciesId] || (ssb.matchups[sa.speciesId] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0 });
            ma.games++;
            mb.games++;
            if (winner === 'A') {
                ma.wins++;
                mb.losses++;
            }
            if (winner === 'B') {
                mb.wins++;
                ma.losses++;
            }
        } }
    function simulateFormatBattle(config, index) {
        const format = config.format || 'single';
        if (format === 'single')
            return simulateBattle(config, index);
        const rules = compileRules(config), fd = FM_FORMATS[format] || FM_FORMATS.double, rng = makeRng(seedHash(config.seed || 'niwara', index)), diffA = config.difficultyA || 'very-strong', diffB = config.difficultyB || 'very-strong', buildMode = config.buildMode || 'auto';
        let rostersA = [], rostersB = [], selsA = [], selsB = [];
        if (format === 'tag') {
            for (let g = 0; g < 2; g++) {
                rostersA.push(buildTeam(rng, diffA, buildMode, rules, config.__metaSnapshot || config.metaSnapshot || null));
                rostersB.push(buildTeam(rng, diffB, buildMode, rules, config.__metaSnapshot || config.metaSnapshot || null));
            }
            const oppA = rostersB.flat(), oppB = rostersA.flat();
            for (let g = 0; g < 2; g++) {
                selsA.push(fmSelectN(rostersA[g], oppA, 3, diffA, rng, rules, config.__metaSnapshot || config.metaSnapshot || null));
                selsB.push(fmSelectN(rostersB[g], oppB, 3, diffB, rng, rules, config.__metaSnapshot || config.metaSnapshot || null));
            }
        }
        else {
            rostersA = [buildTeam(rng, diffA, buildMode, rules, config.__metaSnapshot || config.metaSnapshot || null)];
            rostersB = [buildTeam(rng, diffB, buildMode, rules, config.__metaSnapshot || config.metaSnapshot || null)];
            selsA = [fmSelectN(rostersA[0], rostersB[0], fd.select, diffA, rng, rules, config.__metaSnapshot || config.metaSnapshot || null)];
            selsB = [fmSelectN(rostersB[0], rostersA[0], fd.select, diffB, rng, rules, config.__metaSnapshot || config.metaSnapshot || null)];
        }
        const A = fmSide('A', rostersA, selsA, diffA, fd.active), B = fmSide('B', rostersB, selsB, diffB, fd.active), result = emptyBatchStats();
        result.format = format;
        result.battles = 1;
        const stats = { moves: result.moves, species: result.species, encounters: result.encounters, archetypeEncounters: result.archetypeEncounters, selectedCounterResults: result.selectedCounterResults, switches: { A: 0, B: 0 } };
        A.stats = B.stats = stats;
        const field = { weather: null, weatherTurns: 0, terrain: null, terrainTurns: 0, trickRoom: 0, gravity: 0, magicRoom: 0, wonderRoom: 0, tailwind: { A: 0, B: 0 }, screens: { A: { reflect: 0, lightScreen: 0 }, B: { reflect: 0, lightScreen: 0 } }, mist: { A: 0, B: 0 }, safeguard: { A: 0, B: 0 }, quickGuard: { A: 0, B: 0 }, wish: { A: null, B: null }, lunarDance: { A: false, B: false }, hazards: { A: {}, B: {} }, futureSight: { A: [], B: [] }, rules };
        field._sideRefs = { A, B };
        A.active.forEach((p, i) => { p._pos = i; applyEntry(p, field, A, B); });
        B.active.forEach((p, i) => { p._pos = i; applyEntry(p, field, B, A); });
        refreshFairyAura(field, A.active, B.active);
        let turns = 0;
        while (turns < (config.turnLimit || 200) && fmLiving(A) && fmLiving(B)) {
            turns++;
            refreshFairyAura(field, A.active, B.active);
            for (const p of [...A.active, ...B.active])
                if (p) {
                    p.protect = false;
                    p.endure = false;
                    p.protectContactParalyze = false;
                    p.redirect = false;
                    p.helpingHand = false;
                    p.flinched = false;
                    p.raisedThisTurn = false;
                    p.destinyBond = false;
                    p.lastDamageAmount = 0;
                    p.lastDamageCategory = null;
                    p.lastDamageFromSide = null;
                }
            const actions = [];
            for (const p of A.active.filter(x => x.hp > 0))
                actions.push(fmChoose(A, B, p, field, rng));
            for (const p of B.active.filter(x => x.hp > 0))
                actions.push(fmChoose(B, A, p, field, rng));
            for (const act of fmOrder(actions, field, rng)) {
                const side = act.actor.side === 'A' ? A : B, opp = side === A ? B : A;
                if (act.actor.hp <= 0 || !side.active.includes(act.actor))
                    continue;
                fmExecute(side, opp, act, field, rng, stats);
                fmReplace(A, B, field, rng);
                fmReplace(B, A, field, rng);
                if (!fmLiving(A) || !fmLiving(B))
                    break;
            }
            if (!fmLiving(A) || !fmLiving(B))
                break;
            fmResidualSide(A, field);
            fmResidualSide(B, field);
            halloweenPunkEndTurn([...A.active, ...B.active], rng);
            fmProcessFutureSight(A, B, field, stats);
            fmReplace(A, B, field, rng);
            fmReplace(B, A, field, rng);
            if (field.weatherTurns > 0 && --field.weatherTurns <= 0) {
                field.weather = null;
                for (const q of [...A.active, ...B.active])
                    if (q)
                        updateForecast(q, field);
            }
            if (field.terrainTurns > 0 && --field.terrainTurns <= 0)
                field.terrain = null;
            if (field.trickRoom > 0)
                field.trickRoom--;
            for (const sd of ['A', 'B']) {
                if (field.tailwind[sd] > 0)
                    field.tailwind[sd]--;
                for (const k of ['reflect', 'lightScreen'])
                    if (field.screens[sd][k] > 0)
                        field.screens[sd][k]--;
            }
            tickSideField(field, A, B);
            for (const q of [...A.active, ...B.active])
                if (q?.iceRestoreTypes) {
                    q.types = q.iceRestoreTypes;
                    q.iceRestoreTypes = null;
                }
        }
        result.turns = turns;
        result.switches = stats.switches.A + stats.switches.B;
        const aliveA = fmLiving(A), aliveB = fmLiving(B), winner = aliveA && !aliveB ? 'A' : aliveB && !aliveA ? 'B' : 'draw';
        result.wins[winner]++;
        const collectSide = (rosters, sels, side) => { for (let g = 0; g < rosters.length; g++)
            for (let i = 0; i < 6; i++) {
                const selected = sels[g].includes(i), lead = selected && sels[g].indexOf(i) < (format === 'tag' ? 1 : fd.active);
                collectSetStats(result, rosters[g][i], selected, lead, winner, side);
            } };
        collectSide(rostersA, selsA, 'A');
        collectSide(rostersB, selsB, 'B');
        for (const p of [...A.team, ...B.team]) {
            const ss = result.species[p.id];
            if (ss) {
                ss.kos += p.koCount;
                if (p.hp <= 0)
                    ss.deaths++;
            }
        }
        const selectedA = selsA.flatMap((sel, g) => sel.map(i => rostersA[g][i])), selectedB = selsB.flatMap((sel, g) => sel.map(i => rostersB[g][i]));
        fmCollectMatchups(result, selectedA, selectedB, winner);
        recordSelectedCounterResults(result, selectedA, selectedB, winner);
        return result;
    }
    function mergeMetaSnapshot(meta, result) { meta = meta || { format: result?.format || 'single', species: {}, battles: 0, encounters: {}, archetypeEncounters: {}, selectedCounterResults: {} }; meta.format = meta.format || result?.format || 'single'; meta.species = meta.species || {}; meta.encounters = meta.encounters || {}; meta.archetypeEncounters = meta.archetypeEncounters || {}; meta.selectedCounterResults = meta.selectedCounterResults || {}; meta.battles = (meta.battles || 0) + (result.battles || 0); for (const [id, s] of Object.entries(result.species || {})) {
        const x = meta.species[id] || (meta.species[id] = { roster: 0, teamWins: 0, selected: 0, selectedWins: 0, moveSets: {}, moveSetWins: {}, abilities: {}, abilityWins: {}, items: {}, itemWins: {}, natures: {}, natureWins: {}, pointSpreads: {}, pointSpreadWins: {}, spreads: {}, spreadWins: {}, matchups: {} });
        for (const k of ['roster', 'teamWins', 'selected', 'selectedWins'])
            x[k] = (x[k] || 0) + (s[k] || 0);
        for (const k of ['moveSets', 'moveSetWins', 'abilities', 'abilityWins', 'items', 'itemWins', 'natures', 'natureWins', 'pointSpreads', 'pointSpreadWins', 'spreads', 'spreadWins']) {
            x[k] = x[k] || {};
            for (const [key, v] of Object.entries(s[k] || {}))
                x[k][key] = (x[k][key] || 0) + v;
        }
        x.matchups = x.matchups || {};
        for (const [oid, m] of Object.entries(s.matchups || {})) {
            const q = x.matchups[oid] || (x.matchups[oid] = { games: 0, wins: 0, losses: 0 });
            for (const k of ['games', 'wins', 'losses'])
                q[k] = (q[k] || 0) + (m[k] || 0);
        }
    } for (const bucket of ['encounters', 'archetypeEncounters'])
        for (const [k, v] of Object.entries(result[bucket] || {})) {
            const q = meta[bucket][k] || (meta[bucket][k] = { games: 0, wins: 0, losses: 0, kos: 0, deaths: 0, damage: 0, hits: 0 });
            for (const f of ['games', 'wins', 'losses', 'kos', 'deaths', 'damage', 'hits'])
                q[f] = (q[f] || 0) + (v[f] || 0);
        } for (const [k, v] of Object.entries(result.selectedCounterResults || {})) {
        const q = meta.selectedCounterResults[k] || (meta.selectedCounterResults[k] = { games: 0, wins: 0, losses: 0, draws: 0 });
        for (const f of ['games', 'wins', 'losses', 'draws'])
            q[f] = (q[f] || 0) + (v[f] || 0);
    } return meta; }
    function cloneMetaSnapshot(src) { const out = { format: src?.format || 'single', species: {}, battles: Number(src?.battles || 0), encounters: { ...src?.encounters }, archetypeEncounters: { ...src?.archetypeEncounters }, selectedCounterResults: { ...src?.selectedCounterResults } }; for (const [id, x] of Object.entries(src?.species || {})) {
        const y = out.species[id] = { roster: Number(x.roster || 0), teamWins: Number(x.teamWins || 0), selected: Number(x.selected || 0), selectedWins: Number(x.selectedWins || 0), moveSets: { ...x.moveSets }, moveSetWins: { ...x.moveSetWins }, abilities: { ...x.abilities }, abilityWins: { ...x.abilityWins }, items: { ...x.items }, itemWins: { ...x.itemWins }, natures: { ...x.natures }, natureWins: { ...x.natureWins }, pointSpreads: { ...x.pointSpreads }, pointSpreadWins: { ...x.pointSpreadWins }, spreads: { ...x.spreads }, spreadWins: { ...x.spreadWins }, matchups: {} };
        for (const [oid, m] of Object.entries(x.matchups || {}))
            y.matchups[oid] = { games: Number(m.games || 0), wins: Number(m.wins || 0), losses: Number(m.losses || 0) };
    } return out; }
    function simulateRange(config, start, count) { assertRules(compileRules(config)); const total = emptyBatchStats(); total.format = config.format || 'single'; const local = { ...config, __metaSnapshot: cloneMetaSnapshot(config.metaSnapshot) }; if (config.metaFrozen && local.__metaSnapshot)
        try {
            Object.defineProperty(local.__metaSnapshot, '__niwaraFrozen', { value: true, enumerable: false });
        }
        catch (_) { } for (let i = 0; i < count; i++) {
        const result = simulateFormatBattle(local, start + i);
        mergeStats(total, result);
        if (!config.metaFrozen)
            mergeMetaSnapshot(local.__metaSnapshot, result);
    } return total; }
    root.NiwaraSimCore = Object.freeze({ version: root.NIWARA_APP?.version || 'dev', simulateBattle: simulateFormatBattle, simulateRange, emptyStats: emptyBatchStats, mergeStats, seedHash, validateConfig(config = {}) { const rules = compileRules(config); return { buildableSpecies: assertRules(rules).map(x => x.id), rules: { species: [...rules.species], moves: [...rules.moves], abilities: [...rules.abilities], items: [...rules.items] } }; } });
})(globalThis);
