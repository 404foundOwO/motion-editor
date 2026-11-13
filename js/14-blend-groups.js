/* ---- layer blending (native canvas modes + custom pixel modes) ---- */
const BLN={darken:'darken',multiply:'multiply',colorburn:'color-burn',lighten:'lighten',screen:'screen',colordodge:'color-dodge',add:'lighter',overlay:'overlay',softlight:'soft-light',hardlight:'hard-light',difference:'difference',exclusion:'exclusion',hue:'hue',saturation:'saturation',color:'color',luminosity:'luminosity',extract:'destination-in',erase:'destination-out',behind:'destination-over',atop:'source-atop'};
const BLP={linearburn:(b,s)=>Math.max(0,b+s-1),vividlight:(b,s)=>s<.5?(s<=0?0:Math.max(0,1-(1-b)/(2*s))):(s>=1?1:Math.min(1,b/(2*(1-s)))),linearlight:(b,s)=>Math.min(1,Math.max(0,b+2*s-1)),pinlight:(b,s)=>s<.5?Math.min(b,2*s):Math.max(b,2*(s-.5)),hardmix:(b,s)=>b+s>=1?1:0,subtract:(b,s)=>Math.max(0,b-s),divide:(b,s)=>s<=0?1:Math.min(1,b/s)};
const BLM=[['Normal',[['normal','Normal']]],['Darken',[['darken','Darken'],['multiply','Multiply'],['colorburn','Color burn'],['linearburn','Linear burn']]],['Lighten',[['lighten','Lighten'],['screen','Screen'],['colordodge','Color dodge'],['add','Add']]],['Contrast',[['overlay','Overlay'],['softlight','Soft light'],['hardlight','Hard light'],['vividlight','Vivid light'],['linearlight','Linear light'],['pinlight','Pin light'],['hardmix','Hard mix'],['contrast','Contrast boost']]],['Inversion',[['difference','Difference'],['exclusion','Exclusion'],['negative','Negative'],['subtract','Subtract'],['divide','Divide']]],['Color',[['hue','Hue'],['saturation','Saturation'],['color','Color'],['luminosity','Luminosity']]],['Stencil',[['extract','Extract (keep inside)'],['erase','Erase'],['behind','Behind'],['atop','Clip to below']]]];
function blendDraw(ctx,src,mode){
 const w=src.width,h=src.height,op=ctx.globalCompositeOperation;
 if(BLN[mode]){ctx.globalCompositeOperation=BLN[mode];ctx.drawImage(src,0,0,W,H);ctx.globalCompositeOperation=op;return}
 if(mode=='negative'){const T=gbCv(70,w,h),tg=T.getContext('2d');tg.setTransform(1,0,0,1,0,0);tg.filter='none';tg.globalAlpha=1;tg.globalCompositeOperation='source-over';tg.clearRect(0,0,w,h);tg.drawImage(src,0,0,w,h);tg.globalCompositeOperation='source-in';tg.fillStyle='#fff';tg.fillRect(0,0,w,h);tg.globalCompositeOperation='source-over';ctx.globalCompositeOperation='difference';ctx.drawImage(T,0,0,W,H);ctx.globalCompositeOperation=op;return}
 if(mode=='contrast'){const T=gbCv(71,w,h),tg=T.getContext('2d');tg.setTransform(1,0,0,1,0,0);tg.globalAlpha=1;tg.globalCompositeOperation='source-over';tg.clearRect(0,0,w,h);tg.filter='contrast(2.1) saturate(1.15)';tg.drawImage(ctx.canvas,0,0);tg.filter='none';tg.globalCompositeOperation='destination-in';tg.drawImage(src,0,0,w,h);tg.globalCompositeOperation='source-over';ctx.globalCompositeOperation='source-over';ctx.drawImage(T,0,0,W,H);ctx.globalCompositeOperation=op;return}
 const fn=BLP[mode];if(!fn){ctx.drawImage(src,0,0,W,H);return}
 const T=gbCv(72,w,h),tg=T.getContext('2d');tg.setTransform(1,0,0,1,0,0);tg.filter='none';tg.globalAlpha=1;tg.globalCompositeOperation='source-over';tg.clearRect(0,0,w,h);tg.drawImage(src,0,0,w,h);
 const S=tg.getImageData(0,0,w,h),B=ctx.getImageData(0,0,w,h),sd=S.data,bd=B.data,ga=ctx.globalAlpha;
 for(let i=0;i<sd.length;i+=4){const a=sd[i+3];if(!a)continue;const al=a/255*ga,ba=bd[i+3]/255;
  if(ba<=0){bd[i]=sd[i];bd[i+1]=sd[i+1];bd[i+2]=sd[i+2];bd[i+3]=Math.round(al*255);continue}
  for(let c=0;c<3;c++){const b=bd[i+c]/255,r=fn(b,sd[i+c]/255);bd[i+c]=Math.round((b+(r-b)*al)*255)}
  bd[i+3]=Math.round(255*(ba+al*(1-ba)))}
 ctx.putImageData(B,0,0)}
