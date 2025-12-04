// ===== Mobile Menu =====
const toggle = document.querySelector(".header__toggle");
const nav = document.querySelector(".header__nav");

if (toggle && nav) {
  // ハンバーガー開閉
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ★追加：メニュー内リンクをクリックしたら閉じる
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    // #から始まるセクションリンクだけを対象にする
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

  q.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    q.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

// ===== CTA click events（計測フック） =====
document.querySelectorAll("[data-event]").forEach((el) => {
  el.addEventListener("click", () => {
    const eventName = el.dataset.event;

    // デバッグ用ログ
    console.log("EVENT:", eventName);

    // GA4 にイベント送信
    if (typeof gtag === "function" && eventName) {
      gtag("event", eventName, {
        event_category: "lp",
        event_label: window.location.pathname
      });
    }
  });
});

// （...ここより上に、ハンバーガーメニューなどの既存コードがあるはず...）

// ▼▼▼ 以下を追記：お問い合わせフォーム送信処理 ▼▼▼
document.addEventListener('DOMContentLoaded', function() {
  const formElement = document.getElementById('contactForm');
  
  // フォームが存在するページでのみ実行（エラー防止）
  if (formElement) {
    formElement.addEventListener('submit', function(e) {
      e.preventDefault(); 
      
      // ▼▼▼ 【重要】案件ごとにここを書き換える！ ▼▼▼
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxfW12_hD-NdcTSVndJX3mG0z31eHrfnsNE7ylwzOpXOxUaS8GhGb8BuE_6MrjdMBAZ/exec';
      const thanksPage = 'thanks.html';
      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // ボタン無効化（二重送信防止）
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';

      const formData = new FormData(form);

      fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors'})
        .then(response => {
          window.location.href = thanksPage;
        })
        .catch(error => {
          console.error('Error!', error.message);
          alert('送信エラーが発生しました。時間を置いて再度お試しください。');
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }
});