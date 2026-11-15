// Timeline row order: the top row is the top of the stack (display only; P.layers keeps bottom -> top). Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1400,height:1000}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const rows=()=>pg.evaluate(()=>[...document.querySelectorAll('#tlin .row[data-id]')].map(r=>r.querySelector('.nt').textContent+(parseInt(r.querySelector('.nm').style.paddingLeft)>8?'*':'')).join(','));
const stored=()=>pg.evaluate(()=>P.layers.map(l=>l.name).join(','));
const setup=()=>pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam').name='Camera';for(const n of ['A','B','C']){const l=mk('rect');l.name=n;l.p.w=100;l.p.h=100}sel=null;all();commit()});
await pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','430px')});await pg.waitForTimeout(200);
await setup();
ok('rows run from the top of the stack down, camera first ('+await rows()+')',(await rows())=='Camera,C,B,A');
ok('the stored order is untouched, bottom to top ('+await stored()+')',(await stored())=='Camera,A,B,C');
await pg.evaluate(()=>{CLAUDE.addLayer('circle');P.layers[P.layers.length-1].name='D';all()});
ok('a new layer appears at the top of the list ('+await rows()+')',(await rows())=='Camera,D,C,B,A');
// groups: header first, children listed top-down inside it (indented *)
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam').name='Camera';const X=mk('rect');X.name='X';const G=mk('group');G.name='G';G.col=false;const K1=mk('rect');K1.name='K1';K1.par=G.id;const K2=mk('rect');K2.name='K2';K2.par=G.id;const Y=mk('rect');Y.name='Y';all()});
ok('a group lists its header, then its children top-down ('+await rows()+')',(await rows())=='Camera,Y,G,K2*,K1*,X');
// drag and drop
const drag=async(fromName,toName,yFrac)=>{const get=async n=>pg.evaluate(n=>{const r=[...document.querySelectorAll('#tlin .row[data-id]')].find(r=>r.querySelector('.nt').textContent==n);const b=r.getBoundingClientRect(),nm=r.querySelector('.nm').getBoundingClientRect();return{x:nm.left+nm.width/2,y:b.top,h:b.height}},n);
 const a=await get(fromName),b=toName?await get(toName):null;await pg.mouse.move(a.x,a.y+a.h/2);await pg.mouse.down();await pg.mouse.move(a.x,a.y+a.h/2+8,{steps:3});
 if(b)await pg.mouse.move(b.x,b.y+b.h*yFrac,{steps:8});else{await pg.mouse.move(b?b.x:a.x,1000,{steps:3});const box=await pg.evaluate(()=>{const r=document.querySelector('#tlin').getBoundingClientRect();return{l:r.left,b:r.bottom,t:r.top}});await pg.mouse.move(a.x,box.b-6,{steps:6})}
 await pg.mouse.up();await pg.waitForTimeout(150)};
await setup();await drag('A','C',.15);
ok('dropping on the upper half of a row puts the layer above it ('+await rows()+')',(await rows())=='Camera,A,C,B');
ok('which is the top of the stack in the stored order ('+await stored()+')',(await stored())=='Camera,B,C,A');
await setup();await drag('C','A',.85);
ok('dropping on the lower half puts it below ('+await rows()+')',(await rows())=='Camera,B,A,C');
ok('stored bottom first ('+await stored()+')',(await stored())=='Camera,C,A,B');
await setup();await drag('B','C',.15);ok('moving a layer up one row ('+await rows()+')',(await rows())=='Camera,B,C,A');
await setup();await drag('C','B',.85);ok('moving a layer down one row ('+await rows()+')',(await rows())=='Camera,B,C,A');
await setup();await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam').name='Camera';const G=mk('group');G.name='G';G.col=false;const A=mk('rect');A.name='A';const B=mk('rect');B.name='B';all()});
await drag('A','G',.5);
ok('dropping on a group header puts the layer inside it, on top ('+await rows()+')',(await rows())=='Camera,B,G,A*');
await setup();await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam').name='Camera';const A=mk('rect');A.name='A';const G=mk('group');G.name='G';G.col=false;const K=mk('rect');K.name='K';K.par=G.id;const B=mk('rect');B.name='B';all()});
await drag('K',null);
const r2=await rows(),s2=await pg.evaluate(()=>P.layers.find(l=>l.name=='K').par);
ok('dropping in the empty area takes a layer out of its group and puts it at the bottom ('+r2+')',(s2===null||s2===undefined)&&r2.split(',').pop()=='K');
// undo restores the order
await setup();await drag('A','C',.15);await pg.evaluate(()=>undo());await pg.waitForTimeout(100);
ok('undo brings the old order back ('+await rows()+')',(await rows())=='Camera,C,B,A');
// the picture is decided by the stored order only: top row is drawn last (on top)
const px=await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const bot=mk('rect');bot.name='bottom';bot.p.c1='#ff0000';bot.p.w=900;bot.p.h=900;const top=mk('rect');top.name='top';top.p.c1='#0000ff';top.p.w=500;top.p.h=500;all();t=0;dirty=1;draw(0);const d=MAINCX.getImageData(Math.round(W/2),Math.round(H/2),1,1).data;return[d[0],d[1],d[2]]});
ok('the layer in the top row is the one drawn on top ('+JSON.stringify(px)+', rows '+await rows()+')',px[2]>200&&px[0]<50&&(await rows()).split(',')[1]=='top');
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
