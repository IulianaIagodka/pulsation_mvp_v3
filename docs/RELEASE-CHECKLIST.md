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

- [x] Build успішний на expo.dev (build 17)
- [x] Submit успішний (ASC App ID `6773324495`)
- [ ] У TestFlight встановлено **новий** build
- [ ] На iPhone іконка оновилась (інколи кеш — видалити апку й поставити знову)

---

## Фаза B — Скріншоти для App Store Connect

### B1. Які розміри потрібні (мінімум для старту)

**Важливо:** TestFlight лише ставить апку на пристрій. **Розмір скріна задає симулятор або модель iPhone**, а не TestFlight і не тип збірки.

У **App Store Connect** різні слоти приймають **різні** пікселі. Якщо помилка каже, що допустимо лише **1242 × 2688** або **1284 × 2778** — скрини з **iPhone 16 Pro Max** (**1290 × 2796**) у **це поле не підійдуть** (навіть із симулятора).

**Надійний варіант для слота з помилкою 1242 / 1284** — зняти **`Cmd + S`** у симуляторі так:

| Потрібний розмір (портрет) | Симулятор (приклад) |
|---------------------------|----------------------|
| **1284 × 2778** | **iPhone 14 Pro Max** або **13 Pro Max** |
| **1242 × 2688** | **iPhone 11 Pro Max** або **XS Max** |

Якщо у формі є **окремий** блок **6.7" Display** під **1290 × 2796** — можна використати **15 / 16 Pro Max** і той самий `Cmd + S`.

**Перевірка перед завантаженням** (у Terminal на Mac):

```bash
sips -g pixelWidth -g pixelHeight ~/Desktop/"Simulator Screenshot ... .png"
```

Має збігатися з тим, що написано в помилці Connect або в підказці під полем скрінів.

**Фізичний телефон:** скріншоти з Галереї підходять лише якщо **нативна** роздільність знімку збігається з допустимою для того слота Connect. Нові моделі часто дають розміри, які **не** потрапляють у поле для «старішого» 6.7" слота — тоді простіший шлях: **симулятор з таблиці вище**.

**iPad** — у `app.json` **`supportsTablet: true`**, тому Connect може вимагати iPad-скріни:

| Пристрій | Розмір (px) | Готові файли |
|----------|-------------|--------------|
| **13-inch iPad** | **2064 × 2752** | `docs/app-store-screenshots/ipad-13-inch/` |
| **12.9" iPad Pro** (запас) | **2048 × 2732** | `docs/app-store-screenshots/ipad-12.9-inch/` |

Для релізу достатньо **одного** набору iPhone-скрінів (3–6 штук) для слота, яке приймає Connect (див. помилку / підказку розмірів).

### B2. Які екрани зняти (рекомендований набір)

Порядок у App Store (зверху вниз):

1. [ ] **Онбординг** — спіраль + «Pulsation існує, щоб повертати тебе до себе»
2. [ ] **Trigger** — «Одна дія для тебе зараз?»
3. [ ] **Action** — одна з дій (feet / find 3 / triangle breath; для find 3 — три прості підказки: форма · колір · відчуття)
4. [ ] **Return** — «Ти тут» + пояснення (для find 3: *Looking around slowly helps you return to where you are now.*)
5. [ ] **About** (опційно) — лише з онбордингу → «Про застосунок»

Готові PNG **1284×2778** (якщо вже зняті): `docs/app-store-screenshots/` + `README` у тій папці.

Поради:
- Темна тема, без статус-бару з часом/батареєю (симулятор: Hide status bar або чистий скрін)
- Одна мова на всіх скрінах (UK **або** EN — краще окремий набір для кожної локалі в Connect)

