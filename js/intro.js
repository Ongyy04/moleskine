(() => {
  const player = document.getElementById("player");
  const hotspot = document.getElementById("hotspot");
  const confirmBtn = document.getElementById("confirmBtn");
  const ch1Gif = document.getElementById("ch1Gif");
  const ch1Freeze = document.getElementById("ch1Freeze");

  const moleUI = document.getElementById("moleUI");
  const moleGif = document.getElementById("moleGif");
  const dialogText = document.getElementById("dialogText");
  const dialogHint = document.getElementById("dialogHint");

  const SRC = {
    intro1: "./images/intro/intro1.mp4",
    intro2: "./images/intro/intro2.mp4",
    ch1Gif: "./images/chapter1/ch_1.gif",
    ch1FreezePng: "./images/intro/ch_1_freeze.png",
    nextPage: "./chapter1.html",

    mole1: "./images/mole/mole1.gif",
    mole2: "./images/mole/mole2.gif",
    mole3: "./images/mole/mole3.gif",
    mole4: "./images/mole/mole5.gif",
    mole5: "./images/mole/mole4.gif",
  };


  const DIALOGS = [
    "으라차차… 아고 힘들어…",
    "안녕 나는 너와 모험을 함께 할 Moly야!",
    "너를 정말 보고 싶었어 헤헤",
    "킁킁, 어! 너에게 편지가 왔어. 같이 읽어볼까?",
  ];


  const INTRO2_PAUSE_AT_MS = 10000;
  const MOLE2_DELAY_MS = 15000;
  const FIRST_DIALOG_DELAY_MS = 1000;
  const TYPE_SPEED_MS = 85;
  const CH1_GIF_MS = 7000;

  const STATE = {
    INTRO1: "INTRO1",
    INTRO2: "INTRO2",
    DIALOG: "DIALOG",
    CH1: "CH1",
  };

  let state = STATE.INTRO1;

  let intro2Timer = null;
  let mole2Timer = null;
  let firstDialogTimer = null;
  let typingTimer = null;
  let ch1Timer = null;

  let dialogUnlocked = false;
  let step = 0;

 
  function clearTyping() {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    dialogText.classList.remove("typing");
  }

  function typeText(text) {
    clearTyping();
    dialogText.classList.add("show", "typing");
    dialogText.textContent = "";

    let i = 0;
    typingTimer = setInterval(() => {
      dialogText.textContent += text.charAt(i);
      i++;
      if (i >= text.length) clearTyping();
    }, TYPE_SPEED_MS);
  }

  function setHint(on) {
    if (!dialogHint) return;
    dialogHint.classList.toggle("show", on);
    dialogHint.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function resetMoleUI() {
    clearTimeout(mole2Timer);
    clearTimeout(firstDialogTimer);
    clearTyping();

    dialogUnlocked = false;
    step = 0;

    moleUI.classList.remove("show");
    moleGif.src = "";
    dialogText.classList.remove("show");
    dialogText.textContent = "";
    setHint(false);
  }

  function resetCh1() {
    clearTimeout(ch1Timer);
    ch1Gif.classList.remove("show");
    ch1Freeze.classList.remove("show");
    confirmBtn.classList.remove("show");
    ch1Gif.src = "";
    ch1Freeze.src = "";
  }

  async function playVideo(src, loop = false) {
    clearTimeout(intro2Timer);
    player.src = src;
    player.loop = loop;
    player.load();
    try { await player.play(); } catch (_) {}
  }

 
  function startMoleDialog() {
    state = STATE.DIALOG;
    resetMoleUI();

    moleUI.classList.add("show");
    moleGif.src = SRC.mole1;

    mole2Timer = setTimeout(() => {
      moleGif.src = SRC.mole2;
      setHint(true);
      dialogUnlocked = true;

    
      firstDialogTimer = setTimeout(() => {
        if (state !== STATE.DIALOG) return;
        typeText(DIALOGS[0]);
        step = 1;
      }, FIRST_DIALOG_DELAY_MS);
    }, MOLE2_DELAY_MS);
  }

  function handleDialogClick() {
    if (!dialogUnlocked) return;

    
    if (dialogText.classList.contains("typing")) {
      clearTyping();
      dialogText.textContent = DIALOGS[Math.min(step, DIALOGS.length - 1)];
      return;
    }


    if (step < 4) {
      if (step === 1) moleGif.src = SRC.mole3;
      if (step === 2) moleGif.src = SRC.mole4;
      if (step === 3) moleGif.src = SRC.mole5;

      typeText(DIALOGS[step]);
      step++;
      return;
    }

 
    startChapter1();
  }

 
  function startChapter1() {
    if (state === STATE.CH1) return;
    state = STATE.CH1;

    resetMoleUI();

    ch1Gif.src = SRC.ch1Gif;
    ch1Gif.classList.add("show");

    ch1Timer = setTimeout(() => {
      ch1Gif.classList.remove("show");
      ch1Freeze.src = SRC.ch1FreezePng;
      ch1Freeze.classList.add("show");
      confirmBtn.classList.add("show");
    }, CH1_GIF_MS);
  }

  
  resetCh1();
  resetMoleUI();
  playVideo(SRC.intro1, true);

  hotspot.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (state !== STATE.INTRO1) return;

    state = STATE.INTRO2;
    resetCh1();
    resetMoleUI();

    await playVideo(SRC.intro2, false);

    intro2Timer = setTimeout(() => {
      try { player.pause(); } catch (_) {}
      startMoleDialog();
    }, INTRO2_PAUSE_AT_MS);
  });

  document.addEventListener("click", (e) => {
    if (state !== STATE.DIALOG) return;
    if (e.target === hotspot || e.target === confirmBtn) return;
    handleDialogClick();
  }, true);

  confirmBtn.addEventListener("click", () => {
    window.location.href = SRC.nextPage;
  });
})();
