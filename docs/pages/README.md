# GitHub Pages (Support + Privacy)

Статичні сторінки для **App Store Connect** (Support URL, Privacy Policy URL).

## Увімкнути Pages (один раз)

1. [github.com/IulianaIagodka/pulsation_mvp_v3](https://github.com/IulianaIagodka/pulsation_mvp_v3) → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **master**, Folder: **/docs**
4. **Save** — через 1–3 хв сайт буде live

Файл `docs/.nojekyll` вимикає Jekyll, щоб HTML віддавались як є.

## URL для App Store Connect

Після публікації (репозиторій `IulianaIagodka/pulsation_mvp_v3`):

| Поле | URL |
|------|-----|
| **Support URL** | `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/support.html` |
| **Privacy Policy URL** | `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html` |
| Головна (опційно) | `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/` |

Якщо GitHub показує інший username у Pages — підстав свій з **Settings → Pages**.

## Змінити email

Заміни `support@pulsation.app` у:

- `docs/pages/support.html`
- `docs/pages/privacy.html`
- `docs/privacy-policy.md`

Потім commit + push; Pages оновиться за хвилину.

## Локальний перегляд

Відкри `docs/pages/support.html` у браузері (подвійний клік) або:

```bash
cd docs/pages && python3 -m http.server 8765
```

→ http://localhost:8765/support.html
