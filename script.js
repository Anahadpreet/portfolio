/* ═══════════════════════════
   HERO CANVAS — SLIDING WINDOW (once, then crossfade into real text)
═══════════════════════════ */
(function(){
  const cv = document.getElementById('hero-canvas');
  const ctx = cv.getContext('2d');
  const heroContent = document.getElementById('hero-content');
  const dsaHint = document.getElementById('dsa-hint');

  function resize(){
    cv.width = cv.offsetWidth || window.innerWidth;
    cv.height = cv.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NAME = 'ANAHADPREET KAUR';
  const WIN = 4;
  let posF = 0;
  let maxRevealed = WIN - 1;
  // phase: reveal → pause → fadeout → stopped
  let phase = 'reveal';
  let phaseT = 0;
  const SPEED = 0.018; // smooth

  const particles = Array.from({length:40}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1 + 0.3,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    a: Math.random() * 0.15 + 0.03
  }));

  function rr(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  }

  function draw(){
    const W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);

    // grid
    ctx.strokeStyle='rgba(255,255,255,0.018)';
    ctx.lineWidth=1;
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

    // particles
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,200,220,${p.a})`;ctx.fill();
    });

    const N = NAME.length;
    const fontSize = Math.min(70, W / 18);
    const cellW = fontSize * 1.12;
    const cellH = fontSize * 1.45;
    const totalW = N * cellW;
    const ox = (W - totalW) / 2;
    const oy = H * 0.42;

    const winStart = posF;
    const winEnd = posF + WIN;
    const currentMax = Math.floor(winEnd) - 1;
    if(currentMax > maxRevealed) maxRevealed = Math.min(currentMax, N-1);

    const stopped = phase === 'stopped';

    for(let i=0;i<N;i++){
      const ch = NAME[i];
      const isSpace = ch === ' ';
      if(isSpace) continue; // skip drawing space cell

      const x = ox + i * cellW;
      const inWindow = phase === 'reveal' && i >= Math.floor(winStart) && i < Math.ceil(winEnd);
      const overlap = Math.min(i+1, winEnd) - Math.max(i, winStart);
      const ratio = Math.max(0,Math.min(1,overlap));
      const revealed = i <= maxRevealed || phase!=='reveal';

      // bg
      if(phase==='pause' || phase==='fadeout'){
        ctx.fillStyle='rgba(255,255,255,0.04)';
      } else {
        ctx.fillStyle=`rgba(255,255,255,${inWindow?0.08:revealed?0.03:0.015})`;
      }
      ctx.shadowColor='transparent'; ctx.shadowBlur=0;
      if(inWindow){
        ctx.shadowColor='rgba(255,255,255,0.12)';
        ctx.shadowBlur=14;
      }
      rr(ctx,x+3,oy,cellW-6,cellH,8); ctx.fill();
      ctx.shadowBlur=0;

      // border
      if(phase==='pause' || phase==='fadeout'){
        ctx.strokeStyle='rgba(255,255,255,0.1)';
        ctx.lineWidth=0.7;
      } else {
        ctx.strokeStyle=inWindow?`rgba(255,255,255,${0.25+ratio*0.35})`:revealed?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)';
        ctx.lineWidth=inWindow?1.5:0.7;
      }
      rr(ctx,x+3,oy,cellW-6,cellH,8); ctx.stroke();

      // index label
      ctx.fillStyle=`rgba(255,255,255,${revealed?0.25:0.07})`;
      ctx.font=`500 ${Math.round(fontSize*0.17)}px 'Geist Mono',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText(i, x+cellW/2, oy+cellH+fontSize*0.3);

      // letter
      if(revealed){
        ctx.save();
        if(phase==='pause' || phase==='fadeout'){
          ctx.globalAlpha=0.78;
          ctx.fillStyle='#e8e8f0';
          ctx.shadowColor='rgba(232,232,240,0.15)';
          ctx.shadowBlur=8;
        } else {
          ctx.globalAlpha=inWindow?1:0.6;
          ctx.fillStyle='#ffffff';
          ctx.shadowColor=inWindow?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.15)';
          ctx.shadowBlur=inWindow?22:4;
        }
        ctx.font=`700 ${fontSize}px 'Space Grotesk',sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(ch, x+cellW/2, oy+cellH/2);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha=0.05;
        ctx.fillStyle='#fff';
        ctx.font=`700 ${fontSize}px 'Space Grotesk',sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(ch, x+cellW/2, oy+cellH/2);
        ctx.restore();
      }
    }

    // sliding window border
    if(phase==='reveal'){
      const wx = ox + posF * cellW;
      const ww = WIN * cellW;
      ctx.strokeStyle='rgba(255,255,255,0.5)';
      ctx.lineWidth=1.5;
      ctx.shadowColor='rgba(255,255,255,0.25)';
      ctx.shadowBlur=16;
      rr(ctx,wx+3,oy-5,ww-6,cellH+10,12); ctx.stroke();
      ctx.shadowBlur=0;

      // label above window
      const labelX = wx + ww/2;
      const startI = Math.floor(posF);
      ctx.fillStyle='rgba(255,255,255,0.4)';
      ctx.font=`600 ${Math.round(fontSize*0.18)}px 'Geist Mono',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText(`size=4   start=${startI}`, labelX, oy - fontSize*0.25);
    }

    // status bar
    if(phase==='reveal' || phase==='pause'){
      ctx.fillStyle='rgba(255,255,255,0.22)';
      ctx.font=`500 ${Math.round(fontSize*0.15)}px 'Geist Mono',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      const statusY = oy + cellH + fontSize * 0.72;
      if(phase==='reveal') ctx.fillText(`sliding window  ·  size=${WIN}  ·  start=${Math.floor(posF)}`, W/2, statusY);
      else if(phase==='pause') ctx.fillText(`fully revealed  ✓`, W/2, statusY);
    }

    // animate phase transitions
    if(phase==='reveal'){
      posF += SPEED;
      const maxPos = N - WIN;
      if(posF >= maxPos){ posF=maxPos; maxRevealed=N-1; phase='pause'; phaseT=0; }
    } else if(phase==='pause'){
      phaseT++;
      if(phaseT > 70){
        // begin crossfade: fade out canvas, fade in real DOM text
        phase='fadeout';
        cv.classList.add('canvas-fade-out');
        heroContent.classList.add('reveal');
        dsaHint.classList.add('hide');
      }
    } else if(phase==='fadeout'){
      phaseT++;
      // canvas CSS transition is ~1.1s; stop drawing once fully faded
      if(phaseT > 80){ phase='stopped'; }
    }

    if(phase!=='stopped'){
      requestAnimationFrame(draw);
    }
  }
  draw();
})();

