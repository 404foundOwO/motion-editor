/* ---- audio-only export encoders: WAV (always works), Ogg Opus, M4A AAC (when the browser can encode them). The dialog is in 21-export-dialog.js ---- */
const AXF={
 wav16:{n:'WAV 16-bit (lossless, works everywhere)',ext:'wav',kind:'wav',bits:16},
 wav24:{n:'WAV 24-bit (lossless, studio)',ext:'wav',kind:'wav',bits:24},
 wav32:{n:'WAV 32-bit float (lossless)',ext:'wav',kind:'wav',bits:32},
 ogg:{n:'Opus in Ogg (.ogg, small, great quality)',ext:'ogg',kind:'opus',need:'opus',rate:48000},
 m4a:{n:'AAC in M4A (.m4a, plays on Apple devices)',ext:'m4a',kind:'aac',need:'aac'}
};
function axHasAudio(){return P.layers.some(l=>(l.type=='audio'&&l.buf&&l.e>0)||(l.sbuf&&l.efx&&l.efx.includes('reveal')&&!(l.efo||[]).includes('reveal')))}

/* planar channel data, scaled down only if the mix would clip */
function axChannels(ab,norm){
 const c0=ab.getChannelData(0),c1=ab.numberOfChannels>1?ab.getChannelData(1):c0;let pk=0;
 for(let i=0;i<c0.length;i++){const a=Math.abs(c0[i]),b=Math.abs(c1[i]);if(a>pk)pk=a;if(b>pk)pk=b}
 const g=norm&&pk>1?.98/pk:1;
 if(g==1)return{c:[c0,c1],peak:pk,gain:1};
 const s0=new Float32Array(c0.length),s1=c1===c0?s0:new Float32Array(c1.length);
 for(let i=0;i<c0.length;i++){s0[i]=c0[i]*g;if(s1!==s0)s1[i]=c1[i]*g}
 return{c:[s0,s1],peak:pk,gain:g}}

function axWav(c,SR,bits){
 const n=c[0].length,bps=bits/8,ba=2*bps,dl=n*ba,fl=bits==32,hl=fl?58:44,u=new ArrayBuffer(hl+dl),v=new DataView(u);
 const s=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
 s(0,'RIFF');v.setUint32(4,hl-8+dl,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,fl?3:1,true);v.setUint16(22,2,true);v.setUint32(24,SR,true);v.setUint32(28,SR*ba,true);v.setUint16(32,ba,true);v.setUint16(34,bits,true);
 let p=36;if(fl){s(36,'fact');v.setUint32(40,4,true);v.setUint32(44,n,true);p=48}
 s(p,'data');v.setUint32(p+4,dl,true);let o=p+8;
 for(let i=0;i<n;i++)for(let ch=0;ch<2;ch++){const x=Math.max(-1,Math.min(1,c[ch][i]));
  if(bits==16){v.setInt16(o,Math.round(x<0?x*32768:x*32767),true);o+=2}
  else if(bits==24){const q=Math.round(x<0?x*8388608:x*8388607);v.setUint8(o,q&255);v.setUint8(o+1,(q>>8)&255);v.setUint8(o+2,(q>>16)&255);o+=3}
  else{v.setFloat32(o,c[ch][i],true);o+=4}}
 return new Blob([u],{type:'audio/wav'})}

/* minimal Ogg Opus container: one packet per page */
const AXCRC=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let r=i<<24;for(let k=0;k<8;k++)r=r&0x80000000?(r<<1)^0x04c11db7:r<<1;t[i]=r>>>0}return t})();
function axOgg(chunks,totalSamples,inRate){
 const parts=[],ser=(Math.random()*4294967295)>>>0;let seq=0;
 const page=(type,gran,pk)=>{const segs=[];let l=pk.length;while(l>=255){segs.push(255);l-=255}segs.push(l);
  const h=new Uint8Array(27+segs.length+pk.length),v=new DataView(h.buffer);
  h.set([79,103,103,83,0,type]);v.setUint32(6,gran>>>0,true);v.setUint32(10,Math.floor(gran/4294967296)>>>0,true);v.setUint32(14,ser,true);v.setUint32(18,seq++,true);v.setUint32(22,0,true);h[26]=segs.length;h.set(segs,27);h.set(pk,27+segs.length);
  let crc=0;for(let i=0;i<h.length;i++)crc=((crc<<8)^AXCRC[((crc>>>24)^h[i])&255])>>>0;v.setUint32(22,crc,true);parts.push(h)};
 const first=chunks[0],d=first&&first.m&&first.m.decoderConfig&&first.m.decoderConfig.description;
 let head;if(d){head=new Uint8Array(d instanceof ArrayBuffer?d:d.buffer?d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength):d)}
 if(!head||String.fromCharCode(...head.slice(0,8))!='OpusHead'){head=new Uint8Array(19);head.set([79,112,117,115,72,101,97,100,1,2]);const hv=new DataView(head.buffer);hv.setUint16(10,312,true);hv.setUint32(12,inRate,true)}
 const pre=new DataView(head.buffer,head.byteOffset).getUint16(10,true);
 page(2,0,head);
 const vend=new TextEncoder().encode('Motion Editor'),tags=new Uint8Array(8+4+vend.length+4),tv=new DataView(tags.buffer);tags.set([79,112,117,115,84,97,103,115]);tv.setUint32(8,vend.length,true);tags.set(vend,12);tv.setUint32(12+vend.length,0,true);page(0,0,tags);
 let gr=pre;const lim=pre+totalSamples;
 chunks.forEach((x,i)=>{const b=new Uint8Array(x.c.byteLength);x.c.copyTo(b);gr+=Math.round((x.c.duration||20000)*48/1000);const last=i==chunks.length-1;page(last?4:0,last?Math.min(gr,lim):Math.min(gr,lim),b)});
 return new Blob(parts,{type:'audio/ogg'})}

