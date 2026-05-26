# Pulsation — план до TestFlight → App Store

Статус: TestFlight на телефоні ✅  
Іконка в `assets/` згенерована (`npm run generate:icon`) ✅  
Далі: **новий build з іконкою**, **скріншоти**, **metadata в Connect**, **реліз у Store**.

---

## Фаза A — Іконка застосунку

### A1. Дизайн (готово)

- [x] Іконка = ті самі кільця, що `SpiralFocus` (скрипт `npm run generate:icon`)
- [x] **1024×1024** PNG у `assets/icon.png`

### A2. Файли в проєкті

| Файл | Статус |
|------|--------|
| `assets/icon.png` | ✅ |
| `assets/adaptive-icon.png` | ✅ |
| `assets/splash-icon.png` | ✅ |
| `assets/favicon.png` | ✅ |
| `assets/icon.svg` | ✅ вихідник |

- [x] `app.json` → `expo.icon` → `./assets/icon.png`

### A3. Новий білд після іконки

Іконка в TestFlight **не оновиться**, поки не збереш новий build:

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm run build:ios:testflight
npm run submit:ios:testflight
```

- [ ] Build успішний на expo.dev
- [ ] Submit успішний
- [ ] У TestFlight встановлено **новий** build
- [ ] На iPhone іконка оновилась (інколи кеш — видалити апку й поставити знову)

---

## Фаза B — Скріншоти для App Store Connect

### B1. Які розміри потрібні (мінімум для старту)

**iPhone (обов’язково)** — знімай на **найбільшому iPhone** (симулятор або телефон):

| Пристрій у Connect | Розмір (px) | Як зняти |
|--------------------|-------------|----------|
| **6.7" Display** (iPhone 15 Pro Max / 16 Pro Max) | **1290 × 2796** | Симулятор → Cmd+S, або скрін з телефона |

**iPad** — лише якщо лишаєш `supportsTablet: true` в `app.json`:

| Пристрій | Розмір (px) |
|----------|-------------|
| 12.9" iPad Pro | 2048 × 2732 |

Для **першого релізу** часто достатньо **тільки 6.7" iPhone** (5–6 скрінів).

### B2. Які екрани зняти (рекомендований набір)

Порядок у App Store (зверху вниз):

1. [ ] **Онбординг** — спіраль + «Pulsation існує, щоб повертати тебе до себе»
2. [ ] **Trigger** — «Одна дія для тебе зараз?»
3. [ ] **Action** — одна з дій (напр. дихання / стопи на підлозі)
4. [ ] **Explanation** — коротке пояснення після дії
5. [ ] **About** (опційно) — «Про застосунок»
6. [ ] **Return** (опційно) — екран повернення

Поради:
- Темна тема, без статус-бару з часом/батареєю (симулятор: Hide status bar або чистий скрін)
- Одна мова на всіх скрінах (UK **або** EN — краще окремий набір для кожної локалі в Connect)

### B3. Як зняти на симуляторі (Mac)

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm run start
# натисни i → iPhone 16 Pro Max (або найбільший)
```

- [ ] Відкрити кожен екран
- [ ] **Cmd + S** — збереження скріна на Desktop
- [ ] Перейменувати файли: `01-onboarding.png`, `02-trigger.png`, …

### B4. Завантажити в App Store Connect

1. [ ] https://appstoreconnect.apple.com → **Pulsation**
2. [ ] **App Store** (не TestFlight) → версія **1.0.0**
3. [ ] **Screenshots** → **6.7" Display**
4. [ ] Перетягнути 3–6 PNG
5. [ ] (Опційно) Дублювати для **Ukrainian** / **English** локалей

TestFlight **не вимагає** скрінів; вони потрібні для **публікації в App Store** і для **External TestFlight** (інколи).

---

## Фаза C — Metadata та юридичне (App Store)

Тексти готові в репо — лишається вставити в Connect.

### C1. Тексти

- [ ] **Name:** Pulsation
- [ ] **Subtitle** — з `docs/app-store-metadata.md`
- [ ] **Description** — EN + UK (окремі локалі)
- [ ] **Keywords**
- [ ] **Promotional Text** / **What’s New 1.0.0**

### C2. URLs

- [ ] **Privacy Policy URL** — опублікувати `docs/privacy-policy.md` (Notion / GitHub Pages / сайт)
- [ ] **Support URL** — email або сторінка контакту

### C3. App Privacy (Connect)

- [ ] Заповнити анкету **App Privacy** (дані локально, без трекінгу — як у політиці)
- [ ] **Age Rating** questionnaire
- [ ] **Category:** Health & Fitness (+ Lifestyle)

### C4. App Review

- [ ] **Review Notes** — з `docs/app-store-metadata.md`
- [ ] Вказати: login не потрібен, test account не потрібен

---

## Фаза D — TestFlight (продовження)

- [ ] Пройти флоу на телефоні, список багів/текстів
- [ ] Internal testers (1–3 людини) — email Apple ID
- [ ] Після кожної правки в коді → новий `build` + `submit`

Деталі: `docs/TESTFLIGHT.md`

---

## Фаза E — Публікація в App Store (фінал)

- [ ] Усі пункти A + B + C виконані
- [ ] Останній build з **новою іконкою** прив’язаний до версії 1.0.0
- [ ] **Submit for Review**
- [ ] **Manual release** (рекомендовано для 1.0)
- [ ] Після approve → **Release**

---

## Хто що робить

| Задача | Хто |
|--------|-----|
| Дизайн іконки 1024×1024 | Ти / дизайнер |
| Заміна `assets/*.png` | Ти (або я в репо, якщо даси файл) |
| Скріншоти з симулятора/телефона | Ти |
| Завантаження в App Store Connect | Ти |
| Тексти metadata | Скопіювати з `docs/app-store-metadata.md` |
| Privacy на URL | Ти (хостинг сторінки) |
| `npm run build/submit` | Ти в терміналі |
| Правки коду / баги | Я в Cursor + ти тестуєш |

---

## Швидкий порядок «що робити завтра»

1. [ ] Замовити/зробити іконку 1024×1024  
2. [ ] Покласти в `assets/` → новий TestFlight build  
3. [ ] Зняти 5 скрінів на iPhone 6.7"  
4. [ ] Опублікувати Privacy Policy URL  
5. [ ] Заповнити App Store сторінку в Connect  
6. [ ] Submit for Review  

---

## Корисні файли в репо

- `docs/TESTFLIGHT.md` — білди та submit
- `docs/app-store-metadata.md` — опис EN/UK
- `docs/privacy-policy.md` — політика конфіденційності
- `app.json` — bundle id, version, icon paths