const BLUI=L=>`<div class=r><label>Blend</label><select data-s=bl>${BLM.map(([g,it])=>g=='Normal'?it.map(([k,n])=>`<option value=${k} ${!L.bl||L.bl=='normal'?'selected':''}>${n}`).join(''):`<optgroup label="${g}">${it.map(([k,n])=>`<option value=${k} ${L.bl==k?'selected':''}>${n}`).join('')}</optgroup>`).join('')}</select></div>`;

/* ---- grouping + dragging layers into groups ---- */
function groupLayer(){const L=cur();if(!L||L.type=='cam'||L.type=='fx')return;const G=mk('group');G.name=LN(L)+' group';G.par=L.par||null;L.par=G.id;const a=P.layers;a.splice(a.indexOf(G),1);a.splice(a.indexOf(L),0,G);sel=G.id;ks=[];all();try{commit()}catch(e){}}
function ungroup(){const G=cur();if(!G||G.type!='group')return;P.layers.forEach(c=>{if(c.par==G.id)c.par=G.par||null});P.layers.splice(P.layers.indexOf(G),1);sel=null;ks=[];all();try{commit()}catch(e){}}
let DROP=null;
function clearDrop(){DROP=null;document.body.classList.remove('rdrag');document.querySelectorAll('#tlin .row[class*=dz-]').forEach(r=>r.className=r.className.replace(/\s*dz-\w+/g,''))}
function dropHint(e){
 document.body.classList.add('rdrag');const A=$('#tlin'),el=document.elementFromPoint(e.clientX,e.clientY),row=el&&el.closest('#tlin .row[data-id]');
 A.querySelectorAll('.row[class*=dz-]').forEach(r=>r.className=r.className.replace(/\s*dz-\w+/g,''));
 if(!row){const b=A.getBoundingClientRect();DROP=e.clientY>b.top&&e.clientY<b.bottom&&e.clientX>b.left&&e.clientX<b.right?{root:true}:null;return}
 const id=+row.dataset.id;if(id==rd){DROP=null;return}
 const R=P.layers.find(l=>l.id==id),L=P.layers.find(l=>l.id==rd);if(!R||!L||desc(L).has(R.id)){DROP=null;return}
 const rb=row.getBoundingClientRect(),y=(e.clientY-rb.top)/rb.height;let zone=R.type=='group'?(y<.28?'before':y>.72?'after':'into'):(y<.5?'before':'after');
 DROP={id,zone};row.classList.add('dz-'+zone)}
function moveInto(L,hit){const a=P.layers;a.splice(a.indexOf(L),1);
 if(hit.root){L.par=null;a.push(L)}
 else{const R=a.find(l=>l.id==hit.id);if(hit.zone=='into'&&R.type=='group'){L.par=R.id;R.col=false;const kids=a.filter(x=>x.par==R.id);a.splice(kids.length?a.indexOf(kids[kids.length-1])+1:a.indexOf(R)+1,0,L)}else{L.par=R.par||null;const j=a.indexOf(R);a.splice(hit.zone=='after'?j+1:j,0,L)}}
 sel=L.id}
$('#grp').onclick=groupLayer;

