const h=require('./harness');(async()=>{const errs=[];const d=await h.load((process.argv[2]||'MF:'+require('path').resolve(__dirname,'../index.html')),errs);const w=d.window;const ev=s=>w.eval(s);
const ks=ev('Object.keys(EF)');console.log('effects',ks.length);
ev(`P.layers.length=0`);const L=ev(`mk('rect')`);L.p.c1='#ff8800';L.p.w=600;L.p.h=400;
const px=()=>{const g=ev('cv.getContext("2d")');const W=ev('cv.width'),H=ev('cv.height');const a=g.getImageData(W/2|0,H/2|0,1,1).data;return a[3]>0&&(a[0]+a[1]+a[2])>0};
let bad=0,frames=0;
const cy=['PV=0','PV=1','PV=2','PV=0'];
for(const k of ks){ev(`(()=>{const L=P.layers[0];if(!L.efa.includes('${k}'))L.efa.push('${k}')})()`);}
console.log('stacked',ev('P.layers[0].efa.length'));
ev('t=0.3');
for(let i=0;i<24;i++){ev(cy[i%4]);if(i%3==0)ev(`(()=>{const b=document.getElementById('fxg');if(b)b.click()})()`);
 ev('dirty=1');ev('safeDraw(t)');frames++;await new Promise(r=>setTimeout(r,20));if(!px()){bad++;console.log('blank at',i,ev('PV'),ev('FXOFF'))}}
// individual toggling
for(const k of ks){ev(`(()=>{const L=P.layers[0];L.efa=['${k}']})()`);ev('FXOFF=false;dirty=1;safeDraw(t)');if(!px()){bad++;console.log('blank single',k)}}
console.log('frames',frames,'blank',bad,'errs',[...new Set(errs)].slice(0,5));
process.exit(0)})()
