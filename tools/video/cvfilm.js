const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
const WHICH=process.argv[2], PREVIEW=process.argv[3]==='preview'; const FPS=30; const D=__dirname;
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
  await p.goto('file://'+D+'/app.html'); await p.evaluate(()=>document.fonts.ready);
  let ff=null, frames=0, scene='', n=0;
  const st={cx:640,cy:400,cap:'',op:0,ring:0,curShow:false};
  async function sync(){ await p.evaluate(s=>{ const c=document.getElementById('cur'); c.style.left=s.cx+'px'; c.style.top=s.cy+'px'; c.style.display=s.curShow?'block':'none';
    const r=document.getElementById('ring'); r.style.left=s.cx+'px'; r.style.top=s.cy+'px'; r.style.opacity=s.ring; r.style.transform='scale('+(0.6+0.8*(1-s.ring))+')';
    const cap=document.getElementById('cap'); if(cap.innerHTML!==s.cap) cap.innerHTML=s.cap; cap.style.opacity=s.op; cap.style.display=s.cap?'block':'none'; },st); }
  async function shot(k=1){ await sync(); const buf=await p.screenshot({type:'jpeg',quality:92}); if(PREVIEW){ fs.writeFileSync(`${D}/pv/${WHICH}-${scene}-${String(n++).padStart(2,'0')}.jpg`,buf); frames+=k; return;} for(let i=0;i<k;i++) ff.stdin.write(buf); frames+=k; }
  const skip=(i,N)=>PREVIEW&&i<N; 
  function begin(name){ scene=name; frames=0; n=0; if(PREVIEW) return; ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf','scale=1920:1080,format=yuv420p','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r',String(FPS),`${D}/out/tmp-${WHICH}-${name}.mp4`]); ff.stdin.on('error',()=>{}); }
  async function end(){ if(PREVIEW){ console.log(scene,(frames/FPS).toFixed(1)); return;} await new Promise(res=>{ff.on('close',c=>{ if(c===0) fs.renameSync(`${D}/out/tmp-${WHICH}-${scene}.mp4`,`${D}/out/${WHICH}-${scene}.mp4`); console.log(scene,(frames/FPS).toFixed(1),c); res();}); ff.stdin.end();}); }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const hold=s=>shot(Math.round(s*FPS));
  async function caption(t){ if(st.cap&&st.op>0){ for(let i=1;i<=6;i++){st.op=1-i/6; if(skip(i,6)){frames++;continue;} await shot();} } st.cap=t; if(!t){st.op=0;return;} for(let i=1;i<=8;i++){st.op=i/8; if(skip(i,8)){frames++;continue;} await shot();} }
  async function moveTo(x,y,dur=0.8){ const sx=st.cx,sy=st.cy,N=Math.round(dur*FPS); for(let i=1;i<=N;i++){const k=ease(i/N); st.cx=sx+(x-sx)*k; st.cy=sy+(y-sy)*k; if(skip(i,N)){frames++;continue;} await shot();} }
  async function moveSel(sel,dur=0.8,dx=0,dy=0){ const bx=await p.locator(sel).first().boundingBox(); await moveTo(bx.x+bx.width/2+dx,bx.y+bx.height/2+dy,dur); }
  async function tap(){ for(let i=0;i<4;i++){ st.ring=1-i*0.1; if(skip(i,3)){frames++;continue;} await shot(); } st.ring=0; }
  // screens
  async function html(id,markup){ await p.evaluate(([id,m])=>{ const s=document.getElementById('stage'); let e=document.getElementById(id); if(!e){ e=document.createElement('div'); e.id=id; e.className='screen'; s.appendChild(e);} e.innerHTML=m; },[id,markup]); }
  async function img(id,src){ await p.evaluate(([id,src])=>new Promise(r=>{ const s=document.getElementById('stage'); let e=document.getElementById(id); if(!e){ e=document.createElement('img'); e.id=id; e.className='screen'; s.appendChild(e);} e.onload=r; e.src=src; if(e.complete&&e.naturalWidth) r(); }),[id,'file://'+D+'/'+src]); }
  let cam={}; // id -> {x,y,s}
  async function setCam(id,x,y,s){ cam[id]={x,y,s}; await p.evaluate(([id,x,y,s])=>{document.getElementById(id).style.transform=`translate(${-x*s}px,${-y*s}px) scale(${s})`;},[id,x,y,s]); }
  async function show(id,fade=0.4){ const N=Math.round(fade*FPS); await p.evaluate(id=>{ const e=document.getElementById(id); e.style.zIndex=++window.__z||(window.__z=1); e.style.opacity=0; e.classList.add('on'); },id);
    for(let i=1;i<=N;i++){ await p.evaluate(([id,o])=>{document.getElementById(id).style.opacity=o;},[id,i/N]); if(skip(i,N)){frames++;continue;} await shot(); }
    await p.evaluate(id=>{ document.querySelectorAll('.screen').forEach(e=>{ if(e.id!==id){e.classList.remove('on'); e.style.opacity=0;} }); document.getElementById(id).style.opacity=1; },id); }
  async function pan(id,x,y,s,dur){ const a=cam[id],N=Math.round(dur*FPS); for(let i=1;i<=N;i++){const k=ease(i/N); await setCam(id,a.x+(x-a.x)*k,a.y+(y-a.y)*k,a.s+(s-a.s)*k); if(skip(i,N)){frames++;continue;} await shot();} cam[id]={x,y,s}; }
  const toScreen=(id,ix,iy)=>{const c=cam[id]; return [(ix-c.x)*c.s,46+(iy-c.y)*c.s];};
  async function typeInto(sel,text,cps=22){ for(let i=1;i<=text.length;i++){ await p.evaluate(([sel,t])=>{const e=document.querySelector(sel); e.classList.add('typed'); e.innerHTML=t.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'<span class="caret"></span>';},[sel,text.slice(0,i)]); const k=Math.max(1,Math.round(FPS/cps)); if(PREVIEW&&i<text.length){frames+=k;continue;} await shot(k);} await p.evaluate(sel=>{const c=document.querySelector(sel+' .caret'); if(c) c.remove();},sel); }
  async function card(title,sub,extra,s){ st.curShow=false; await caption(''); await p.evaluate(([t,su,ex])=>{ const c=document.getElementById('card'); c.style.display='grid'; c.style.opacity=0;
      document.getElementById('cardlogos').innerHTML=`<img src="${location.href.replace(/app\.html.*/,'cvlogo.png')}" style="height:120px;mix-blend-mode:multiply">`;
      document.getElementById('ct').textContent=t; document.getElementById('cs').innerHTML=su; document.getElementById('cu').innerHTML=ex; },[title,sub,extra]);
    for(let i=1;i<=12;i++){ await p.evaluate(o=>document.getElementById('card').style.opacity=o,i/12); if(skip(i,12)){frames++;continue;} await shot(); } await hold(s-0.4);
  }
  async function cardOff(){ await p.evaluate(()=>{document.getElementById('card').style.display='none';}); }
  const TABS=a=>`<div class="tabs"><div class="t"><span class="${a==='pc'?'a':''}">Pre-Check</span><span class="${a==='rec'?'a':''}">Record</span><span>Reports</span></div></div>`;
  if(!fs.existsSync(D+'/pv')) fs.mkdirSync(D+'/pv'); if(!fs.existsSync(D+'/out')) fs.mkdirSync(D+'/out');

  if(WHICH==='precheck'){
    begin('01'); await card('How to use Pre-Check','Get feedback on your lesson <b>before</b> you teach it','',4.2); await end();
    begin('02'); await html('login',`<div class="center"><div class="login"><img src="${'file://'+D+'/cvlogo.png'}"><p>Sign in to get started</p><span class="gbtn" id="gbtn"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1C42.6 36.8 45 31.2 45 24.5z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.2 15.5 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3V14H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z"/><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.8 4.5 14l7.3 5.7c1.7-5.2 6.5-8.9 12.2-8.9z"/></svg>Sign in with your school Google account</span></div></div>`);
      await cardOff(); await show('login',0.3); st.curShow=true; st.cx=900; st.cy=560; await hold(0.4);
      await caption('Go to <b>classvoice.net</b> and sign in with your school Google account'); await moveSel('#gbtn',1.0); await tap(); await hold(0.8); await end();
    begin('03'); await html('app',`<div class="app">${TABS('pc')}<div class="head"><div><h2>Lesson Pre-Check</h2><p>Upload lesson materials to get design feedback before you teach</p></div><div style="display:flex;gap:8px"><span class="btn">☰ New sequence</span><span class="btn blue" id="newcheck">+ New check</span></div></div><div id="formwrap"><div class="empty">Your Pre-Checks will appear here.</div></div></div>`);
      await show('app',0.35); await hold(0.5); await caption('Open the <b>Pre-Check</b> tab and click <b>New check</b>'); await moveSel('#newcheck',0.9); await tap();
      await p.evaluate(()=>{document.getElementById('formwrap').innerHTML=`<div class="card"><h3>New Lesson Pre-Check <span style="color:#9CA3AF">✕</span></h3><label>Lesson title</label><div class="in" id="f1">e.g. Grade 5 Fractions — Comparing Numerators</div><label>Lesson overview <span style="font-weight:400;color:#6B7280">(optional)</span></label><div class="in area" id="f2">Briefly describe what you intend this lesson to do — the learning goal, where it sits in the unit, or anything that gives context for the materials you are uploading...</div><label>Materials</label><div class="seg"><span class="a">Upload files</span><span>Paste text</span></div><div class="drop" id="drop"><span class="btn" id="choose">Choose Files</span><span id="nf">no files selected</span></div><div class="hint">PDF, Word, PowerPoint, images — up to 200MB each. You can add multiple files (lesson plan + slide deck + worksheet).</div><span class="btn blue analyze" id="analyze">📊 Analyze Lesson Design</span></div>`;});
      await hold(1.0); await end();
    begin('04'); await caption('Share your lesson. <b>The more you give, the better the feedback.</b>'); await moveSel('#f1',0.7,-200,0); await tap();
      await typeInto('#f1','Grade 4 ELA: Why Is the Ocean Important?'); await moveSel('#f2',0.5,-200,0); await tap();
      await typeInto('#f2','Students revisit two unit texts in a gallery walk, discuss why the ocean is important in a Socratic seminar, and plan two paragraphs.',40);
      await moveSel('#choose',0.6); await tap(); await p.evaluate(()=>{document.getElementById('drop').innerHTML='<span class="file">📄 Ocean-Lesson-Plan.pdf</span><span class="file">📄 Seminar-Slides.pptx</span><span class="file">📄 Writing-Planner.docx</span>';}); await hold(1.3); await end();
    begin('05'); await caption('Click <b>Analyze Lesson Design</b>'); await moveSel('#analyze',0.7); await tap();
      await html('anal',`<div class="center" style="width:1280px"><div class="anal"><div class="spin" id="spin"></div>Analyzing your lesson design...</div></div>`); await show('anal',0.25);
      for(let i=0;i<54;i++){ await p.evaluate(a=>document.getElementById('spin').style.transform=`rotate(${a}deg)`,i*14); if(skip(i,53)){frames++;continue;} await shot(); } await end();
    begin('06'); await img('rep','pcreport.jpg'); await p.evaluate(()=>{ const r=document.getElementById('rep'); const w=document.createElement('div'); w.id='repwrap'; w.className='screen'; r.parentNode.insertBefore(w,r); w.appendChild(r); r.className=''; r.style.display='block'; w.insertAdjacentHTML('beforeend',`<div class="rhead"><div><h2>Grade 4 ELA: Why Is the Ocean Important?</h2><small>Pre-Check report · just now</small></div><span class="askb" id="askb">💬 Ask Leah</span></div>`); });
      const S=1280/1882; await setCam('repwrap',0,0,S); await show('repwrap',0.4); st.cx=1000; st.cy=500;
      await caption('<b>Lesson summary</b>: what Pre-Check thinks the task is'); await hold(3.2);
      await caption('<b>AMT prediction</b>: how strongly the lesson shows Acquisition, Meaning Making, and Transfer'); await pan('repwrap',0,520,S,1.6); await hold(3.2);
      await caption('<b>Engagement Blueprint</b>: each element rated Present, Partial, or Absent'); await pan('repwrap',0,1770,S,1.8); await hold(1.6); await pan('repwrap',0,2720,S,2.6); await hold(1.2);
      await caption('<b>Actionable suggestion</b>: the smallest change with the biggest impact'); await pan('repwrap',0,3660,S,1.8); await hold(3.6); await end();
    begin('07'); await caption('Have a follow-up question? Click <b>Ask Leah</b>'); await pan('repwrap',0,0,S,1.4); await moveSel('#askb',0.8); await tap();
      for(let i=1;i<=12;i++){ await p.evaluate(k=>document.getElementById('askpanel').style.transform=`translateX(${440*(1-k)}px)`,ease(i/12)); if(skip(i,12)){frames++;continue;} await shot(); }
      await moveSel('#askq',0.6,-100,0); await tap(); await typeInto('#askq','Which change would help my students do more of the thinking?',26); await hold(2.0); await end();
    begin('08'); await card('Try Pre-Check today','Run one of your own lessons through Pre-Check','<div class="url">classvoice.net</div><div class="sm">Questions? info@learning-works.org</div>',5); await end();
  }

  if(WHICH==='record'){
    begin('01'); await card('How to use Record','Hear what your classroom conversation <b>really</b> sounds like','',4.2); await end();
    begin('02'); await html('app',`<div class="app">${TABS('rec')}<div style="text-align:center;margin-top:24px"><h2 style="margin:0;font-size:26px">Record or Upload</h2><p style="color:#6B7280;margin:8px 0 0;font-size:15px">Record a live class session or upload a pre-recorded audio or video file for analysis</p></div>
      <div id="recarea"><div class="rec2"><div class="rc"><div class="ic">●</div><b>Record in ClassVoice</b><p>Open Record, press start, and teach. The analysis begins when you stop.</p><span class="startb" id="start">● Start recording</span></div><div class="rc"><div class="ic">⇪</div><b>Upload an audio file</b><p>Record on a phone or other device, then upload the audio file.</p><span class="btn" style="margin-top:16px">Choose file</span></div></div>
      <div class="note"><span>⏱ Either way, 60 minutes is the maximum.</span><span>🔒 Your recording is private. No one else has access to it.</span></div></div></div>`);
      await cardOff(); await show('app',0.35); st.curShow=true; st.cx=900; st.cy=560; await hold(0.4);
      await caption('Open the <b>Record</b> tab. Record live, or <b>upload</b> an audio file.'); await hold(1.6); await moveSel('#start',1.0); await tap();
      await p.evaluate(()=>{document.getElementById('recarea').innerHTML=`<div class="recbox"><span class="rdot" id="rdot"></span><span class="timer" id="tm">00:00</span><div class="wave" id="wv">${Array.from({length:48},()=>'<i></i>').join('')}</div><span class="stopb" id="stop">■ Stop</span></div><div class="note"><span>Teach as usual. ClassVoice is listening.</span></div>`;});
      await caption('Press start and <b>teach as usual</b>. Up to 60 minutes.');
      for(let i=0;i<90;i++){ const sec=Math.floor(i/90*1922); await p.evaluate(([t,i])=>{ document.getElementById('tm').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'); document.querySelectorAll('#wv i').forEach((e,j)=>e.style.height=(12+44*Math.abs(Math.sin(j*0.7+i*0.45)*Math.sin(j*0.23+i*0.17)))+'px'); document.getElementById('rdot').style.opacity=(i%30<18)?1:.3; },[sec,i]); if(PREVIEW&&i%30){frames++;continue;} await shot(); }
      await caption('Click <b>Stop</b> when you are done'); await moveSel('#stop',0.7); await tap();
      await html('anal',`<div class="center" style="width:1280px"><div class="anal"><div class="spin" id="spin"></div>Transcribing and analyzing your lesson...</div></div>`); await show('anal',0.25);
      for(let i=0;i<45;i++){ await p.evaluate(a=>document.getElementById('spin').style.transform=`rotate(${a}deg)`,i*14); if(skip(i,44)){frames++;continue;} await shot(); } await end();
    // report screens
    begin('03'); await img('ov','img/rc-006-013.png'); const s1=1280/2996; await setCam('ov',0,0,s1); await show('ov',0.4); st.cx=900; st.cy=420;
      await caption('<b>Overview</b>: see who carried the talk'); await moveTo(...toScreen('ov',1350,520),1.0); await hold(1.0); await moveTo(...toScreen('ov',2100,520),0.8); await hold(1.6);
      await moveTo(...toScreen('ov',180,539),1.0); await tap(); await end();
    begin('04'); await img('dom','domains.jpg'); const s2=1280/2978; await setCam('dom',0,0,s2); await show('dom',0.3);
      await caption('<b>Domains</b>: link your Pre-Check, then read your Quality Dialogue Index'); await hold(1.8);
      await caption('<b>One score, five domains</b>'); await pan('dom',0,900,s2,1.6); await hold(2.2);
      await caption('<b>Learning dynamics</b>: the patterns underneath'); await pan('dom',0,2060,s2,1.6); await hold(2.2);
      await caption('<b>Evidence and a suggested next move</b>'); await pan('dom',0,3740-674/s2,s2,1.6); await hold(2.4); await end();
    begin('05'); await img('qa','img/rc-011-028.png'); const s3=1280/2974; await setCam('qa',0,0,s3); await pan('dom',0,0,s2,1.0); await moveTo(...toScreen('dom',180,650),0.7); await tap(); await show('qa',0.3);
      await caption('<b>Questions Asked</b>: every question, sorted by AMT level'); await moveTo(...toScreen('qa',1100,700),0.9); await hold(1.2); await moveTo(...toScreen('qa',1090,1400),0.8); await hold(1.6);
      await moveTo(...toScreen('qa',180,770),0.9); await tap(); await end();
    begin('06'); await img('hk','img/rc-012-031.png'); const s4=1280/2460; await setCam('hk',0,(1488-674/s4)/2,s4); await show('hk',0.35);
      await caption('<b>Harkness view</b>: see who talks to whom'); await moveTo(...toScreen('hk',1230,700),1.0); await hold(1.0); await pan('hk',600,250,s4*1.35,2.0); await hold(1.6); await end();
    begin('07'); await img('tr','img/rc-013-034.png'); const s5=1280/1682; await setCam('tr',0,0,s5); await show('tr',0.35); st.cx=700; st.cy=500;
      await caption('<b>Transcript</b>: read the full dialogue, with every question tagged'); await pan('tr',0,1098-674/s5,s5,2.4); await hold(1.6); await end();
    begin('08'); await caption('<b>Private to you.</b> No one else can see your recordings or reports.'); await hold(2.8); await end();
    begin('09'); await card('Try Record today','Record one lesson and choose one next move','<div class="url">classvoice.net</div><div class="sm">Questions? info@learning-works.org</div>',5); await end();
  }
  await b.close();
})();
