# Pulsation — iOS: App Store

| Версія | Build | Статус |
|--------|-------|--------|
| **1.0.0** | 26 | **LIVE** в App Store ✅ |
| **1.0.1** | 28 | **In Review** ⏳ |
| **1.0.1** | 31 | у репо → **наступний EAS build + submit** |

**Зараз:** build **31** — layout/copy polish після review feedback; **28** ще In Review (Connect не чіпати для 28).

Android: `docs/ANDROID-RELEASE-CHECKLIST.md`

---

## Фаза A — Іконка застосунку

### A1. Дизайн (готово)

- [x] Іконка = та сама довга тонка кола, що `CirclesFocus` (скрипт `npm run generate:icon`)
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

- [x] Build + submit (build **26** → App Store)
- [x] Іконка на пристрої з Store build 26

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

1. [ ] **Онбординг** — кола + «How it works:» / «Як це працює:» + кроки + «Tap circles» в кінці
2. [ ] **Trigger** — «Одна дія для тебе зараз?»
3. [ ] **Action** — одна з дій (feet / find 3 / triangle breath / relax jaw / drop shoulders / notice 3 sounds / press palms; для find 3 — три прості підказки: форма · колір · відчуття)
4. [ ] **Return** — «Ти тут» + коротке одно-реченнєве пояснення (варіанти ротуются).
5. [ ] **About** (опційно) — лише з онбордингу → «Про застосунок»

Готові PNG для Connect: `docs/app-store-screenshots/connect/` (`npm run generate:screenshots` після знімків у `captures/`). Див. `docs/app-store-screenshots/README.md`.

Поради:
- Темна тема, без статус-бару з часом/батареєю (симулятор: Hide status bar або чистий скрін)
- Одна мова на всіх скрінах (UK **або** EN — краще окремий набір для кожної локалі в Connect)

