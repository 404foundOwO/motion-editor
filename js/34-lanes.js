/* Lanes view (opt-in, button in the timeline bar): several clips share one timeline row when they do not overlap in time. Display only: every clip is still its own layer and its own row element, rows of one lane sit in the same grid cell (CSS), so all the existing handlers keep working. Each layer may carry L.ln, its lane among its siblings (smaller = higher row); layers without it get one. Rules: layers in one lane never overlap in time, and of two overlapping layers the one stacked higher in P.layers has the smaller ln. Automatic placement never changes P.layers (so rendering is untouched); only a lane move chosen by the user does. */
const lnOn=()=>document.getElementById('app').classList.contains('lanes'),lnKey=l=>root(l)?null:l.par,lnOv=(a,b)=>a.s<Math.min(b.e,P.dur)-1e-6&&b.s<Math.min(a.e,P.dur)-1e-6,lnHas=l=>typeof l.ln=='number'&&isFinite(l.ln);
const lnSibs=L=>P.layers.filter(x=>x.type!='cam'&&lnKey(x)==lnKey(L));
function lnFree(L,v,S){return S.every(x=>x===L||x.ln!==v||(!lnOv(x,L)&&x.type!='group'&&L.type!='group'))}
function lnBetween(a,b,used){let lo=a,hi=b;if(lo===undefined&&hi===undefined)return 0;if(lo===undefined)return hi-1;if(hi===undefined)return lo+1;for(const f of[.5,.25,.75,.125,.375,.625,.875,.0625]){const v=lo+(hi-lo)*f;if(!used.has(v))return v}return lo+(hi-lo)*.4999}
/* put L in a lane: an existing free lane inside its allowed range, else a new lane next to the layers it has to stay above / below */
function lnPlace(L,S){const idx=x=>P.layers.indexOf(x),i=idx(L);let lb=-Infinity,ub=Infinity;const vals=new Set();
 S.forEach(x=>{if(x===L||!lnHas(x))return;vals.add(x.ln);if(lnOv(x,L)){if(idx(x)>i)lb=Math.max(lb,x.ln);else ub=Math.min(ub,x.ln)}});
 const all=[...vals].sort((a,b)=>a-b);for(const v of all){if(v>lb&&v<ub&&lnFree(L,v,S)){L.ln=v;return}}
 let a,b;if(lb>-Infinity&&ub<Infinity){a=lb;b=ub}else if(lb>-Infinity){a=lb;b=all.find(v=>v>lb)}else if(ub<Infinity){b=ub;a=[...all].reverse().find(v=>v<ub)}else{a=all.length?all[all.length-1]:undefined;b=undefined;L.ln=a===undefined?0:a+1;return}
 L.ln=lnBetween(a,b,vals)}
/* make every lane valid again; `first` (the layer just edited) is the one that moves when two layers clash */
function lnNorm(first){let ch=0;const G=new Map();P.layers.forEach(l=>{if(l.type=='cam')return;const k=lnKey(l);(G.get(k)||G.set(k,[]).get(k)).push(l)});
 G.forEach(S=>{const order=[...S].reverse();order.forEach(l=>{if(!lnHas(l)){lnPlace(l,S);ch=1}});
  for(let pass=0;pass<S.length*2+2;pass++){let bad=null;
   for(let i=0;i<order.length&&!bad;i++){const X=order[i];for(let j=i+1;j<order.length;j++){const Y=order[j];if(X.ln===Y.ln&&(lnOv(X,Y)||X.type=='group'||Y.type=='group')||lnOv(X,Y)&&X.ln>Y.ln){bad=first===X?X:first===Y?Y:(X.type=='group'?Y:Y);break}}}
   if(!bad)break;bad.ln=undefined;lnPlace(bad,S);ch=1}});
 return ch}
/* user moves: t = {lane:v} (join that lane), {above:v} / {below:v} (a new lane next to lane v) */
function lnMoveTo(L,t){const S=lnSibs(L),vals=new Set(S.filter(x=>x!==L&&lnHas(x)).map(x=>x.ln)),all=[...vals].sort((a,b)=>a-b),prev=v=>[...all].reverse().find(x=>x<v),next=v=>all.find(x=>x>v);let v;
 if('lane' in t){v=lnFree(L,t.lane,S)?t.lane:lnBetween(t.lane,next(t.lane),vals)}else if('above' in t)v=lnBetween(prev(t.above),t.above,vals);else v=lnBetween(t.below,next(t.below),vals);
 L.ln=v;lnStackFix(L,S);lnNorm(L)}
/* keep the picture honest: a clip dropped in a lane that is above/below overlapping layers must also be above/below them in the stack */
function lnStackFix(L,S){const a=P.layers,over=S.filter(x=>x!==L&&lnHas(x)&&lnOv(x,L)),lower=over.filter(x=>x.ln>L.ln),upper=over.filter(x=>x.ln<L.ln);if(!lower.length&&!upper.length)return;
 const i=a.indexOf(L),lo=lower.length?Math.max(...lower.map(x=>a.indexOf(x))):-1,hi=upper.length?Math.min(...upper.map(x=>a.indexOf(x))):a.length;if(i>lo&&i<hi)return;
 a.splice(i,1);const lo2=lower.length?Math.max(...lower.map(x=>a.indexOf(x))):-1,hi2=upper.length?Math.min(...upper.map(x=>a.indexOf(x))):a.length;a.splice(lower.length?lo2+1:hi2,0,L)}
