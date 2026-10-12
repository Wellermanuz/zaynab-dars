# Interaktiv dars — Telegram bot (Zaynab Jabbiyeva)

Talabalar uchun Kahoot'ga o'xshash interaktiv dars: test, guruh keysi, krossvord, juftlik, saralash, ketma-ketlik va so'z buluti.

- **Admin (ustoz):** ism sifatida `Zaynab` yoziladi va parol so'raladi. Parol: **2026**.
- **Talabalar:** faqat ismini yozadi, parol kerak emas. Admin darsni boshlamaguncha ularga «Admin darsni boshlashini kutmoqdamiz…» yozuvi ko'rinib turadi.
- Hammasi bepul ishlaydi: GitHub + Render (bepul tarif) + Telegram.

---

## Ishga tushirish (taxminan 20–30 daqiqa)

### 1-qadam. Bot yaratish (3 daqiqa)
1. Telegram'da **@BotFather** ni oching va `/newbot` deb yozing.
2. Bot nomini yozing, masalan: `Zaynab Interaktiv Dars`.
3. Bot username'ini yozing. U `bot` bilan tugashi kerak, masalan: `zaynab_dars_bot`.
4. BotFather sizga **token** beradi. U taxminan `7123456789:AAH...xyz` ko'rinishida bo'ladi. Uni nusxalab, saqlab qo'ying. **Tokenni hech kimga bermang.**

### 2-qadam. Kodni GitHub'ga yuklash (5 daqiqa)
1. https://github.com saytida ro'yxatdan o'ting yoki akkauntingizga kiring.
2. Yuqori o'ngdagi **+** tugmasini bosing, so'ng **New repository** ni tanlang.
3. Nomiga `zaynab-dars` deb yozing va **Create repository** ni bosing.
4. Ochilgan sahifada **«uploading an existing file»** havolasini bosing.
5. Arxivdan chiqarilgan papka ichidagi **hamma narsani** sudrab tashlang:
   - `server.js`
   - `games.js`
   - `package.json`
   - `render.yaml`
   - `README.md`
   - `public` papkasi (ichida `index.html` bo'lishi shart)
6. Pastdagi **Commit changes** tugmasini bosing.

> Yuklangandan keyin `public/index.html` fayli GitHub'da ko'rinib turganini tekshiring.

### 3-qadam. Render'da serverni ishga tushirish (10 daqiqa)
1. https://render.com saytiga kiring va **Get Started**, so'ng **GitHub bilan kirish** ni tanlang.
2. **New +** tugmasini bosing, so'ng **Web Service** ni tanlang.
3. `zaynab-dars` repozitoriyasini tanlab, **Connect** ni bosing.
4. Sozlamalarni tekshiring:
   - **Language / Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. **Environment Variables** bo'limida **Add Environment Variable** ni bosing:
   - `BOT_TOKEN` = 1-qadamda olingan token
   - `TEACHER_PASSWORD` = `2026` (bu qatorni qo'shmasangiz ham parol 2026 bo'ladi)
6. **Deploy Web Service** ni bosing.
7. 3–5 daqiqa kuting. Log oynasida quyidagi yozuv chiqishi kerak:
   ```
   Telegram bot ulandi ✅  https://zaynab-dars-xxxx.onrender.com
   ```

### 4-qadam. Sinab ko'rish (3 daqiqa)
1. Telegram'da botingizni oching va **/start** ni bosing.
2. **📚 Darsga kirish** tugmasini bosing.
3. Ustoz sifatida kirish uchun ismga `Zaynab` deb yozing. Parol so'raladi: `2026`.
4. Boshqa telefondan yoki do'stingiz orqali oddiy ism bilan kiring. U «Admin darsni boshlashini kutmoqdamiz…» yozuvini ko'radi, ustoz ekranida esa uning ismi paydo bo'ladi.
5. Ustoz o'yinni tanlab, **▶ Darsni boshlash** ni bosadi. O'yin hammada bir vaqtda boshlanadi.

---

## Dars kuni maslahatlar
- **Darsdan 1–2 daqiqa oldin botni o'zingiz oching.** Bepul server 15 daqiqa ishlatilmasa «uxlab qoladi» va birinchi ochilishda 30–60 soniya kutadi. Dars davomida u uxlamaydi.
- Talabalarga bot havolasini yuboring: `https://t.me/BOT_USERNAME`.
- Ustoz ekranidagi ismlar yonida **×** tugmasi bor — u xato kirgan odamni xonadan chiqaradi.
- Server qayta yonganda (masalan, uzoq tanaffusdan keyin) ballar nolga tushadi. Bitta dars davomida bu muammo emas.

## Savollarni o'zgartirish
Barcha savollar va o'yinlar **`games.js`** faylida. GitHub'da faylni oching, ✏️ (Edit) tugmasini bosing, o'zgartiring va **Commit changes** ni bosing. Render 2–3 daqiqada yangilanadi.

- Test savolida `a` — to'g'ri javob raqami: `0` = A, `1` = B, `2` = C, `3` = D.
- Krossvord so'zlarini faqat lotin harflarida, apostrofsiz yozing. Masalan, `O'QITUVCHI` emas, `OQITUVCHI`.

## Parolni o'zgartirish
Render → servisingiz → **Environment** → `TEACHER_PASSWORD` qiymatini o'zgartiring → **Save changes**.

## Kompyuterda sinash (ixtiyoriy)
```
npm install
node server.js
```
Keyin brauzerda `http://localhost:3000` manzilini oching. Bot ulanmaydi, lekin sayt to'liq ishlaydi.
