/* ============================================================
   Математическая приёмка ТЗ — логика лендинга
   ============================================================ */

// Сюда на Этапе 5 подставим URL опубликованного Google Apps Script.
const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzkZoc3mvSmdnhNuzTpVy3zGbYT32TQx7GDobrC3gss8dBKUEl64ViAC6V2RCQHBdmHCQ/exec";

/* ------------------------------------------------------------
   Резервная копия данных (если data.json не загрузится по file://)
   ------------------------------------------------------------ */
const FALLBACK_DATA = {
  pain_points: [
    { title: "Срыв сроков CAPEX", text: "Возврат ТЗ на доработку сдвигает весь график модернизации." },
    { title: "Лишние затраты", text: "Переделка модели и повторная экспертиза оплачиваются из бюджета проекта." },
    { title: "Личная ответственность", text: "Решение о запуске разработки подписывает главный инженер, а не подрядчик." }
  ],
  workshop_steps: [
    { step: 1, title: "Разбор ТЗ заказчика", text: "Берём реальное техническое задание на цифровой двойник." },
    { step: 2, title: "Проверка совместности", text: "Ранги матриц, теорема Кронекера–Капелли." },
    { step: 3, title: "Проверка единственности и устойчивости", text: "Выявляем вырожденные уравнения и неединственные решения." },
    { step: 4, title: "Проверка критерия эффективности", text: "Критерий Сильвестра, главные миноры, знакоопределённость." }
  ],
  formats: [
    {
      id: "pilot",
      name: "Пилотный аудит одного ТЗ",
      description: "Предварительный математический скрининг одного технического задания. Показываем, есть ли риски совместности, единственности и знакоопределённости.",
      duration: "до 4 академических часов",
      result: "Заключение по одному ТЗ + рекомендация: идти ли на полный воркшоп",
      cta: "Запросить пилот"
    },
    {
      id: "corporate",
      name: "Корпоративный воркшоп на площадке заказчика",
      description: "Полный интенсив на 16 академических часов с разбором ТЗ вашего предприятия и передачей контрольного листа и регламента приёмки.",
      duration: "16 академических часов",
      result: "Контрольный лист и регламент математической приёмки ТЗ",
      cta: "Обсудить воркшоп"
    },
    {
      id: "remote",
      name: "Дистанционный формат",
      description: "Тот же воркшоп в онлайн-формате для распределённых инженерных команд. Разбор ТЗ и передача документов приёмки.",
      duration: "16 академических часов",
      result: "Контрольный лист и регламент + запись сессий",
      cta: "Обсудить онлайн-формат"
    }
  ]
};

/* ------------------------------------------------------------
   Утилиты
   ------------------------------------------------------------ */
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------
   Рендер блоков из данных
   ------------------------------------------------------------ */
function renderPainPoints(items) {
  const grid = document.getElementById("pain-grid");
  if (!grid || !items) return;
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = el("article", "pain-card");
    card.appendChild(el("h3", "", escapeHtml(item.title)));
    card.appendChild(el("p", "", escapeHtml(item.text)));
    grid.appendChild(card);
  });
}

function renderWorkshopSteps(items) {
  const list = document.getElementById("workshop-steps");
  if (!list || !items) return;
  list.innerHTML = "";
  items.forEach((item) => {
    const li = el("li", "step-item");
    const num = el("div", "step-number", escapeHtml(item.step));
    const body = el("div", "step-body");
    body.appendChild(el("h3", "", escapeHtml(item.title)));
    body.appendChild(el("p", "", escapeHtml(item.text)));
    li.appendChild(num);
    li.appendChild(body);
    list.appendChild(li);
  });
}

function renderFormats(items) {
  const grid = document.getElementById("formats-grid");
  if (!grid || !items) return;
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = el("article", "format-card");
    card.appendChild(el("h3", "", escapeHtml(item.name)));
    card.appendChild(el("span", "format-duration", escapeHtml(item.duration)));
    card.appendChild(el("p", "", escapeHtml(item.description)));
    card.appendChild(el("p", "format-result", "<strong>Результат:</strong> " + escapeHtml(item.result)));
    const btn = el("a", "btn btn-primary", escapeHtml(item.cta));
    btn.href = "#contacts";
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

/* ------------------------------------------------------------
   Загрузка данных
   ------------------------------------------------------------ */
async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("data.json недоступен");
    return await res.json();
  } catch (err) {
    console.warn("Используем встроенные данные (data.json не загрузился).", err);
    return FALLBACK_DATA;
  }
}

/* ------------------------------------------------------------
   Мобильное меню (бургер)
   ------------------------------------------------------------ */
function initBurger() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".main-nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

/* ------------------------------------------------------------
   Форма заявки
   ------------------------------------------------------------ */
function initForm() {
  const form = document.getElementById("lead-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.className = "form-status";

    const company = form.company.value.trim();
    const position = form.position.value.trim();
    const contact = form.contact.value.trim();
    const task = form.task.value.trim();

    if (!company || !position || !contact) {
      status.textContent = "Заполните предприятие, должность и контакт.";
      status.classList.add("is-error");
      return;
    }

    // Пока сервер не подключён — работаем в тестовом режиме.
    if (!LEAD_ENDPOINT) {
      status.textContent = "Форма работает в тестовом режиме. Заявка принята (без отправки на сервер).";
      status.classList.add("is-success");
      form.reset();
      return;
    }

    status.textContent = "Отправляем заявку…";

    try {
      // ИСПОЛЬЗУЕМ URLSearchParams, чтобы Google Таблицы правильно прочитали поля
      const formData = new URLSearchParams();
      formData.append("company", company);
      formData.append("position", position);
      formData.append("contact", contact);
      formData.append("task", task);

      await fetch(LEAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      status.textContent = "Заявка отправлена. Мы свяжемся с вами.";
      status.classList.add("is-success");
      form.reset();
    } catch (err) {
      console.error("Ошибка отправки формы:", err);
      status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.";
      status.classList.add("is-error");
    }
  });
}

/* ------------------------------------------------------------
   Инициализация
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  initBurger();
  initForm();

  const data = await loadData();
  renderPainPoints(data.pain_points);
  renderWorkshopSteps(data.workshop_steps);
  renderFormats(data.formats);
});