### B3. Як зняти на симуляторі (Mac)

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm run start
# натисни i → симулятор з таблиці B1 (часто iPhone 14 Pro Max для 1284×2778)
```

За потреби у Simulator: **File → Open Simulator → iPhone 14 Pro Max** (перед ⌘S).

- [ ] Відкрити кожен екран
- [ ] **Cmd + S** — збереження скріна на Desktop
- [ ] Перейменувати файли: `01-onboarding.png`, `02-trigger.png`, …

### B4. Завантажити в App Store Connect

1. [ ] https://appstoreconnect.apple.com → **Pulsation**
2. [ ] **App Store** (не TestFlight) → версія **1.0.0**
3. [ ] **Screenshots** → те поле **iPhone**, під яке підійшли пікселі (6.7" тощо; орієнтуйся на текст помилки / підказку Connect)
4. [ ] Перетягнути 3–6 PNG
5. [ ] (Опційно) Дублювати для **Ukrainian** / **English** локалей

TestFlight **не вимагає** скрінів; вони потрібні для **публікації в App Store** і для **External TestFlight** (інколи).

---

## Фаза C — Metadata та юридичне (App Store)

Тексти готові в репо — лишається вставити в Connect.

### C1. Тексти

- [ ] **Name:** Pulsation
- [ ] **Copyright:** `© 2026 Iuliana Iagodka` (App Information → `docs/app-store-metadata.md`)
- [ ] **Subtitle** — з `docs/app-store-metadata.md`
- [ ] **Description** — EN + UK (окремі локалі)
- [ ] **Keywords**
- [ ] **Promotional Text** / **What’s New 1.0.0**

### C2. URLs (GitHub Pages)

1. [ ] GitHub → **Settings** → **Pages** → branch **master**, folder **/docs** (`docs/pages/README.md`)
2. [ ] **Privacy Policy URL:** `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html`
3. [ ] **Support URL:** `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/support.html`
4. [ ] Перевір у браузері, що обидві сторінки відкриваються (після push + 1–3 хв)

### C3. App Privacy (Connect)

- [ ] Заповнити анкету **App Privacy** (дані локально, без трекінгу — як у політиці)
- [ ] **Age Rating** questionnaire
- [ ] **Category:** Health & Fitness (+ Lifestyle)

### C4. App Review

- [ ] **Review Notes** — з `docs/app-store-metadata.md`
- [ ] Вказати: login не потрібен, test account не потрібен
- [ ] **App Privacy mapping** звірити за `docs/app-privacy-mapping.md`

---

## Фаза D — TestFlight (продовження)

- [ ] Пройти флоу на телефоні, список багів/текстів
- [ ] Internal testers (1–3 людини) — email Apple ID
- [ ] Після кожної правки в коді → новий `build` + `submit`

Деталі: `docs/TESTFLIGHT.md`

### D1. Regression / сумісність / UX(UI) / security gate перед релізом

Виконувати перед кожним релізним build:

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm test
npx tsc --noEmit
npx expo-doctor
npm audit --omit=dev
```

- [ ] **Regression:** `npm test` зелений (усі suites pass)
- [ ] **Type compatibility:** `npx tsc --noEmit` без помилок
- [ ] **Expo compatibility:** `npx expo-doctor` без критичних fail
- [ ] **Security:** `npm audit --omit=dev` переглянуто; high/critical відсутні або задокументовані з планом fix

Поточний зафіксований стан (локальна перевірка 2026-05-28):
- `npm test` ✅ (11/11 suites pass)
- `npx tsc --noEmit` ✅
- `npx expo-doctor` ✅ (18/18 checks passed)
- `npm audit --omit=dev` ⚠️ 14 moderate вразливостей (high/critical немає), залишок у Expo transitive deps; повний fix вимагає major upgrade до Expo 56 (`npm audit fix --force`)

### D2. UX/UI перевірка для adaptive spiral hint

- [ ] 1–3 взаємодії: хінт видимий одразу, стандартна виразність
- [ ] 4–7 взаємодій: хінт приходить пізніше (прибл. +2.2…2.8с), менш контрастний
- [ ] 8–15 взаємодій: хінт з’являється лише інколи, дуже тихий
- [ ] 15+ взаємодій: хінт не показується
- [ ] Перехід між tier-ами без різких UX-стрибків, без “tutorial completed” відчуття
- [ ] `triangle_breath`: хінт не з’являється раніше завершення 3 циклів дихання
- [ ] Контраст і читабельність у темній темі залишаються комфортними

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
- `docs/app-privacy-mapping.md` — App Privacy form mapping для Connect
- `docs/privacy-policy.md` — політика конфіденційності
- `docs/app-store-screenshots/` — готові скріни для Connect (1284×2778)
- `src/modules/find-three-variants.ts` — 7 наборів підказок find 3
- `app.json` — bundle id, version, icon paths
