// Box blur (angle): a rotated rectangular box blur. Needs Playwright Chromium (SwiftShader WebGL).
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{P.layers.length=0;P.dur=5;const L=mk('rect');L.p.w=300;L.p.h=300;L.p.c1='#ffffff';L.col='#ffffff';sel=L.id;t=1;addFx(L,'bbx');L.p.bbw=120;L.p.bbh=0;L.p.bba=0;refx();all()});
// pixel at (centre.x + 150 + dx, centre.y) in canvas space, alpha/brightness
const px=(dx,dy)=>pg.evaluate(async({dx,dy})=>{dirty=1;await new Promise(r=>setTimeout(r,500));const c=cv.getContext('2d'),s=cv.width/W,x=Math.round(cv.width/2+(150+dx)*s),y=Math.round(cv.height/2+dy*s);return c.getImageData(x,y,1,1).data[0]},{dx,dy});
const h=await px(30,0),v=await px(0,-180);ok('horizontal blur (0°) smears the right edge outward ('+h+') but leaves the top edge clean ('+v+')',h>40&&h<230&&v<12);
await pg.evaluate(()=>{const L=P.layers[0];L.p.bba=90;all()});
const h2=await px(30,0),v2=await px(0,-180+150-150);
const top=await pg.evaluate(async()=>{dirty=1;await new Promise(r=>setTimeout(r,500));const c=cv.getContext('2d'),s=cv.width/W;return c.getImageData(Math.round(cv.width/2),Math.round(cv.height/2-(150+30)*s),1,1).data[0]});
ok('at 90° the smear is vertical: right edge clean ('+h2+'), top edge smeared ('+top+')',h2<12&&top>40&&top<230);
await pg.evaluate(()=>{const L=P.layers[0];L.p.bba=0;L.p.bbw=0;L.p.bbh=0;all()});const z=await px(10,0);ok('zero size is no blur ('+z+')',z<12);
// samples: few samples give visible steps, many give a smooth ramp
await pg.evaluate(()=>{const L=P.layers[0];L.p.bba=0;L.p.bbw=200;L.p.bbh=0;L.p.bbn=2;all()});
const row=async()=>pg.evaluate(async()=>{dirty=1;await new Promise(r=>setTimeout(r,500));const c=cv.getContext('2d'),s=cv.width/W,y=Math.round(cv.height/2),a=[];for(let d=0;d<=100;d+=5)a.push(c.getImageData(Math.round(cv.width/2+(150+d)*s),y,1,1).data[0]);return a});
const lo=await row();await pg.evaluate(()=>{P.layers[0].p.bbn=64;all()});const hi=await row();
const steps=a=>new Set(a.map(x=>Math.round(x/8))).size;
ok('the sample count is yours to choose: 2 samples gives few levels ('+steps(lo)+'), 64 gives a smooth ramp ('+steps(hi)+')',steps(hi)>steps(lo)+4);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
