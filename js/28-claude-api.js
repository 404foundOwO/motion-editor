/* Entry points for driving the editor from outside the page (Claude in Chrome via Runtime.evaluate). Every mutation goes through the functions the UI uses, then all()/commit(), so undo, save and redraw stay correct. Not used by the app's own UI. */
(()=>{
const lay=id=>P.layers.find(l=>l.id==id),done=()=>{dirty=1;all();commit();return true};
const FRZ=['id','p','kf','efx','efa','efo','el','buf','sbuf','vid'];
window.CLAUDE={
 state(){const o=JSON.parse(ser());o.sel=sel;o.t=t;o.play=!!play;return o},
 catalog(){return{layerTypes:ADDS.flatMap(([c,it])=>it.map(i=>i[0])),effects:Object.keys(EF).map(k=>({key:k,name:EF[k][0],params:(EP[k]||[]).map(([key,label,def])=>({key,label,def}))})),ranges:RNG,easings:Object.keys(EN)}},
 addLayer(type){if(type=='cam'){const ex=P.layers.find(l=>l.type=='cam');if(ex){sel=ex.id;all();return ex.id}const C=mk('cam');C.name='Camera';P.layers.unshift(P.layers.pop());sel=C.id;all();commit();return C.id}
  if(type.indexOf('ms:')==0){const m=mk('mshape');m.mk=type.slice(3);m.name=MSH[m.mk]?MSH[m.mk][0]:'Shape';const ar=msPts(m.mk).ar;m.p.w=ar>=1?340:Math.round(340*ar);m.p.h=ar>=1?Math.round(340/ar):340;sel=m.id;all();commit();return m.id}
  const L=mk(type);sel=L.id;all();commit();return L.id},
 removeLayer(id){const L=lay(id);if(!L)return false;P.layers.forEach(c=>{if(c.par==id)c.par=L.par});P.layers=P.layers.filter(l=>l.id!=id);if(sel==id){sel=null;ks=[]}return done()},
 duplicate(id){if(!lay(id))return null;sel=id;ks=[];copyAny();pasteAny();commit();return sel},
 reorder(id,index){/* index is the stack position: 0 = bottom (the last row in the timeline) */const L=lay(id);if(!L)return false;const a=P.layers;a.splice(a.indexOf(L),1);a.splice(Math.max(0,Math.min(a.length,index)),0,L);return done()},
 group(id){if(!lay(id))return null;sel=id;ks=[];groupLayer();return sel},
 ungroup(id){const G=lay(id);if(!G||G.type!='group')return false;sel=id;ks=[];ungroup();return true},
 select(id){if(id!=null&&!lay(id))return false;sel=id;ks=[];all();return true},
 setLayer(id,fields){const L=lay(id);if(!L)return false;for(const k in fields){if(!FRZ.includes(k))L[k]=fields[k]}return done()},
 setProject(f){for(const k of ['dur','bpm','boff','bpb','sub','grid','snap'])if(k in f)P[k]=f[k];syncBeat();return done()},
 setProp(id,key,value){const L=lay(id);if(!L)return false;setV(L,key,value);dirty=1;return true},
 setKeyframe(id,key,time,value,ease){const L=lay(id);if(!L)return false;const a=L.kf[key]=L.kf[key]||[],v=clampV(key,value);time=kfC(L,time);const f=a.find(f=>Math.abs(f.t-time)<.008);if(f){f.v=v;if(ease)f.e=ease}else ins(a,{t:time,v,e:ease||'ease'});return done()},
 removeKeyframe(id,key,time){const L=lay(id);if(!L||!L.kf[key])return false;const a=L.kf[key],i=a.findIndex(f=>Math.abs(f.t-time)<.008);if(i<0)return false;if(a.length==1)L.p[key]=a[0].v;a.splice(i,1);if(!a.length)delete L.kf[key];return done()},
 toggleKeyframe(id,key){const L=lay(id);if(!L)return false;tog(L,key);return done()},
 addEffect(id,key){const L=lay(id);if(!L||!EF[key]||L.efx.includes(key))return false;addFx(L,key);return done()},
 removeEffect(id,key){const L=lay(id);if(!L)return false;const i=L.efx.indexOf(key);if(i<0)return false;L.efx.splice(i,1);fxPrune(L,key);return done()},
 animate(id,tracks){const L=lay(id);if(!L)return false;for(const k in tracks){const a=L.kf[k]=L.kf[k]||[];for(const[tm0,v,e]of tracks[k]){const time=kfC(L,tm0),f=a.find(f=>Math.abs(f.t-time)<.008),cv=clampV(k,v);if(f){f.v=cv;if(e)f.e=e}else ins(a,{t:time,v:cv,e:e||'ease'})}}return done()},
 addText(text,props,tracks){const id=this.addLayer('text'),L=lay(id);L.text=text;for(const k in props||{})L.p[k]=clampV(k,props[k]);if(tracks)this.animate(id,tracks);else done();return id},
 batch(ops){return ops.map(([m,...a])=>{try{return this[m](...a)}catch(e){return'error: '+e.message}})},
 help(){return`CLAUDE API (one call each; all edits go through the UI's own paths).
Read: state() catalog() audioInfo(id) screenshot()
Create: addLayer(type) addText(text,props,tracks) duplicate(id) group(id)
Animate: animate(id,{key:[[time,value,ease?],...]}) setKeyframe(id,key,time,value,ease) removeKeyframe toggleKeyframe
Edit: setSpeed(id,x) (video/audio clip speed, 1 = normal; linked audio follows) setProp(id,key,value) setLayer(id,{name,text,s,e,...}) setProject({dur,bpm,boff,bpb,sub}) addEffect(id,key) reorder removeLayer select seek(s) play(on) undo redo
Expressions: setExpression(id,key,'1+0.1*sin(t*6)') (returns true or an error; null clears). Names t value beat bpm dur index; wiggle(f,a) loop(p) link('Layer','key') ease bounce elastic linear noise sin cos abs min max clamp lerp
Layer order: state().layers and reorder() use the stack order (index 0 = bottom, drawn first); the timeline lists the top of the stack first.
Many at once: batch([['setProp',id,'x',10],['addEffect',id,'blur']])
Example, text that scales up: CLAUDE.addText('Hello',{sz:200},{sc:[[0,0,'ease'],[1,1]]})
Keys: sc scale, op opacity, x y z, rx ry rz rotation, sz text size, blur glow. Easings: lin ease cin cout hold.`},
 setSpeed(id,sp){const L=lay(id);if(!L||!(L.vid||L.type=='audio'))return false;setSpeed(L,sp);return spdOf(L)},
 setExpression(id,key,formula){const L=lay(id);if(!L)return'no such layer';const r=xpSet(L,key,formula);if(r)return r;done();return true},
 seek(s){t=Math.max(0,Math.min(P.dur,+s||0));dirty=1;all();return t},
 play(on){if(!!on!=!!play)$('#pl').click();return !!play},
 undo(){undo();all();return true},redo(){redo();all();return true},save(){commit();return true},
 screenshot(q=.7){dirty=1;return cv.toDataURL('image/jpeg',q)},
 audioInfo(id,bins=200){const b=BUF[id];if(!b)return null;const n=b.length,ch=b.numberOfChannels,d=[...Array(ch).keys()].map(c=>b.getChannelData(c)),bs=Math.max(1,Math.floor(n/bins)),env=[];
  for(let i=0;i<bins;i++){let s=0,c=0;for(let j=i*bs;j<Math.min(n,(i+1)*bs);j+=8){for(const x of d)s+=x[j]*x[j];c+=ch}env.push(Math.sqrt(s/Math.max(1,c)))}
  const mx=Math.max(...env,1e-9),e=env.map(v=>+(v/mx).toFixed(3)),sec=b.duration/bins,onsets=[];for(let i=1;i<bins;i++)if(e[i]>.25&&e[i]-e[i-1]>.15)onsets.push(+(i*sec).toFixed(3));
  return{duration:b.duration,sampleRate:b.sampleRate,channels:ch,binSeconds:sec,envelope:e,onsets,note:'onsets are a rough loudness-jump guess; bpm in the project is the user\'s value'}},
 projects:{list:async()=>(await projList()).map(m=>({id:m.id,name:m.name||m.title,t:m.t})),new:name=>projNew(name),open:id=>projOpen(id)}
};
})();
