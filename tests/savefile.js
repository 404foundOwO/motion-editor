// Save project to a file: streamed in slices (no giant strings), same file format, round trip through Load. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),crypto=require('crypto');
(async()=>{const br=await chromium.launch(),ctx=await br.newContext({acceptDownloads:true}),pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
// a >3 MB photo of noise so the slicing (3 MB steps) is exercised across a boundary
const info=await pg.evaluate(async()=>{const c=document.createElement('canvas');c.width=1400;c.height=1000;const x=c.getContext('2d'),d=x.createImageData(1400,1000);let z=2463534242;for(let i=0;i<d.data.length;i++){z^=z<<13;z>>>=0;z^=z>>>17;z^=z<<5;z>>>=0;d.data[i]=i%4==3?255:(z>>>8)&255}x.putImageData(d,0,0);const b=await new Promise(r=>c.toBlob(r,'image/png'));window.__b=b;P.layers.length=0;P.dur=5;t=0;addMediaFile(new File([b],'noise.png',{type:'image/png'}),0);await new Promise(r=>setTimeout(r,1200));const h=new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer()));return{size:b.size,hash:[...h].map(v=>v.toString(16).padStart(2,'0')).join('')}});
ok('test media is bigger than one slice ('+(info.size/1e6).toFixed(1)+' MB)',info.size>3.2e6);
const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('#exj')]);const f=path.join(os.tmpdir(),'sf-'+Date.now()+'.json');await dl.saveAs(f);
const txt=fs.readFileSync(f,'utf8'),o=JSON.parse(txt);
ok('the file is valid JSON with the usual parts ('+Object.keys(o).join(',')+')',o.v==2&&o.P&&o.media&&Array.isArray(o.fonts)&&'pool' in o);
const m=Object.values(o.media)[0];ok('media is a data URL ('+m.data.slice(0,30)+'…)',/^data:image\/png;base64,/.test(m.data)&&m.name=='noise.png'&&m.kind=='image');
const bytes=Buffer.from(m.data.slice(m.data.indexOf(',')+1),'base64'),h=crypto.createHash('sha256').update(bytes).digest('hex');ok('the media bytes are intact across slice boundaries',h==info.hash&&bytes.length==info.size);
// load it back
await pg.evaluate(()=>{P.layers.length=0;all()});await pg.setInputFiles('#fj',f);await pg.waitForTimeout(3000);
const r=await pg.evaluate(()=>{const L=P.layers.find(l=>l.type=='media');return L?{w:L.el.naturalWidth,name:MB[L.id].name,size:MB[L.id].blob.size}:null});
ok('Load brings it back ('+JSON.stringify(r)+')',r&&r.w==1400&&r.size==info.size);
// big projects: binary .mep file (forced here by lowering the threshold), media intact, loads by slicing
await pg.evaluate(()=>{BIGSAVE=1});
const [d2]=await Promise.all([pg.waitForEvent('download'),pg.click('#exj')]);const f2=path.join(os.tmpdir(),'sf2-'+Date.now()+'.mep');await d2.saveAs(f2);
const bin=fs.readFileSync(f2);ok('big projects are saved as a binary .mep file ('+d2.suggestedFilename()+', '+(bin.length/1e6).toFixed(1)+' MB, no base64 growth)',/\.mep$/.test(d2.suggestedFilename())&&bin.slice(0,4).toString()=='MEP1'&&bin.length<info.size*1.05+200000);
await pg.evaluate(()=>{P.layers.length=0;all()});await pg.setInputFiles('#fj',f2);await pg.waitForTimeout(3000);
const r2=await pg.evaluate(async()=>{const L=P.layers.find(l=>l.type=='media');if(!L)return null;const h=new Uint8Array(await crypto.subtle.digest('SHA-256',await MB[L.id].blob.arrayBuffer()));return{w:L.el.naturalWidth,size:MB[L.id].blob.size,hash:[...h].map(v=>v.toString(16).padStart(2,'0')).join('')}});
ok('opening the .mep brings the media back byte for byte',r2&&r2.w==1400&&r2.size==info.size&&r2.hash==info.hash);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
