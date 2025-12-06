# 🎬 STEP-BY-STEP WALKTHROUGH

Follow along like a video tutorial to get your dashboard running!

---

## ⏱️ Time Required: 5-10 minutes

### What You'll Learn:
✅ Install dependencies
✅ Start the dashboard
✅ View real data from your database
✅ Test all features
✅ Prepare to deploy

---

## 🎯 STEP 1: Download the Project (1 minute)

You should have these files in your folder:

```
vape-time-dashboard/
├── app/
│   ├── page.tsx          (main dashboard)
│   ├── layout.tsx        (page structure)
│   └── globals.css       (styling)
├── lib/
│   └── supabase.ts       (database)
├── package.json          (dependencies)
└── ... other files
```

**✓ Check:** All files present? Continue to Step 2

---

## 🎯 STEP 2: Open Terminal/Command Prompt (30 seconds)

**Windows:**
- Press `Win + R`
- Type `cmd`
- Press Enter

**Mac:**
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

**Linux:**
- Press `Ctrl + Alt + T`

A black window should open.

**✓ Check:** Terminal open? Continue to Step 3

---

## 🎯 STEP 3: Navigate to Project Folder (1 minute)

In terminal, type:

```bash
cd path/to/vape-time-dashboard
```

Replace `path/to/vape-time-dashboard` with your actual folder path.

Example:
```bash
cd C:\Users\YourName\Desktop\vape-time-dashboard
```

Or:
```bash
cd ~/Desktop/vape-time-dashboard
```

Then press Enter.

**✓ Check:** You see the folder path in terminal? Continue to Step 4

---

## 🎯 STEP 4: Install Node.js (If Needed) (3-5 minutes)

Check if Node.js is installed:

```bash
node --version
```

If you see a version number (like `v18.0.0`), skip to Step 5.

If you see "not found" or "not recognized":

1. Go to https://nodejs.org
2. Download "LTS" (Long Term Support)
3. Run the installer
4. Follow installation wizard (click Next → Agree → Install)
5. Restart your terminal
6. Test: `node --version` again

**✓ Check:** Node version shows? Continue to Step 5

---

## 🎯 STEP 5: Install Dependencies (2-3 minutes)

In terminal, type:

```bash
npm install
```

This will:
- Download React
- Download Next.js
- Download Supabase
- Download Recharts
- Download Lucide icons
- Download TypeScript

You'll see lots of text scrolling. This is normal! ⏳ Wait until you see:

```
added 500+ packages
```

**✓ Check:** See "added packages" message? Continue to Step 6

---

## 🎯 STEP 6: Start Development Server (30 seconds)

Type:

```bash
npm run dev
```

You'll see output like:

```
▲ Next.js 15.0.0

Local:        http://localhost:3000
```

**✓ Check:** See "localhost:3000"? Continue to Step 7

---

## 🎯 STEP 7: Open Dashboard in Browser (30 seconds)

1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: `http://localhost:3000`

You should see:

```
📊 Monthly Trend Dashboard
Track sales and performance metrics across all stores
```

With colorful buttons for each month!

**✓ Check:** Dashboard visible with data? Continue to Step 8

---

## 🎯 STEP 8: Test All Features (2 minutes)

### Test 1: Month Selector
- Click "NOV" button
- See data update
- Click "OCT" button
- Charts change automatically

✅ Working? Great!

### Test 2: Charts
- See bar chart with store names
- Sales values showing
- Two bars per store (Current vs Previous)

✅ Working? Great!

### Test 3: Data Table
- Scroll down to see complete table
- All columns visible
- Values properly formatted

✅ Working? Great!

### Test 4: Responsiveness
- Make browser window narrow
- Elements adjust nicely
- Mobile-friendly layout

✅ All tests pass? Continue to Step 9

---

## 🎯 STEP 9: Make Your First Customization (2 minutes)

### Change the Dashboard Title

