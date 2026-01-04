
(() => {
  const swatches = Array.from(document.querySelectorAll(".swatch"));

  const setA = document.getElementById("setA");
  const setB = document.getElementById("setB");

  const toolsStage = document.querySelector(".tools-stage");
  const confirmBtn = document.getElementById("confirmBtn");

  const sfxColor = document.getElementById("sfxColor");
  const sfxPick  = document.getElementById("sfxPick");

  const c1Transition    = document.getElementById("c1Transition");
  const c1TransGif      = document.getElementById("c1TransGif");
  const c1TransFreeze   = document.getElementById("c1TransFreeze");
  const confirmAfterBtn = document.getElementById("confirmAfterBtn");

  
  const moleEl = document.getElementById("mole");
  const moleSpeech = document.getElementById("moleSpeech");
  const moleSpeechText = document.getElementById("moleSpeechText");

  const moleIntroGif = document.getElementById("moleIntroGif"); // mole1.gif (intro only)
  const moleRGif1 = document.getElementById("moleRGif1");
  const moleRGif2 = document.getElementById("moleRGif2");
  const moleRGif3 = document.getElementById("moleRGif3");
  const moleStatic = document.getElementById("moleStatic");

  const moleRandomGifs = [moleRGif1, moleRGif2, moleRGif3].filter(Boolean);


  const TRANS = {
    gif: "./images/chapter2/ch2.gif",
    freeze: "./images/chapter1/ch2_freeze.png",
  };
  const TRANS_GIF_DURATION_SEC = 7;

  const USE_COLOR_FOLDERS_LATER = true;
  const BASE_PATH = "./images/chapter1";
  const tools = ["pencil", "marker", "fountain_pen"];

  
  const MOLE_GIF_MS = 15000;

  const MOLE_LINES = {
    enter: ["좋아. 이제 시작해볼까?", "도구랑 색을 골라봐.", "천천히 해도 괜찮아."],
    color: ["오, 그 색 느낌 좋은데?", "색 바꾸니까 분위기가 확 달라진다.", "좋아. 그 톤으로 가자."],
    tool:  ["그 도구로 한번 그어봐.", "선 느낌 기대된다.", "오케이. 그걸로 확정?"]
  };

  const SPEECH_SHOW_MS = 2200;
  const SPEECH_COOLDOWN_MS = 350;

  let activeColor = "red";
  let activeTool  = "pencil";

  let hasPickedTool = false;
  let frontSet = setA;
  let backSet  = setB;

  let isSwitching = false;
  let isTransitioning = false;
  let transitionTimer = null;

 
  let speechTimer = null;
  let speechCooldown = false;

  let moleGifTimer = null;
  let moleGifLock = false;
  const MOLE_GIF_COOLDOWN_MS = 180;

  function clearTransitionTimer() {
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function safePlay(audioEl) {
    if (!audioEl) return;
    try {
      audioEl.currentTime = 0;
      audioEl.play();
    } catch (_) {}
  }

  function pathFor(toolName, color) {
    if (!USE_COLOR_FOLDERS_LATER) return `${BASE_PATH}/${toolName}.png`;
    return `${BASE_PATH}/${color}/${toolName}.png`;
  }

  function setActiveSwatchUI(color) {
    swatches.forEach((btn) => {
      const on = btn.dataset.color === color;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function setImagesForSet(setEl, color) {
    if (!setEl) return;
    const prefix = setEl.dataset.set;

    tools.forEach((t) => {
      const img = document.getElementById(`${prefix}_${t}`);
      if (!img) return;

      const target = pathFor(t, color);
      img.onerror = () => {
        img.onerror = null;
        img.src = pathFor(t, "red");
      };
      img.src = target;
    });
  }

  function setActiveToolUI(toolName) {
    activeTool = toolName;

    const btns = Array.from(frontSet.querySelectorAll(".tool"));
    btns.forEach((b) => {
      b.classList.toggle("is-active", b.dataset.tool === toolName);
    });
  }

  function pulsePick(btn) {
    if (!btn) return;
    btn.classList.remove("pulse");
    void btn.offsetWidth;
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 360);
  }

 
  function hideImg(img) {
    if (!img) return;
    img.style.display = "none";
  }

  function showImg(img) {
    if (!img) return;
    img.style.display = "block";
  }

  function restartGif(img) {
    if (!img) return;
    const src = img.getAttribute("src");
    if (!src) return;
    img.src = "";
    requestAnimationFrame(() => (img.src = src));
  }

  function showMoleStatic() {
    if (!moleEl) return;

   
    hideImg(moleIntroGif);
    moleRandomGifs.forEach(hideImg);


    showImg(moleStatic);
    moleEl.classList.add("show-static");
  }

  function playGifForMs(img, ms) {
    if (!moleEl || !img) return;

   
    if (moleGifLock) return;
    moleGifLock = true;
    setTimeout(() => (moleGifLock = false), MOLE_GIF_COOLDOWN_MS);

 
    if (moleGifTimer) {
      clearTimeout(moleGifTimer);
      moleGifTimer = null;
    }

    hideImg(moleIntroGif);
    moleRandomGifs.forEach(hideImg);
    hideImg(moleStatic);

    moleEl.classList.remove("show-static");

    restartGif(img);
    showImg(img);

    moleGifTimer = setTimeout(() => {
      showMoleStatic();
      moleGifTimer = null;
    }, ms);
  }

  function playIntroOnly() {
    
    if (!moleIntroGif) return;
    playGifForMs(moleIntroGif, MOLE_GIF_MS);
  }

  function playRandomOnly() {
   
    if (moleRandomGifs.length === 0) return;
    const pick = moleRandomGifs[Math.floor(Math.random() * moleRandomGifs.length)];
    playGifForMs(pick, MOLE_GIF_MS);
  }

  function pickRandom(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function moleSay(line) {
    if (!moleSpeech || !moleSpeechText) return;

    if (speechCooldown) return;
    speechCooldown = true;
    setTimeout(() => (speechCooldown = false), SPEECH_COOLDOWN_MS);

    if (speechTimer) {
      clearTimeout(speechTimer);
      speechTimer = null;
    }

    moleSpeechText.textContent = line;
    moleSpeech.classList.add("show");

    speechTimer = setTimeout(() => {
      moleSpeech.classList.remove("show");
      speechTimer = null;
    }, SPEECH_SHOW_MS);
  }

  function moleSayRandom(type) {
    const line = pickRandom(MOLE_LINES[type]);
    if (line) moleSay(line);
  }

 
  function confirmToolPick(btn) {
    hasPickedTool = true;
    toolsStage?.classList.add("is-picked");
    confirmBtn?.classList.add("show");

    pulsePick(btn);
    safePlay(sfxPick);

  
    playRandomOnly();
    moleSayRandom("tool");
  }

  function swapFrontBack() {
    const tmp = frontSet;
    frontSet = backSet;
    backSet = tmp;
  }

  function switchColor(nextColor) {
    if (isSwitching || isTransitioning) return;
    if (nextColor === activeColor) return;

    isSwitching = true;
    activeColor = nextColor;

    setActiveSwatchUI(activeColor);
    safePlay(sfxColor);

   
    playRandomOnly();
    moleSayRandom("color");

    setImagesForSet(backSet, activeColor);

    frontSet.classList.remove("is-enter");
    backSet.classList.remove("is-exit");

    backSet.classList.remove("is-standby");
    backSet.classList.add("is-enter");
    frontSet.classList.add("is-exit");

    const onEnterEnd = (e) => {
      if (e.target !== backSet) return;
      backSet.removeEventListener("animationend", onEnterEnd);

      frontSet.classList.remove("is-exit");
      frontSet.classList.add("is-standby");
      backSet.classList.remove("is-enter");

      swapFrontBack();
      setActiveToolUI(activeTool);

      isSwitching = false;
    };

    backSet.addEventListener("animationend", onEnterEnd);
  }


  function resetTransitionUI() {
    clearTransitionTimer();

    if (confirmAfterBtn) confirmAfterBtn.classList.remove("show");

    if (c1TransFreeze) {
      c1TransFreeze.classList.remove("show");
      c1TransFreeze.src = "";
    }

    if (c1TransGif) {
      c1TransGif.classList.remove("show");
      c1TransGif.src = "";
    }

    if (c1Transition) {
      c1Transition.classList.remove("show");
      c1Transition.setAttribute("aria-hidden", "true");
    }
  }

  function showTransitionOverlay() {
    if (!c1Transition || !c1TransGif || !c1TransFreeze) return;

    resetTransitionUI();

    c1Transition.classList.add("show");
    c1Transition.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      c1TransGif.src = TRANS.gif;
      c1TransGif.classList.add("show");
    });

    transitionTimer = setTimeout(() => {
      showFreezeAndWaitConfirm();
    }, TRANS_GIF_DURATION_SEC * 1000);
  }

  function showFreezeAndWaitConfirm() {
    if (!c1TransFreeze) return;

    if (c1TransGif) {
      c1TransGif.classList.remove("show");
      c1TransGif.src = "";
    }

    c1TransFreeze.src = TRANS.freeze;
    c1TransFreeze.classList.add("show");

    if (confirmAfterBtn) {
      confirmAfterBtn.classList.add("show");
      confirmAfterBtn.disabled = false;
    }
  }

  function goChapter2WithPick() {
    try {
      localStorage.setItem("c1_pick", JSON.stringify({ tool: activeTool, color: activeColor }));
    } catch (_) {}

    const qs = new URLSearchParams({ tool: activeTool, color: activeColor });
    window.location.href = `./chapter2.html?${qs.toString()}`;
  }

 
  function bindToolClicks(setEl) {
    if (!setEl) return;
    Array.from(setEl.querySelectorAll(".tool")).forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isSwitching || isTransitioning) return;
        if (setEl !== frontSet) return;

        setActiveToolUI(btn.dataset.tool);
        confirmToolPick(btn);
      });
    });
  }

  bindToolClicks(setA);
  bindToolClicks(setB);

  swatches.forEach((btn) => {
    btn.addEventListener("click", () => switchColor(btn.dataset.color));
  });

  confirmBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!hasPickedTool) return;
    if (isTransitioning) return;

    isTransitioning = true;
    confirmBtn.disabled = true;

    if (confirmAfterBtn) confirmAfterBtn.classList.remove("show");

    showTransitionOverlay();
  });

  confirmAfterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isTransitioning) return;
    if (!c1TransFreeze || !c1TransFreeze.classList.contains("show")) return;

    confirmAfterBtn.disabled = true;
    goChapter2WithPick();
  });


  setActiveSwatchUI(activeColor);

  setImagesForSet(setA, activeColor);
  setImagesForSet(setB, activeColor);

  const initBtns = Array.from(frontSet.querySelectorAll(".tool"));
  initBtns.forEach((b) => {
    b.classList.toggle("is-active", b.dataset.tool === activeTool);
  });

  hasPickedTool = false;
  toolsStage?.classList.remove("is-picked");
  confirmBtn?.classList.remove("show");
  if (confirmBtn) confirmBtn.disabled = false;

  if (backSet && !backSet.classList.contains("is-standby")) {
    backSet.classList.add("is-standby");
  }

  resetTransitionUI();


  if (moleEl) {
    showMoleStatic();
    playIntroOnly();      
    moleSayRandom("enter");
  }
})();
