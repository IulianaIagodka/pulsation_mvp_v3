# Pulsation — iOS: App Store

| Версія | Build | Статус |
|--------|-------|--------|
| **1.0.0** | 26 | **LIVE** в App Store ✅ |
| **1.0.1** | 28 | superseded |
| **1.0.1** | 31 | **In Review** ⏳ |
| **1.0.1** | 32 | у репо (superseded EAS auto-increment) |
| **1.0.1** | 33 | **Submitted** ✅ (EAS auto-increment) |

**Зараз:** build **31** In Review. Build **33** завантажено в Connect (обробка Apple ~5–10 хв). Скріншоти завантажені ✅.

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

1. [x] **Онбординг** — кола + «How it works:» / «Як це працює:» + кроки + «Tap circles» в кінці
2. [x] **Trigger** — «Одна дія для тебе»
3. [x] **Action** — одна з дій (feet / find 3 / triangle breath / relax jaw / drop shoulders / notice 3 sounds / press palms)
4. [x] **Return** — «Ти тут» + коротке пояснення
5. [x] **About** (опційно) — з онбордингу → «Про застосунок»

Готові PNG для Connect: `docs/app-store-screenshots/connect/` (`npm run generate:screenshots` після знімків у `captures/`). Див. `docs/app-store-screenshots/README.md`.

### B4. Завантажити в App Store Connect

1.0.0 (build 26): скріни вже в Store ✅

Для **1.0.1**:

- [x] Connect → **Pulsation** → **App Store** → версія **1.0.1**
- [x] **Screenshots** — `docs/app-store-screenshots/connect/` (EN), `uk/` (UK локаль)
- [ ] (Опційно) iPad — `ipad-13-inch/`

---

## Фаза C — Metadata та юридичне (App Store)

Тексти готові в репо — див. **`docs/app-store-metadata.md`** → секція **Connect — активний реліз**.

### C1. Тексти (build 33)

- [x] **What's New** EN + UK — `docs/app-store-metadata.md` → **Connect — активний submit** (build 33 vs 31)
- [ ] **Promotional Text** (опційно)
- [x] **Review Notes** — у `docs/app-store-metadata.md` (секція build 33)

### C2. URLs (GitHub Pages)

- [x] Pages live (`docs/pages/`)
- [x] Privacy: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html`
- [x] Support: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/support.html`

### C3. App Privacy (Connect)

- [x] Заповнено для 1.0.0
- [ ] Перевірити, що відповіді ще збігаються з 1.0.1 (локальні дані, без трекінгу)

### C4. App Review

- [x] 1.0.0 пройшов review
- [x] Review Notes для build **31** відправлені з submit
- [x] Build **33** submitted via EAS (2026-06-08)
- [ ] Connect → **Submit for Review** build **33** (після обробки Apple)

---

## Фаза D — TestFlight (продовження)

- [ ] Пройти флоу на телефоні, список багів/текстів
- [ ] Internal testers (1–3 людини) — email Apple ID
- [ ] Після кожної правки в коді → новий `build` + `submit`

Деталі: `docs/TESTFLIGHT.md`

### D1. Regression / сумісність / UX(UI) / security gate перед релізом

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm test
npx tsc --noEmit
npx expo-doctor
npm audit --omit=dev
```

- [x] **Regression:** `npm test` зелений (22 suites, 120 tests)
- [x] **Type compatibility:** `npx tsc --noEmit` без помилок
- [ ] **Expo compatibility:** `npx expo-doctor` — перевірити перед EAS (expo-font duplicate)
- [ ] **Security:** `npm audit --omit=dev` переглянуто; high/critical відсутні або задокументовані

Поточний стан репо (build **32**):
- iOS **version** `1.0.1`, **buildNumber** **32** у `app.json`
- **In Review:** 1.0.1 **build 31**
- Копі — `src/modules/delivery-layer.ts` (en + uk)

Зміни в build **33** (vs 31 — що відчує юзер):
- **Spiral → circles** — центральний елемент тепер кола (та сама tap-кнопка)
- **Extended onboarding** — Tap circles одразу після headline; How it works далі
- **Calmer flow** — підказка під колами лише на онбордингу, не на trigger/action/return
- **Flow polish** — без flash «One action for you» при поверненні; Мої шляхи з main copy
- **Fix** — стабільніший resume / notification open

### D2. UX/UI перевірка для adaptive circles hint

- [ ] **Onboarding only**: **Tap circles** fixed **under circles** (не на trigger/action/return)
- [ ] **Return**: порядок — **You are here** → пояснення (без tap hint під колами)
- [ ] **Return**: **You are here** не стрибає по Y при появі пояснення / hint
- [ ] **Accessibility XXL**: main line лишається на місці
- [ ] **Мої шляхи**: лише на trigger, якщо є дії сьогодні або збережені
- [ ] **Збережи це для мене** → **Збережено** після натискання
- [ ] `triangle_breath`: хінт після 3 циклів дихання
- [ ] `find_three`: кола не завершують дію, поки не показані всі 3 буліти
- [ ] `return`: **Збережи це для мене** не показується для вже збереженої дії
- [ ] Онбординг: **Pulsation exists** → **Tap circles** під колами; потім **How it works** + кроки

---

## Фаза E — Публікація в App Store

### 1.0.0 (build 26) — виконано ✅

- [x] Submit for Review → approve → **Release** у Store

### 1.0.1 (build 31) — In Review ⏳

- [x] Connect → **1.0.1** → build **31** → **Submit for Review**
- [ ] **Approve** → **Release** або чекати build **32**

### 1.0.2 (build 35+) — in progress ⏳

- [x] Bump **version** `1.0.2` (train 1.0.1 closed після approve)
- [ ] `npm run build:ios:testflight` → submit
- [ ] Connect → **1.0.2** → **Submit for Review** (What's New + Review Notes з `docs/app-store-metadata.md`)

### 1.0.1 (build 33) — submitted ✅

- [x] `npm run build:ios:testflight` — build `017b9aed`
- [x] `npm run submit:ios:testflight` — submission `9e4d7b3e`
- [x] Train **1.0.1** closed — нові білди лише на **1.0.2+**

---

## Поки чекаєш review

1. [ ] **Нічого не міняти** в Connect для build **31**
2. [ ] TestFlight build **33** → D2 на iPhone
3. [ ] Android: Play Console (`docs/ANDROID-RELEASE-CHECKLIST.md`)

---

## Корисні файли в репо

- `docs/TESTFLIGHT.md` — білди та submit
- `docs/app-store-metadata.md` — What's New, Review Notes, Connect paste blocks
- `docs/app-privacy-mapping.md` — App Privacy form mapping
- `docs/app-store-screenshots/connect/` — готові скріни для Connect
- `src/modules/delivery-layer.ts` — всі in-app тексти (en + uk)
- `app.json` — bundle id, version, buildNumber
