// Lanes view: clips that do not overlap share a row; existing projects are untouched; drag a clip to another lane, or drop a pool clip on a lane. Needs Playwright Chromium (the pool-drop part also needs ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lanes-'));let vid=null;try{vid=path.join(dir,'two.webm');cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=2:size=320x180:rate=30 -c:v libvpx -b:v 500k ${vid}`)}catch(e){vid=null}
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1300,height:1000}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message+' @'+(e.stack||'').split('\n').slice(1,4).join('|')));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const build=()=>pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','430px');P.layers.length=0;id=1;P.dur=12;mk('cam');
 const add=(n,ty,s,e,c)=>{const l=mk(ty);l.name=n;l.s=s;l.e=e;if(c)l.p.c1=c;l.p.w=240;l.p.h=140;return l};
 add('Intro','rect',0,3,'#e03030');add('PhotoA','rect',3.5,6,'#e0a030');add('PhotoB','rect',6.5,9,'#30c060');add('Outro','rect',9.5,12,'#30c0c0');add('Music','rect',0,12,'#3060e0');add('Logo','circle',2,10,'#c040f0');add('Flash','circle',4,5,'#ffffff');
 for(const l of P.layers)delete l.ln;sel=null;all();commit()});
const frames=()=>pg.evaluate(async()=>{const out=[];for(const tt of [.5,3,4.5,7,10.5]){t=tt;dirty=1;draw(t);draw(t);const d=MAINCX.getImageData(0,0,W,H).data;let h=0;for(let i=0;i<d.length;i+=7)h=(h*31+d[i])>>>0;out.push(h)}return out.join()});
const order=()=>pg.evaluate(()=>P.layers.map(l=>l.name||l.type).join(','));
const lanes=()=>pg.evaluate(()=>{const m=new Map();for(const r of document.querySelectorAll('#tlin .row[data-id]')){const l=P.layers.find(x=>x.id==+r.dataset.id),k=r.style.gridRow;(m.get(k)||m.set(k,[]).get(k)).push(l.name||l.type)}return[...m.values()].map(a=>a.join('+')).join(' | ')});
const bar=name=>pg.evaluate(name=>{const L=P.layers.find(l=>l.name==name),b=document.querySelector('#tlin .row[data-id="'+L.id+'"] .bar').getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2,w:b.width,id:L.id}},name);
const rowY=name=>pg.evaluate(name=>{const L=P.layers.find(l=>l.name==name),r=document.querySelector('#tlin .row[data-id="'+L.id+'"]').getBoundingClientRect();return{top:r.top,mid:r.top+r.height/2,bot:r.bottom}},name);
const drag=async(name,dx,toY)=>{const b=await bar(name);await pg.mouse.move(b.x,b.y);await pg.mouse.down();const y=toY==null?b.y:toY;await pg.mouse.move(b.x+dx/2,(b.y+y)/2,{steps:5});await pg.mouse.move(b.x+dx,y,{steps:6});await pg.mouse.up();await pg.waitForTimeout(250)};
// 1. an existing project: the same picture, the same stored order, before / with / after lanes
await build();const f0=await frames(),o0=await order(),json0=await pg.evaluate(()=>JSON.stringify(P.layers.map(l=>{const c={...l};delete c.ln;delete c.el;delete c.buf;delete c.sbuf;delete c.efa;return c})));
ok('one layer per row to begin with',await pg.evaluate(()=>!document.querySelector('#tlin').classList.contains('lanes')&&document.querySelectorAll('#tlin .row[data-id]').length==8));
await pg.click('#tll');await pg.waitForTimeout(400);
const f1=await frames(),o1=await order(),json1=await pg.evaluate(()=>JSON.stringify(P.layers.map(l=>{const c={...l};delete c.ln;delete c.el;delete c.buf;delete c.sbuf;delete c.efa;return c})));
ok('switching lanes on does not change the picture, the stacking order, or anything stored except the new lane field',f0===f1&&o0===o1&&json0===json1);
ok('clips that do not overlap share a row ('+await lanes()+')',(await lanes())=='Camera | Flash | Logo | Music | Intro+PhotoA+PhotoB+Outro');
const nm=await pg.evaluate(()=>[...document.querySelectorAll('#tlin .row[data-id]:not(.lnx) .nt')].map(n=>n.textContent).join('|'));
ok('a shared lane is labelled with its clip count, single lanes keep the layer name ('+nm+')',/Lane \d · 4 clips/.test(nm)&&/Flash\|Logo\|Music/.test(nm));
await pg.click('#tll');await pg.waitForTimeout(300);ok('switching back gives one layer per row again, same picture',(await frames())===f0&&await pg.evaluate(()=>document.querySelectorAll('#tlin .row[data-id]').length==8&&!document.querySelector('#tlin').classList.contains('lanes')));
await pg.click('#tll');await pg.waitForTimeout(300);
// 2. selecting and moving clips that sit in a shared lane
const pb=await bar('PhotoB');await pg.mouse.click(pb.x,pb.y);ok('clicking a clip in a shared lane selects that clip',await pg.evaluate(()=>P.layers.find(l=>l.id==sel).name)=='PhotoB');
const s0=await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').s);await drag('PhotoB',40,null);const s1=await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').s);
ok('dragging it sideways moves only that clip and it stays in the lane ('+s0+' -> '+s1.toFixed(2)+')',s1>s0+.2&&(await lanes())=='Camera | Flash | Logo | Music | Intro+PhotoA+PhotoB+Outro');
// 3. dragging a clip over another one in its lane gives it a new lane (picture untouched)
const f2=await frames();const a=await bar('PhotoA'),pbb=await bar('PhotoB');await drag('PhotoA',pbb.x-a.x,null);
const lz=await lanes();ok('dropping a clip on top of another in its lane spawns a lane for it ('+lz+')',/PhotoA/.test(lz)&&!/PhotoA\+/.test(lz)&&!/\+PhotoA/.test(lz)&&lz.split(' | ').length==6);
ok('and the stacking order is untouched by that',(await order())===o0);
await pg.evaluate(()=>{const l=P.layers.find(x=>x.name=='PhotoA');l.s=3.5;l.e=6;all()});await pg.waitForTimeout(300);
// 4. drag a clip up into another lane
await build();await pg.click('#tll').catch(()=>{});await pg.evaluate(()=>{if(!document.getElementById('app').classList.contains('lanes'))setLanes(true,false);else{lnNorm();tl()}});await pg.waitForTimeout(300);
const fy=await rowY('Flash');const before=await order();await drag('Outro',0,fy.mid);
const l4=await lanes(),st=await pg.evaluate(()=>{const a=P.layers,i=n=>a.findIndex(l=>l.name==n);return{outro:i('Outro'),logo:i('Logo'),music:i('Music'),flash:i('Flash')}});
ok('dragging a clip up onto another lane puts it there when it is free ('+l4+')',/Flash\+Outro|Outro\+Flash/.test(l4));
ok('and since it now sits above Logo and Music it is stacked above them too ('+JSON.stringify(st)+')',st.outro>st.logo&&st.outro>st.music);
await pg.evaluate(()=>undo());await pg.waitForTimeout(300);ok('undo puts the clip and the order back ('+await lanes()+')',(await lanes())=='Camera | Flash | Logo | Music | Intro+PhotoA+PhotoB+Outro'&&(await order())===before);
// 5. a new lane below everything
const lastRow=await pg.evaluate(()=>{const r=[...document.querySelectorAll('#tlin .row[data-id]:not(.lnx)')].pop().getBoundingClientRect();return r.bottom+14});
await drag('Outro',0,lastRow);ok('dragging a clip below the last lane starts a new lane ('+await lanes()+')',(await lanes()).split(' | ').pop()=='Outro'&&(await lanes()).split(' | ').length==6);
await pg.evaluate(()=>undo());await pg.waitForTimeout(200);
// 6. dragging by the name column still works in lanes view
await build();await pg.evaluate(()=>setLanes(true,false));await pg.waitForTimeout(300);
const nmDrag=async(name,toName,frac)=>{const L=await pg.evaluate(name=>P.layers.find(l=>l.name==name).id,name),a=await pg.evaluate(id=>{const r=document.querySelector('#tlin .row[data-id="'+id+'"] .nm').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}},L),b=await rowY(toName);await pg.mouse.move(a.x,a.y);await pg.mouse.down();await pg.mouse.move(a.x,a.y-8,{steps:3});await pg.mouse.move(a.x,b.top+(b.bot-b.top)*frac,{steps:8});await pg.mouse.up();await pg.waitForTimeout(250)};
await nmDrag('Music','Flash',.15);const l6=await lanes();ok('dragging a layer by its name onto the upper half of a lane makes a new lane above ('+l6+')',l6.split(' | ')[1]=='Music'&&l6.split(' | ')[2]=='Flash');
// 7. groups
await pg.evaluate(()=>{P.layers.length=0;id=1;P.dur=12;mk('cam');const G=mk('group');G.name='G';G.col=false;const a=mk('rect');a.name='K1';a.par=G.id;a.s=0;a.e=3;const b=mk('rect');b.name='K2';b.par=G.id;b.s=4;b.e=8;const o=mk('rect');o.name='Solo';o.s=0;o.e=12;for(const l of P.layers)delete l.ln;all()});await pg.waitForTimeout(300);
const gl=await lanes();ok('a group keeps its own lane and its children share a lane beneath it ('+gl+')',/Camera \| .*G.*\| K1\+K2/.test(gl)||/Camera \| Solo \| G \| K1\+K2/.test(gl)||/Camera \| G \| K1\+K2/.test(gl));
const indent=await pg.evaluate(()=>{const r=[...document.querySelectorAll('#tlin .row[data-id]')].find(r=>r.querySelector('.nt').textContent=='K1'||/Lane/.test(r.querySelector('.nt').textContent)&&r.dataset.par);return r&&parseInt(r.querySelector('.nm').style.paddingLeft)});ok('the children are indented under the group ('+indent+'px)',indent>8);
await pg.evaluate(()=>{const g=P.layers.find(l=>l.name=='G');g.col=true;all()});await pg.waitForTimeout(200);ok('collapsing the group hides its lanes ('+await lanes()+')',!/K1/.test(await lanes()));
// 8. dropping a clip from the media pool on a lane
if(vid){await pg.evaluate(()=>{P.layers.length=0;id=1;P.dur=12;mk('cam');const add=(n,s,e)=>{const l=mk('rect');l.name=n;l.s=s;l.e=e;return l};add('Under',0,12);add('Flash',4,5);for(const l of P.layers)delete l.ln;all()});
 await pg.click('#mpbtn');await pg.setInputFiles('#mpf',[{name:'two.webm',mimeType:'video/webm',buffer:fs.readFileSync(vid)}]);await pg.waitForTimeout(1500);
 const dropAt=(timeS,y)=>pg.evaluate(async({timeS,y})=>{const dt=new DataTransfer();document.querySelector('.mpt').dispatchEvent(new DragEvent('dragstart',{dataTransfer:dt,bubbles:true}));const r=document.querySelector('#ru').getBoundingClientRect(),x=r.left+timeS/P.dur*r.width,target=document.elementFromPoint(x,y);const mk=t=>new DragEvent(t,{dataTransfer:dt,bubbles:true,cancelable:true,clientX:x,clientY:y});const over=mk('dragover');target.dispatchEvent(over);const marked=!!document.querySelector('#tlin .row.dz-lane,#tlin .row.dz-lt,#tlin .row.dz-lb');target.dispatchEvent(mk('drop'));window.dispatchEvent(new DragEvent('dragend'));await new Promise(r=>setTimeout(r,1800));return{allowed:over.defaultPrevented,marked}},{timeS,y});
 const fy2=await rowY('Flash');const d1=await dropAt(1.0,fy2.mid);const nl=await pg.evaluate(()=>{const l=P.layers.find(x=>x.vid);return l&&{s:l.s,e:l.e,ln:l.ln,flash:P.layers.find(x=>x.name=='Flash').ln}});
 ok('dropping a pool clip on a free spot of a lane puts it there at that time ('+JSON.stringify(nl)+', marked '+d1.marked+')',d1.allowed&&d1.marked&&nl&&nl.ln===nl.flash&&Math.abs(nl.s-1)<.1&&Math.abs(nl.e-3)<.2);
 const fy3=await rowY('Flash');await dropAt(4.2,fy3.mid);const two=await pg.evaluate(()=>P.layers.filter(l=>l.vid).map(l=>({s:+l.s.toFixed(1),ln:l.ln})));const flashLn=await pg.evaluate(()=>P.layers.find(x=>x.name=='Flash').ln);
 ok('dropping where the lane is busy makes a new lane instead ('+JSON.stringify(two)+')',two.length==2&&two.some(t=>t.ln!==flashLn&&Math.abs(t.s-4.2)<.15));
 const gt=await pg.evaluate(()=>{const r=[...document.querySelectorAll('#tlin .row[data-id]:not(.lnx)')].find(r=>r.dataset.lane!='cam').getBoundingClientRect();return r.top+r.height*.08});
 const before2=await pg.evaluate(()=>P.layers.filter(l=>l.vid).length);await dropAt(8,gt);const tops=await pg.evaluate(()=>{const n=P.layers.reduce((a,b)=>a.id>b.id?a:b),others=P.layers.filter(l=>l!==n&&l.type!='cam').map(l=>l.ln);return{vid:!!n.vid,count:P.layers.filter(l=>l.vid).length,ln:n.ln,min:Math.min(...others)}});
 ok('dropping on the top edge of the first lane starts a new lane above it ('+JSON.stringify(tops)+')',tops.vid&&tops.count==before2+1&&tops.ln<tops.min);}
