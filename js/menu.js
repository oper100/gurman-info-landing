/* Мобільне меню (гамбургер).
   Мінімальний JS: перемикає клас hidden та атрибут aria-expanded.
   На екранах від lg навігація показується стилями (lg:block), а кнопка меню
   прихована (lg:hidden). */
(function () {
  "use strict";

  var menuButton = document.querySelector("[data-menu-toggle]");
  var nav = document.getElementById("site-nav");
  if (!menuButton || !nav) {
    return;
  }

  var openIcon = menuButton.querySelector("[data-icon-open]");
  var closeIcon = menuButton.querySelector("[data-icon-close]");

  function setMenu(expanded) {
    menuButton.setAttribute("aria-expanded", String(expanded));
    menuButton.setAttribute("aria-label", expanded ? "Закрити меню" : "Відкрити меню");
    nav.classList.toggle("hidden", !expanded);
    openIcon.classList.toggle("hidden", expanded);
    closeIcon.classList.toggle("hidden", !expanded);
  }

  menuButton.addEventListener("click", function () {
    var expanded = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(expanded);
    if (expanded) {
      // навігація в DOM стоїть перед кнопкою: переносимо фокус у відкрите меню
      var firstLink = nav.querySelector("a");
      if (firstLink) {
        firstLink.focus();
      }
    }
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a") && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });
})();
