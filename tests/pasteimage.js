// Pasting an image from the system clipboard adds it at the playhead; the editor's own Ctrl+C / Ctrl+V still works. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{P.layers.length=0;P.dur=10;t=2;all()});
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=64;c.height=48;const x=c.getContext('2d');x.fillStyle='#0f0';x.fillRect(0,0,64,48);const b=await new Promise(r=>c.toBlob(r,'image/png')),dt=new DataTransfer();dt.items.add(new File([b],'image.png',{type:'image/png'}));document.body.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))});
await pg.waitForTimeout(800);
const r=await pg.evaluate(()=>P.layers.filter(l=>l.type=='media').map(l=>({n:l.name,s:l.s,w:l.p.w})));
ok('a pasted image becomes a media layer at the playhead ('+JSON.stringify(r)+')',r.length==1&&r[0].s==2&&r[0].w==64&&/^Pasted/.test(r[0].n));
// Media tab: the pasted image replaces the selected clip's media
await pg.evaluate(()=>{const L=P.layers.find(l=>l.type=='media');sel=L.id;tab='Media';L.s=3;L.e=7;all()});
const before=await pg.evaluate(()=>P.layers.filter(l=>l.type=='media').length);
await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=80;c.height=40;const x=c.getContext('2d');x.fillStyle='#00f';x.fillRect(0,0,80,40);const b=await new Promise(r=>c.toBlob(r,'image/png')),dt=new DataTransfer();dt.items.add(new File([b],'image.png',{type:'image/png'}));document.body.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))});
await pg.waitForTimeout(1000);
const r2=await pg.evaluate(()=>P.layers.filter(l=>l.type=='media').map(l=>({s:l.s,e:l.e,src:MB[l.id].name,nat:l.el.naturalWidth})));
ok('with the Media tab open the paste replaces the media and keeps the slot ('+JSON.stringify(r2)+')',r2.length==before&&r2[0].s==3&&r2[0].e==7&&r2[0].nat==80);
await pg.evaluate(()=>{P.layers.length=0;const L=mk('rect');L.name='R';sel=L.id;t=1;all()});
await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.waitForTimeout(300);
ok('the editor\'s own copy and paste still works',(await pg.evaluate(()=>P.layers.filter(l=>/ copy$/.test(l.name)).length))==1);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
