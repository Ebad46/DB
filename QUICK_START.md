# 🚀 QUICK START GUIDE - Monthly Trend Dashboard

## What You Get

✅ Interactive dashboard with real-time data from your Supabase database
✅ Month filtering with dynamic buttons (Nov, Oct, etc.)
✅ 3 different bar charts (Sales, Gallons, % Change)
✅ Complete data table with all columns
✅ Beautiful UI with responsive design
✅ Production-ready code

---

## Installation (5 Minutes)

### Step 1: Open Terminal/Command Prompt
Navigate to your project folder:
```bash
cd path/to/vape-time-dashboard
```

### Step 2: Install Dependencies
```bash
npm install
```

This will download all required packages (Next.js, Supabase, Recharts, etc.)

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Dashboard
Open your browser and go to:
```
http://localhost:3000
```

You should see your dashboard loading! 🎉

---

## Publishing (Deploy to the Web)

### Option A: Deploy to Vercel (EASIEST - FREE)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub account
4. Select your project repository
5. Click "Deploy"
6. Done! Your dashboard is live on the internet

**Your live URL will look like:** `https://your-dashboard.vercel.app`

### Option B: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Deploy!

### Option C: Deploy on Your Own Server

```bash
npm run build
npm start
```

---

## Features Overview

### 📊 Month Selection
- Click any month button at the top to filter data
- All charts and tables update automatically
- Shows all unique months from your database

### 💰 Sales Chart
- Compares current vs previous period sales
- Organized by store
- Hover for exact values

### ⛽ Gallons Chart
- Shows gallons sold per store
- Current vs previous comparison
- Visual trend analysis

### 📈 Percentage Change
- See which stores grew the most
- Green = positive growth
- Red = negative growth

### 📋 Data Table
- Complete data for selected month
- All columns from your database
- Formatted numbers and percentages
- Color-coded values

---

## File Structure

```
vape-time-dashboard/
├── app/
│   ├── page.tsx          ← Main dashboard (EDIT HERE for changes)
│   ├── layout.tsx        ← Page structure
│   └── globals.css       ← Styling (colors, fonts, etc.)
├── lib/
│   └── supabase.ts       ← Database connection (configured)
├── package.json          ← Dependencies
├── README.md             ← Full documentation
└── .gitignore           ← Files to ignore in git
```

---

## Customization Examples

### Change Colors
In `app/globals.css`, find:
```css
/* Change these color codes */
#667eea   ← Primary color
#764ba2   ← Secondary color
```

### Change Chart Title
In `app/page.tsx`, find:
```tsx
<h2>💰 Sales Comparison by Store</h2>
```
Change text as needed

### Add/Remove Columns in Table
In `app/page.tsx`, search for `<table>` and modify the `<th>` headers

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm not found" | Install Node.js from nodejs.org |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| No data showing | Restart server: Stop with Ctrl+C, then `npm run dev` |
| Charts look weird | Clear browser cache (Ctrl+Shift+Delete) |
| Database connection error | Check Supabase URL in `lib/supabase.ts` |

---

## Environment Info

- **Node.js Required:** v18.0.0 or higher
- **Database:** Supabase (already connected)
- **Hosting:** Any (Vercel, Netlify, AWS, etc.)
- **Browser:** Any modern browser (Chrome, Firefox, Safari, Edge)

---

## Need Help?

1. **Check the README.md** - Has detailed documentation
2. **View Console Errors** - Press F12 in browser, check Console tab
3. **Supabase Docs** - https://supabase.com/docs
4. **Next.js Docs** - https://nextjs.org/docs

---

## Production Checklist

Before publishing:
- ✅ Test all month filters
- ✅ Verify charts display correctly
- ✅ Check table data is accurate
- ✅ Test on mobile device
- ✅ Review colors and styling
- ✅ Test database connection

---

## Next Steps

1. **Customize Styling** - Edit `app/globals.css` to match your brand
2. **Add Your Logo** - Edit `app/layout.tsx` header
3. **Deploy** - Push to Vercel or Netlify
4. **Share URL** - Send your live dashboard link to stakeholders
5. **Collect Feedback** - Make improvements based on user feedback

---

Built with ❤️ - Your Interactive Dashboard is Ready! 🚀
