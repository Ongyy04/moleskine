(() => {
  const moleUI = document.getElementById("moleUI");
  const moleGif = document.getElementById("moleGif");
  const dialogText = document.getElementById("dialogText");
  const dialogHint = document.getElementById("dialogHint");
  const confirmBtn = document.getElementById("confirmBtn");

  const SRC = {
    mole1: "./images/mole/mole1.gif",
    mole2: "./images/mole/mole2.gif",
    mole3: "./images/mole/mole3.gif",
    mole4: "./images/mole/mole5.gif",
    mole5: "./images/mole/mole4.gif",
    nextPage: "./ending.html",
  };

  const TOTAL_M = 5;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const mCountRaw = parseInt(localStorage.getItem("mCount") || "0", 10);
  const mCount = clamp(isNaN(mCountRaw) ? 0 : mCountRaw, 0, TOTAL_M);

  function computeReward(count) {
    const couponTable = [0, 5, 10, 15, 20, 30];
    const couponPercent = couponTable[count] ?? 0;

    let gift = "작은 책갈피";
    if (count === 0) gift = "응원 스티커";
    if (count === 1) gift = "미니 스티커 팩";
    if (count === 2) gift = "커버 컬러 3종 선택권";
    if (count === 3) gift = "이니셜 각인 1줄";
    if (count === 4) gift = "속지 선택권";
    if (count === 5) gift = "금박/엠보 옵션 1개";

    let feedback = "처음은 언제나 어려운 법이지. 다음엔 더 잘할 수 있어.";
    if (count === 0) feedback = "오늘은 감각을 예열한 날이야. \n 다음엔 분명 찾을 수 있어.";
    if (count === 1) feedback = "좋아, 감을 잡았어. \n 조금만 더 가까워졌어.";
    if (count === 2) feedback = "이제 너는 제대로 길을 읽기 시작했어.";
    if (count === 3) feedback = "너, 꽤 예리해. \n 숨겨진 것들을 잘 찾아.";
    if (count === 4) feedback = "거의 완벽했어. \n 진짜 잘했어.";
    if (count === 5) feedback = "완벽해. \n 너는 오늘의 M 마스터야.";

    return { couponPercent, gift, feedback };
  }

  const reward = computeReward(mCount);

  localStorage.setItem("couponPercent", String(reward.couponPercent));
  localStorage.setItem("giftName", reward.gift);

  const DIALOGS = [
    "오늘 나와 함께 해서 어땠어?",
    "나와 여정을 함께 해줘서 고마워.",
    `우리 오늘 M을 ${mCount}개 모았어.`,
    reward.feedback,
    `그래서 이 상품을 줄게! “${reward.gift}”\n 이걸로 너만의 몰스킨을 만들 수 있어`,
    "앞으로도 너와 계속 함께이고 싶어. \n 너의 곁에 항상 있을게.",
  ];

  const TYPE_SPEED_MS = 85;
  let typingTimer = null;
  let unlocked = false;
  let step = 0;

  function clearTyping() {
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = null;
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
    dialogHint.classList.toggle("show", on);
    dialogHint.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function start() {
    moleUI.classList.add("show");
    dialogText.classList.add("show");
    moleGif.src = SRC.mole2;

    setTimeout(() => {
      unlocked = true;
      setHint(true);
      typeText(DIALOGS[0]);
      step = 1;
    }, 600);
  }

  function next() {
    if (!unlocked) return;

    if (dialogText.classList.contains("typing")) {
      clearTyping();
      dialogText.textContent = DIALOGS[Math.min(step, DIALOGS.length - 1)];
      return;
    }

    if (step < DIALOGS.length) {
      if (step === 1) moleGif.src = SRC.mole3;
      if (step === 3) moleGif.src = SRC.mole4;
      if (step === 5) moleGif.src = SRC.mole5;

      typeText(DIALOGS[step]);
      step++;
      return;
    }

    setHint(false);
    confirmBtn.classList.add("show");
  }

  document.addEventListener("click", (e) => {
    if (e.target === confirmBtn) return;
    next();
  }, true);

  confirmBtn.addEventListener("click", () => {
    window.location.href = SRC.nextPage;
  });

  start();
})();
