// Ignore camera effects flag: a layer with it stays put while the camera shakes / bops / rolls, other layers move. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{P.layers.length=0;P.dur=6;const C=mk('cam');C.name='Camera';P.layers.unshift(P.layers.pop());addFx(C,'shk');C.p.shk=60;
 const A=mk('rect');A.name='shaken';A.p.w=120;A.p.h=120;A.p.x=-300;A.p.c1='#ff0000';A.col='#ff0000';const B=mk('rect');B.name='steady';B.p.w=120;B.p.h=120;B.p.x=300;B.p.c1='#00ff00';B.col='#00ff00';B.ncf=1;refx();all()});
const bbox=(tt)=>pg.evaluate(async(tt)=>{t=tt;dirty=1;await new Promise(r=>setTimeout(r,350));const c=cv.getContext('2d'),w=cv.width,h=cv.height,d=c.getImageData(0,0,w,h).data;const bb=(ch)=>{let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4,r=d[i],g=d[i+1];if(ch=='r'?(r>180&&g<80):(g>180&&r<80)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}}return[x0,y0,x1,y1]};return{r:bb('r'),g:bb('g')}},tt);
const a=await bbox(.3),b=await bbox(.9);const same=(p,q)=>p.every((v,i)=>Math.abs(v-q[i])<=3);
ok('with camera shake the unflagged layer moves ('+a.r+' vs '+b.r+')',!same(a.r,b.r));
ok('the flagged layer stays put ('+a.g+' vs '+b.g+')',same(a.g,b.g)&&a.g[2]>0);
// bop (a whole-scene scale and roll): the flagged layer is still unaffected
await pg.evaluate(()=>{const C=P.layers[0];C.efx=C.efx.filter(k=>k!='shk');addFx(C,'bop');C.p.bobi=30;C.p.bobt=8;refx();all()});
const c1=await bbox(.1),c2=await bbox(.37),c3=await bbox(.6);
ok('under bop the unflagged layer changes size or place ('+c1.r+' / '+c2.r+' / '+c3.r+')',!(same(c1.r,c2.r)&&same(c2.r,c3.r)));
ok('and the flagged layer does not ('+c1.g+' / '+c2.g+' / '+c3.g+')',same(c1.g,c2.g)&&same(c2.g,c3.g));
// whole-picture camera effects (here: grayscale) do not touch a flagged layer
await pg.evaluate(()=>{const C=P.layers[0];C.efx=C.efx.filter(k=>k!='bop');addFx(C,'gr');C.p.gr=1;refx();all()});
const px=await pg.evaluate(async()=>{t=.5;dirty=1;await new Promise(r=>setTimeout(r,400));const c=cv.getContext('2d'),s=cv.width/W,g=(x,y)=>[...c.getImageData(Math.round(cv.width/2+x*s),Math.round(cv.height/2+y*s),1,1).data].slice(0,3);return{r:g(-300,0),g:g(300,0)}});
ok('grayscale on the camera: the unflagged layer turns grey ('+px.r+'), the flagged one keeps its colour ('+px.g+')',Math.abs(px.r[0]-px.r[1])<12&&px.g[1]>200&&px.g[0]<60);
ok('the Flags tab has the option for a layer',await pg.evaluate(()=>{sel=P.layers[2].id;tab='Flags';side();return !!document.querySelector('#side [data-f=ncf]')}));
ok('and not for the camera',await pg.evaluate(()=>{sel=P.layers[0].id;tab='Flags';side();return !document.querySelector('#side [data-f=ncf]')}));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
