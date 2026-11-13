const orbV=()=>{const a=orb.ry,b=orb.rx;return{X:[Math.cos(a),0,Math.sin(a)],Y:[Math.sin(a)*Math.sin(b),Math.cos(b),-Math.cos(a)*Math.sin(b)],Z:[-Math.sin(a)*Math.cos(b),Math.sin(b),Math.cos(a)*Math.cos(b)]}};
function orbPan(dx,dy){const k=orb.d/800*(W/cv.clientWidth),{X,Y}=orbV();orb.x-=(X[0]*dx+Y[0]*dy)*k;orb.y-=(X[1]*dx+Y[1]*dy)*k;orb.z-=(X[2]*dx+Y[2]*dy)*k}
function frameSel(){const L=cur();if(!L)return;try{const E=effOf(L,t);orb.x=E.p[0];orb.y=E.p[1];orb.z=E.p[2];if(!['cam','fx','audio','group'].includes(L.type)){const[a,b,c,d]=lbox(L,t),s=Math.max(c-a,d-b)*E.s;if(Number.isFinite(s)&&s>0)orb.d=Math.max(500,s*1.8)}}catch(e){}dirty=1}
cv.onwheel=e=>{if(mode=='3d'){e.preventDefault();orb.d=Math.max(150,Math.min(30000,orb.d*Math.exp(e.deltaY*(e.ctrlKey?.01:.0012))));dirty=1}};
cv.addEventListener('contextmenu',e=>{if(mode=='3d')e.preventDefault()});
$('#m2').title='Orbit: drag · Pan: Shift+drag or right-drag · Zoom: wheel · Fly: W A S D, Q / E · F: frame selected · 1 / 3 / 7: front / side / top · Home: reset';
addEventListener('keydown',e=>{if(mode!='3d'||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.code,s=orb.d*.04*(e.shiftKey?3:1),{X,Z}=orbV(),mvT=(V,m)=>{orb.x+=V[0]*m;orb.y+=V[1]*m;orb.z+=V[2]*m};let h=1;
if(k=='KeyW')mvT(Z,s);else if(k=='KeyS')mvT(Z,-s);else if(k=='KeyD')mvT(X,s);else if(k=='KeyA')mvT(X,-s);else if(k=='KeyE')orb.y-=s;else if(k=='KeyQ')orb.y+=s;
else if(k=='KeyF')frameSel();else if(k=='Home')Object.assign(orb,{ry:.5,rx:-.3,d:1700,x:0,y:0,z:0});
else if(k=='Digit1'||k=='Numpad1')Object.assign(orb,{rx:0,ry:0});else if(k=='Digit3'||k=='Numpad3')Object.assign(orb,{rx:0,ry:-Math.PI/2});else if(k=='Digit7'||k=='Numpad7')Object.assign(orb,{rx:-1.5,ry:0});else h=0;
if(h){e.preventDefault();dirty=1}});
addEventListener('keydown',e=>{const ty=!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);if(e.code=='Space'&&ty){e.preventDefault();$('#pl').click()}if(e.code=='Delete'&&ty)$('#del').click();if((e.code=='ArrowRight'||e.code=='ArrowLeft')&&ty){e.preventDefault();seek(Math.round(t*FPS)/FPS+(e.code=='ArrowRight'?1:-1)*(e.shiftKey?10:1)/FPS)}if((e.ctrlKey||e.metaKey)&&ty&&e.code=='KeyZ'){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&ty&&e.code=='KeyY'){e.preventDefault();redo()}});
let last=0,sa=0;function tick0(ts){if(OFFX){last=ts;return}const d=Math.min(.1,(ts-last)/1000);last=ts;refx();const hasA=P.layers.some(l=>l.type=='audio'&&l.buf);
 if(play&&hasA&&AON&&Math.abs(t-LT)>.002)aStart();
 if(play){t=AON&&AC.state=='running'?A0.t+(AC.currentTime-A0.c):t+d;const lp=!exp&&P.lp&&P.lp.on?P.lp:null;if(lp&&t>=Math.min(lp.b,P.dur)){t=lp.a;if(AON)aStart()}else if(t>=P.dur){if(exp){exp=0;play=0;t=P.dur;rec.stop()}else{t=0;if(AON)aStart()}}dirty=1;ph();if(ts-sa>150&&!$('#side').contains(document.activeElement)){sa=ts;side()}}
 if(play&&hasA){if(!AON||sig()!=ASIG)aStart();else aUpd()}else if(AON)aStop();
 metTick();blipTick();LT=t;if(dirty){dirty=0;safeDraw(t);ovd=1}if(ovd){ovd=0;try{drawOverlay()}catch(e){console.error('[overlay]',e)}}}
