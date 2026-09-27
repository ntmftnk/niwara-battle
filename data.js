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
