// Fill on/off: with fill off only the outline (Stroke effect) is drawn. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const px=async()=>{await pg.evaluate(()=>{dirty=1});await pg.waitForTimeout(400);return pg.evaluate(()=>{const c=cv.getContext('2d'),g=(x,y)=>[...c.getImageData(Math.round(x),Math.round(y),1,1).data].join();const cx0=cv.width/2,cy0=cv.height/2;return{mid:g(cx0,cy0),edge:g(cx0+ (P.layers.find(l=>l.type=='rect').p.w/2)*cv.width/W,cy0)}})};
await pg.evaluate(()=>{P.layers.length=0;P.dur=5;const L=mk('rect');L.p.w=400;L.p.h=300;L.p.c1='#ff0000';L.col='#ff0000';sel=L.id;t=1;all()});
const a=await px();ok('fill on: centre is red ('+a.mid+')',a.mid.startsWith('255,0,0'));
await pg.evaluate(()=>{const L=P.layers[0];L.nofill=1;all()});const b=await px();ok('fill off: centre is no longer red ('+b.mid+')',!b.mid.startsWith('255,0,0'));
ok('the Color tab has the toggle',await pg.evaluate(()=>{tab='Color';side();return !!document.querySelector('#side [data-s=fillon]')}));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