const PVL=['Preview: full resolution (click for half)','Preview: half resolution – faster (click for quarter)','Preview: quarter resolution – fastest (click for full)'];
const qb=document.createElement('div');qb.id='qb';qb.hidden=true;$('#stage').appendChild(qb);QBe=qb;
function pvApply(){const b=$('#pvq');setIc(b,PV?'zap':'monitor',PVL[PV]);b.className=PV?'on':'';b.dataset.q=['','½','¼'][PV];qb.hidden=!PV;qb.textContent='Preview '+['','½','¼'][PV]+' · '+Math.round(W*PVQ[PV])+'×'+Math.round(H*PVQ[PV]);dirty=1;ovd=1;saveUI()}
$('#pvq').onclick=()=>{PV=(PV+1)%3;pvApply()};
const arLabel=()=>Object.keys(ASP).find(k=>ASP[k][0]==W&&ASP[k][1]==H)||(W+'×'+H);
function arUi(){const b=document.getElementById('arb'),l=b&&b.querySelector('.lbl');if(l)l.textContent=arLabel()}
function pvApplyLite(){if(QBe&&!QBe.hidden)QBe.textContent='Preview '+['','½','¼'][PV]+' · '+Math.round(W*PVQ[PV])+'×'+Math.round(H*PVQ[PV])}
function closeAr(){const m=document.getElementById('arm');if(m)m.remove();removeEventListener('pointerdown',arOut,true);removeEventListener('keydown',arKey,true)}
function arOut(e){const m=document.getElementById('arm');if(m&&!m.contains(e.target)&&!e.target.closest('#arb'))closeAr()}
function arKey(e){if(e.key=='Escape')closeAr()}
function setAspect(k,cw,ch){if(k=='custom'){P.cw=cw;P.ch=ch}applyFmt(k);arUi();dirty=1;try{commit()}catch(e){}all()}
function openAr(btn){
 if(document.getElementById('arm')){closeAr();return}
 const m=document.createElement('div'),r=btn.getBoundingClientRect();m.id='arm';
 m.innerHTML=`<div class=pmh>Aspect ratio</div><div class=arg>${Object.keys(ASP).map(k=>{const [w,h]=ASP[k],sc=24/Math.max(w,h);return `<button data-ar="${k}" class="${P.fmt==k?'on':''}"><i style="width:${Math.round(w*sc)}px;height:${Math.round(h*sc)}px"></i><b>${k}</b><small>${w}×${h}</small></button>`}).join('')}</div><div class=pmh>Custom size</div><div class=arc><input type=number min=240 max=4096 step=2 value=${W} data-cw aria-label=Width><span>×</span><input type=number min=240 max=4096 step=2 value=${H} data-ch aria-label=Height><button class=pri data-arc>Apply</button></div><p class=m style="margin:8px 8px 4px;font-size:11px;line-height:1.45">Layers keep their positions when the size changes.</p>`;
 document.body.appendChild(m);
 const wd=Math.min(300,innerWidth-16);m.style.width=wd+'px';m.style.left=(r.width?Math.max(8,Math.min(innerWidth-wd-8,r.left)):Math.max(8,(innerWidth-wd)/2))+'px';m.style.top=(r.width?r.bottom+6:70)+'px';
 const go=()=>{const ev=x=>{x=Math.round(+x/2)*2;return Math.max(240,Math.min(4096,x||0))},cw=ev(m.querySelector('[data-cw]').value),ch=ev(m.querySelector('[data-ch]').value);const pk=Object.keys(ASP).find(k=>ASP[k][0]==cw&&ASP[k][1]==ch);setAspect(pk||'custom',cw,ch);closeAr()};
 m.onclick=e=>{const d=e.target.dataset;if(d.ar){setAspect(d.ar);closeAr()}else if('arc' in d)go()};
 m.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.tagName=='INPUT'){e.preventDefault();go()}e.stopPropagation()});
 setTimeout(()=>{addEventListener('pointerdown',arOut,true);addEventListener('keydown',arKey,true)},0)}
