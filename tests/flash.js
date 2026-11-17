// Beat flash / light leak: Opacity setting, nothing is drawn at 0, old projects look the same. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{P.layers.length=0;P.dur=5;const C=mk('cam');C.name='Camera';P.layers.unshift(P.layers.pop());addFx(C,'flash');C.p.flb=60;C.p.flo=0;C.p.fld=1;C.p.flx=.5;C.p.fly=.5;C.p.fls=1.5;C.p.flc='#ffffff';C.p.flt=100;refx();all()});
const lum=async(o)=>pg.evaluate(async(o)=>{const C=P.layers[0];if(o!=null)C.p.flt=o;t=1;dirty=1;await new Promise(r=>setTimeout(r,400));const c=cv.getContext('2d');return c.getImageData(Math.round(cv.width/2),Math.round(cv.height/2),1,1).data[0]},o);
const full=await lum(100),half=await lum(50),zero=await lum(0);
ok('opacity 100 lights the picture ('+full+'), 50 about half ('+half+'), 0 draws nothing ('+zero+')',full>150&&half>20&&half<full-30&&zero==0);
ok('an old project without the setting looks like 100%',await pg.evaluate(async()=>{const C=P.layers[0];delete C.p.flt;refx();t=1;dirty=1;await new Promise(r=>setTimeout(r,400));const c=cv.getContext('2d');return c.getImageData(Math.round(cv.width/2),Math.round(cv.height/2),1,1).data[0]>150}));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
