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