$('#arb').onclick=e=>openAr(e.currentTarget);arUi();if(PV)pvApply();

const LP=()=>P.lp||(P.lp={on:0,a:0,b:P.dur});function lpUi(){const l=LP();$('#lpl').className=l.on?'on':'';$('#lpt').textContent=l.on?`${l.a.toFixed(2)}\u2013${Math.min(l.b,P.dur).toFixed(2)}s`:''}
$('#lpi').onclick=()=>{const l=LP();l.a=Math.max(0,Math.min(t,l.b-.05));lpUi()};$('#lpo').onclick=()=>{const l=LP();l.b=Math.max(t,l.a+.05);l.on=1;lpUi()};$('#lpl').onclick=()=>{const l=LP();l.on=l.on?0:1;if(l.b<=l.a||l.b>P.dur)l.b=P.dur;lpUi()};
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey)return;if(e.code=='KeyI')$('#lpi').click();else if(e.code=='KeyO')$('#lpo').click();else if(e.code=='KeyL')$('#lpl').click();else if(e.code=='KeyP')$('#pthb').click()});
const PVC=new Map();function pv(L){if(L.type!='audio'&&L.type!='media')return'';const s=L.type=='audio'?L.buf:L.glb?null:L.el;if(!s)return'';let c=PVC.get(L.id);if(!c||c.s!==s){c={s,u:''};try{const k=document.createElement('canvas'),g=k.getContext('2d');k.height=18;if(L.type=='audio'){const d=s.getChannelData(0),n=k.width=600,st=Math.max(1,Math.floor(d.length/n));g.fillStyle='rgba(255,255,255,.75)';for(let x=0;x<n;x++){let m=0;for(let j=0;j<st;j+=Math.ceil(st/40))m=Math.max(m,Math.abs(d[x*st+j]||0));const h=Math.max(1,Math.min(1,m)*18);g.fillRect(x,9-h/2,1,h)}}else{const w=s.videoWidth||s.naturalWidth,h=s.videoHeight||s.naturalHeight;if(!w||!h||(L.vid&&s.readyState<2)||(!L.vid&&!s.complete))return'';k.width=Math.max(8,Math.round(18*w/h));g.drawImage(s,0,0,k.width,18)}c.u=k.toDataURL();PVC.set(L.id,c)}catch(er){return''}}return c.u?`background-image:url(${c.u});background-size:${L.type=='audio'?'100% 100%':'auto 100%'};background-repeat:${L.type=='audio'?'no-repeat':'repeat-x'}`:''}
init();all();c0=ser();requestAnimationFrame(tick);restore();

(()=>{const pb=document.createElement('button');pb.id='tpn';pb.dataset.t='Panel';pb.title='Toggle panel';pb.innerHTML=IC('panel');pb.setAttribute('data-ib','');pb.onclick=()=>togglePanel();$('#top').append(pb);const bd=document.createElement('div');bd.id='tbd';bd.onclick=()=>{$('#side').classList.remove('open');$('#app').classList.remove('popen');bd.classList.remove('on')};document.body.append(bd);
let lpT=0,lpX=0,lpY=0;
window.togglePanel=()=>{if(matchMedia('(max-width:900px) and (orientation:portrait)').matches){$('#app').classList.toggle('sheet')}else{const o=$('#side').classList.toggle('open');$('#app').classList.toggle('popen',o);$('#tbd').classList.toggle('on',o)}};
const TL=$('#tlin');TL.addEventListener('pointerdown',e=>{if(e.pointerType!='touch')return;lpX=e.clientX;lpY=e.clientY;clearTimeout(lpT);lpT=setTimeout(()=>{lpT=0;const el=document.elementFromPoint(lpX,lpY);if(el)el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:lpX,clientY:lpY}))},500)});
TL.addEventListener('pointermove',e=>{if(lpT&&Math.hypot(e.clientX-lpX,e.clientY-lpY)>8){clearTimeout(lpT);lpT=0}});
['pointerup','pointercancel'].forEach(ev=>TL.addEventListener(ev,()=>{clearTimeout(lpT);lpT=0}));
const TP=new Map();let lastD=0,lastC=null;
const cent=()=>{const v=[...TP.values()];return[(v[0][0]+v[1][0])/2,(v[0][1]+v[1][1])/2]};
cv.addEventListener('pointerdown',e=>{if(e.pointerType=='touch')TP.set(e.pointerId,[e.clientX,e.clientY])},{capture:true});
cv.addEventListener('pointermove',e=>{if(e.pointerType!='touch'||!TP.has(e.pointerId))return;TP.set(e.pointerId,[e.clientX,e.clientY]);
 if(TP.size>=2&&mode=='3d'){e.stopImmediatePropagation();const v=[...TP.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]),c=cent();
  if(lastD&&d>0)orb.d=Math.max(150,Math.min(30000,orb.d*lastD/d));
  if(lastC)orbPan((c[0]-lastC[0])*2,(c[1]-lastC[1])*2);
  lastD=d;lastC=c;dirty=1}});
