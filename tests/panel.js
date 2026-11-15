// Properties panel layout: one place per property (no duplicate Color/Background), text + font size in the Font tab, effect reset. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1400,height:900}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const tabs=()=>pg.evaluate(()=>[...document.querySelectorAll('#side .tabs [data-tab], #side [data-tab]')].map(b=>b.dataset.tab));
const html=t=>pg.evaluate(t=>{tab=t;side();return document.querySelector('#side').innerHTML},t);
await pg.evaluate(()=>{P.layers.length=0;mk('cam');const L=mk('text');L.text='Hello';sel=L.id;tab='Move';all()});
const T=await tabs();ok('text tabs have no Style or Shape: '+T.join(','),!T.includes('Style')&&!T.includes('Shape')&&T.includes('Font'));
const f=await html('Font');ok('Font tab has text box',/data-s=["]?text/.test(f));ok('Font tab has Font size',f.includes('Font size'));
const c=await html('Color');ok('Color tab has Fill',c.includes('Fill'));
const fl=await html('Flags');ok('Flags keeps Background',fl.includes('Background'));
await pg.evaluate(()=>{const r=mk('rect');sel=r.id;tab='Move';all()});const T2=await tabs();ok('rect tabs: '+T2.join(','),!T2.includes('Style')&&T2.includes('Shape'));
await pg.evaluate(()=>{const t=P.layers.find(l=>l.type=='text');sel=t.id;t.br.on=1;t.br.mode='screen';t.br.nb=0;all()});
const ph=await html('Physics');ok('Physics: margin under a Screen border section',ph.includes('Screen border')&&ph.includes('Margin'));
await pg.evaluate(()=>{const t=cur();t.br.nb=1});const ph2=await html('Physics');ok('Physics: margin hidden when the border is removed',!ph2.includes('Margin (px'));
// effect reset
await pg.evaluate(()=>{const t=P.layers.find(l=>l.type=='text');sel=t.id;addFx(t,'flick');t.efa=['flick'];setV(t,'fkr',3);t.kf.fks=[{t:0,v:1,e:'lin'}];tab='Effects';all()});
await pg.click('button[data-rst="flick"]');await pg.waitForTimeout(150);
const r=await pg.evaluate(()=>{const t=cur();return{fkr:t.p.fkr,kf:!!t.kf.fks,fl:t.p.flick,has:t.efx.includes('flick')}});
ok('reset restores defaults, clears keyframes, keeps the effect',r.fkr==12&&!r.kf&&r.fl==.8&&r.has);
// consistency across every layer type and tab
const audit=await pg.evaluate(()=>{const bad=[],types=['text','rect','circle','tri','poly','star','ring','line','bubble','mshape','media','group','emitter','cam','audio'];
 for(const ty of types){P.layers.length=0;id=1;const L=mk(ty);sel=L.id;if(ty!='cam')try{addFx(L,'blur')}catch(e){}tab='Move';side();const tl=[...document.querySelectorAll('#side [data-tab]')].map(b=>b.dataset.tab);
  for(const tb of tl){tab=tb;side();const rows=[...document.querySelectorAll('#side .r')];
   rows.forEach(r=>{const lab=r.querySelector('label'),n=r.querySelector('[data-k],[data-s]'),txt=(lab?lab.firstChild.textContent:'').trim();
    if(lab&&n&&(n.dataset.k||n.dataset.s)==txt)bad.push(ty+'/'+tb+': raw key label '+txt);
    if(/ (px|%|\u00b0)$/.test(txt))bad.push(ty+'/'+tb+': unit style '+txt);
    if(/\(0\/1/.test(r.textContent))bad.push(ty+'/'+tb+': 0/1 field '+txt)});
   const texts=[...document.querySelectorAll('#side textarea[data-s=text]')].length;if(texts>1)bad.push(ty+'/'+tb+': '+texts+' text boxes')}}
 return bad});
ok('no raw keys, bare units, 0/1 fields or duplicate text boxes in any tab: '+JSON.stringify(audit),audit.length==0);
const dupFill=await pg.evaluate(()=>{const out=[];for(const ty of ['bubble','emitter']){P.layers.length=0;id=1;const L=mk(ty);sel=L.id;tab='Color';side();if(/Fill/.test(document.querySelector('#side').textContent))out.push(ty)}return out});
ok('bubble and emitter have no second Fill colour',dupFill.length==0);
// a 0/1 effect option is a checkbox that writes 0 or 1
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const L=mk('rect');sel=L.id;addFx(L,'asc');tab='Effects';all()});
await pg.check('input[data-k="ascm"]');const g1=await pg.evaluate(()=>cur().p.ascm);await pg.uncheck('input[data-k="ascm"]');const g0=await pg.evaluate(()=>cur().p.ascm);
ok('checkbox sets 1 then 0 ('+g1+','+g0+')',g1===1&&g0===0);
// the text box is tall by default and remembers a dragged height
await pg.evaluate(()=>{localStorage.removeItem('ui-txh');P.layers.length=0;id=1;mk('cam');const L=mk('text');L.text='a\nb';sel=L.id;tab='Font';all()});
const h0=await pg.evaluate(()=>document.querySelector('#side textarea[data-s=text]').offsetHeight);
await pg.evaluate(()=>{document.querySelector('#side textarea[data-s=text]').style.height='320px'});
await pg.mouse.click(5,5);await pg.evaluate(()=>{dispatchEvent(new Event('pointerup'));side()});
const h1=await pg.evaluate(()=>document.querySelector('#side textarea[data-s=text]').offsetHeight);
await pg.reload();await pg.waitForTimeout(1500);await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const L=mk('text');sel=L.id;tab='Font';all()});
const h2=await pg.evaluate(()=>document.querySelector('#side textarea[data-s=text]').offsetHeight);
ok(`text box default ${h0}px, kept after resize ${h1}px, and after a reload ${h2}px`,h0>=150&&h1==320&&h2==320);
// the bubble's Message box shares the remembered height
await pg.evaluate(()=>{localStorage.setItem('ui-txh','240');P.layers.length=0;id=1;mk('cam');const L=mk('bubble');sel=L.id;tab='Shape';all()});
const hb=await pg.evaluate(()=>document.querySelector('#side textarea[data-s=text]').offsetHeight);
ok('bubble Message box uses the saved height ('+hb+'px)',hb==240);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
