// ============================================================
// ニワラバトル v9.1.2 utility tools
// - 図鑑
// - ダメージ計算シミュレーター
// ============================================================
(function(){
  "use strict";

  const $=id=>document.getElementById(id);
  const pokedexModal=$("pokedex-modal"), pokedexList=$("pokedex-list"), pokedexDetail=$("pokedex-detail"), pokedexSearch=$("pokedex-search");
  const damageModal=$("damage-calc-modal"), damageResult=$("damage-result");
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
  function option(value,label){const o=document.createElement("option");o.value=value;o.textContent=label;return o;}
  function populateBaseSelects(){
    const sp=speciesSorted();[ids.atkSpecies,ids.defSpecies].forEach(sel=>{if(!sel)return;sel.innerHTML="";sp.forEach(s=>sel.appendChild(option(s.id,`No.${String(s.dexNo??"-").padStart(3,"0")} ${s.name}`)));});
    const items=Object.values(ITEM_DEX).slice().sort((a,b)=>a.name.localeCompare(b.name,"ja"));[ids.atkItem,ids.defItem].forEach(sel=>{if(!sel)return;sel.innerHTML="";items.forEach(i=>sel.appendChild(option(i.id,i.name)));});
    [ids.atkNature,ids.defNature].forEach(sel=>{if(!sel)return;sel.innerHTML="";Object.keys(NATURES).forEach(n=>sel.appendChild(option(n,n)));sel.value="まじめ";});
    [ids.atkStage,ids.defStage].forEach(sel=>{if(!sel)return;sel.innerHTML="";for(let i=-6;i<=6;i++)sel.appendChild(option(String(i),i>0?`+${i}`:String(i)));sel.value="0";});
    [[ids.atkPoints,"atk"],[ids.defPoints,"def"]].forEach(([wrap,prefix])=>{if(!wrap)return;wrap.innerHTML="";statPairs.forEach(([key,label])=>{const l=document.createElement("label");l.innerHTML=`<span>${label}</span><input type="number" min="0" max="32" value="0" data-dmg-side="${prefix}" data-stat="${key}" aria-label="${prefix} ${label}能力P">`;wrap.appendChild(l);});});
    if(ids.atkSpecies&&ids.defSpecies){ids.atkSpecies.value=sp[0]?.id||"";ids.defSpecies.value=sp[1]?.id||sp[0]?.id||"";refreshSide("atk");refreshSide("def");}
  }
  function sideSpecies(side){return SPECIES_DEX[ids[side+"Species"]?.value];}
  function refreshSide(side){
    const s=sideSpecies(side),abil=ids[side+"Ability"];if(!s||!abil)return;const prev=abil.value;abil.innerHTML="";s.abilities.forEach(a=>abil.appendChild(option(a.id,a.name)));if([...abil.options].some(o=>o.value===prev))abil.value=prev;
    if(side==="atk"){const prevMove=ids.move.value;ids.move.innerHTML="";s.movePool.map(id=>MOVE_DEX[id]).filter(Boolean).forEach(m=>ids.move.appendChild(option(m.id,`${m.name}（${m.type}/${catName(m.category)}）`)));if([...ids.move.options].some(o=>o.value===prevMove))ids.move.value=prevMove;}
  }
  function collectPoints(side){const out={};document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>out[i.dataset.stat]=Math.max(0,Math.min(32,Number(i.value)||0)));return out;}
  function pointsTotal(p){return Object.values(p).reduce((a,b)=>a+b,0);}
  function makeSet(side){const s=sideSpecies(side);return{speciesId:s.id,abilityId:ids[side+"Ability"].value,itemId:ids[side+"Item"].value,nature:ids[side+"Nature"].value,statPoints:collectPoints(side),moves:side==="atk"?[ids.move.value]:[s.movePool[0]].filter(Boolean)};}
  function setSideFromPokemon(side,p){
    if(!p)return;ids[side+"Species"].value=p.id;refreshSide(side);ids[side+"Ability"].value=p.ability?.id||ids[side+"Ability"].value;ids[side+"Item"].value=p.item?.id||"none";ids[side+"Nature"].value=p.nature||"まじめ";ids[side+"Hp"].value=Math.max(1,Math.round(p.hp/p.maxHP*100));
    document.querySelectorAll(`[data-dmg-side="${side}"]`).forEach(i=>i.value=p.statPoints?.[i.dataset.stat]??0);
    if(side==="atk"&&p.moves?.[0]){if([...ids.move.options].some(o=>o.value===p.moves[0].id))ids.move.value=p.moves[0].id;}
  }
  function loadCurrent(){
    try{const a=getPlayerPokemon?.(),d=getEnemyPokemon?.();if(!a||!d)throw new Error();setSideFromPokemon("atk",a);setSideFromPokemon("def",d);damageResult.textContent="現在のプレイヤーA対プレイヤーBの場を読み込みました。技などを必要に応じて変更してください。";}catch(_){damageResult.textContent="対戦中のポケモンを取得できません。編成画面では手動で条件を指定してください。";}
  }
  function calcDamage(){
    try{
      const atkSet=makeSet("atk"),defSet=makeSet("def");const at=pointsTotal(atkSet.statPoints),dt=pointsTotal(defSet.statPoints);if(at>66||dt>66){damageResult.innerHTML=`<strong>能力Pエラー</strong><br>各ポケモンの能力P合計は66以下にしてください。（攻撃側 ${at} / 防御側 ${dt}）`;return;}
      const attacker=createPokemon(atkSet,0),defender=createPokemon(defSet,0);attacker.side="player";defender.side="enemy";
      attacker.hp=Math.max(1,Math.floor(attacker.maxHP*Math.max(1,Math.min(100,Number(ids.atkHp.value)||100))/100));defender.hp=Math.max(1,Math.floor(defender.maxHP*Math.max(1,Math.min(100,Number(ids.defHp.value)||100))/100));
      const move=MOVE_DEX[ids.move.value];if(!move){throw new Error("技が選択されていません");}if(move.category==="status"){damageResult.innerHTML=`<strong>${esc(move.name)}</strong> は変化技のため直接ダメージはありません。`;return;}
      const atkStat=move.category==="physical"?"attack":"specialAttack",defStat=move.category==="physical"?"defense":"specialDefense";attacker.stages[atkStat]=Number(ids.atkStage.value)||0;defender.stages[defStat]=Number(ids.defStage.value)||0;
      const crit=Boolean(ids.critical.checked);const minR=calculateDamage(attacker,defender,move,{randomFactor:0.85,forceCritical:crit});const maxR=calculateDamage(attacker,defender,move,{randomFactor:1,forceCritical:crit});let min=minR.damage,max=maxR.damage;let berry="";
      if(typeof v6CanTriggerResistBerry==="function"&&v6CanTriggerResistBerry(defender,move,minR.effectiveness)){min=Math.max(1,Math.floor(min*.5));max=Math.max(1,Math.floor(max*.5));berry=`<br>${esc(defender.item.name)}が発動するため半減を反映。`;}
      const pctMin=(min/defender.maxHP*100),pctMax=(max/defender.maxHP*100);const currentHp=defender.hp;let ko=max<currentHp?"確定耐え":min>=currentHp?"確定1発":"乱数1発";
      damageResult.innerHTML=`<strong>${esc(attacker.name)} → ${esc(defender.name)}：${esc(move.name)}</strong><br>ダメージ <strong>${min} ～ ${max}</strong>（最大HPの ${pctMin.toFixed(1)}% ～ ${pctMax.toFixed(1)}%）<br>現在HP ${currentHp}/${defender.maxHP} に対して：<strong>${ko}</strong><br>タイプ相性：×${minR.effectiveness}${crit?"　急所指定":""}${berry}`;
    }catch(e){console.error(e);damageResult.innerHTML=`<strong>計算できませんでした。</strong><br>${esc(e?.message||e)}`;}
  }
  function openDamage(){openModal(damageModal);}

  $("open-pokedex-button")?.addEventListener("click",openDex);$("battle-pokedex-button")?.addEventListener("click",openDex);$("pokedex-close")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexModal?.querySelector("[data-close-pokedex]")?.addEventListener("click",()=>closeModal(pokedexModal));pokedexSearch?.addEventListener("input",renderDexList);
  $("open-damage-calc-button")?.addEventListener("click",openDamage);$("battle-damage-calc-button")?.addEventListener("click",openDamage);$("damage-calc-close")?.addEventListener("click",()=>closeModal(damageModal));damageModal?.querySelector("[data-close-damage-calc]")?.addEventListener("click",()=>closeModal(damageModal));$("damage-load-current")?.addEventListener("click",loadCurrent);$("damage-calculate")?.addEventListener("click",calcDamage);
  ids.atkSpecies?.addEventListener("change",()=>refreshSide("atk"));ids.defSpecies?.addEventListener("change",()=>refreshSide("def"));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal(pokedexModal);closeModal(damageModal);}});
  populateBaseSelects();renderDexList();renderDexDetail();
  window.__PBV9Tools={openDex,openDamage,calcDamage,loadCurrent};
})();
