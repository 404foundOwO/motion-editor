// Impact shake (camera effect 'impact'): kick, spring wobble, decay, repeats, direction, and a clean return to rest. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1280,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const setup=p=>pg.evaluate(p=>{P.layers.length=0;id=1;const C=mk('cam');C.name='Camera';sel=C.id;addFx(C,'impact');C.efa=['impact'];Object.assign(C.p,{ixt:1,ixs:60,ixd:1.2,ixf:7,ixr:4,ixz:80,ix3:3,ixa:90,ixw:0,ixp:0,ixn:0,ixe:1},p||{});return C.id},p);
const at=t=>pg.evaluate(t=>{const c=camAt(t);return{x:c.x,y:c.y,z:c.z,rz:c.rz,m:Math.hypot(c.x,c.y)}},t);
const series=(a,b,n)=>pg.evaluate(([a,b,n])=>{const o=[];for(let i=0;i<=n;i++){const t=a+(b-a)*i/n,c=camAt(t);o.push([t,c.x,c.y,c.z,c.rz])}return o},[a,b,n]);
await setup();
const pre=await at(.9);ok('quiet before the hit',pre.m==0&&pre.rz==0&&pre.z==0);
const s=await series(1,1.5,120),peak=Math.max(...s.map(r=>Math.hypot(r[1],r[2])));ok('hard kick, about the set strength: peak '+peak.toFixed(1)+' px',peak>45&&peak<95);
const proj=s.map(r=>r[2]);let cross=0;for(let i=1;i<proj.length;i++)if(Math.sign(proj[i])!=Math.sign(proj[i-1])&&proj[i]!=0)cross++;ok('rings like a spring: '+cross+' swings in half a second',cross>=6);
ok('roll and zoom punch happen too',Math.max(...s.map(r=>Math.abs(r[4])))>1.5&&Math.max(...s.map(r=>Math.abs(r[3])))>40);
const late=await at(1+1.2);ok('settled after the settle time: '+late.m.toFixed(2)+' px',late.m<.1*60);
ok('fully at rest later',(await at(4)).m<.01);
const a=await at(1.234),b=await at(1.234);ok('same time, same shake (paused = playing)',a.x===b.x&&a.y===b.y&&a.rz===b.rz);
await setup({ixp:1});const r2=Math.max(...(await series(2,2.1,30)).map(r=>Math.hypot(r[1],r[2])));ok('repeat every second hits again: '+r2.toFixed(1)+' px',r2>40);
await setup({ixp:1,ixn:1});const r3=Math.max(...(await series(2,2.1,30)).map(r=>Math.hypot(r[1],r[2])));ok('number of hits limits it (only the first hit'+"'"+'s tail is left): '+r3.toFixed(1)+' px',r3<8);
await setup({ixw:0,ixa:0});const h=await series(1,1.4,100);ok('direction 0 shakes mostly left and right',Math.max(...h.map(r=>Math.abs(r[1])))>1.6*Math.max(...h.map(r=>Math.abs(r[2]))));
await setup({ixa:90});const v=await series(1,1.4,100);ok('direction 90 shakes mostly up and down',Math.max(...v.map(r=>Math.abs(r[2])))>1.6*Math.max(...v.map(r=>Math.abs(r[1]))));
await setup({ixs:0,ixr:0,ixz:0});ok('zero strength, roll and zoom does nothing',(await at(1.05)).m==0&&(await at(1.05)).rz==0&&(await at(1.05)).z==0);
await setup({ixw:35,ixe:1});const d1=await at(1.03);await setup({ixw:35,ixe:2});const d2=await at(1.03);ok('seed changes the direction',d1.x!==d2.x||d1.y!==d2.y);
// 3D tilt: the view pitches and yaws, which is what gives depth
await setup({ixw:0,ixa:90});const pv=await series(1,1.4,100).then(a=>0);
const tilt=async p=>{await setup(p);return pg.evaluate(()=>{let rx=0,ry=0;for(let i=0;i<=100;i++){const c=camAt(1+i*.004);rx=Math.max(rx,Math.abs(c.rx));ry=Math.max(ry,Math.abs(c.ry))}return{rx,ry}})};
const tv=await tilt({ixw:0,ixa:90}),th=await tilt({ixw:0,ixa:0}),t0=await tilt({ix3:0});
ok('3D tilt follows the kick: up/down pitches ('+tv.rx.toFixed(1)+'° vs '+tv.ry.toFixed(1)+'°), left/right yaws ('+th.ry.toFixed(1)+'° vs '+th.rx.toFixed(1)+'°)',tv.rx>1.5*tv.ry&&th.ry>1.5*th.rx&&tv.rx>1.5);
ok('3D tilt 0 keeps the camera level',t0.rx==0&&t0.ry==0);
await setup({ix3:0,ixr:0,ixz:0});const flat=(await at(1.03)).m;
await pg.evaluate(()=>{const c=P.layers.find(l=>l.type=='cam');c.p.ix3=8});
const depth=await pg.evaluate(()=>{P.layers.length=0;id=1;const C=mk('cam');C.name='Camera';const A=mk('rect');A.p.w=200;A.p.h=200;A.p.z=0;A.p.x=-200;const B=mk('rect');B.p.w=200;B.p.h=200;B.p.z=900;B.p.x=-200;sel=C.id;addFx(C,'impact');C.efa=['impact'];Object.assign(C.p,{ixt:1,ixs:0,ixr:0,ixz:0,ix3:8,ixa:0,ixw:0});const cam=camAt(1.02);const pa=proj(-200,0,0,cam),pb=proj(-200,0,900,cam),p0a=proj(-200,0,0,camAt(.5)),p0b=proj(-200,0,900,camAt(.5));return{near:pa.x-p0a.x,far:pb.x-p0b.x}});
ok('the tilt moves near and far objects by different amounts, which is the depth ('+depth.near.toFixed(1)+' vs '+depth.far.toFixed(1)+' px)',Math.abs(depth.near)>1&&Math.abs(depth.near-depth.far)>1);
// the picture really moves, then returns exactly
await pg.evaluate(()=>{P.layers.length=0;id=1;const C=mk('cam');C.name='Camera';const R=mk('rect');R.p.c1='#ff2020';R.p.w=300;R.p.h=300;sel=C.id;addFx(C,'impact');C.efa=['impact'];C.p.ixt=1;PV=0});
const shots=await pg.evaluate(()=>{const g=t=>{window.t=t;dirty=1;draw(t);draw(t);const d=MAINCX.getImageData(0,0,W,H).data,o=new Uint8ClampedArray(d);return o},m=(a,b)=>{let s=0;for(let i=0;i<a.length;i+=4)s+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return s/(a.length/4)/3};const rest=g(.5),hit=g(1.03),after=g(5);return{move:m(rest,hit),back:m(rest,after)}});
ok('picture moves on the hit ('+shots.move.toFixed(2)+') and returns exactly to rest ('+shots.back+')',shots.move>.2&&shots.back==0);
const info=await pg.evaluate(()=>{P.layers.length=0;id=1;const C=mk('cam'),T=mk('text'),R=mk('rect');return{cat:CLAUDE.catalog().effects.some(e=>e.key=='impact'),camOnly:okfx(C,'impact')&&!okfx(T,'impact')&&!okfx(R,'impact')}});
ok('listed, and only for the camera',info.cat&&info.camOnly);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
