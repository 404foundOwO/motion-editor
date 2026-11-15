// Source caption (srccap) must stay centred, inside the canvas and near the bottom at every aspect ratio, both when added after the ratio is set and when the ratio changes afterwards. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1280,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);
const keys=await pg.evaluate(()=>Object.keys(ASP));let F=0;
const measure=(k,addFirst)=>pg.evaluate(([k,addFirst])=>{
 setAspect(addFirst?'16:9':k);P.layers.filter(l=>l.type!='cam').forEach(l=>CLAUDE.removeLayer(l.id));
 const bg=CLAUDE.addLayer('rect');CLAUDE.setProp(bg,'w',W*2);CLAUDE.setProp(bg,'h',H*2);const id=CLAUDE.addText('x',{});CLAUDE.setLayer(id,{s:0});CLAUDE.addEffect(id,'srccap');
 P.layers.find(l=>l.id==id).text='A source caption that is fairly long and should wrap onto a second line when the box is narrow\nSecond line';
 if(addFirst)setAspect(k);
 t=2;dirty=1;draw(t);const d=MAINCX.getImageData(0,0,W,H).data;let x0=W,x1=-1,y0=H,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]>0&&d[i]+d[i+1]+d[i+2]<600){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
 return{W,H,x0,x1,y0,y1}},[k,addFirst]);
for(const addFirst of [false,true])for(const k of keys){const r=await measure(k,addFirst);
 const inside=r.x1>=0&&r.x0>0&&r.x1<r.W-1&&r.y0>0&&r.y1<r.H-1,centred=Math.abs((r.x0+r.x1)/2-r.W/2)<=r.W*.03,low=r.y0>r.H*.5;
 const ok=inside&&centred&&(addFirst||Math.abs((r.H-1-r.y1)/r.H-.14)<.01)&&low;if(!ok)F++;
 console.log(ok?'PASS':'FAIL',addFirst?'switched to':'added at',k,`${r.W}x${r.H}`,JSON.stringify({x0:r.x0,x1:r.x1,y0:r.y0,y1:r.y1}))}
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
