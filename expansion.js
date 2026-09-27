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
