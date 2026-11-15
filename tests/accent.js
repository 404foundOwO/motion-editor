// Accent colour: the palette button, presets and custom colour change --a everywhere (CSS and canvas handles), survive a reload, Reset restores the default. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path');
(async()=>{const br=await chromium.launch(),ctx=await br.newContext({viewport:{width:1300,height:900}}),pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
const url='file://'+path.resolve(__dirname,'../index.html');await pg.goto(url);await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
const css=()=>pg.evaluate(()=>({a:getComputedStyle(document.documentElement).getPropertyValue('--a').trim(),on:getComputedStyle(document.documentElement).getPropertyValue('--on').trim(),btn:getComputedStyle(document.querySelector('#exv')).backgroundColor,acc:ACCV}));
ok('default accent is the purple',(await css()).a=='#8b7bff'||(await css()).a=='');
await pg.click('#thm');ok('the palette button opens the picker',await pg.evaluate(()=>!!document.querySelector('#accp')));
await pg.click('#accp [data-acc="#3ecf8e"]');await pg.waitForTimeout(400);let c=await css();ok('a preset changes the accent ('+JSON.stringify(c)+')',c.a=='#3ecf8e'&&c.acc=='#3ecf8e'&&c.btn=='rgb(62, 207, 142)');
await pg.click('#accp [data-acc="#ffd166"]');c=await css();ok('light accents get dark text ('+c.on+')',c.on=='#16161a');
await pg.evaluate(()=>{const i=document.querySelector('#accc');i.value='#ff0000';i.dispatchEvent(new Event('input',{bubbles:true}))});c=await css();ok('the custom colour works ('+c.a+')',c.a=='#ff0000'&&c.on=='#fff');
await pg.reload();await pg.waitForTimeout(1500);c=await css();ok('it is remembered after a reload ('+c.a+', '+c.btn+')',c.a=='#ff0000'&&c.btn=='rgb(255, 0, 0)');
await pg.click('#thm');await pg.click('#accr');c=await css();ok('Reset restores the default and forgets it ('+c.a+')',c.a=='#8b7bff'&&(await pg.evaluate(()=>localStorage.getItem('meAcc')))===null);
await pg.keyboard.press('Escape');ok('Esc closes the picker',await pg.evaluate(()=>!document.querySelector('#accp')));
const css0=require('fs').readFileSync(path.resolve(__dirname,'../css/app.css'),'utf8');ok('no CSS value glues hex digits onto var(--a) (that silently drops the rule)',!/var\(--a2?\)[0-9a-fA-F]{2}(?![0-9a-zA-Z-])/.test(css0));
await pg.evaluate(()=>{P.layers.length=0;mk('rect');sel=P.layers[0].id;all()});await pg.waitForTimeout(300);ok('the selected row is tinted and clip bars have a fill',await pg.evaluate(()=>{const r=document.querySelector('#tlin .row.on'),b=document.querySelector('#tlin .row .bar');return !!r&&getComputedStyle(r).backgroundColor!='rgba(0, 0, 0, 0)'&&!!b&&getComputedStyle(b).backgroundColor!='rgba(0, 0, 0, 0)'}));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
