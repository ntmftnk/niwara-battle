// ============================================================
// ニワラバトル v5 Champions仕様 - 基本データファイル
// ここには「技・種族・性格・持ち物・初期編成」を置きます。
// 将来ポケモンを増やす時は、主にこのファイルを編集します。
// ============================================================

const LEVEL = 50;

const STAT_LABELS = {
  hp: "H",
  attack: "A",
  defense: "B",
  specialAttack: "C",
  specialDefense: "D",
  speed: "S"
};

const STAT_JP = {
  attack: "こうげき",
  defense: "ぼうぎょ",
  specialAttack: "とくこう",
  specialDefense: "とくぼう",
  speed: "すばやさ",
  accuracy: "命中率",
  evasion: "回避率"
};

const WEATHER_NAMES = {
  sun: "にほんばれ",
  rain: "あめ",
  sand: "すなあらし",
  snow: "ゆき"
};

const STATUS_NAMES = {
  burn: "やけど",
  poison: "どく",
  toxic: "もうどく",
  paralysis: "まひ",
  sleep: "ねむり",
  freeze: "こおり"
};

// ============================================================
// 技データ
// ============================================================
const MOVE_DEX = {
  "kaenzan": {
    id: "kaenzan",
    name: "かえんざん",
    type: "ほのお",
    category: "physical",
    power: 100,
    accuracy: 100,
    priority: 0,
    maxPP: 10,
    slicing: true
  },
  "nessa-sword": {
    id: "nessa-sword",
    name: "ねっさのつるぎ",
    type: "じめん",
    category: "physical",
    power: 90,
    accuracy: 100,
    priority: 0,
    maxPP: 10,
    slicing: true,
    secondaryStatus: { status: "burn", chance: 30 }
  },
  "earthquake": {
    id: "earthquake",
    name: "じしん",
    type: "じめん",
    category: "physical",
    power: 100,
    accuracy: 100,
    priority: 0,
    maxPP: 10
  },
  "close-combat": {
    id: "close-combat",
    name: "インファイト",
    type: "かくとう",
    category: "physical",
    power: 120,
    accuracy: 100,
    priority: 0,
    maxPP: 5,
    selfStatChanges: { defense: -1, specialDefense: -1 }
  },
  "crunch": {
    id: "crunch",
    name: "かみくだく",
    type: "あく",
    category: "physical",
    power: 80,
    accuracy: 100,
    priority: 0,
    maxPP: 15
  },
  "swords-dance": {
    id: "swords-dance",
    name: "つるぎのまい",
    type: "ノーマル",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 20,
    selfStatChanges: { attack: 2 }
  },
  "sunny-day": {
    id: "sunny-day",
    name: "にほんばれ",
    type: "ほのお",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 5,
    weather: "sun"
  },

  "wood-hammer": {
    id: "wood-hammer",
    name: "ウッドハンマー",
    type: "くさ",
    category: "physical",
    power: 120,
    accuracy: 100,
    priority: 0,
    maxPP: 15,
    recoilRatio: 1 / 3
  },
  "ice-shard": {
    id: "ice-shard",
    name: "こおりのつぶて",
    type: "こおり",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 1,
    maxPP: 30
  },
  "ice-spinner": {
    id: "ice-spinner",
    name: "アイススピナー",
    type: "こおり",
    category: "physical",
    power: 80,
    accuracy: 100,
    priority: 0,
    maxPP: 15
  },
  "megahorn": {
    id: "megahorn",
    name: "メガホーン",
    type: "むし",
    category: "physical",
    power: 120,
    accuracy: 85,
    priority: 0,
    maxPP: 10
  },
  "high-horsepower": {
    id: "high-horsepower",
    name: "10まんばりき",
    type: "じめん",
    category: "physical",
    power: 95,
    accuracy: 95,
    priority: 0,
    maxPP: 10
  },
  "synthesis": {
    id: "synthesis",
    name: "こうごうせい",
    type: "くさ",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 5,
    healByWeather: true
  },
  "snowscape": {
    id: "snowscape",
    name: "ゆきげしき",
    type: "こおり",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 10,
    weather: "snow"
  },

  "scald": {
    id: "scald",
    name: "ねっとう",
    type: "みず",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0,
    maxPP: 15,
    secondaryStatus: { status: "burn", chance: 30 }
  },
  "surf": {
    id: "surf",
    name: "なみのり",
    type: "みず",
    category: "special",
    power: 90,
    accuracy: 100,
    priority: 0,
    maxPP: 15
  },
  "hydro-pump": {
    id: "hydro-pump",
    name: "ハイドロポンプ",
    type: "みず",
    category: "special",
    power: 110,
    accuracy: 80,
    priority: 0,
    maxPP: 5
  },
  "hurricane": {
    id: "hurricane",
    name: "ぼうふう",
    type: "ひこう",
    category: "special",
    power: 110,
    accuracy: 70,
    priority: 0,
    maxPP: 10
  },
  "icy-wind": {
    id: "icy-wind",
    name: "こごえるかぜ",
    type: "こおり",
    category: "special",
    power: 55,
    accuracy: 95,
    priority: 0,
    maxPP: 15,
    targetStatChanges: { speed: -1 }
  },
  "rain-dance": {
    id: "rain-dance",
    name: "あまごい",
    type: "みず",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 5,
    weather: "rain"
  },
  "calm-mind": {
    id: "calm-mind",
    name: "めいそう",
    type: "エスパー",
    category: "status",
    power: null,
    accuracy: null,
    priority: 0,
    maxPP: 20,
    selfStatChanges: { specialAttack: 1, specialDefense: 1 }
  }
};

// ============================================================
// 持ち物
// ============================================================
const ITEM_DEX = {
  "none": { id: "none", name: "なし" },
  "life-orb": { id: "life-orb", name: "いのちのたま" },
  "leftovers": { id: "leftovers", name: "たべのこし" },
  "sitrus-berry": { id: "sitrus-berry", name: "オボンのみ" },
  "toxic-orb": { id: "toxic-orb", name: "どくどくだま" }
};

// ============================================================
// 性格
// ============================================================
const NATURES = {
  "がんばりや": { up: null, down: null },
  "さみしがり": { up: "attack", down: "defense" },
  "ゆうかん": { up: "attack", down: "speed" },
  "いじっぱり": { up: "attack", down: "specialAttack" },
  "やんちゃ": { up: "attack", down: "specialDefense" },

  "ずぶとい": { up: "defense", down: "attack" },
  "すなお": { up: null, down: null },
  "のんき": { up: "defense", down: "speed" },
  "わんぱく": { up: "defense", down: "specialAttack" },
  "のうてんき": { up: "defense", down: "specialDefense" },

  "おくびょう": { up: "speed", down: "attack" },
  "せっかち": { up: "speed", down: "defense" },
  "まじめ": { up: null, down: null },
  "ようき": { up: "speed", down: "specialAttack" },
  "むじゃき": { up: "speed", down: "specialDefense" },

  "ひかえめ": { up: "specialAttack", down: "attack" },
  "おっとり": { up: "specialAttack", down: "defense" },
  "れいせい": { up: "specialAttack", down: "speed" },
  "てれや": { up: null, down: null },
  "うっかりや": { up: "specialAttack", down: "specialDefense" },

  "おだやか": { up: "specialDefense", down: "attack" },
  "おとなしい": { up: "specialDefense", down: "defense" },
  "なまいき": { up: "specialDefense", down: "speed" },
  "しんちょう": { up: "specialDefense", down: "specialAttack" },
  "きまぐれ": { up: null, down: null }
};

// ============================================================
// 種族データ
// ============================================================
const SPECIES_DEX = {
  "wolf": {
    id: "wolf",
    name: "ウルフレム",
    types: ["ほのお", "じめん"],
    baseStats: { hp: 85, attack: 125, defense: 60, specialAttack: 60, specialDefense: 60, speed: 140 },
    abilities: [
      { id: "blaze", name: "もうか" },
      { id: "sharpness", name: "きれあじ" }
    ],
    movePool: ["kaenzan", "nessa-sword", "earthquake", "close-combat", "crunch", "swords-dance", "sunny-day"]
  },
  "karibu": {
    id: "karibu",
    name: "カリブライン",
    types: ["くさ", "こおり"],
    baseStats: { hp: 110, attack: 115, defense: 80, specialAttack: 60, specialDefense: 60, speed: 105 },
    abilities: [
      { id: "overgrow", name: "しんりょく" },
      { id: "fur-coat", name: "ファーコート" }
    ],
    movePool: ["wood-hammer", "ice-shard", "ice-spinner", "megahorn", "high-horsepower", "synthesis", "snowscape"]
  },
  "babhat": {
    id: "babhat",
    name: "バブハット",
    types: ["みず", "ひこう"],
    baseStats: { hp: 80, attack: 60, defense: 60, specialAttack: 130, specialDefense: 90, speed: 110 },
    abilities: [
      { id: "torrent", name: "げきりゅう" },
      { id: "poison-heal", name: "ポイズンヒール" }
    ],
    movePool: ["scald", "surf", "hydro-pump", "hurricane", "icy-wind", "rain-dance", "calm-mind"]
  }
};

// ============================================================
// タイプ相性表
// ============================================================
const TYPE_CHART = {
  "ノーマル": { "いわ": 0.5, "ゴースト": 0, "はがね": 0.5 },
  "ほのお": { "ほのお": 0.5, "みず": 0.5, "くさ": 2, "こおり": 2, "むし": 2, "いわ": 0.5, "ドラゴン": 0.5, "はがね": 2 },
  "みず": { "ほのお": 2, "みず": 0.5, "くさ": 0.5, "じめん": 2, "いわ": 2, "ドラゴン": 0.5 },
  "でんき": { "みず": 2, "でんき": 0.5, "くさ": 0.5, "じめん": 0, "ひこう": 2, "ドラゴン": 0.5 },
  "くさ": { "ほのお": 0.5, "みず": 2, "くさ": 0.5, "どく": 0.5, "じめん": 2, "ひこう": 0.5, "むし": 0.5, "いわ": 2, "ドラゴン": 0.5, "はがね": 0.5 },
  "こおり": { "ほのお": 0.5, "みず": 0.5, "くさ": 2, "こおり": 0.5, "じめん": 2, "ひこう": 2, "ドラゴン": 2, "はがね": 0.5 },
  "かくとう": { "ノーマル": 2, "こおり": 2, "どく": 0.5, "ひこう": 0.5, "エスパー": 0.5, "むし": 0.5, "いわ": 2, "ゴースト": 0, "あく": 2, "はがね": 2, "フェアリー": 0.5 },
  "どく": { "くさ": 2, "どく": 0.5, "じめん": 0.5, "いわ": 0.5, "ゴースト": 0.5, "はがね": 0, "フェアリー": 2 },
  "じめん": { "ほのお": 2, "でんき": 2, "くさ": 0.5, "どく": 2, "ひこう": 0, "むし": 0.5, "いわ": 2, "はがね": 2 },
  "ひこう": { "でんき": 0.5, "くさ": 2, "かくとう": 2, "むし": 2, "いわ": 0.5, "はがね": 0.5 },
  "エスパー": { "かくとう": 2, "どく": 2, "エスパー": 0.5, "あく": 0, "はがね": 0.5 },
  "むし": { "ほのお": 0.5, "くさ": 2, "かくとう": 0.5, "どく": 0.5, "ひこう": 0.5, "エスパー": 2, "ゴースト": 0.5, "あく": 2, "はがね": 0.5, "フェアリー": 0.5 },
  "いわ": { "ほのお": 2, "こおり": 2, "かくとう": 0.5, "じめん": 0.5, "ひこう": 2, "むし": 2, "はがね": 0.5 },
  "ゴースト": { "ノーマル": 0, "エスパー": 2, "ゴースト": 2, "あく": 0.5 },
  "ドラゴン": { "ドラゴン": 2, "はがね": 0.5, "フェアリー": 0 },
  "あく": { "かくとう": 0.5, "エスパー": 2, "ゴースト": 2, "あく": 0.5, "フェアリー": 0.5 },
  "はがね": { "ほのお": 0.5, "みず": 0.5, "でんき": 0.5, "こおり": 2, "いわ": 2, "はがね": 0.5, "フェアリー": 2 },
  "フェアリー": { "ほのお": 0.5, "かくとう": 2, "どく": 0.5, "ドラゴン": 2, "あく": 2, "はがね": 0.5 }
};

