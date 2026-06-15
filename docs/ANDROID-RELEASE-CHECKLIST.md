# Pulsation — план релізу Android (Google Play)

Статус: **Фаза A в репо готова** (iOS build 26 у review). Далі: Play Console + перший AAB.  
Мета: **перший production AAB** у **Google Play Console** → internal testing → production.

Паралельно з iOS можна вести окремо; metadata і privacy URL **перевикористовуються**.

---

## Поточний стан репо

| Що | Статус |
|----|--------|
| `expo.android.adaptiveIcon` | ✅ `assets/adaptive-icon.png` |
| `expo.android.edgeToEdgeEnabled` | ✅ |
| `package` (applicationId) | ✅ `com.maksym.pulsation` |
| `versionCode` | ⏳ EAS `autoIncrement` + `appVersionSource: remote` після першого build |
| `npm run build:android:*` | ✅ `build:android:preview` / `build:android:prod` |
| `npm run submit:android:prod` | ✅ track `internal` у `eas.json` |
| Play service account JSON | ❌ локально (не в git); потрібен для submit |
| Локальний `/android` | gitignored (managed Expo — ок) |
| Тести / circles checklist | ✅ спільні з iOS (`npm test`, `docs/circles-regression-checklist.md`) |

Рекомендований **applicationId** (як iOS bundle): `com.maksym.pulsation`.

---

## Фаза 0 — Передумови (один раз)

### 0.1 Google Play Developer