// 8b. the other timeline tools still work on clips that sit in a shared lane
await build();await pg.evaluate(()=>{setLanes(true,false);const b=P.layers.find(l=>l.name=='PhotoB');b.kf.x=[{t:7,v:0,e:'lin'},{t:8,v:40,e:'lin'}];b.fi=0;sel=b.id;all()});await pg.waitForTimeout(300);
{const hd=await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='PhotoB'),h=document.querySelector('#tlin .row[data-id="'+L.id+'"] .hd[data-h=r]').getBoundingClientRect();return{x:h.left+h.width/2,y:h.top+h.height/2}});const e0=await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').e);
 await pg.mouse.move(hd.x,hd.y);await pg.mouse.down();await pg.mouse.move(hd.x+20,hd.y,{steps:4});await pg.mouse.move(hd.x+40,hd.y,{steps:4});await pg.mouse.up();await pg.waitForTimeout(250);const e1=await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').e);
 ok('trimming the end of a clip in a shared lane works ('+e0+' -> '+e1.toFixed(2)+')',e1>e0+.2&&(await lanes())=='Camera | Flash | Logo | Music | Intro+PhotoA+PhotoB+Outro');
 const fd=await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='PhotoB'),d=document.querySelector('#tlin .row[data-id="'+L.id+'"] .fd[data-fd=i]').getBoundingClientRect();return{x:d.left+d.width/2,y:d.top+d.height/2}});
 await pg.mouse.move(fd.x,fd.y);await pg.mouse.down();await pg.mouse.move(fd.x+25,fd.y,{steps:4});await pg.mouse.move(fd.x+50,fd.y,{steps:4});await pg.mouse.up();await pg.waitForTimeout(250);
 ok('the fade handle of a clip in a shared lane can be dragged ('+await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').fi)+' s)',(await pg.evaluate(()=>P.layers.find(l=>l.name=='PhotoB').fi))>.2);
 const kf=await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='PhotoB'),k=document.querySelector('#tlin .row[data-id="'+L.id+'"] .kf').getBoundingClientRect();return{x:k.left+k.width/2,y:k.top+k.height/2}});await pg.mouse.click(kf.x,kf.y);
 ok('a keyframe of a clip in a shared lane can be picked',await pg.evaluate(()=>ks.length>=1&&P.layers.find(l=>l.id==sel).name=='PhotoB'));}