// ============================================================
// 初期編成
// ============================================================
const DEFAULT_PLAYER_SETS = [
  {
    speciesId: "wolf", abilityId: "blaze", itemId: "life-orb", nature: "ようき",
    statPoints: { hp: 0, attack: 32, defense: 0, specialAttack: 0, specialDefense: 2, speed: 32 },
    moves: ["kaenzan", "earthquake", "close-combat", "swords-dance"]
  },
  {
    speciesId: "karibu", abilityId: "overgrow", itemId: "leftovers", nature: "いじっぱり",
    statPoints: { hp: 32, attack: 32, defense: 0, specialAttack: 0, specialDefense: 2, speed: 0 },
    moves: ["wood-hammer", "ice-shard", "high-horsepower", "synthesis"]
  },
  {
    speciesId: "babhat", abilityId: "torrent", itemId: "sitrus-berry", nature: "おくびょう",
    statPoints: { hp: 0, attack: 0, defense: 2, specialAttack: 32, specialDefense: 0, speed: 32 },
    moves: ["scald", "hurricane", "icy-wind", "calm-mind"]
  },
  {
    speciesId: "wolf", abilityId: "sharpness", itemId: "sitrus-berry", nature: "いじっぱり",
    statPoints: { hp: 2, attack: 32, defense: 0, specialAttack: 0, specialDefense: 0, speed: 32 },
    moves: ["kaenzan", "nessa-sword", "crunch", "sunny-day"]
  },
  {
    speciesId: "karibu", abilityId: "fur-coat", itemId: "leftovers", nature: "わんぱく",
    statPoints: { hp: 32, attack: 2, defense: 32, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: ["ice-spinner", "ice-shard", "high-horsepower", "snowscape"]
  },
  {
    speciesId: "babhat", abilityId: "poison-heal", itemId: "toxic-orb", nature: "ひかえめ",
    statPoints: { hp: 32, attack: 0, defense: 0, specialAttack: 32, specialDefense: 2, speed: 0 },
    moves: ["surf", "hydro-pump", "rain-dance", "calm-mind"]
  }
];

const DEFAULT_ENEMY_SETS = [
  {
    speciesId: "wolf", abilityId: "sharpness", itemId: "life-orb", nature: "ようき",
    statPoints: { hp: 0, attack: 32, defense: 0, specialAttack: 0, specialDefense: 2, speed: 32 },
    moves: ["kaenzan", "nessa-sword", "close-combat", "swords-dance"]
  },
  {
    speciesId: "karibu", abilityId: "fur-coat", itemId: "leftovers", nature: "わんぱく",
    statPoints: { hp: 32, attack: 2, defense: 32, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: ["wood-hammer", "ice-shard", "synthesis", "snowscape"]
  },
  {
    speciesId: "babhat", abilityId: "torrent", itemId: "sitrus-berry", nature: "おくびょう",
    statPoints: { hp: 0, attack: 0, defense: 2, specialAttack: 32, specialDefense: 0, speed: 32 },
    moves: ["hydro-pump", "hurricane", "icy-wind", "rain-dance"]
  },
  {
    speciesId: "wolf", abilityId: "blaze", itemId: "sitrus-berry", nature: "いじっぱり",
    statPoints: { hp: 2, attack: 32, defense: 0, specialAttack: 0, specialDefense: 0, speed: 32 },
    moves: ["earthquake", "close-combat", "crunch", "sunny-day"]
  },
  {
    speciesId: "karibu", abilityId: "overgrow", itemId: "sitrus-berry", nature: "いじっぱり",
    statPoints: { hp: 25, attack: 32, defense: 0, specialAttack: 0, specialDefense: 0, speed: 9 },
    moves: ["wood-hammer", "ice-spinner", "megahorn", "high-horsepower"]
  },
  {
    speciesId: "babhat", abilityId: "poison-heal", itemId: "toxic-orb", nature: "ひかえめ",
    statPoints: { hp: 32, attack: 0, defense: 0, specialAttack: 32, specialDefense: 2, speed: 0 },
    moves: ["scald", "surf", "hurricane", "calm-mind"]
  }
];
// ============================================================
// ニワラバトル v5 - 追加データパック
// 元のニワラ地方データに基づく種族・技・特性候補を拡張します。
// ============================================================

Object.assign(MOVE_DEX, {
  "tree-horn": {
    "id": "tree-horn",
    "name": "ツリーホーン",
    "type": "くさ",
    "category": "physical",
    "power": 80,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "seedTarget": true,
    "description": "命中時、相手をやどりぎ状態にする。"
  },
  "juhyo-charge": {
    "id": "juhyo-charge",
    "name": "じゅひょうとつげき",
    "type": "こおり",
    "category": "physical",
    "power": 140,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 5,
    "contact": true,
    "secondaryStatus": {
      "status": "freeze",
      "chance": 10
    },
    "description": "10%でこおり。"
  },
  "beast-dash": {
    "id": "beast-dash",
    "name": "ビーストダッシュ",
    "type": "かくとう",
    "category": "physical",
    "power": 100,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "recoilRatio": 0.25,
    "pivot": true,
    "description": "与ダメージの1/4反動後、控えと交代する。"
  },
  "jewel-cutter": {
    "id": "jewel-cutter",
    "name": "ジュエルカッター",
    "type": "いわ",
    "category": "physical",
    "power": 80,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "slicing": true,
    "targetStatChangeChance": {
      "stat": "defense",
      "amount": -1,
      "chance": 30
    },
    "description": "30%の確率で相手のぼうぎょを1段階下げる。斬る技。"
  },
  "rainy-shout": {
    "id": "rainy-shout",
    "name": "レイニーシャウト",
    "type": "みず",
    "category": "special",
    "power": 100,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "sound": true,
    "rainBonus": 1.5,
    "description": "雨の時、天候補正とは別に威力1.5倍。音技。"
  },
  "air-noise": {
    "id": "air-noise",
    "name": "エアノイズ",
    "type": "ひこう",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "sound": true,
    "wind": true,
    "recoveryBlockTurns": 2,
    "description": "相手を2ターン回復ふうじ状態にする。音・風技。"
  },
  "drain-voice": {
    "id": "drain-voice",
    "name": "ドレインボイス",
    "type": "フェアリー",
    "category": "special",
    "power": 85,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "sound": true,
    "drainRatio": 0.5,
    "description": "与えたダメージの半分を回復。音技。"
  },
  "midnight-bell": {
    "id": "midnight-bell",
    "name": "まよなかのかね",
    "type": "フェアリー",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": -1,
    "maxPP": 5,
    "sound": true,
    "description": "優先度-1の音技。"
  },
  "protect": {
    "id": "protect",
    "name": "まもる",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 4,
    "maxPP": 10,
    "protect": true,
    "description": "そのターン、相手の技を防ぐ。連続使用は成功率低下。"
  },
  "bulk-up": {
    "id": "bulk-up",
    "name": "ビルドアップ",
    "type": "かくとう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "selfStatChanges": {
      "attack": 1,
      "defense": 1
    }
  },
  "agility": {
    "id": "agility",
    "name": "こうそくいどう",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 30,
    "selfStatChanges": {
      "speed": 2
    }
  },
  "iron-defense": {
    "id": "iron-defense",
    "name": "てっぺき",
    "type": "はがね",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 15,
    "selfStatChanges": {
      "defense": 2
    }
  },
  "nasty-plot": {
    "id": "nasty-plot",
    "name": "わるだくみ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "selfStatChanges": {
      "specialAttack": 2
    }
  },
  "quiver-dance": {
    "id": "quiver-dance",
    "name": "ちょうのまい",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "selfStatChanges": {
      "specialAttack": 1,
      "specialDefense": 1,
      "speed": 1
    }
  },
  "rock-polish": {
    "id": "rock-polish",
    "name": "ロックカット",
    "type": "いわ",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "selfStatChanges": {
      "speed": 2
    }
  },
  "recover": {
    "id": "recover",
    "name": "じこさいせい",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 5,
    "healRatio": 0.5
  },
  "roost": {
    "id": "roost",
    "name": "はねやすめ",
    "type": "ひこう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 5,
    "healRatio": 0.5
  },
  "moonlight": {
    "id": "moonlight",
    "name": "つきのひかり",
    "type": "フェアリー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 5,
    "healByWeather": true
  },
  "leech-seed": {
    "id": "leech-seed",
    "name": "やどりぎのタネ",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "seedTarget": true
  },
  "thunder-wave": {
    "id": "thunder-wave",
    "name": "でんじは",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 20,
    "directStatus": "paralysis"
  },
  "will-o-wisp": {
    "id": "will-o-wisp",
    "name": "おにび",
    "type": "ほのお",
    "category": "status",
    "power": null,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 15,
    "directStatus": "burn"
  },
  "toxic": {
    "id": "toxic",
    "name": "どくどく",
    "type": "どく",
    "category": "status",
    "power": null,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "directStatus": "toxic"
  },
  "sleep-powder": {
    "id": "sleep-powder",
    "name": "ねむりごな",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": 75,
    "priority": 0,
    "maxPP": 15,
    "directStatus": "sleep",
    "powder": true
  },
  "tailwind": {
    "id": "tailwind",
    "name": "おいかぜ",
    "type": "ひこう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 15,
    "tailwind": true,
    "wind": true
  },
  "trick-room": {
    "id": "trick-room",
    "name": "トリックルーム",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": -7,
    "maxPP": 8,
    "trickRoom": true
  },
  "sandstorm": {
    "id": "sandstorm",
    "name": "すなあらし",
    "type": "いわ",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 10,
    "weather": "sand"
  },
  "bug-buzz": {
    "id": "bug-buzz",
    "name": "むしのさざめき",
    "type": "むし",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "sound": true,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 10
    }
  },
  "pollen-puff": {
    "id": "pollen-puff",
    "name": "かふんだんご",
    "type": "むし",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15
  },
  "x-scissor": {
    "id": "x-scissor",
    "name": "シザークロス",
    "type": "むし",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "slicing": true
  },
  "leech-life": {
    "id": "leech-life",
    "name": "きゅうけつ",
    "type": "むし",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "drainRatio": 0.5
  },
  "u-turn": {
    "id": "u-turn",
    "name": "とんぼがえり",
    "type": "むし",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "contact": true,
    "pivot": true
  },
  "shadow-ball": {
    "id": "shadow-ball",
    "name": "シャドーボール",
    "type": "ゴースト",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 20
    }
  },
  "hex": {
    "id": "hex",
    "name": "たたりめ",
    "type": "ゴースト",
    "category": "special",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "doubleIfTargetStatus": true
  },
  "shadow-sneak": {
    "id": "shadow-sneak",
    "name": "かげうち",
    "type": "ゴースト",
    "category": "physical",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 30,
    "contact": true
  },
  "air-slash": {
    "id": "air-slash",
    "name": "エアスラッシュ",
    "type": "ひこう",
    "category": "special",
    "power": 75,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 15,
    "wind": true
  },
  "psychic": {
    "id": "psychic",
    "name": "サイコキネシス",
    "type": "エスパー",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 10
    }
  },
  "psyshock": {
    "id": "psyshock",
    "name": "サイコショック",
    "type": "エスパー",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "usePhysicalDefense": true
  },
  "dazzling-gleam": {
    "id": "dazzling-gleam",
    "name": "マジカルシャイン",
    "type": "フェアリー",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10
  },
  "moonblast": {
    "id": "moonblast",
    "name": "ムーンフォース",
    "type": "フェアリー",
    "category": "special",
    "power": 95,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "targetStatChangeChance": {
      "stat": "specialAttack",
      "amount": -1,
      "chance": 30
    }
  },
  "draining-kiss": {
    "id": "draining-kiss",
    "name": "ドレインキッス",
    "type": "フェアリー",
    "category": "special",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "drainRatio": 0.75
  },
  "play-rough": {
    "id": "play-rough",
    "name": "じゃれつく",
    "type": "フェアリー",
    "category": "physical",
    "power": 90,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "targetStatChangeChance": {
      "stat": "attack",
      "amount": -1,
      "chance": 10
    }
  },
  "thunder": {
    "id": "thunder",
    "name": "かみなり",
    "type": "でんき",
    "category": "special",
    "power": 110,
    "accuracy": 70,
    "priority": 0,
    "maxPP": 10,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 30
    }
  },
  "thunderbolt": {
    "id": "thunderbolt",
    "name": "10まんボルト",
    "type": "でんき",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 10
    }
  },
  "volt-switch": {
    "id": "volt-switch",
    "name": "ボルトチェンジ",
    "type": "でんき",
    "category": "special",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "pivot": true
  },
  "discharge": {
    "id": "discharge",
    "name": "ほうでん",
    "type": "でんき",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 30
    }
  },
  "charge-beam": {
    "id": "charge-beam",
    "name": "チャージビーム",
    "type": "でんき",
    "category": "special",
    "power": 50,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "selfStatChangeChance": {
      "stat": "specialAttack",
      "amount": 1,
      "chance": 70
    }
  },
  "heat-wave": {
    "id": "heat-wave",
    "name": "ねっぷう",
    "type": "ほのお",
    "category": "special",
    "power": 95,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    }
  },
  "weather-ball": {
    "id": "weather-ball",
    "name": "ウェザーボール",
    "type": "ノーマル",
    "category": "special",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "weatherBall": true
  },
  "body-slam": {
    "id": "body-slam",
    "name": "のしかかり",
    "type": "ノーマル",
    "category": "physical",
    "power": 85,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 30
    }
  },
  "body-press": {
    "id": "body-press",
    "name": "ボディプレス",
    "type": "かくとう",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "useDefenseAsAttack": true,
    "contact": true
  },
  "knock-off": {
    "id": "knock-off",
    "name": "はたきおとす",
    "type": "あく",
    "category": "physical",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "contact": true,
    "knockOff": true
  },
  "muddy-water": {
    "id": "muddy-water",
    "name": "だくりゅう",
    "type": "みず",
    "category": "special",
    "power": 90,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 10,
    "targetStatChangeChance": {
      "stat": "accuracy",
      "amount": -1,
      "chance": 30
    }
  },
  "aqua-jet": {
    "id": "aqua-jet",
    "name": "アクアジェット",
    "type": "みず",
    "category": "physical",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 20,
    "contact": true
  },
  "flip-turn": {
    "id": "flip-turn",
    "name": "クイックターン",
    "type": "みず",
    "category": "physical",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "contact": true,
    "pivot": true
  },
  "sludge-bomb": {
    "id": "sludge-bomb",
    "name": "ヘドロばくだん",
    "type": "どく",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "secondaryStatus": {
      "status": "poison",
      "chance": 30
    }
  },
  "earth-power": {
    "id": "earth-power",
    "name": "だいちのちから",
    "type": "じめん",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 10
    }
  },
  "energy-ball": {
    "id": "energy-ball",
    "name": "エナジーボール",
    "type": "くさ",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 10
    }
  },
  "giga-drain": {
    "id": "giga-drain",
    "name": "ギガドレイン",
    "type": "くさ",
    "category": "special",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "drainRatio": 0.5
  },
  "ice-beam": {
    "id": "ice-beam",
    "name": "れいとうビーム",
    "type": "こおり",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "secondaryStatus": {
      "status": "freeze",
      "chance": 10
    }
  },
  "stone-edge": {
    "id": "stone-edge",
    "name": "ストーンエッジ",
    "type": "いわ",
    "category": "physical",
    "power": 100,
    "accuracy": 80,
    "priority": 0,
    "maxPP": 5,
    "highCrit": true
  },
  "rock-slide": {
    "id": "rock-slide",
    "name": "いわなだれ",
    "type": "いわ",
    "category": "physical",
    "power": 75,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10
  },
  "power-gem": {
    "id": "power-gem",
    "name": "パワージェム",
    "type": "いわ",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20
  },
  "iron-head": {
    "id": "iron-head",
    "name": "アイアンヘッド",
    "type": "はがね",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true
  },
  "flash-cannon": {
    "id": "flash-cannon",
    "name": "ラスターカノン",
    "type": "はがね",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "targetStatChangeChance": {
      "stat": "specialDefense",
      "amount": -1,
      "chance": 10
    }
  },
  "steel-beam": {
    "id": "steel-beam",
    "name": "てっていこうせん",
    "type": "はがね",
    "category": "special",
    "power": 140,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 5,
    "recoilMaxHPRatio": 0.5
  },
  "night-slash": {
    "id": "night-slash",
    "name": "つじぎり",
    "type": "あく",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "slicing": true,
    "highCrit": true
  },
  "wild-charge": {
    "id": "wild-charge",
    "name": "ワイルドボルト",
    "type": "でんき",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "recoilRatio": 0.25
  },
  "hyper-voice": {
    "id": "hyper-voice",
    "name": "ハイパーボイス",
    "type": "ノーマル",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "sound": true
  },
  "quick-attack": {
    "id": "quick-attack",
    "name": "でんこうせっか",
    "type": "ノーマル",
    "category": "physical",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 30,
    "contact": true
  },
  "pyro-ball": {
    "id": "pyro-ball",
    "name": "かえんボール",
    "type": "ほのお",
    "category": "physical",
    "power": 120,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 5,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    }
  },
  "blaze-kick": {
    "id": "blaze-kick",
    "name": "ブレイズキック",
    "type": "ほのお",
    "category": "physical",
    "power": 85,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    },
    "highCrit": true
  },
  "flare-blitz": {
    "id": "flare-blitz",
    "name": "フレアドライブ",
    "type": "ほのお",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true,
    "recoilRatio": 0.3333333333333333,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    }
  },
  "flame-charge": {
    "id": "flame-charge",
    "name": "ニトロチャージ",
    "type": "ほのお",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "contact": true,
    "selfStatChanges": {
      "speed": 1
    }
  },
  "flamethrower": {
    "id": "flamethrower",
    "name": "かえんほうしゃ",
    "type": "ほのお",
    "category": "special",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    }
  },
  "fire-blast": {
    "id": "fire-blast",
    "name": "だいもんじ",
    "type": "ほのお",
    "category": "special",
    "power": 110,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 5,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    }
  },
  "overheat": {
    "id": "overheat",
    "name": "オーバーヒート",
    "type": "ほのお",
    "category": "special",
    "power": 130,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 5,
    "selfStatChanges": {
      "specialAttack": -2
    }
  },
  "leaf-storm": {
    "id": "leaf-storm",
    "name": "リーフストーム",
    "type": "くさ",
    "category": "special",
    "power": 130,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 5,
    "selfStatChanges": {
      "specialAttack": -2
    }
  },
  "grass-glide": {
    "id": "grass-glide",
    "name": "グラススライダー",
    "type": "くさ",
    "category": "physical",
    "power": 55,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "contact": true
  },
  "chilling-water": {
    "id": "chilling-water",
    "name": "ひやみず",
    "type": "みず",
    "category": "special",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "targetStatChanges": {
      "attack": -1
    }
  },
  "liquidation": {
    "id": "liquidation",
    "name": "アクアブレイク",
    "type": "みず",
    "category": "physical",
    "power": 85,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "targetStatChangeChance": {
      "stat": "defense",
      "amount": -1,
      "chance": 20
    }
  },
  "wave-crash": {
    "id": "wave-crash",
    "name": "ウェーブタックル",
    "type": "みず",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "contact": true,
    "recoilRatio": 0.3333333333333333
  },
  "brick-break": {
    "id": "brick-break",
    "name": "かわらわり",
    "type": "かくとう",
    "category": "physical",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true
  },
  "superpower": {
    "id": "superpower",
    "name": "ばかぢから",
    "type": "かくとう",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 5,
    "contact": true,
    "selfStatChanges": {
      "attack": -1,
      "defense": -1
    }
  },
  "vacuum-wave": {
    "id": "vacuum-wave",
    "name": "しんくうは",
    "type": "かくとう",
    "category": "special",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 30
  },
  "waterfall": {
    "id": "waterfall",
    "name": "たきのぼり",
    "type": "みず",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true
  },
  "smart-strike": {
    "id": "smart-strike",
    "name": "スマートホーン",
    "type": "はがね",
    "category": "physical",
    "power": 70,
    "accuracy": null,
    "priority": 0,
    "maxPP": 10,
    "contact": true
  },
  "throat-chop": {
    "id": "throat-chop",
    "name": "じごくづき",
    "type": "あく",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15,
    "contact": true
  },
  "mystical-fire": {
    "id": "mystical-fire",
    "name": "マジカルフレイム",
    "type": "ほのお",
    "category": "special",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 10,
    "targetStatChanges": {
      "specialAttack": -1
    }
  },
  "dark-pulse": {
    "id": "dark-pulse",
    "name": "あくのはどう",
    "type": "あく",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 15
  },
  "zen-headbutt": {
    "id": "zen-headbutt",
    "name": "しねんのずつき",
    "type": "エスパー",
    "category": "physical",
    "power": 80,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 15,
    "contact": true
  },
  "parting-shot": {
    "id": "parting-shot",
    "name": "すてゼリフ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "targetStatChanges": {
      "attack": -1,
      "specialAttack": -1
    },
    "pivot": true
  }
});

const ABILITY_INFO = {
  "blaze": {
    "id": "blaze",
    "name": "もうか",
    "description": "HPが1/3以下の時、ほのお技の威力が1.5倍。",
    "implemented": true
  },
  "sharpness": {
    "id": "sharpness",
    "name": "きれあじ",
    "description": "斬る技の威力が1.5倍。",
    "implemented": true
  },
  "overgrow": {
    "id": "overgrow",
    "name": "しんりょく",
    "description": "HPが1/3以下の時、くさ技の威力が1.5倍。",
    "implemented": true
  },
  "fur-coat": {
    "id": "fur-coat",
    "name": "ファーコート",
    "description": "受ける物理技のダメージを半減。",
    "implemented": true
  },
  "torrent": {
    "id": "torrent",
    "name": "げきりゅう",
    "description": "HPが1/3以下の時、みず技の威力が1.5倍。",
    "implemented": true
  },
  "poison-heal": {
    "id": "poison-heal",
    "name": "ポイズンヒール",
    "description": "どく・もうどく時、ターン終了時にHPを回復。",
    "implemented": true
  },
  "shadow-tag": {
    "id": "shadow-tag",
    "name": "かげふみ",
    "description": "相手の通常交代を封じる。ゴーストタイプ等は除く。",
    "implemented": true
  },
  "night-scales": {
    "id": "night-scales",
    "name": "よぞらのりんぷん",
    "description": "攻撃時のとくこうが2倍。",
    "implemented": true
  },
  "drizzle": {
    "id": "drizzle",
    "name": "あめふらし",
    "description": "場に出た時、天候をあめにする。",
    "implemented": true
  },
  "competitive": {
    "id": "competitive",
    "name": "かちき",
    "description": "相手によって能力を下げられると、とくこうが2段階上がる。",
    "implemented": true
  },
  "vivid-body": {
    "id": "vivid-body",
    "name": "ビビットボディ",
    "description": "相手の優先度がプラスの技を防ぐ。",
    "implemented": true
  },
  "infinite-track": {
    "id": "infinite-track",
    "name": "むげんきどう",
    "description": "同じ技を連続使用すると威力が20%ずつ上昇（最大2倍）。",
    "implemented": true
  },
  "clean-land": {
    "id": "clean-land",
    "name": "せいち",
    "description": "場に出た時、ルーム系など一部の場の状態を解除。",
    "implemented": true
  },
  "stamina": {
    "id": "stamina",
    "name": "じきゅうりょく",
    "description": "攻撃技を受けると、ぼうぎょが1段階上がる。",
    "implemented": true
  },
  "damp": {
    "id": "damp",
    "name": "しめりけ",
    "description": "場にいる間、だいばくはつ・ミストバーストなどの爆発技を不発にする。",
    "implemented": true
  },
  "hydration": {
    "id": "hydration",
    "name": "うるおいボディ",
    "description": "雨のターン終了時、状態異常を回復。",
    "implemented": true
  },
  "gooey": {
    "id": "gooey",
    "name": "ぬめぬめ",
    "description": "接触技を受けると、攻撃側のすばやさを1段階下げる。",
    "implemented": true
  },
  "compound-eyes": {
    "id": "compound-eyes",
    "name": "ふくがん",
    "description": "技の命中率が1.3倍。",
    "implemented": true
  },
  "sturdy": {
    "id": "sturdy",
    "name": "がんじょう",
    "description": "HP満タンから一撃で倒される攻撃をHP1で耐える。",
    "implemented": true
  },
  "sand-stream": {
    "id": "sand-stream",
    "name": "すなおこし",
    "description": "場に出た時、すなあらしにする。",
    "implemented": true
  },
  "heatproof": {
    "id": "heatproof",
    "name": "たいねつ",
    "description": "ほのお技のダメージを半減。",
    "implemented": true
  },
  "stalwart": {
    "id": "stalwart",
    "name": "すじかねいり",
    "description": "技の対象変更を無視。シングルでは実質影響なし。",
    "implemented": true
  },
  "forecast": {
    "id": "forecast",
    "name": "てんきや",
    "description": "天候に応じて第2タイプが変化する。",
    "implemented": true
  },
  "soundproof": {
    "id": "soundproof",
    "name": "ぼうおん",
    "description": "音技を無効化。",
    "implemented": true
  },
  "lightning-rod": {
    "id": "lightning-rod",
    "name": "ひらいしん",
    "description": "でんき技を無効化し、とくこうが1段階上がる。",
    "implemented": true
  },
  "dry-skin": {
    "id": "dry-skin",
    "name": "かんそうはだ",
    "description": "みず技を無効化して回復。ほのお技に弱く、天候でもHPが変化。",
    "implemented": true
  },
  "moxie": {
    "id": "moxie",
    "name": "じしんかじょう",
    "description": "相手を倒すと、こうげきが1段階上がる。",
    "implemented": true
  },
  "speed-boost": {
    "id": "speed-boost",
    "name": "かそく",
    "description": "ターン終了時、すばやさが1段階上がる。",
    "implemented": true
  },
  "windmill": {
    "id": "windmill",
    "name": "かざぐるま",
    "description": "おいかぜ開始時や風技を受けた時にすばやさが上がる。風技は無効。",
    "implemented": true
  },
  "natural-cure": {
    "id": "natural-cure",
    "name": "しぜんかいふく",
    "description": "交代で手持ちに戻ると状態異常を回復。",
    "implemented": true
  },
  "sweet-veil": {
    "id": "sweet-veil",
    "name": "スイートベール",
    "description": "ねむり状態にならない。",
    "implemented": true
  },
  "sheer-force": {
    "id": "sheer-force",
    "name": "ちからずく",
    "description": "追加効果のある攻撃技を1.3倍にし、追加効果をなくす。",
    "implemented": true
  },
  "light-metal": {
    "id": "light-metal",
    "name": "ライトメタル",
    "description": "重さが半分になる。現状のダメージ計算への影響はなし。",
    "implemented": false
  },
  "clear-body": {
    "id": "clear-body",
    "name": "クリアボディ",
    "description": "相手から能力を下げられない。",
    "implemented": true
  },
  "earth-eater": {
    "id": "earth-eater",
    "name": "どしょく",
    "description": "じめん技を無効化し、最大HPの1/4回復。",
    "implemented": true
  },
  "scrappy": {
    "id": "scrappy",
    "name": "きもったま",
    "description": "ノーマル・かくとう技をゴーストにも当てられる。",
    "implemented": true
  },
  "sand-skin": {
    "id": "sand-skin",
    "name": "サンドスキン",
    "description": "ノーマル技をじめんタイプに変え、威力を1.2倍。",
    "implemented": true
  },
  "sap-sipper": {
    "id": "sap-sipper",
    "name": "そうしょく",
    "description": "くさ技を無効化し、こうげきが1段階上がる。",
    "implemented": true
  },
  "white-smoke": {
    "id": "white-smoke",
    "name": "しろいけむり",
    "description": "相手から能力を下げられない。",
    "implemented": true
  },
  "thick-fat": {
    "id": "thick-fat",
    "name": "あついしぼう",
    "description": "ほのお・こおり技のダメージを半減。",
    "implemented": true
  },
  "trick-builder": {
    "id": "trick-builder",
    "name": "トリックビルダー",
    "description": "最初に場に出た時、5ターンのトリックルームを展開。",
    "implemented": true
  },
  "fairy-aura": {
    "id": "fairy-aura",
    "name": "フェアリーオーラ",
    "description": "場のフェアリー技の威力を強化。",
    "implemented": true
  },
  "magic-bounce": {
    "id": "magic-bounce",
    "name": "マジックミラー",
    "description": "相手から受ける一部の変化技を反射。",
    "implemented": true
  },
  "regenerator": {
    "id": "regenerator",
    "name": "さいせいりょく",
    "description": "交代で戻る時、最大HPの1/3回復。",
    "implemented": true
  },
  "levitate": {
    "id": "levitate",
    "name": "ふゆう",
    "description": "じめん技を無効化。",
    "implemented": true
  }
};

function abilityRef(id) { const a = ABILITY_INFO[id]; return { id: a.id, name: a.name, description: a.description, implemented: a.implemented }; }

Object.values(SPECIES_DEX).forEach(s => { s.abilities = s.abilities.map(a => abilityRef(a.id)); });

