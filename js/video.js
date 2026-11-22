/* Відео YouTube у секції «Як це працює»: автовідтворення без звуку, по колу, без панелі керування плеєра.
   Керування — власні кнопки «Пауза» і «Звук» (WCAG 2.2.2: рух довше 5 с має зупинятися користувачем).
   Команди плеєру надсилаються через postMessage (параметр enablejsapi=1 в адресі iframe).
   Якщо в системі ввімкнено prefers-reduced-motion, автовідтворення вимикається.
   Обкладинка закриває службову плашку YouTube (назва, канал), яка показується перші секунди після старту,
   і плавно зникає, коли плашка сховалась. */
(function () {
  "use strict";

  var box = document.querySelector("[data-video]");
  if (!box) return;

  var frame = box.querySelector("iframe");
  var toggle = box.querySelector("[data-video-toggle]");
  var sound = box.querySelector("[data-video-sound]");
  var cover = box.querySelector("[data-video-cover]");
  var revealed = false;
  var ready = false; // команди надсилаємо лише після сигналу готовності плеєра (інакше він кидає помилку в консоль)
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var playing = !reduceMotion;
  var muted = true;
  var pausedByScroll = false;

  // Адреса плеєра лежить у data-src; у src її підставляємо, коли відео наближається до екрана (економія трафіку першого екрана)
  var source = frame.getAttribute("data-src") || "";
  if (reduceMotion) source = source.replace("autoplay=1", "autoplay=0");

  function load() {
    if (!frame.getAttribute("src")) frame.setAttribute("src", source);
  }

  if ("IntersectionObserver" in window) {
    var loader = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        load();
        loader.disconnect();
      }
    }, { rootMargin: "300px" });
    loader.observe(box);
  } else {
    load();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    if (cover) cover.classList.add("opacity-0");
  }

  function send(func, args) {
    if (!ready || !frame.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: args || [] }), "*");
  }

  function paintToggle() {
    var icon = toggle.querySelector("i");
    toggle.setAttribute("aria-label", playing ? "Пауза" : "Відтворити");
    toggle.setAttribute("aria-pressed", playing ? "false" : "true");
    icon.className = "fa-solid " + (playing ? "fa-pause" : "fa-play") + " text-base";
  }

  function paintSound() {
    var icon = sound.querySelector("i");
    sound.setAttribute("aria-label", muted ? "Увімкнути звук" : "Вимкнути звук");
    sound.setAttribute("aria-pressed", muted ? "false" : "true");
    icon.className = "fa-solid " + (muted ? "fa-volume-xmark" : "fa-volume-high") + " text-base";
  }

  toggle.addEventListener("click", function () {
    playing = !playing;
    pausedByScroll = false;
    send(playing ? "playVideo" : "pauseVideo");
    paintToggle();
  });

  sound.addEventListener("click", function () {
    muted = !muted;
    if (muted) {
      send("mute");
    } else {
      send("unMute");
      send("setVolume", [100]);
    }
    paintSound();
  });

  // Підписка на події плеєра: кнопка «Пауза» лишається правдивою, навіть якщо користувач клікнув по самому відео
  frame.addEventListener("load", function () {
    if (frame.contentWindow) {
      frame.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
    }
    // Запасний варіант: якщо плеєр не повідомив про старт (автовідтворення заблоковано), обкладинку все одно знімаємо
    if (!reduceMotion) window.setTimeout(reveal, 9000);
  });

  window.addEventListener("message", function (event) {
    if (!frame.contentWindow || event.source !== frame.contentWindow || typeof event.data !== "string") return;
    var data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (data.event === "onReady" || data.event === "initialDelivery" || data.event === "infoDelivery" || data.event === "onStateChange") ready = true;
    var state = data.event === "onStateChange" ? data.info : data.info && data.info.playerState;
    if (state === 1 || state === 2) {
      playing = state === 1;
      paintToggle();
      if (state === 1) window.setTimeout(reveal, 3400);
    }
  });

  // Поза екраном відео ставимо на паузу (економія трафіку й уваги), повертаємо, якщо користувач сам не зупиняв
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (!visible && playing) {
        pausedByScroll = true;
        send("pauseVideo");
      } else if (visible && pausedByScroll) {
        pausedByScroll = false;
        send("playVideo");
      }
    }, { threshold: 0.25 }).observe(box);
  }

  paintToggle();
  paintSound();
})();
