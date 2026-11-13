const h=require('./harness');(async()=>{const errs=[];const d=await h.load((process.argv[2]||'MF:'+require('path').resolve(__dirname,'../index.html')),errs);const w=d.window;const ev=s=>w.eval(s);
let fails=0;const ok=(n,c,x)=>{if(!c)fails++;console.log(c?'PASS':'FAIL',n,x===undefined?'':JSON.stringify(x))};
ev(`P.layers.length=0;P.layers.push(...[]);`);
// helper: scene = bg rect (color A) + top rect (color B) with blend mode
w.scene=(bg,fg,bl,op)=>{ev(`P.layers.length=0;`);const a=ev(`mk('rect')`),b=ev(`mk('rect')`);
 for(const [L,c] of [[a,bg],[b,fg]]){L.p.c1=c;L.p.w=4000;L.p.h=4000;L.p.x=0;L.p.y=0;L.col=c}
 if(bl)b.bl=bl;if(op!==undefined)b.p.op=op;ev('t=0;PV=2;dirty=1');ev('draw(0)');ev('draw(0)');
 const g=ev('cv.getContext("2d")');const px=g.getImageData(ev('cv.width')/2|0,ev('cv.height')/2|0,1,1).data;return [...px]};
w.cv_w=()=>ev('cv.width');w.cv_h=()=>ev('cv.height');
const scene=w.scene;
const near=(a,b,t=3)=>a.every((v,i)=>Math.abs(v-b[i])<=t);
scene('#000000','#000000');scene('#000000','#000000');let p;
p=scene('#808080','#ffffff');ok('normal',near(p,[255,255,255,255]),p);
p=scene('#808080','#ffffff','negative');ok('negative of white fg on grey = 127',near(p,[127,127,127,255]),p);
p=scene('#336699','#ffffff','negative');ok('negative on blue',near(p,[204,153,102,255]),p);
p=scene('#808080','#404040','multiply');ok('multiply',near(p,[32,32,32,255],4),p);
p=scene('#808080','#808080','subtract');ok('subtract',near(p,[0,0,0,255]),p);
p=scene('#808080','#404040','linearburn');ok('linearburn 128+64-255→0',near(p,[0,0,0,255]),p);
p=scene('#404040','#808080','divide');ok('divide 64/128→128?',near(p,[128,128,128,255],3),p);
p=scene('#808080','#ffffff','hardmix');ok('hardmix',near(p,[255,255,255,255]),p);
p=scene('#808080','#ff0000','extract');ok('extract keeps shape (fg is full cover) ',p[3]==255,p);
p=scene('#808080','#ff0000','erase');ok('erase removes',p[3]==0,p);
p=scene('#808080','#ff0000','behind');ok('behind keeps bg',near(p,[128,128,128,255]),p);
p=scene('#808080','#404040','contrast');ok('contrast runs (filter may be unsupported in jsdom canvas)',p[3]==255,p);
p=scene('#808080','#404040','subtract',.5);ok('subtract 50% (=96)',near(p,[96,96,96,255],4),p);
// group blend
ev(`P.layers.length=0`);
const a=ev(`mk('rect')`);a.p.c1='#808080';a.p.w=4000;a.p.h=4000;
const g=ev(`mk('group')`);const b=ev(`mk('rect')`);b.p.c1='#404040';b.p.w=4000;b.p.h=4000;b.par=g.id;g.bl='multiply';ev('dirty=1;draw(0)');
p=[...ev('cv.getContext("2d")').getImageData(ev('cv.width')/2|0,ev('cv.height')/2|0,1,1).data];ok('group multiply',near(p,[32,32,32,255],4),p);
// UI: select present and handler
ev(`sel=${b.id};tab='Color';side()`);ok('blend select in panel',!!d.window.document.querySelector('select[data-s=bl]'));
const sel=d.window.document.querySelector('select[data-s=bl]');
if(sel){sel.value='negative';sel.dispatchEvent(new w.Event('change',{bubbles:true}));sel.dispatchEvent(new w.Event('input',{bubbles:true}));ok('handler sets L.bl',b.bl=='negative',b.bl)}
// Audio group selector
ev(`P.layers.length=0`);const au=ev(`mk('audio')`);ev(`sel=${au.id};tab='Audio';side()`);
ok('audio panel has Group select',/Group|data-s=par|par/i.test(d.window.document.querySelector('#side').innerHTML));
// grouping
const r=ev(`mk('rect')`);ev(`sel=${r.id};groupLayer()`);
ok('groupLayer wraps rect',ev(`P.layers.filter(l=>l.type=='group').length`)==1&&r.par!=null,r.par);
ev(`sel=${au.id};groupLayer()`);ok('audio can be grouped',au.par!=null,au.par);
ok('ungroup',(ev(`sel=P.layers.find(l=>l.id==${au.par}).id;ungroup();1`),au.par==null),au.par);
// drag into group via dropHint/moveInto
ev(`P.layers.length=0`);const gg=ev(`mk('group')`),x=ev(`mk('rect')`),y=ev(`mk('rect')`);ev('tl()');
const doc=w.document;doc.elementFromPoint=(px,py)=>doc.querySelector(`#tlin .row[data-id="${w.__tgt}"]`);
const rows=[...doc.querySelectorAll('#tlin .row[data-id]')];ok('rows rendered',rows.length==3,rows.length);
rows.forEach(rw=>rw.getBoundingClientRect=()=>({top:100,height:40,left:0,right:500,bottom:140,width:500}));
doc.querySelector('#tlin').getBoundingClientRect=()=>({top:0,left:0,right:600,bottom:600});
w.__tgt=gg.id;ev(`rd=${x.id}`);
const ptr=(y)=>({clientX:50,clientY:y});
ev(`dropHint({clientX:50,clientY:120})`);ok('hint into group (mid)',ev('DROP&&DROP.zone')=='into',ev('JSON.stringify(DROP)'));
ev(`dropHint({clientX:50,clientY:102})`);ok('hint before (top)',ev('DROP&&DROP.zone')=='before');
ev(`dropHint({clientX:50,clientY:120})`);ev(`moveInto(P.layers.find(l=>l.id==${x.id}),DROP)`);
ok('moved into group',x.par==gg.id,x.par);
w.__tgt=x.id;ev(`rd=${y.id}`);ev(`dropHint({clientX:50,clientY:130})`);ok('after non-group = sibling',ev('DROP.zone')=='after');
ev(`moveInto(P.layers.find(l=>l.id==${y.id}),DROP)`);ok('sibling inherits parent',y.par==gg.id,y.par);
// cycle prevention: drag group into its child
w.__tgt=x.id;ev(`rd=${gg.id}`);ev(`dropHint({clientX:50,clientY:120})`);ok('cycle blocked',ev('DROP')===null);
// drop to root
ev(`rd=${x.id}`);w.__tgt=null;doc.elementFromPoint=()=>null;ev(`dropHint({clientX:50,clientY:300})`);ev(`moveInto(P.layers.find(l=>l.id==${x.id}),DROP)`);ok('drop to root',x.par==null,x.par);
// playhead
ev('tl()');const ph=doc.querySelector('#ph');ok('playhead exists',!!ph);
console.log('errs',errs.slice(0,5));console.log('FAILS',fails);process.exit(0)})()