1. Open file: `app/page.tsx` in a text editor
2. Find line: `<h1>📊 Monthly Trend Dashboard</h1>`
3. Change to: `<h1>📊 MY STORE Dashboard</h1>`
4. Save file (Ctrl+S)
5. Check browser - it auto-refreshes!

See the change instantly? ✅

### Change Colors

1. Open file: `app/globals.css`
2. Find line: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
3. Change `#667eea` to `#ff6b6b` (red)
4. Save file
5. Check browser - header is now red!

See the color change? ✅

---

## 🎯 STEP 10: Connect to GitHub (Optional but Recommended) (3 minutes)

If you want to deploy later, save code to GitHub:

### First Time Setup:

```bash
git init
git add .
git commit -m "Initial dashboard commit"
```

### Link to GitHub:

1. Go to https://github.com
2. Create new repository (name: `vape-time-dashboard`)
3. Copy the commands provided
4. Paste them in terminal

Done! Code is backed up. ✅

---

## 🎯 STEP 11: Stop Development Server (30 seconds)

When you want to stop the server:

In terminal, press:

```
Ctrl + C
```

You'll see:

```
^C
```

Server is now stopped. ✓

---

## 🎯 STEP 12: Restart Server Later (30 seconds)

When you want to start again:

```bash
npm run dev
```

Server starts! Go to http://localhost:3000

---

## 🎯 READY TO DEPLOY? (Next Phase)

Once you're happy with your dashboard:

### To Deploy to Vercel (Recommended):

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Final dashboard"
   git push
   ```

2. **Go to** https://vercel.com
3. **Click** "New Project"
4. **Select** your GitHub repository
5. **Click** "Deploy"
6. **Wait** 2-3 minutes...
7. **Your dashboard is LIVE!** 🚀

See: https://DEPLOYMENT_GUIDE.md for full instructions

---

## 🔍 Troubleshooting This Walkthrough

| Problem | Solution |
|---------|----------|
| "npm: not found" | Install Node.js from nodejs.org |
| Port 3000 in use | Change port: `npm run dev -- -p 3001` |
| Files not visible | Make sure all files were extracted |
| No data showing | Verify "Monthly Trend" table exists in database |
| Styling looks wrong | Clear browser cache: Ctrl+Shift+Delete |
| Changes not reflecting | Restart server: Ctrl+C, then `npm run dev` |

---

## ✅ Congratulations! 🎉

You've successfully:
- ✅ Installed the dashboard
- ✅ Connected to your database
- ✅ Viewed real data
- ✅ Tested all features
- ✅ Made customizations
- ✅ Ready to deploy!

---

## 📚 Next Steps

1. **Read QUICK_START.md** - For more details
2. **Read DEPLOYMENT_GUIDE.md** - To deploy online
3. **Customize colors** - In app/globals.css
4. **Add your logo** - In app/page.tsx header
5. **Deploy to Vercel** - Make it live!

---

## 💡 Tips & Tricks

### Speed Up Development:
- Save files with Ctrl+S
- Use Ctrl+Shift+R for hard browser refresh
- Keep terminal window visible

### Debug Issues:
- Press F12 in browser for Developer Tools
- Check Console tab for errors
- Read error messages carefully

### Make Backups:
- Commit to GitHub daily
- Keep local backups
- Use `git push` after changes

---

## 🎓 What You've Learned

By following this walkthrough, you now know:

✅ How Next.js projects work
✅ How to install npm packages
✅ How to start a development server
✅ How to customize React components
✅ How to connect to a database
✅ How to test your application
✅ How to prepare for deployment

**You're officially a Next.js developer!** 🚀

---

## 🆘 Still Need Help?

1. **Check error message** - Google it!
2. **Read the docs** - In README.md
3. **Check Vercel logs** - If deploying
4. **Check browser console** - Press F12

---

## 🎬 Video Alternative

Can't follow this guide? Watch YouTube tutorials:
- Search "Next.js tutorial"
- Search "Supabase setup"
- Search "Vercel deployment"

---

**Your dashboard is now ready to shine! 🌟**

Continue to DEPLOYMENT_GUIDE.md when ready to go live!