Object.assign(ITEM_DEX, {
  "choice-band": {
    "id": "choice-band",
    "name": "こだわりハチマキ",
    "description": "こうげき1.5倍。同じ技しか選べなくなる。"
  },
  "choice-specs": {
    "id": "choice-specs",
    "name": "こだわりメガネ",
    "description": "とくこう1.5倍。同じ技しか選べなくなる。"
  },
  "choice-scarf": {
    "id": "choice-scarf",
    "name": "こだわりスカーフ",
    "description": "すばやさ1.5倍。同じ技しか選べなくなる。"
  },
  "focus-sash": {
    "id": "focus-sash",
    "name": "きあいのタスキ",
    "description": "HP満タンなら一撃で倒される攻撃をHP1で耐える。1回限り。"
  },
  "assault-vest": {
    "id": "assault-vest",
    "name": "とつげきチョッキ",
    "description": "とくぼう1.5倍。変化技を選べない。"
  },
  "rocky-helmet": {
    "id": "rocky-helmet",
    "name": "ゴツゴツメット",
    "description": "接触技を受けると攻撃側に最大HPの1/6ダメージ。"
  },
  "expert-belt": {
    "id": "expert-belt",
    "name": "たつじんのおび",
    "description": "こうかばつぐんの技の威力1.2倍。"
  },
  "muscle-band": {
    "id": "muscle-band",
    "name": "ちからのハチマキ",
    "description": "物理技の威力1.1倍。"
  },
  "wise-glasses": {
    "id": "wise-glasses",
    "name": "ものしりメガネ",
    "description": "特殊技の威力1.1倍。"
  },
  "black-sludge": {
    "id": "black-sludge",
    "name": "くろいヘドロ",
    "description": "どくタイプは毎ターン回復。それ以外はダメージ。"
  },
  "lum-berry": {
    "id": "lum-berry",
    "name": "ラムのみ",
    "description": "状態異常になると1度だけ回復。"
  },
  "chesto-berry": {
    "id": "chesto-berry",
    "name": "カゴのみ",
    "description": "ねむりになると1度だけ回復。"
  },
  "occa-berry": { "id": "occa-berry", "name": "オッカのみ", "description": "弱点となるほのお技を受ける時、1度だけダメージを半減する。" },
  "passho-berry": { "id": "passho-berry", "name": "イトケのみ", "description": "弱点となるみず技を受ける時、1度だけダメージを半減する。" },
  "wacan-berry": { "id": "wacan-berry", "name": "ソクノのみ", "description": "弱点となるでんき技を受ける時、1度だけダメージを半減する。" },
  "rindo-berry": { "id": "rindo-berry", "name": "リンドのみ", "description": "弱点となるくさ技を受ける時、1度だけダメージを半減する。" },
  "yache-berry": { "id": "yache-berry", "name": "ヤチェのみ", "description": "弱点となるこおり技を受ける時、1度だけダメージを半減する。" },
  "chople-berry": { "id": "chople-berry", "name": "ヨプのみ", "description": "弱点となるかくとう技を受ける時、1度だけダメージを半減する。" },
  "kebia-berry": { "id": "kebia-berry", "name": "ビアーのみ", "description": "弱点となるどく技を受ける時、1度だけダメージを半減する。" },
  "shuca-berry": { "id": "shuca-berry", "name": "シュカのみ", "description": "弱点となるじめん技を受ける時、1度だけダメージを半減する。" },
  "coba-berry": { "id": "coba-berry", "name": "バコウのみ", "description": "弱点となるひこう技を受ける時、1度だけダメージを半減する。" },
  "payapa-berry": { "id": "payapa-berry", "name": "ウタンのみ", "description": "弱点となるエスパー技を受ける時、1度だけダメージを半減する。" },
  "tanga-berry": { "id": "tanga-berry", "name": "タンガのみ", "description": "弱点となるむし技を受ける時、1度だけダメージを半減する。" },
  "charti-berry": { "id": "charti-berry", "name": "ヨロギのみ", "description": "弱点となるいわ技を受ける時、1度だけダメージを半減する。" },
  "kasib-berry": { "id": "kasib-berry", "name": "カシブのみ", "description": "弱点となるゴースト技を受ける時、1度だけダメージを半減する。" },
  "haban-berry": { "id": "haban-berry", "name": "ハバンのみ", "description": "弱点となるドラゴン技を受ける時、1度だけダメージを半減する。" },
  "colbur-berry": { "id": "colbur-berry", "name": "ナモのみ", "description": "弱点となるあく技を受ける時、1度だけダメージを半減する。" },
  "babiri-berry": { "id": "babiri-berry", "name": "リリバのみ", "description": "弱点となるはがね技を受ける時、1度だけダメージを半減する。" },
  "roseli-berry": { "id": "roseli-berry", "name": "ロゼルのみ", "description": "弱点となるフェアリー技を受ける時、1度だけダメージを半減する。" },
  "chilan-berry": { "id": "chilan-berry", "name": "ホズのみ", "description": "ノーマル技を受ける時、1度だけダメージを半減する。" },
  "clear-amulet": {
    "id": "clear-amulet",
    "name": "クリアチャーム",
    "description": "相手から能力を下げられない。"
  },
  "covert-cloak": {
    "id": "covert-cloak",
    "name": "おんみつマント",
    "description": "攻撃技の追加効果を受けない。"
  },
  "heat-rock": {
    "id": "heat-rock",
    "name": "あついいわ",
    "description": "自分が起こす晴れを8ターンにする。"
  },
  "damp-rock": {
    "id": "damp-rock",
    "name": "しめったいわ",
    "description": "自分が起こす雨を8ターンにする。"
  },
  "smooth-rock": {
    "id": "smooth-rock",
    "name": "さらさらいわ",
    "description": "自分が起こすすなあらしを8ターンにする。"
  },
  "icy-rock": {
    "id": "icy-rock",
    "name": "つめたいいわ",
    "description": "自分が起こす雪を8ターンにする。"
  },
  "air-balloon": {
    "id": "air-balloon",
    "name": "ふうせん",
    "description": "じめん技を無効化。攻撃技を受けると割れる。"
  },
  "charcoal": {
    "id": "charcoal",
    "name": "もくたん",
    "description": "ほのお技の威力1.2倍。"
  },
  "mystic-water": {
    "id": "mystic-water",
    "name": "しんぴのしずく",
    "description": "みず技の威力1.2倍。"
  },
  "miracle-seed": {
    "id": "miracle-seed",
    "name": "きせきのタネ",
    "description": "くさ技の威力1.2倍。"
  },
  "never-melt-ice": {
    "id": "never-melt-ice",
    "name": "とけないこおり",
    "description": "こおり技の威力1.2倍。"
  },
  "soft-sand": {
    "id": "soft-sand",
    "name": "やわらかいすな",
    "description": "じめん技の威力1.2倍。"
  },
  "magnet": {
    "id": "magnet",
    "name": "じしゃく",
    "description": "でんき技の威力1.2倍。"
  },
  "silver-powder": {
    "id": "silver-powder",
    "name": "ぎんのこな",
    "description": "むし技の威力1.2倍。"
  },
  "spell-tag": {
    "id": "spell-tag",
    "name": "のろいのおふだ",
    "description": "ゴースト技の威力1.2倍。"
  },
  "black-glasses": {
    "id": "black-glasses",
    "name": "くろいメガネ",
    "description": "あく技の威力1.2倍。"
  },
  "metal-coat": {
    "id": "metal-coat",
    "name": "メタルコート",
    "description": "はがね技の威力1.2倍。"
  },
  "fairy-feather": {
    "id": "fairy-feather",
    "name": "ようせいのハネ",
    "description": "フェアリー技の威力1.2倍。"
  }
});

Object.assign(ITEM_DEX.none,{description:"持ち物なし。"});
Object.assign(ITEM_DEX["life-orb"],{description:"攻撃技の威力1.3倍。命中してダメージを与えると最大HPの1/10反動。"});
Object.assign(ITEM_DEX.leftovers,{description:"ターン終了時、最大HPの1/16回復。"});
Object.assign(ITEM_DEX["sitrus-berry"],{description:"HPが半分以下になると最大HPの1/4回復。1回限り。"});
Object.assign(ITEM_DEX["toxic-orb"],{description:"ターン終了時、自分をもうどく状態にする。"});

Object.assign(SPECIES_DEX, {

  "emplace": {
  "id": "emplace",
  "dexNo": 16,
  "name": "エンプレイス",
  "classification": "オオムラサキポケモン",
  "height": 1.5,
  "weight": 18,
  "types": [
    "むし",
    "ゴースト"
  ],
  "baseStats": {
    "hp": 55,
    "attack": 25,
    "defense": 35,
    "specialAttack": 70,
    "specialDefense": 110,
    "speed": 100
  },
  "movePool": [
    "bug-buzz",
    "pollen-puff",
    "x-scissor",
    "leech-life",
    "shadow-ball",
    "hex",
    "shadow-sneak",
    "air-slash",
    "psychic",
    "dazzling-gleam",
    "quiver-dance",
    "calm-mind",
    "roost",
    "sleep-powder",
    "protect"
  ]
},

  "peetom": {
  "id": "peetom",
  "dexNo": 21,
  "name": "ピートム",
  "classification": "あらしくじゃくポケモン",
  "height": 1.6,
  "weight": 42,
  "types": [
    "ひこう",
    "でんき"
  ],
  "baseStats": {
    "hp": 100,
    "attack": 35,
    "defense": 140,
    "specialAttack": 105,
    "specialDefense": 60,
    "speed": 45
  },
  "movePool": [
    "thunder",
    "thunderbolt",
    "volt-switch",
    "discharge",
    "charge-beam",
    "hurricane",
    "air-slash",
    "surf",
    "heat-wave",
    "weather-ball",
    "roost",
    "tailwind",
    "thunder-wave",
    "agility",
    "protect"
  ]
},

  "catamugri": {
  "id": "catamugri",
  "dexNo": 25,
  "name": "キャタムグリ",
  "classification": "キャタピラーポケモン",
  "height": 0.4,
  "weight": 80,
  "types": [
    "むし",
    "じめん"
  ],
  "baseStats": {
    "hp": 100,
    "attack": 120,
    "defense": 100,
    "specialAttack": 50,
    "specialDefense": 80,
    "speed": 50
  },
  "movePool": [
    "x-scissor",
    "leech-life",
    "u-turn",
    "megahorn",
    "earthquake",
    "high-horsepower",
    "body-slam",
    "rock-slide",
    "body-press",
    "knock-off",
    "iron-defense",
    "bulk-up",
    "sandstorm",
    "protect"
  ]
},

  "sappring": {
  "id": "sappring",
  "dexNo": 28,
  "name": "サップリング",
  "classification": "みつくもポケモン",
  "height": 1.0,
  "weight": 32,
  "types": [
    "むし",
    "みず"
  ],
  "baseStats": {
    "hp": 61,
    "attack": 40,
    "defense": 104,
    "specialAttack": 90,
    "specialDefense": 104,
    "speed": 86
  },
  "movePool": [
    "bug-buzz",
    "pollen-puff",
    "leech-life",
    "surf",
    "hydro-pump",
    "scald",
    "muddy-water",
    "aqua-jet",
    "flip-turn",
    "sludge-bomb",
    "earth-power",
    "giga-drain",
    "ice-beam",
    "recover",
    "rain-dance",
    "protect"
  ]
},

  "gatlantes": {
  "id": "gatlantes",
  "dexNo": 30,
  "name": "ガトランテス",
  "classification": "いわカブトポケモン",
  "height": 1.2,
  "weight": 65.2,
  "types": [
    "むし",
    "いわ"
  ],
  "baseStats": {
    "hp": 65,
    "attack": 130,
    "defense": 50,
    "specialAttack": 25,
    "specialDefense": 80,
    "speed": 100
  },
  "movePool": [
    "x-scissor",
    "megahorn",
    "leech-life",
    "u-turn",
    "stone-edge",
    "rock-slide",
    "power-gem",
    "earthquake",
    "iron-head",
    "close-combat",
    "swords-dance",
    "rock-polish",
    "sandstorm",
    "protect"
  ]
},

  "metalifes": {
  "id": "metalifes",
  "dexNo": 32,
  "name": "メタリフェス",
  "classification": "はがねクワガタポケモン",
  "height": 1.3,
  "weight": 55.8,
  "types": [
    "むし",
    "はがね"
  ],
  "baseStats": {
    "hp": 100,
    "attack": 80,
    "defense": 65,
    "specialAttack": 25,
    "specialDefense": 130,
    "speed": 50
  },
  "movePool": [
    "x-scissor",
    "megahorn",
    "leech-life",
    "u-turn",
    "iron-head",
    "flash-cannon",
    "steel-beam",
    "stone-edge",
    "night-slash",
    "body-slam",
    "swords-dance",
    "iron-defense",
    "agility",
    "protect"
  ]
},

  "dolpika": {
  "id": "dolpika",
  "dexNo": 36,
  "name": "ドルピカ",
  "classification": "てんきよほうポケモン",
  "height": 0.7,
  "weight": 14.8,
  "types": [
    "でんき",
    "ノーマル"
  ],
  "baseStats": {
    "hp": 70,
    "attack": 80,
    "defense": 45,
    "specialAttack": 114,
    "specialDefense": 70,
    "speed": 111
  },
  "movePool": [
    "thunderbolt",
    "thunder",
    "discharge",
    "volt-switch",
    "charge-beam",
    "wild-charge",
    "weather-ball",
    "hyper-voice",
    "quick-attack",
    "dazzling-gleam",
    "play-rough",
    "sunny-day",
    "rain-dance",
    "sandstorm",
    "snowscape",
    "thunder-wave",
    "protect"
  ]
},

  "jaboru": {
  "id": "jaboru",
  "dexNo": 80,
  "name": "ジャボール",
  "classification": "トビネズミポケモン",
  "height": 0.8,
  "weight": 18,
  "types": [
    "じめん",
    "ほのお"
  ],
  "baseStats": {
    "hp": 85,
    "attack": 95,
    "defense": 75,
    "specialAttack": 55,
    "specialDefense": 85,
    "speed": 95
  },
  "movePool": [
    "pyro-ball",
    "blaze-kick",
    "flare-blitz",
    "flame-charge",
    "flamethrower",
    "fire-blast",
    "heat-wave",
    "overheat",
    "earthquake",
    "rock-slide",
    "u-turn",
    "swords-dance",
    "agility",
    "sunny-day",
    "sandstorm",
    "protect"
  ]
},

  "ratarinsesu": {
  "id": "ratarinsesu",
  "dexNo": 118,
  "name": "ラタリンセス",
  "classification": "うきホオズキポケモン",
  "height": 1.2,
  "weight": 23,
  "types": [
    "くさ",
    "はがね"
  ],
  "baseStats": {
    "hp": 65,
    "attack": 50,
    "defense": 105,
    "specialAttack": 120,
    "specialDefense": 135,
    "speed": 35
  },
  "movePool": [
    "leaf-storm",
    "giga-drain",
    "energy-ball",
    "grass-glide",
    "flash-cannon",
    "steel-beam",
    "dazzling-gleam",
    "air-slash",
    "power-gem",
    "pollen-puff",
    "calm-mind",
    "synthesis",
    "iron-defense",
    "tailwind",
    "protect"
  ]
},

  "makuwariin": {
  "id": "makuwariin",
  "dexNo": 127,
  "name": "マクワリーン",
  "classification": "コルセットポケモン",
  "height": 1.1,
  "weight": 35,
  "types": [
    "はがね",
    "フェアリー"
  ],
  "baseStats": {
    "hp": 112,
    "attack": 33,
    "defense": 105,
    "specialAttack": 131,
    "specialDefense": 81,
    "speed": 32
  },
  "movePool": [
    "flash-cannon",
    "steel-beam",
    "iron-head",
    "moonblast",
    "dazzling-gleam",
    "draining-kiss",
    "play-rough",
    "psychic",
    "psyshock",
    "shadow-ball",
    "earth-power",
    "iron-defense",
    "calm-mind",
    "trick-room",
    "protect"
  ]
},

  "goukain": {
  "id": "goukain",
  "dexNo": 154,
  "name": "ゴウカイン",
  "classification": "ゴカイポケモン",
  "height": 1.0,
  "weight": 31.5,
  "types": [
    "みず",
    "かくとう"
  ],
  "baseStats": {
    "hp": 120,
    "attack": 145,
    "defense": 120,
    "specialAttack": 20,
    "specialDefense": 20,
    "speed": 20
  },
  "movePool": [
    "aqua-jet",
    "liquidation",
    "wave-crash",
    "flip-turn",
    "chilling-water",
    "close-combat",
    "brick-break",
    "body-press",
    "superpower",
    "vacuum-wave",
    "recover",
    "bulk-up",
    "protect"
  ]
},

  "arukerukesu": {
  "id": "arukerukesu",
  "dexNo": 157,
  "name": "アルケルケス",
  "classification": "きりヘラジカポケモン",
  "height": 2.5,
  "weight": 550,
  "types": [
    "かくとう",
    "みず"
  ],
  "baseStats": {
    "hp": 110,
    "attack": 110,
    "defense": 110,
    "specialAttack": 50,
    "specialDefense": 80,
    "speed": 70
  },
  "movePool": [
    "beast-dash",
    "close-combat",
    "body-press",
    "brick-break",
    "wave-crash",
    "flip-turn",
    "waterfall",
    "liquidation",
    "earthquake",
    "high-horsepower",
    "smart-strike",
    "throat-chop",
    "bulk-up",
    "iron-defense",
    "protect"
  ]
},

  "castleude": {
  "id": "castleude",
  "dexNo": 174,
  "name": "キャスルード",
  "classification": "しょうろうポケモン",
  "height": 2.0,
  "weight": 201,
  "types": [
    "エスパー",
    "フェアリー"
  ],
  "baseStats": {
    "hp": 123,
    "attack": 102,
    "defense": 86,
    "specialAttack": 128,
    "specialDefense": 86,
    "speed": 75
  },
  "movePool": [
    "midnight-bell",
    "moonblast",
    "dazzling-gleam",
    "psychic",
    "psyshock",
    "zen-headbutt",
    "mystical-fire",
    "shadow-ball",
    "dark-pulse",
    "hyper-voice",
    "calm-mind",
    "nasty-plot",
    "moonlight",
    "trick-room",
    "protect"
  ]
},

  "furuseyua": {
  "id": "furuseyua",
  "dexNo": 290,
  "name": "フルセユーア",
  "classification": "ゆめポケモン",
  "height": 0.8,
  "weight": 0.1,
  "types": [
    "ノーマル",
    "ゴースト"
  ],
  "baseStats": {
    "hp": 66,
    "attack": 33,
    "defense": 91,
    "specialAttack": 99,
    "specialDefense": 91,
    "speed": 97
  },
  "movePool": [
    "shadow-ball",
    "hex",
    "shadow-sneak",
    "body-slam",
    "hyper-voice",
    "dazzling-gleam",
    "icy-wind",
    "dark-pulse",
    "psychic",
    "calm-mind",
    "nasty-plot",
    "recover",
    "will-o-wisp",
    "thunder-wave",
    "parting-shot",
    "protect"
  ]
}

});

SPECIES_DEX["emplace"].abilities = ["shadow-tag", "night-scales"].map(abilityRef);

SPECIES_DEX["peetom"].abilities = ["drizzle", "competitive", "vivid-body"].map(abilityRef);

SPECIES_DEX["catamugri"].abilities = ["infinite-track", "clean-land", "stamina"].map(abilityRef);

SPECIES_DEX["sappring"].abilities = ["damp", "hydration", "gooey"].map(abilityRef);

SPECIES_DEX["gatlantes"].abilities = ["compound-eyes", "sturdy", "sand-stream"].map(abilityRef);

SPECIES_DEX["metalifes"].abilities = ["heatproof", "sturdy", "stalwart"].map(abilityRef);

SPECIES_DEX["dolpika"].abilities = ["forecast", "soundproof", "lightning-rod"].map(abilityRef);

SPECIES_DEX["jaboru"].abilities = ["dry-skin", "moxie", "speed-boost"].map(abilityRef);

SPECIES_DEX["ratarinsesu"].abilities = ["windmill", "natural-cure", "sweet-veil"].map(abilityRef);

SPECIES_DEX["makuwariin"].abilities = ["sheer-force", "light-metal", "clear-body"].map(abilityRef);

SPECIES_DEX["goukain"].abilities = ["earth-eater", "scrappy", "sand-skin"].map(abilityRef);

SPECIES_DEX["arukerukesu"].abilities = ["sap-sipper", "white-smoke", "thick-fat"].map(abilityRef);

SPECIES_DEX["castleude"].abilities = ["trick-builder", "fairy-aura", "magic-bounce"].map(abilityRef);

SPECIES_DEX["furuseyua"].abilities = ["regenerator", "levitate"].map(abilityRef);

Object.assign(SPECIES_DEX.wolf,{"dexNo": 6, "classification": "ほのおおおかみポケモン", "height": 1.6, "weight": 52});

Object.assign(SPECIES_DEX.karibu,{"dexNo": 3, "classification": "くさトナカイポケモン", "height": 1.8, "weight": 96});

Object.assign(SPECIES_DEX.babhat,{"dexNo": 9, "classification": "みずコウモリポケモン", "height": 1.3, "weight": 36});

SPECIES_DEX["wolf"].movePool = ["kaenzan", "nessa-sword", "earthquake", "close-combat", "crunch", "swords-dance", "sunny-day", "jewel-cutter", "stone-edge", "rock-slide", "agility", "protect"];

SPECIES_DEX["karibu"].movePool = ["tree-horn", "juhyo-charge", "wood-hammer", "ice-shard", "ice-spinner", "megahorn", "high-horsepower", "synthesis", "snowscape", "bulk-up", "leech-seed", "play-rough", "protect"];

SPECIES_DEX["babhat"].movePool = ["rainy-shout", "air-noise", "drain-voice", "scald", "surf", "hydro-pump", "hurricane", "air-slash", "icy-wind", "rain-dance", "calm-mind", "roost", "u-turn", "protect"];

DEFAULT_PLAYER_SETS.splice(0, DEFAULT_PLAYER_SETS.length, ...[
  {
    "speciesId": "wolf",
    "abilityId": "sharpness",
    "itemId": "life-orb",
    "nature": "ようき",
    "statPoints": {
      "hp": 0,
      "attack": 32,
      "defense": 0,
      "specialAttack": 0,
      "specialDefense": 2,
      "speed": 32
    },
    "moves": [
      "kaenzan",
      "nessa-sword",
      "close-combat",
      "swords-dance"
    ]
  },
  {
    "speciesId": "karibu",
    "abilityId": "fur-coat",
    "itemId": "leftovers",
    "nature": "いじっぱり",
    "statPoints": {
      "hp": 32,
      "attack": 32,
      "defense": 2,
      "specialAttack": 0,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "tree-horn",
      "ice-shard",
      "high-horsepower",
      "synthesis"
    ]
  },
  {
    "speciesId": "babhat",
    "abilityId": "torrent",
    "itemId": "sitrus-berry",
    "nature": "おくびょう",
    "statPoints": {
      "hp": 0,
      "attack": 0,
      "defense": 2,
      "specialAttack": 32,
      "specialDefense": 0,
      "speed": 32
    },
    "moves": [
      "rainy-shout",
      "hurricane",
      "icy-wind",
      "calm-mind"
    ]
  },
  {
    "speciesId": "peetom",
    "abilityId": "drizzle",
    "itemId": "damp-rock",
    "nature": "ずぶとい",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 32,
      "specialAttack": 2,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "thunder",
      "hurricane",
      "volt-switch",
      "roost"
    ]
  },
  {
    "speciesId": "gatlantes",
    "abilityId": "compound-eyes",
    "itemId": "focus-sash",
    "nature": "ようき",
    "statPoints": {
      "hp": 0,
      "attack": 32,
      "defense": 0,
      "specialAttack": 0,
      "specialDefense": 2,
      "speed": 32
    },
    "moves": [
      "megahorn",
      "stone-edge",
      "earthquake",
      "swords-dance"
    ]
  },
  {
    "speciesId": "castleude",
    "abilityId": "trick-builder",
    "itemId": "covert-cloak",
    "nature": "ひかえめ",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 2,
      "specialAttack": 32,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "moonblast",
      "psychic",
      "mystical-fire",
      "trick-room"
    ]
  }
]);

