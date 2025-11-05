# 💾 Free Up Disk Space Guide

## Quick Option: Delete Large Folders (Recommended)

These folders are ignored by Git and can be regenerated:

```powershell
# Delete node_modules (can be reinstalled)
Remove-Item -Recurse -Force node_modules

# Delete Android build files
Remove-Item -Recurse -Force android\build
Remove-Item -Recurse -Force android\app\build

# Delete Expo build outputs
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force web-build

# Delete admin-dashboard (if not needed)
Remove-Item -Recurse -Force admin-dashboard

# Delete Android Gradle cache (optional)
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches
```

Then reinstall dependencies:
```powershell
npm install
```

## Full Option: Delete Everything and Restore from Git

### Step 1: Make sure everything is committed
```powershell
git status
# Should show "working tree clean"
```

### Step 2: Navigate to parent directory
```powershell
cd ..
```

### Step 3: Delete the entire project folder
```powershell
Remove-Item -Recurse -Force mustiapp
```

### Step 4: Clone from Git again
```powershell
git clone https://github.com/adoneabiilesh/mustiapp.git
cd mustiapp
```

### Step 5: Install dependencies
```powershell
npm install
```

### Step 6: Set up environment variables
```powershell
# Create .env file with your values
# Copy from .env.example if available
```

## What You'll Lose (and How to Restore)

### ✅ Safe to Delete (will be restored from Git):
- All source code (`app/`, `components/`, `lib/`)
- Configuration files (`app.json`, `package.json`, etc.)
- Assets (`assets/`)
- Migrations (`supabase/migrations/`)

### ❌ Will NOT be restored (need to recreate):
- `.env` file (create new with your values)
- `node_modules/` (run `npm install`)
- Build outputs (`android/build/`, `dist/`, `.expo/`)
- Android keystore files (if you have custom ones)

## Estimated Space Saved

- `node_modules/`: ~500MB - 1GB
- `android/build/`: ~200MB - 500MB
- `.expo/`: ~100MB - 200MB
- `dist/`: ~50MB - 100MB
- `admin-dashboard/node_modules/`: ~200MB - 500MB

**Total: ~1GB - 2GB+**

