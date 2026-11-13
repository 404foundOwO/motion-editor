// Droplets timing (needs Playwright + Chromium). For several orders, growth curves and layer placements:
// nothing is revealed at 0%, the first circle shows almost immediately, the layer is not fully revealed before ~88% (80% for Circ out, which barely moves at its end; Bouncy is not checked because its overshoot covers gaps early), and it is fully revealed at 100%.
// (This is what keeps the Progress keyframe graph meaningful: no dead time at either end.)  Run: node tests/droplets.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForFunction(()=>SAVEON===true);
const out=await p.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const r=mk('rect');r.p.c1='#ffffff';addFx(r,'drop');r.efa=[...r.efx];delete r.kf.dpp;PV=1;
 const cnt=()=>{draw(1);const d=cx.getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>128)n++;return n};
 const lay=[{n:'small centre',s:{w:500,h:400,x:0,y:0}},{n:'small corner',s:{w:420,h:300,x:560,y:-300}},{n:'full frame',s:{w:4000,h:4000,x:0,y:0}},{n:'rotated',s:{w:700,h:300,x:-200,y:100,rz:35}},{n:'scaled',s:{w:300,h:300,x:100,y:0,sc:2.2}}],res=[];
 for(const l of lay)for(const od of [0,1,2,3,4])for(const gr of [3,0,1,2]){Object.assign(r.p,{rz:0,sc:1},l.s,{dpm:0,dpo:od,dpg:gr,dpd:.7,dpv:.5,dps:260,dpz:1,dpf:0});
  r.p.dpp=100;const full=cnt();r.p.dpp=0;const zero=cnt();const at=q=>{r.p.dpp=q;return cnt()/full};res.push({n:l.n,od,gr,zero,early:at(6),late:gr==1?0:at(gr==0?80:88),end:at(99.9)})}
 /* manual mode: user-placed points (1, 3 and 12 of them), also after moving/rotating the layer */
 for(const pts of [[[0,0]],[[-150,-100],[120,60],[0,150]],Array.from({length:12},(_,i)=>[(i%4-1.5)*130,(Math.floor(i/4)-1)*110])])for(const od of [0,1,4])for(const gr of [3,2]){
  Object.assign(r.p,{rz:0,sc:1,w:500,h:400,x:0,y:0,dpm:0,dpt:1,dpo:od,dpg:gr,dpz:1,dpf:0});r.dpts=pts.map(q=>q.slice());
  r.p.dpp=100;const full=cnt();r.p.dpp=0;const zero=cnt();const at=q=>{r.p.dpp=q;return cnt()/full};res.push({n:'manual '+pts.length+'pt',od,gr,zero,early:at(6),late:at(80),end:at(99.9)})}
 r.p.dpt=0;return res});
let fails=0;for(const x of out){const ok=x.zero==0&&x.early>0&&x.late<.9999&&x.end>.995;if(!ok){fails++;console.log('FAIL',x.n,'order',x.od,'growth',x.gr,JSON.stringify({zero:x.zero,at6:+x.early.toFixed(4),late:+x.late.toFixed(4),at99_9:+x.end.toFixed(4)}))}}
console.log('checked',out.length,'cases; errs',errs.slice(0,2),'FAILS',fails);await b.close();process.exit(fails||errs.length?1:0)})()
