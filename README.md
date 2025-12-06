# 📊 Monthly Trend Dashboard

A professional, production-ready Next.js dashboard connected to your Supabase database for viewing monthly sales trends and analytics.

## ✨ Features

✅ **Real-time Database Connection** - Connects directly to Supabase Monthly Trend table  
✅ **Month Filtering** - Click buttons to filter by month (Nov, Oct, Sept, etc.)  
✅ **3 Interactive Charts** - Sales, Gallons, and % Change visualizations  
✅ **Statistics Cards** - Key metrics at a glance  
✅ **Complete Data Table** - All columns with formatted values  
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile  
✅ **Professional UI** - Beautiful gradient design with smooth animations  
✅ **Fast Performance** - Optimized for production use  

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. View Dashboard
Open your browser: `http://localhost:3000`

You should see your dashboard with real data from your database!

## 📋 Project Structure

```
vape-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard component
│   ├── layout.tsx            # HTML structure
│   └── globals.css           # All styling
├── lib/
│   └── supabase.ts           # Database connection
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js settings
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🔧 Technology Stack

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Supabase** - Backend & database
- **Recharts** - Chart visualization
- **Lucide React** - Icons

## 🎨 Customization

### Change Colors
Edit `app/globals.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Change `#667eea` and `#764ba2` to your desired colors.

### Change Dashboard Title
Edit `app/page.tsx`:
```tsx
<h1>📊 Your Custom Title Here</h1>
```

### Add More Charts
Copy an existing `<BarChart>` component and modify the data key:
```tsx
<Bar dataKey="yourDataKey" fill="#667eea" name="Your Label" />
```

## 📦 Database Integration

The dashboard connects to Supabase table: **Monthly Trend**

**Table Columns Used:**
- `Store Name` - Store identifier
- `Inside Sales NOV 25 (Projected)` - Current sales
- `Inside Sales NOV 24` - Previous sales
- `DIFFERENCE` - Sales difference
- `% CHANGE` - Percentage change
- `Gallons NOV 25 (Projected)` - Current gallons
- `Gallons NOV 24` - Previous gallons
- `DIFFERENCE_1` - Gallons difference
- `Month` - Month identifier

**No modifications needed!** The connection is already configured in `lib/supabase.ts`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Select "New Project"
4. Choose your repository
5. Click "Deploy"

Your dashboard will be live in minutes!

### Deploy to Netlify

1. Build locally: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`
6. Deploy!

### Self-Hosted

```bash
npm run build
npm start
```

The app starts on port 3000 by default.

## 📊 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔍 Troubleshooting

### Dashboard not loading?
- Ensure Supabase URL and key are correct in `lib/supabase.ts`
- Check browser console (F12) for errors
- Verify "Monthly Trend" table exists in your database

### Data not showing?
- Refresh the page (Ctrl+F5)
- Check that "Month" column has values in database
- Ensure table has data

### Styling looks wrong?
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server (Ctrl+C, then `npm run dev`)

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:
- **Desktop:** Full layout with all features
- **Tablet:** Adjusted spacing and font sizes
- **Mobile:** Optimized for small screens

## 🔒 Security

- Uses Supabase **publishable API key** (safe to expose)
- Only has read permissions on database
- No sensitive data exposed
- Database credentials not in client code

## 📝 Environment Variables

Current setup requires **no** environment variables! All configuration is in `lib/supabase.ts`

## 💡 Tips & Tricks

### Speed Up Development
- Save files with Ctrl+S
- Use Ctrl+Shift+R for hard browser refresh
- Check console (F12) for debug messages

### Add Error Handling
The dashboard automatically handles:
- Missing data
- Database connection errors
- Invalid month selections
- Null values in tables

### Monitor Performance
- Use Chrome DevTools (F12)
- Check Network tab for load times
- Use Performance tab for optimization

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Recharts Examples](https://recharts.org/examples)
- [React Hooks Guide](https://react.dev/reference/react)

## 🤝 Contributing

To modify this dashboard:
1. Edit `app/page.tsx` for components
2. Edit `app/globals.css` for styling
3. Edit `lib/supabase.ts` for database queries
4. Test locally: `npm run dev`
5. Deploy changes

## 📄 License

MIT - Feel free to use this dashboard for your business

## 🙌 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Review error messages in the UI
3. Check Supabase logs for database errors
4. Read the documentation files

## 🎉 You're All Set!

Your dashboard is ready to use. Start by running:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser!

Happy analyzing! 📊✨
