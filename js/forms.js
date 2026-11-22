/* Форми лендингу: підписка на розсилку (конверсійна дія) і підбір пари.
   Дані пар читаються з JSON-блоку #pairs-data у index.html. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
  }

  // ---------- Підписка: перевірка e-mail і згоди, повідомлення про помилку / успіх у live-регіонах ----------
  var subscribe = document.querySelector("[data-subscribe-form]");
  if (subscribe) {
    var email = subscribe.querySelector("#subscribe-email");
    var consent = subscribe.querySelector("#subscribe-consent");
    var error = subscribe.querySelector("#subscribe-error");
    var status = subscribe.querySelector("#subscribe-status");
    var successText = "Дякуємо! Ви підписані на розсилку «Гурман-Інфо».";

    subscribe.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = "";
      var field = null;

      if (!email.checkValidity()) {
        message = "Перевірте адресу, наприклад name@example.com";
        field = email;
      } else if (!consent.checked) {
        message = "Підтвердіть згоду на обробку даних";
        field = consent;
      }

      email.setAttribute("aria-invalid", String(field === email));
      consent.setAttribute("aria-invalid", String(field === consent));
      status.textContent = "";
      if (field) {
        error.textContent = message;
        field.focus();
        return;
      }

      error.textContent = "";
      status.textContent = successText;
      subscribe.reset();
    });
  }

  // ---------- Підбір пари: режим «сир / вино», чипи, пошук у даних, результат ----------
  var pairing = document.querySelector("[data-pairing-form]");
  var dataNode = document.getElementById("pairs-data");
  if (!pairing || !dataNode) {
    return;
  }

  var pairs = JSON.parse(dataNode.textContent);
  var label = pairing.querySelector("[data-pair-label]");
  var input = pairing.querySelector("[data-pair-input]");
  var chipLists = pairing.querySelectorAll("[data-chips]");
  var resultTitle = document.querySelector("[data-result-title]");
  var statusLine = document.getElementById("pair-status");
  var results = document.getElementById("pair-results");
  var defaultResults = results.innerHTML;
  var defaultTitle = resultTitle.textContent;
  var texts = {
    cheese: { label: "Назва сиру", placeholder: "Наприклад, Брі" },
    wine: { label: "Назва вина", placeholder: "Наприклад, Шардоне" }
  };

  function currentMode() {
    return pairing.querySelector("[name=mode]:checked").value;
  }

  function setMode(mode) {
    pairing.querySelector("#mode-" + mode).checked = true;
    label.textContent = texts[mode].label;
    input.placeholder = texts[mode].placeholder;
    chipLists.forEach(function (list) {
      var visible = list.getAttribute("data-chips") === mode;
      list.classList.toggle("hidden", !visible);
      list.classList.toggle("flex", visible);
    });
  }

  function search(query, mode) {
    var q = query.trim().toLowerCase();
    return pairs
      .filter(function (pair) {
        var name = pair[mode];
        return q.length > 0 && (name.indexOf(q) !== -1 || q.indexOf(name) !== -1);
      })
      .sort(function (a, b) { return b.pct - a.pct; })
      .slice(0, 3);
  }

  function render(found, query, mode) {
    results.querySelectorAll("li").forEach(function (item) { item.remove(); });
    if (found.length === 0) {
      resultTitle.textContent = "Пар для «" + query.trim() + "» поки немає";
      statusLine.textContent = "Спробуйте: " + (mode === "cheese" ? "Брі, Гауда, Бринза" : "Шардоне, Рислінг, Токай") + ". У каталозі зараз " + pairs.length + " пар.";
      return;
    }
    found.forEach(function (pair) {
      var template = document.getElementById("pair-card-template");
      var card = template.content.cloneNode(true);
      var img = card.querySelector("[data-pair-img]");
      img.src = "assets/images/" + pair.img + ".webp";
      img.alt = pair.alt;
      card.querySelector("[data-pair-title]").textContent = pair.title;
      card.querySelector("[data-pair-pct]").textContent = pair.pct + "% збіг";
      card.querySelector("[data-pair-text]").textContent = pair.text;
      card.querySelector("[data-pair-sr]").textContent = ": " + pair.title;
      results.insertBefore(card, template);
    });
    resultTitle.textContent = "Результат для «" + query.trim() + "»";
    statusLine.textContent = "Знайдено пар: " + found.length + ".";
  }

  function run(query, mode) {
    render(search(query, mode), query, mode);
  }

  pairing.addEventListener("change", function (event) {
    if (event.target.name !== "mode") {
      return;
    }
    setMode(event.target.value);
    input.value = "";
    // результати попереднього режиму не залишаємо: повертаємо приклад
    results.innerHTML = defaultResults;
    resultTitle.textContent = defaultTitle;
    statusLine.textContent = "";
  });

  pairing.addEventListener("click", function (event) {
    var chip = event.target.closest("[data-fill]");
    if (chip) {
      input.value = chip.textContent.trim();
      run(input.value, currentMode());
      input.focus();
    }
  });

  pairing.addEventListener("submit", function (event) {
    event.preventDefault();
    if (input.value.trim() === "") {
      statusLine.textContent = "Введіть назву або оберіть чип.";
      input.focus();
      return;
    }
    run(input.value, currentMode());
    scrollToElement(resultTitle);
    resultTitle.focus({ preventScroll: true });
  });

  // Кнопки «Спробувати цю пару» в картках: підставляють назву сиру і показують результат
  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-pair]");
    if (!link) {
      return;
    }
    event.preventDefault();
    setMode("cheese");
    input.value = link.getAttribute("data-pair");
    run(input.value, "cheese");
    scrollToElement(resultTitle);
    resultTitle.focus({ preventScroll: true });
  });
})();
