# Гурман-Інфо

Адаптивний лендинг сервісу **«Гурман-Інфо»**: підбір гастрономічних пар «сир + вино» з відсотком збігу та поясненням, чому пара працює. Каталог українських крафтових сирів і вин, пошук у два боки («Сир → Вино» і «Вино → Сир»), підписка на розсилку.

**Живі версії**

- GitHub Pages: <https://oper100.github.io/gurman-info-landing/>
- Netlify: <https://magnificent-pavlova-0ef064.netlify.app/>

![Десктопна версія](docs/screenshots/desktop.webp)

<img src="docs/screenshots/mobile.webp" alt="Мобільна версія" width="280">

## Технології

- HTML5 із семантичною розміткою (`header`, `nav`, `main`, `section`, `aside`, `footer`)
- Tailwind CSS 3.4 (режим Play CDN) і власні токени дизайн-системи в `css/custom-styles.css`
- Нативний JavaScript без бібліотек: меню, підбір пари, перевірка форми, керування відео
- Вбудовування: відео YouTube (`iframe`), Google Maps, віджет погоди Meteoblue
- Шрифти Playfair Display та Inter (Google Fonts), піктограми Font Awesome

## Запуск локально

Збирати нічого не потрібно: сторінка статична.

```bash
git clone https://github.com/oper100/gurman-info-landing.git
cd gurman-info-landing
# варіант 1: відкрити index.html у браузері
# варіант 2: локальний сервер
python -m http.server 8000
```

Після цього відкрийте <http://localhost:8000/>.

## Структура проєкту

```text
index.html          головна сторінка
privacy.html        політика конфіденційності
css/                токени дизайн-системи, фокус, <progress>
js/                 тема Tailwind, меню, підбір і форми, відео
assets/             зображення (WebP), піктограми, логотип
docs/screenshots/   знімки для README
```

## Автор

Федунів Б. М., група ПП-24, НУ «Львівська політехніка». Проєкт створено в межах курсу «Технології веб-розробки та дизайну» (лабораторні роботи №7 і №8).
