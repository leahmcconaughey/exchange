const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
const PREVIEW=process.argv[2]==='preview'; const FPS=30;
(async()=>{
  const csv=fs.readFileSync('sheet.csv','utf8');
  const MFONT=`@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;src:url(data:font/ttf;base64,${fs.readFileSync('/home/claude/exchange/tools/Manrope-VariableFont_wght.ttf').toString('base64')}) format('truetype')}`;
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.route('**/*',r=>{const u=r.request().url(); if(u.includes('docs.google.com/spreadsheets')) return r.fulfill({status:200,contentType:'text/csv',body:csv}); if(u.includes('fonts.googleapis.com/css')) return r.fulfill({status:200,contentType:'text/css',body:MFONT}); if(u.startsWith('file://')||u.startsWith('data:')) return r.continue(); return r.abort();});
  let ff=null, frames=0, sceneName='', shotN=0;
  const OVER=`(()=>{ if(document.getElementById('vx-cap')) return;
    const st=document.createElement('style'); st.textContent=\`html{scroll-behavior:auto!important}
    #vx-cur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:99999;pointer-events:none;transform:translate(-3px,-2px)}
    #vx-ring{position:fixed;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:rgba(242,167,102,.55);z-index:99998;pointer-events:none;opacity:0}
    #vx-cap{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:99997;background:#fff;color:#05415B;border:2px solid #F2A766;font-family:Manrope,sans-serif;font-weight:700;font-size:23px;line-height:1.35;padding:14px 26px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center;max-width:980px;opacity:0;pointer-events:none}
    #vx-cap b{color:#038FDD;font-weight:800}\`; document.head.appendChild(st);
    const c=document.createElement('div'); c.id='vx-cur'; c.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.6L4 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const r=document.createElement('div'); r.id='vx-ring'; const cap=document.createElement('div'); cap.id='vx-cap';
    document.body.append(r,c,cap); })()`;
  let cur={x:640,y:400}, capText='', capOp=0, ring=0, curShow=true;
  async function sync(){ await p.evaluate(([o,x,y,t,op,rg,cs])=>{ eval(o); const c=document.getElementById('vx-cur'); c.style.left=x+'px'; c.style.top=y+'px'; c.style.display=cs?'block':'none';
      const r=document.getElementById('vx-ring'); r.style.left=x+'px'; r.style.top=y+'px'; r.style.opacity=rg; r.style.transform='scale('+(0.6+0.8*(1-rg))+')';
      const cap=document.getElementById('vx-cap'); if(cap.innerHTML!==t) cap.innerHTML=t; cap.style.opacity=op; cap.style.display=t?'block':'none'; },[OVER,cur.x,cur.y,capText,capOp,ring,curShow]); }
  async function shot(n=1){ await sync(); const buf=await p.screenshot({type:'jpeg',quality:92}); if(PREVIEW){ fs.writeFileSync(`pv-${sceneName}-${String(shotN++).padStart(2,'0')}.jpg`,buf); frames+=n; return; } for(let i=0;i<n;i++) ff.stdin.write(buf); frames+=n; }
  function begin(name){ sceneName=name; frames=0; shotN=0; if(PREVIEW) return;
    ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf','scale=1920:1080,format=yuv420p','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r',String(FPS),`tmp-${name}.mp4`]); ff.stdin.on('error',()=>{}); }
  async function end(){ if(PREVIEW) { console.log(sceneName, (frames/FPS).toFixed(1)+'s'); return frames; } await new Promise(res=>{ff.on('close',c=>{ if(c===0) fs.renameSync(`tmp-${sceneName}.mp4`,`scene-${sceneName}.mp4`); console.log(sceneName,(frames/FPS).toFixed(1)+'s', c); res();}); ff.stdin.end();}); }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const hold=async s=>{ const n=Math.round(s*FPS); if(PREVIEW){ await shot(n); return; } await shot(n); };
  async function caption(t){ if(capText&&capOp>0){ for(let i=1;i<=6;i++){capOp=1-i/6; await shot(1);} } capText=t; for(let i=1;i<=8;i++){capOp=i/8; if(PREVIEW&&i<8){frames++;continue;} await shot(1);} }
  async function move(sel,dur=0.8,dx=0,dy=0){ const bx=await p.locator(sel).first().boundingBox(); const tx=bx.x+bx.width/2+dx, ty=bx.y+bx.height/2+dy; const sx=cur.x, sy=cur.y; const n=Math.round(dur*FPS);
    for(let i=1;i<=n;i++){ const k=ease(i/n); cur={x:sx+(tx-sx)*k,y:sy+(ty-sy)*k}; if(PREVIEW&&i<n){frames++;continue;} await shot(1);} }
  async function click(sel,after=0.5){ for(let i=0;i<4;i++){ ring=1-i/4*0.3; if(PREVIEW&&i<3){frames++;continue;} await shot(1);} ring=0; await p.locator(sel).first().click(); await p.waitForTimeout(after*1000); }
  async function scrollTo(y,dur=1.2){ const s=await p.evaluate(()=>scrollY); const n=Math.round(dur*FPS); for(let i=1;i<=n;i++){ const v=s+(y-s)*ease(i/n); await p.evaluate(v=>scrollTo(0,v),v); if(PREVIEW&&i<n){frames++;continue;} await shot(1);} }
  async function type(sel,text,cps=14){ await p.locator(sel).first().click(); for(const ch of text){ await p.keyboard.type(ch); const n=Math.round(FPS/cps); if(PREVIEW){frames+=n;continue;} await shot(n);} if(PREVIEW) await shot(1); }
  const base='file:///home/claude/exchange/index.html';
  const logo='data:image/svg+xml;base64,'+fs.readFileSync('/home/claude/exchange/logo.svg').toString('base64');
  async function card(title,sub,url,s){ curShow=false; capText=''; await p.setContent(`<html><head><style>${MFONT}</style></head><body style="margin:0;height:100vh;display:grid;place-items:center;background:#FCF2E8;font-family:Manrope,sans-serif;color:#05415B">
    <div style="text-align:center"><img src="${logo}" style="height:52px;display:inline-block;margin-bottom:40px">
    <div style="font-size:56px;font-weight:800;line-height:1.1;letter-spacing:-.01em">${title}</div><div style="width:90px;height:6px;border-radius:3px;background:#F2A766;margin:24px auto 0"></div><div style="font-size:25px;margin-top:22px;color:#05415B;font-weight:500">${sub}</div>${url?`<div style="margin-top:36px;font-size:23px;font-weight:800;background:#F2A766;color:#05415B;display:inline-block;padding:13px 28px;border-radius:12px">${url}</div>`:''}</div></body></html>`); await p.waitForTimeout(400);
    const n=Math.round(s*FPS); for(let i=1;i<=12;i++){ await p.evaluate(o=>document.body.firstElementChild.style.opacity=o,i/12); if(PREVIEW&&i<12){frames++;continue;} await shot(1);} await shot(n-12); }

  // 1 intro
  begin('01-intro'); await card('Introducing the LearningWorks Exchange','Real stories and practical resources from classrooms like yours','',4.5); await end();

  // 2 home
  begin('02-home'); await p.goto(base+'#stories'); await p.waitForTimeout(1500); curShow=true; cur={x:900,y:300};
  await shot(10); await caption('Find support. See it in practice. All in <b>one place</b>.'); await hold(2.4);
  await scrollTo(260,1.4); await hold(2.2); await end();

  // 3 search
  begin('03-search'); await caption('<b>Search</b> in your own words'); await move('#q',0.8,-250,0); await type('#q','meaning making in science'); await p.waitForTimeout(500); await hold(1.2);
  await scrollTo(420,1.0); await hold(3.0); await end();

  // 4 filters
  begin('04-filter'); await scrollTo(260,0.8); await caption('<b>Filter</b> by grade, subject, focus, and district');
  await move('details.multi summary',0.8); await click('details.multi summary',0.4); await shot(10);
  await move('button.band[data-band="High School"]',0.6); await click('button.band[data-band="High School"]',0.4); await shot(14);
  await move('.multi-done',0.5); await click('.multi-done',0.5); await shot(8);
  await scrollTo(420,0.9); await hold(3.0); await end();

  // 5 story
  begin('05-story'); await caption('Every <b>story</b> shows a real shift in a real classroom');
  await move('a.card[data-story="concept-before-content"]',0.8,0,-40); await click('a.card[data-story="concept-before-content"]',1.2); await p.evaluate(()=>scrollTo(0,0)); await shot(1); await hold(3.2);
  const ny=await p.evaluate(()=>{const e=document.querySelector('.trio'); return e? e.getBoundingClientRect().top+scrollY-20:600;});
  await caption('Then <b>learn it in three steps</b>: the story, the overview, and a group experience'); await scrollTo(ny,1.6); await hold(0.8);
  const steps=await p.$$('.trio-step'); for(const [i,st] of steps.entries()){ const bx=await st.boundingBox(); const sx=cur.x,sy=cur.y,tx=bx.x+bx.width/2,ty=bx.y+130; for(let k=1;k<=24;k++){const e=ease(k/24); cur={x:sx+(tx-sx)*e,y:sy+(ty-sy)*e}; if(PREVIEW&&k<24){frames++;continue;} await shot(1);} await hold(1.3); }
  await caption('On your own? Start with the story or the overview. Save the card sort <b>for your group</b>.'); await hold(3.0); await end();

  // 6 resources
  begin('06-resources'); await p.goto(base+'#resources'); await p.evaluate(()=>{localStorage.clear?.();}); await p.reload(); await p.waitForTimeout(1500); await p.evaluate(()=>scrollTo(0,0)); cur={x:640,y:420};
  await shot(4); await caption('<b>Resources</b>: tutorials, guides, and tools you can use right away');
  await scrollTo(250,1.2); await move('.tabbar a[href="#resources"], a.tab[href="#resources"]',0.6); await hold(0.6);
  const nx='.row .arrows button:last-child, button[aria-label*="Next"], .row button.next, .scroll-btn.next';
  try{ await move(nx,0.8); await click(nx,0.9); await shot(8); await click(nx,0.9); await shot(8);}catch(e){console.log('no arrow',e.message.slice(0,80));}
  await hold(2.2); await end();

  // 7 collections
  begin('07-collections'); const cy=await p.evaluate(()=>{const h=[...document.querySelectorAll('h2')].find(e=>/Curated Collections/.test(e.textContent)); return h.getBoundingClientRect().top+scrollY-120;});
  await caption('Not sure where to start? Try a <b>curated collection</b>'); await scrollTo(cy,1.3); await hold(1.0);
  await move('a.coll, [data-coll="new-to-this-work"]',0.8); await click('[data-coll="new-to-this-work"]',1.2); await p.evaluate(()=>scrollTo(0,0)); await shot(1); await hold(2.0); await scrollTo(380,1.4); await hold(2.4); await end();

  // 8 ask
  begin('08-ask'); await p.evaluate(()=>scrollTo(0,0)); await shot(4); await caption('Have a question or need a resource? <b>Just ask.</b>');
  await move('#askBtn',0.9); await click('#askBtn',0.6); await shot(10); await move('.ask-opt',0.8); await hold(3.6); await end();

  // 9 outro
  begin('09-outro'); await card('Explore the Exchange','Find support. See it in practice.','exchange.learning-works.org',5); await end();
  await b.close();
})();