const endT=e=>{TP.delete(e.pointerId);if(TP.size<2){lastD=0;lastC=null}};
cv.addEventListener('pointerup',endT,{capture:true});cv.addEventListener('pointercancel',endT,{capture:true});
})();

(()=>{const mq=matchMedia('(max-width:900px)');
const KEEP_TOP=['m1','m2','tpn','tmo'],KEEP_TB=['pl','tm','un','re','pk','nk','sp','del'];
const ICON={pl:'▶',un:'↶',re:'↷',pk:'‹◆',nk:'◆›',sp:'✂',del:'✕',zo:'−',zi:'+',tpn:'☰',tmo:'⋯',m1:'Comp',m2:'3D'};
const moveable=()=>[...document.querySelectorAll('#top > *, #tb > *')].filter(e=>!KEEP_TOP.includes(e.id)&&!KEEP_TB.includes(e.id)&&e.id!='tmo2'&&!(e.tagName=='DIV'&&e.id=='tbd'));
const more=document.createElement('button');more.id='tmo';more.innerHTML=IC('more');more.setAttribute('data-ib','');more.title='More tools';
$('#top').append(more);
const tbMore=document.createElement('button');tbMore.id='tmo2';tbMore.style.display='none';
const tb=$('#tb');tb.append(tbMore);
function apply(){const m=mq.matches;
 moveable().forEach(e=>{if(e.dataset.mobHidden===undefined)e.dataset.mobHidden=e.style.display||'';e.style.display=m?'none':e.dataset.mobHidden});
 [...document.querySelectorAll('#top>button,#tb>button,#tb>span')].forEach(e=>{if(!e.dataset.t)e.dataset.t=e.textContent});
 if(!m)tbMore.style.display='none';
 document.querySelector('#top').querySelectorAll('input').forEach(i=>i.style.display=m?'none':'');
 $('#tbd').classList.remove('on');$('#side').classList.remove('open');$('#tpn').style.display=m?'inline-block':'none';$('#tmo').style.display=m?'inline-block':'none';
}
mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);apply();
function sheet(){const old=$('#mmenu');if(old){old.remove();return}
 const d=document.createElement('div');d.id='mmenu';d.style.cssText='position:fixed;inset:0;z-index:79;background:#0007';
 const s=document.createElement('div');s.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:80;max-height:72vh;overflow:auto;background:var(--p);border-top:1px solid var(--l);border-radius:14px 14px 0 0;padding:14px 14px 22px';
 const items=moveable().filter(e=>e.id!='tmo'&&(e.tagName=='BUTTON'||e.id=='du'));
 items.forEach(e=>{const r=document.createElement('div');r.className='it';r.style.cssText='display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--l)';if(e.id=='du'){const lab=document.createElement('span');lab.textContent='Length (s)';r.append(lab)}
  if(e.tagName=='INPUT'||e.tagName=='SELECT'){const c=e.cloneNode(true);c.style.width='90px';c.oninput=c.onchange=()=>{e.value=c.value;e.dispatchEvent(new Event('change',{bubbles:true}))};r.append(c)}
  else if(e.tagName=='BUTTON'){const c=document.createElement('button');c.style.cssText='flex:1;text-align:left';c.textContent=e.dataset.t||e.textContent;c.onclick=()=>{d.remove();e.click()};r.append(c)}
  s.append(r)});
 d.append(s);document.body.append(d);d.onclick=ev=>{if(ev.target===d)d.remove()}}
$('#tmo').onclick=()=>{$('#tbd').classList.remove('on');$('#side').classList.remove('open');sheet()};
tbMore.onclick=()=>sheet();
const stg=$('#stage');stg.addEventListener('contextmenu',e=>e.preventDefault());
function deselect(){sel=null;ks=[];rep=null;MS.clear();all();ovd=1}
let tapSel=null,tapX=0,tapY=0;
cv.addEventListener('pointerdown',e=>{tapSel=null;if(e.pointerType!='touch'||mode!='comp')return;const c=cpos(e),h=hit(c.x,c.y);if(h&&h.id==sel){tapSel=h.id;tapX=e.clientX;tapY=e.clientY}},{capture:true});
cv.addEventListener('pointermove',e=>{if(tapSel&&Math.hypot(e.clientX-tapX,e.clientY-tapY)>8)tapSel=null});
cv.addEventListener('pointerup',e=>{if(tapSel&&e.pointerType=='touch'&&mode=='comp'&&sel==tapSel){tapSel=null;deselect()}else tapSel=null});
cv.addEventListener('pointercancel',()=>{tapSel=null});
const sh0=sheet;sheet=function(){const old=$('#mmenu');if(old){old.remove();return}sh0();const s=$('#mmenu');if(!s)return;const r=document.createElement('div');r.className='it';r.style.cssText='display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--l)';const c=document.createElement('button');c.style.cssText='flex:1;text-align:left';c.textContent='Deselect';c.onclick=()=>{s.remove();deselect()};r.append(c);s.firstElementChild.prepend(r)};
cv.addEventListener('pointerdown',e=>{if(e.pointerType=='touch'&&mode=='comp'){const c=cpos(e),h=hit(c.x,c.y);hov=h?h.id:0;ovd=1}},{capture:false});
cv.onpointerleave=e=>{if(e&&e.pointerType=='touch')return;inCv=false;hov=0;ovd=1};
})();

