/* Форма зворотного зв'язку (#feedbackForm): клієнтська валідація на Vanilla JavaScript.
   Правила: ім'я ≥ 2 символів (літери, пробіл, апостроф, дефіс), email за RegEx, телефон +380XXXXXXXXX,
   повідомлення ≥ 10 символів, згода обов'язкова.
   UI-стани поля: normal / focus (CSS :focus-visible) / error (червона рамка і підпис) / success (зелена рамка й позначка).
   Помилка не показується, доки користувач не взаємодіяв з полем: input -> blur -> submit.
   Сервера немає: після успішної перевірки показується модальне вікно (імітація надсилання), форма очищається. */
(function () {
  "use strict";

  var form = document.getElementById("feedbackForm");
  if (!form) {
    return;
  }

  // ---------- Правила (RegEx і межі) ----------
  var REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  var REGEX_PHONE = /^\+380\d{9}$/;
  var REGEX_NAME = /^\p{L}[\p{L}\s'’.-]{1,59}$/u; // починається з літери; літери, пробіл, апостроф, крапка, дефіс
  var MIN_MESSAGE = 10;

  // ---------- Елементи ----------
  var statusLine = document.getElementById("formStatus");
  var counter = document.getElementById("messageCounter");
  var submitBtn = document.getElementById("submitBtn");
  var overlay = document.getElementById("successModal");
  var closeBtn = document.getElementById("closeModalBtn");
  var dialog = overlay.querySelector("[role=dialog]");

  var fields = {
    name: { input: document.getElementById("username"), error: document.getElementById("nameError"), check: checkName },
    email: { input: document.getElementById("email"), error: document.getElementById("emailError"), check: checkEmail },
    phone: { input: document.getElementById("phone"), error: document.getElementById("phoneError"), check: checkPhone },
    message: { input: document.getElementById("message"), error: document.getElementById("messageError"), check: checkMessage },
    agreement: { input: document.getElementById("agreement"), error: document.getElementById("agreementError"), check: checkAgreement }
  };
  var order = ["name", "email", "phone", "message", "agreement"];
  var STATE_CLASSES = ["border-line", "border-error", "border-secondary"];

  // ---------- Правила окремими функціями: повертають текст помилки або порожній рядок ----------
  function checkName(value) {
    var v = value.trim();
    if (v.length < 2) {
      return "Ім'я повинно містити не менше 2 символів.";
    }
    if (v.length > 60) {
      return "Ім'я не повинно перевищувати 60 символів.";
    }
    if (!REGEX_NAME.test(v)) {
      return "Ім'я може містити лише літери, пробіл, апостроф і дефіс.";
    }
    return "";
  }

  function checkEmail(value) {
    return REGEX_EMAIL.test(value.trim()) ? "" : "Введіть коректну електронну адресу (наприклад: user@mail.com).";
  }

  function checkPhone(value) {
    return REGEX_PHONE.test(value.trim()) ? "" : "Формат має бути строго українським: +380XXXXXXXXX.";
  }

  function checkMessage(value) {
    return value.trim().length >= MIN_MESSAGE ? "" : "Повідомлення повинно містити не менше " + MIN_MESSAGE + " символів.";
  }

  function checkAgreement(_value, input) {
    return input.checked ? "" : "Підтвердьте згоду з політикою конфіденційності.";
  }

  // ---------- UI-стани: showError / showSuccess / clearError ----------
  function setBorder(input, stateClass) {
    if (input.type === "checkbox") {
      return;
    }
    STATE_CLASSES.forEach(function (c) { input.classList.remove(c); });
    input.classList.add(stateClass);
  }

  function setIcon(input, kind) {
    var wrap = input.parentElement;
    wrap.querySelectorAll("[data-icon]").forEach(function (icon) {
      icon.classList.toggle("hidden", icon.getAttribute("data-icon") !== kind);
    });
  }

  function showError(field, message) {
    setBorder(field.input, "border-error");
    setIcon(field.input, "error");
    field.input.setAttribute("aria-invalid", "true");
    field.error.textContent = message;
    field.error.classList.remove("hidden");
  }

  function showSuccess(field) {
    setBorder(field.input, "border-secondary");
    setIcon(field.input, "success");
    field.input.setAttribute("aria-invalid", "false");
    field.error.textContent = "";
    field.error.classList.add("hidden");
  }

  function clearError(field) {
    setBorder(field.input, "border-line");
    setIcon(field.input, "none");
    field.input.setAttribute("aria-invalid", "false");
    field.error.textContent = "";
    field.error.classList.add("hidden");
  }

  // Повна перевірка поля: показує помилку або успіх
  function validate(key) {
    var f = fields[key];
    var message = f.check(f.input.value, f.input);
    if (message) {
      showError(f, message);
      return false;
    }
    showSuccess(f);
    return true;
  }

  function validateName() { return validate("name"); }
  function validateEmail() { return validate("email"); }
  function validatePhone() { return validate("phone"); }
  function validateMessage() { return validate("message"); }
  function validateAgreement() { return validate("agreement"); }
  var validators = { name: validateName, email: validateEmail, phone: validatePhone, message: validateMessage, agreement: validateAgreement };

  // «Тиха» перевірка під час першого введення: успіх показуємо, помилку — ні
  function quietCheck(key) {
    var f = fields[key];
    if (f.check(f.input.value, f.input)) {
      clearError(f);
    } else {
      showSuccess(f);
    }
  }

  // ---------- Телефон: безпечна UX-логіка (не блокуємо агресивно, змінюємо лише зрозумілі речі) ----------
  // 1) прибираємо літери, пробіли, дужки, дефіси; 2) «+» лише на початку; 3) 0XXXXXXXXX -> +380XXXXXXXXX;
  // 4) 380XXXXXXXXX -> +380XXXXXXXXX; 5) не більше 13 символів (+380 і 9 цифр)
  function normalizePhone(raw) {
    var v = raw.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    if (v.charAt(0) === "0") {
      v = "+38" + v;
    } else if (v.indexOf("380") === 0) {
      v = "+" + v;
    }
    return v.slice(0, 13);
  }

  // ---------- Динамічна валідація: input -> blur -> submit ----------
  order.forEach(function (key) {
    var f = fields[key];
    f.touched = false;
    var eventName = f.input.type === "checkbox" ? "change" : "input";

    f.input.addEventListener(eventName, function () {
      if (key === "phone") {
        var normalized = normalizePhone(f.input.value);
        if (normalized !== f.input.value) {
          f.input.value = normalized;
        }
      }
      if (key === "message") {
        counter.textContent = f.input.value.length + " / " + f.input.maxLength;
      }
      if (f.touched) {
        validators[key]();
      } else {
        quietCheck(key);
      }
    });

    f.input.addEventListener("blur", function () {
      f.touched = true;
      validators[key]();
    });
  });

  // ---------- Модальне вікно успіху (доступність: фокус, Esc, затемнення, повернення фокуса) ----------
  var lastFocused = null;
  var submitting = false;
  var openedAt = 0;
  var CLOSE_DELAY = 400; // мс: захист від випадкового закриття подвійним кліком або затиснутим Enter

  function setBackgroundInert(isInert) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== overlay && el.tagName !== "SCRIPT") {
        el.inert = isInert;
      }
    });
  }

  function openModal() {
    lastFocused = submitBtn; // після закриття фокус повертається на кнопку, що відкрила вікно
    openedAt = Date.now();
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    document.body.classList.add("overflow-hidden"); // прокрутка сторінки під вікном вимкнена
    setBackgroundInert(true); // фокус і кліки не потрапляють на контент під вікном
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("flex");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    setBackgroundInert(false);
    submitting = false;
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function isModalOpen() {
    return !overlay.classList.contains("hidden");
  }

  function closeModalSafely() {
    if (Date.now() - openedAt >= CLOSE_DELAY) {
      closeModal();
    }
  }

  closeBtn.addEventListener("click", closeModalSafely);

  // Клік по затемненню закриває вікно, а клік усередині білої картки — ні (перевіряємо, що target — сам оверлей)
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeModalSafely();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!isModalOpen()) {
      return;
    }
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "Tab") {
      // у вікні одна кнопка: утримуємо фокус на ній
      event.preventDefault();
      closeBtn.focus();
    }
  });

  // ---------- Submit ----------
  // Клік мишею/тапом по «Надіслати» не знімає фокус з поля: інакше blur показав би помилку, кнопка зсунулась би вниз
  // і клік не дійшов би до неї. Перевірку всіх полів усе одно виконує submit.
  submitBtn.addEventListener("mousedown", function (event) {
    event.preventDefault();
  });

  function resetStates() {
    order.forEach(function (key) {
      fields[key].touched = false;
      clearError(fields[key]);
    });
    counter.textContent = "0 / " + fields.message.input.maxLength;
    statusLine.textContent = "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // сторінка не перезавантажується
    if (submitting) {
      return; // швидке повторне натискання не відкриває друге вікно
    }

    var invalid = order.filter(function (key) {
      fields[key].touched = true;
      return !validators[key]();
    });

    if (invalid.length > 0) {
      statusLine.textContent = "Форму не надіслано: виправте поля з помилками (" + invalid.length + ").";
      fields[invalid[0]].input.focus(); // фокус на першому полі з помилкою
      return;
    }

    submitting = true;
    form.reset(); // очищаємо поля до показу вікна
    resetStates();
    openModal();
  });

  // Для автоматичних тестів: правила доступні лише для читання
  window.FeedbackForm = Object.freeze({
    REGEX_EMAIL: REGEX_EMAIL,
    REGEX_PHONE: REGEX_PHONE,
    checkName: checkName,
    checkEmail: checkEmail,
    checkPhone: checkPhone,
    checkMessage: checkMessage,
    normalizePhone: normalizePhone
  });
})();
