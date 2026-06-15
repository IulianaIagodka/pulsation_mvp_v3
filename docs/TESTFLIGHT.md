# TestFlight — Pulsation

Короткий шлях: **EAS build (production)** → **EAS submit** → **TestFlight у App Store Connect**.

## Передумови (один раз)

1. **Apple Developer Program** (платний акаунт).
2. **Expo / EAS акаунт**: https://expo.dev
3. У **App Store Connect** створити застосунок з тим самим Bundle ID, що в `app.json`:
   - `com.maksym.pulsation`
4. У терміналі в папці проєкту:

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm install
npx eas-cli login
npx eas-cli init
```

`eas init` прив’яже проєкт до Expo (якщо ще не прив’язаний).

## Крок 1 — Збірка для TestFlight

```bash
cd /Users/maksym/dev/pulsation_mvp_v3
npm run build:ios:testflight
```

- Профіль: **production** (`distribution: store`).
- EAS запитає Apple credentials (можна довірити EAS).
- **version** `1.0.3`, **buildNumber** EAS remote auto-increment (last LIVE in Store: **1.0.2** build **36**).
- **App Store:** **1.0.2** build **36** LIVE ✅; next TestFlight/App Store train is **1.0.3+**.
- Тестовий режим ротації дій **вимкнено** у production-білді.

Чекай статус на https://expo.dev → Builds (зазвичай 10–25 хв).

## Крок 2 — Завантажити в App Store Connect

Після успішного build:

```bash
npm run submit:ios:testflight
```

Або в одному проході при наступних білдах:

```bash
npx eas-cli build -p ios --profile production --auto-submit
```

У цьому проєкті `ascAppId` вже заданий в `eas.json` (`6773324495`), тому `submit` працює в non-interactive режимі через App Store Connect API key, що зберігається на EAS.

## Крок 3 — TestFlight у браузері

1. Відкрий https://appstoreconnect.apple.com
2. **My Apps** → **Pulsation**
3. Вкладка **TestFlight**
4. Дочекайся обробки білду (Processing → Ready to Test), інколи 5–30 хв
5. Заповни **Export Compliance** (зазвичай «No» для encryption, якщо не додавали свою криптографію)
6. Додай тестерів:
   - **Internal Testing** — до 100 людей з твоєї команди в App Store Connect (швидко)
   - **External Testing** — потрібна коротка beta-рев’ю Apple (довше)

## Крок 4 — Встановити на iPhone

1. Встанови **TestFlight** з App Store.
2. Запрошення на email або публічне посилання з App Store Connect.
3. Відкрий запрошення → **Install**.

## Корисні команди

```bash
# Перевірка проєкту перед білдом
npm run doctor

# Статус білдів
npx eas-cli build:list --platform ios

# Локальна розробка (не TestFlight)
npm run start
```

## Якщо щось пішло не так

| Проблема | Що зробити |
|----------|------------|
| Bundle ID не збігається | У Connect і `app.json` має бути однаковий `com.maksym.pulsation` |
| Немає доступу до Apple | Перевір роль у App Store Connect (Admin / App Manager) |
| Submit failed | `npm run submit:ios:testflight` після успішного build |
| `could not determine executable` | Спочатку `npm install` у папці проєкту |
| Білд «Processing» довго | Зачекай; інколи до 1 год |
| TestFlight не бачить build | Перевір, що build прив’язаний до версії **1.0.3** |

## Privacy / metadata (для external beta)

Перед зовнішнім тестом бажано мати:

- Privacy Policy URL (текст: `docs/privacy-policy.md`)
- Мінімальні скріни в App Store (навіть для beta інколи потрібні)
- App Privacy у Connect

Детальні тексти: `docs/app-store-metadata.md`.
