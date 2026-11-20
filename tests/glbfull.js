// 3D model layer (needs Playwright + Chromium): the camera fits the whole animation, and Full canvas
// (L.fc) renders at the layer's size with nothing cropped. Uses a tiny GLB built here: a box with a
// child box that slides 3 units sideways, the case that used to be cut off by the render box.
// Run: node tests/glbfull.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};

function makeGLB(){
  const pos=new Float32Array([-.5,-.5,-.5,.5,-.5,-.5,.5,.5,-.5,-.5,.5,-.5,-.5,-.5,.5,.5,-.5,.5,.5,.5,.5,-.5,.5,.5]);
  const idx=new Uint16Array([0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,3,2,6,3,6,7,0,3,7,0,7,4,1,5,6,1,6,2]);
  const tim=new Float32Array([0,1]),out=new Float32Array([0,0,0,3,0,0]);
  const bin=Buffer.concat([pos,idx,tim,out].map(a=>Buffer.from(a.buffer)));
  const json={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],
    nodes:[{name:'Body',mesh:0,children:[1]},{name:'Arm',mesh:0,translation:[0,0,0]}],
    meshes:[{primitives:[{attributes:{POSITION:0},indices:1}]}],
    buffers:[{byteLength:bin.length}],
    bufferViews:[{buffer:0,byteOffset:0,byteLength:96,target:34962},{buffer:0,byteOffset:96,byteLength:72,target:34963},{buffer:0,byteOffset:168,byteLength:8},{buffer:0,byteOffset:176,byteLength:24}],
    accessors:[{bufferView:0,componentType:5126,count:8,type:'VEC3',min:[-.5,-.5,-.5],max:[.5,.5,.5]},{bufferView:1,componentType:5123,count:36,type:'SCALAR'},{bufferView:2,componentType:5126,count:2,type:'SCALAR',min:[0],max:[1]},{bufferView:3,componentType:5126,count:2,type:'VEC3'}],
    animations:[{samplers:[{input:2,output:3,interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:1,path:'translation'}}]}]};
  let j=Buffer.from(JSON.stringify(json));while(j.length%4)j=Buffer.concat([j,Buffer.from(' ')]);
  const h=Buffer.alloc(12);h.write('glTF',0);h.writeUInt32LE(2,4);h.writeUInt32LE(12+8+j.length+8+bin.length,8);
  const c1=Buffer.alloc(8);c1.writeUInt32LE(j.length,0);c1.write('JSON',4);
  const c2=Buffer.alloc(8);c2.writeUInt32LE(bin.length,0);c2.writeUInt32LE(0x004E4942,4);
  return [...Buffer.concat([h,c1,j,c2,bin])];
}

(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'../index.html'));
  await p.waitForFunction(()=>typeof SAVEON!='undefined'&&SAVEON===true&&typeof lpDraw=='function',null,{timeout:15000});   // lpDraw is in one of the last scripts: wait until every script has loaded
  // add the model layer
  const made=await p.evaluate(async bytes=>{
    const L=mk('media');L.p.w=405;L.p.h=720;
    await glbAttach(L,new Blob([new Uint8Array(bytes)]));
    window.TL=L;return {glb:!!L.glb,hasSz:!!L.el.__g.sz,dur:L.el.__g.dur};
  },makeGLB());
  ok('model loaded with an animation',made.glb&&made.hasSz&&made.dur>0,made);
  // draw near the end of the animation, when the child box is far out to the side, and look at the edges
  const draw=(tt=.99)=>p.evaluate(tt=>{
    const L=TL;glbDraw(L,tt,k=>val(L,k,tt));
    const c=L.el,t=document.createElement('canvas');t.width=c.width;t.height=c.height;const x=t.getContext('2d');x.drawImage(c,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data;let any=0,edge=0,x0=1e9,x1=-1;
    for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){if(d[(y*c.width+xx)*4+3]>8){any++;if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(xx<2||xx>=c.width-2||y<2||y>=c.height-2)edge++}}
    return {w:c.width,h:c.height,any,edge,span:x1-x0+1,lw:L.p.w,lh:L.p.h,Wp:W,Hp:H};
  },tt);
  const a=await draw();
  ok('normal mode keeps the 720x1280 box',a.w==720&&a.h==1280,a);
  ok('normal mode: model is drawn',a.any>500,a);
  ok('normal mode: the swinging box is not cropped (camera fits the animation)',a.edge==0,a);
  const a0=await draw(0);
  ok('normal mode: the swinging box is in view (spread ~3.8x one box)',a.span>3*a0.span,{start:a0.span,end:a.span});
  // flag is offered on model layers only
  const ui=await p.evaluate(()=>{const R=mk('rect');return {glb:FLG0(TL).includes('data-f=fc'),rect:FLG0(R).includes('data-f=fc')}});
  ok('Full canvas flag only on 3D model layers',ui.glb&&!ui.rect,ui);
  // full canvas on
  await p.evaluate(()=>{TL.fc=1;glbFull(TL)});
  const f=await draw();
  ok('full canvas: layer is the project size',f.lw==f.Wp&&f.lh==f.Hp,f);
  ok('full canvas: rendered at the project size',f.w==f.Wp&&f.h==f.Hp,f);
  ok('full canvas: model is drawn',f.any>500,f);
  ok('full canvas: the swinging box is not cropped',f.edge==0,f);
  const f0=await draw(0);
  ok('full canvas: the swinging box is in view (spread ~3.8x one box)',f.span>3*f0.span,{start:f0.span,end:f.span});
  // preview quality: render size follows the preview scale Q
  await p.evaluate(()=>{setQ(.5)});
  const q=await draw();
  ok('full canvas follows the preview scale',q.w==Math.round(q.Wp*.5)&&q.h==Math.round(q.Hp*.5),q);
  await p.evaluate(()=>{setQ(1)});
  // off again restores the old size
  await p.evaluate(()=>{TL.fc=0;glbFull(TL)});
  const o=await draw();
  ok('full canvas off: old layer size and render box are back',o.lw==405&&o.lh==720&&o.w==720&&o.h==1280,o);
  ok('no page errors',errs.length==0,errs);
  await b.close();console.log('FAILS',fails);process.exit(fails?1:0);
})();