### B3. Як зняти на симуляторі (Mac)

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
EXPO_PUBLIC_APP_STORE_SCREENSHOTS=true npm start
# натисни i → симулятор з таблиці B1 (часто iPhone 14 Pro Max для 1284×2778)
# онбординг: розширений екран — увесь текст одразу для ⌘S
```

За потреби у Simulator: **File → Open Simulator → iPhone 14 Pro Max** (перед ⌘S).

- [ ] Відкрити кожен екран
- [ ] **Cmd + S** — збереження скріна на Desktop
- [ ] Перейменувати файли: `01-onboarding.png`, `02-trigger.png`, …

### B4. Завантажити в App Store Connect

1.0.0 (build 26): скріни вже в Store ✅

Для **1.0.1** — оновити скріни (UI змінився: paths, онбординг, return):

1. [ ] Connect → **Pulsation** → **App Store** → версія **1.0.1**
2. [ ] **Screenshots** — `docs/app-store-screenshots/connect/` (EN), `uk/` (UK локаль)
3. [ ] (Опційно) iPad — `ipad-13-inch/`

TestFlight **не вимагає** скрінів; вони потрібні для **публікації в App Store** і для **External TestFlight** (інколи).

---

## Фаза C — Metadata та юридичне (App Store)

Тексти готові в репо — лишається вставити в Connect.

### C1. Тексти

1.0.0 у Store — metadata заповнена ✅

Для **1.0.1** оновити:

- [ ] **What’s New** — з `docs/app-store-metadata.md` (секція 1.0.1)
- [ ] **Promotional Text** (опційно)
- [x] **Review Notes** для build **28** — у `docs/app-store-metadata.md`

### C2. URLs (GitHub Pages)

- [x] Pages live (`docs/pages/`)
- [x] Privacy: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html`
- [x] Support: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/support.html`

### C3. App Privacy (Connect)

- [x] Заповнено для 1.0.0
- [ ] Перевірити, що відповіді ще збігаються з 1.0.1 (локальні дані, без трекінгу)

### C4. App Review

- [x] 1.0.0 пройшов review
- [x] Review Notes для build **28** відправлені з submit

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

- [x] **Regression:** `npm test` зелений (20 suites, 89 tests)
- [x] **Type compatibility:** `npx tsc --noEmit` без помилок
- [x] **Expo compatibility:** `npx expo-doctor` без критичних fail (18/18)
- [ ] **Security:** `npm audit --omit=dev` переглянуто; high/critical відсутні або задокументовані з планом fix

Поточний зафіксований стан (репо, build **31**; у review — build **28**):
- `npm test` ✅ (20 suites, 89 tests)
- iOS **version** `1.0.1`, **buildNumber** **31** у `app.json`
- **In Review:** 1.0.1 **build 28**
- `npx tsc --noEmit` ✅
- `npx expo-doctor` ✅ (18/18)
- `npm audit --omit=dev` ⚠️ moderate в Expo transitive deps; high/critical немає

Останні зміни в build **31**:
- **Єдиний Y головного рядка** на trigger / action / return (One action, You are here, текст дії)
- **Find 3 things:** — відступ до булетів як на return; без великого порожнього слота
- **OverflowScrollView** — скрол і індикатор лише коли текст не вміщується (about, paths, пояснення)
- **Paths:** скрол списку збережених; **Saved for you:** не більший за «actions for yourself today»; повні назви дій
- **Dynamic Type floor 1.0×** — текст не стискається нижче дефолту на мінімальному системному розмірі
- **Онбординг:** **Pulsation exists** на правильній висоті; **How it works:** + кроки — той самий розмір (17pt)
- **Tap hint** — останнім на всіх екранах; **Show my paths** — разом з **One action for you**

### D2. UX/UI перевірка для adaptive circles hint

- [ ] Перші **3 завершені цикли**: **tap to continue** / **торкни, щоб продовжити** fixed **under circles** на кожному екрані флоу
- [ ] **Return**: порядок — **You are here** → пояснення → tap hint under circles (fade-in)
- [ ] **Return**: **You are here** не стрибає по Y при появі пояснення / hint (pinned `mainLine`)
- [ ] **Accessibility XXL**: main line лишається на місці; довгий текст переноситься без зсуву якоря
- [ ] **Мої шляхи** / paths: лише на trigger; разом з «One action for you»; **tap hint** — останнім на всіх екранах
- [ ] **Збережи це для мене** у footer на return → **Збережено** після натискання
- [ ] 1–3 взаємодії (після 3 циклів — по tap count): хінт видимий одразу, стандартна виразність
- [ ] 4–7 взаємодій: хінт приходить пізніше (прибл. +2.2…2.8с), менш контрастний
- [ ] 8–15 взаємодій: хінт з’являється лише інколи, дуже тихий
- [ ] 15+ взаємодій: хінт не показується
- [ ] `triangle_breath`: хінт не з’являється раніше завершення 3 циклів дихання
- [ ] `find_three`: кола не завершують дію, поки не показані всі 3 буліти
- [ ] `return`: **Збережи це для мене** не показується повторно для вже збереженої дії
- [ ] Онбординг: **How it works** + **Tap circles — it's the button here** under circles
- [ ] Контраст і читабельність у темній темі залишаються комфортними

---

## Фаза E — Публікація в App Store

### 1.0.0 (build 26) — виконано ✅

- [x] Submit for Review → approve → **Release** у Store

### 1.0.1 (build 28) — In Review ⏳

- [x] Connect → **1.0.1** → build **28** → **Submit for Review**
- [ ] **Approve** → **Release** (замінить 1.0.0 у Store для користувачів)

**Якщо Reject** → build **31** з репо:

- [ ] Виправити за коментарем Apple
- [x] `npm run build:ios:testflight` + `submit` (build **31**)
- [x] Review Notes (build **31**) у `docs/app-store-metadata.md`

**Якщо Approve build 28** — build **31** можна випустити як наступне оновлення **1.0.1** (layout polish) або **1.0.2**.

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

## Поки чекаєш review (build 28)

1. [ ] **Нічого не міняти** в Connect для 1.0.1  
2. [ ] TestFlight build **31** → D2 на iPhone  
3. [ ] Android: Play Console + перший AAB (`docs/ANDROID-RELEASE-CHECKLIST.md`)  

## Після approve build 28

1. [ ] Connect → **Release** 1.0.1 (manual або auto)  
2. [ ] Перевірити оновлення з App Store на телефоні  

---

## Корисні файли в репо

- `docs/TESTFLIGHT.md` — білди та submit
- `docs/app-store-metadata.md` — опис EN/UK
- `docs/app-privacy-mapping.md` — App Privacy form mapping для Connect
- `docs/privacy-policy.md` — політика конфіденційності
- `docs/app-store-screenshots/connect/` — готові скріни для Connect (1284×2778)
- `src/modules/find-three-variants.ts` — 7 наборів підказок find 3
- `app.json` — bundle id, version, icon paths