const ENEMY_SET_LIBRARY = [
  {
    "speciesId": "emplace",
    "abilityId": "night-scales",
    "itemId": "focus-sash",
    "nature": "おくびょう",
    "statPoints": {
      "hp": 0,
      "attack": 0,
      "defense": 2,
      "specialAttack": 32,
      "specialDefense": 0,
      "speed": 32
    },
    "moves": [
      "bug-buzz",
      "shadow-ball",
      "air-slash",
      "quiver-dance"
    ]
  },
  {
    "speciesId": "peetom",
    "abilityId": "drizzle",
    "itemId": "damp-rock",
    "nature": "ずぶとい",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 32,
      "specialAttack": 2,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "thunder",
      "hurricane",
      "volt-switch",
      "roost"
    ]
  },
  {
    "speciesId": "catamugri",
    "abilityId": "stamina",
    "itemId": "rocky-helmet",
    "nature": "わんぱく",
    "statPoints": {
      "hp": 32,
      "attack": 2,
      "defense": 32,
      "specialAttack": 0,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "earthquake",
      "body-press",
      "knock-off",
      "iron-defense"
    ]
  },
  {
    "speciesId": "sappring",
    "abilityId": "gooey",
    "itemId": "leftovers",
    "nature": "ずぶとい",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 32,
      "specialAttack": 2,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "scald",
      "bug-buzz",
      "giga-drain",
      "recover"
    ]
  },
  {
    "speciesId": "gatlantes",
    "abilityId": "sand-stream",
    "itemId": "focus-sash",
    "nature": "ようき",
    "statPoints": {
      "hp": 0,
      "attack": 32,
      "defense": 0,
      "specialAttack": 0,
      "specialDefense": 2,
      "speed": 32
    },
    "moves": [
      "megahorn",
      "stone-edge",
      "earthquake",
      "swords-dance"
    ]
  },
  {
    "speciesId": "metalifes",
    "abilityId": "heatproof",
    "itemId": "assault-vest",
    "nature": "しんちょう",
    "statPoints": {
      "hp": 32,
      "attack": 2,
      "defense": 0,
      "specialAttack": 0,
      "specialDefense": 32,
      "speed": 0
    },
    "moves": [
      "iron-head",
      "x-scissor",
      "night-slash",
      "body-slam"
    ]
  },
  {
    "speciesId": "dolpika",
    "abilityId": "forecast",
    "itemId": "choice-specs",
    "nature": "おくびょう",
    "statPoints": {
      "hp": 0,
      "attack": 0,
      "defense": 2,
      "specialAttack": 32,
      "specialDefense": 0,
      "speed": 32
    },
    "moves": [
      "thunderbolt",
      "weather-ball",
      "volt-switch",
      "dazzling-gleam"
    ]
  },
  {
    "speciesId": "jaboru",
    "abilityId": "speed-boost",
    "itemId": "life-orb",
    "nature": "ようき",
    "statPoints": {
      "hp": 0,
      "attack": 32,
      "defense": 0,
      "specialAttack": 0,
      "specialDefense": 2,
      "speed": 32
    },
    "moves": [
      "pyro-ball",
      "earthquake",
      "rock-slide",
      "u-turn"
    ]
  },
  {
    "speciesId": "ratarinsesu",
    "abilityId": "natural-cure",
    "itemId": "leftovers",
    "nature": "ひかえめ",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 0,
      "specialAttack": 32,
      "specialDefense": 2,
      "speed": 0
    },
    "moves": [
      "leaf-storm",
      "flash-cannon",
      "giga-drain",
      "synthesis"
    ]
  },
  {
    "speciesId": "makuwariin",
    "abilityId": "sheer-force",
    "itemId": "life-orb",
    "nature": "ひかえめ",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 0,
      "specialAttack": 32,
      "specialDefense": 2,
      "speed": 0
    },
    "moves": [
      "moonblast",
      "flash-cannon",
      "psychic",
      "earth-power"
    ]
  },
  {
    "speciesId": "goukain",
    "abilityId": "earth-eater",
    "itemId": "assault-vest",
    "nature": "いじっぱり",
    "statPoints": {
      "hp": 32,
      "attack": 32,
      "defense": 2,
      "specialAttack": 0,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "wave-crash",
      "close-combat",
      "aqua-jet",
      "brick-break"
    ]
  },
  {
    "speciesId": "arukerukesu",
    "abilityId": "thick-fat",
    "itemId": "leftovers",
    "nature": "わんぱく",
    "statPoints": {
      "hp": 32,
      "attack": 2,
      "defense": 32,
      "specialAttack": 0,
      "specialDefense": 0,
      "speed": 0
    },
    "moves": [
      "close-combat",
      "liquidation",
      "earthquake",
      "bulk-up"
    ]
  },
  {
    "speciesId": "castleude",
    "abilityId": "fairy-aura",
    "itemId": "expert-belt",
    "nature": "ひかえめ",
    "statPoints": {
      "hp": 0,
      "attack": 0,
      "defense": 2,
      "specialAttack": 32,
      "specialDefense": 0,
      "speed": 32
    },
    "moves": [
      "midnight-bell",
      "psychic",
      "mystical-fire",
      "shadow-ball"
    ]
  },
  {
    "speciesId": "furuseyua",
    "abilityId": "regenerator",
    "itemId": "leftovers",
    "nature": "おくびょう",
    "statPoints": {
      "hp": 32,
      "attack": 0,
      "defense": 0,
      "specialAttack": 2,
      "specialDefense": 0,
      "speed": 32
    },
    "moves": [
      "shadow-ball",
      "hex",
      "recover",
      "will-o-wisp"
    ]
  }
];

DEFAULT_ENEMY_SETS.splice(0, DEFAULT_ENEMY_SETS.length, ...ENEMY_SET_LIBRARY.slice(0,6));

const DATA_PACK_COUNTS = { species: Object.keys(SPECIES_DEX).length, moves: Object.keys(MOVE_DEX).length, items: Object.keys(ITEM_DEX).length, abilities: Object.keys(ABILITY_INFO).length };

// 既存v4技へv5用の属性を補足
Object.assign(MOVE_DEX.kaenzan, { contact: true, slicing: true, ignoreDefenderStages: true, description: "相手の能力変化を無視してダメージ計算。斬る技。" });
Object.assign(MOVE_DEX["nessa-sword"], { contact: true, slicing: true });
Object.assign(MOVE_DEX["close-combat"], { contact: true });
Object.assign(MOVE_DEX.crunch, { contact: true, targetStatChangeChance: { stat: "defense", amount: -1, chance: 20 } });
Object.assign(MOVE_DEX["wood-hammer"], { contact: true });
Object.assign(MOVE_DEX["ice-spinner"], { contact: true });
Object.assign(MOVE_DEX.megahorn, { contact: true });
Object.assign(MOVE_DEX["high-horsepower"], { contact: true });
Object.assign(MOVE_DEX.hurricane, { wind: true });
Object.assign(MOVE_DEX["icy-wind"], { wind: true });
Object.assign(MOVE_DEX["juhyo-charge"], { removeIceUntilEndTurn: true });
// ============================================================
// ニワラバトル v6 - 全習得技データ / 関連アイテム
// 元データの実装済み17種: 296 unique moves
// ============================================================

