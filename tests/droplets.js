// Droplets timing (needs Playwright + Chromium): the covered area must follow Progress % almost linearly, so the keyframe easing graph behaves as drawn.
// Measures coverage of a full-frame white layer at 21 progress values for several orders and settings.
// Run: node tests/droplets.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForFunction(()=>SAVEON===true);
const out=await p.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const r=mk('rect');r.p.w=4000;r.p.h=4000;r.p.c1='#ffffff';addFx(r,'drop');r.efa=[...r.efx];delete r.kf.dpp;PV=2;
 const cov=()=>{draw(1);const d=cx.getImageData(0,0,cv.width,cv.height).data;let n=0,t=0;for(let i=0;i<d.length;i+=16){t++;if(d[i]>128)n++}return n/t};
 const cfg=[{n:'default',s:{}},{n:'dense',s:{dps:100}},{n:'sparse',s:{dps:320}},{n:'stagger 1',s:{dpd:1}},{n:'variety 0',s:{dpv:0}},{n:'variety 1',s:{dpv:1}},{n:'other seed',s:{dpz:7}}],res=[];
 for(const c of cfg)for(const od of [0,1,2,3,4]){Object.assign(r.p,{dpo:od,dpd:1.5,dpm:0,dpv:.6,dps:170,dpz:1,dpg:0},c.s);let mx=0;const first=(r.p.dpp=0,cov());r.p.dpp=100;const last=cov();for(let i=0;i<=20;i++){r.p.dpp=i*5;mx=Math.max(mx,Math.abs(cov()-i/20))}res.push({n:c.n,od,mx,first,last,lim:od==0?(c.n=='sparse'?.16:.1):(c.n=='sparse'?.1:.08)})}
 return res});
let fails=0;for(const x of out){const ok=x.mx<=x.lim&&x.first==0&&x.last==1;if(!ok){fails++;console.log('FAIL',x.n,'order',x.od,JSON.stringify({maxOff:+x.mx.toFixed(3),atZero:x.first,atFull:x.last}))}}
console.log('checked',out.length,'cases; errs',errs.slice(0,2),'FAILS',fails);await b.close();process.exit(fails||errs.length?1:0)})()
