# ✅ Installation Checklist

Follow these steps in order to get your dashboard running!

## Pre-Installation (5 minutes)

- [ ] **Check Node.js**
  ```bash
  node --version
  ```
  Should show v18.0.0 or higher. If not, install from https://nodejs.org

- [ ] **Read 00_READ_ME_FIRST.md** (this file gives overview)

- [ ] **Choose your learning path:**
  - [ ] Fast path → Read QUICK_SETUP.md
  - [ ] Detailed → Read STEP_BY_STEP.md
  - [ ] Complete → Read README.md

## Installation (3 minutes)

- [ ] **Open Terminal**
  - Windows: `Win + R` → type `cmd` → Enter
  - Mac: `Cmd + Space` → type `terminal` → Enter
  - Linux: `Ctrl + Alt + T`

- [ ] **Navigate to project folder**
  ```bash
  cd path/to/vape-dashboard
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```
  Wait until "added XXX packages" appears

## Running (30 seconds)

- [ ] **Start development server**
  ```bash
  npm run dev
  ```

- [ ] **See the output**
  You should see:
  ```
  ▲ Next.js 15.0.0
  Local:        http://localhost:3000
  ```

- [ ] **Open in browser**
  Go to: http://localhost:3000
  
- [ ] **See your dashboard!** 🎉

## Testing (2 minutes)

- [ ] **Month buttons work**
  Click different months, data updates

- [ ] **Charts display**
  See bars for each store

- [ ] **Table shows data**
  Scroll down to see complete table

- [ ] **Mobile responsive**
  Make window smaller, see layout adjust

## Quick Customization (Optional - 2 minutes)

- [ ] **Change title** (optional)
  1. Open `app/page.tsx`
  2. Find: `<h1>📊 Monthly Trend Dashboard</h1>`
  3. Change text to: `<h1>📊 MY DASHBOARD</h1>`
  4. Save (Ctrl+S)
  5. See change in browser!

- [ ] **Change colors** (optional)
  1. Open `app/globals.css`
  2. Find: `#667eea` (purple)
  3. Change to any color (Google "color picker" for codes)
  4. Save file
  5. Colors update instantly!

## Deployment Preparation (When Ready)

- [ ] **Everything working locally?** → Yes ✓
- [ ] **Read DEPLOYMENT_GUIDE.md**
- [ ] **Create GitHub account** (free at github.com)
- [ ] **Push code to GitHub**
- [ ] **Deploy to Vercel** (5 minutes)
- [ ] **Share live URL** with your team

## Troubleshooting

**npm install fails:**
- [ ] Check Node.js installed: `node --version`
- [ ] Update npm: `npm install -g npm@latest`
- [ ] Delete `node_modules` folder
- [ ] Try `npm install` again

**npm run dev fails:**
- [ ] Stop server: `Ctrl + C`
- [ ] Check no other app using port 3000
- [ ] Try different port: `npm run dev -- -p 3001`
- [ ] Restart terminal

**Dashboard won't load:**
- [ ] Check browser console: Press F12
- [ ] Refresh page: `Ctrl + F5`
- [ ] Check Supabase connection in `lib/supabase.ts`
- [ ] Restart server

**No data showing:**
- [ ] Verify "Monthly Trend" table exists
- [ ] Check table has data
- [ ] Ensure "Month" column has values
- [ ] Refresh page

**Can't find files:**
- [ ] Check you're in correct folder
- [ ] List files: `ls` (Mac/Linux) or `dir` (Windows)
- [ ] Download again if missing

## Success Indicators

You're done when you see:
- ✅ Dashboard loads at http://localhost:3000
- ✅ Month buttons visible
- ✅ Charts display with data
- ✅ Table shows store information
- ✅ Mobile responsive (window resize works)

---

## Post-Installation

### Keep Your Dashboard Updated
```bash
# Check for package updates
npm outdated

# Update all packages
npm update
```

### Save Your Code
```bash
# If you made changes
git add .
git commit -m "My changes"
git push
```

### Next Steps
1. Read DEPLOYMENT_GUIDE.md
2. Deploy to Vercel
3. Share with team
4. Monitor dashboard

---

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Stop server
Ctrl + C

# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list

# Install specific package
npm install package-name

# Remove package
npm uninstall package-name
```

---

## File Locations

**Make changes in these files:**
- Dashboard: `app/page.tsx`
- Styling: `app/globals.css`
- Database: `lib/supabase.ts`

**Don't change:**
- `package.json` (unless adding packages)
- `tsconfig.json`
- `next.config.js`

---

## Time Summary

| Step | Time |
|------|------|
| Node.js install (if needed) | 5 min |
| npm install | 2-3 min |
| Start server | 30 sec |
| Open dashboard | 30 sec |
| Testing features | 2 min |
| Customization | 2 min |
| **Total** | **~15 min** |

---

## Success! 🎉

Your dashboard is running locally!

**Next:** Read DEPLOYMENT_GUIDE.md to publish online

Questions? Check the other markdown files (README.md, etc.)

---

**You're all set! Let's go!** 🚀
