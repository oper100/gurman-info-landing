/* Власна тема Tailwind (CDN). Підключається ПІСЛЯ скрипта Tailwind.
   Кольори, шрифти й тіні посилаються на CSS-змінні з css/custom-styles.css, тому
   значення дизайн-системи ЛР №4 задано в одному місці.
   Усе, що є в стандартній шкалі Tailwind (відступи 4–64 px, радіуси 8/12/16/24 px,
   розміри тексту 12/14/16/18 px), не перевизначається. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-pressed": "var(--color-primary-pressed)",
        "on-primary": "var(--color-on-primary)",
        secondary: "var(--color-secondary)",
        "on-secondary": "var(--color-on-secondary)",
        accent: "var(--color-accent)",
        "accent-text": "var(--color-accent-text)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        line: "var(--color-line)",
        "line-subtle": "var(--color-line-subtle)",
        error: "var(--color-error)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      fontSize: {
        h1: ["3.5rem", { lineHeight: "4rem" }],
        "h1-compact": ["2.5rem", { lineHeight: "3rem" }],
        h2: ["2.5rem", { lineHeight: "3rem" }],
        "h2-compact": ["1.75rem", { lineHeight: "2.25rem" }],
        h3: ["1.75rem", { lineHeight: "2.25rem" }],
        logo: ["1.375rem", { lineHeight: "1.75rem" }],
        icon: ["2.5rem", { lineHeight: "1" }], /* піктограма Font Awesome в картці переваг */
      },
      borderWidth: {
        btn: "1.5px", /* рамка кнопок і полів форм */
      },
      aspectRatio: {
        card: "4 / 3", /* зображення карток пар */
        producer: "3 / 2", /* зображення карток виробників */
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(0.75rem)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both", /* поява картки результату в Hero */
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      maxWidth: {
        page: "90rem", /* 1200 px вмісту + 2 × 120 px полів */
      },
      spacing: {
        30: "7.5rem", /* поля контейнера на десктопі */
        hero: "26.25rem", /* висота ілюстрації Hero (420 px) */
      },
    },
  },
};
