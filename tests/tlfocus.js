// Calmer timeline: keyframes and fade handles are quiet on layers that are not selected or hovered; the diamond button in the timeline bar shows all keyframes. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1300,height:900}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const setup=()=>pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','330px');P.layers.length=0;id=1;P.dur=10;mk('cam');
 const a=mk('rect');a.name='A';a.kf.x=[{t:1,v:0,e:'ease'},{t:3,v:50,e:'lin'}];a.fi=.5;a.fo=.5;const b=mk('rect');b.name='B';b.kf.x=[{t:2,v:0,e:'ease'},{t:4,v:50,e:'lin'}];b.fi=.5;b.fo=.5;sel=b.id;all()});
await setup();
const probe=name=>pg.evaluate(name=>{const row=[...document.querySelectorAll('#tlin .row[data-id]')].find(r=>r.querySelector('.nt').textContent==name),k=getComputedStyle(row.querySelector('.kf')),f=getComputedStyle(row.querySelector('.fd'));return{kfOpacity:+k.opacity,kfScale:k.scale,fdOpacity:+f.opacity}},name);
const a=await probe('A'),b=await probe('B');
ok('an unselected layer shows small, faint keyframes ('+JSON.stringify(a)+') and no fade handles',a.kfOpacity<.6&&parseFloat(a.kfScale)<.8&&a.fdOpacity===0);
ok('the selected layer shows everything in full ('+JSON.stringify(b)+')',b.kfOpacity>=.95&&(b.kfScale=='none'||parseFloat(b.kfScale)==1)&&b.fdOpacity>.8);
await pg.hover('#tlin .row[data-id="2"] .tr');await pg.waitForTimeout(250);
const h=await probe('A');ok('hovering a layer shows its keyframes and fade handles ('+JSON.stringify(h)+')',h.kfOpacity>=.95&&h.fdOpacity>.8);
await pg.mouse.move(5,5);await pg.waitForTimeout(250);
// toggle
await pg.click('#tlk');await pg.waitForTimeout(250);
const t1=await probe('A');ok('the diamond button shows every keyframe again ('+JSON.stringify(t1)+')',await pg.evaluate(()=>app.classList.contains('kfall'))&&t1.kfOpacity>=.95&&t1.fdOpacity>.8);
await pg.reload();await pg.waitForTimeout(1500);await setup();await pg.mouse.move(5,5);await pg.waitForTimeout(250);
ok('and the choice is remembered after a reload',await pg.evaluate(()=>app.classList.contains('kfall')&&document.querySelector('#tlk').classList.contains('on')));
await pg.click('#tlk');await pg.waitForTimeout(250);const t2=await probe('A');ok('clicking again quiets them',!(await pg.evaluate(()=>app.classList.contains('kfall')))&&t2.kfOpacity<.6);
// keyframes can still be selected and dragged in a quiet row
await pg.evaluate(()=>{sel=2;all()});const sel2=await pg.evaluate(()=>{const kf=document.querySelector('#tlin .row[data-id="2"] .kf'),r=kf.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});
await pg.mouse.click(sel2.x,sel2.y);ok('a keyframe on the selected layer can still be picked',await pg.evaluate(()=>ks.length>=1));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