Object.assign(MOVE_DEX, {
  "v6-001": {
    "id": "v6-001",
    "name": "ウッドホーン",
    "type": "くさ",
    "category": "physical",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "与えたダメージの半分だけHPを回復する。",
    "contact": true,
    "drainRatio": 0.5
  },
  "v6-002": {
    "id": "v6-002",
    "name": "パワーウィップ",
    "type": "くさ",
    "category": "physical",
    "power": 120,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 12,
    "contact": true
  },
  "v6-003": {
    "id": "v6-003",
    "name": "くさわけ",
    "type": "くさ",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "攻撃後、自分のすばやさを1段階上げる。",
    "contact": true,
    "selfStatChanges": {
      "speed": 1
    }
  },
  "v6-004": {
    "id": "v6-004",
    "name": "タネマシンガン",
    "type": "くさ",
    "category": "physical",
    "power": 25,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "2～5回連続で攻撃する。",
    "multiHit": [
      2,
      5
    ],
    "bullet": true
  },
  "v6-005": {
    "id": "v6-005",
    "name": "くさむすび",
    "type": "くさ",
    "category": "special",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手が重いほど威力が上がる。",
    "weightPower": true,
    "contact": true
  },
  "v6-006": {
    "id": "v6-006",
    "name": "ハードプラント",
    "type": "くさ",
    "category": "special",
    "power": 150,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、次のターンは反動で動けない。",
    "recharge": true
  },
  "v6-007": {
    "id": "v6-007",
    "name": "つららおとし",
    "type": "こおり",
    "category": "physical",
    "power": 85,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "30%の確率で相手をひるませる。",
    "flinchChance": 30
  },
  "v6-008": {
    "id": "v6-008",
    "name": "つららばり",
    "type": "こおり",
    "category": "physical",
    "power": 25,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "2～5回連続で攻撃する。",
    "multiHit": [
      2,
      5
    ]
  },
  "v6-009": {
    "id": "v6-009",
    "name": "ゆきなだれ",
    "type": "こおり",
    "category": "physical",
    "power": 60,
    "accuracy": 100,
    "priority": -4,
    "maxPP": 12,
    "description": "そのターンに相手からダメージを受けていると威力2倍。",
    "doubleIfDamagedThisTurn": true,
    "contact": true
  },
  "v6-010": {
    "id": "v6-010",
    "name": "ふぶき",
    "type": "こおり",
    "category": "special",
    "power": 110,
    "accuracy": 70,
    "priority": 0,
    "maxPP": 8,
    "description": "10%でこおり。ゆきの時は必中。",
    "secondaryStatus": {
      "status": "freeze",
      "chance": 10
    },
    "alwaysHitInSnow": true
  },
  "v6-011": {
    "id": "v6-011",
    "name": "フリーズドライ",
    "type": "こおり",
    "category": "special",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "みずタイプにも効果抜群。10%でこおり。",
    "freezeDry": true,
    "secondaryStatus": {
      "status": "freeze",
      "chance": 10
    }
  },
  "v6-012": {
    "id": "v6-012",
    "name": "ぜったいれいど",
    "type": "こおり",
    "category": "special",
    "power": null,
    "accuracy": 30,
    "priority": 0,
    "maxPP": 8,
    "description": "一撃必殺技。",
    "ohko": true
  },
  "v6-013": {
    "id": "v6-013",
    "name": "にどげり",
    "type": "かくとう",
    "category": "physical",
    "power": 30,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "2回連続で攻撃する。",
    "multiHit": [
      2,
      2
    ],
    "contact": true
  },
  "v6-014": {
    "id": "v6-014",
    "name": "じだんだ",
    "type": "じめん",
    "category": "physical",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "前のターンに自分の技が失敗していると威力2倍。",
    "contact": true,
    "doubleIfLastMoveFailed": true
  },
  "v6-015": {
    "id": "v6-015",
    "name": "じならし",
    "type": "じめん",
    "category": "physical",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "命中した相手のすばやさを1段階下げる。",
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v6-016": {
    "id": "v6-016",
    "name": "どろかけ",
    "type": "じめん",
    "category": "special",
    "power": 20,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手の命中率を1段階下げる。",
    "targetStatChanges": {
      "accuracy": -1
    }
  },
  "v6-017": {
    "id": "v6-017",
    "name": "みがわり",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "最大HPの1/4を使い、みがわりを作る。",
    "substitute": true
  },
  "v6-018": {
    "id": "v6-018",
    "name": "ねむる",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "HPと状態異常を全回復し、2ターンねむる。",
    "rest": true
  },
  "v6-019": {
    "id": "v6-019",
    "name": "ねごと",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "ねむり中、自分の他の技をランダムに1つ使う。",
    "sleepTalk": true
  },
  "v6-020": {
    "id": "v6-020",
    "name": "せいちょう",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "こうげき・とくこうを1段階上げる。晴れでは2段階ずつ。",
    "growth": true
  },
  "v6-021": {
    "id": "v6-021",
    "name": "なやみのタネ",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手の特性をふみんに変える。",
    "setAbility": "insomnia"
  },
  "v6-022": {
    "id": "v6-022",
    "name": "ほえる",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": -6,
    "maxPP": 20,
    "description": "相手を控えと強制的に交代させる。",
    "forceSwitch": true,
    "sound": true
  },
  "v6-023": {
    "id": "v6-023",
    "name": "しろいきり",
    "type": "こおり",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "5ターンの間、自分の場の能力を下げられなくする。",
    "mist": true
  },
  "v6-024": {
    "id": "v6-024",
    "name": "くろいきり",
    "type": "こおり",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "場の全ポケモンの能力ランクを0に戻す。",
    "haze": true
  },
  "v6-025": {
    "id": "v6-025",
    "name": "ミルクのみ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "最大HPの半分を回復する。",
    "healRatio": 0.5
  },
  "v6-026": {
    "id": "v6-026",
    "name": "グラスフィールド",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、グラスフィールドにする。",
    "terrain": "grassy"
  },
  "v6-027": {
    "id": "v6-027",
    "name": "ほのおのキバ",
    "type": "ほのお",
    "category": "physical",
    "power": 65,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "10%でやけど、10%でひるみ。",
    "contact": true,
    "bite": true,
    "secondaryStatus": {
      "status": "burn",
      "chance": 10
    },
    "flinchChance": 10
  },
  "v6-028": {
    "id": "v6-028",
    "name": "やけっぱち",
    "type": "ほのお",
    "category": "physical",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "前のターンに自分の技が失敗していると威力2倍。",
    "doubleIfLastMoveFailed": true
  },
  "v6-029": {
    "id": "v6-029",
    "name": "ブラストバーン",
    "type": "ほのお",
    "category": "special",
    "power": 150,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、次のターンは反動で動けない。",
    "recharge": true
  },
  "v6-030": {
    "id": "v6-030",
    "name": "ぶちかまし",
    "type": "じめん",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "自分のぼうぎょ・とくぼうが1段階下がる。",
    "contact": true,
    "selfStatChanges": {
      "defense": -1,
      "specialDefense": -1
    }
  },
  "v6-031": {
    "id": "v6-031",
    "name": "ねっさのだいち",
    "type": "じめん",
    "category": "special",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "30%の確率で相手をやけどにする。",
    "secondaryStatus": {
      "status": "burn",
      "chance": 30
    }
  },
  "v6-032": {
    "id": "v6-032",
    "name": "がんせきふうじ",
    "type": "いわ",
    "category": "physical",
    "power": 60,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のすばやさを1段階下げる。",
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v6-033": {
    "id": "v6-033",
    "name": "かみなりのキバ",
    "type": "でんき",
    "category": "physical",
    "power": 65,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "10%でまひ、10%でひるみ。",
    "contact": true,
    "bite": true,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 10
    },
    "flinchChance": 10
  },
  "v6-034": {
    "id": "v6-034",
    "name": "サイコファング",
    "type": "エスパー",
    "category": "physical",
    "power": 85,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手側の壁を壊してから攻撃する。",
    "contact": true,
    "bite": true,
    "breakScreens": true
  },
  "v6-035": {
    "id": "v6-035",
    "name": "サイコカッター",
    "type": "エスパー",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "急所に当たりやすい。斬る技。",
    "slicing": true,
    "highCrit": true
  },
  "v6-036": {
    "id": "v6-036",
    "name": "せいなるつるぎ",
    "type": "かくとう",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手の能力変化を無視してダメージ計算。斬る技。",
    "slicing": true,
    "ignoreDefenderStages": true
  },
  "v6-037": {
    "id": "v6-037",
    "name": "かげぶんしん",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "自分の回避率を1段階上げる。",
    "selfStatChanges": {
      "evasion": 1
    }
  },
  "v6-038": {
    "id": "v6-038",
    "name": "とおぼえ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のこうげきを1段階上げる。",
    "selfStatChanges": {
      "attack": 1
    },
    "sound": true
  },
  "v6-039": {
    "id": "v6-039",
    "name": "すてぜりふ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手のこうげき・とくこうを1段階下げて控えと交代する。",
    "targetStatChanges": {
      "attack": -1,
      "specialAttack": -1
    },
    "pivot": true,
    "sound": true
  },
  "v6-040": {
    "id": "v6-040",
    "name": "ちょうはつ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "3ターンの間、相手は変化技を使えない。",
    "tauntTurns": 3
  },
  "v6-041": {
    "id": "v6-041",
    "name": "ふるいたてる",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のこうげき・とくこうを1段階上げる。",
    "selfStatChanges": {
      "attack": 1,
      "specialAttack": 1
    }
  },
  "v6-042": {
    "id": "v6-042",
    "name": "こわいかお",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手のすばやさを2段階下げる。",
    "targetStatChanges": {
      "speed": -2
    }
  },
  "v6-043": {
    "id": "v6-043",
    "name": "ステルスロック",
    "type": "いわ",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "相手の場にステルスロックを設置する。",
    "hazard": "stealthRock"
  },
  "v6-044": {
    "id": "v6-044",
    "name": "まきびし",
    "type": "じめん",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "相手の場にまきびしを設置する。3回まで重ねられる。",
    "hazard": "spikes"
  },
  "v6-045": {
    "id": "v6-045",
    "name": "うずしお",
    "type": "みず",
    "category": "special",
    "power": 35,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 16,
    "description": "相手を4～5ターン拘束し、毎ターンダメージ。",
    "trapDamage": true
  },
  "v6-046": {
    "id": "v6-046",
    "name": "ハイドロカノン",
    "type": "みず",
    "category": "special",
    "power": 150,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、次のターンは反動で動けない。",
    "recharge": true
  },
  "v6-047": {
    "id": "v6-047",
    "name": "エアカッター",
    "type": "ひこう",
    "category": "special",
    "power": 60,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 20,
    "description": "急所に当たりやすい。風・斬る技。",
    "highCrit": true,
    "wind": true,
    "slicing": true
  },
  "v6-048": {
    "id": "v6-048",
    "name": "アクロバット",
    "type": "ひこう",
    "category": "physical",
    "power": 55,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "持ち物を持っていないと威力2倍。",
    "contact": true,
    "doubleIfNoItem": true
  },
  "v6-049": {
    "id": "v6-049",
    "name": "ダブルウィング",
    "type": "ひこう",
    "category": "physical",
    "power": 40,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "2回連続で攻撃する。",
    "contact": true,
    "multiHit": [
      2,
      2
    ]
  },
  "v6-050": {
    "id": "v6-050",
    "name": "みわくのボイス",
    "type": "フェアリー",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "このターン能力が上がった相手をこんらんさせる。音技。",
    "sound": true,
    "confuseIfTargetRaised": true
  },
  "v6-051": {
    "id": "v6-051",
    "name": "チャームボイス",
    "type": "フェアリー",
    "category": "special",
    "power": 40,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "必ず命中する音技。",
    "sound": true
  },
  "v6-052": {
    "id": "v6-052",
    "name": "サイコノイズ",
    "type": "エスパー",
    "category": "special",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手を2ターン回復ふうじ状態にする。音技。",
    "sound": true,
    "recoveryBlockTurns": 2
  },
  "v6-053": {
    "id": "v6-053",
    "name": "クリアスモッグ",
    "type": "どく",
    "category": "special",
    "power": 50,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "命中後、相手の能力ランクをすべて0に戻す。",
    "clearTargetStages": true
  },
  "v6-054": {
    "id": "v6-054",
    "name": "アシッドボム",
    "type": "どく",
    "category": "special",
    "power": 40,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のとくぼうを2段階下げる。弾技。",
    "bullet": true,
    "targetStatChanges": {
      "specialDefense": -2
    }
  },
  "v6-055": {
    "id": "v6-055",
    "name": "ばくおんぱ",
    "type": "ノーマル",
    "category": "special",
    "power": 140,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "非常に威力の高い音技。",
    "sound": true
  },
  "v6-056": {
    "id": "v6-056",
    "name": "ドわすれ",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のとくぼうを2段階上げる。",
    "selfStatChanges": {
      "specialDefense": 2
    }
  },
  "v6-057": {
    "id": "v6-057",
    "name": "すりかえ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手と持ち物を入れ替える。",
    "swapItems": true
  },
  "v6-058": {
    "id": "v6-058",
    "name": "ふきとばし",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": -6,
    "maxPP": 20,
    "description": "相手を控えと強制的に交代させる。",
    "forceSwitch": true,
    "wind": true
  },
  "v6-059": {
    "id": "v6-059",
    "name": "アクアリング",
    "type": "みず",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "毎ターン最大HPの1/16を回復する。",
    "aquaRing": true
  },
  "v6-060": {
    "id": "v6-060",
    "name": "きりばらい",
    "type": "ひこう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "相手の回避率を1段階下げ、場の設置物・壁・フィールドを除去する。",
    "targetStatChanges": {
      "evasion": -1
    },
    "defog": true,
    "wind": true
  },
  "v6-061": {
    "id": "v6-061",
    "name": "ぎんいろのかぜ",
    "type": "むし",
    "category": "special",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "10%で自分の主要能力が1段階ずつ上がる。",
    "allStatBoostChance": 10,
    "wind": true
  },
  "v6-062": {
    "id": "v6-062",
    "name": "とびかかる",
    "type": "むし",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のこうげきを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "attack": -1
    }
  },
  "v6-063": {
    "id": "v6-063",
    "name": "むしくい",
    "type": "むし",
    "category": "physical",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手がきのみを持っていると食べて効果を得る。",
    "contact": true,
    "bugBite": true
  },
  "v6-064": {
    "id": "v6-064",
    "name": "ナイトヘッド",
    "type": "ゴースト",
    "category": "special",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のレベルと同じ固定ダメージを与える。",
    "fixedDamage": "level"
  },
  "v6-065": {
    "id": "v6-065",
    "name": "あやしいかぜ",
    "type": "ゴースト",
    "category": "special",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "10%で自分の主要能力が1段階ずつ上がる。",
    "allStatBoostChance": 10
  },
  "v6-066": {
    "id": "v6-066",
    "name": "ゴーストダイブ",
    "type": "ゴースト",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "1ターン姿を消し、次のターン攻撃。まもるを貫通する。",
    "contact": true,
    "twoTurn": "vanish",
    "breakProtect": true
  },
  "v6-067": {
    "id": "v6-067",
    "name": "ポルターガイスト",
    "type": "ゴースト",
    "category": "physical",
    "power": 110,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "相手が持ち物を持っている時だけ成功する。",
    "requiresTargetItem": true
  },
  "v6-068": {
    "id": "v6-068",
    "name": "バークアウト",
    "type": "あく",
    "category": "special",
    "power": 55,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のとくこうを1段階下げる。音技。",
    "sound": true,
    "targetStatChanges": {
      "specialAttack": -1
    }
  },
  "v6-069": {
    "id": "v6-069",
    "name": "あやしいひかり",
    "type": "ゴースト",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手をこんらんさせる。",
    "confuse": true
  },
  "v6-070": {
    "id": "v6-070",
    "name": "さいみんじゅつ",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": 60,
    "priority": 0,
    "maxPP": 20,
    "description": "相手をねむり状態にする。",
    "directStatus": "sleep"
  },
  "v6-071": {
    "id": "v6-071",
    "name": "しびれごな",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": 75,
    "priority": 0,
    "maxPP": 20,
    "description": "相手をまひ状態にする。粉技。",
    "directStatus": "paralysis",
    "powder": true
  },
  "v6-072": {
    "id": "v6-072",
    "name": "いかりのこな",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 2,
    "maxPP": 20,
    "description": "ダブル用の誘導技。シングルでは失敗する。",
    "singlesFail": true,
    "powder": true
  },
  "v6-073": {
    "id": "v6-073",
    "name": "アンコール",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 5,
    "description": "3ターン、相手に最後に使った技を繰り返させる。みがわりを無視する。",
    "encoreTurns": 3,
    "ignoreSubstitute": true
  },
  "v6-074": {
    "id": "v6-074",
    "name": "かなしばり",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手が最後に使った技を4ターン使えなくする。",
    "disableTurns": 4
  },
  "v6-075": {
    "id": "v6-075",
    "name": "うらみ",
    "type": "ゴースト",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手が最後に使った技のPPを4減らす。",
    "spitePP": 4
  },
  "v6-076": {
    "id": "v6-076",
    "name": "のろい",
    "type": "ゴースト",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "ゴーストならHP半分を使い呪いをかける。それ以外はA・B↑、S↓。",
    "curse": true
  },
  "v6-077": {
    "id": "v6-077",
    "name": "みちづれ",
    "type": "ゴースト",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "次に直接攻撃で倒された時、相手もひんしにする。",
    "destinyBond": true
  },
  "v6-078": {
    "id": "v6-078",
    "name": "おきみやげ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "自分はひんしになり、相手のこうげき・とくこうを2段階下げる。",
    "selfFaint": true,
    "targetStatChanges": {
      "attack": -2,
      "specialAttack": -2
    }
  },
  "v6-079": {
    "id": "v6-079",
    "name": "くろいまなざし",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "相手を交代できなくする。",
    "trapTarget": true
  },
  "v6-080": {
    "id": "v6-080",
    "name": "バトンタッチ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "能力変化などを引き継いで控えと交代する。",
    "batonPass": true,
    "pivot": true
  },
  "v6-081": {
    "id": "v6-081",
    "name": "ひかりのかべ",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "5ターン、特殊技のダメージを軽減する。",
    "screen": "lightScreen"
  },
  "v6-082": {
    "id": "v6-082",
    "name": "しんぴのまもり",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "5ターン、味方の場を状態異常から守る。",
    "safeguard": true
  },
  "v6-083": {
    "id": "v6-083",
    "name": "あめのさけび",
    "type": "みず",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "1ターン目に雨にし、2ターン目に攻撃する。パワフルハーブ対応。音技。",
    "sound": true,
    "twoTurnWeather": "rain"
  },
  "v6-084": {
    "id": "v6-084",
    "name": "はれのさけび",
    "type": "ほのお",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "1ターン目に晴れにし、2ターン目に攻撃する。パワフルハーブ対応。音技。",
    "sound": true,
    "twoTurnWeather": "sun"
  },
  "v6-085": {
    "id": "v6-085",
    "name": "フェザーダンス",
    "type": "ひこう",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のこうげきを2段階下げる。",
    "targetStatChanges": {
      "attack": -2
    },
    "dance": true
  },
  "v6-086": {
    "id": "v6-086",
    "name": "じゅうでん",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "とくぼうを1段階上げ、次の電気技の威力を2倍にする。",
    "selfStatChanges": {
      "specialDefense": 1
    },
    "chargeElectric": true
  },
  "v6-087": {
    "id": "v6-087",
    "name": "ファストガード",
    "type": "かくとう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 3,
    "maxPP": 16,
    "description": "そのターン、先制技から身を守る。",
    "quickGuard": true
  },
  "v6-088": {
    "id": "v6-088",
    "name": "はいよるいちげき",
    "type": "むし",
    "category": "physical",
    "power": 70,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のとくこうを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "specialAttack": -1
    }
  },
  "v6-089": {
    "id": "v6-089",
    "name": "れんぞくぎり",
    "type": "むし",
    "category": "physical",
    "power": 40,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 20,
    "description": "連続して当てるほど威力が上がる。",
    "contact": true,
    "furyCutter": true,
    "slicing": true
  },
  "v6-090": {
    "id": "v6-090",
    "name": "あなをほる",
    "type": "じめん",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "1ターン地中に潜り、次のターン攻撃する。",
    "contact": true,
    "twoTurn": "dig"
  },
  "v6-091": {
    "id": "v6-091",
    "name": "マッドショット",
    "type": "じめん",
    "category": "special",
    "power": 55,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のすばやさを1段階下げる。",
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v6-092": {
    "id": "v6-092",
    "name": "すてみタックル",
    "type": "ノーマル",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "与えたダメージの1/3を反動で受ける。",
    "contact": true,
    "recoilRatio": 0.3333333333333333
  },
  "v6-093": {
    "id": "v6-093",
    "name": "からげんき",
    "type": "ノーマル",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "自分が状態異常なら威力2倍。やけどの攻撃低下を無視する。",
    "contact": true,
    "doubleIfUserStatus": true,
    "ignoreBurnAttackDrop": true
  },
  "v6-094": {
    "id": "v6-094",
    "name": "ギガインパクト",
    "type": "ノーマル",
    "category": "physical",
    "power": 150,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、次のターンは反動で動けない。",
    "contact": true,
    "recharge": true
  },
  "v6-095": {
    "id": "v6-095",
    "name": "こうそくスピン",
    "type": "ノーマル",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "自分の設置技・拘束を解除し、すばやさを1段階上げる。",
    "contact": true,
    "selfStatChanges": {
      "speed": 1
    },
    "rapidSpin": true
  },
  "v6-096": {
    "id": "v6-096",
    "name": "ヘビーボンバー",
    "type": "はがね",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手より重いほど威力が上がる。",
    "contact": true,
    "weightRatioPower": true
  },
  "v6-097": {
    "id": "v6-097",
    "name": "ジャイロボール",
    "type": "はがね",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "自分が相手より遅いほど威力が上がる。",
    "contact": true,
    "gyroBall": true
  },
  "v6-098": {
    "id": "v6-098",
    "name": "アイアンローラー",
    "type": "はがね",
    "category": "physical",
    "power": 130,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "フィールドがある時だけ成功し、フィールドを解除する。",
    "contact": true,
    "requiresTerrain": true,
    "removeTerrain": true
  },
  "v6-099": {
    "id": "v6-099",
    "name": "ころがる",
    "type": "いわ",
    "category": "physical",
    "power": 30,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 16,
    "description": "5ターン連続で使い、当てるたび威力が倍になる。",
    "contact": true,
    "rollout": true
  },
  "v6-100": {
    "id": "v6-100",
    "name": "タネばくだん",
    "type": "くさ",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "bullet": true
  },
  "v6-101": {
    "id": "v6-101",
    "name": "たくわえる",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "最大3回。ぼうぎょ・とくぼうを1段階ずつ上げ、たくわえ数を増やす。",
    "stockpile": true
  },
  "v6-102": {
    "id": "v6-102",
    "name": "のみこむ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "たくわえ数に応じてHPを回復し、たくわえを解除する。",
    "swallow": true
  },
  "v6-103": {
    "id": "v6-103",
    "name": "はきだす",
    "type": "ノーマル",
    "category": "special",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "たくわえ数×100の威力で攻撃し、たくわえを解除する。",
    "spitUp": true
  },
  "v6-104": {
    "id": "v6-104",
    "name": "いとをはく",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のすばやさを2段階下げる。",
    "targetStatChanges": {
      "speed": -2
    }
  },
  "v6-105": {
    "id": "v6-105",
    "name": "じゅうりょく",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "5ターンじゅうりょく状態にし、命中率を上げ、浮いているポケモンも地面に下ろす。",
    "gravity": true
  },
  "v6-106": {
    "id": "v6-106",
    "name": "こらえる",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 4,
    "maxPP": 12,
    "description": "そのターン、HP1で耐える。連続使用は成功率が下がる。",
    "endure": true,
    "protectLike": true
  },
  "v6-107": {
    "id": "v6-107",
    "name": "てだすけ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 5,
    "maxPP": 20,
    "description": "ダブル用。シングルでは失敗する。",
    "singlesFail": true
  },
  "v6-108": {
    "id": "v6-108",
    "name": "リサイクル",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "このバトルで消費した持ち物を復活させる。",
    "recycle": true
  },
  "v6-109": {
    "id": "v6-109",
    "name": "とびつく",
    "type": "むし",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のすばやさを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v6-110": {
    "id": "v6-110",
    "name": "まとわりつく",
    "type": "むし",
    "category": "special",
    "power": 20,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手を4～5ターン拘束し、毎ターンダメージ。",
    "contact": true,
    "trapDamage": true
  },
  "v6-111": {
    "id": "v6-111",
    "name": "ミサイルばり",
    "type": "むし",
    "category": "physical",
    "power": 25,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 20,
    "description": "2～5回連続で攻撃する。",
    "multiHit": [
      2,
      5
    ]
  },
  "v6-112": {
    "id": "v6-112",
    "name": "みずのはどう",
    "type": "みず",
    "category": "special",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "20%で相手をこんらんさせる。波動技。",
    "pulse": true,
    "confuseChance": 20
  },
  "v6-113": {
    "id": "v6-113",
    "name": "ヘドロウェーブ",
    "type": "どく",
    "category": "special",
    "power": 95,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "10%でどく状態にする。",
    "secondaryStatus": {
      "status": "poison",
      "chance": 10
    }
  },
  "v6-114": {
    "id": "v6-114",
    "name": "みずびたし",
    "type": "みず",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手をみず単タイプにする。",
    "setTypes": [
      "みず"
    ]
  },
  "v6-115": {
    "id": "v6-115",
    "name": "ねばねばネット",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "相手の場にねばねばネットを設置する。",
    "hazard": "stickyWeb"
  },
  "v6-116": {
    "id": "v6-116",
    "name": "あまえる",
    "type": "フェアリー",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のこうげきを2段階下げる。",
    "targetStatChanges": {
      "attack": -2
    }
  },
  "v6-117": {
    "id": "v6-117",
    "name": "とける",
    "type": "どく",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のぼうぎょを2段階上げる。",
    "selfStatChanges": {
      "defense": 2
    }
  },
  "v6-118": {
    "id": "v6-118",
    "name": "ロックブラスト",
    "type": "いわ",
    "category": "physical",
    "power": 25,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "2～5回連続で攻撃する。",
    "multiHit": [
      2,
      5
    ]
  },
  "v6-119": {
    "id": "v6-119",
    "name": "うちおとす",
    "type": "いわ",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手を地面に落とし、じめん技が当たるようにする。",
    "smackDown": true
  },
  "v6-120": {
    "id": "v6-120",
    "name": "げんしのちから",
    "type": "いわ",
    "category": "special",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "10%で自分の主要能力が1段階ずつ上がる。",
    "allStatBoostChance": 10
  },
  "v6-121": {
    "id": "v6-121",
    "name": "メテオビーム",
    "type": "いわ",
    "category": "special",
    "power": 120,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "1ターン目にとくこうを1段階上げ、2ターン目に攻撃。パワフルハーブ対応。",
    "twoTurn": "meteorBeam",
    "chargeBoost": {
      "specialAttack": 1
    }
  },
  "v6-122": {
    "id": "v6-122",
    "name": "けたぐり",
    "type": "かくとう",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手が重いほど威力が上がる。",
    "contact": true,
    "weightPower": true
  },
  "v6-123": {
    "id": "v6-123",
    "name": "どくづき",
    "type": "どく",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "30%でどく状態にする。",
    "contact": true,
    "secondaryStatus": {
      "status": "poison",
      "chance": 30
    }
  },
  "v6-124": {
    "id": "v6-124",
    "name": "きあいだめ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分の急所ランクを2段階上げる。",
    "focusEnergy": true
  },
  "v6-125": {
    "id": "v6-125",
    "name": "つめとぎ",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "こうげき・命中率を1段階ずつ上げる。",
    "selfStatChanges": {
      "attack": 1,
      "accuracy": 1
    }
  },
  "v6-126": {
    "id": "v6-126",
    "name": "ハードプレス",
    "type": "はがね",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手の残りHPが多いほど威力が高い。最大100。",
    "hardPress": true
  },
  "v6-127": {
    "id": "v6-127",
    "name": "メタルクロー",
    "type": "はがね",
    "category": "physical",
    "power": 50,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 20,
    "description": "10%で自分のこうげきが1段階上がる。",
    "contact": true,
    "selfStatChangeChance": {
      "stat": "attack",
      "amount": 1,
      "chance": 10
    }
  },
  "v6-128": {
    "id": "v6-128",
    "name": "メタルバースト",
    "type": "はがね",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "最後に受けたダメージの1.5倍を返す。",
    "metalBurst": true
  },
  "v6-129": {
    "id": "v6-129",
    "name": "きんぞくおん",
    "type": "はがね",
    "category": "status",
    "power": null,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のとくぼうを2段階下げる。音技。",
    "sound": true,
    "targetStatChanges": {
      "specialDefense": -2
    }
  },
  "v6-130": {
    "id": "v6-130",
    "name": "いやなおと",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のぼうぎょを2段階下げる。音技。",
    "sound": true,
    "targetStatChanges": {
      "defense": -2
    }
  },
  "v6-131": {
    "id": "v6-131",
    "name": "ふいうち",
    "type": "あく",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 8,
    "description": "相手が攻撃技を選び、まだそのターンに行動していない時だけ成功する。",
    "contact": true,
    "suckerPunch": true
  },
  "v6-132": {
    "id": "v6-132",
    "name": "フェイント",
    "type": "ノーマル",
    "category": "physical",
    "power": 30,
    "accuracy": 100,
    "priority": 2,
    "maxPP": 12,
    "description": "まもる等を解除して攻撃できる。",
    "breakProtect": true
  },
  "v6-133": {
    "id": "v6-133",
    "name": "はらだいこ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "最大HPの半分を失い、こうげきを最大まで上げる。",
    "bellyDrum": true
  },
  "v6-134": {
    "id": "v6-134",
    "name": "あくび",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "相手をねむけ状態にし、次のターン終了時にねむらせる。",
    "yawn": true
  },
  "v6-135": {
    "id": "v6-135",
    "name": "ソーラービーム",
    "type": "くさ",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "通常は2ターン技。晴れでは即攻撃。パワフルハーブ対応。",
    "twoTurn": "solarBeam"
  },
  "v6-136": {
    "id": "v6-136",
    "name": "はなふぶき",
    "type": "くさ",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20
  },
  "v6-137": {
    "id": "v6-137",
    "name": "はなびらのまい",
    "type": "くさ",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2～3ターン連続で攻撃し、終了後こんらんする。",
    "rampage": true
  },
  "v6-138": {
    "id": "v6-138",
    "name": "てっていこせん",
    "type": "はがね",
    "category": "special",
    "power": 140,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 8,
    "description": "攻撃後、自分の最大HPの半分を失う。",
    "recoilMaxHPRatio": 0.5
  },
  "v6-139": {
    "id": "v6-139",
    "name": "ミラーコート",
    "type": "エスパー",
    "category": "special",
    "power": null,
    "accuracy": 100,
    "priority": -5,
    "maxPP": 20,
    "description": "直前に受けた特殊ダメージの2倍を返す。",
    "mirrorCoat": true
  },
  "v6-140": {
    "id": "v6-140",
    "name": "リフレクター",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "5ターン、物理技のダメージを軽減する。",
    "screen": "reflect"
  },
  "v6-141": {
    "id": "v6-141",
    "name": "いのちのしずく",
    "type": "みず",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "自分の最大HPの1/4を回復する。",
    "healRatio": 0.25
  },
  "v6-142": {
    "id": "v6-142",
    "name": "ようせいのかぜ",
    "type": "フェアリー",
    "category": "special",
    "power": 40,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20
  },
  "v6-143": {
    "id": "v6-143",
    "name": "コスモパワー",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "ぼうぎょ・とくぼうを1段階上げる。",
    "selfStatChanges": {
      "defense": 1,
      "specialDefense": 1
    }
  },
  "v6-144": {
    "id": "v6-144",
    "name": "うそなき",
    "type": "あく",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のとくぼうを2段階下げる。",
    "targetStatChanges": {
      "specialDefense": -2
    }
  },
  "v6-145": {
    "id": "v6-145",
    "name": "トリック",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手と持ち物を入れ替える。",
    "swapItems": true
  },
  "v6-146": {
    "id": "v6-146",
    "name": "ミストフィールド",
    "type": "フェアリー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、ミストフィールドにする。",
    "terrain": "misty"
  },
  "v6-147": {
    "id": "v6-147",
    "name": "ともえなげ",
    "type": "かくとう",
    "category": "physical",
    "power": 60,
    "accuracy": 90,
    "priority": -6,
    "maxPP": 12,
    "description": "命中すると相手を控えと強制交代させる。",
    "contact": true,
    "forceSwitchOnHit": true
  },
  "v6-148": {
    "id": "v6-148",
    "name": "はやてがえし",
    "type": "かくとう",
    "category": "physical",
    "power": 65,
    "accuracy": 100,
    "priority": 3,
    "maxPP": 12,
    "description": "相手が先制技を選んだ時だけ成功し、相手をひるませる。",
    "contact": true,
    "upperHand": true,
    "flinchChance": 100
  },
  "v6-149": {
    "id": "v6-149",
    "name": "カウンター",
    "type": "かくとう",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": -5,
    "maxPP": 20,
    "description": "直前に受けた物理ダメージの2倍を返す。",
    "contact": true,
    "counter": true
  },
  "v6-150": {
    "id": "v6-150",
    "name": "きしかいせい",
    "type": "かくとう",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "自分の残りHPが少ないほど威力が高い。",
    "contact": true,
    "reversal": true
  },
  "v6-151": {
    "id": "v6-151",
    "name": "いのちがけ",
    "type": "かくとう",
    "category": "special",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "自分はひんしになり、残りHPと同じダメージを与える。",
    "finalGambit": true
  },
  "v6-152": {
    "id": "v6-152",
    "name": "あばれる",
    "type": "ノーマル",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2～3ターン連続で攻撃し、終了後こんらんする。",
    "contact": true,
    "rampage": true
  },
  "v6-153": {
    "id": "v6-153",
    "name": "コーチング",
    "type": "かくとう",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "ダブル用。シングルでは失敗する。",
    "singlesFail": true
  },
  "v6-154": {
    "id": "v6-154",
    "name": "いたみわけ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分と相手のHPを平均化する。",
    "painSplit": true
  },
  "v6-155": {
    "id": "v6-155",
    "name": "レイジングブル",
    "type": "ノーマル",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手側の壁を壊してから攻撃する。",
    "contact": true,
    "breakScreens": true
  },
  "v6-156": {
    "id": "v6-156",
    "name": "ローキック",
    "type": "かくとう",
    "category": "physical",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のすばやさを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v6-157": {
    "id": "v6-157",
    "name": "ミストバースト",
    "type": "フェアリー",
    "category": "special",
    "power": 100,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、自分はひんし。ミストフィールド時は威力1.5倍。爆発技。",
    "selfFaintAfterDamage": true,
    "explosive": true,
    "boostInMisty": 1.5
  },
  "v6-158": {
    "id": "v6-158",
    "name": "アシストパワー",
    "type": "エスパー",
    "category": "special",
    "power": 20,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "自分の上昇している能力ランク1段階ごとに威力+20。",
    "storedPower": true
  },
  "v6-159": {
    "id": "v6-159",
    "name": "みらいよち",
    "type": "エスパー",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2ターン後に攻撃する。",
    "futureSight": true
  },
  "v6-160": {
    "id": "v6-160",
    "name": "ねがいごと",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "次のターン終了時、使用者の最大HPの半分を場のポケモンが回復する。",
    "wish": true
  },
  "v6-161": {
    "id": "v6-161",
    "name": "マジックルーム",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、全ポケモンの持ち物の効果を無効にする。",
    "magicRoom": true
  },
  "v6-162": {
    "id": "v6-162",
    "name": "ワンダールーム",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、全ポケモンのぼうぎょととくぼうを入れ替えて計算する。",
    "wonderRoom": true
  },
  "v6-163": {
    "id": "v6-163",
    "name": "サイコフィールド",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、サイコフィールドにする。",
    "terrain": "psychic"
  },
  "v6-164": {
    "id": "v6-164",
    "name": "ふういん",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "相手は自分と同じ技を使えなくなる。",
    "imprison": true
  },
  "v6-165": {
    "id": "v6-165",
    "name": "まほうのこな",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手をエスパー単タイプにする。粉技。",
    "setTypes": [
      "エスパー"
    ],
    "powder": true
  },
  "v6-166": {
    "id": "v6-166",
    "name": "いやしのはどう",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "相手の最大HPの半分を回復する。",
    "healTargetRatio": 0.5,
    "pulse": true
  },
  "v6-167": {
    "id": "v6-167",
    "name": "はかいこうせん",
    "type": "ノーマル",
    "category": "special",
    "power": 150,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、次のターンは反動で動けない。",
    "recharge": true
  },
  "v6-168": {
    "id": "v6-168",
    "name": "パラボラチャージ",
    "type": "でんき",
    "category": "special",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "与えたダメージの半分を回復する。",
    "drainRatio": 0.5
  },
  "v6-169": {
    "id": "v6-169",
    "name": "でんじほう",
    "type": "でんき",
    "category": "special",
    "power": 120,
    "accuracy": 50,
    "priority": 0,
    "maxPP": 8,
    "description": "命中すると相手を必ずまひにする。",
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 100
    },
    "bullet": true
  },
  "v6-170": {
    "id": "v6-170",
    "name": "エレクトロビーム",
    "type": "でんき",
    "category": "special",
    "power": 130,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "1ターン目にとくこうを1段階上げ、2ターン目に攻撃。雨なら即攻撃。パワフルハーブ対応。",
    "twoTurn": "electroShot",
    "chargeBoost": {
      "specialAttack": 1
    }
  },
  "v6-171": {
    "id": "v6-171",
    "name": "ボルテッカー",
    "type": "でんき",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "与えたダメージの1/3反動。10%でまひ。",
    "contact": true,
    "recoilRatio": 0.3333333333333333,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 10
    }
  },
  "v6-172": {
    "id": "v6-172",
    "name": "じんらい",
    "type": "でんき",
    "category": "special",
    "power": 70,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 8,
    "description": "相手が攻撃技を選んでいる時だけ成功する。",
    "suckerPunch": true
  },
  "v6-173": {
    "id": "v6-173",
    "name": "ほっぺすりすり",
    "type": "でんき",
    "category": "physical",
    "power": 20,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手を必ずまひにする。",
    "contact": true,
    "secondaryStatus": {
      "status": "paralysis",
      "chance": 100
    }
  },
  "v6-174": {
    "id": "v6-174",
    "name": "ライジングボルト",
    "type": "でんき",
    "category": "special",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "エレキフィールド上で地面にいる相手には威力2倍。",
    "risingVoltage": true
  },
  "v6-175": {
    "id": "v6-175",
    "name": "ねこだまし",
    "type": "ノーマル",
    "category": "physical",
    "power": 40,
    "accuracy": 100,
    "priority": 3,
    "maxPP": 12,
    "description": "場に出た最初のターンだけ成功し、相手をひるませる。",
    "contact": true,
    "firstTurnOnly": true,
    "flinchChance": 100
  },
  "v6-176": {
    "id": "v6-176",
    "name": "がむしゃら",
    "type": "ノーマル",
    "category": "physical",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "相手のHPを自分の現在HPと同じまで減らす。",
    "contact": true,
    "endeavor": true
  },
  "v6-177": {
    "id": "v6-177",
    "name": "いかりのまえば",
    "type": "ノーマル",
    "category": "physical",
    "power": null,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "相手の現在HPを半分にする。",
    "contact": true,
    "superFang": true
  },
  "v6-178": {
    "id": "v6-178",
    "name": "ひっさつまえば",
    "type": "ノーマル",
    "category": "physical",
    "power": 80,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 16,
    "description": "10%で相手をひるませる。",
    "contact": true,
    "flinchChance": 10
  },
  "v6-179": {
    "id": "v6-179",
    "name": "すなのさけび",
    "type": "いわ",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "1ターン目に砂嵐にし、2ターン目に攻撃する。パワフルハーブ対応。音技。",
    "sound": true,
    "twoTurnWeather": "sand"
  },
  "v6-180": {
    "id": "v6-180",
    "name": "ゆきのさけび",
    "type": "こおり",
    "category": "special",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "1ターン目に雪にし、2ターン目に攻撃する。パワフルハーブ対応。音技。",
    "sound": true,
    "twoTurnWeather": "snow"
  },
  "v6-181": {
    "id": "v6-181",
    "name": "なみだめ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のこうげき・とくこうを1段階ずつ下げる。",
    "targetStatChanges": {
      "attack": -1,
      "specialAttack": -1
    }
  },
  "v6-182": {
    "id": "v6-182",
    "name": "エレキフィールド",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "5ターン、エレキフィールドにする。",
    "terrain": "electric"
  },
  "v6-183": {
    "id": "v6-183",
    "name": "でんじふゆう",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 16,
    "description": "5ターン、じめん技が当たらなくなる。",
    "magnetRise": true
  },
  "v6-184": {
    "id": "v6-184",
    "name": "かいでんぱ",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のとくこうを2段階下げる。",
    "targetStatChanges": {
      "specialAttack": -2
    }
  }
});

