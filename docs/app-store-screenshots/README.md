# App Store screenshots

**UI додатку не змінюється.** Тут лише PNG для завантаження в App Store Connect.

## Що завантажувати зараз (conversion)

Якщо багато переглядів сторінки і мало завантажень — у Connect клади **маркетингові conversion-кадри** (заголовок + рамка телефону), не «чисті» скріни UI.

| Локаль | Папка | Сюжет |
|--------|--------|--------|
| **EN** | `marketing/` | Automatic scrolling → quiet invitation → one action → back to yourself → no streaks |
| **UK** | `uk/` | Автоскрол → тихе запрошення → одна дія → повернися до себе → без серій |

Порядок зверху вниз: `01` → `05`. Перший кадр має читатися за 1–2 секунди в мініатюрі.

```bash
npm run generate:screenshots:conversion
```

Перегенерує EN (`marketing/`) + UK (`uk/`) з benefit-заголовками й локалізованим UI всередині телефону.

Старі product-заголовки («How it works» тощо) лишаються як A/B:

```bash
node scripts/generate-app-store-screenshots.mjs --marketing --story=product
node scripts/generate-app-store-screenshots.mjs --marketing --locale=uk --story=product
```

---

## Чому симулятор / телефон «не проходить»

Connect приймає лише **точні** розміри (наприклад **1284×2778** для слота 6.7"). Знімок з Desktop часто **1290×2796**, **1179×2556** тощо — форма відхиляє файл.

## Чисті скріни (без заголовків)

Папка **`connect/`** — повноекранний скрін додатку, розмір **1284×2778** (без маркетингової рамки). Використовуй як запасний варіант, якщо Connect/рев’ю вимагає «сирий» UI.

| Файл | Екран |
|------|--------|
| `01-onboarding-1284x2778.png` | Онбординг |
| `02-trigger-1284x2778.png` | Trigger |
| `03-action-1284x2778.png` | Action |
| `04-return-1284x2778.png` | Return |
| `05-about-1284x2778.png` | About |

**UK clean:** `connect/uk/` (після `npm run generate:screenshots:uk`).

**iPad:** `ipad-13-inch/` (**2064×2752**) та `ipad-12.9-inch/` (**2048×2732**) — генеруються разом із iPhone connect EN.

---

## Кроки (один раз)

### 1. Зняти екрани в симуляторі (опційно)

```bash
# Розширений онбординг: увесь текст одразу (без очікування fade)
EXPO_PUBLIC_APP_STORE_SCREENSHOTS=true npm start
# i → iPhone 14 Pro Max або 13 Pro Max (зручно для 1284×2778)
```

Або рендерити актуальні екрани скриптом (без симулятора):

```bash
npm run render:captures      # EN → captures/
npm run render:captures:uk   # UK → captures/uk/
```

### 2. Покласти сирі PNG у `captures/` (якщо з симулятора)

```
docs/app-store-screenshots/captures/
  01-onboarding-1284x2778.png
  ...
docs/app-store-screenshots/captures/uk/   # український UI
  01-onboarding-1284x2778.png
  ...
```

### 3. Згенерувати файли

```bash
# Conversion для Connect (рекомендовано)
npm run generate:screenshots:conversion

# Або лише чисті EN + iPad
npm run generate:screenshots
```

Перевірка:

```bash
# macOS
sips -g pixelWidth -g pixelHeight docs/app-store-screenshots/marketing/01-onboarding-1284x2778.png
# Linux
identify docs/app-store-screenshots/marketing/01-onboarding-1284x2778.png
# pixelWidth: 1284, pixelHeight: 2778
```

### 4. Завантажити в App Store Connect

**Apps → Pulsation → App Store → Screenshots**

1. **English** — файли з **`marketing/`**
2. **Ukrainian** — файли з **`uk/`**

Порядок зверху вниз: 01 → 05.

---

## Папки

| Папка | Призначення |
|--------|-------------|
| `captures/` | Сирі знімки / рендер EN |
| `captures/uk/` | Сирі знімки / рендер UK UI |
| `marketing/` | **EN conversion — завантажуй у Connect** |
| `uk/` | **UK conversion — завантажуй у Connect** |
| `connect/` | Чисті скріни без заголовків (запас) |
| `ipad-13-inch/` | iPad для Connect |

---

## Conversion copy (довідка)

| # | EN | UK |
|---|----|----|
| 01 | Stuck scrolling? / One gentle action to reset | Застрягли в скролі? / Одна м’яка дія — і ти знову тут |
| 02 | A quiet invitation / When the phone sits nearby | Тихе запрошення / Коли телефон просто поруч |
| 03 | One small action / Feel your feet. One slow breath. | Одна маленька дія / Відчуй стопи. Один повільний подих. |
| 04 | Back to yourself / You are here — present again | Повернися до себе / Ти тут — знову в моменті |
| 05 | No streaks. No feed. / Minimal wellbeing, on device | Без серій і стрічки / Мінімум. Лише на твоєму пристрої |
