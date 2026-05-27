# App Store screenshots (iPhone)

Готові PNG для завантаження в **App Store Connect** → **App Store** → версія → **Screenshots** → слот, який приймає **1284 × 2778** (портрет).

| Файл | Екран (за порядком зйомки) |
|------|----------------------------|
| `01-onboarding-1284x2778.png` | Онбординг |
| `02-trigger-1284x2778.png` | Trigger |
| `03-action-1284x2778.png` | Action |
| `04-return-1284x2778.png` | Return |
| `05-about-1284x2778.png` | About |

Джерело: симулятор **iPhone 16e**, 27.05.2026; масштабовано до **1284×2778** (`sips`).

Якщо Connect вимагає **1242 × 2688**, у Terminal:

```bash
cd docs/app-store-screenshots
mkdir -p 1242x2688
for f in *-1284x2778.png; do
  sips -z 2688 1242 "$f" --out "1242x2688/${f/-1284x2778/-1242x2688}"
done
```

Перевірка розміру:

```bash
sips -g pixelWidth -g pixelHeight 01-onboarding-1284x2778.png
```
