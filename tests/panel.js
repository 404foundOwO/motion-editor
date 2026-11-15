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
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
