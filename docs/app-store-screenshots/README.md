# App Store screenshots

**UI додатку не змінюється.** Тут лише PNG для завантаження в App Store Connect.

## Чому симулятор / телефон «не проходить»

Connect приймає лише **точні** розміри (наприклад **1284×2778** для слота 6.7"). Знімок з Desktop часто **1290×2796**, **1179×2556** тощо — форма відхиляє файл.

## Що завантажувати в Connect

Папка **`connect/`** — повноекранний скрін додатку, розмір **1284×2778** (без маркетингової рамки).

| Файл | Екран |
|------|--------|
| `01-onboarding-1284x2778.png` | Онбординг |
| `02-trigger-1284x2778.png` | Trigger |
| `03-action-1284x2778.png` | Action |
| `04-return-1284x2778.png` | Return |
| `05-about-1284x2778.png` | About |

**UK:** `connect/uk/` (ті самі імена, українські знімки в `captures/`).

**iPad:** `ipad-13-inch/` (**2064×2752**) та `ipad-12.9-inch/` (**2048×2732**) — генеруються разом із iPhone.

---

## Кроки (один раз)

### 1. Зняти екрани в симуляторі

```bash
# Розширений онбординг: увесь текст одразу (без очікування fade)
EXPO_PUBLIC_APP_STORE_SCREENSHOTS=true npm start
# i → iPhone 14 Pro Max або 13 Pro Max (зручно для 1284×2778)
```

Перший екран (**розширений онбординг**): заголовок + «How it works» / «Як це працює» + 4 кроки + «Tap the circles — it's the button here» під колами — у режимі знімка весь текст у **одному скролі**, компактніше, видно одразу (⌘S знімає те, що на екрані — прокрути вниз, якщо на малому симуляторі не вміщається).

Для **Connect** (`connect/`) онбординг не обрізається. У **marketing** онбординг теж показує повний знімок (без crop).

Скинь онбординг: видали застосунок у симуляторі або **Device → Erase All Content**.

На кожному екрані: **⌘S** → файл на Desktop.

Симулятор: **Features → Hide Status Bar** (за бажанням).

### 2. Покласти сирі PNG у `captures/`

Перейменуй у **точні** імена:

```
docs/app-store-screenshots/captures/
  01-onboarding-1284x2778.png
  02-trigger-1284x2778.png
  03-action-1284x2778.png
  04-return-1284x2778.png
  05-about-1284x2778.png
```

Розмір вихідного файлу може бути будь-яким — скрипт піджене під Connect.

### 3. Згенерувати файли для Connect

```bash
npm run generate:screenshots
```

Команда сама **рендерить** актуальні екрани (кільця + текст з поточної версії) у `captures/`, потім збирає `connect/` і iPad. Якщо потрібні **реальні** знімки з симулятора — поклади їх у `captures/` і запусти лише `node scripts/generate-app-store-screenshots.mjs`.

Перевірка:

```bash
sips -g pixelWidth -g pixelHeight docs/app-store-screenshots/connect/02-trigger-1284x2778.png
# pixelWidth: 1284, pixelHeight: 2778
```

### 4. Завантажити в App Store Connect

**Apps → Pulsation → App Store → Screenshots** — перетягни файли з **`connect/`** (не з Desktop і не з кореня репо).

Порядок зверху вниз: 01 → 05.

---

## Опційно: яскраві маркетингові кадри

Лише для прев’ю в Store (заголовок + рамка телефона), **не** змінює додаток:

```bash
npm run generate:screenshots:marketing
npm run generate:screenshots:marketing:uk
```

Результат: `marketing/` та `marketing/uk/`. Якщо Connect приймає лише «чисті» скріни — використовуй **`connect/`**.

---

## Папки

| Папка | Призначення |
|--------|-------------|
| `captures/` | Твої знімки з симулятора (вхід) |
| `connect/` | **Завантажуй у Connect** (iPhone) |
| `marketing/` | Опційні яскраві кадри |
| `ipad-13-inch/` | iPad для Connect |

Старі PNG у корені `app-store-screenshots/` можна ігнорувати — орієнтуйся на **`connect/`**.
