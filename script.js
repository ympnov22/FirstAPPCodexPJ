(() => {
  const NUMBER_RANGE = { min: 1, max: 100 };
  const STORAGE_KEY = 'number-challenge-best-score';

  const attemptCounterEl = document.getElementById('attemptCount');
  const bestScoreEl = document.getElementById('bestScore');
  const feedbackEl = document.getElementById('feedback');
  const historyListEl = document.getElementById('historyList');
  const guessInputEl = document.getElementById('guessInput');
  const guessFormEl = document.getElementById('guessForm');
  const newRoundBtn = document.getElementById('newRound');
  const resetBestBtn = document.getElementById('resetBest');

  let targetNumber = 0;
  let attemptCount = 0;
  let roundFinished = false;

  const safeLocalStorage = (() => {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      console.warn('LocalStorage is not available, best score persistence disabled.', error);
      return null;
    }
  })();

  function loadBestScore() {
    if (!safeLocalStorage) return null;
    const storedValue = safeLocalStorage.getItem(STORAGE_KEY);
    return storedValue ? Number.parseInt(storedValue, 10) : null;
  }

  function saveBestScore(score) {
    if (!safeLocalStorage) return;
    safeLocalStorage.setItem(STORAGE_KEY, String(score));
  }

  function clearBestScore() {
    if (!safeLocalStorage) return;
    safeLocalStorage.removeItem(STORAGE_KEY);
  }

  function formatBestScore(score) {
    return Number.isFinite(score) ? ${score} 回 : '-';
  }

  function updateAttemptDisplay() {
    attemptCounterEl.textContent = attemptCount.toString();
  }

  function updateBestDisplay(score = loadBestScore()) {
    bestScoreEl.textContent = formatBestScore(score);
  }

  function setFeedback(message, tone = 'info') {
    feedbackEl.textContent = message;
    feedbackEl.dataset.tone = tone;
  }

  function pushHistory(guess, result) {
    const entry = document.createElement('li');
    entry.className = 'history__item';
    entry.innerHTML = <span class="history__guess"></span><span class="history__result"></span>;
    historyListEl.prepend(entry);
  }

  function hasGuessValue(value) {
    return Number.isInteger(value) && value >= NUMBER_RANGE.min && value <= NUMBER_RANGE.max;
  }

  function handleCorrectGuess() {
    roundFinished = true;
    guessInputEl.disabled = true;
    const currentBest = loadBestScore();

    if (!Number.isFinite(currentBest) || attemptCount < currentBest) {
      saveBestScore(attemptCount);
      updateBestDisplay(attemptCount);
      setFeedback(正解！ 最短記録を更新しました ( 回)。, 'success');
    } else {
      setFeedback(正解！ 今回は  回でクリア。, 'success');
    }
  }

  function evaluateGuess(guess) {
    attemptCount += 1;
    updateAttemptDisplay();

    if (guess === targetNumber) {
      pushHistory(guess, '🎯 正解');
      handleCorrectGuess();
      return;
    }

    const hint = guess < targetNumber ? '大きい' : '小さい';
    pushHistory(guess, ${hint} 数値);
    setFeedback(${guess} はです。, 'info');
  }

  function resetRound() {
    roundFinished = false;
    attemptCount = 0;
    targetNumber = Math.floor(Math.random() * (NUMBER_RANGE.max - NUMBER_RANGE.min + 1)) + NUMBER_RANGE.min;
    updateAttemptDisplay();
    setFeedback('新しいラウンドが始まりました。数字を推測してみよう！');
    historyListEl.innerHTML = '';
    guessFormEl.reset();
    guessInputEl.disabled = false;
    guessInputEl.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (roundFinished) {
      setFeedback('ラウンドは終了しました。「新しいラウンド」を押して再開してください。', 'warning');
      return;
    }

    const value = Number.parseInt(guessInputEl.value, 10);

    if (!hasGuessValue(value)) {
      setFeedback(${NUMBER_RANGE.min} から  の範囲で整数を入力してください。, 'warning');
      guessInputEl.select();
      return;
    }

    evaluateGuess(value);
    guessInputEl.focus();
    guessInputEl.select();
  }

  function handleResetBest() {
    clearBestScore();
    updateBestDisplay(null);
    setFeedback('ベストスコアをリセットしました。', 'info');
    guessInputEl.focus();
  }

  guessFormEl.addEventListener('submit', handleSubmit);
  newRoundBtn.addEventListener('click', resetRound);
  resetBestBtn.addEventListener('click', handleResetBest);

  updateBestDisplay();
  resetRound();
})();
