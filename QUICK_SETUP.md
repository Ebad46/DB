# 🚀 QUICK SETUP GUIDE (5 Minutes)

## What You're Getting

✅ A complete, working dashboard  
✅ Connected to your Supabase database  
✅ Month filtering with beautiful charts  
✅ Professional design  
✅ Ready to deploy online  

## Prerequisites

You need **Node.js** installed on your computer.

**Don't have it?**
1. Go to https://nodejs.org
2. Download "LTS" version
3. Install it (next → next → finish)
4. Restart your terminal

**Check if installed:**
```bash
node --version
```

Should show a version like `v18.0.0` or higher.

---

## Installation Steps

### Step 1: Open Terminal
- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac:** Press `Cmd + Space`, type `terminal`, press Enter
- **Linux:** Press `Ctrl + Alt + T`

### Step 2: Navigate to Folder
```bash
cd path/to/vape-dashboard
```

Replace with your actual folder path.

### Step 3: Install Dependencies (2-3 minutes)
```bash
npm install
```

Wait for completion. You'll see "added XXX packages" at the end.

### Step 4: Start Server (30 seconds)
```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.0
Local:        http://localhost:3000
```

### Step 5: Open Dashboard
1. Open your browser (Chrome, Firefox, Safari, Edge)
2. Go to: `http://localhost:3000`
3. See your dashboard! 🎉

---

## Quick Customization

### Change Title
1. Open `app/page.tsx` in text editor
2. Find: `<h1>📊 Monthly Trend Dashboard</h1>`
3. Change to: `<h1>📊 MY COMPANY Dashboard</h1>`
4. Save (Ctrl+S)
5. Browser updates automatically!

### Change Colors
1. Open `app/globals.css`
2. Find: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
3. Change `#667eea` to any color code (Google "color picker")
4. Save file
5. See color change instantly!

---

## Testing Features

✅ **Month Buttons** - Click to filter data  
✅ **Charts** - Should show bars for each store  
✅ **Table** - Scroll down to see complete data  
✅ **Mobile** - Make window small, see responsive layout  

All working? Perfect! 🎊

---

## Stop & Restart

### Stop Server
Press: `Ctrl + C`

### Start Again
```bash
npm run dev
```

---

## Deploy Online (Next Step)

When ready, follow the DEPLOYMENT_GUIDE.md

**Quick Option: Vercel (5 minutes)**
1. Push code to GitHub
2. Go to vercel.com
3. Select repository
4. Click Deploy

Your dashboard is LIVE! 🚀

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| npm not found | Install Node.js from nodejs.org |
| Port 3000 in use | Run: `npm run dev -- -p 3001` |
| No data showing | Refresh page (Ctrl+F5) or restart server |
| Styling broken | Clear cache (Ctrl+Shift+Delete) |
| Lost connection | Check Supabase status |

---

## Next Steps

1. ✅ Install and run locally
2. ✅ Test all features
3. ✅ Customize colors/title
4. ✅ Read DEPLOYMENT_GUIDE.md
5. ✅ Deploy to Vercel
6. ✅ Share your live URL!

---

**That's it! You're all set!** 🎉

For more info, read: README.md

Happy analyzing! 📊✨
