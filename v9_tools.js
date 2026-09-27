// ============================================================
// ニワラバトル v9.1.5 utility tools
// - 図鑑
// - ダメージ計算シミュレーター
// - 素早さ比較ツール
// ============================================================
(function(){
  "use strict";

  const $=id=>document.getElementById(id);
  const pokedexModal=$("pokedex-modal"), pokedexList=$("pokedex-list"), pokedexDetail=$("pokedex-detail"), pokedexSearch=$("pokedex-search");
  const damageModal=$("damage-calc-modal"), damageResult=$("damage-result");
  const speedModal=$("speed-check-modal"), speedResult=$("speed-result");
  let selectedSpeciesId=Object.values(SPECIES_DEX).sort((a,b)=>(a.dexNo||9999)-(b.dexNo||9999))[0]?.id||null;

  // v9.1.2: iOS/PWA で body を position:fixed にすると、fixed 子要素の座標が
  // スクロール量や safe-area の影響でずれる場合があるため、その方式を廃止する。
  // html/body の overflow を止め、document レベルの touch/wheel ガードで
  // 開いている utility modal の外へスクロールを連鎖させない。
  const managedOpenModals=new Set();
  let lockedScrollY=0;
  let touchX=0,touchY=0;

  function activeUtilityModal(){
    const list=Array.from(managedOpenModals);
    return list.length?list[list.length-1]:null;
  }
  function lockPageScroll(){
    if(managedOpenModals.size!==1)return;
    lockedScrollY=window.scrollY||window.pageYOffset||0;
    document.documentElement.classList.add("utility-modal-open");
    document.body.classList.add("utility-modal-open");
  }
  function unlockPageScroll(){
    if(managedOpenModals.size!==0)return;
    document.documentElement.classList.remove("utility-modal-open");
    document.body.classList.remove("utility-modal-open");
    // iOS の慣性スクロール等で万一位置が動いても、開く前の位置へ戻す。
    requestAnimationFrame(()=>window.scrollTo(0,lockedScrollY));
  }
  function canScrollInDirection(node,dx,dy){
    if(!node)return false;
    const vertical=node.scrollHeight>node.clientHeight+1;
    const horizontal=node.scrollWidth>node.clientWidth+1;
    if(Math.abs(dx)>Math.abs(dy) && horizontal){
      if(dx<0 && node.scrollLeft+node.clientWidth<node.scrollWidth-1)return true;
      if(dx>0 && node.scrollLeft>1)return true;
    }
    if(vertical){
      if(dy<0 && node.scrollTop+node.clientHeight<node.scrollHeight-1)return true;
      if(dy>0 && node.scrollTop>1)return true;
    }
    return false;
  }
  function utilityTouchStart(e){
    if(!activeUtilityModal()||!e.touches?.length)return;
    touchX=e.touches[0].clientX;
    touchY=e.touches[0].clientY;
  }
  function utilityTouchMove(e){
    const modal=activeUtilityModal();
    if(!modal||!e.touches?.length)return;
    if(!modal.contains(e.target)){e.preventDefault();return;}
    const x=e.touches[0].clientX,y=e.touches[0].clientY;
    const dx=x-touchX,dy=y-touchY;
    touchX=x;touchY=y;
    // 本文・図鑑リスト・技表のうち、実際にその方向へまだスクロールできる
    // 要素がある場合だけネイティブスクロールを許可する。
    let node=e.target instanceof Element?e.target:null;
    while(node&&node!==modal){
      if(node.matches?.('[data-utility-scroll],.pokedex-list,.dex-move-table-wrap') && canScrollInDirection(node,dx,dy))return;
      node=node.parentElement;
    }
    // 上端/下端に達した後のスワイプを背景へ渡さない。
    e.preventDefault();
  }
  function utilityWheel(e){
    const modal=activeUtilityModal();
    if(!modal)return;
    if(!modal.contains(e.target)){e.preventDefault();return;}
    let node=e.target instanceof Element?e.target:null;
    const dx=-e.deltaX,dy=-e.deltaY;
    while(node&&node!==modal){
      if(node.matches?.('[data-utility-scroll],.pokedex-list,.dex-move-table-wrap') && canScrollInDirection(node,dx,dy))return;
      node=node.parentElement;
    }
    e.preventDefault();
  }
  document.addEventListener("touchstart",utilityTouchStart,{capture:true,passive:true});
  document.addEventListener("touchmove",utilityTouchMove,{capture:true,passive:false});
  document.addEventListener("wheel",utilityWheel,{capture:true,passive:false});

  function openModal(el){
    if(!el)return;
    const wasOpen=!el.classList.contains("hidden");
    el.classList.remove("hidden");
    el.setAttribute("aria-hidden","false");
    if(!wasOpen){managedOpenModals.add(el);lockPageScroll();}
    const scroller=el.querySelector("[data-utility-scroll]");
    if(scroller)scroller.scrollTop=0;
    const list=el.querySelector(".pokedex-list");
    if(list)list.scrollTop=0;
  }
  function closeModal(el){
    if(!el)return;
    const wasOpen=!el.classList.contains("hidden");
    el.classList.add("hidden");
    el.setAttribute("aria-hidden","true");
    if(wasOpen){managedOpenModals.delete(el);unlockPageScroll();}
  }
  // v9.1.5: 他のパッチからも同じiOS/PWA安全モーダル管理を利用できるよう公開。
  window.v9OpenUtilityModal=openModal;
  window.v9CloseUtilityModal=closeModal;
  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function catName(c){return c==="physical"?"物理":c==="special"?"特殊":"変化";}
  const statPairs=[["hp","H"],["attack","A"],["defense","B"],["specialAttack","C"],["specialDefense","D"],["speed","S"]];

  function speciesSorted(){return Object.values(SPECIES_DEX).slice().sort((a,b)=>(a.dexNo??9999)-(b.dexNo??9999)||a.name.localeCompare(b.name,"ja"));}
  function renderDexList(){
    if(!pokedexList)return;
    const q=(pokedexSearch?.value||"").trim().toLowerCase();
    const rows=speciesSorted().filter(s=>!q||s.name.toLowerCase().includes(q)||String(s.dexNo??"").includes(q)||s.id.toLowerCase().includes(q));
    pokedexList.innerHTML="";
    rows.forEach(s=>{const b=document.createElement("button");b.type="button";b.className=`ghost-button pokedex-entry${s.id===selectedSpeciesId?" active":""}`;b.textContent=`No.${String(s.dexNo??"-").padStart(3,"0")} ${s.name}`;b.addEventListener("click",()=>{selectedSpeciesId=s.id;renderDexList();renderDexDetail();});pokedexList.appendChild(b);});
    if(!rows.length)pokedexList.innerHTML='<div class="notice">該当するポケモンがいません。</div>';
  }
  function renderDexDetail(){
    if(!pokedexDetail)return;const s=SPECIES_DEX[selectedSpeciesId];if(!s){pokedexDetail.textContent="ポケモンを選択してください。";return;}
    const total=Object.values(s.baseStats).reduce((a,b)=>a+b,0);
    const stats=[...statPairs.map(([k,l])=>`<div class="dex-stat"><span>${l}</span><strong>${s.baseStats[k]}</strong></div>`),`<div class="dex-stat"><span>合計</span><strong>${total}</strong></div>`].join("");
    const abilities=s.abilities.map(a=>`<div class="dex-ability"><strong>${esc(a.name)}</strong><div>${esc(a.description||"説明なし")}</div></div>`).join("");
    const moves=s.movePool.map(id=>MOVE_DEX[id]).filter(Boolean).slice().sort((a,b)=>a.type.localeCompare(b.type,"ja")||a.name.localeCompare(b.name,"ja"));
    const moveRows=moves.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.type)}</td><td>${catName(m.category)}</td><td>${m.power??"-"}</td><td>${m.accuracy??"-"}</td><td>${m.maxPP??"-"}</td><td>${esc(m.description||"")}</td></tr>`).join("");
    pokedexDetail.innerHTML=`
      <div class="dex-head"><div><div class="dex-number">No.${String(s.dexNo??"-").padStart(3,"0")}</div><h2>${esc(s.name)}</h2><div>${s.types.map(esc).join(" / ")}${s.classification?`　${esc(s.classification)}`:""}</div></div><div>${s.height!=null?`高さ ${s.height}m`:""}${s.weight!=null?`　重さ ${s.weight}kg`:""}</div></div>
      <h3>種族値</h3><div class="dex-stat-grid">${stats}</div>
      <h3>特性</h3><div class="dex-ability-list">${abilities}</div>
      <h3>覚える技 <span class="view-note">${moves.length}種</span></h3>
      <div class="dex-move-table-wrap"><table class="dex-move-table"><thead><tr><th>技</th><th>タイプ</th><th>分類</th><th>威力</th><th>命中</th><th>PP</th><th>効果</th></tr></thead><tbody>${moveRows}</tbody></table></div>`;
  }
  function openDex(){renderDexList();renderDexDetail();openModal(pokedexModal);if(window.matchMedia?.("(pointer:fine)").matches&&window.innerWidth>760)pokedexSearch?.focus();}

  const ids={
    atkSpecies:$("damage-atk-species"),atkAbility:$("damage-atk-ability"),atkItem:$("damage-atk-item"),atkNature:$("damage-atk-nature"),atkHp:$("damage-atk-hp"),atkPoints:$("damage-atk-points"),atkStage:$("damage-atk-stage"),move:$("damage-move"),
    defSpecies:$("damage-def-species"),defAbility:$("damage-def-ability"),defItem:$("damage-def-item"),defNature:$("damage-def-nature"),defHp:$("damage-def-hp"),defPoints:$("damage-def-points"),defStage:$("damage-def-stage"),critical:$("damage-critical")
  };
  const damageLoadNotes={atk:$("damage-atk-load-note"),def:$("damage-def-load-note")};
  let loadedBattleSnapshots={atk:null,def:null};

  function option(value,label){const o=document.createElement("option");o.value=value;o.textContent=label;return o;}
  function populateBaseSelects(){
    const sp=speciesSorted();[ids.atkSpecies,ids.defSpecies].forEach(sel=>{if(!sel)return;sel.innerHTML="";sp.forEach(s=>sel.appendChild(option(s.id,`No.${String(s.dexNo??"-").padStart(3,"0")} ${s.name}`)));});
    const items=Object.values(ITEM_DEX).filter(i=>i.id!=="none").slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));[ids.atkItem,ids.defItem].forEach(sel=>{if(!sel)return;sel.innerHTML="";sel.appendChild(option("","持ち物を仮定して選択…"));sel.appendChild(option("none","なし"));items.forEach(i=>sel.appendChild(option(i.id,i.name)));sel.value="none";});
    [ids.atkNature,ids.defNature].forEach(sel=>{if(!sel)return;sel.innerHTML="";sel.appendChild(option("","性格を仮定して選択…"));Object.keys(NATURES).forEach(n=>sel.appendChild(option(n,n)));sel.value="まじめ";});
    [ids.atkStage,ids.defStage].forEach(sel=>{if(!sel)return;sel.innerHTML="";for(let i=-6;i<=6;i++)sel.appendChild(option(String(i),i>0?`+${i}`:String(i)));sel.value="0";});
    [[ids.atkPoints,"atk"],[ids.defPoints,"def"]].forEach(([wrap,prefix])=>{if(!wrap)return;wrap.innerHTML="";statPairs.forEach(([key,label])=>{const l=document.createElement("label");l.innerHTML=`<span>${label}</span><input type="number" min="0" max="32" value="0" data-dmg-side="${prefix}" data-stat="${key}" aria-label="${prefix} ${label}能力P">`;wrap.appendChild(l);});});
    if(ids.atkSpecies&&ids.defSpecies){ids.atkSpecies.value=sp[0]?.id||"";ids.defSpecies.value=sp[1]?.id||sp[0]?.id||"";refreshSide("atk");refreshSide("def");}
  }
  function sideSpecies(side){return SPECIES_DEX[ids[side+"Species"]?.value];}
  function prependUnknownOption(sel,label){
    if(!sel)return;
    let o=[...sel.options].find(x=>x.value==="");
    if(!o){o=option("",label);sel.insertBefore(o,sel.firstChild);}else o.textContent=label;
    sel.value="";
  }
  function refreshSide(side){
    const s=sideSpecies(side),abil=ids[side+"Ability"];if(!s||!abil)return;const prev=abil.value;abil.innerHTML="";s.abilities.forEach(a=>abil.appendChild(option(a.id,a.name)));if([...abil.options].some(o=>o.value===prev))abil.value=prev;
    if(side==="atk"){
      const prevMove=ids.move.value;ids.move.innerHTML="";ids.move.appendChild(option("","技を選択…"));
      s.movePool.map(id=>MOVE_DEX[id]).filter(Boolean).forEach(m=>ids.move.appendChild(option(m.id,`${m.name}（${m.type}/${catName(m.category)}）`)));
      if([...ids.move.options].some(o=>o.value===prevMove))ids.move.value=prevMove;else ids.move.value="";
    }
  }
  function collectPoints(side){const out={};document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>out[i.dataset.stat]=Math.max(0,Math.min(32,Number(i.value)||0)));return out;}
  function pointsTotal(p){return Object.values(p).reduce((a,b)=>a+b,0);}
  function makeSet(side){
    const s=sideSpecies(side);if(!s)throw new Error(`${side==="atk"?"攻撃側":"防御側"}のポケモンを選んでください。`);
    const abilityId=ids[side+"Ability"].value,itemId=ids[side+"Item"].value,nature=ids[side+"Nature"].value;
    if(!abilityId)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の特性は非公開です。計算上の仮定を選んでください。`);
    if(!itemId)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の持ち物は非公開です。「なし」を含め、計算上の仮定を選んでください。`);
    if(!nature)throw new Error(`${side==="atk"?"攻撃側":"防御側"}の性格は非公開です。計算上の仮定を選んでください。`);
    const moveId=side==="atk"?ids.move.value:s.movePool[0];
    return{speciesId:s.id,abilityId,itemId,nature,statPoints:collectPoints(side),moves:[moveId].filter(Boolean)};
  }
  function setPoints(side,points,privateInfo){
    document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>{
      i.value=privateInfo?String(points?.[i.dataset.stat]??0):"";
      i.placeholder=privateInfo?"0":"0（仮定）";
    });
  }
  function setKnownOrUnknown(select,value,unknownLabel){
    if(value&&[...select.options].some(o=>o.value===value)){select.value=value;return true;}
    prependUnknownOption(select,unknownLabel);return false;
  }
  function setLoadNote(side,snapshot){
    const el=damageLoadNotes[side];if(!el)return;
    el.classList.toggle("is-private",Boolean(snapshot?.privateInfo));
    el.classList.toggle("is-public",Boolean(snapshot&&!snapshot.privateInfo));
    if(!snapshot){el.textContent="";return;}
    if(snapshot.privateInfo){el.textContent="自分側の非公開情報を含めて現在値を反映しました。";return;}
    const known=[];if(snapshot.abilityId)known.push("特性");if(snapshot.itemId)known.push("持ち物");if(snapshot.moveIds?.length)known.push("技");
    el.textContent=`相手側は公開情報のみ反映：HP%・能力ランク${known.length?`・公開済み${known.join("/ ")}`:""}。能力Pと性格、未公開の特性・持ち物・技は取得していません。空欄の能力Pは計算時0として扱います。`;
  }
  function selectSnapshotMove(snapshot){
    if(!snapshot||!ids.move)return false;
    const id=(snapshot.moveIds||[]).find(moveId=>[...ids.move.options].some(o=>o.value===moveId));
    ids.move.value=id||"";return Boolean(id);
  }
  function setSideFromSnapshot(side,snapshot){
    if(!snapshot)return;
    ids[side+"Species"].value=snapshot.speciesId;refreshSide(side);
    if(snapshot.abilityId)setKnownOrUnknown(ids[side+"Ability"],snapshot.abilityId,"特性は未公開（仮定して選択）");else prependUnknownOption(ids[side+"Ability"],"特性は未公開（仮定して選択）");
    if(snapshot.itemId&&[...ids[side+"Item"].options].some(o=>o.value===snapshot.itemId))ids[side+"Item"].value=snapshot.itemId;else ids[side+"Item"].value="";
    ids[side+"Nature"].value=snapshot.nature&&NATURES[snapshot.nature]?snapshot.nature:"";
    ids[side+"Hp"].value=Math.max(1,Math.min(100,Number(snapshot.hpPercent)||100));
    setPoints(side,snapshot.statPoints,snapshot.privateInfo);
    loadedBattleSnapshots[side]=snapshot;
    if(side==="atk")selectSnapshotMove(snapshot);
    setLoadNote(side,snapshot);
  }
  function syncLoadedStagesToMove(){
    const move=MOVE_DEX[ids.move?.value];if(!move||move.category==="status")return;
    const atkStat=move.category==="physical"?"attack":"specialAttack",defStat=move.category==="physical"?"defense":"specialDefense";
    const a=loadedBattleSnapshots.atk,d=loadedBattleSnapshots.def;
    if(a?.stages&&Number.isFinite(Number(a.stages[atkStat])))ids.atkStage.value=String(a.stages[atkStat]);
    if(d?.stages&&Number.isFinite(Number(d.stages[defStat])))ids.defStage.value=String(d.stages[defStat]);
  }
  function loadCurrent(){
    try{
      const ctx=window.__PBV8GetDamageBattleContext?.();if(!ctx?.player||!ctx?.enemy)throw new Error("対戦中の公開情報を取得できません");
      loadedBattleSnapshots={atk:null,def:null};
      setSideFromSnapshot("atk",ctx.player);setSideFromSnapshot("def",ctx.enemy);syncLoadedStagesToMove();
      const perspective=ctx.privateSide==="player"?"プレイヤーA":ctx.privateSide==="enemy"?"プレイヤーB":"公開視点";
      damageResult.textContent=`現在の対面を${perspective}基準で読み込みました。相手の非公開情報は読み込んでいません。必要な非公開項目は仮定して選択してください。`;
    }catch(e){console.warn(e);damageResult.textContent="対戦中の公開情報を取得できません。編成画面では手動で条件を指定してください。";}
  }
  function readSideForm(side){
    const pts={};document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>pts[i.dataset.stat]=i.value);
    return{speciesId:ids[side+"Species"].value,abilityId:ids[side+"Ability"].value,itemId:ids[side+"Item"].value,nature:ids[side+"Nature"].value,hp:ids[side+"Hp"].value,stage:ids[side+"Stage"].value,points:pts};
  }
  function applySideForm(side,state){
    ids[side+"Species"].value=state.speciesId;refreshSide(side);
    if(state.abilityId&&[...ids[side+"Ability"].options].some(o=>o.value===state.abilityId))ids[side+"Ability"].value=state.abilityId;else prependUnknownOption(ids[side+"Ability"],"特性を仮定して選択…");
    ids[side+"Item"].value=[...ids[side+"Item"].options].some(o=>o.value===state.itemId)?state.itemId:"";
    ids[side+"Nature"].value=[...ids[side+"Nature"].options].some(o=>o.value===state.nature)?state.nature:"";
    ids[side+"Hp"].value=state.hp;
    ids[side+"Stage"].value=state.stage;
    document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>i.value=state.points[i.dataset.stat]??"");
  }
  function swapDamageSides(){
    const a=readSideForm("atk"),d=readSideForm("def"),oldMove=ids.move.value;
    const aSnap=loadedBattleSnapshots.atk,dSnap=loadedBattleSnapshots.def;
    const aNote=damageLoadNotes.atk?.textContent||"",dNote=damageLoadNotes.def?.textContent||"";
    const aClass=damageLoadNotes.atk?.className||"damage-load-note",dClass=damageLoadNotes.def?.className||"damage-load-note";
    applySideForm("atk",d);applySideForm("def",a);
    loadedBattleSnapshots={atk:dSnap,def:aSnap};
    if(dSnap)selectSnapshotMove(dSnap);else if([...ids.move.options].some(o=>o.value===oldMove))ids.move.value=oldMove;else ids.move.value="";
    if(damageLoadNotes.atk){damageLoadNotes.atk.textContent=dNote;damageLoadNotes.atk.className=dClass;}
    if(damageLoadNotes.def){damageLoadNotes.def.textContent=aNote;damageLoadNotes.def.className=aClass;}
    syncLoadedStagesToMove();
    damageResult.textContent="攻撃側と防御側を入れ替えました。新しい攻撃側の技を確認してから計算してください。";
  }
  function calcDamage(){
    try{
      const move=MOVE_DEX[ids.move.value];if(!move){throw new Error("技を選んでください。");}if(move.category==="status"){damageResult.innerHTML=`<strong>${esc(move.name)}</strong> は変化技のため直接ダメージはありません。`;return;}
      const atkSet=makeSet("atk"),defSet=makeSet("def");const at=pointsTotal(atkSet.statPoints),dt=pointsTotal(defSet.statPoints);if(at>66||dt>66){damageResult.innerHTML=`<strong>能力Pエラー</strong><br>各ポケモンの能力P合計は66以下にしてください。（攻撃側 ${at} / 防御側 ${dt}）`;return;}
      const attacker=createPokemon(atkSet,0),defender=createPokemon(defSet,0);attacker.side="player";defender.side="enemy";
      attacker.hp=Math.max(1,Math.floor(attacker.maxHP*Math.max(1,Math.min(100,Number(ids.atkHp.value)||100))/100));defender.hp=Math.max(1,Math.floor(defender.maxHP*Math.max(1,Math.min(100,Number(ids.defHp.value)||100))/100));
      const atkStat=move.category==="physical"?"attack":"specialAttack",defStat=move.category==="physical"?"defense":"specialDefense";attacker.stages[atkStat]=Number(ids.atkStage.value)||0;defender.stages[defStat]=Number(ids.defStage.value)||0;
      const crit=Boolean(ids.critical.checked);const minR=calculateDamage(attacker,defender,move,{randomFactor:0.85,forceCritical:crit});const maxR=calculateDamage(attacker,defender,move,{randomFactor:1,forceCritical:crit});let min=minR.damage,max=maxR.damage;let berry="";
      if(typeof v6CanTriggerResistBerry==="function"&&v6CanTriggerResistBerry(defender,move,minR.effectiveness)){min=Math.max(1,Math.floor(min*.5));max=Math.max(1,Math.floor(max*.5));berry=`<br>${esc(defender.item.name)}が発動するため半減を反映。`;}
      const pctMin=(min/defender.maxHP*100),pctMax=(max/defender.maxHP*100);const currentHp=defender.hp;let ko=max<currentHp?"確定耐え":min>=currentHp?"確定1発":"乱数1発";
      damageResult.innerHTML=`<strong>${esc(attacker.name)} → ${esc(defender.name)}：${esc(move.name)}</strong><br>ダメージ <strong>${min} ～ ${max}</strong>（最大HPの ${pctMin.toFixed(1)}% ～ ${pctMax.toFixed(1)}%）<br>現在HP ${currentHp}/${defender.maxHP} に対して：<strong>${ko}</strong><br>タイプ相性：×${minR.effectiveness}${crit?"　急所指定":""}${berry}`;
    }catch(e){console.error(e);damageResult.innerHTML=`<strong>計算できませんでした。</strong><br>${esc(e?.message||e)}`;}
  }
  function openDamage(){openModal(damageModal);}

  // ------------------------------------------------------------
  // v9.1.5 素早さ比較ツール
  // ------------------------------------------------------------
  const speedIds={
    targetSpecies:$("speed-target-species"),targetAbility:$("speed-target-ability"),targetItem:$("speed-target-item"),targetNature:$("speed-target-nature"),targetPoints:$("speed-target-points"),targetStage:$("speed-target-stage"),targetParalysis:$("speed-target-paralysis"),targetTailwind:$("speed-target-tailwind"),
    chaserSpecies:$("speed-chaser-species"),chaserAbility:$("speed-chaser-ability"),chaserItem:$("speed-chaser-item"),chaserStage:$("speed-chaser-stage"),chaserParalysis:$("speed-chaser-paralysis"),chaserTailwind:$("speed-chaser-tailwind")
  };
  const speedLoadNotes={target:$("speed-target-load-note"),chaser:$("speed-chaser-load-note")};
  function fillItemSelect(sel,unknownLabel="持ち物を仮定して選択…"){
    if(!sel)return;
    const items=Object.values(ITEM_DEX).filter(i=>i.id!=="none").slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));
    sel.innerHTML="";sel.appendChild(option("",unknownLabel));sel.appendChild(option("none","なし"));items.forEach(i=>sel.appendChild(option(i.id,i.name)));sel.value="none";
  }
  function speedRefreshAbility(side){
    const speciesSel=speedIds[side+"Species"],abilitySel=speedIds[side+"Ability"];
    const sp=SPECIES_DEX[speciesSel?.value];if(!sp||!abilitySel)return;
    const prev=abilitySel.value;abilitySel.innerHTML="";sp.abilities.forEach(a=>abilitySel.appendChild(option(a.id,a.name)));
    abilitySel.value=[...abilitySel.options].some(o=>o.value===prev)?prev:(sp.abilities[0]?.id||"");
  }
  function populateSpeedTool(){
    const sp=speciesSorted();[speedIds.targetSpecies,speedIds.chaserSpecies].forEach(sel=>{if(!sel)return;sel.innerHTML="";sp.forEach(x=>sel.appendChild(option(x.id,`No.${String(x.dexNo??"-").padStart(3,"0")} ${x.name}`)));});
    fillItemSelect(speedIds.targetItem);fillItemSelect(speedIds.chaserItem);
    if(speedIds.targetNature){speedIds.targetNature.innerHTML="";speedIds.targetNature.appendChild(option("","性格を仮定して選択…"));Object.keys(NATURES).forEach(n=>speedIds.targetNature.appendChild(option(n,n)));speedIds.targetNature.value="まじめ";}
    [speedIds.targetStage,speedIds.chaserStage].forEach(sel=>{if(!sel)return;sel.innerHTML="";for(let i=-6;i<=6;i++)sel.appendChild(option(String(i),i>0?`+${i}`:String(i)));sel.value="0";});
    if(speedIds.targetSpecies&&speedIds.chaserSpecies){speedIds.targetSpecies.value=sp[0]?.id||"";speedIds.chaserSpecies.value=sp[1]?.id||sp[0]?.id||"";speedRefreshAbility("target");speedRefreshAbility("chaser");}
  }
  function speedUnknownSelect(sel,label){prependUnknownOption(sel,label);}
  function speedSetLoadNote(side,snapshot){
    const el=speedLoadNotes[side];if(!el)return;if(!snapshot){el.textContent="";return;}
    el.classList.toggle("is-private",Boolean(snapshot.privateInfo));el.classList.toggle("is-public",!snapshot.privateInfo);
    if(snapshot.privateInfo){el.textContent=side==="target"?"自分側の現在値を反映しました。":"自分側の特性・持ち物・現在ランクを反映しました。結果は3種類の性格補正で比較します。";return;}
    const known=[];if(snapshot.abilityId)known.push("特性");if(snapshot.itemId)known.push("持ち物");
    el.textContent=`公開情報のみ反映${known.length?`（公開済み${known.join("/ ")}を含む）`:""}。性格・S能力P・未公開特性/持ち物は取得していません。`;
  }
  function speedSetSnapshot(side,snapshot){
    if(!snapshot)return;const speciesSel=speedIds[side+"Species"],abilitySel=speedIds[side+"Ability"],itemSel=speedIds[side+"Item"];
    speciesSel.value=snapshot.speciesId;speedRefreshAbility(side);
    if(snapshot.abilityId&&[...abilitySel.options].some(o=>o.value===snapshot.abilityId))abilitySel.value=snapshot.abilityId;else speedUnknownSelect(abilitySel,"特性は未公開（仮定して選択）");
    if(snapshot.itemId&&[...itemSel.options].some(o=>o.value===snapshot.itemId))itemSel.value=snapshot.itemId;else speedUnknownSelect(itemSel,"持ち物は未公開（仮定して選択）");
    speedIds[side+"Stage"].value=String(snapshot.stages?.speed??0);
    speedIds[side+"Paralysis"].checked=snapshot.status==="paralysis";
    speedIds[side+"Tailwind"].checked=Boolean(snapshot.tailwind);
    if(side==="target"){
      speedIds.targetNature.value=snapshot.privateInfo&&snapshot.nature&&NATURES[snapshot.nature]?snapshot.nature:"";
      speedIds.targetPoints.value=snapshot.privateInfo?String(snapshot.statPoints?.speed??0):"";
      speedIds.targetPoints.placeholder=snapshot.privateInfo?"0":"0（仮定）";
    }
    speedSetLoadNote(side,snapshot);
  }
  function loadCurrentSpeed(){
    try{
      const ctx=window.__PBV8GetDamageBattleContext?.();if(!ctx?.player||!ctx?.enemy)throw new Error("対戦中の公開情報を取得できません");
      let target,chaser;
      if(ctx.privateSide==="enemy"){target=ctx.player;chaser=ctx.enemy;}else{target=ctx.enemy;chaser=ctx.player;}
      speedSetSnapshot("target",target);speedSetSnapshot("chaser",chaser);
      const perspective=ctx.privateSide==="player"?"プレイヤーA":ctx.privateSide==="enemy"?"プレイヤーB":"公開視点";
      speedResult.textContent=`現在の対面を${perspective}基準で読み込みました。相手側の非公開情報は読み込んでいません。空欄は仮定して入力してください。`;
    }catch(e){console.warn(e);speedResult.textContent="対戦中の公開情報を取得できません。手動で条件を指定してください。";}
  }
  function validateSpeedSide(side,natureName,points){
    const sp=SPECIES_DEX[speedIds[side+"Species"]?.value];if(!sp)throw new Error(`${side==="target"?"基準":"比較"}ポケモンを選んでください。`);
    const abilityId=speedIds[side+"Ability"]?.value,itemId=speedIds[side+"Item"]?.value;
    if(!abilityId)throw new Error(`${side==="target"?"基準":"比較"}側の特性を仮定して選んでください。`);
    if(!itemId)throw new Error(`${side==="target"?"基準":"比較"}側の持ち物を「なし」を含めて仮定してください。`);
    if(natureName!==undefined&&!natureName)throw new Error("基準側の性格を仮定して選んでください。");
    return{sp,abilityId,itemId,natureName,points};
  }
  function speedValue(speciesId,abilityId,itemId,natureName,points,stage,paralysis,tailwind){
    const sp=SPECIES_DEX[speciesId];if(!sp)return 0;
    // 現行エンジンの getModifiedStat と同じ順序。特性による直接S倍率は現状なく、
    // かそく/かざぐるま等は実際のSランクを指定して再現する。
    let value=calculateStat(sp.baseStats.speed,Math.max(0,Math.min(32,Number(points)||0)),natureName,"speed");
    value=Math.floor(value*getStageMultiplier(Number(stage)||0));
    if(paralysis)value=Math.floor(value*0.5);
    if(itemId==="choice-scarf")value=Math.floor(value*1.5);
    if(tailwind)value*=2;
    return Math.max(1,Math.floor(value));
  }
  function calcSpeed(){
    try{
      const targetPointsRaw=speedIds.targetPoints.value;const targetPoints=targetPointsRaw===""?0:Number(targetPointsRaw);
      if(!Number.isFinite(targetPoints)||targetPoints<0||targetPoints>32)throw new Error("基準側のS能力Pは0～32で指定してください。");
      const target=validateSpeedSide("target",speedIds.targetNature.value,targetPoints);const chaser=validateSpeedSide("chaser");
      const targetSpeed=speedValue(target.sp.id,target.abilityId,target.itemId,target.natureName,targetPoints,speedIds.targetStage.value,speedIds.targetParalysis.checked,speedIds.targetTailwind.checked);
      const classes=[
        {label:"上昇補正",nature:"ようき",examples:"ようき / おくびょう等"},
        {label:"無補正",nature:"まじめ",examples:"まじめ / がんばりや等"},
        {label:"下降補正",nature:"ゆうかん",examples:"ゆうかん / れいせい等"}
      ];
      const rows=classes.map(c=>{
        let needed=null,got=null;for(let pts=0;pts<=32;pts++){const v=speedValue(chaser.sp.id,chaser.abilityId,chaser.itemId,c.nature,pts,speedIds.chaserStage.value,speedIds.chaserParalysis.checked,speedIds.chaserTailwind.checked);if(v>targetSpeed){needed=pts;got=v;break;}}
        const max=speedValue(chaser.sp.id,chaser.abilityId,chaser.itemId,c.nature,32,speedIds.chaserStage.value,speedIds.chaserParalysis.checked,speedIds.chaserTailwind.checked);
        return `<tr><th>${esc(c.label)}<div class="view-note">${esc(c.examples)}</div></th><td>${needed===null?'<span class="speed-impossible">32でも抜けない</span>':`<strong>${needed}</strong>`}</td><td>${needed===null?`${max}（最大）`:`${got}`}</td></tr>`;
      }).join("");
      const assumptions=[];if(targetPointsRaw==="")assumptions.push("基準側S能力P=0を仮定");
      if(target.abilityId==="speed-boost"||chaser.abilityId==="speed-boost")assumptions.push("かそくの上昇分はSランク欄で指定");
      if(target.abilityId==="windmill"||chaser.abilityId==="windmill")assumptions.push("かざぐるまの上昇分はSランク欄で指定");
      speedResult.innerHTML=`<div class="speed-summary"><strong>${esc(target.sp.name)}の実効S：${targetSpeed}</strong><span>${esc(chaser.sp.name)}がこれを上回るための最小S能力P</span>${assumptions.length?`<span class="view-note">${esc(assumptions.join(" / "))}</span>`:""}</div><table class="speed-result-table"><thead><tr><th>性格補正</th><th>必要S能力P</th><th>その時の実効S</th></tr></thead><tbody>${rows}</tbody></table>`;
    }catch(e){console.error(e);speedResult.innerHTML=`<strong>計算できませんでした。</strong><br>${esc(e?.message||e)}`;}
  }
  function openSpeed(){openModal(speedModal);}

  $("open-pokedex-button")?.addEventListener("click",openDex);$("battle-pokedex-button")?.addEventListener("click",openDex);$("pokedex-close")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexModal?.querySelector("[data-close-pokedex]")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexSearch?.addEventListener("input",renderDexList);
  $("open-damage-calc-button")?.addEventListener("click",openDamage);$("battle-damage-calc-button")?.addEventListener("click",openDamage);$("damage-calc-close")?.addEventListener("click",()=>closeModal(damageModal));damageModal?.querySelector("[data-close-damage-calc]")?.addEventListener("click",()=>closeModal(damageModal));$("damage-load-current")?.addEventListener("click",loadCurrent);$("damage-swap-sides")?.addEventListener("click",swapDamageSides);$("damage-calculate")?.addEventListener("click",calcDamage);
  $("open-speed-check-button")?.addEventListener("click",openSpeed);$("battle-speed-check-button")?.addEventListener("click",openSpeed);$("speed-check-close")?.addEventListener("click",()=>closeModal(speedModal));speedModal?.querySelector("[data-close-speed-check]")?.addEventListener("click",()=>closeModal(speedModal));$("speed-load-current")?.addEventListener("click",loadCurrentSpeed);$("speed-calculate")?.addEventListener("click",calcSpeed);speedIds.targetSpecies?.addEventListener("change",()=>{speedSetLoadNote("target",null);speedRefreshAbility("target");});speedIds.chaserSpecies?.addEventListener("change",()=>{speedSetLoadNote("chaser",null);speedRefreshAbility("chaser");});
  ids.atkSpecies?.addEventListener("change",()=>{loadedBattleSnapshots.atk=null;setLoadNote("atk",null);refreshSide("atk");});ids.defSpecies?.addEventListener("change",()=>{loadedBattleSnapshots.def=null;setLoadNote("def",null);refreshSide("def");});ids.move?.addEventListener("change",syncLoadedStagesToMove);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal(pokedexModal);closeModal(damageModal);closeModal(speedModal);}});
  populateBaseSelects();populateSpeedTool();renderDexList();renderDexDetail();
  window.__PBV9Tools={openDex,openDamage,calcDamage,loadCurrent,swapDamageSides,openSpeed,calcSpeed,loadCurrentSpeed};
})();
