/* Форма зворотного зв'язку (#feedbackForm): клієнтська валідація на Vanilla JavaScript.
   Правила: ім'я ≥ 2 літер, email за RegEx, телефон +380XXXXXXXXX, повідомлення ≥ 10 символів, згода обов'язкова.
   UI-стани поля: normal / focus (CSS :focus-visible) / error (червона рамка і підпис) / success (зелена рамка й позначка).
   Помилка не показується, доки користувач не взаємодіяв з полем: input -> blur (після введення) -> submit.
   Місце під підпис помилки зарезервоване в розмітці (min-h-5), тож поява помилки не зсуває макет і не «з'їдає» тап.
   Сервера немає: після успішної перевірки показується модальне вікно (імітація надсилання), форма очищається. */
(function () {
  "use strict";

  var form = document.getElementById("feedbackForm");
  if (!form) {
    return;
  }

  // ---------- Правила (RegEx і межі) ----------
  // email: локальна частина без крапок на краях і подвійних крапок; домен із міток без дефіса на краях; зона ≥ 2 літер
  var REGEX_EMAIL = /^[\w%+-]+(\.[\w%+-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
  var REGEX_PHONE = /^\+380\d{9}$/;
  var REGEX_NAME = /^\p{L}[\p{L}\s'’.-]{1,59}$/u; // починається з літери; літери, пробіл, апостроф, крапка, дефіс
  var MIN_LETTERS = 2;
  var MAX_NAME = 60;
  var MIN_MESSAGE = 10;

  // ---------- Елементи ----------
  var statusLine = document.getElementById("formStatus");
  var counter = document.getElementById("messageCounter");
  var submitBtn = document.getElementById("submitBtn");
  var overlay = document.getElementById("successModal");
  var closeBtn = document.getElementById("closeModalBtn");

  var fields = {
    name: { input: document.getElementById("username"), error: document.getElementById("nameError"), check: checkName },
    email: { input: document.getElementById("email"), error: document.getElementById("emailError"), check: checkEmail },
    phone: { input: document.getElementById("phone"), error: document.getElementById("phoneError"), check: checkPhone },
    message: { input: document.getElementById("message"), error: document.getElementById("messageError"), check: checkMessage },
    agreement: { input: document.getElementById("agreement"), error: document.getElementById("agreementError"), check: checkAgreement }
  };
  var order = ["name", "email", "phone", "message", "agreement"];
  var STATE_CLASSES = ["border-line", "border-error", "border-secondary"];

  // ---------- Правила окремими функціями: повертають текст помилки (короткий, в один рядок) або порожній рядок ----------
  function checkName(value) {
    var v = value.normalize("NFC").trim(); // NFC: «й», вставлене як «и» + позначка, вважається однією літерою
    var letters = (v.match(/\p{L}/gu) || []).length;
    if (letters < MIN_LETTERS) {
      return "Мінімум 2 літери.";
    }
    if (v.length > MAX_NAME) {
      return "Не більше 60 символів.";
    }
    if (!REGEX_NAME.test(v)) {
      return "Лише літери, пробіл, ' та -.";
    }
    return "";
  }

  function checkEmail(value) {
    return REGEX_EMAIL.test(value.trim()) ? "" : "Введіть коректний email.";
  }

  function checkPhone(value) {
    return REGEX_PHONE.test(value.trim()) ? "" : "Формат: +380XXXXXXXXX";
  }

  function checkMessage(value) {
    // Array.from рахує символи Unicode (емодзі — один символ), а не одиниці UTF-16
    return Array.from(value.trim()).length >= MIN_MESSAGE ? "" : "Мінімум 10 символів.";
  }

  function checkAgreement(_value, input) {
    return input.checked ? "" : "Потрібна згода з політикою.";
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
    input.parentElement.querySelectorAll("[data-icon]").forEach(function (icon) {
      icon.classList.toggle("hidden", icon.getAttribute("data-icon") !== kind);
    });
  }

  function showError(field, message) {
    setBorder(field.input, "border-error");
    setIcon(field.input, "error");
    field.input.setAttribute("aria-invalid", "true");
    field.error.textContent = message;
  }

  function showSuccess(field) {
    setBorder(field.input, "border-secondary");
    setIcon(field.input, "success");
    field.input.setAttribute("aria-invalid", "false");
    field.error.textContent = "";
  }

  function clearError(field) {
    setBorder(field.input, "border-line");
    setIcon(field.input, "none");
    field.input.setAttribute("aria-invalid", "false");
    field.error.textContent = "";
  }

  function invalidKeys() {
    return order.filter(function (key) {
      var f = fields[key];
      return f.check(f.input.value, f.input) !== "";
    });
  }

  // Рядок-підсумок після невдалого submit не застаріває: оновлюється, поки користувач виправляє поля
  function refreshStatus() {
    if (!statusLine.textContent) {
      return;
    }
    var n = invalidKeys().length;
    statusLine.textContent = n > 0 ? "Форму не надіслано: виправте поля з помилками (" + n + ")." : "";
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
  // 1) прибираємо літери, пробіли, дужки, дефіси; 2) «+» лише на початку; 3) 0XXXXXXXXX і +0XXXXXXXXX -> +380XXXXXXXXX;
  // 4) 380XXXXXXXXX і 80XXXXXXXXX -> +380XXXXXXXXX; 5) не більше 13 символів (+380 і 9 цифр)
  function normalizePhone(raw) {
    var v = raw.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    if (v.indexOf("+0") === 0) {
      v = v.slice(1);
    }
    if (v.charAt(0) === "0") {
      v = "+38" + v;
    } else if (v.indexOf("380") === 0) {
      v = "+" + v;
    } else if (v.indexOf("80") === 0 && v.length > 2 && v.indexOf("+") === -1) {
      v = "+3" + v;
    }
    return v.slice(0, 13);
  }

  // Правка номера всередині рядка не відкидає курсор в кінець: позицію рахуємо за нормалізованою частиною до курсора
  function applyPhoneNormalization(input) {
    var raw = input.value;
    var normalized = normalizePhone(raw);
    if (normalized === raw) {
      return;
    }
    var caret = input.selectionStart === null ? raw.length : input.selectionStart;
    var newCaret = normalizePhone(raw.slice(0, caret)).length;
    input.value = normalized;
    if (document.activeElement === input) {
      input.setSelectionRange(newCaret, newCaret);
    }
  }

  // ---------- Динамічна валідація: input -> blur (після введення) -> submit ----------
  order.forEach(function (key) {
    var f = fields[key];
    f.touched = false;
    f.dirty = false;
    var eventName = f.input.type === "checkbox" ? "change" : "input";

    f.input.addEventListener(eventName, function () {
      f.dirty = true;
      if (key === "phone") {
        applyPhoneNormalization(f.input);
      }
      if (key === "message") {
        counter.textContent = f.input.value.length + " / " + f.input.maxLength;
      }
      if (f.touched) {
        validators[key]();
      } else {
        quietCheck(key);
      }
      refreshStatus();
    });

    f.input.addEventListener("blur", function () {
      if (!f.dirty && !f.touched) {
        return; // простий прохід Tab крізь порожнє поле помилки не показує
      }
      f.touched = true;
      validators[key]();
      refreshStatus();
    });
  });

  // ---------- Модальне вікно успіху (доступність: фокус, Esc, затемнення, повернення фокуса) ----------
  var lastFocused = null;
  var submitting = false;
  var openedAt = 0;
  var downOnOverlay = false;
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
    overlay.scrollTop = 0;
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

  // Клік по затемненню закриває вікно, а клік усередині білої картки — ні (target має бути сам оверлей),
  // причому й натискання кнопки миші мало початися на оверлеї: виділення тексту в картці з відпусканням на фоні не закриває вікно
  overlay.addEventListener("mousedown", function (event) {
    downOnOverlay = event.target === overlay;
  });
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay && downOnOverlay) {
      closeModalSafely();
    }
    downOnOverlay = false;
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
  // Клік мишею/тапом по «Надіслати» не знімає фокус з поля: інакше blur міг би показати помилку раніше за click.
  // Перевірку всіх полів усе одно виконує submit.
  submitBtn.addEventListener("mousedown", function (event) {
    event.preventDefault();
  });

  function resetStates() {
    order.forEach(function (key) {
      fields[key].touched = false;
      fields[key].dirty = false;
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
