/* ---- message bubble ---- */
const BBM=new WeakMap();let BBC=null;
function bbGeom(L,t){const v=k=>val(L,k,t),sz=Math.max(8,v('bsz')||56),pd=Math.max(0,v('bpd')||0),mw=Math.max(sz+2*pd,v('bw')||560),txt=String(L.text||''),fam=L.font||'Roboto Flex',key=[txt,sz,pd,mw,fam].join('|'),old=BBM.get(L);if(old&&old.k==key)return old.g;
 if(!BBC)BBC=document.createElement('canvas').getContext('2d');BBC.font=`500 ${sz}px "${fam}",system-ui,sans-serif`;const inner=mw-2*pd,lines=[];
 txt.split('\n').forEach(par=>{let ln='';par.split(' ').forEach(wd=>{const tr=ln?ln+' '+wd:wd;if(BBC.measureText(tr).width>inner&&ln){lines.push(ln);ln=wd}else ln=tr});lines.push(ln)});
 const tw=Math.max(1,...lines.map(l=>BBC.measureText(l).width)),lh=sz*1.26,w=Math.max(sz+2*pd,Math.min(mw,tw+2*pd)),h=Math.max(sz+2*pd,lines.length*lh+2*pd-(lh-sz)*.4),g={w,h,lines,lh,sz,pd};BBM.set(L,{k:key,g});return g}
function drawBubble(L,t,col,v){
 const g=bbGeom(L,t),w=g.w,h=g.h,r=Math.min(Math.max(0,v('brd')),Math.min(w,h)/2),side=Math.round(v('btl')||0),ts=Math.max(.2,v('bts')||1),tl=Math.min(r,h*.5)*ts,x0=-w/2,x1=w/2,y0=-h/2,y1=h/2,sg=side==1?-1:1,rb=side?0:r;
 cx.beginPath();cx.moveTo(x0+r,y0);cx.lineTo(x1-r,y0);cx.arcTo(x1,y0,x1,y0+r,r);
 if(side==2){cx.lineTo(x1,y1);cx.lineTo(x0+r,y1)}else{cx.lineTo(x1,y1-r);cx.arcTo(x1,y1,x1-r,y1,r);cx.lineTo(x0+r,y1)}
 if(side==1){cx.lineTo(x0,y1)}else{cx.arcTo(x0,y1,x0,y1-r,r)}
 cx.lineTo(x0,y0+r);cx.arcTo(x0,y0,x0+r,y0,r);cx.closePath();
 if(side){const ex=sg>0?x1:x0,P0=[ex-sg*tl*1.15,y1-tl*1.05],P1=[ex,y1-tl*1.05],A1=[ex,y1-tl*.5],A2=[ex+sg*tl*.2,y1-tl*.14],P2=[ex+sg*tl*.9,y1+tl*.06],B1=[ex+sg*tl*.42,y1+tl*.2],B2=[ex-sg*tl*.35,y1+tl*.05],P3=[ex-sg*tl*.95,y1-tl*.05],P4=[ex-sg*tl*1.15,y1-tl*.4];
  cx.moveTo(...P0);
  if(sg>0){cx.lineTo(...P1);cx.bezierCurveTo(...A1,...A2,...P2);cx.bezierCurveTo(...B1,...B2,...P3);cx.lineTo(...P4)}
  else{cx.lineTo(...P4);cx.lineTo(...P3);cx.bezierCurveTo(...B2,...B1,...P2);cx.bezierCurveTo(...A2,...A1,...P1)}
  cx.closePath()}
 cx.fill();if(SK(L,col)){cx.lineWidth=v('stw')*2;cx.strokeStyle=v('stc');cx.lineJoin='round';cx.stroke()}
 const tc=val(L,'btc',t);cx.fillStyle=typeof tc=='string'?tc:'#fff';cx.font=`500 ${g.sz}px "${L.font||'Roboto Flex'}",system-ui,sans-serif`;cx.textAlign='left';cx.textBaseline='middle';
 g.lines.forEach((ln,i)=>cx.fillText(ln,x0+g.pd,y0+g.pd+g.lh*.5+i*g.lh-(g.lh-g.sz)*.2));cx.textAlign='start';cx.textBaseline='alphabetic'}
const BBUI=L=>{const sd=Math.round(L.p.btl||0),sg=(l,i)=>`<button data-btl=${i} class="${sd==i?'on':''}">${l}</button>`;
 return `<div class=r><label>Message</label><textarea data-s=text rows=3 style="width:100%;max-width:190px">${esc(L.text)}</textarea></div>`
 +`<div class=seg2>${sg('No tail',0)}${sg('Left',1)}${sg('Right',2)}</div>`
 +`<div class=seg2><button data-bbp=0>${IC('msg')}Sent</button><button data-bbp=1>${IC('msg')}Received</button></div>`
 +row(L,'bw','Max width')+row(L,'bsz','Text size')+row(L,'bpd','Padding')+row(L,'brd','Corner radius')+(sd?row(L,'bts','Tail size'):'')
 +row(L,'c1','Bubble color')+row(L,'btc','Text color')};

const MSUI=L=>`<p class=m style="margin:2px 2px 6px"><b>Shape</b></p><div class=mspick>${Object.keys(MSH).map(k=>`<button data-msk="${k}" class="${(L.mk||'cookie9')==k?'on':''}" title="${MSH[k][0]}">${msThumb(k,22)}</button>`).join('')}</div>`;

