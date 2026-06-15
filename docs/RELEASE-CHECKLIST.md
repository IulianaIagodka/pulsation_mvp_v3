# Pulsation — iOS: App Store

| Версія | Build | Статус |
|--------|-------|--------|
| **1.0.0** | 26 | superseded |
| **1.0.1** | 28–33 | superseded |
| **1.0.2** | 36 | **LIVE** в App Store ✅ |
| **1.0.3** | 39 | submitted to App Store Connect / Apple processing |

**Зараз:** Store має **1.0.2** build **36** LIVE ✅; **1.0.3 build 39** завантажено в App Store Connect і очікує Apple processing/TestFlight availability.

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

### C1. Тексти (1.0.2 build 36) — LIVE ✅

- [x] **What's New** EN + UK — у Store (build **36**)
- [ ] **Promotional Text** (опційно)
- [x] **Review Notes** — у `docs/app-store-metadata.md` (секція 1.0.2 build 34+)

### C2. URLs (GitHub Pages)

- [x] Pages live (`docs/pages/`)
- [x] Privacy: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html`
- [x] Support: `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/support.html`

### C3. App Privacy (Connect)

- [x] Заповнено для 1.0.0
- [ ] Перевірити, що відповіді ще збігаються з 1.0.1 (локальні дані, без трекінгу)

### C4. App Review

- [x] 1.0.0 пройшов review (build **26**)
- [x] 1.0.2 build **36** — approve → **Release** у Store ✅

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

- [x] **Regression:** `npm test -- --runInBand` зелений (**24 suites, 123 tests**)
- [x] **Type compatibility:** `npx tsc --noEmit` без помилок
- [x] **Expo compatibility:** `npm run doctor` — **18/18 checks passed**
- [x] **Security:** `npm audit --omit=dev` переглянуто; high/critical прибрані через `npm audit fix` + `npm dedupe`; лишаються moderate, force-fix потребує breaking Expo/RN upgrades

Поточний стан Store / repo:
- Store: **1.0.2** build **36** LIVE
- Latest submitted: iOS **version** `1.0.3`, build **39** (EAS auto-increment remote)
- Шрифт: **Source Serif 4 Regular**
- Копі — `src/modules/delivery-layer.ts` (en + uk)

Зміни в 1.0.3 (vs Store 1.0.2 — що відчує юзер):
- **Resume/onboarding** — cold start після kill/background не має випадково перескакувати в trigger; warm resume лишається швидким.
- **Кола як кнопка** — глобальний tap handler активний лише для focused screen; Android overlay лишається tight навколо кіл і над scroll content.
- **Timing/layout** — main copy / bullets / explanation / footer reveal мають один timeline; **One action for you**, action main і **You are here** лишаються на спільному Y.

### D2. UX/UI перевірка (TestFlight 1.0.3 на iPhone + Android smoke)

- [ ] **Cold start after kill/background**: показує onboarding/headline path, не випадковий trigger.
- [ ] **Warm resume**: якщо app була background у цьому процесі, onboarding headline не блокує trigger resume path.
- [ ] **Onboarding only**: **Tap circles** / onboarding copy behavior не з’являється на trigger/action/return.
- [ ] **Return**: порядок — **You are here** → пояснення (без tap hint під колами)
- [ ] **Return**: **You are here** не стрибає по Y при появі пояснення / hint
- [ ] **Accessibility XXL**: main line лишається на місці
- [ ] **Мої шляхи**: лише на trigger, якщо є дії сьогодні або збережені
- [ ] **Збережи це для мене** → **Збережено** після натискання
- [ ] `triangle_breath`: хінт після 3 циклів дихання
- [ ] `find_three`: кола не завершують дію, поки не показані всі 3 буліти
- [ ] `return`: **Збережи це для мене** не показується для вже збереженої дії
- [ ] Онбординг: **Pulsation exists** лишається → **Tap circles** під колами → **How it works** + кроки нижче; 1-й тап — усі кроки, 2-й — trigger
- [ ] Android: tap по колах працює на кожному flow screen; footer links лишаються tappable.

---

## Фаза E — Публікація в App Store

### 1.0.0 (build 26) — виконано ✅

- [x] Submit for Review → approve → **Release** у Store

### 1.0.1 (build 28–33) — superseded

- [x] Train закритий; замінено **1.0.2**

### 1.0.2 (build 36) — виконано ✅

- [x] Bump **version** `1.0.2`
- [x] EAS build + submit → build **36**
- [x] Connect → **1.0.2** → **Submit for Review** → approve → **Release** у Store

### 1.0.3 (build 39) — TestFlight / processing

- [x] Bump **version** `1.0.3`
- [x] EAS build + auto-submit → build **39**
- [ ] App Store Connect processing complete → TestFlight available
- [ ] TestFlight device regression (`docs/circles-regression-checklist.md` + D2 above)

---

## Після релізу 1.0.2 (build 36)

1. [ ] Перевірити апку з App Store на iPhone (D2 regression)
2. [ ] (Опційно) оновити скріни в Connect під typography polish
3. [ ] Android: Play Console (`docs/ANDROID-RELEASE-CHECKLIST.md`)

---

## Корисні файли в репо

- `docs/TESTFLIGHT.md` — білди та submit
- `docs/app-store-metadata.md` — What's New, Review Notes, Connect paste blocks
- `docs/app-privacy-mapping.md` — App Privacy form mapping
- `docs/app-store-screenshots/connect/` — готові скріни для Connect
- `src/modules/delivery-layer.ts` — всі in-app тексти (en + uk)
- `app.json` — bundle id, version, buildNumber
