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
    "maxPP": 8,
    "description": "3ターン、相手に最後に使った技を繰り返させる。",
    "encoreTurns": 3
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
    "description": "相手が攻撃技を選んでいる時だけ成功する。",
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