(()=>{const lq=matchMedia('(orientation:landscape) and (pointer:coarse)');
const sw=document.createElement('button');sw.id='swp';sw.dataset.t='Swap';sw.innerHTML=IC('swap');sw.setAttribute('data-ib','');sw.title='Swap comp and timeline sides';$('#top').append(sw);
let saved=null;try{saved=localStorage.getItem('mlSwap')}catch(e){}
if(saved==='1')$('#app').classList.add('swap');
sw.onclick=()=>{const s=$('#app').classList.toggle('swap');try{localStorage.setItem('mlSwap',s?'1':'0')}catch(e){}};
function upd(){const land=lq.matches,pov=land&&innerWidth<1100,a=$('#app');
 a.classList.toggle('land',land);a.classList.toggle('pov',pov);
 if(!pov){$('#side').classList.remove('open');$('#app').classList.remove('popen');$('#tbd').classList.remove('on')}
 const narrow=matchMedia('(max-width:900px)').matches;$('#tpn').style.display=(narrow||pov)?'inline-block':'none';
 if(land)dirty=1}
lq.addEventListener?lq.addEventListener('change',upd):lq.addListener(upd);
addEventListener('resize',upd);addEventListener('orientationchange',()=>setTimeout(upd,200));upd();
})();

(()=>{const g=document.createElement('div');g.id='sgr';$('#side').before(g);
const pq=matchMedia('(max-width:900px) and (orientation:portrait)');
const tpn=$('#tpn');
function place(){if(pq.matches){$('#tb').prepend(tpn);$('#app').classList.remove('sheet')}else{$('#top').append(tpn);$('#app').classList.remove('sheet')}}
pq.addEventListener?pq.addEventListener('change',place):pq.addListener(place);place();
let drag=null;
g.addEventListener('pointerdown',e=>{e.preventDefault();g.setPointerCapture(e.pointerId);const land=$('#app').classList.contains('land');
 drag={y:e.clientY,x:e.clientX,sh:$('#side').getBoundingClientRect().height,pw:$('#side').getBoundingClientRect().width,land}});
g.addEventListener('pointermove',e=>{if(!drag)return;
 if(drag.land){const w=Math.max(200,Math.min(innerWidth*.9,drag.pw+(drag.x-e.clientX)));$('#app').style.setProperty('--pw',w+'px');$('#side').style.width=w+'px'}
 else{const h=Math.max(120,Math.min(innerHeight*.8,drag.sh+(drag.y-e.clientY)));$('#app').style.setProperty('--sh',h+'px')}});
const end=()=>{drag=null};g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
})();

