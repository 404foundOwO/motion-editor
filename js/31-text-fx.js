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