- [ ] Акаунт [Google Play Console](https://play.google.com/console) ($25 one-time)
- [ ] Developer name / contact email узгоджені з privacy (`support.pulsation@gmail.com`)

### 0.2 Створити застосунок у Play Console

1. [ ] **Create app** → назва **Pulsation**
2. [ ] Default language: **English (US)** або **Ukrainian** (додати другу локаль пізніше)
3. [ ] App / Game: **App**
4. [ ] Free / Paid: **Free**
5. [ ] Declarations (policies, US export laws тощо)

### 0.3 EAS + Play API (для submit)

1. [ ] Play Console → **Setup → API access** → зв’язати Google Cloud project
2. [ ] Створити **Service account** з роллю **Release manager** (або Editor на початку)
3. [ ] Завантажити JSON key → зберегти **поза git** (наприклад `~/secrets/pulsation-play-service-account.json`)
4. [ ] У `eas.json` додати submit (див. Фаза A3) або передавати шлях при `eas submit`

```bash
npx eas-cli login
# перевірка, що проєкт той самий що iOS
npx eas-cli project:info
```

---

## Фаза A — Конфіг проєкту (код)

### A1. `app.json` — Android block

- [x] `package`: `com.maksym.pulsation` (як iOS `bundleIdentifier`)

Примітки:

- [ ] У Play Console при створенні app — **той самий** applicationId (після першого upload змінити неможливо)
- [ ] `permissions`: не додавати зайвого; Expo додасть потрібне для notifications. Перевір після `expo prebuild --dry-run` або першого EAS build у логах merged manifest
- [ ] Android 13+: runtime permission **POST_NOTIFICATIONS** — `expo-notifications` запитує через `requestPermissionsAsync` (вже в коді)

### A2. Скрипти в `package.json`

- [x] `build:android:preview` / `build:android:prod` / `submit:android:prod`

### A3. `eas.json` — submit Android

- [x] `submit.production.android.track`: **internal** (перший upload)
- [ ] Service account JSON — **не в git** (див. `.gitignore`: `*-play-service-account.json`)

Submit з ключем (шлях поза репо):

```bash
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=~/secrets/pulsation-play-service-account.json \
  npm run submit:android:prod
```

### A4. Notifications на Android (перевірка)

- [ ] `expo-notifications` plugin уже в `app.json`
- [ ] На **реальному** Android (не лише Expo Go): дозвіл на notifications → periodic one-action reminders every ~20 хв після background (10-30 хв adaptive window)
- [ ] Tap notification → відкриває `/trigger` (`NotificationOpenListener`)

Якщо push не потрібен (лише local schedule) — FCM/google-services.json часто **не обов’язковий**; якщо EAS build скаржиться — додати за [Expo Notifications setup](https://docs.expo.dev/push-notifications/fcm-credentials/).

### A5. Regression gate (як iOS)

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm test
npx tsc --noEmit
npx expo-doctor
npm audit --omit=dev
```

- [ ] Усі команди зелені перед першим production AAB

---

## Фаза B — Перший білд і internal testing

### B1. Локальна перевірка (емулятор або телефон)

```bash
npm run start
# натисни a → Android emulator (рекомендовано Pixel 6 / 7)
```

Або dev client:

```bash
npm run android
```

Чеклист: `docs/circles-regression-checklist.md` + акцент на Android:

- [ ] Circles tap на всіх екранах (`PersistentCirclesLayer` **elevation** над ScrollView)
- [ ] Footer: About, paths, **Save for me** — клікабельні
- [ ] Dynamic Type / великий шрифт системи
- [ ] Back gesture / predictive back (`predictiveBackGestureEnabled: false` — перевірити поведінку)
- [ ] Edge-to-edge: контент не під system bars

### B2. EAS production build (AAB)

```bash
npm run build:android:prod
```

- Профіль: **production**, `distribution: store`, **autoIncrement** versionCode
- Артефакт: **.aab** (Android App Bundle) — вимагає Play Store
- Чекай build на https://expo.dev (10–25 хв)

### B3. Upload у Play Console

```bash
npm run submit:android:prod
```

Або вручну: Play Console → **Release → Testing → Internal testing** → upload AAB.

- [ ] Перший upload може вимагати заповнення **базових** policy полів (див. Фаза C)
- [ ] Internal testers: твій Gmail + 1–2 тестери
- [ ] Встановити з Play Store (internal link) на Android-телефон

---

## Фаза C — Store listing і політики

Тексти EN/UK — з `docs/app-store-metadata.md`.  
Privacy / Support URL — ті самі GitHub Pages (вже live).

### C1. Main store listing

| Поле | Джерело |
|------|---------|
| App name | Pulsation |
| Short description (80 chars) | EN: з subtitle metadata |
| Full description (4000) | EN + UK окремі переклади в Console |
| App icon | 512×512 PNG (експорт з `assets/icon.png`) |
| Feature graphic | **1024×500** — зробити (немає в репо) |
| Phone screenshots | 2–8 шт., портрет; див. Фаза D |
| Category | Health & Fitness |
| Email | support.pulsation@gmail.com |
| Privacy policy URL | `https://iulianaIagodka.github.io/pulsation_mvp_v3/pages/privacy.html` |

### C2. Data safety (аналог App Privacy)

Заповнити за `docs/app-privacy-mapping.md`:

- [ ] **No data collected** / або мінімум **App functionality**, **on-device only**
- [ ] No account, no ads, no analytics SDK
- [ ] Notifications: local only, not used for ads
- [ ] Відповіді **збігаються** з privacy policy і iOS App Privacy

### C3. Content rating

- [ ] Questionnaire (IARC) у Play Console
- [ ] Очікувано: низький рейтинг (wellbeing, без medical claims у Store тексті)

### C4. Target audience

- [ ] Вікова група (зазвичай 13+ або 18+ — без дитячого контенту)
- [ ] Не Children’s app (якщо не таргетуєш дітей)

### C5. Health apps (якщо з’явиться секція)

- [ ] Не позиціонувати як medical device; disclaimer як у iOS description
- [ ] Якщо Google питає про health data — **ні**, дані лише локальні для UX

---

## Фаза D — Скріншоти Android

На відміну від iOS, Play приймає **гнучкіші** розміри (мін. сторона 320px, макс. 3840px, співвідношення до 2:1).

### D1. Рекомендований набір (як iOS)

1. Onboarding (How it works + tap circles)
2. Trigger
3. Action
4. Return
5. About (опційно)

### D2. Як зняти

```bash
EXPO_PUBLIC_APP_STORE_SCREENSHOTS=true npm start
# a → Pixel 6 Pro або Pixel 7 Pro emulator
```

- [ ] Hide status bar у emulator за бажанням
- [ ] Одна мова на набір (EN або UK) — окремі переклади listing у Console

**Перевикористання:** PNG з `docs/app-store-screenshots/connect/` (1284×2778) часто **підходять** для phone screenshots у Play — перевір preview у Console.

### D3. Feature graphic 1024×500

- [ ] Окремий банер (кола + назва Pulsation на `#0D121E`) — для пошуку/вітрини Play Store
- Не плутати з adaptive icon

---

## Фаза E — Production release

### E1. Порядок треків Play

```
Internal testing (1–3 дні) → Closed testing (опційно) → Production
```

Для першого релізу достатньо **Internal → Production** після smoke test.

### E2. Release checklist

- [ ] Фази A + B + C + D виконані
- [ ] Останній AAB протестований на 1–2 реальних Android
- [ ] `version` у `app.json` узгоджена з iOS (**1.0.1**)
- [ ] Release notes EN (+ UK) — текст **What's New** з metadata
- [ ] **Countries**: обрати (наприклад Worldwide або UA + US спочатку)
- [ ] **Managed publishing** (рекомендовано): approve вручну після review

### E3. Після публікації

- [ ] Перевірити сторінку в Play Store з телефону
- [ ] Моніторити **Android vitals** (crashes, ANR)
- [ ] Збирати фідбек; кожна правка → новий `build:android:prod` + submit

---

## Фаза F — Відмінності від iOS (щоб не здивуватись)

| Тема | iOS | Android |
|------|-----|---------|
| Білд | IPA | **AAB** |
| Beta | TestFlight | Internal / Closed testing |
| Review | 1–3 дні типово | Часто швидше; перший раз довше (policy) |
| Скріни | Жорсткі px (1284×2778…) | Гнучкіші; feature graphic обов’язковий |
| Notifications | User prompt один раз | Android 13+ runtime permission |
| Circles tap | zIndex | **elevation** критично |
| Tablet | iPad скріни | Окремі tablet screenshots якщо `supportsTablet` — на Android tablet layout перевірити |
| Version | buildNumber в app.json | versionCode через EAS autoIncrement |

---

## Хто що робить

| Задача | Хто |
|--------|-----|
| Play Developer акаунт | Ти |
| Service account JSON | Ти (не в git) |
| Правки `app.json` / `eas.json` / scripts | Я в Cursor |
| Емулятор / телефон тест | Ти |
| Feature graphic 1024×500 | Ти / дизайнер |
| Store listing + Data safety | Ти в Console (тексти з репо) |
| `npm run build:android:prod` | Ти в терміналі |

---

## Швидкий порядок «перший Android build»

1. [ ] Play Console: створити app + internal testing track
2. [ ] Додати `android.package` + npm scripts (Фаза A)
3. [ ] `npm test` + emulator smoke (`circles-regression-checklist`)
4. [ ] `npm run build:android:prod`
5. [ ] Submit AAB → internal testing → встановити на телефон
6. [ ] Паралельно: listing, Data safety, скріни, feature graphic
7. [ ] Production release після 1–2 днів без критичних багів

---

## Корисні файли (спільні з iOS)

- `docs/app-store-metadata.md` — опис EN/UK
- `docs/app-privacy-mapping.md` — Data safety
- `docs/privacy-policy.md` / `docs/pages/privacy.html`
- `docs/circles-regression-checklist.md` — UX перед релізом
- `docs/TESTFLIGHT.md` — аналог для iOS (для Android цей файл)
- `assets/adaptive-icon.png` — launcher icon

---

## Зв’язок з iOS релізом

| Ситуація iOS | Рекомендація Android |
|--------------|----------------------|
| Build 26 **ще в review** | Android вести **паралельно**; не блокує |
| iOS **approved** 1.0.0 | Android можна випустити **1.0.1** одразу (з paths, онбордингом) — вирівняти версію з репо |
| iOS **rejected** | Взяти ті самі правки в Android listing notes; тестувати повний флоу як у iOS Review Notes |

Версія в репо зараз: **1.0.1** — логічно перший Play release теж **1.0.1**, без окремого «1.0.0» на Android.
