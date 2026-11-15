// Second wipe (wipe out) on the Wipe effect: closes the layer again from the other end, or from the same end (a band). Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1400,height:900}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const R=mk('rect');R.p.c1='#ffffff';R.p.w=4000;R.p.h=4000;sel=R.id;addFx(R,'wipe');Object.assign(R.p,{wps:0,wpf:0,wpm:0,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5,wpp:100,wpl:0});for(const k of ['wpp','wqp'])delete R.kf[k];all()});
const set=p=>pg.evaluate(p=>{const L=cur();for(const k in p){delete L.kf[k];if(p[k]===undefined)delete L.p[k];else L.p[k]=p[k]}},p);
const lit=(...xs)=>pg.evaluate(xs=>{t=1;dirty=1;draw(t);const out=xs.map(([fx,fy=.5])=>MAINCX.getImageData(Math.round(fx*W),Math.round(fy*H),1,1).data[0]>128?1:0);return out},xs);
ok('no second wipe: everything stays visible',JSON.stringify(await lit([.1],[.5],[.9]))=='[1,1,1]');
await set({wqp:50,wqd:1});ok('other end, 50%: the left half stays, the right half is wiped away',JSON.stringify(await lit([.25],[.75]))=='[1,0]');
await set({wqp:50,wqd:0});ok('same end, 50%: the left half is wiped away, the right half stays',JSON.stringify(await lit([.25],[.75]))=='[0,1]');
await set({wqp:100,wqd:1});ok('other end, 100%: fully wiped away',JSON.stringify(await lit([.1],[.9]))=='[0,0]');
await set({wqp:100,wqd:0});ok('same end, 100%: fully wiped away',JSON.stringify(await lit([.1],[.9]))=='[0,0]');
await set({wqp:0,wqd:1});ok('0% does nothing in either mode',JSON.stringify(await lit([.1],[.9]))=='[1,1]');
await set({wpp:50,wqp:25,wqd:1});ok('first wipe at 50% + other end 25%: only the left half is visible',JSON.stringify(await lit([.25],[.6],[.9]))=='[1,0,0]');
await set({wpp:50,wqp:25,wqd:0});ok('first wipe at 50% + same end 25%: a band between 25% and 50% is visible',JSON.stringify(await lit([.1],[.4],[.6]))=='[0,1,0]');
await set({wpp:100,wqp:50,wqd:1,wpm:1,wpx1:.5,wpy1:.5,wpx2:1,wpy2:.5});ok('radial, other end: the centre stays, the outside is wiped away',JSON.stringify(await lit([.5],[.85]))=='[1,0]');
await set({wqd:0});ok('radial, same end: the centre is wiped away, the outside stays',JSON.stringify(await lit([.5],[.85]))=='[0,1]');
await set({wpm:0,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5,wqp:undefined,wqd:undefined});ok('a project saved before the second wipe existed is unchanged',JSON.stringify(await lit([.1],[.9]))=='[1,1]');
// soft and wavy styles still wipe cleanly
await set({wpp:100,wps:1,wpf:80,wqp:50,wqd:1});const soft=await lit([.1],[.9]);ok('gradient edge works too',soft[0]==1&&soft[1]==0);
await set({wps:2,wpa:30,wpw:120,wqp:50,wqd:1});const wavy=await lit([.1],[.9]);ok('wavy edge works too',wavy[0]==1&&wavy[1]==0);
// canvas handle
await set({wps:0,wpf:0,wpp:100,wqp:30,wqd:1});
const hit=await pg.evaluate(()=>{const L=cur();return{on:wpHit(L,{x:.7*W,y:.5*H,s:1}),first:wpHit(L,{x:W,y:.5*H,s:1})}});
ok('the second knob can be grabbed on the canvas ('+hit.on+')',hit.on=='knob2');
await set({wqp:0});ok('and is not offered when the second wipe is off',(await pg.evaluate(()=>wpHit(cur(),{x:.7*W,y:.5*H,s:1})))!='knob2');
// panel
await pg.evaluate(()=>{const L=cur();L.p.wqp=20;L.p.wqd=1;tab='Effects';all()});
ok('the panel has a Second wipe section',await pg.evaluate(()=>/Second wipe/.test(document.querySelector('#side').textContent)));
await pg.click('button[data-wqd="0"]');ok('Same end button switches the mode',(await pg.evaluate(()=>cur().p.wqd))===0);
await pg.click('button[data-wqd="1"]');ok('Other end button switches it back',(await pg.evaluate(()=>cur().p.wqd))===1);
// reset restores defaults
await pg.evaluate(()=>{const L=cur();L.p.wqp=60;fxReset(L,'wipe')});ok('reset puts the second wipe back to 0',(await pg.evaluate(()=>cur().p.wqp))===0);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
