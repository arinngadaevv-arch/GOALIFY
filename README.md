# TrendSpark AI 📊

מחולל תוכן AI לרשתות חברתיות לעסקים קטנים - הופכים בעלי עסקים ליוצרי תוכן
ויראלי לטיקטוק ואינסטגרם תוך שניות, באמצעות Google Gemini, עם מערכת מנויים
מלאה מבוססת Stripe.

## מה המוצר עושה

1. **טופס עסק קצר** - סוג העסק, תיאור, קהל יעד, סגנון כתיבה ופלטפורמה.
2. **מחולל תוכן AI** - Gemini מפיק 5 רעיונות ויראליים, 3 תסריטים מלאים
   (הוק, תסריט, פירוק צילום, כיתוב, האשטגים, CTA), עם **ציון ויראליות (1-100)**
   והסבר לכל רעיון.
3. **מתכנן תוכן שבועי** - תוכנית ל-7 ימים עם רעיון, סוג תוכן ומטרה לכל יום.
4. **ייצוא ושמירה** - העתקה, הורדה כ-PDF, ושמירת כל הפרויקטים בדשבורד.
5. **מנויים אמיתיים עם Stripe** - הרשמה/התחברות, בחירת מסלול Free / Pro /
   Business, Stripe Checkout, פורטל ניהול מנוי (שדרוג/שדרוג לאחור/ביטול),
   Webhooks לעדכון סטטוס אוטומטי, ואזור "החשבון שלי".

## סטאק טכנולוגי

| שכבה | טכנולוגיה |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL (מומלץ Supabase/Neon/Vercel Postgres) + Drizzle ORM |
| אימות | NextAuth v5 (Credentials + Google אופציונלי) |
| AI | Google Gemini API (structured JSON output) |
| תשלומים | Stripe Checkout + Billing Portal + Webhooks |
| PDF export | html2canvas + jsPDF (רינדור בדפדפן, כולל תמיכה מלאה בעברית ו-RTL) |
| Hosting | Vercel (מומלץ - ראו מדריך פריסה למטה) |

---

## 1. הרצה מקומית

### 1.1 התקנת תלויות

```bash
npm install
```

### 1.2 הגדרת משתני סביבה

```bash
cp .env.example .env
```

