# App Store screenshots

## iPhone (1284 × 2778)

Папка: **корінь** `docs/app-store-screenshots/`

| Файл | Екран |
|------|--------|
| `01-onboarding-1284x2778.png` | Онбординг |
| `02-trigger-1284x2778.png` | Trigger |
| `03-action-1284x2778.png` | Action |
| `04-return-1284x2778.png` | Return |
| `05-about-1284x2778.png` | About |

Connect → **Screenshots** → iPhone (слот **1284×2778** або з підказки форми).

---

## iPad — 13-inch Display (2064 × 2752)

Папка: **`ipad-13-inch/`**

| Файл | Екран |
|------|--------|
| `01-onboarding-2064x2752.png` | Онбординг |
| `02-trigger-2064x2752.png` | Trigger |
| `03-action-2064x2752.png` | Action |
| `04-return-2064x2752.png` | Return |
| `05-about-2064x2752.png` | About |

Connect → **Screenshots** → **iPad** → **13-inch Display** → завантаж **01 → 05**.

Якщо Connect відхилить — спробуй **`ipad-12.9-inch/`** (**2048 × 2732**).

Джерело: масштаб з iPhone-скрінів (`sips`). Для ідеальної якості зніми **⌘S** у симуляторі **iPad Pro 13-inch** і заміни ці файли.

Перевірка розміру:

```bash
sips -g pixelWidth -g pixelHeight docs/app-store-screenshots/ipad-13-inch/01-onboarding-2064x2752.png
```
