// Selecting several clips (Shift+click, Shift+drag rectangle) and copying, cutting, duplicating and deleting them together. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1300,height:1000}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const build=()=>pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','430px');P.layers.length=0;id=1;P.dur=12;MS.clear();ks=[];mk('cam');
 const add=(n,s,e)=>{const l=mk('rect');l.name=n;l.s=s;l.e=e;l.p.w=200;l.p.h=100;return l};add('A',0,3);add('B',4,7);add('C',8,11);add('D',0,12);sel=null;all();commit()});
const names=()=>pg.evaluate(()=>P.layers.map(l=>l.name||l.type).join(','));
const ms=()=>pg.evaluate(()=>[...MS].map(i=>P.layers.find(l=>l.id==i).name).sort().join(','));
const bar=n=>pg.evaluate(n=>{const L=P.layers.find(l=>l.name==n),b=document.querySelector('#tlin .row[data-id="'+L.id+'"] .bar').getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2}},n);
const spot=(n,tS)=>pg.evaluate(({n,tS})=>{const L=P.layers.find(l=>l.name==n),r=document.querySelector('#tlin .row[data-id="'+L.id+'"]').getBoundingClientRect(),ru=document.querySelector('#ru').getBoundingClientRect();return{x:ru.left+tS/P.dur*ru.width,y:r.top+r.height/2,top:r.top+3,bot:r.bottom-3}},{n,tS});
const shiftClick=async n=>{const b=await bar(n);await pg.keyboard.down('Shift');await pg.mouse.click(b.x,b.y);await pg.keyboard.up('Shift')};
await build();
// 1. Shift+click clips
const a=await bar('A');await pg.mouse.click(a.x,a.y);await shiftClick('C');ok('Shift+click adds a second clip to the selection ('+await ms()+')',(await ms())=='A,C');
await shiftClick('B');ok('and a third ('+await ms()+')',(await ms())=='A,B,C');
await shiftClick('C');ok('Shift+click on a selected clip removes it ('+await ms()+')',(await ms())=='A,B');
ok('the selected clips are highlighted in the timeline',await pg.evaluate(()=>document.querySelectorAll('#tlin .row.ms').length)==2);
ok('Shift+click did not move or change any clip',(await pg.evaluate(()=>P.layers.filter(l=>l.type!='cam').map(l=>l.name+l.s+'-'+l.e).join()))=='A0-3,B4-7,C8-11,D0-12');
await pg.evaluate(()=>{MS.clear();tl()});
// name column Shift+click still works
{const nm=await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='A'),r=document.querySelector('#tlin .row[data-id="'+L.id+'"] .nm').getBoundingClientRect();return{x:r.left+30,y:r.top+r.height/2}});const nm2=await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='D'),r=document.querySelector('#tlin .row[data-id="'+L.id+'"] .nm').getBoundingClientRect();return{x:r.left+30,y:r.top+r.height/2}});
 await pg.mouse.click(nm.x,nm.y);await pg.keyboard.down('Shift');await pg.mouse.click(nm2.x,nm2.y);await pg.keyboard.up('Shift');ok('Shift+click on the name column still adds to the selection ('+await ms()+')',(await ms())=='A,D');await pg.evaluate(()=>{MS.clear();tl()})}
// 2. rectangle selection picks clips, not keyframes
await pg.evaluate(()=>{const B=P.layers.find(l=>l.name=='B');B.kf.x=[{t:4.5,v:0,e:'lin'},{t:6,v:30,e:'lin'}];sel=B.id;all()});
{const s=await spot('C',1),e=await spot('B',11.5);await pg.keyboard.down('Shift');await pg.mouse.move(s.x,s.y);await pg.mouse.down();await pg.mouse.move((s.x+e.x)/2,(s.y+e.y)/2,{steps:6});await pg.mouse.move(e.x,e.y,{steps:6});await pg.mouse.up();await pg.keyboard.up('Shift');await pg.waitForTimeout(250);
 ok('Shift+drag on empty timeline space selects the clips inside the rectangle ('+await ms()+')',(await ms())=='B,C');ok('and no keyframes',await pg.evaluate(()=>ks.length==0));}
// Alt+Shift+drag still picks keyframes
await pg.evaluate(()=>{MS.clear();const B=P.layers.find(l=>l.name=='B');sel=B.id;ks=[];all()});
{const s=await spot('B',4.2),e=await spot('B',6.5);await pg.keyboard.down('Shift');await pg.keyboard.down('Alt');await pg.mouse.move(s.x,s.top);await pg.mouse.down();await pg.mouse.move(e.x,e.bot,{steps:8});await pg.mouse.up();await pg.keyboard.up('Alt');await pg.keyboard.up('Shift');await pg.waitForTimeout(250);
 ok('Alt+Shift+drag still selects keyframes ('+await pg.evaluate(()=>ks.length)+')',(await pg.evaluate(()=>ks.length))>=1&&(await ms())=='');}
