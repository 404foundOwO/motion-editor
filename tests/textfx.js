// Text randomizer (trand) and Number riser (tcount). Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1400,height:900}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const mk=(text,fx,p)=>pg.evaluate(([text,fx,p])=>{P.layers.length=0;id=1;mk('cam');const L=mk('text');L.text=text;sel=L.id;addFx(L,fx);for(const k in p){delete L.kf[k];L.p[k]=p[k]}L.efa=[fx];return L.id},[text,fx,p]);
const mod=(t)=>pg.evaluate(t=>{const r=txMod(cur(),t);return r?r.s:null},t);
const set=p=>pg.evaluate(p=>{const L=cur();for(const k in p){delete L.kf[k];L.p[k]=p[k]}},p);
// number riser
await mk('Revenue $1,234.50 up 98% in 2024','tcount',{cne:0,cnp:0});
ok('riser starts at 0: '+await mod(1),(await mod(1))=='Revenue $0.00 up 0% in 0');
await set({cnp:100});ok('riser ends at the real numbers: '+await mod(1),(await mod(1))=='Revenue $1,234.50 up 98% in 2024');
await set({cnp:50});ok('riser halfway keeps format: '+await mod(1),(await mod(1))=='Revenue $617.25 up 49% in 1012');
await set({cnp:0,cnf:100});ok('start value 100: '+await mod(1),(await mod(1))=='Revenue $100.00 up 100% in 100');
await set({cnf:0,cnp:50,cne:1});const eo=await mod(1);ok('ease out is ahead of linear: '+eo,/\$1,0\d\d\.\d\d/.test(eo));
await mk('no digits here','tcount',{cnp:0});ok('text without numbers is unchanged',(await mod(1))=='no digits here');
// randomizer
await mk('Hello World 42\nSecond line','trand',{rzp:0,rzs:0,rzc:0});
const s0=await mod(1);ok('scrambled keeps spaces, newline, case and digits: '+JSON.stringify(s0),/^[A-Z][a-z]{4} [A-Z][a-z]{4} \d\d\n[A-Z][a-z]{5} [a-z]{4}$/.test(s0)&&s0!='Hello World 42\nSecond line');
ok('same time gives the same scramble',(await mod(1))===(await mod(1)));
ok('a later time gives a different scramble',(await mod(1))!==(await mod(1.2)));
await set({rzp:100});ok('progress 100 is the real text',(await mod(1))=='Hello World 42\nSecond line');
await set({rzp:99,rzs:0});ok('spread 0: nothing settles before 100',(await mod(1))!='Hello World 42\nSecond line'&&(await mod(1)).length=='Hello World 42\nSecond line'.length);
await set({rzp:50,rzs:100});const mid=await mod(1);ok('spread 100: left letters settle first: '+JSON.stringify(mid),mid.startsWith('Hell')&&!mid.endsWith('line'));
await set({rzp:0,rzs:0,rzc:3});ok('binary mode: '+JSON.stringify(await mod(1)),/^[01]{5} [01]{5} [01]{2}\n[01]{6} [01]{4}$/.test(await mod(1)));
await set({rzc:2});ok('symbols mode has no letters',!/[A-Za-z0-9]/.test((await mod(1)).replace(/\s/g,'')));
await set({rzc:0,rzd:0});const a=await mod(1);await set({rzd:5});ok('seed changes the pattern',a!==(await mod(1)));
// layout does not jump while scrambling
await mk('Hello World','trand',{rzp:0,rzs:0});
const widths=await pg.evaluate(()=>{const L=cur(),w=t=>glyphs(L,t).map(g=>Math.round(g.w)).join();const a=w(1),b=w(1.3);L.p.rzp=100;return[a,b,w(1)]});
ok('letter widths stay those of the real text',widths[0]==widths[2]&&widths[1]==widths[2]);
// zigzag reveal
await mk('AB CD','zzrev',{zzp:0,zzs:0,zzm:0,zzx:300,zzy:200,zzw:0,zze:3,zzu:0});
const an=(i,p)=>pg.evaluate(([i,p])=>{const L=cur();delete L.kf.zzp;L.p.zzp=p;const o=animG(L,1,i,5);return{dx:Math.round(o.dx),dy:Math.round(o.dy),op:+o.op.toFixed(2)}},[i,p]);
const a0=[await an(0,0),await an(1,0),await an(2,0),await an(3,0)];
ok('start: hidden and offset, x and y alternate: '+JSON.stringify(a0.slice(0,2)),a0.every(o=>o.op==0)&&a0[0].dx==-300&&a0[0].dy==0&&a0[1].dx==0&&a0[1].dy==-200&&a0[2].dx==300&&a0[3].dy==200);
const a1=[await an(0,100),await an(1,100),await an(4,100)];
ok('end: every letter in place and fully visible',a1.every(o=>o.dx==0&&o.dy==0&&o.op==1));
const half=await an(0,50),q=await an(0,25);ok('letters travel in: offset shrinks with progress ('+q.dx+' to '+half.dx+')',Math.abs(q.dx)>Math.abs(half.dx)&&half.dx!=0);
await set({zzs:100,zzp:40});const st=[await an(0,40),await an(4,40)];ok('stagger: first letter ahead of the last ('+st[0].op+' vs '+st[1].op+')',st[0].op>st[1].op);
await set({zzs:0,zzm:1});ok('diagonal zigzag: opposite corners',(await an(0,0)).dx==-(await an(1,0)).dx&&(await an(0,0)).dy==-(await an(1,0)).dy&&(await an(0,0)).dy!=0);
await set({zzm:4});const c4=[await an(0,0),await an(1,0),await an(2,0),await an(3,0)];ok('four corners in turn',new Set(c4.map(o=>o.dx+','+o.dy)).size==4);
await set({zzm:0,zzu:1});ok('words: letters of one word move together',JSON.stringify(await an(0,30))==JSON.stringify(await an(1,30))&&JSON.stringify(await an(0,30))!=JSON.stringify(await an(3,30)));
await set({zzu:0,zzm:2,zzy:0,zzw:0});const nw=await an(0,40);await set({zzw:80,zzf:3});const ww=await an(0,40);ok('zigzag width adds sideways motion ('+nw.dy+' vs '+ww.dy+')',nw.dy==0&&ww.dy!=0);
await set({zzp:100,zzw:80});ok('zigzag settles to exactly zero at the end',(await an(0,100)).dy==0);
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const L=mk('text');L.text='ZIGZAG MOTION';L.p.sz=150;sel=L.id;addFx(L,'zzrev');tab='Effects';all();t=.55;dirty=1;draw(t)});
await pg.screenshot({path:'/tmp/claude-0/zz.png'});
// effect is offered, draws, and is text-only
const info=await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const T=mk('text');const R=mk('rect');const cat=CLAUDE.catalog().effects.map(e=>e.key);return{cat:cat.includes('trand')&&cat.includes('tcount')&&cat.includes('zzrev'),textOnly:['trand','tcount','zzrev'].every(k=>okfx(T,k)&&!okfx(R,k))}}).catch(e=>({err:String(e)}));
ok('both effects exist in the catalog',info.cat===true);ok('text-only: offered for text, not for shapes',info.textOnly===true);
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');const L=mk('text');L.text='Total 12,480 users';L.p.sz=120;sel=L.id;addFx(L,'tcount');addFx(L,'trand');tab='Effects';all();t=.8;dirty=1;draw(t)});
await pg.screenshot({path:'/tmp/claude-0/textfx.png'});
ok('draws with both effects and no page errors',errs.length==0);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
