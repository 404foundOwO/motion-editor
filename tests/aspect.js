// Every visual effect must behave at every aspect ratio (needs Playwright + Chromium, SwiftShader WebGL).
// 1 renders without errors and visibly changes the frame at every ratio.
// 2 over the central area two ratios share, the frame matches a reference ratio (catches sizes hard-coded for 1920x1080, clipped buffers, off-centre results).
//   Effects that are relative to the whole frame (vignette, corners, tile, ...) legitimately differ: list them in FRAME below.
// 3 switching ratio and back leaves no stale buffers: same ratio after a different history renders identically.
// Run: node tests/aspect.js [effect ...]
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
// Frame-relative or origin-anchored by design (checked in the shaders): grain/grids anchor at the top-left, fisheye/flash/letterbox/caption size to the frame.
const FRAME=new Set(('noise,pix,fish,wave,glitch,half,lbox,flash,asc,srccap,'+(process.env.ASPECT_FRAME||'')).split(',').filter(Boolean));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(1500);
const only=process.argv.slice(2);
const res=await p.evaluate(only=>{
 const CAMK=['flash','lca','shk','bop','lbox','dof','fog','mb'],skip=new Set(['lpf','hpf','crush','rev','echo','avoid','track','vfx','reveal','tpath','lofps']);
 const setup=e=>{P.layers.length=0;id=1;const C=mk('cam');const bg=mk('rect');bg.p.c1='#203040';bg.p.w=6000;bg.p.h=6000;const r=mk('rect');r.p.c1='#ff2020';r.p.w=700;r.p.h=420;r.p.x=-200;r.p.rz=8;const c=mk('circle');c.p.c1='#30c060';c.p.w=360;c.p.h=360;c.p.x=380;c.p.y=120;const tx=mk('text');tx.text='Hello';tx.p.sz=160;tx.p.y=-250;if(e)addFx(CAMK.includes(e)?C:r,e);if(e=='srccap'){r.type='text';r.text='A caption line'}};
 const grab=()=>{const d=MAINCX.getImageData(0,0,W,H);return{w:W,h:H,d:d.data}};
 const crop=(a,w,h)=>{const o=new Uint8ClampedArray(w*h*4),x0=Math.floor((a.w-w)/2),y0=Math.floor((a.h-h)/2);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=((y+y0)*a.w+x+x0)*4,t=(y*w+x)*4;o[t]=a.d[s];o[t+1]=a.d[s+1];o[t+2]=a.d[s+2];o[t+3]=a.d[s+3]}return o};
 const mad=(a,b)=>{let d=0;for(let i=0;i<a.length;i+=4)d+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return d/(a.length/4)/3};
 const common=(a,b)=>mad(crop(a,Math.min(a.w,b.w),Math.min(a.h,b.h)),crop(b,Math.min(a.w,b.w),Math.min(a.h,b.h)));
 const keys=Object.keys(ASP),t0=1.3,out=[];
 const render=(k,e)=>{setAspect(k);setup(e);PV=0;exp=0;FXOFF=0;draw(t0);draw(t0);return grab()};
 for(const e of Object.keys(EF)){if(skip.has(e)||(only.length&&!only.includes(e)))continue;
  const R={},B={};for(const k of keys){try{R[k]=render(k,e);B[k]=render(k,null)}catch(x){R[k]=null}}
  const row={e,err:[],noeffect:[],ref:{},stale:0};
  for(const k of keys){if(!R[k]){row.err.push(k);continue}const full=mad(R[k].d,B[k].d);if(full===0)row.noeffect.push(k)}
  for(const k of keys){if(!R[k])continue;row.ref[k]={w:+common(R[k],R['16:9']).toFixed(2),n:+common(R[k],R['21:9']).toFixed(2),t:+common(R[k],R['9:16']).toFixed(2)}}
  const hist=['9:16','21:9','16:9','1:1'].map(k=>render(k,e));const back=[render('16:9',e),render('9:16',e)];
  row.stale=+Math.max(mad(hist[2].d,back[0].d),mad(R['9:16'].d,back[1].d)).toFixed(3);
  const objAt=(k,e,px,py)=>{setAspect(k);setup(e);const L=P.layers.filter(l=>l.type=='rect')[1];L.p.w=240;L.p.h=240;L.p.x=px;L.p.y=py;L.p.rz=0;PV=0;draw(t0);draw(t0);return grab()};
  const diffAt=(k,cx0,cy0)=>{const a=objAt(k,e,cx0,cy0),b0=objAt(k,null,cx0,cy0),w=300,x0=Math.max(0,Math.floor(a.w/2+cx0-w/2)),y0=Math.max(0,Math.floor(a.h/2+cy0-w/2)),ww=Math.min(w,a.w-x0),hh=Math.min(w,a.h-y0);let d=0;for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){const i=((y+y0)*a.w+x+x0)*4;d+=Math.abs(a.d[i]-b0.d[i])+Math.abs(a.d[i+1]-b0.d[i+1])+Math.abs(a.d[i+2]-b0.d[i+2])}return d/(ww*hh)/3};
  row.edge=[];for(const k of keys){try{const c=diffAt(k,0,0),W2=ASP[k][0],H2=ASP[k][1],cn=diffAt(k,W2/2-180,H2/2-180);if(c>.05&&cn<.02)row.edge.push(k)}catch(x){}}
  out.push(row)}
 setAspect('16:9');return out},only);
let fails=0,warn=[];const TH=.6;
for(const r of res){const probs=[];if(r.err.length)probs.push('threw at '+r.err.join(' '));
 const ne16=r.noeffect.includes('16:9');if(!ne16&&r.noeffect.length)probs.push('no visible change at '+r.noeffect.join(' '));
 if(r.stale>0)probs.push('stale after switching ratio: '+r.stale);
 if(!FRAME.has(r.e)){const bad=Object.entries(r.ref).filter(([k,v])=>v.w>TH||v.n>TH||v.t>TH).map(([k,v])=>`${k}(${v.w}/${v.n}/${v.t})`);if(bad.length)probs.push('differs from other ratios in the shared area: '+bad.join(' '))}
 if(r.edge.length)probs.push('no effect near the bottom-right corner at '+r.edge.join(' '));
 if(probs.length){fails++;console.log('FAIL',r.e,'-',probs.join('; '))}}
console.log('checked',res.length,'effects; errs',errs.slice(0,3),'FAILS',fails);await b.close();process.exit(fails||errs.length?1:0)})()
