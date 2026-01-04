(() => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const drawToolBtn = document.getElementById("drawToolBtn");
  const eraseToolBtn = document.getElementById("eraseToolBtn");
  const drawToolImg = document.getElementById("drawToolImg");

  const pickedInfo = document.getElementById("pickedInfo");
  const colorDot = document.getElementById("colorDot");
  const colorName = document.getElementById("colorName");

  const confirmBtn = document.getElementById("confirmBtn");
  const resetBtn = document.getElementById("resetBtn");


  const c2Transition = document.getElementById("c2Transition");
  const c2TransGif = document.getElementById("c2TransGif");
  const c2TransFreeze = document.getElementById("c2TransFreeze");
  const confirmAfterBtn = document.getElementById("confirmAfterBtn");


  const mole = document.getElementById("mole");
  const moleGifEl = document.getElementById("moleGif");
  const moleStaticEl = document.getElementById("moleStatic");
  const moleBubble = document.getElementById("moleBubble");
  const moleText = document.getElementById("moleText");


  let strokeSize = 10;
  let lastLineWidth = strokeSize;

  const sizeSlider = document.getElementById("sizeSlider");
  const sizeVal = document.getElementById("sizeVal");


  window.__C2__ = window.__C2__ || {};
  window.__C2__.isFrozen = false;

  if (sizeSlider) {
    sizeSlider.addEventListener("input", (e) => {
      strokeSize = parseInt(e.target.value);
      if (sizeVal) sizeVal.textContent = strokeSize;
    });
  }


  function getCss(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }
  function safeJSON(s) {
    try { return JSON.parse(s); } catch { return null; }
  }


  const COLOR_MAP = {
    red: getCss("--c-red"),
    orange: getCss("--c-orange"),
    yellow: getCss("--c-yellow"),
    green: getCss("--c-green"),
    blue: getCss("--c-blue"),
    navy: getCss("--c-navy"),
    purple: getCss("--c-purple"),
    black: getCss("--c-black"),
    white: getCss("--c-white"),
  };

  
  const DEFAULT_TOOL = "pencil";
  const DEFAULT_COLOR = "red";
  const VALID_TOOLS = new Set(["pencil", "marker", "fountain_pen"]);

  function getToolImagePath(colorKey, tool) {
    const safeColor = COLOR_MAP[colorKey] ? colorKey : DEFAULT_COLOR;
    const safeTool = VALID_TOOLS.has(tool) ? tool : DEFAULT_TOOL;
    return `./images/chapter1/${safeColor}/${safeTool}.png`;
  }

  function updateToolImage() {
    if (!drawToolImg) return;
    drawToolImg.src = getToolImagePath(activeColorKey, activeTool);
  }

  if (drawToolImg) {
    drawToolImg.onerror = () => {
      drawToolImg.src = getToolImagePath(DEFAULT_COLOR, DEFAULT_TOOL);
    };
  }

  const params = new URLSearchParams(location.search);
  const saved = safeJSON(localStorage.getItem("c1_pick")) || {};

  let activeTool = params.get("tool") || saved.tool || DEFAULT_TOOL;
  let activeColorKey = params.get("color") || saved.color || DEFAULT_COLOR;

  if (!VALID_TOOLS.has(activeTool)) activeTool = DEFAULT_TOOL;
  if (!COLOR_MAP[activeColorKey]) activeColorKey = DEFAULT_COLOR;

  localStorage.setItem("c1_pick", JSON.stringify({ tool: activeTool, color: activeColorKey }));

  updateToolImage();
  if (pickedInfo) pickedInfo.textContent = `${activeTool}`;
  if (colorDot) colorDot.style.background = COLOR_MAP[activeColorKey];
  if (colorName) colorName.textContent = activeColorKey;

  const MODE = { DRAW: "DRAW", ERASE: "ERASE" };
  let mode = MODE.DRAW;

  function setMode(next) {
    if (window.__C2__?.isFrozen) return;
    mode = next;
    drawToolBtn?.classList.toggle("is-active", mode === MODE.DRAW);
    eraseToolBtn?.classList.toggle("is-active", mode === MODE.ERASE);
    if (mode === MODE.ERASE) {
      confirmBtn.disabled = true;
      connected = false;
      visited.clear();
    }
  }

  drawToolBtn?.addEventListener("click", () => {
    setMode(MODE.DRAW);
    updateToolImage();
  });
  eraseToolBtn?.addEventListener("click", () => setMode(MODE.ERASE));

 
  const MOLE_ASSETS = {
  
    gif: "./images/mole/mole3.gif",
    static: "./images/mole/mole.png",
  };


  const MOLE_LINES = [
    "좋아. 선이 깔끔해.",
    "지금 감각이 살아있는데?",
    "잘하고 있어",
    "오. 흐름이 예쁘다.",
    "우아! 너무 잘했어!",
  ];

  let bubbleTimer = null;
  let typingTimer = null;
  let lastSayAt = 0;

  function setMoleState(state /* "gif" | "static" */) {
    if (!mole) return;
    mole.classList.remove("is-gif", "is-static");
    mole.classList.add(state === "gif" ? "is-gif" : "is-static");
  }

  function ensureMoleSources() {
    if (moleGifEl) {
      moleGifEl.src = MOLE_ASSETS.gif;
      moleGifEl.onerror = () => { /* 경로 틀리면 gif 안 뜸 */ };
    }
    if (moleStaticEl) {
      moleStaticEl.src = MOLE_ASSETS.static;
      moleStaticEl.onerror = () => { /* 경로 틀리면 static 안 뜸 */ };
    }
  }

  function clearBubbleTimers() {
    if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  }

  function hideMoleBubble() {
    if (!moleBubble) return;
    moleBubble.classList.remove("show");
  }

  function typeText(el, text, speedMs = 18) {
    if (!el) return;
    clearBubbleTimers();
    el.textContent = "";
    let i = 0;

    typingTimer = setInterval(() => {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        bubbleTimer = setTimeout(() => hideMoleBubble(), 1400);
      }
    }, speedMs);
  }

  function moleSayRandom() {
    const now = Date.now();
 
    if (now - lastSayAt < 250) return;
    lastSayAt = now;

    const line = MOLE_LINES[Math.floor(Math.random() * MOLE_LINES.length)];

    if (moleBubble) moleBubble.classList.add("show");
    typeText(moleText, line, 16);
  }

  function playMoleIntroOnce() {
    if (!mole || !moleGifEl || !moleStaticEl) return;
    ensureMoleSources();

 
    setMoleState("gif");


    setTimeout(() => {
      setMoleState("static");
    }, 2600);
  }


  playMoleIntroOnce();

 
  function drawStroke(p0, p1) {
    const color = COLOR_MAP[activeColorKey];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    if (mode === MODE.ERASE) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineWidth = strokeSize * 1.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
      return { width: strokeSize * 1.5, segDist: dist };
    }

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (activeTool === "pencil") {
      const density = strokeSize * 1.5;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < dist; i += 0.8) {
        const x = p0.x + Math.cos(angle) * i;
        const y = p0.y + Math.sin(angle) * i;
        for (let j = 0; j < density; j++) {
          const offX = (Math.random() - 0.5) * strokeSize;
          const offY = (Math.random() - 0.5) * strokeSize;
          const dotAlpha = Math.random() * (1 - Math.hypot(offX, offY) / (strokeSize / 2));
          if (dotAlpha > 0) {
            ctx.globalAlpha = dotAlpha * 0.5;
            ctx.fillRect(x + offX, y + offY, 1.1, 1.1);
          }
        }
      }
      ctx.restore();
      return { width: strokeSize, segDist: dist };
    } else if (activeTool === "marker") {
      ctx.globalAlpha = 0.35;
      const step = strokeSize / 5;
      for (let i = 0; i < dist; i += step) {
        const x = p0.x + Math.cos(angle) * i;
        const y = p0.y + Math.sin(angle) * i;
        ctx.beginPath();
        ctx.arc(x, y, strokeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return { width: strokeSize, segDist: dist };
    } else {
      const targetWidth = Math.max(1, strokeSize * (1 - Math.min(dist / 35, 0.8)));
      const currentWidth = lastLineWidth + (targetWidth - lastLineWidth) * 0.2;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.globalAlpha = 0.15;
      ctx.lineWidth = currentWidth + 1.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      ctx.lineWidth = currentWidth;
      ctx.stroke();

      lastLineWidth = currentWidth;
      ctx.restore();
      return { width: currentWidth, segDist: dist };
    }
  }

 
  const circles = [];
  const CIRCLE_R = 26;
  const MIN_DIST = 220;
  const PADDING = 90;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function placeCircles() {
    circles.length = 0;
    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;
    let tries = 0;
    while (circles.length < 3 && tries < 5000) {
      tries++;
      const c = { x: rand(PADDING, W - PADDING), y: rand(PADDING, H - PADDING), r: CIRCLE_R };
      if (circles.every((o) => dist2(c, o) >= MIN_DIST)) circles.push(c);
    }
  }

  const visited = new Set();
  let connected = false;

  function resetProgress() {
    visited.clear();
    connected = false;
    confirmBtn.disabled = true;
  }

  function markCircleHitBySegment(p0, p1, lineWidth) {
    for (let i = 0; i < circles.length; i++) {
      if (visited.has(i)) continue;
      const c = circles[i];
      const d = distancePointToSegment(c.x, c.y, p0.x, p0.y, p1.x, p1.y);
      if (d <= c.r + Math.max(2, lineWidth * 0.45)) visited.add(i);
    }
    if (visited.size === 3) {
      connected = true;
      confirmBtn.disabled = false;
    }
  }

  function drawCirclesOverlay() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    const base = COLOR_MAP[activeColorKey] || "#4b86d6";
    const withAlpha = (color, a) => {
      if (!color) return `rgba(75,134,214,${a})`;
      if (color.startsWith("rgba")) {
        return color.replace(/rgba\(([^)]+)\)/, (_, inner) => {
          const p = inner.split(",").map((s) => s.trim());
          return `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${a})`;
        });
      }
      if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `, ${a})`);
      if (color[0] === "#") {
        const hex = color.slice(1);
        const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex.padEnd(6, "0").slice(0, 6);
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgba(75,134,214,${a})`;
    };

    circles.forEach((c, idx) => {
      const isVisited = visited.has(idx);

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!isVisited) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(base, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r + 10);
        grad.addColorStop(0, withAlpha(base, 0.5));
        grad.addColorStop(1, withAlpha(base, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r + 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = withAlpha(base, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    ctx.restore();
  }


  const canvasHint = document.getElementById("canvasHint");
  canvas.addEventListener("pointerdown", () => {
    if (window.__C2__?.isFrozen) return;
    if (canvasHint) canvasHint.classList.add("drawing");
  });
  canvas.addEventListener("pointerup", () => {
    if (canvasHint) canvasHint.classList.remove("drawing");
  });

  // ====== transition ======
  const TRANS = {
    gif: "./images/chapter3/ch3.gif",
    freeze: "./images/chapter3/ch3_freeze.png",
  };

  const TRANS_GIF_DURATION_SEC = 7;
  let transitionTimer = null;

  function clearTransitionTimer() {
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function resetTransitionUI() {
    clearTransitionTimer();

    confirmAfterBtn?.classList.remove("show");

    if (c2TransFreeze) {
      c2TransFreeze.classList.remove("show");
      c2TransFreeze.src = "";
    }

    if (c2TransGif) {
      c2TransGif.classList.remove("show");
      c2TransGif.src = "";
    }

    if (c2Transition) {
      c2Transition.classList.remove("show");
      c2Transition.setAttribute("aria-hidden", "true");
    }
  }

  function showFreezeAndWaitConfirm() {
    if (c2TransGif) {
      c2TransGif.classList.remove("show");
      c2TransGif.src = "";
    }

    if (c2TransFreeze) {
      c2TransFreeze.src = TRANS.freeze;
      c2TransFreeze.classList.add("show");
    }

    if (confirmAfterBtn) {
      confirmAfterBtn.classList.add("show");
      confirmAfterBtn.disabled = false;
    }
  }

  function showTransitionOverlay() {
    if (!c2Transition || !c2TransGif) {
      location.href = "./chapter3.html";
      return;
    }

    resetTransitionUI();

    c2Transition.classList.add("show");
    c2Transition.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      c2TransGif.src = TRANS.gif;
      c2TransGif.classList.add("show");
    });

    transitionTimer = setTimeout(() => {
      showFreezeAndWaitConfirm();
    }, TRANS_GIF_DURATION_SEC * 1000);
  }

  function resetScene() {
    const r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    placeCircles();
    resetProgress();
    drawCirclesOverlay();

    resetTransitionUI();
    window.__C2__.isFrozen = false;

    
    clearBubbleTimers();
    hideMoleBubble();

 
    updateToolImage();

   
    setMoleState("static");
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resetScene();
  }
  window.addEventListener("resize", resize);


  let drawing = false;
  let prev = null;

let pathPoints = [];
let pathActive = false;

  let strokeMoved = false;
  let strokeTotalDist = 0;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (window.__C2__?.isFrozen) return;
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    lastLineWidth = strokeSize;
    if (mode === MODE.DRAW) resetProgress();
    prev = getPos(e);

    if (mode === MODE.DRAW) {

  pathPoints = [];

  pathActive = true;

}


    strokeMoved = false;
    strokeTotalDist = 0;
  });

  canvas.addEventListener("pointermove", (e) => {
    if (window.__C2__?.isFrozen) return;
    if (!drawing) return;

    const cur = getPos(e);
    const { width, segDist } = drawStroke(prev, cur);

    if (segDist > 0.5) {
      strokeMoved = true;
      strokeTotalDist += segDist;
    }

    if (mode === MODE.DRAW) markCircleHitBySegment(prev, cur, width);
    drawCirclesOverlay();
    prev = cur;
    
    if (mode === MODE.DRAW && pathActive) {

  const r = canvas.getBoundingClientRect();

  pathPoints.push({ x: cur.x / r.width, y: cur.y / r.height });

}


  });

  canvas.addEventListener("pointerup", () => {
    if (window.__C2__?.isFrozen) return;

   
    if (mode === MODE.DRAW && strokeMoved && strokeTotalDist >= 12) {
      moleSayRandom();
    }

    drawing = false;
    prev = null;
    pathActive = false;
  });


  confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirmBtn.disabled) return;
    if (!connected) return;

    window.__C2__.isFrozen = true;
    drawing = false;
    prev = null;

  
    clearBubbleTimers();
    hideMoleBubble();

localStorage.setItem("drawnPath", JSON.stringify(pathPoints));
    showTransitionOverlay();
  });

 
  confirmAfterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (c2TransFreeze && !c2TransFreeze.classList.contains("show")) return;

    confirmAfterBtn.disabled = true;
    location.href = "./chapter3.html";
  });

  resetBtn.addEventListener("click", resetScene);

  function distancePointToSegment(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1, vy = y2 - y1, wx = px - x1, wy = py - y1;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - x1, py - y1);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - x2, py - y2);
    const b = c1 / c2;
    return Math.hypot(px - (x1 + b * vx), py - (y1 + b * vy));
  }

  resize();
})();
