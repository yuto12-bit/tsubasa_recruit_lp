/* sim-income.js（監査ベース：最小差分で堅牢化） */
(function() {
  // DOM要素の取得
  const dailyInput = document.getElementById('sim-daily-wage');
  const weeklyInput = document.getElementById('sim-weekly-days');
  const transportInput = document.getElementById('sim-transport');

  const displayDaily = document.getElementById('display-daily');
  const displayWeekly = document.getElementById('display-weekly');
  const displayTransport = document.getElementById('display-transport');

  const resultMonthly = document.getElementById('result-monthly');
  const resultYearly = document.getElementById('result-yearly');

  // 要素がない場合は処理を中断（落とさない）
  if (!dailyInput || !weeklyInput || !transportInput || !resultMonthly || !resultYearly) return;

  // 数値をカンマ区切りにするヘルパー関数
  function formatCurrency(num) {
    return Number(num || 0).toLocaleString('ja-JP');
  }

  // 空欄/文字混入でも0に倒す（挙動安定化）
  function toInt(el) {
    const n = parseInt(el.value, 10);
    return Number.isFinite(n) ? n : 0;
  }

  // 計算ロジック
  function calculateIncome() {
    const dailyWage = toInt(dailyInput);
    const weeklyDays = toInt(weeklyInput);
    const transportCost = toInt(transportInput);

    // 月収 = 日給 × (週出勤 × 4) + 交通費
    const monthlyShifts = weeklyDays * 4;
    const monthlyIncome = (dailyWage * monthlyShifts) + transportCost;

    // 年収 = 月収 × 12
    const yearlyIncome = monthlyIncome * 12;

    // 画面への反映
    if (displayDaily) displayDaily.textContent = formatCurrency(dailyWage);
    if (displayWeekly) displayWeekly.textContent = weeklyDays;
    if (displayTransport) displayTransport.textContent = formatCurrency(transportCost);

    resultMonthly.textContent = formatCurrency(monthlyIncome);
    resultYearly.textContent = formatCurrency(yearlyIncome);
  }

  // イベントリスナー（入力変更で即時計算）
  [dailyInput, weeklyInput, transportInput].forEach(input => {
    input.addEventListener('input', calculateIncome);
    input.addEventListener('change', calculateIncome);
  });

  // 初期化
  calculateIncome();
})();