Object.assign(ITEM_DEX, {
  "power-herb": {
    "id": "power-herb",
    "name": "パワフルハーブ",
    "description": "ため技を1度だけ即座に発動できる。",
    "powerHerb": true
  },
  "light-clay": {
    "id": "light-clay",
    "name": "ひかりのねんど",
    "description": "リフレクター・ひかりのかべの継続を8ターンにする。",
    "lightClay": true
  },
  "terrain-extender": {
    "id": "terrain-extender",
    "name": "グランドコート",
    "description": "フィールドの継続を8ターンにする。",
    "terrainExtender": true
  },
  "binding-band": {
    "id": "binding-band",
    "name": "しめつけバンド",
    "description": "拘束技のターン終了ダメージを強化する。",
    "bindingBand": true
  },
  "grip-claw": {
    "id": "grip-claw",
    "name": "ねばりのかぎづめ",
    "description": "拘束技の継続を7ターンに固定する。",
    "gripClaw": true
  },
  "mental-herb": {
    "id": "mental-herb",
    "name": "メンタルハーブ",
    "description": "ちょうはつ・アンコール・かなしばり等を1度だけ回復する。",
    "mentalHerb": true
  },
  "white-herb": {
    "id": "white-herb",
    "name": "しろいハーブ",
    "description": "下がった能力ランクを1度だけ元に戻す。",
    "whiteHerb": true
  },
  "loaded-dice": {
    "id": "loaded-dice",
    "name": "いかさまダイス",
    "description": "2～5回の連続技が4～5回当たりやすくなる。",
    "loadedDice": true
  },
  "heavy-duty-boots": {
    "id": "heavy-duty-boots",
    "name": "あつぞこブーツ",
    "description": "交代時の設置技の効果を受けない。",
    "heavyDutyBoots": true
  },
  "shed-shell": {
    "id": "shed-shell",
    "name": "きれいなぬけがら",
    "description": "交代を封じる効果を無視して交代できる。",
    "shedShell": true
  },
  "room-service": {
    "id": "room-service",
    "name": "ルームサービス",
    "description": "トリックルームになった時、すばやさが1段階下がる。1回限り。",
    "roomService": true
  },
  "electric-seed": {
    "id": "electric-seed",
    "name": "エレキシード",
    "description": "エレキフィールド時にぼうぎょが1段階上がる。1回限り。",
    "terrainSeed": "electric",
    "seedStat": "defense"
  },
  "grassy-seed": {
    "id": "grassy-seed",
    "name": "グラスシード",
    "description": "グラスフィールド時にぼうぎょが1段階上がる。1回限り。",
    "terrainSeed": "grassy",
    "seedStat": "defense"
  },
  "misty-seed": {
    "id": "misty-seed",
    "name": "ミストシード",
    "description": "ミストフィールド時にとくぼうが1段階上がる。1回限り。",
    "terrainSeed": "misty",
    "seedStat": "specialDefense"
  },
  "psychic-seed": {
    "id": "psychic-seed",
    "name": "サイコシード",
    "description": "サイコフィールド時にとくぼうが1段階上がる。1回限り。",
    "terrainSeed": "psychic",
    "seedStat": "specialDefense"
  },
  "safety-goggles": {
    "id": "safety-goggles",
    "name": "ぼうじんゴーグル",
    "description": "粉技を無効化し、すなあらしのダメージも受けない。",
    "safetyGoggles": true
  }
});

// ============================================================
// Champions PP補正
// ============================================================
// v5までの基本データには本編側の旧PPが一部残っていたため、
// 公式技のみChampionsのPP段階（8 / 12 / 16 / 20）へ補正する。
// ニワラ独自技は元データにPP指定がないため、既存の暫定値を維持する。
const V6_CUSTOM_MOVE_NAMES = new Set([
  "ツリーホーン",
  "じゅひょうとつげき",
  "ビーストダッシュ",
  "かえんざん",
  "ねっさのつるぎ",
  "ジュエルカッター",
  "レイニーシャウト",
  "エアノイズ",
  "ドレインボイス",
  "はれのさけび",
  "あめのさけび",
  "すなのさけび",
  "ゆきのさけび",
  "まよなかのかね"
]);

for (const move of Object.values(MOVE_DEX)) {
  if (V6_CUSTOM_MOVE_NAMES.has(move.name)) continue;

  // Championsで「まもる」はPP8。
  if (move.name === "まもる") {
    move.maxPP = 8;
    continue;
  }

  // Championsの公式技一覧で採用されているPP段階へ変換。
  if (move.maxPP === 5) move.maxPP = 8;
  else if (move.maxPP === 10) move.maxPP = 12;
  else if (move.maxPP === 15) move.maxPP = 16;
  else if (move.maxPP === 25 || move.maxPP === 30 || move.maxPP === 35 || move.maxPP === 40) move.maxPP = 20;
}

// 元データに記載された全技候補を各種族へ反映
SPECIES_DEX["karibu"].movePool = ["tree-horn", "v6-001", "wood-hammer", "grass-glide", "v6-002", "v6-003", "v6-004", "v6-005", "giga-drain", "v6-006", "juhyo-charge", "ice-shard", "ice-spinner", "v6-007", "v6-008", "v6-009", "v6-010", "icy-wind", "v6-011", "v6-012", "beast-dash", "close-combat", "superpower", "v6-013", "earthquake", "v6-014", "v6-015", "high-horsepower", "body-slam", "wild-charge", "rock-slide", "v6-016", "zen-headbutt", "play-rough", "megahorn", "smart-strike", "protect", "v6-017", "v6-018", "v6-019", "bulk-up", "v6-020", "synthesis", "iron-defense", "v6-021", "leech-seed", "v6-022", "sunny-day", "snowscape", "rain-dance", "v6-023", "v6-024", "v6-025", "v6-026"];
SPECIES_DEX["wolf"].movePool = ["kaenzan", "flame-charge", "v6-027", "v6-028", "flamethrower", "fire-blast", "overheat", "v6-029", "heat-wave", "nessa-sword", "earthquake", "v6-014", "v6-015", "v6-030", "v6-031", "earth-power", "jewel-cutter", "rock-slide", "stone-edge", "v6-032", "v6-003", "v6-033", "v6-034", "v6-035", "crunch", "v6-036", "close-combat", "protect", "v6-017", "v6-018", "v6-037", "swords-dance", "v6-038", "v6-022", "v6-039", "v6-040", "agility", "v6-041", "v6-042", "v6-043", "v6-044"];
SPECIES_DEX["babhat"].movePool = ["rainy-shout", "surf", "hydro-pump", "scald", "chilling-water", "aqua-jet", "flip-turn", "v6-045", "muddy-water", "v6-046", "air-noise", "hurricane", "v6-047", "air-slash", "v6-048", "v6-049", "drain-voice", "dazzling-gleam", "v6-050", "v6-051", "v6-052", "psychic", "icy-wind", "weather-ball", "u-turn", "leech-life", "bug-buzz", "dark-pulse", "v6-053", "v6-054", "hyper-voice", "v6-055", "protect", "v6-017", "v6-018", "v6-019", "agility", "v6-056", "calm-mind", "v6-040", "v6-057", "v6-058", "v6-022", "toxic", "v6-059", "tailwind", "v6-060", "rain-dance", "roost"];
SPECIES_DEX["emplace"].movePool = ["bug-buzz", "v6-061", "pollen-puff", "x-scissor", "leech-life", "v6-062", "v6-063", "shadow-ball", "hex", "v6-064", "v6-065", "v6-066", "shadow-sneak", "v6-067", "air-slash", "hurricane", "psychic", "dazzling-gleam", "draining-kiss", "icy-wind", "dark-pulse", "v6-068", "hyper-voice", "weather-ball", "protect", "v6-017", "v6-018", "quiver-dance", "agility", "calm-mind", "v6-056", "v6-037", "v6-069", "v6-070", "v6-071", "sleep-powder", "v6-072", "v6-040", "v6-073", "v6-074", "v6-075", "v6-076", "v6-077", "v6-078", "v6-079", "v6-057", "v6-080", "roost", "v6-060", "v6-081", "v6-082"];
SPECIES_DEX["peetom"].movePool = ["thunder", "thunderbolt", "volt-switch", "discharge", "charge-beam", "hurricane", "air-slash", "v6-083", "v6-084", "surf", "heat-wave", "weather-ball", "protect", "v6-017", "v6-018", "roost", "v6-085", "tailwind", "v6-086", "thunder-wave", "agility", "v6-087"];
SPECIES_DEX["catamugri"].movePool = ["v6-063", "x-scissor", "v6-062", "leech-life", "u-turn", "v6-088", "megahorn", "bug-buzz", "v6-089", "earthquake", "v6-030", "v6-014", "v6-015", "v6-090", "v6-016", "v6-091", "v6-031", "earth-power", "body-slam", "v6-092", "v6-093", "v6-094", "v6-095", "v6-096", "v6-097", "iron-head", "v6-098", "rock-slide", "stone-edge", "v6-032", "v6-099", "body-press", "v6-003", "v6-100", "knock-off", "power-gem", "flash-cannon", "protect", "v6-017", "v6-018", "v6-019", "iron-defense", "bulk-up", "v6-076", "v6-101", "v6-102", "v6-103", "v6-104", "v6-043", "v6-044", "sandstorm", "v6-105", "v6-106", "v6-107", "v6-108"];
SPECIES_DEX["sappring"].movePool = ["bug-buzz", "pollen-puff", "v6-061", "leech-life", "v6-062", "x-scissor", "v6-063", "v6-109", "v6-110", "v6-111", "surf", "hydro-pump", "scald", "chilling-water", "muddy-water", "v6-112", "liquidation", "aqua-jet", "flip-turn", "v6-045", "v6-083", "sludge-bomb", "v6-113", "v6-054", "v6-053", "v6-091", "v6-016", "earth-power", "energy-ball", "giga-drain", "v6-005", "icy-wind", "ice-beam", "dazzling-gleam", "shadow-ball", "power-gem", "protect", "v6-017", "v6-018", "recover", "v6-059", "rain-dance", "v6-114", "v6-104", "v6-115", "toxic", "v6-116", "v6-069", "v6-073", "v6-040", "v6-107", "v6-080", "v6-056", "v6-117", "v6-101", "v6-102", "v6-103"];
SPECIES_DEX["gatlantes"].movePool = ["x-scissor", "megahorn", "leech-life", "v6-062", "u-turn", "v6-063", "v6-109", "v6-089", "v6-111", "bug-buzz", "v6-061", "stone-edge", "rock-slide", "v6-032", "v6-118", "v6-119", "v6-099", "power-gem", "v6-120", "v6-121", "earthquake", "v6-014", "v6-015", "v6-090", "high-horsepower", "v6-016", "v6-091", "earth-power", "iron-head", "smart-strike", "v6-096", "v6-098", "flash-cannon", "brick-break", "close-combat", "v6-122", "body-press", "knock-off", "crunch", "v6-123", "v6-003", "body-slam", "v6-092", "v6-094", "v6-095", "protect", "v6-017", "v6-018", "v6-019", "swords-dance", "iron-defense", "rock-polish", "agility", "v6-124", "v6-125", "v6-076", "v6-106", "sandstorm", "v6-043", "v6-044"];
SPECIES_DEX["metalifes"].movePool = ["x-scissor", "megahorn", "leech-life", "v6-062", "u-turn", "v6-063", "v6-109", "v6-089", "v6-111", "bug-buzz", "v6-061", "iron-head", "smart-strike", "v6-096", "v6-126", "v6-098", "v6-097", "v6-127", "flash-cannon", "steel-beam", "v6-128", "v6-090", "v6-016", "rock-slide", "stone-edge", "v6-032", "v6-118", "night-slash", "v6-035", "body-slam", "v6-092", "v6-094", "protect", "v6-017", "v6-018", "v6-019", "swords-dance", "iron-defense", "agility", "rock-polish", "v6-125", "v6-124", "v6-106", "v6-129", "v6-130", "v6-040", "v6-043", "v6-044"];
SPECIES_DEX["jaboru"].movePool = ["pyro-ball", "blaze-kick", "flare-blitz", "flame-charge", "flamethrower", "fire-blast", "heat-wave", "overheat", "earthquake", "v6-015", "v6-090", "v6-016", "v6-091", "v6-032", "rock-slide", "energy-ball", "shadow-ball", "v6-003", "v6-013", "v6-094", "u-turn", "v6-131", "v6-132", "v6-099", "protect", "v6-017", "v6-018", "v6-019", "swords-dance", "agility", "sunny-day", "sandstorm", "bulk-up", "v6-133", "v6-134", "v6-043", "v6-044"];
SPECIES_DEX["ratarinsesu"].movePool = ["leaf-storm", "v6-135", "giga-drain", "energy-ball", "v6-136", "v6-137", "v6-003", "grass-glide", "flash-cannon", "v6-138", "dazzling-gleam", "air-slash", "v6-061", "power-gem", "pollen-puff", "v6-139", "v6-050", "protect", "v6-017", "v6-018", "v6-140", "v6-081", "synthesis", "v6-056", "calm-mind", "sunny-day", "v6-026", "v6-082", "v6-020", "v6-116", "iron-defense", "v6-141"];
SPECIES_DEX["makuwariin"].movePool = ["flash-cannon", "steel-beam", "iron-head", "v6-097", "v6-127", "v6-096", "moonblast", "dazzling-gleam", "v6-050", "draining-kiss", "v6-051", "v6-142", "play-rough", "psychic", "psyshock", "shadow-ball", "energy-ball", "power-gem", "icy-wind", "charge-beam", "zen-headbutt", "body-press", "earth-power", "protect", "v6-017", "v6-018", "v6-019", "iron-defense", "calm-mind", "v6-143", "v6-056", "v6-116", "v6-144", "v6-129", "v6-145", "v6-140", "v6-081", "v6-082", "v6-146", "trick-room", "v6-107"];
SPECIES_DEX["goukain"].movePool = ["aqua-jet", "liquidation", "wave-crash", "flip-turn", "chilling-water", "close-combat", "v6-147", "brick-break", "body-press", "superpower", "v6-148", "v6-149", "v6-150", "vacuum-wave", "v6-151", "v6-132", "body-slam", "v6-152", "v6-092", "v6-090", "v6-014", "v6-091", "v6-131", "protect", "v6-017", "v6-018", "bulk-up", "v6-153", "recover", "v6-107", "v6-044", "v6-154", "v6-040", "v6-108"];
SPECIES_DEX["arukerukesu"].movePool = ["beast-dash", "close-combat", "body-press", "brick-break", "v6-155", "v6-013", "v6-122", "v6-156", "wave-crash", "flip-turn", "waterfall", "liquidation", "v6-003", "body-slam", "v6-093", "v6-094", "earthquake", "v6-014", "v6-015", "high-horsepower", "smart-strike", "throat-chop", "protect", "v6-017", "v6-018", "v6-076", "bulk-up", "iron-defense", "v6-108", "v6-043"];
SPECIES_DEX["castleude"].movePool = ["midnight-bell", "moonblast", "dazzling-gleam", "v6-050", "v6-157", "play-rough", "psychic", "v6-052", "psyshock", "v6-139", "v6-158", "v6-159", "zen-headbutt", "mystical-fire", "shadow-ball", "dark-pulse", "v6-068", "hyper-voice", "v6-121", "protect", "v6-017", "v6-018", "v6-019", "v6-160", "calm-mind", "v6-056", "nasty-plot", "v6-076", "moonlight", "trick-room", "v6-161", "v6-162", "v6-163", "v6-164", "v6-082", "iron-defense", "v6-165", "v6-166", "v6-145"];
SPECIES_DEX["furuseyua"].movePool = ["shadow-ball", "hex", "v6-066", "shadow-sneak", "v6-132", "body-slam", "hyper-voice", "v6-167", "dazzling-gleam", "icy-wind", "dark-pulse", "psychic", "protect", "v6-017", "v6-018", "calm-mind", "v6-056", "nasty-plot", "v6-076", "recover", "will-o-wisp", "thunder-wave", "v6-070", "v6-040", "v6-164", "v6-074", "parting-shot", "v6-078", "v6-075", "v6-079"];
SPECIES_DEX["dolpika"].movePool = ["thunderbolt", "thunder", "discharge", "v6-168", "v6-169", "charge-beam", "volt-switch", "v6-170", "v6-171", "v6-172", "v6-173", "wild-charge", "v6-174", "weather-ball", "hyper-voice", "quick-attack", "v6-175", "v6-176", "v6-167", "v6-177", "v6-178", "v6-084", "v6-083", "v6-179", "v6-180", "dazzling-gleam", "v6-005", "play-rough", "v6-003", "wood-hammer", "protect", "v6-017", "v6-018", "v6-116", "v6-107", "v6-181", "v6-073", "v6-080", "v6-182", "rain-dance", "sunny-day", "snowscape", "sandstorm", "v6-081", "v6-086", "thunder-wave", "v6-183", "v6-184", "v6-160", "v6-144"];

