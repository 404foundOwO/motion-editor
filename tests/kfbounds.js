// Keyframes stay inside their object's time span; removing an effect removes its keyframes. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const r=await pg.evaluate(()=>{P.layers.length=0;P.dur=10;const L=mk('rect');L.s=2;L.e=6;sel=L.id;const o={};
 t=1;tog(L,'x');o.before=(L.kf.x||[]).length;t=3;tog(L,'x');o.inside=L.kf.x.length;t=8;setV(L,'x',50);o.setOut=L.kf.x.length;
 CLAUDE.setKeyframe(L.id,'sc',9,1);o.api=L.kf.sc[0].t;CLAUDE.setKeyframe(L.id,'sc',0,1);o.api2=L.kf.sc.map(f=>f.t).join();
 CLAUDE.animate(L.id,{op:[[0,0],[20,1]]});o.anim=L.kf.op.map(f=>f.t).join();
 const k=Object.keys(EF).find(k=>(EP[k]||[]).some(q=>q[0]));const pk=EP[k].find(q=>q[0])[0];CLAUDE.addEffect(L.id,k);L.kf[pk]=[{t:3,v:1,e:'ease'}];CLAUDE.removeEffect(L.id,k);o.fx=!!L.kf[pk];return o});
ok('no keyframe before the object starts',r.before==0);ok('keyframe inside works',r.inside==1);ok('editing a keyframed value outside adds no keyframe',r.setOut==1);
ok('API keyframes are clamped to the span ('+r.api+', '+r.api2+', '+r.anim+')',r.api==6&&r.api2=='2,6'&&r.anim=='2,6');
const tr=await pg.evaluate(()=>{const L=P.layers[0];L.kf.x=[{t:2.5,v:1,e:'ease'},{t:5,v:2,e:'ease'}];L.kf.y=[{t:5.5,v:7,e:'ease'}];L.e=4;const n=kfTrim(L);return{n,x:L.kf.x.length,y:L.kf.y,py:L.p.y}});
ok('trimming removes keyframes outside ('+JSON.stringify(tr)+')',tr.n>=2&&tr.x==1&&tr.y===undefined&&tr.py==7);
ok('removing an effect removes its keyframes',!r.fx);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
