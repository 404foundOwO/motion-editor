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
// <p:N> pause tag
const st=await pg.evaluate(()=>[capStarts('A\n<p:2>\nB\nC',1),capStarts('A\n<p:1>B',1),capStarts('A\n\nB',1)]);
const eq=(a,b)=>JSON.stringify(a)==JSON.stringify(b);
const okp=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
okp('pause line adds exactly N seconds: '+JSON.stringify(st[0]),eq(st[0],[0,3,3,4]));
okp('<p:N> in front of a line delays that line: '+JSON.stringify(st[1]),eq(st[1],[0,2]));
okp('blank lines still add one line delay: '+JSON.stringify(st[2]),eq(st[2],[0,1,2]));
const h=await pg.evaluate(()=>{setAspect('16:9');P.layers.length=0;id=1;mk('cam');const bg=mk('rect');bg.p.w=6000;bg.p.h=6000;bg.p.c1='#ffffff';const L=mk('text');L.text='First\n<p:2>\nSecond';L.col='#000000';addFx(L,'srccap');L.p.c1='#000000';L.p.cpo=0;L.p.cps=1;L.p.cph=0;L.p.cpf=.01;L.p.cpt=0;L.s=0;sel=L.id;
 const rows=tt=>{t=tt;dirty=1;draw(t);const d=MAINCX.getImageData(0,0,W,H).data;let y0=H,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i]<100&&d[i+3]>0){y0=Math.min(y0,y);y1=Math.max(y1,y)}}return y1<0?0:y1-y0};return[rows(.5),rows(2.5),rows(3.6)]});
okp('before the pause ends only the first line shows, after it both: '+JSON.stringify(h),h[0]>0&&Math.abs(h[1]-h[0])<4&&h[2]>h[0]*1.5);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
