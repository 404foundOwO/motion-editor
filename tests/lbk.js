// Letter break out: letters leave one after another, the left half to the left and the right half to the right equally. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const r=await pg.evaluate(()=>{P.layers.length=0;P.dur=6;const L=mk('text');L.text='ABCDEF';sel=L.id;addFx(L,'lbk');L.p.lbkt=1;L.p.lbks=.5;L.p.lbke=1;L.p.lbkr=0;L.p.lbkf=0;L.p.lbku=0;L.p.lbkc=0;refx();const run=tt=>{const a=[];for(let i=0;i<6;i++){const o={dx:0,dy:0,rot:0,sc:1,sx:1,op:1,bl:0,col:null};lbkOff(L,tt,i,6,o);a.push(Math.round(o.dx))}return a};return{before:run(.5),early:run(L.s+1.1),mid:run(L.s+1.6),end:run(L.s+3.5),cat:!!EF.lbk&&okfx(L,'lbk'),anim:!!animG(L,L.s+2.2,0,6)}});
ok('nothing moves before the start ('+r.before+')',r.before.every(x=>x==0));
ok('the letters start one after another ('+r.early+')',r.early.filter(x=>x!=0).length>0&&r.early.filter(x=>x!=0).length<6);
ok('left half goes left and right half goes right, equally ('+r.end+')',r.end.slice(0,3).every(x=>x<0)&&r.end.slice(3).every(x=>x>0)&&r.end[0]==-r.end[5]&&r.end[1]==-r.end[4]&&r.end[2]==-r.end[3]);
ok('every letter ends far off to the side (>= half the width) ('+r.end+')',r.end.every(x=>Math.abs(x)>900));
ok('registered and drawn through animG',r.cat&&r.anim);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