const V6_LEARNSET_COUNTS = {
  "カリブライン": 54,
  "ウルフレム": 41,
  "バブハット": 49,
  "エンプレイス": 51,
  "ピートム": 22,
  "キャタムグリ": 55,
  "サップリング": 57,
  "ガトランテス": 60,
  "メタリフェス": 48,
  "ジャボール": 37,
  "ラタリンセス": 32,
  "マクワリーン": 41,
  "ゴウカイン": 34,
  "アルケルケス": 30,
  "キャスルード": 39,
  "フルセユーア": 30,
  "ドルピカ(ドルピカのすがた)": 50
};
const V6_TOTAL_UNIQUE_MOVES = new Set(Object.values(SPECIES_DEX).flatMap(s => s.movePool)).size;
if (typeof DATA_PACK_COUNTS !== "undefined") { DATA_PACK_COUNTS.moves = Object.keys(MOVE_DEX).length; DATA_PACK_COUNTS.items = Object.keys(ITEM_DEX).length; }

// ============================================================
// v6.2 Champions整合性修正
// - ちからずく対象技の不足していた追加効果を補正
// - てっていこうせんの説明をChampions仕様へ補正
// ============================================================

// Championsではアイアンヘッドのひるみ率は20%、しねんのずつきも20%。
Object.assign(MOVE_DEX["iron-head"], {
  flinchChance: 20,
  description: "20%の確率で相手をひるませる。"
});

Object.assign(MOVE_DEX["zen-headbutt"], {
  flinchChance: 20,
  description: "20%の確率で相手をひるませる。"
});

// Championsではムーンフォースの特攻ダウン率は10%。
if (MOVE_DEX["moonblast"]?.targetStatChangeChance) {
  MOVE_DEX["moonblast"].targetStatChangeChance.chance = 10;
}

// てっていこうせん：最大HPの1/2（端数切り上げ）の反動。
// 外れ・まもるで防がれた場合も反動を受ける処理はv6_patch.js側で行う。
Object.assign(MOVE_DEX["steel-beam"], {
  description: "攻撃後、自分は最大HPの1/2の反動ダメージを受ける。最大HPが奇数なら端数切り上げ。攻撃が外れた場合や、まもる等で防がれた場合でも反動を受ける。"
});

// 元データ側の表記ゆれ版も同じ反動説明に統一。
if (MOVE_DEX["v6-138"]) {
  MOVE_DEX["v6-138"].description = "攻撃後、自分は最大HPの1/2の反動ダメージを受ける。最大HPが奇数なら端数切り上げ。攻撃が外れた場合や、まもる等で防がれた場合でも反動を受ける。";
}
// ============================================================
// ニワラバトル v7 データ追加
// - 元データで値が入っている未実装種 No.33 / 294-300
// - 53技 / 9特性 / ふしぎなアメ
// ============================================================

Object.assign(MOVE_DEX, {
  "v7-ant-march": {
    "id": "v7-ant-march",
    "name": "ありのこうしん",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "自分の最大HPの1/2を失い、自分のぼうぎょ・とくぼう・すばやさを2段階ずつ上げる。現在HPが最大HPの1/2以下の場合は失敗する。※PPは元データ未指定のため仮に8。",
    "selfStatChanges": {
      "defense": 2,
      "specialDefense": 2,
      "speed": 2
    },
    "v71AntMarch": true
  },
  "v7-first-impression": {
    "id": "v7-first-impression",
    "name": "であいがしら",
    "type": "むし",
    "category": "physical",
    "power": 100,
    "accuracy": 100,
    "priority": 2,
    "maxPP": 12,
    "description": "場に出て最初の行動時だけ成功する先制攻撃技。",
    "contact": true,
    "firstTurnOnly": true
  },
  "v7-outrage": {
    "id": "v7-outrage",
    "name": "げきりん",
    "type": "ドラゴン",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2～3ターン攻撃し続け、終了後にこんらんする。",
    "contact": true,
    "rampage": true
  },
  "v7-dragon-claw": {
    "id": "v7-dragon-claw",
    "name": "ドラゴンクロー",
    "type": "ドラゴン",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "追加効果なし。",
    "contact": true
  },
  "v7-dragon-darts": {
    "id": "v7-dragon-darts",
    "name": "ドラゴンアロー",
    "type": "ドラゴン",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2回連続で攻撃する。",
    "multiHit": [
      2,
      2
    ]
  },
  "v7-dragon-rush": {
    "id": "v7-dragon-rush",
    "name": "ドラゴンダイブ",
    "type": "ドラゴン",
    "category": "physical",
    "power": 100,
    "accuracy": 75,
    "priority": 0,
    "maxPP": 12,
    "description": "20%の確率で相手をひるませる。",
    "contact": true,
    "flinchChance": 20
  },
  "v7-scale-shot": {
    "id": "v7-scale-shot",
    "name": "スケイルショット",
    "type": "ドラゴン",
    "category": "physical",
    "power": 25,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 20,
    "description": "2～5回攻撃。命中後、自分のぼうぎょが1段階下がり、すばやさが1段階上がる。",
    "multiHit": [
      2,
      5
    ],
    "selfStatChanges": {
      "defense": -1,
      "speed": 1
    }
  },
  "v7-dragon-tail": {
    "id": "v7-dragon-tail",
    "name": "ドラゴンテール",
    "type": "ドラゴン",
    "category": "physical",
    "power": 60,
    "accuracy": 90,
    "priority": -6,
    "maxPP": 12,
    "description": "命中すると相手を控えと強制交代させる。",
    "contact": true,
    "forceSwitchOnHit": true
  },
  "v7-breaking-swipe": {
    "id": "v7-breaking-swipe",
    "name": "ワイドブレイカー",
    "type": "ドラゴン",
    "category": "physical",
    "power": 60,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のこうげきを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "attack": -1
    }
  },
  "v7-dragon-pulse": {
    "id": "v7-dragon-pulse",
    "name": "りゅうのはどう",
    "type": "ドラゴン",
    "category": "special",
    "power": 85,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "追加効果なし。",
    "pulse": true
  },
  "v7-draco-meteor": {
    "id": "v7-draco-meteor",
    "name": "りゅうせいぐん",
    "type": "ドラゴン",
    "category": "special",
    "power": 130,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、自分のとくこうが2段階下がる。",
    "selfStatChanges": {
      "specialAttack": -2
    }
  },
  "v7-beat-up": {
    "id": "v7-beat-up",
    "name": "ふくろだたき",
    "type": "あく",
    "category": "physical",
    "power": 10,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "状態異常・ひんしでない味方が順番に攻撃に参加する連続技。参加者の種族値に応じて各打撃の威力が変わる。",
    "beatUp": true
  },
  "v7-dragon-dance": {
    "id": "v7-dragon-dance",
    "name": "りゅうのまい",
    "type": "ドラゴン",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のこうげき・すばやさを1段階上げる。",
    "dance": true,
    "selfStatChanges": {
      "attack": 1,
      "speed": 1
    }
  },
  "v7-entrainment": {
    "id": "v7-entrainment",
    "name": "なかまづくり",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手の特性を自分と同じ特性にする。一部の変更できない特性には失敗する。",
    "entrainment": true
  },
  "v7-bitter-malice": {
    "id": "v7-bitter-malice",
    "name": "うらみつらみ",
    "type": "ゴースト",
    "category": "special",
    "power": 75,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手のこうげきを1段階下げる。",
    "targetStatChanges": {
      "attack": -1
    }
  },
  "v7-infernal-parade": {
    "id": "v7-infernal-parade",
    "name": "ひゃっきやこう",
    "type": "ゴースト",
    "category": "special",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 16,
    "description": "相手が状態異常なら威力が2倍。30%の確率でやけどにする。",
    "doubleIfTargetStatus": true,
    "secondaryStatus": {
      "status": "burn",
      "chance": 30
    }
  },
  "v7-soul-burst": {
    "id": "v7-soul-burst",
    "name": "ソウルバースト",
    "type": "ゴースト",
    "category": "special",
    "power": 130,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 8,
    "description": "与えたダメージの1/2を反動で受ける。マジックガードなら反動を受けない。爆発技。",
    "contact": true,
    "recoilRatio": 0.5,
    "explosive": true
  },
  "v7-hanabibana": {
    "id": "v7-hanabibana",
    "name": "はなびばな",
    "type": "ほのお",
    "category": "special",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 20,
    "description": "優先度+1の先制攻撃技。"
  },
  "v7-pumpkin-press": {
    "id": "v7-pumpkin-press",
    "name": "パンプキンプレス",
    "type": "くさ",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "自分のこうげきではなく、ぼうぎょとぼうぎょランクを使ってダメージ計算する。与えたダメージの半分を回復。",
    "contact": true,
    "useDefenseAsAttack": true,
    "drainRatio": 0.5
  },
  "v7-kurogane-agito": {
    "id": "v7-kurogane-agito",
    "name": "くろがねのアギト",
    "type": "はがね",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手のぼうぎょを1段階下げる。",
    "contact": true,
    "targetStatChanges": {
      "defense": -1
    }
  },
  "v7-jaw-lock": {
    "id": "v7-jaw-lock",
    "name": "くらいつく",
    "type": "あく",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "命中すると、どちらかが場を離れるまでお互いに交代できなくなる。",
    "contact": true,
    "bite": true,
    "jawLock": true
  },
  "v7-ice-fang": {
    "id": "v7-ice-fang",
    "name": "こおりのキバ",
    "type": "こおり",
    "category": "physical",
    "power": 65,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "10%でこおり、10%でひるみ。",
    "contact": true,
    "bite": true,
    "secondaryStatus": {
      "status": "freeze",
      "chance": 10
    },
    "flinchChance": 10
  },
  "v7-ingrain": {
    "id": "v7-ingrain",
    "name": "ねをはる",
    "type": "くさ",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "毎ターン最大HPの1/16を回復する代わりに、通常の交代ができなくなる。",
    "ingrain": true
  },
  "v7-beeline-beam": {
    "id": "v7-beeline-beam",
    "name": "ビーラインビーム",
    "type": "むし",
    "category": "special",
    "power": 100,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "タイプ相性がいまひとつの場合、威力が2倍。いろめがねと重複する。",
    "beelineBeam": true
  },
  "v7-struggle-bug": {
    "id": "v7-struggle-bug",
    "name": "むしのていこう",
    "type": "むし",
    "category": "special",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "相手のとくこうを1段階下げる。",
    "targetStatChanges": {
      "specialAttack": -1
    }
  },
  "v7-fell-stinger": {
    "id": "v7-fell-stinger",
    "name": "とどめばり",
    "type": "むし",
    "category": "physical",
    "power": 50,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "この技で相手を倒すと、自分のこうげきが3段階上がる。",
    "contact": true,
    "fellStinger": true
  },
  "v7-electroweb": {
    "id": "v7-electroweb",
    "name": "エレキネット",
    "type": "でんき",
    "category": "special",
    "power": 55,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "相手のすばやさを1段階下げる。",
    "targetStatChanges": {
      "speed": -1
    }
  },
  "v7-zing-zap": {
    "id": "v7-zing-zap",
    "name": "びりびりちくちく",
    "type": "でんき",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "30%の確率で相手をひるませる。",
    "contact": true,
    "flinchChance": 30
  },
  "v7-supercell-slam": {
    "id": "v7-supercell-slam",
    "name": "サンダーダイブ",
    "type": "でんき",
    "category": "physical",
    "power": 100,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 16,
    "description": "攻撃が失敗すると自分の最大HPの1/2を失う。",
    "contact": true,
    "crashMaxHPRatio": 0.5
  },
  "v7-aerial-ace": {
    "id": "v7-aerial-ace",
    "name": "つばめがえし",
    "type": "ひこう",
    "category": "physical",
    "power": 60,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "必ず命中する。",
    "contact": true
  },
  "v7-drill-run": {
    "id": "v7-drill-run",
    "name": "ドリルライナー",
    "type": "じめん",
    "category": "physical",
    "power": 80,
    "accuracy": 95,
    "priority": 0,
    "maxPP": 12,
    "description": "急所に当たりやすい。",
    "contact": true,
    "highCrit": true
  },
  "v7-bachibachi-barrier": {
    "id": "v7-bachibachi-barrier",
    "name": "バチバチバリア",
    "type": "でんき",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 4,
    "maxPP": 8,
    "description": "そのターン相手の技を防ぐ。接触技を防いだ場合、攻撃した相手をまひ状態にする。連続使用は成功率が下がる。",
    "protectLike": true,
    "contactParalyzeProtect": true
  },
  "v7-tail-glow": {
    "id": "v7-tail-glow",
    "name": "ほたるび",
    "type": "むし",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のとくこうを3段階上げる。",
    "selfStatChanges": {
      "specialAttack": 3
    }
  },
  "v7-golden-burn": {
    "id": "v7-golden-burn",
    "name": "ゴールデンバーン",
    "type": "ドラゴン",
    "category": "physical",
    "power": 100,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "相手の特性の影響を受けずに攻撃する。自分のこうげきととくこうの高い方に応じて物理・特殊が決まる。",
    "contact": true,
    "goldenBurn": true,
    "ignoreDefenderAbility": true
  },
  "v7-extreme-speed": {
    "id": "v7-extreme-speed",
    "name": "しんそく",
    "type": "ノーマル",
    "category": "physical",
    "power": 80,
    "accuracy": 100,
    "priority": 2,
    "maxPP": 8,
    "description": "優先度+2の先制攻撃技。",
    "contact": true
  },
  "v7-iron-tail": {
    "id": "v7-iron-tail",
    "name": "アイアンテール",
    "type": "はがね",
    "category": "physical",
    "power": 100,
    "accuracy": 75,
    "priority": 0,
    "maxPP": 16,
    "description": "30%の確率で相手のぼうぎょを1段階下げる。",
    "contact": true,
    "targetStatChangeChance": {
      "stat": "defense",
      "amount": -1,
      "chance": 30
    }
  },
  "v7-aqua-tail": {
    "id": "v7-aqua-tail",
    "name": "アクアテール",
    "type": "みず",
    "category": "physical",
    "power": 90,
    "accuracy": 90,
    "priority": 0,
    "maxPP": 12,
    "description": "追加効果なし。",
    "contact": true
  },
  "v7-seishin-toitsu": {
    "id": "v7-seishin-toitsu",
    "name": "せいしんとういつ",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 8,
    "description": "1ターン目にため、2ターン目にこうげき・ぼうぎょ・とくこう・とくぼう・すばやさを1段階ずつ上げる。パワフルハーブ対応。",
    "twoTurn": "focus",
    "selfStatChanges": {
      "attack": 1,
      "defense": 1,
      "specialAttack": 1,
      "specialDefense": 1,
      "speed": 1
    }
  },
  "v7-leer": {
    "id": "v7-leer",
    "name": "にらみつける",
    "type": "ノーマル",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 32,
    "description": "相手のぼうぎょを1段階下げる。",
    "targetStatChanges": {
      "defense": -1
    }
  },
  "v7-coil": {
    "id": "v7-coil",
    "name": "とぐろをまく",
    "type": "どく",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "自分のこうげき・ぼうぎょ・命中率を1段階上げる。",
    "selfStatChanges": {
      "attack": 1,
      "defense": 1,
      "accuracy": 1
    }
  },
  "v7-poison-fang": {
    "id": "v7-poison-fang",
    "name": "ポイズンファング",
    "type": "どく",
    "category": "physical",
    "power": 90,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "与えたダメージの3/4を回復する。かみつき技。",
    "contact": true,
    "bite": true,
    "drainRatio": 0.75
  },
  "v7-venoshock": {
    "id": "v7-venoshock",
    "name": "ベノムショック",
    "type": "どく",
    "category": "special",
    "power": 65,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手がどく・もうどく状態なら威力が2倍。",
    "venoshock": true
  },
  "v7-cross-poison": {
    "id": "v7-cross-poison",
    "name": "クロスポイズン",
    "type": "どく",
    "category": "physical",
    "power": 70,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 20,
    "description": "急所に当たりやすく、10%でどく状態にする。",
    "contact": true,
    "highCrit": true,
    "secondaryStatus": {
      "status": "poison",
      "chance": 10
    }
  },
  "v7-gunk-shot": {
    "id": "v7-gunk-shot",
    "name": "ダストシュート",
    "type": "どく",
    "category": "physical",
    "power": 120,
    "accuracy": 80,
    "priority": 0,
    "maxPP": 8,
    "description": "30%の確率で相手をどく状態にする。",
    "secondaryStatus": {
      "status": "poison",
      "chance": 30
    }
  },
  "v7-fungai": {
    "id": "v7-fungai",
    "name": "ふんがい",
    "type": "あく",
    "category": "physical",
    "power": 120,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "2～3ターン攻撃し続け、終了後にこんらんする。30%の確率でやけどにする。",
    "contact": true,
    "rampage": true,
    "secondaryStatus": {
      "status": "burn",
      "chance": 30
    }
  },
  "v7-toxic-spikes": {
    "id": "v7-toxic-spikes",
    "name": "どくびし",
    "type": "どく",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 20,
    "description": "相手の場にどくびしを設置する。最大2段。",
    "hazard": "toxicSpikes"
  },
  "v7-crescent-cutter": {
    "id": "v7-crescent-cutter",
    "name": "クレッシェントカッター",
    "type": "フェアリー",
    "category": "physical",
    "power": 40,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 20,
    "description": "優先度+1の先制攻撃技。斬る技。",
    "slicing": true
  },
  "v7-flat-tackle": {
    "id": "v7-flat-tackle",
    "name": "フラットタックル",
    "type": "じめん",
    "category": "physical",
    "power": 100,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "互いの場の設置物・壁・フィールド・ルーム系状態を解除する。天候・おいかぜは対象外。",
    "contact": true,
    "clearFieldStructures": true
  },
  "v7-sand-tomb": {
    "id": "v7-sand-tomb",
    "name": "すなじごく",
    "type": "じめん",
    "category": "physical",
    "power": 35,
    "accuracy": 85,
    "priority": 0,
    "maxPP": 16,
    "description": "4～5ターン相手を拘束して継続ダメージを与える。",
    "trapDamage": true
  },
  "v7-lunar-dance": {
    "id": "v7-lunar-dance",
    "name": "みかづきのまい",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 0,
    "maxPP": 12,
    "description": "自分はひんしになる。次に場へ出る味方のHP・状態異常・PPを完全回復する。",
    "lunarDance": true,
    "selfFaint": true
  },
  "v7-lumina-crash": {
    "id": "v7-lumina-crash",
    "name": "ルミナコリジョン",
    "type": "エスパー",
    "category": "special",
    "power": 80,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 12,
    "description": "相手のとくぼうを2段階下げる。",
    "targetStatChanges": {
      "specialDefense": -2
    }
  },
  "v7-explosion": {
    "id": "v7-explosion",
    "name": "だいばくはつ",
    "type": "ノーマル",
    "category": "physical",
    "power": 250,
    "accuracy": 100,
    "priority": 0,
    "maxPP": 8,
    "description": "使用後、自分はひんしになる。爆発技。",
    "selfFaintAfterDamage": true,
    "explosive": true
  },
  "v7-bubble-guard": {
    "id": "v7-bubble-guard",
    "name": "バブルガード",
    "type": "みず",
    "category": "status",
    "power": null,
    "accuracy": null,
    "priority": 4,
    "maxPP": 8,
    "description": "そのターン相手の技を防ぎ、自分の状態異常を回復する。連続使用は成功率が下がる。",
    "protectLike": true,
    "cureStatusOnProtect": true
  },
  "v7-telepath-jammer": {
    "id": "v7-telepath-jammer",
    "name": "テレパスジャマー",
    "type": "エスパー",
    "category": "status",
    "power": null,
    "accuracy": 100,
    "priority": 1,
    "maxPP": 12,
    "description": "相手のとくこう・とくぼうを1段階下げた後、控えと交代する。",
    "targetStatChanges": {
      "specialAttack": -1,
      "specialDefense": -1
    },
    "pivot": true
  }
});

Object.assign(ABILITY_INFO, {
  "schooling": {
    "id": "schooling",
    "name": "ぎょぐん",
    "description": "Lv.20以上でHPが1/4より多いとむれたすがた、1/4以下だとたんどくのすがたになる。変更・コピー不可。",
    "implemented": true
  },
  "power-construct": {
    "id": "power-construct",
    "name": "スワームチェンジ",
    "description": "ターン終了時、HPが半分以下ならパーフェクトフォルムへ変化する。最大HPの増加分だけ現在HPも増える。変更・コピー不可。",
    "implemented": true
  },
  "magic-guard": {
    "id": "magic-guard",
    "name": "マジックガード",
    "description": "攻撃技以外によるダメージを受けない。",
    "implemented": true
  },
  "halloween-punk": {
    "id": "halloween-punk",
    "name": "ハロウィンパンク",
    "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
    "implemented": true
  },
  "unaware": {
    "id": "unaware",
    "name": "てんねん",
    "description": "攻撃時は相手の防御側能力ランク、防御時は相手の攻撃側能力ランクを無視する。",
    "implemented": true
  },
  "tinted-lens": {
    "id": "tinted-lens",
    "name": "いろめがね",
    "description": "いまひとつの攻撃技のダメージを2倍にする。",
    "implemented": true
  },
  "good-as-gold": {
    "id": "good-as-gold",
    "name": "おうごんのからだ",
    "description": "相手から受ける変化技を無効化する。",
    "implemented": true
  },
  "adaptability": {
    "id": "adaptability",
    "name": "てきおうりょく",
    "description": "タイプ一致補正が1.5倍ではなく2倍になる。",
    "implemented": true
  },
  "water-bubble": {
    "id": "water-bubble",
    "name": "すいほう",
    "description": "みず技の威力が2倍。受けるほのお技を半減し、やけど状態にならない。",
    "implemented": true
  }
});

