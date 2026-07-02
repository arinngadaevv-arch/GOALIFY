# TrendSpark AI 📊

מחולל תוכן AI לרשתות חברתיות לעסקים קטנים - הופכים בעלי עסקים ליוצרי תוכן
ויראלי לטיקטוק ואינסטגרם תוך שניות, באמצעות Claude AI.

## מה המוצר עושה

1. **טופס עסק קצר** - סוג העסק, תיאור, קהל יעד, סגנון כתיבה ופלטפורמה.
2. **מחולל תוכן AI** - Claude מפיק 5 רעיונות ויראליים, 3 תסריטים מלאים
   (הוק, תסריט, פירוק צילום, כיתוב, האשטגים, CTA), עם **ציון ויראליות (1-100)**
   והסבר לכל רעיון.
3. **מתכנן תוכן שבועי** - תוכנית ל-7 ימים עם רעיון, סוג תוכן ומטרה לכל יום.
4. **ייצוא ושמירה** - העתקה, הורדה כ-PDF, ושמירת כל הפרויקטים בדשבורד.
5. **מודל מנוי** - חינם (3 יצירות ביום), פרו (ללא הגבלה), עסקי (ניהול צוותים).

## סטאק טכנולוגי

| שכבה | טכנולוגיה |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL (מומלץ Supabase) + Drizzle ORM |
| אימות | NextAuth v5 (Credentials + Google אופציונלי) |
| AI | Anthropic Claude API (structured output דרך tool-use) |
| PDF export | html2canvas + jsPDF (רינדור בדפדפן, כולל תמיכה מלאה בעברית ו-RTL) |

## התחלה מהירה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת משתני סביבה

העתיקו את `.env.example` ל-`.env` ומלאו:

```bash
cp .env.example .env
```

- `DATABASE_URL` - חיבור ל-PostgreSQL/Supabase.
- `NEXTAUTH_SECRET` - מפתח אקראי (`openssl rand -hex 32`).
- `ANTHROPIC_API_KEY` - מפתח API של Claude מ-[console.anthropic.com](https://console.anthropic.com).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - אופציונלי, להתחברות עם גוגל.

### 3. יצירת סכמת מסד הנתונים

```bash
npm run db:push
```

(משתמש ב-Drizzle Kit; ניתן גם `npm run db:generate` להפקת קובצי מיגרציה
SQL תחת `drizzle/`.)

### 4. הרצה בסביבת פיתוח

```bash
npm run dev
```

האתר יעלה בכתובת `http://localhost:3000`.

### 5. בדיקות לפני פרודקשן

```bash
npm run lint
npm run build
```

## מבנה הפרויקט

```
src/
  app/
    page.tsx                  # עמוד נחיתה
    pricing/                  # עמוד מחירים
    sign-in/, sign-up/        # אימות
    dashboard/
      layout.tsx              # שלד הדשבורד + מד שימוש יומי
      page.tsx                # רשימת פרויקטים
      new/                    # טופס יצירת תוכן (= onboarding)
      projects/[id]/          # תצוגת תוכן + מתכנן שבועי + ייצוא
    api/
      auth/[...nextauth]/     # NextAuth handlers
      auth/register/          # הרשמה
      generate/                # POST - יצירת חבילת תוכן (Claude)
      plan/                    # POST - יצירת תוכנית שבועית (Claude)
      projects/                # GET - רשימת/פרטי פרויקטים
  components/                 # רכיבי UI (טופס, כרטיסי ציון ויראליות וכו')
  lib/
    ai/                       # קליינט Claude + פרומפטים + סכמות zod
    db/                       # סכמת Drizzle + חיבור DB
    auth.ts                   # תצורת NextAuth
    usage.ts                  # אכיפת מכסת יצירות לפי תוכנית מנוי
  proxy.ts                    # הגנת נתיבי /dashboard (Next.js "proxy" - במקום middleware)
drizzle/                      # מיגרציות SQL שנוצרו מהסכמה
```

## איך יצירת התוכן עובדת

`src/lib/ai/generate.ts` שולח ל-Claude פרומפט מערכת שמכוון אותו לפעול
כאסטרטג תוכן ויראלי בעברית, ומכריח פלט **JSON מובנה** דרך מנגנון ה-tool-use
של Claude (`tool_choice` מוגדר לכלי ייעודי) - כך שהתשובה תמיד מגיעה בפורמט
קבוע ומאומת מול סכמת Zod, ללא צורך בפרסור טקסט חופשי.

## פריסה לפרודקשן (Vercel)

1. חברו את הריפו ל-Vercel.
2. הגדירו את משתני הסביבה מה-`.env.example` בהגדרות הפרויקט.
3. הריצו `npm run db:push` מול מסד הפרודקשן (או הגדירו CI שמריץ זאת).
4. פרסו - Vercel יריץ `next build` אוטומטית.
