// Preview consistency (needs Playwright + Chromium; uses SwiftShader WebGL so it runs headless).
// For every visual effect: render at full and at 1/4 preview, downscale full to 1/4 and compare;
// toggling effects off and on must give the identical frame; the WebGL pixel read-back path
// (used by Firefox/Safari) must match the direct path.
// Run: node tests/consistency.js   (optional: a URL or file path as the first argument)
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
const LIMIT={default:.6,noise:1.5,edge:1.3,flash:.9};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u=process.argv[2]||('file://'+path.resolve(__dirname,'../index.html'));await p.goto(u.includes('://')?u:'file://'+path.resolve(u));await p.waitForTimeout(1500);
const res=await p.evaluate(()=>{
 const CAMK=['flash','lca','shk','bop','lbox','dof','fog','mb'],skip=new Set(['lpf','hpf','crush','rev','echo','srccap','avoid','track','vfx','reveal','tpath','lofps','flick','wipe']);
 const setup=e=>{P.layers.length=0;id=1;const C=mk('cam');const bg=mk('rect');bg.p.c1='#203040';bg.p.w=4000;bg.p.h=4000;const r=mk('rect');r.p.c1='#ff2020';r.p.w=700;r.p.h=420;r.p.x=-200;r.p.rz=8;const c=mk('circle');c.p.c1='#30c060';c.p.w=360;c.p.h=360;c.p.x=380;c.p.y=120;const tx=mk('text');tx.text='Hello';tx.p.sz=160;tx.p.y=-250;addFx(CAMK.includes(e)?C:r,e)};
 const shot=()=>{const g=document.createElement('canvas');g.width=480;g.height=270;const x=g.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(cv,0,0,480,270);return x.getImageData(0,0,480,270).data};
 const mad=(a,b)=>{let d=0;for(let i=0;i<a.length;i+=4)d+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return d/(a.length/4)/3};
 const out=[],t0=1.3;
 for(const e of Object.keys(EF)){if(skip.has(e))continue;setup(e);exp=0;FXOFF=0;GLRB=false;
  PV=0;draw(t0);const full=shot();PV=2;draw(t0);const q=shot();FXOFF=1;draw(t0);FXOFF=0;draw(t0);const q2=shot();
  GLRB=true;draw(t0);const rb=shot();GLRB=false;
  out.push({e,res:mad(full,q),toggle:mad(q,q2),readback:mad(q,rb)})}
 PV=0;return out});
let fails=0;for(const r of res){const lim=LIMIT[r.e]||LIMIT.default,ok=r.res<=lim&&r.toggle==0&&r.readback<.05;if(!ok){fails++;console.log('FAIL',r.e,JSON.stringify({res:+r.res.toFixed(2),toggle:+r.toggle.toFixed(2),readback:+r.readback.toFixed(3)}))}}
console.log('checked',res.length,'effects; errs',errs.slice(0,3),'FAILS',fails);await b.close();process.exit(fails?1:0)})()