טבלת כל המשתנים נמצאת בסעיף [משתני סביבה](#משתני-סביבה) למטה. לפיתוח מקומי
אפשר להשאיר את מפתחות ה-Stripe כפי שהם (placeholder) - הכפתורים הרלוונטיים
פשוט יחזירו הודעת שגיאה ידידותית עד שתגדירו מפתחות אמיתיים.

### 1.3 מסד נתונים

צריך PostgreSQL זמין (מקומי, Docker, או שירות בענן כמו Supabase). לאחר
שה-`DATABASE_URL` מוגדר:

```bash
npm run db:push
```

(`npm run db:generate` מפיק קובצי מיגרציה SQL תחת `drizzle/`, לשימוש ב-CI/CD.)

### 1.4 הרצת שרת הפיתוח

```bash
npm run dev
```

האתר יעלה בכתובת `http://localhost:3000`.

### 1.5 בדיקות לפני קומיט

```bash
npm run lint
npm run build
```

### 1.6 בדיקת תשלומים מקומית (אופציונלי)

כדי לבדוק את זרימת ה-Checkout וה-Webhooks מקומית, התקינו את [Stripe
CLI](https://docs.stripe.com/stripe-cli) והריצו בטרמינל נפרד:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

הפקודה תדפיס `whsec_...` - העתיקו אותו ל-`STRIPE_WEBHOOK_SECRET` ב-`.env`.

---

## 2. משתני סביבה

| משתנה | חובה? | הסבר |
| --- | --- | --- |
| `DATABASE_URL` | חובה | מחרוזת חיבור ל-PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | מומלץ בפרודקשן | כתובת האתר הציבורית, לבניית קישורי Stripe |
| `NEXTAUTH_URL` | חובה | כתובת האתר (זהה לכתובת שהאתר רץ עליה) |
| `NEXTAUTH_SECRET` | חובה | מפתח אקראי - `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | אופציונלי | התחברות עם Google |
| `GEMINI_API_KEY` | חובה למחולל התוכן | מפתח מ-[aistudio.google.com/apikey](https://aistudio.google.com/apikey), עם חיוב (billing) פעיל |
| `GEMINI_MODEL` | אופציונלי | ברירת מחדל `gemini-2.5-flash` |
| `STRIPE_SECRET_KEY` | חובה לתשלומים | מפתח סודי מ-Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | חובה לתשלומים | סוד האימות של ה-Webhook |
| `STRIPE_PRICE_ID_PRO` | חובה לתשלומים | Price ID (לא Product ID!) של מסלול פרו |
| `STRIPE_PRICE_ID_BUSINESS` | חובה לתשלומים | Price ID של מסלול עסקי |
| `RESEND_API_KEY` | חובה לאיפוס סיסמה בפרודקשן | מפתח מ-[resend.com](https://resend.com). ללא מפתח - קישור האיפוס נכתב ללוג השרת (דב בלבד) |
| `EMAIL_FROM` | מומלץ | כתובת השולח לאימיילים (דומיין מאומת ב-Resend) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | מומלץ בפרודקשן | Rate limiting מבוזר ב-[Upstash](https://upstash.com). ללא הגדרה - fallback ל-in-memory |

---

## 3. מבנה הפרויקט

```
src/
  app/
    layout.tsx                # שורש + מטא-דאטה/SEO (OpenGraph, Twitter)
    page.tsx                  # עמוד נחיתה
    error.tsx                 # גבול שגיאות גלובלי (Error Boundary)
    not-found.tsx             # עמוד 404 מעוצב
    robots.ts                 # robots.txt דינמי
    sitemap.ts                # sitemap.xml דינמי
    manifest.ts               # Web App Manifest (PWA)
    pricing/                  # עמוד מחירים (כפתורי Stripe Checkout)
    sign-in/, sign-up/        # אימות
    dashboard/
      layout.tsx              # שלד הדשבורד + מד שימוש יומי
      loading.tsx             # שלד טעינה (skeleton)
      page.tsx                # רשימת פרויקטים
      new/                    # טופס יצירת תוכן (= onboarding)
      projects/[id]/          # תצוגת תוכן + מתכנן שבועי + ייצוא
      account/                # "החשבון שלי" - מנוי, סטטוס, שימוש
    api/
      auth/[...nextauth]/     # NextAuth handlers
      auth/register/          # הרשמה
      generate/                # POST - יצירת חבילת תוכן (Gemini)
      plan/                    # POST - יצירת תוכנית שבועית (Gemini)
      projects/                # GET - רשימת/פרטי פרויקטים
      stripe/checkout/         # POST - יצירת Stripe Checkout Session
      stripe/portal/           # POST - יצירת Billing Portal Session
      stripe/webhook/          # POST - קליטת אירועי Stripe (ציבורי, מאומת בחתימה)
  components/                 # רכיבי UI (כולל CheckoutStatusBanner, SubscriptionActions)
  lib/
    ai/                       # קליינט Gemini + פרומפטים + סכמות zod
    db/                       # סכמת Drizzle + חיבור DB
    stripe/                   # קליינט Stripe + מיפוי price ↔ plan
    auth.ts                   # תצורת NextAuth
    usage.ts                  # אכיפת מכסת יצירות לפי תוכנית מנוי
  proxy.ts                    # הגנת נתיבי /dashboard (Next.js "proxy")
drizzle/                      # מיגרציות SQL שנוצרו מהסכמה
next.config.ts                # כותרות אבטחה (security headers)
vercel.json                   # תצורת פריסה ל-Vercel (אזור, כותרות)
```

---

## 4. איך מערכת המנויים עובדת

- **בחירת מסלול**: בעמוד `/pricing` (ובנחיתה) יש שלושה מסלולים. "חינם"
  מוביל להרשמה. "פרו"/"עסקי" קוראים ל-`POST /api/stripe/checkout`, שיוצר
  (או משתמש ב-) לקוח Stripe קיים ומחזיר קישור ל-Stripe Checkout. משתמש לא
  מחובר מועבר קודם להרשמה, ולאחריה ישירות לתשלום.
- **Webhook**: `POST /api/stripe/webhook` מאמת את חתימת הבקשה מול
  `STRIPE_WEBHOOK_SECRET` (קריטי לאבטחה - בלי זה כל אחד יכול "להתחזות"
  לתשלום מוצלח). על `checkout.session.completed` /
  `customer.subscription.updated` / `.created` המערכת מעדכנת את הפלאן, סטטוס
  המנוי ותאריך החידוש. על `customer.subscription.deleted` המשתמש חוזר
  אוטומטית ל-`FREE`.
- **ניהול מנוי**: בעמוד `/dashboard/account` יש כפתור "ניהול מנוי וחיוב"
  שפותח את [Stripe Billing Portal](https://docs.stripe.com/customer-management) -
  שם המשתמש יכול לשדרג/לשדרג לאחור בין המסלולים, לבטל מנוי, לעדכן אמצעי
  תשלום ולראות חשבוניות, בלי שנצטרך לבנות UI מותאם אישית לזה.
- **אכיפת מכסות**: `lib/usage.ts` בודק כמה יצירות בוצעו היום ומגביל לפי
  `user.plan` (`FREE` = 3 ליום, `PRO`/`BUSINESS` = ללא הגבלה). השדה `plan`
  מתעדכן אוטומטית מה-Webhook, כך שברגע שתשלום נכשל/מנוי מבוטל המכסה חוזרת
  לחינמית באופן מיידי.

---

## 5. פריסה לפרודקשן ב-Vercel

> אני (Claude) לא יכול לבצע עבורכם את הפריסה בפועל - אין לי גישה לחשבון
> Vercel/Stripe/דומיין שלכם בסביבת העבודה הזו. הפרויקט **מוכן לחלוטין**
> לפריסה - הצעדים הבאים ייקחו כ-10 דקות.

### 5.1 מסד נתונים בענן

בחרו ספק Postgres מנוהל (מומלץ [Supabase](https://supabase.com) או
[Neon](https://neon.tech) - יש להם טייר חינמי):

1. צרו פרויקט חדש, העתיקו את מחרוזת החיבור (Connection String, מצב
   "Transaction pooling" אם קיים).
2. שמרו אותה בצד - תזדקקו לה כ-`DATABASE_URL`.

### 5.2 חיבור הריפו ל-Vercel

1. היכנסו ל-[vercel.com](https://vercel.com) → **Add New → Project**.
2. חברו את חשבון ה-GitHub שלכם ובחרו את הריפו `GOALIFY`.
3. בשלב ה-Import, ודאו ש-Framework Preset מזוהה אוטומטית כ-Next.js (ברירת
   המחדל תעבוד - אין צורך בהגדרות build מיוחדות).
4. **לפני** הלחיצה על Deploy, הוסיפו את משתני הסביבה (Environment
   Variables) - ראו טבלה בסעיף 2 למעלה. לפחות: `DATABASE_URL`,
   `NEXTAUTH_URL` (יהיה כתובת ה-Vercel הזמנית שתקבלו, למשל
   `https://trendspark-ai.vercel.app`, ותעדכנו שוב אחרי חיבור דומיין),
   `NEXTAUTH_SECRET`, `GEMINI_API_KEY`.
5. לחצו **Deploy**. תקבלו כתובת ציבורית זמנית כמו
   `https://trendspark-ai-xxxx.vercel.app`.

> **הערה על `vercel.json`**: הפרויקט כולל `vercel.json` שמגדיר אזור פריסה
> `fra1` (פרנקפורט - ההשהיה הנמוכה ביותר מישראל) ומוודא שנקודת ה-Webhook
> לא נשמרת במטמון. Vercel קורא את הקובץ אוטומטית - אין צורך בפעולה ידנית.
> אם מסד הנתונים שלכם נמצא באזור אחר, שקלו לעדכן את `regions` בהתאם.

### 5.3 יצירת טבלאות במסד הפרודקשן

מהמחשב שלכם (עם Node מותקן), הריצו פעם אחת מול מסד הפרודקשן:

```bash
DATABASE_URL="<connection string מ-5.1>" npx drizzle-kit push
```

(אפשר גם להריץ את זה כ-Vercel "Deploy Hook"/CI step בעתיד, אך להרצה
ראשונית מספיק כך.)

### 5.4 חיבור דומיין משלכם

1. בפרויקט ב-Vercel: **Settings → Domains → Add**.
2. הקלידו את הדומיין שלכם (לדוגמה `trendspark.co.il`).
3. Vercel יציג רשומות DNS להוספה אצל ספק הדומיין שלכם:
   - עבור דומיין שורש: רשומת `A` שמצביעה ל-`76.76.21.21`.
   - עבור `www`: רשומת `CNAME` שמצביעה ל-`cname.vercel-dns.com`.
4. הוסיפו את הרשומות בלוח הבקרה של ספק הדומיין (GoDaddy, Namecheap,
   Cloudflare וכו'). הפצת DNS יכולה לקחת בין כמה דקות לכמה שעות.
5. ברגע שהדומיין מאומת (סימן ✓ ירוק ב-Vercel), עדכנו את `NEXTAUTH_URL`
   ו-`NEXT_PUBLIC_APP_URL` בהגדרות הסביבה של הפרויקט לדומיין הסופי
   (`https://trendspark.co.il`) ובצעו **Redeploy**.

---

## 6. הפעלת מערכת התשלומים (Stripe)

### 6.1 יצירת מוצרים ומחירים

1. פתחו חשבון ב-[dashboard.stripe.com](https://dashboard.stripe.com)
   (אפשר להתחיל ב-**Test mode** - המתג בפינה הימנית העליונה).
2. **Product catalog → Add product** - צרו מוצר "TrendSpark Pro" עם מחיר
   חוזר חודשי (Recurring, Monthly) בסכום הרצוי.
3. חזרו על כך למוצר "TrendSpark Business".
4. בכל מוצר, העתיקו את ה-**Price ID** (מתחיל ב-`price_...`, **לא**
   ה-Product ID שמתחיל ב-`prod_...`).
5. הדביקו אותם כ-`STRIPE_PRICE_ID_PRO` ו-`STRIPE_PRICE_ID_BUSINESS`
   במשתני הסביבה של Vercel.

### 6.2 מפתח ה-API

1. **Developers → API keys** → העתיקו את ה-**Secret key** (מתחיל ב-
   `sk_test_...` במצב בדיקה, `sk_live_...` במצב חי).
2. שימו אותו כ-`STRIPE_SECRET_KEY` ב-Vercel.

### 6.3 רישום ה-Webhook

1. **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://<הדומיין שלכם>/api/stripe/webhook`.
3. בחרו את האירועים: `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
4. לאחר היצירה, העתיקו את ה-**Signing secret** (מתחיל ב-`whsec_...`)
   ושימו אותו כ-`STRIPE_WEBHOOK_SECRET` ב-Vercel.
5. בצעו **Redeploy** לפרויקט כדי שמשתני הסביבה החדשים ייכנסו לתוקף.

### 6.4 הגדרת Billing Portal (כדי לאפשר שדרוג/שדרוג לאחור עצמאי)

1. **Settings → Billing → Customer portal**.
2. תחת "Products", הוסיפו את שני המוצרים (Pro, Business) ואפשרו
   "Customers can switch plans".
3. אפשרו גם "Customers can cancel subscriptions" ו-"Customers can update
   payment methods".
4. שמרו את ההגדרות.

### 6.5 מעבר ממצב בדיקה (Test) למצב חי (Live)

מצב הבדיקה משתמש בכרטיסי אשראי מדומים (למשל `4242 4242 4242 4242`) ולא
גובה כסף אמיתי - מושלם לבדיקות לפני השקה. כשאתם מוכנים לגבות כסף אמיתי:

1. השלימו את תהליך האימות העסקי של Stripe (**Activate your account** -
   פרטי עסק, חשבון בנק).
2. הפכו את המתג ל-**Live mode**.
3. חזרו על סעיפים 6.1-6.4 **במצב Live** (מוצרים, מפתח API, Webhook - כולם
   נפרדים בין Test ל-Live ולכן צריך ליצור אותם מחדש).
4. עדכנו ב-Vercel את `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_BUSINESS` לערכי ה-Live.
5. Redeploy.

### 6.6 בדיקת קצה-לקצה לפני השקה

1. גלשו לאתר בדומיין הסופי, הירשמו עם משתמש בדיקה.
2. לכו ל-`/pricing`, לחצו "שדרגו לפרו".
3. השלימו תשלום עם כרטיס בדיקה (`4242 4242 4242 4242`, כל תאריך תפוגה
   עתידי, כל CVC).
4. ודאו שהופניתם חזרה ל-`/dashboard/account` ושהתוכנית מוצגת כ-"פרו".
5. לחצו "ניהול מנוי וחיוב" ובדקו שה-Billing Portal נפתח ומאפשר ביטול/שינוי.
6. בטלו את המנוי בפורטל וודאו (אחרי כמה שניות) שהעמוד חוזר להציג "חינם".

---

## 7. אבטחה והערות פרודקשן

- ה-Webhook (`/api/stripe/webhook`) מאמת כל בקשה מול חתימת HMAC - בקשות
  ללא חתימה תקינה נדחות עם 400 ולא משפיעות על המסד.
- הרשמה/התחברות משתמשות ב-bcrypt (12 rounds) ו-NextAuth JWT sessions;
  `/dashboard/*` מוגן ב-`proxy.ts` (מפנה משתמשים לא מחוברים ל-`/sign-in`).
  נתיבי ה-API הרגישים (`generate`, `plan`, `projects`, `stripe/checkout`,
  `stripe/portal`) בודקים session בעצמם ומחזירים 401 JSON.
- אין לחשוף לעולם את `STRIPE_SECRET_KEY` ב-frontend - כל קריאות ה-Stripe
  נעשות אך ורק בצד השרת (`route.ts` handlers).
- **כותרות אבטחה**: `next.config.ts` מוסיף לכל תגובה
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` ו-`Strict-Transport-Security`, ומסיר את
  `X-Powered-By`.
- **Rate limiting** מופעל על התחברות, הרשמה, שחזור/איפוס סיסמה ו-
  `/api/generate` (ראו סעיף 9). ה-Webhook של Stripe **לא** מוגבל בכוונה -
  הוא מאומת בחתימה, ו-Stripe זקוק למסירה אמינה עם retries.
- `.env` לא נכלל ב-git (`.gitignore`); `.env.example` הוא תבנית בלבד.

### שיפורים מומלצים להמשך (לא חוסמים השקה)

- **Content-Security-Policy** מחמירה - לא נכללה כברירת מחדל כדי לא לשבור
  רינדור; מומלץ להוסיף עם nonce לאחר בדיקה.
- **תמונת OpenGraph** (`opengraph-image`) - כרגע מוגדרים תגי OG טקסטואליים
  בלבד; אפשר להוסיף תמונת שיתוף מעוצבת.
- **אימות אימייל בהרשמה** ו-**2FA** - שכבות אבטחה נוספות לגרסה עתידית.

## 9. איפוס סיסמה ו-Rate Limiting

### איפוס סיסמה
- זרימה: `/forgot-password` → אימייל עם קישור → `/reset-password?token=...`.
- הטוקן נוצר עם `crypto.randomBytes(32)`, ובמסד נשמר רק **hash (sha256)** שלו
  (הטוקן הגולמי קיים אך ורק בקישור שבאימייל). תוקף: שעה. **חד-פעמי** - נמחק
  אחרי שימוש, וכל הטוקנים הקודמים של המשתמש נמחקים בעת בקשה חדשה.
- מניעת enumeration: בקשת איפוס תמיד מחזירה תשובה גנרית, בין אם המשתמש קיים
  ובין אם לא.
- שליחת אימייל דרך Resend (`RESEND_API_KEY`). ללא מפתח - הקישור נכתב ללוג
  השרת, כדי שאפשר לפתח ולבדוק בלי ספק אימייל.

### Rate Limiting (`src/lib/rate-limit.ts`)
- Backend: Upstash Redis כשמוגדר (`UPSTASH_REDIS_REST_URL/TOKEN`), אחרת
  fallback ל-in-memory. שגיאת limiter **fail-open** (מאפשרת בקשה) כדי
  שתקלה ב-Redis לא תפיל את האתר.
- מכסות ברירת מחדל (ניתן לכוונן ב-`RATE_LIMITS`):
  התחברות 10/5 דק', הרשמה 6/שעה, שחזור סיסמה 5/15 דק', איפוס 8/15 דק',
  יצירה 20/דקה. חסימה מחזירה `429` עם הודעה ידידותית וכותרת `Retry-After`.

## 8. SEO ומוכנות למנועי חיפוש

- `src/app/layout.tsx` מגדיר `metadataBase`, כותרות דינמיות
  (`title.template`), תיאור, מילות מפתח, ותגי OpenGraph/Twitter בעברית.
- `robots.ts` ו-`sitemap.ts` מייצרים אוטומטית `robots.txt` ו-`sitemap.xml`
  (מבוססים על `NEXT_PUBLIC_APP_URL`, לכן חשוב להגדיר אותו בפרודקשן).
- `manifest.ts` מספק Web App Manifest להתקנה כ-PWA.
- נתיבי `/dashboard` ו-`/api` חסומים ל-crawlers ב-`robots.txt`.