/* a clip created by a drop: put it where it was dropped */
function lnLand(L,t){if(!lnOn()||!t)return;L.ln=undefined;lnMoveTo(L,t)}
/* rows in display order, with the grid row, lane label and secondary flag of each */
function lnRows(par=null,dp=0,st={n:2}){const sib=P.layers.filter(l=>lnKey(l)==par),out=[],lanes=new Map();sib.filter(l=>l.type=='cam').forEach(c=>out.push([c,dp,{gr:st.n++,lane:'cam',rank:0,n:1,sec:0}]));
 sib.filter(l=>l.type!='cam').forEach(l=>{const k=lnHas(l)?l.ln:1e9;(lanes.get(k)||lanes.set(k,[]).get(k)).push(l)});
 [...lanes.keys()].sort((a,b)=>a-b).forEach((k,ri)=>{const ls=lanes.get(k).sort((a,b)=>a.s-b.s),gr=st.n++;ls.forEach((l,i)=>out.push([l,dp,{gr,lane:k,rank:ri+1,n:ls.length,sec:i>0}]));
  ls.forEach(l=>{if(l.type=='group'&&!l.col)out.push(...lnRows(l.id,dp+1,st))})});return out}
/* where a pointer is: over a lane (join it) or near the edge of one (new lane above / below); only lanes of layers with parent `par` */
function lnAt(e,par){const rows=[...document.querySelectorAll('#tlin .row[data-lane]:not(.lnx)')].filter(r=>r.dataset.lane!='cam'&&(r.dataset.par||'')==(par==null?'':String(par))).map(r=>({b:r.getBoundingClientRect(),lane:+r.dataset.lane}));if(!rows.length)return null;
 const y=e.clientY,f=rows[0],l=rows[rows.length-1];if(y<f.b.top)return{above:f.lane};if(y>l.b.bottom)return{below:l.lane};
 for(const x of rows)if(y>=x.b.top&&y<=x.b.bottom){const q=(y-x.b.top)/x.b.height;return q<.2?{above:x.lane}:q>.8?{below:x.lane}:{lane:x.lane}}return null}
function lnMark(t,par){document.querySelectorAll('#tlin .row.dz-lane,#tlin .row.dz-lt,#tlin .row.dz-lb').forEach(r=>r.classList.remove('dz-lane','dz-lt','dz-lb'));if(!t)return;
 const v='lane' in t?t.lane:'above' in t?t.above:t.below,cls='lane' in t?'dz-lane':'above' in t?'dz-lt':'dz-lb';document.querySelectorAll('#tlin .row[data-lane]').forEach(r=>{if(r.dataset.lane!='cam'&&+r.dataset.lane===v&&(r.dataset.par||'')==(par==null?'':String(par))&&(cls=='dz-lane'||!r.classList.contains('lnx')))r.classList.add(cls)})}
/* toggle */
function setLanes(on,save){document.getElementById('app').classList.toggle('lanes',!!on);const b=$('#tll');if(b){b.classList.toggle('on',!!on);b.title=on?'Lanes view: clips share rows. Click for one layer per row':'One layer per row. Click for the lanes view (clips that do not overlap share a row)'}if(save)try{localStorage.setItem('meLN',on?'1':'0')}catch(e){}if(on){lnNorm();try{commit()}catch(e){}}tl()}
/* dragging a clip up or down moves it to another lane; dropping a clip from the pool puts it in the lane it is dropped on (33) */
let LNS=null;
addEventListener('pointerdown',e=>{LNS=null;if(!lnOn()||e.button)return;const el=e.target.closest&&e.target.closest('#tlin .bar,#tlin .hd'),row=el&&el.closest('.row');if(row&&row.dataset.id)LNS={id:+row.dataset.id,y0:e.clientY,drag:!!e.target.closest('.bar')&&!e.shiftKey}},true);
addEventListener('pointermove',e=>{if(!LNS||!LNS.drag)return;if(!LNS.v&&Math.abs(e.clientY-LNS.y0)<10)return;const L=P.layers.find(l=>l.id==LNS.id);if(!L||L.type=='cam')return;LNS.v=1;LNS.t=lnAt(e,lnKey(L));lnMark(LNS.t,lnKey(L))});
addEventListener('pointerup',()=>{const s=LNS;LNS=null;if(!s)return;lnMark(null);const L=P.layers.find(l=>l.id==s.id);if(!L||!lnOn())return;let ch=0;if(s.v&&s.t&&L.type!='cam'){lnMoveTo(L,s.t);ch=1}else ch=lnNorm(L);if(ch){tl();side();dirty=1;try{commit()}catch(e){}}});
{const b=$('#tll');if(b)b.onclick=()=>setLanes(!lnOn(),true);let v=null;try{v=localStorage.getItem('meLN')}catch(e){}if(v=='1')setLanes(true,false)}
