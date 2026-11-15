/* Stable entry points for driving the editor from outside the page (e.g. Claude in Chrome via Runtime.evaluate). Routes every mutation through the same functions the UI uses, so undo/save/redraw stay correct. Not used by the app's own UI. */
window.CLAUDE={
 state(){return JSON.parse(JSON.stringify({dur:P.dur,bpm:P.bpm,sel,t,play,layers:P.layers.map(l=>({id:l.id,name:l.name,type:l.type,p:l.p,kf:l.kf,efx:l.efx,s:l.s,e:l.e,par:l.par}))}))},
 addLayer(type){if(type=='cam'){const ex=P.layers.find(l=>l.type=='cam');if(ex){sel=ex.id;all();return ex.id}const C=mk('cam');C.name='Camera';P.layers.unshift(P.layers.pop());sel=C.id;all();return C.id}
  if(type.indexOf('ms:')==0){const m=mk('mshape');m.mk=type.slice(3);m.name=MSH[m.mk]?MSH[m.mk][0]:'Shape';const ar=msPts(m.mk).ar;m.p.w=ar>=1?340:Math.round(340*ar);m.p.h=ar>=1?Math.round(340/ar):340;sel=m.id;all();return m.id}
  const L=mk(type);sel=L.id;all();return L.id},
 removeLayer(id){const L=P.layers.find(l=>l.id==id);if(!L)return false;P.layers.forEach(c=>{if(c.par==id)c.par=L.par});P.layers=P.layers.filter(l=>l.id!=id);if(sel==id){sel=null;ks=[]}all();return true},
 select(id){if(id!=null&&!P.layers.some(l=>l.id==id))return false;sel=id;ks=[];all();return true},
 seek(seconds){t=Math.max(0,Math.min(P.dur,+seconds||0));dirty=1;all();return t},
 setProp(id,key,value){const L=P.layers.find(l=>l.id==id);if(!L)return false;setV(L,key,value);dirty=1;return true},
 toggleKeyframe(id,key){const L=P.layers.find(l=>l.id==id);if(!L)return false;tog(L,key);all();return true},
 addEffect(id,key){const L=P.layers.find(l=>l.id==id);if(!L||!EF[key]||L.efx.includes(key))return false;addFx(L,key);all();return true},
 removeEffect(id,key){const L=P.layers.find(l=>l.id==id);if(!L)return false;const i=L.efx.indexOf(key);if(i<0)return false;L.efx.splice(i,1);all();return true},
 save(){commit();return true}
};