// 3. copy and paste several clips with the keyboard
await build();await pg.evaluate(()=>{MS.clear();const A=P.layers.find(l=>l.name=='A'),C=P.layers.find(l=>l.name=='C');MS.add(A.id);MS.add(C.id);sel=A.id;t=1;all();document.activeElement&&document.activeElement.blur()});
await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.waitForTimeout(250);
const cp=await pg.evaluate(()=>P.layers.filter(l=>/ copy$/.test(l.name)).map(l=>({n:l.name,s:l.s,e:l.e})));
ok('Copy and Paste copy every selected clip ('+JSON.stringify(cp)+')',cp.length==2&&cp.find(c=>c.n=='A copy').s==1&&Math.abs(cp.find(c=>c.n=='C copy').s-9)<.01);
ok('the pasted clips are the new selection ('+await ms()+')',(await ms())=='A copy,C copy');ok('the originals are untouched',(await pg.evaluate(()=>['A','C'].map(n=>{const l=P.layers.find(x=>x.name==n);return l.s+'-'+l.e}).join()))=='0-3,8-11');
// duplicate button
await build();await pg.evaluate(()=>{const A=P.layers.find(l=>l.name=='A'),B=P.layers.find(l=>l.name=='B');MS.add(A.id);MS.add(B.id);sel=A.id;t=0;all()});
await pg.click('#dup');await pg.waitForTimeout(250);ok('the Duplicate button duplicates all selected clips ('+await names()+')',(await pg.evaluate(()=>P.layers.filter(l=>/ copy$/.test(l.name)).length))==2);
// cut = copy + delete everything selected, undo brings them back
await build();await pg.evaluate(()=>{const A=P.layers.find(l=>l.name=='A'),C=P.layers.find(l=>l.name=='C');MS.add(A.id);MS.add(C.id);sel=A.id;all()});
await pg.keyboard.press('Control+x');await pg.waitForTimeout(250);ok('Cut removes all selected clips ('+await names()+')',(await names())=='Camera,B,D');
await pg.evaluate(()=>{t=5;all()});await pg.keyboard.press('Control+v');await pg.waitForTimeout(250);ok('and Paste brings them back together ('+(await pg.evaluate(()=>P.layers.filter(l=>l.name=='A copy'||l.name=='C copy').length))+' clips)',(await pg.evaluate(()=>P.layers.filter(l=>l.name=='A copy'||l.name=='C copy').length))==2);
// delete button
await build();await pg.evaluate(()=>{const A=P.layers.find(l=>l.name=='A'),B=P.layers.find(l=>l.name=='B');MS.add(A.id);MS.add(B.id);sel=A.id;all()});
await pg.click('#del');await pg.waitForTimeout(250);ok('Delete removes all selected clips and nothing else ('+await names()+')',(await names())=='Camera,C,D');
await pg.evaluate(()=>undo());await pg.waitForTimeout(250);ok('undo brings them back ('+await names()+')',(await names())=='Camera,A,B,C,D');
// a group and its child both selected are copied once
await build();await pg.evaluate(()=>{const G=mk('group');G.name='G';G.col=false;const k1=mk('rect');k1.name='K1';k1.par=G.id;const k2=mk('rect');k2.name='K2';k2.par=G.id;MS.clear();MS.add(G.id);MS.add(k1.id);sel=G.id;t=0;all()});
await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.waitForTimeout(250);
const gc=await pg.evaluate(()=>({n:P.layers.filter(l=>/ copy$/.test(l.name)).map(l=>l.name).sort().join(),kids:P.layers.filter(l=>l.name=='G copy').map(g=>P.layers.filter(k=>k.par==g.id).length)[0]}));
ok('a group and one of its children selected together are copied once, with the group\'s children ('+JSON.stringify(gc)+')',gc.n=='G copy,K1 copy,K2 copy'&&gc.kids==2);
// single clip copy is unchanged
await build();await pg.evaluate(()=>{MS.clear();sel=P.layers.find(l=>l.name=='A').id;t=2;all()});await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.waitForTimeout(250);
ok('copying one clip still works as before: one copy at the playhead, selected ('+await names()+')',(await pg.evaluate(()=>P.layers.filter(l=>/ copy$/.test(l.name)).length))==1&&(await pg.evaluate(()=>P.layers.find(l=>l.id==sel).name))=='A copy'&&(await pg.evaluate(()=>MS.size))==0&&(await pg.evaluate(()=>P.layers.find(l=>l.name=='A copy').s))==2);
// lanes view
await build();await pg.evaluate(()=>setLanes(true,false));await pg.waitForTimeout(300);
{const s=await spot('B',3.5),e=await spot('C',11.8);await pg.keyboard.down('Shift');await pg.mouse.move(s.x,s.top);await pg.mouse.down();await pg.mouse.move((s.x+e.x)/2,(s.top+e.bot)/2,{steps:6});await pg.mouse.move(e.x,e.bot,{steps:6});await pg.mouse.up();await pg.keyboard.up('Shift');await pg.waitForTimeout(250);
 ok('the rectangle works in the lanes view too ('+await ms()+')',(await ms()).split(',').includes('B')&&(await ms()).split(',').includes('C'));}
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
