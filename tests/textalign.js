// Text alignment (Left / Center / Right buttons -> 'tal') for text layers and the source caption. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1280,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
// lit-pixel x extents of the top and bottom text line (a white text on black, two lines)
const lines=()=>pg.evaluate(()=>{t=2;dirty=1;draw(t);const d=MAINCX.getImageData(0,0,W,H).data;let y0=H,y1=-1;const lit=(x,y)=>d[(y*W+x)*4+3]>0&&d[(y*W+x)*4]>128;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(lit(x,y)){y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const mid=(y0+y1)/2,ext=(a,b)=>{let l=W,r=-1;for(let y=a;y<=b;y++)for(let x=0;x<W;x++)if(lit(x,y)){l=Math.min(l,x);r=Math.max(r,x)}return[l,r]};return{top:ext(y0,Math.floor(mid)),bot:ext(Math.ceil(mid),y1)}});
await pg.evaluate(()=>{P.layers.length=0;mk('cam');const L=mk('text');L.text='Hi\nA much longer line here';L.p.sz=120;L.col='#ffffff';L.p.c1='#ffffff';sel=L.id;tab='Font';all()});
const click=n=>pg.click(`button[data-tal="${n}"]`);
for(const [n,name] of [[0,'left'],[0.5,'center'],[1,'right']]){await click(n);await pg.waitForTimeout(100);const r=await lines(),L=await pg.evaluate(()=>cur().p.tal);
 const diff=name=='left'?r.top[0]-r.bot[0]:name=='right'?r.top[1]-r.bot[1]:(r.top[0]+r.top[1])/2-(r.bot[0]+r.bot[1])/2;ok(`text ${name}: tal=${L}, short line offset ${diff.toFixed(1)}px`,L==n&&Math.abs(diff)<=8)}
ok('button shows the current choice',await pg.evaluate(()=>document.querySelector('button[data-tal="1"]').classList.contains('on')));
// source caption
await pg.evaluate(()=>{P.layers.length=0;mk('cam');const L=mk('text');L.text='Hi\nA much longer caption line here';L.col='#ffffff';addFx(L,'srccap');L.p.c1='#ffffff';L.p.cpo=0;L.p.cps=0;L.p.cph=0;L.p.cpf=.01;L.p.cpt=0;sel=L.id;all()});
for(const [n,name] of [[0,'left'],[0.5,'center'],[1,'right']]){await pg.evaluate(n=>{cur().p.tal=n},n);const r=await lines(),diff=name=='left'?r.top[0]-r.bot[0]:name=='right'?r.top[1]-r.bot[1]:(r.top[0]+r.top[1])/2-(r.bot[0]+r.bot[1])/2;ok(`source caption ${name}: offset ${diff.toFixed(1)}px`,Math.abs(diff)<=8)}
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
