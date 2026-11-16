// Audio pan runs from -1 (left) through 0 (centre) to 1 (right). Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const r=await pg.evaluate(()=>({a:clampV('pan',-1),b:clampV('pan',-5),c:clampV('pan',.4),d:clampV('pan',3),rng:RNG.pan}));
ok('pan accepts -1 (left), 0.4 and 1 (right), and clamps beyond ('+JSON.stringify(r)+')',r.a==-1&&r.b==-1&&r.c==.4&&r.d==1&&r.rng[0]==-1&&r.rng[1]==1);
const ui=await pg.evaluate(()=>{P.layers.length=0;const L=mk('audio');sel=L.id;L.p.pan=-.5;tab='Audio';side();const i=[...document.querySelectorAll('#side input')].find(x=>/pan/.test(x.outerHTML)&&(x.type=='range'||x.type=='number'));return i?{min:i.min,max:i.max,v:i.value}:null});
ok('the Pan slider spans -1 to 1 and shows -0.5 ('+JSON.stringify(ui)+')',ui&&+ui.min==-1&&+ui.max==1&&+ui.v==-.5);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
