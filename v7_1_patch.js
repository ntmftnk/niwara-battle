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
