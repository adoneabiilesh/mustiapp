# 📱 Testing APK Guide - Share via Link

Yes! You can build an APK and share it via a link for testing. Here's how:

## ✅ Quick Answer

**Yes, you can:**
1. Build a preview APK (no Play Store needed)
2. Share it via a link (Google Drive, Dropbox, etc.)
3. Test on any Android device
4. Use placeholder logos for testing (your current assets should work fine)

## 🚀 Step 1: Build Preview APK

### Option A: Using EAS (Recommended)

```bash
# Build preview APK
npm run build:android:preview

# Or manually:
eas build --platform android --profile preview
```

**What happens:**
- EAS builds your APK in the cloud
- Takes 10-15 minutes
- You get a download link when done
- **You can share this EAS link directly!**

### Option B: Local Build (If you have Android Studio)

```bash
# Build locally
npx expo run:android --variant release

# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

## 📤 Step 2: Share APK via Link

### Method 1: Use EAS Download Link (Easiest)

When your build completes, EAS provides a download link:
- **Copy the download URL from EAS dashboard**
- **Share this URL directly** - users can download and install

**Steps:**
1. Go to [expo.dev](https://expo.dev) > Your project > Builds
2. Find your completed build
3. Copy the download link
4. Share link (email, WhatsApp, etc.)

### Method 2: Upload to Google Drive

1. **Download APK** from EAS
2. **Upload to Google Drive:**
   - Go to drive.google.com
   - Upload APK file
   - Right-click > Get link
   - Set permission to "Anyone with the link"
   - Copy link
3. **Share the link**

**Download link format:**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

### Method 3: Upload to Dropbox

1. **Download APK** from EAS
2. **Upload to Dropbox:**
   - Upload APK file
   - Right-click > Copy link
   - Share the link
3. **Change link format** (replace `www` with `dl`):
   ```
   https://www.dropbox.com/... → https://dl.dropbox.com/...
   ```

### Method 4: Use File Sharing Services

- **WeTransfer**: [wetransfer.com](https://wetransfer.com) - Free, 2GB limit
- **Send Anywhere**: [send-anywhere.com](https://send-anywhere.com)
- **Firebase App Distribution**: Free for testing
- **GitHub Releases**: If you have a repo

## 📱 Step 3: Install on Device

### For Testers:

1. **Click the shared link** on their Android device
2. **Download the APK**
3. **Enable "Install from Unknown Sources":**
   - Settings > Security > Unknown Sources (enable)
   - Or Settings > Apps > Special access > Install unknown apps
4. **Install the APK:**
   - Open Downloads folder
   - Tap the APK file
   - Tap "Install"
   - Wait for installation
5. **Open the app** and test!

## 🎨 About Logos/Assets

### Current Status:
- ✅ You already have assets:
  - `assets/icon.png`
  - `assets/adaptive-icon.png`
  - `assets/splash.png`
- ✅ These will be included in the APK
- ✅ You can test with current assets

### For Testing:
- **Placeholder logos are fine** for testing
- **Replace with final logos** before Play Store release
- **Current assets work** - no need to wait

### To Update Assets:
1. Replace files in `assets/` folder:
   - `icon.png` - 1024x1024px
   - `adaptive-icon.png` - 1024x1024px
   - `splash.png` - Your splash screen
2. Rebuild APK:
   ```bash
   npm run build:android:preview
   ```

## 🔧 Quick Commands

```bash
# Build preview APK
npm run build:android:preview

# Check build status
eas build:list

# View build details
eas build:view
```

## 📋 Testing Checklist

Before sharing:
- [ ] APK builds successfully
- [ ] Test on your device first
- [ ] Verify app opens and works
- [ ] Check all major features
- [ ] Share download link with testers
- [ ] Provide installation instructions

## 🚨 Important Notes

### Security:
- **APK files are safe** - they're just app installers
- **Testers need to enable "Unknown Sources"** to install
- **Only share with trusted testers** during development

### Installation:
- **First installation:** Users need to enable "Unknown Sources"
- **Updates:** Can install new APK directly (overwrites old version)
- **Uninstall:** Can remove app like any other app

### File Size:
- APK size: Usually 20-50MB
- Make sure link allows large file downloads
- Google Drive works well for large files

## 💡 Pro Tips

1. **Version Testing:**
   - Update version in `app.json` before each build
   - Testers can see which version they have
   
2. **Multiple Testers:**
   - Share same link with all testers
   - No need to build separate APKs

3. **Quick Updates:**
   - Make changes
   - Rebuild APK
   - Share new link
   - Testers install new version

4. **Feedback Collection:**
   - Create Google Form for feedback
   - Share form link with APK link
   - Collect bug reports and suggestions

## 📝 Example Workflow

```bash
# 1. Make your changes
# ... edit code ...

# 2. Build APK
npm run build:android:preview

# 3. Wait for build (10-15 min)
# ... check EAS dashboard ...

# 4. Copy download link from EAS
# ... share link with testers ...

# 5. Testers install and test
# ... collect feedback ...

# 6. Fix issues and rebuild
npm run build:android:preview
```

## 🎯 Summary

✅ **Yes, you can share APK via link**
✅ **No Play Store needed for testing**
✅ **Current logos/assets work fine**
✅ **Easy to share and test**
✅ **Quick iteration for updates**

**Ready to build?**
```bash
npm run build:android:preview
```

Then share the EAS download link with your testers! 🚀