async function axEncode(c,SR,codec,kbps,prog,stop){
 const out=[];let err=null;const enc=new AudioEncoder({output:(ch,m)=>out.push({c:ch,m}),error:e=>{err=e}});
 enc.configure({codec,sampleRate:SR,numberOfChannels:2,bitrate:kbps*1000});
 const n=c[0].length,CH=SR;
 for(let i=0;i<n&&!stop();i+=CH){const nn=Math.min(CH,n-i),d=new Float32Array(nn*2);d.set(c[0].subarray(i,i+nn),0);d.set(c[1].subarray(i,i+nn),nn);
  const ad=new AudioData({format:'f32-planar',sampleRate:SR,numberOfFrames:nn,numberOfChannels:2,timestamp:Math.round(i/SR*1e6),data:d});enc.encode(ad);ad.close();if(err)throw err;
  while(enc.encodeQueueSize>8){await new Promise(r=>setTimeout(r,2));if(err)throw err}
  prog('Encoding '+Math.min(100,Math.round((i+nn)/n*100))+'%',(i+nn)/n);await new Promise(r=>setTimeout(r,0))}
 if(stop()){try{enc.close()}catch(e){}return null}
 await enc.flush();enc.close();if(err)throw err;return out}

async function startAudioExport(o){
 const F=AXF[o.f],SR=F.rate||o.sr;let cancel=0;
 const ovl=document.createElement('div');ovl.style.cssText='position:fixed;inset:0;z-index:70;background:#000c;display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif;color:#ddd';
 ovl.innerHTML='<div style="background:#1b1b21;border:1px solid #3a3a45;border-radius:12px;padding:20px;width:320px"><h3 style="margin:0 0 10px;font-size:15px">Exporting audio</h3><div id=axt style="margin-bottom:10px;color:#9a9aa6">Rendering audio…</div><div style="height:8px;border-radius:4px;background:#0d0d10;overflow:hidden"><div id=axb style="height:100%;width:0;background:#8b7bff;transition:width .1s"></div></div><div style="text-align:right;margin-top:14px"><button id=axc style="background:#24242c;color:#ddd;border:1px solid #3a3a45;border-radius:7px;padding:6px 14px;font:inherit;cursor:pointer">Cancel</button></div></div>';
 document.body.appendChild(ovl);const pt=ovl.querySelector('#axt'),pb=ovl.querySelector('#axb'),prog=(t,f)=>{pt.textContent=t;pb.style.width=Math.round(f*100)+'%'};
 ovl.querySelector('#axc').onclick=()=>{cancel=1;pt.textContent='Cancelling…'};
 const p0=play;OFFX=1;play=0;if(AON)aStop();
 try{
  await new Promise(r=>setTimeout(r,0));
  const ab=await renderAudioOffline(P.dur,SR);
  if(!ab){alert('There is no audio in this project yet.');return}
  if(cancel)return;
  const ch=axChannels(ab,o.norm);let blob;
  if(F.kind=='wav'){prog('Writing file…',.9);await new Promise(r=>setTimeout(r,0));blob=axWav(ch.c,SR,F.bits)}
  else{
   const codec=F.kind=='aac'?'mp4a.40.2':'opus',cfg=await AudioEncoder.isConfigSupported({codec,sampleRate:SR,numberOfChannels:2,bitrate:o.kb*1000});
   if(!cfg.supported)throw new Error('This browser cannot encode '+F.n.split(' (')[0]+' at '+SR+' Hz. Try WAV.');
   const ck=await axEncode(ch.c,SR,codec,o.kb,prog,()=>cancel);if(!ck)return;
   prog('Finishing…',1);
   if(F.ext=='ogg')blob=axOgg(ck,ch.c[0].length,SR);
   else{const mux=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),audio:{codec:'aac',numberOfChannels:2,sampleRate:SR},fastStart:'in-memory',firstTimestampBehavior:'offset'});
    ck.forEach(x=>mux.addAudioChunk(x.c,x.m));mux.finalize();blob=new Blob([mux.target.buffer],{type:'audio/mp4'})}}
  sv('motion-audio.'+F.ext,blob);
  if(ch.gain<1)alert('The mix was louder than 0 dB, so it was turned down by '+(-20*Math.log10(ch.gain)).toFixed(1)+' dB to avoid distortion.')
 }catch(e){console.error(e);alert('Audio export failed: '+(e&&e.message||e))}
 finally{ovl.remove();OFFX=0;play=0;if(p0)setIc($('#pl'),'play','Play / pause (Space)',1);dirty=1}
}
