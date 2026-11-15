// F toggles fullscreen on the preview (Shift+F in the 3D view). Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext()).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const fs=()=>pg.evaluate(()=>document.fullscreenElement&&document.fullscreenElement.id);
await pg.keyboard.press('f');await pg.waitForTimeout(400);ok('F makes the preview fullscreen ('+await fs()+')',(await fs())=='stage');
await pg.keyboard.press('f');await pg.waitForTimeout(400);ok('F again leaves it',!(await fs()));
await pg.evaluate(()=>{mode='3d'});await pg.keyboard.press('f');await pg.waitForTimeout(300);ok('in the 3D view F does not go fullscreen',!(await fs()));
await pg.keyboard.press('Shift+F');await pg.waitForTimeout(400);ok('Shift+F does',(await fs())=='stage');
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
