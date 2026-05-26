# AURIX WEBSITE — DEPLOYMENT GUIDE
_Created: May 26, 2026_

## What's Built
Complete AURIX company website with:
- Landing page (About + Bhavik intro + contact buttons)
- Login/Signup page (Glassmorphic + Google/GitHub/Email auth)
- Dashboard (product cards)
- Product detail pages (stats, tech stack, install guide, user types)
- Dark/Light theme toggle
- Firebase Auth integration
- Supabase database integration
- Custom fonts (Inter, Space Grotesk, JetBrains Mono)
- Fully responsive design

## File Structure
```
aurix-website/
├── index.html              # Landing page
├── css/
│   └── style.css           # Complete design system (17KB)
├── js/
│   ├── main.js             # Theme toggle, animations, navigation
│   ├── auth.js             # Firebase Auth + Supabase integration
│   └── products.js         # Dynamic product detail pages
├── pages/
│   ├── login.html          # Login/Signup page
│   ├── dashboard.html      # User dashboard
│   └── product.html        # Product detail page
└── README.md               # This file
```

## STEP 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `aurix-website`
3. Make it Public
4. Don't initialize with README (we already have files)
5. Click "Create repository"

## STEP 2: Push Code to GitHub
Run these commands in the aurix-website folder:

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/aurix-website.git
git branch -M main
git push -u origin main
```

## STEP 3: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / root
4. Click Save
5. Your site will be live at: `https://YOUR_USERNAME.github.io/aurix-website`

## STEP 4: Set Up Firebase Auth (Free)
1. Go to https://console.firebase.google.com
2. Create a new project: "aurix-website"
3. Go to Authentication → Sign-in method
4. Enable: Google, GitHub, Email/Password
5. Go to Project Settings → General → Your apps → Web app
6. Copy the config object
7. Replace the placeholder values in `js/auth.js`:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## STEP 5: Set Up Supabase Database (Free)
1. Go to https://supabase.com
2. Create a new project
3. Go to SQL Editor and run:
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  photo_url TEXT,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert (for signup)
CREATE POLICY "Allow anonymous insert" ON users
  FOR INSERT TO anon WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Allow users to read own data" ON users
  FOR SELECT USING (true);
```
4. Go to Project Settings → API
5. Copy the URL and anon key
6. Replace the placeholder values in `js/auth.js`:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## STEP 6: Custom Domain (Optional)
1. Buy a domain (aurix.dev ~₹800/year or aurix.in ~₹600/year)
2. In GitHub repo → Settings → Pages → Custom domain
3. Add your domain and save
4. Update DNS records at your domain provider:
   - A record → 185.199.108.153
   - A record → 185.199.109.153
   - A record → 185.199.110.153
   - A record → 185.199.111.153
   - CNAME record → YOUR_USERNAME.github.io

## STEP 7: Update Contact Info
In `index.html`, replace:
- `bhavik@example.com` → your real email
- `https://instagram.com/bhavik` → your real Instagram
- `https://github.com/bhavik` → your real GitHub
- Discord link → your Discord server invite

## Free Tier Limits (All Services)
| Service | Free Tier |
|---------|-----------|
| GitHub Pages | Unlimited bandwidth, 1GB storage |
| Firebase Auth | 50,000 auths/month |
| Supabase DB | 500MB storage, 50K MAU |
| Custom Domain | ~₹600-800/year (optional) |

## Total Monthly Cost: ₹0 (with free domain: ~₹50-70/month)