// 8c. dropping a pool clip on one clip of a shared lane replaces that clip, not its neighbour
if(vid){fs.copyFileSync(vid,path.join(dir,'other.webm'));await pg.evaluate(()=>{P.layers.length=0;id=1;P.dur=12;mk('cam');all()});
 await pg.setInputFiles('#fm',vid);await pg.waitForTimeout(1800);await pg.evaluate(()=>{const L=cur();L.name='ClipA';L.s=0;L.e=2;all()});
 await pg.setInputFiles('#fm',vid);await pg.waitForTimeout(1800);await pg.evaluate(()=>{const L=cur();L.name='ClipB';L.s=4;L.e=6;for(const l of P.layers)delete l.ln;setLanes(true,false)});await pg.waitForTimeout(300);
 const shared=await lanes();await pg.click('#mpbtn').catch(()=>{});if(await pg.locator('#mp').isHidden())await pg.click('#mpbtn');await pg.setInputFiles('#mpf',[{name:'other.webm',mimeType:'video/webm',buffer:fs.readFileSync(path.join(dir,'other.webm'))}]);await pg.waitForTimeout(1200);
 const tile=await pg.evaluate(()=>[...document.querySelectorAll('.mpt')].findIndex(t=>t.getAttribute('aria-label')=='other.webm'));
 await pg.evaluate(async idx=>{const dt=new DataTransfer();document.querySelectorAll('.mpt')[idx].dispatchEvent(new DragEvent('dragstart',{dataTransfer:dt,bubbles:true}));const B=P.layers.find(l=>l.name=='ClipB'),b=document.querySelector('#tlin .row[data-id="'+B.id+'"] .bar').getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,t=document.elementFromPoint(x,y),mk=n=>new DragEvent(n,{dataTransfer:dt,bubbles:true,cancelable:true,clientX:x,clientY:y});t.dispatchEvent(mk('dragover'));t.dispatchEvent(mk('drop'));window.dispatchEvent(new DragEvent('dragend'));await new Promise(r=>setTimeout(r,2000))},tile);
 const names=await pg.evaluate(()=>({A:MB[P.layers.find(l=>l.name=='ClipA').id].name,B:MB[P.layers.find(l=>l.name=='ClipB').id].name}));
 ok('two clips share a lane ('+shared+') and a drop on one of them replaces only that one ('+JSON.stringify(names)+')',/ClipA\+ClipB/.test(shared)&&names.B=='other.webm'&&names.A=='two.webm');
 const A=await pg.evaluate(()=>P.layers.find(l=>l.name=='ClipA'));await pg.evaluate(()=>{const L=P.layers.find(l=>l.name=='ClipB');L.off=0;sel=L.id;tab='Media';all()});
 const slipOk=await pg.evaluate(()=>typeof mdSlip=='function');ok('the Media tab and Shift+drag slide are still available in lanes view',slipOk&&await pg.evaluate(()=>!!document.querySelector('#side .mdz')));}
// 9. saved with the project, and a reload keeps lanes view and the lanes
await build();await pg.evaluate(()=>setLanes(true,true));await pg.waitForTimeout(300);const lz2=await lanes();await pg.evaluate(()=>saveNow(true));await pg.waitForTimeout(800);await pg.reload();await pg.waitForTimeout(2200);
ok('after a reload the lanes view is still on with the same lanes ('+await lanes()+')',(await pg.evaluate(()=>lnOn()))&&(await lanes())===lz2);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
