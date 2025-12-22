// ===== Mobile Menu =====
const toggle = document.querySelector(".header__toggle");
const nav = document.querySelector(".header__nav");

if (toggle && nav) {
  // ハンバーガー開閉
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // メニュー内リンクをクリックしたら閉じる（#リンクのみ）
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

// ===== FAQ Accordion =====
const faqItems = document.querySelectorAll(".faq__item");

faqItems.forEach((item) => {
  const q = item.querySelector(".faq__q");
  if (!q) return;

  q.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    q.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

// ===== CTA click events（計測フック） =====
document.querySelectorAll("[data-event]").forEach((el) => {
  el.addEventListener("click", () => {
    const eventName = el.dataset.event;
    const label = el.dataset.label || window.location.pathname;

    console.log("EVENT:", eventName, "LABEL:", label);

    if (typeof gtag === "function" && eventName) {
      gtag("event", eventName, {
        event_category: "lp",
        event_label: label,
        transport_type: "beacon"
      });
    }
  });
});

/* sim-income.js */
(function () {
  const dailyInput = document.getElementById("sim-daily-wage");
  const weeklyInput = document.getElementById("sim-weekly-days");
  const transportInput = document.getElementById("sim-transport");

  const displayDaily = document.getElementById("display-daily");
  const displayWeekly = document.getElementById("display-weekly");
  const displayTransport = document.getElementById("display-transport");

  const resultMonthly = document.getElementById("result-monthly");
  const resultYearly = document.getElementById("result-yearly");

  if (!dailyInput || !weeklyInput || !resultMonthly) return;

  function formatCurrency(num) {
    return Number(num || 0).toLocaleString();
  }

  function calculateIncome() {
    const dailyWage = parseInt(dailyInput.value, 10) || 0;
    const weeklyDays = parseInt(weeklyInput.value, 10) || 0;
    const transportCost = parseInt(transportInput?.value, 10) || 0;

    const monthlyShifts = weeklyDays * 4;
    const monthlyIncome = dailyWage * monthlyShifts + transportCost;
    const yearlyIncome = monthlyIncome * 12;

    if (displayDaily) displayDaily.textContent = formatCurrency(dailyWage);
    if (displayWeekly) displayWeekly.textContent = String(weeklyDays);
    if (displayTransport) displayTransport.textContent = formatCurrency(transportCost);

    if (resultMonthly) resultMonthly.textContent = formatCurrency(monthlyIncome);
    if (resultYearly) resultYearly.textContent = formatCurrency(yearlyIncome);
  }

  const inputs = [dailyInput, weeklyInput, transportInput].filter(Boolean);
  inputs.forEach((input) => {
    input.addEventListener("input", calculateIncome);
  });

  calculateIncome();
})();

// ===== Contact Form Submit (固定版) =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // 多重バインド防止
  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  // ▼案件ごとにここだけ差し替え
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxfW12_hD-NdcTSVndJX3mG0z31eHrfnsNE7ylwzOpXOxUaS8GhGb8BuE_6MrjdMBAZ/exec";
  const thanksPage = "thanks.html";
  // ▲▲▲

  const TIMEOUT_MS = 15000;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : "";

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting
      ? "送信中..."
      : originalText || "送信する";
  }

  function validateForm({ name, email, phone, message }) {
    const errors = [];
    if (!name || name.trim().length < 1) errors.push("お名前は必須です。");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("メールアドレスの形式が正しくありません。");
    const digits = (phone || "").replace(/[^\d]/g, "");
    if (!digits || digits.length < 10)
      errors.push("電話番号を正しく入力してください。");
    if (!message || message.trim().length < 1)
      errors.push("メッセージは必須です。");
    return errors;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 二重送信防止（連打・ラグ対策）
    if (form.dataset.submitting === "1") return;
    form.dataset.submitting = "1";
    setSubmitting(true);

    const formData = new FormData(form);

    // honeypot：値が入ってたらボット扱いで終了（黙って捨てる）
    if (formData.get("honeypot")) {
      form.dataset.submitting = "0";
      setSubmitting(false);
      return;
    }

    // UAを送ってerrorsで端末特定できるようにする
    formData.append("ua", navigator.userAgent);

    // 最低限バリデーション（no-corsで成功判定できないため、ここで弾く）
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message")
    };
    const errors = validateForm(payload);
    if (errors.length) {
      alert(errors[0]);
      form.dataset.submitting = "0";
      setSubmitting(false);
      return;
    }

    // タイムアウト（弱電波で固まるのを防ぐ）
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new Error("timeout")),
      TIMEOUT_MS
    );

    try {
      await fetch(scriptURL, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-store",
        keepalive: true
      });

      // no-cors運用：到達した前提でthanksへ
      window.location.href = thanksPage;
    } catch (err) {
      console.error("Send Error:", err);
      alert(
        "送信に失敗しました。電波状況をご確認のうえ、時間を置いて再度お試しください。"
      );
      form.dataset.submitting = "0";
      setSubmitting(false);
    } finally {
      clearTimeout(timer);
    }
  });
});
