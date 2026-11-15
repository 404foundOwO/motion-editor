/* Text effects that change the displayed string: Text randomizer (trand) scrambles letters that settle into the real text; Number riser (tcount) counts every number in the text up from a start value. glyphs() (04) asks txMod() for the string to show. Both depend only on time, so paused = playing. */
EF.trand=['Text randomizer',0];EP.trand=[['rzp','Progress (%) (0 = all scrambled, 100 = the real text)',0],['rzs','Spread (%) (0 all letters at once, 100 one by one)',60],['rzr','Scramble speed (changes per s)',20],['rzc','Characters',0],['rzd','Seed',0]];
EF.tcount=['Number riser',0];EP.tcount=[['cnp','Progress (%)',0],['cnf','Start value',0],['cne','Easing',1]];
SELO.rzc=[['Match each letter (A to B, a to b, 1 to 2)',0],['Letters and digits',1],['Symbols',2],['Binary 0 / 1',3]];SELO.cne=[['Linear',0],['Ease out (fast start)',1],['Ease in-out',2]];
Object.assign(KA,{rzp:1,rzs:1,rzr:1,rzd:1,cnp:1,cnf:10});
const CNE=[x=>x,x=>1-Math.pow(1-x,3),x=>x*x*(3-2*x)],c01=x=>Math.max(0,Math.min(1,x||0));
function cntText(L,t,s){const p=c01((val(L,'cnp',t)||0)/100),f=val(L,'cnf',t)||0,m=val(L,'cne',t),ez=CNE[m==null?1:Math.round(m)]||CNE[1];
 return s.replace(/\d+(?:,\d{3})*(?:\.\d+)?/g,tok=>{const comma=tok.includes(','),dec=(tok.split('.')[1]||'').length,v=parseFloat(tok.replace(/,/g,''));if(!isFinite(v))return tok;const cur=f+(v-f)*ez(p);return comma?cur.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}):cur.toFixed(dec)})}
function rndText(L,t,s){const p=c01((val(L,'rzp',t)||0)/100),sp=c01((val(L,'rzs',t)||0)/100),k=Math.floor(t*Math.max(1,val(L,'rzr',t)||20)),sd=val(L,'rzd',t)||0,mode=Math.round(val(L,'rzc',t))||0,cs=[...s],ix=[];let n=0;
 cs.forEach((c,i)=>{ix[i]=/\s/.test(c)?-1:n++});
 const h=(a,b)=>{const x=Math.sin(a*127.1+b*311.7+sd*74.7)*43758.5453;return x-Math.floor(x)},pick=(set,r)=>set[Math.floor(r*set.length)%set.length];
 return cs.map((c,i)=>{if(ix[i]<0||p>=(1-sp)+sp*(ix[i]+1)/n-1e-9)return c;const r=h(i+1,k);
  if(mode==1)return pick('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',r);if(mode==2)return pick('#$%&@*+=?!<>/\\|~^',r);if(mode==3)return pick('01',r);
  return /\p{Lu}/u.test(c)?pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ',r):/\p{Ll}/u.test(c)?pick('abcdefghijklmnopqrstuvwxyz',r):/\d/.test(c)?pick('0123456789',r):c}).join('')}
function txMod(L,t){const A=L.efa;if(!A||(!A.includes('trand')&&!A.includes('tcount')))return null;let s=String(L.text);if(A.includes('tcount'))s=cntText(L,t,s);const w=s;if(A.includes('trand'))s=rndText(L,t,s);return{s,w}}
/* Zigzag reveal (zzrev): each letter or word flies in from an alternating side or corner along a zigzag path and settles in place. animG() (07) adds zzOff() to the letter's offset and opacity. */
EF.zzrev=['Zigzag reveal',0];EP.zzrev=[['zzp','Progress (%)',0],['zzs','Stagger (%) (0 all together, 100 one after another)',60],['zzu','Animate',0],['zzm','Come in from',0],['zzx','Distance X (px)',300],['zzy','Distance Y (px)',200],['zzw','Zigzag width (px)',80],['zzf','Zigzags',3],['zze','Easing',1]];
SELO.zzu=[['Letters',0],['Words',1]];SELO.zzm=[['Alternate x and y (side, then above or below)',0],['Diagonal zigzag (opposite corners)',1],['Left and right',2],['Above and below',3],['Four corners in turn',4]];SELO.zze=[['Ease out',0],['Overshoot (settles with a bounce)',1],['Smooth',2],['Linear',3]];
Object.assign(KA,{zzp:1,zzs:1,zzx:10,zzy:10,zzw:5,zzf:1});
const ZZE=[x=>1-Math.pow(1-x,3),x=>{const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)},x=>x*x*(3-2*x),x=>x],zzTri=x=>{const f=x-Math.floor(x);return f<.25?f*4:f<.75?2-f*4:f*4-4};
function zzOff(L,t,i,n,wi,wc){const v=k=>val(L,k,t),words=v('zzu')>.5,k=words?(wi[i]||0):i,cnt=words?wc:n,s=c01((v('zzs')||0)/100),p=c01((v('zzp')||0)/100),q=c01(p*(1+s)-s*k/Math.max(1,cnt-1)),m=Math.round(v('zzm'))||0,sg=k%2?1:-1;
 let sx,sy;if(m==1){sx=sg;sy=-sg}else if(m==2){sx=sg;sy=0}else if(m==3){sx=0;sy=sg}else if(m==4){sx=[-1,1,1,-1][k%4];sy=[-1,-1,1,1][k%4]}else if(k%2==0){sx=k%4==0?-1:1;sy=0}else{sx=0;sy=k%4==1?-1:1}
 const e=(ZZE[Math.round(v('zze'))]||ZZE[0])(q),ax=sx*(v('zzx')||0),ay=sy*(v('zzy')||0),len=Math.hypot(ax,ay),nx=len?-ay/len:0,ny=len?ax/len:1,w=(v('zzw')||0)*zzTri(q*Math.max(1,v('zzf')||3))*(1-q);
 return{dx:ax*(1-e)+w*nx,dy:ay*(1-e)+w*ny,op:c01(q*4)}}