ITEM_DEX["mystery-candy"] = {
  "id": "mystery-candy",
  "name": "ふしぎなアメ",
  "description": "ハロウィンパンクのトリートフォルム専用。所持して場に出るとトリックフォルムへ自動変化する。消費せず、対象ポケモンからは対戦中に取り外せない。"
};

Object.assign(SPECIES_DEX, {
  "soljiend": {
    "id": "soljiend",
    "dexNo": 33,
    "name": "ソルジエンド",
    "classification": "グンタイアリポケモン",
    "height": 0.3,
    "weight": 0.5,
    "types": [
      "むし",
      "ドラゴン"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 15,
      "defense": 15,
      "specialAttack": 15,
      "specialDefense": 15,
      "speed": 90
    },
    "movePool": [
      "x-scissor",
      "megahorn",
      "v6-088",
      "leech-life",
      "v6-062",
      "u-turn",
      "v6-063",
      "v6-109",
      "v6-089",
      "v6-111",
      "v7-first-impression",
      "v6-110",
      "bug-buzz",
      "v6-061",
      "v7-outrage",
      "v7-dragon-claw",
      "v7-dragon-darts",
      "v7-dragon-rush",
      "v7-scale-shot",
      "v7-dragon-tail",
      "v7-breaking-swipe",
      "v7-dragon-pulse",
      "v7-draco-meteor",
      "crunch",
      "knock-off",
      "v7-beat-up",
      "v6-131",
      "throat-chop",
      "v6-123",
      "earthquake",
      "v6-014",
      "v6-015",
      "v6-090",
      "rock-slide",
      "v6-032",
      "iron-head",
      "brick-break",
      "superpower",
      "body-press",
      "body-slam",
      "v6-092",
      "v6-094",
      "protect",
      "v6-017",
      "v6-018",
      "swords-dance",
      "iron-defense",
      "agility",
      "v7-dragon-dance",
      "v6-125",
      "v6-124",
      "bulk-up",
      "v6-040",
      "v6-042",
      "v6-107",
      "v7-entrainment",
      "v7-ant-march"
    ],
    "abilities": [
      {
        "id": "schooling",
        "name": "ぎょぐん",
        "description": "Lv.20以上でHPが1/4より多いとむれたすがた、1/4以下だとたんどくのすがたになる。変更・コピー不可。",
        "implemented": true
      },
      {
        "id": "power-construct",
        "name": "スワームチェンジ",
        "description": "ターン終了時、HPが半分以下ならパーフェクトフォルムへ変化する。最大HPの増加分だけ現在HPも増える。変更・コピー不可。",
        "implemented": true
      }
    ],
    "formSystem": "soljiend",
    "forms": {
      "solo": {
        "name": "ソルジエンド(たんどくのすがた)",
        "height": 0.3,
        "weight": 0.5,
        "baseStats": {
          "hp": 100,
          "attack": 15,
          "defense": 15,
          "specialAttack": 15,
          "specialDefense": 15,
          "speed": 90
        }
      },
      "school": {
        "name": "ソルジエンド(むれたすがた)",
        "height": 3.0,
        "weight": 450.0,
        "baseStats": {
          "hp": 100,
          "attack": 100,
          "defense": 50,
          "specialAttack": 100,
          "specialDefense": 50,
          "speed": 100
        }
      },
      "perfect": {
        "name": "ソルジエンド(パーフェクトフォルム)",
        "height": 3.5,
        "weight": 510.3,
        "baseStats": {
          "hp": 150,
          "attack": 75,
          "defense": 125,
          "specialAttack": 75,
          "specialDefense": 125,
          "speed": 50
        }
      }
    }
  },
  "willops": {
    "id": "willops",
    "dexNo": 294,
    "name": "ウィルオプス",
    "classification": "はなびだまポケモン",
    "height": 0.3,
    "weight": 0.1,
    "types": [
      "ゴースト",
      "ほのお"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 67,
      "defense": 31,
      "specialAttack": 109,
      "specialDefense": 43,
      "speed": 149
    },
    "movePool": [
      "v7-soul-burst",
      "shadow-ball",
      "hex",
      "v7-bitter-malice",
      "v7-infernal-parade",
      "v6-067",
      "shadow-sneak",
      "v6-066",
      "v7-hanabibana",
      "flamethrower",
      "fire-blast",
      "overheat",
      "heat-wave",
      "flame-charge",
      "flare-blitz",
      "psychic",
      "dark-pulse",
      "protect",
      "v6-017",
      "v6-018",
      "v6-076",
      "will-o-wisp",
      "v6-070",
      "v6-078",
      "v6-077",
      "v6-154",
      "v6-074",
      "nasty-plot",
      "v6-075",
      "v6-024",
      "v6-164"
    ],
    "abilities": [
      {
        "id": "magic-guard",
        "name": "マジックガード",
        "description": "攻撃技以外によるダメージを受けない。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "ウィルオプス(トリートフォルム)",
        "height": 0.3,
        "weight": 0.1,
        "baseStats": {
          "hp": 100,
          "attack": 67,
          "defense": 31,
          "specialAttack": 109,
          "specialDefense": 43,
          "speed": 149
        }
      },
      "trick": {
        "name": "ウィルオプス(トリックフォルム)",
        "height": 0.5,
        "weight": 0.1,
        "baseStats": {
          "hp": 100,
          "attack": 83,
          "defense": 53,
          "specialAttack": 137,
          "specialDefense": 59,
          "speed": 167
        }
      }
    }
  },
  "papigator": {
    "id": "papigator",
    "dexNo": 295,
    "name": "パピゲーター",
    "classification": "かぼちゃワニポケモン",
    "height": 2.1,
    "weight": 303.0,
    "types": [
      "くさ",
      "はがね"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 67,
      "defense": 149,
      "specialAttack": 43,
      "specialDefense": 109,
      "speed": 31
    },
    "movePool": [
      "v7-pumpkin-press",
      "v6-002",
      "wood-hammer",
      "v6-100",
      "v6-004",
      "v6-005",
      "v6-135",
      "leaf-storm",
      "v7-kurogane-agito",
      "iron-head",
      "v6-097",
      "v6-096",
      "v6-126",
      "flash-cannon",
      "v6-098",
      "v6-090",
      "crunch",
      "v7-jaw-lock",
      "v6-034",
      "v6-027",
      "v6-033",
      "v7-ice-fang",
      "v7-dragon-tail",
      "v7-outrage",
      "rock-slide",
      "body-press",
      "body-slam",
      "v6-094",
      "sludge-bomb",
      "surf",
      "protect",
      "v6-017",
      "v6-018",
      "v6-019",
      "iron-defense",
      "v6-076",
      "synthesis",
      "leech-seed",
      "v6-021",
      "v7-ingrain",
      "v6-026",
      "v6-101",
      "v6-102",
      "v6-103",
      "v6-042",
      "v6-022",
      "v6-134"
    ],
    "abilities": [
      {
        "id": "unaware",
        "name": "てんねん",
        "description": "攻撃時は相手の防御側能力ランク、防御時は相手の攻撃側能力ランクを無視する。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "パピゲーター(トリートフォルム)",
        "height": 2.1,
        "weight": 303.0,
        "baseStats": {
          "hp": 100,
          "attack": 67,
          "defense": 149,
          "specialAttack": 43,
          "specialDefense": 109,
          "speed": 31
        }
      },
      "trick": {
        "name": "パピゲーター(トリックフォルム)",
        "height": 3.6,
        "weight": 505.0,
        "baseStats": {
          "hp": 100,
          "attack": 83,
          "defense": 167,
          "specialAttack": 59,
          "specialDefense": 137,
          "speed": 53
        }
      }
    }
  },
  "fornet": {
    "id": "fornet",
    "dexNo": 296,
    "name": "フォーネット",
    "classification": "ランタンばちポケモン",
    "height": 0.6,
    "weight": 15.2,
    "types": [
      "むし",
      "でんき"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 43,
      "defense": 67,
      "specialAttack": 149,
      "specialDefense": 31,
      "speed": 109
    },
    "movePool": [
      "v7-beeline-beam",
      "bug-buzz",
      "pollen-puff",
      "v7-struggle-bug",
      "v6-061",
      "u-turn",
      "x-scissor",
      "leech-life",
      "v6-062",
      "v6-109",
      "v6-111",
      "v7-fell-stinger",
      "thunderbolt",
      "thunder",
      "discharge",
      "volt-switch",
      "v7-electroweb",
      "charge-beam",
      "v6-170",
      "wild-charge",
      "v7-zing-zap",
      "v7-supercell-slam",
      "air-slash",
      "v7-aerial-ace",
      "v6-123",
      "sludge-bomb",
      "v6-054",
      "energy-ball",
      "dazzling-gleam",
      "mystical-fire",
      "dark-pulse",
      "knock-off",
      "v6-131",
      "v7-drill-run",
      "flash-cannon",
      "protect",
      "v6-017",
      "v6-018",
      "v7-bachibachi-barrier",
      "agility",
      "thunder-wave",
      "v6-086",
      "v6-184",
      "v6-182",
      "v6-081",
      "v6-069",
      "v6-040",
      "v6-073",
      "v6-080",
      "v6-107",
      "roost",
      "v6-104",
      "v7-tail-glow"
    ],
    "abilities": [
      {
        "id": "tinted-lens",
        "name": "いろめがね",
        "description": "いまひとつの攻撃技のダメージを2倍にする。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "フォーネット(トリートフォルム)",
        "height": 0.6,
        "weight": 15.2,
        "baseStats": {
          "hp": 100,
          "attack": 43,
          "defense": 67,
          "specialAttack": 149,
          "specialDefense": 31,
          "speed": 109
        }
      },
      "trick": {
        "name": "フォーネット(トリックフォルム)",
        "height": 0.8,
        "weight": 25.2,
        "baseStats": {
          "hp": 100,
          "attack": 59,
          "defense": 83,
          "specialAttack": 167,
          "specialDefense": 53,
          "speed": 137
        }
      }
    }
  },
  "gyarihoko": {
    "id": "gyarihoko",
    "dexNo": 297,
    "name": "ギャリホコ",
    "classification": "きんうろこポケモン",
    "height": 3.0,
    "weight": 115.0,
    "types": [
      "ドラゴン",
      "ノーマル"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 149,
      "defense": 31,
      "specialAttack": 109,
      "specialDefense": 43,
      "speed": 67
    },
    "movePool": [
      "v7-golden-burn",
      "v7-outrage",
      "v7-dragon-rush",
      "v7-dragon-claw",
      "v7-scale-shot",
      "v7-dragon-tail",
      "v7-breaking-swipe",
      "v7-dragon-pulse",
      "v7-draco-meteor",
      "v6-092",
      "body-slam",
      "v6-093",
      "v6-094",
      "v7-extreme-speed",
      "hyper-voice",
      "v6-167",
      "iron-head",
      "v7-iron-tail",
      "v6-096",
      "earthquake",
      "v6-014",
      "v6-015",
      "stone-edge",
      "rock-slide",
      "v6-032",
      "crunch",
      "knock-off",
      "v6-131",
      "v6-034",
      "v6-027",
      "v6-033",
      "v7-ice-fang",
      "v7-aqua-tail",
      "wild-charge",
      "flare-blitz",
      "flamethrower",
      "fire-blast",
      "thunderbolt",
      "thunder",
      "ice-beam",
      "v6-010",
      "surf",
      "hydro-pump",
      "flash-cannon",
      "power-gem",
      "dark-pulse",
      "psychic",
      "flip-turn",
      "protect",
      "v6-017",
      "v6-018",
      "v7-seishin-toitsu",
      "v6-019",
      "v7-dragon-dance",
      "swords-dance",
      "bulk-up",
      "iron-defense",
      "v6-076",
      "agility",
      "v6-124",
      "v6-040",
      "v6-022",
      "v6-042",
      "v6-082",
      "v7-leer",
      "v6-106",
      "calm-mind",
      "v6-056",
      "nasty-plot",
      "v7-coil",
      "v6-143"
    ],
    "abilities": [
      {
        "id": "good-as-gold",
        "name": "おうごんのからだ",
        "description": "相手から受ける変化技を無効化する。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "ギャリホコ(トリートフォルム)",
        "height": 3.0,
        "weight": 115.0,
        "baseStats": {
          "hp": 100,
          "attack": 149,
          "defense": 31,
          "specialAttack": 109,
          "specialDefense": 43,
          "speed": 67
        }
      },
      "trick": {
        "name": "ギャリホコ(トリックフォルム)",
        "height": 3.2,
        "weight": 155.0,
        "baseStats": {
          "hp": 100,
          "attack": 167,
          "defense": 53,
          "specialAttack": 137,
          "specialDefense": 59,
          "speed": 83
        }
      }
    }
  },
  "battraun": {
    "id": "battraun",
    "dexNo": 298,
    "name": "バットラウン",
    "classification": "おうコウモリポケモン",
    "height": 0.5,
    "weight": 16.0,
    "types": [
      "どく",
      "あく"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 109,
      "defense": 67,
      "specialAttack": 31,
      "specialDefense": 149,
      "speed": 43
    },
    "movePool": [
      "v7-poison-fang",
      "v7-venoshock",
      "v6-123",
      "v7-cross-poison",
      "v7-gunk-shot",
      "sludge-bomb",
      "v6-113",
      "v6-054",
      "v7-fungai",
      "v7-jaw-lock",
      "crunch",
      "throat-chop",
      "v6-131",
      "knock-off",
      "v6-068",
      "dark-pulse",
      "leech-life",
      "u-turn",
      "v6-027",
      "v7-ice-fang",
      "v6-033",
      "v6-049",
      "air-slash",
      "protect",
      "v6-017",
      "v6-018",
      "v6-056",
      "roost",
      "toxic",
      "v7-toxic-spikes",
      "v6-040",
      "parting-shot"
    ],
    "abilities": [
      {
        "id": "levitate",
        "name": "ふゆう",
        "description": "じめん技を無効化。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "バットラウン(トリート)",
        "height": 0.5,
        "weight": 16.0,
        "baseStats": {
          "hp": 100,
          "attack": 109,
          "defense": 67,
          "specialAttack": 31,
          "specialDefense": 149,
          "speed": 43
        }
      },
      "trick": {
        "name": "バットラウン(トリック)",
        "height": 0.8,
        "weight": 25.0,
        "baseStats": {
          "hp": 100,
          "attack": 137,
          "defense": 83,
          "specialAttack": 53,
          "specialDefense": 167,
          "speed": 59
        }
      }
    }
  },
  "mikazukiruka": {
    "id": "mikazukiruka",
    "dexNo": 299,
    "name": "ミカヅキルカ",
    "classification": "すなイルカポケモン",
    "height": 1.3,
    "weight": 60.0,
    "types": [
      "フェアリー",
      "じめん"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 109,
      "defense": 43,
      "specialAttack": 31,
      "specialDefense": 67,
      "speed": 149
    },
    "movePool": [
      "play-rough",
      "moonblast",
      "dazzling-gleam",
      "v7-crescent-cutter",
      "v7-flat-tackle",
      "earthquake",
      "v6-015",
      "high-horsepower",
      "v7-sand-tomb",
      "v6-090",
      "v6-091",
      "wave-crash",
      "wild-charge",
      "v6-092",
      "v6-098",
      "protect",
      "v6-017",
      "v6-018",
      "v6-056",
      "calm-mind",
      "bulk-up",
      "v6-044",
      "v6-043",
      "moonlight",
      "v7-lunar-dance"
    ],
    "abilities": [
      {
        "id": "adaptability",
        "name": "てきおうりょく",
        "description": "タイプ一致補正が1.5倍ではなく2倍になる。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "ミカヅキルカ(トリートフォルム)",
        "height": 1.3,
        "weight": 60.0,
        "baseStats": {
          "hp": 100,
          "attack": 109,
          "defense": 43,
          "specialAttack": 31,
          "specialDefense": 67,
          "speed": 149
        }
      },
      "trick": {
        "name": "ミカヅキルカ(トリックフォルム)",
        "height": 1.4,
        "weight": 72.0,
        "baseStats": {
          "hp": 100,
          "attack": 137,
          "defense": 59,
          "specialAttack": 53,
          "specialDefense": 83,
          "speed": 167
        }
      }
    }
  },
  "wanyudoro": {
    "id": "wanyudoro",
    "dexNo": 300,
    "name": "ワニュードロ",
    "classification": "わにゅうどうポケモン",
    "height": 1.8,
    "weight": 50.2,
    "types": [
      "エスパー",
      "みず"
    ],
    "baseStats": {
      "hp": 100,
      "attack": 43,
      "defense": 31,
      "specialAttack": 67,
      "specialDefense": 149,
      "speed": 109
    },
    "movePool": [
      "wave-crash",
      "liquidation",
      "flip-turn",
      "hydro-pump",
      "scald",
      "chilling-water",
      "v7-lumina-crash",
      "psychic",
      "psyshock",
      "v6-052",
      "zen-headbutt",
      "energy-ball",
      "dazzling-gleam",
      "play-rough",
      "v6-113",
      "sludge-bomb",
      "dark-pulse",
      "shadow-ball",
      "v7-explosion",
      "protect",
      "v6-017",
      "v6-018",
      "v6-056",
      "calm-mind",
      "v6-059",
      "v7-bubble-guard",
      "v6-082",
      "v6-081",
      "v7-telepath-jammer"
    ],
    "abilities": [
      {
        "id": "water-bubble",
        "name": "すいほう",
        "description": "みず技の威力が2倍。受けるほのお技を半減し、やけど状態にならない。",
        "implemented": true
      },
      {
        "id": "halloween-punk",
        "name": "ハロウィンパンク",
        "description": "トリートフォルムでは毎ターン終了時、お互いのA/B/C/D/Sのうち1つが上がり別の1つが下がる。ふしぎなアメ所持で登場するとトリックフォルムに変化し、ランク変動効果はなくなる。",
        "implemented": true
      }
    ],
    "formSystem": "halloween",
    "forms": {
      "treat": {
        "name": "ワニュードロ(トリートフォルム)",
        "height": 1.8,
        "weight": 50.2,
        "baseStats": {
          "hp": 100,
          "attack": 43,
          "defense": 31,
          "specialAttack": 67,
          "specialDefense": 149,
          "speed": 109
        }
      },
      "trick": {
        "name": "ワニュードロ(トリックフォルム)",
        "height": 1.9,
        "weight": 53.0,
        "baseStats": {
          "hp": 100,
          "attack": 59,
          "defense": 53,
          "specialAttack": 83,
          "specialDefense": 167,
          "speed": 137
        }
      }
    }
  }
});

const V7_NEW_SPECIES_IDS = ["soljiend", "willops", "papigator", "fornet", "gyarihoko", "battraun", "mikazukiruka", "wanyudoro"];

const V7_UNCHANGEABLE_ABILITY_IDS = new Set(["schooling", "power-construct"]);

// v7 相手AI用サンプルセット。実際の編成では全技・全特性から自由選択できる。
if (typeof ENEMY_SET_LIBRARY !== "undefined") {
  const v7sp = (speciesId, abilityId, itemId, nature, stats, moveNames) => ({
    speciesId, abilityId, itemId, nature,
    statPoints: stats,
    moves: moveNames.map(name => Object.values(MOVE_DEX).find(m => m.name === name)?.id).filter(Boolean)
  });
  ENEMY_SET_LIBRARY.push(
    v7sp("soljiend", "schooling", "leftovers", "ようき", {hp:2,attack:32,defense:0,specialAttack:0,specialDefense:0,speed:32}, ["であいがしら","げきりん","とんぼがえり","りゅうのまい"]),
    v7sp("willops", "halloween-punk", "mystery-candy", "おくびょう", {hp:2,attack:0,defense:0,specialAttack:32,specialDefense:0,speed:32}, ["ソウルバースト","はなびばな","シャドーボール","わるだくみ"]),
    v7sp("papigator", "unaware", "none", "わんぱく", {hp:32,attack:2,defense:32,specialAttack:0,specialDefense:0,speed:0}, ["パンプキンプレス","くろがねのアギト","やどりぎのタネ","こうごうせい"]),
    v7sp("fornet", "tinted-lens", "none", "おくびょう", {hp:2,attack:0,defense:0,specialAttack:32,specialDefense:0,speed:32}, ["ビーラインビーム","10まんボルト","エレキネット","ほたるび"]),
    v7sp("gyarihoko", "good-as-gold", "none", "ようき", {hp:2,attack:32,defense:0,specialAttack:0,specialDefense:0,speed:32}, ["ゴールデンバーン","しんそく","じしん","りゅうのまい"]),
    v7sp("battraun", "levitate", "none", "しんちょう", {hp:32,attack:2,defense:0,specialAttack:0,specialDefense:32,speed:0}, ["ポイズンファング","ふんがい","はたきおとす","すてゼリフ"]),
    v7sp("mikazukiruka", "adaptability", "none", "ようき", {hp:2,attack:32,defense:0,specialAttack:0,specialDefense:0,speed:32}, ["クレッシェントカッター","フラットタックル","じゃれつく","ステルスロック"]),
    v7sp("wanyudoro", "water-bubble", "none", "おくびょう", {hp:2,attack:0,defense:0,specialAttack:32,specialDefense:0,speed:32}, ["ハイドロポンプ","ルミナコリジョン","バブルガード","テレパスジャマー"])
  );
}

// v11: shared read-only data surface for Web Workers / research tools.
// The main battle runtime still uses the lexical constants above directly.
globalThis.NIWARA_DATA = Object.freeze({
  LEVEL,
  STAT_LABELS,
  STAT_JP,
  WEATHER_NAMES,
  STATUS_NAMES,
  MOVE_DEX,
  ITEM_DEX,
  NATURES,
  SPECIES_DEX,
  TYPE_CHART
});
