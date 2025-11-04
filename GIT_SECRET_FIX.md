# 🔐 Git Secret Detection Fix

## Issue

GitHub push protection detected a Stripe API key in commit `feb94f7` in file `.env`.

## Solutions

### Option 1: Allow the Secret (If it's a test key)
GitHub has provided a URL to allow this secret:
https://github.com/adoneabiilesh/mustiapp/security/secret-scanning/unblock-secret/352070mevuilL3c4XdDTZWkJvEt

**Steps:**
1. Visit the URL above
2. Click "Allow secret" (only if it's a test/development key)
3. Try pushing again: `git push origin main`

### Option 2: Remove Secret from History (Recommended)

If the secret is real (production key), you should remove it from history:

```bash
# Remove .env from that specific commit
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ This rewrites history)
git push origin main --force
```

### Option 3: Use BFG Repo-Cleaner (Easier)

```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env from all commits
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

### Option 4: Create New Branch (Easiest)

If you want to avoid rewriting history:

```bash
# Create a new branch without the problematic commit
git checkout -b main-clean
git push origin main-clean

# Then delete old main and rename
git push origin --delete main
git push origin main-clean:main
```

---

## Recommended: Quick Fix

Since `.env` should never be committed anyway:

1. **Visit the GitHub URL** to temporarily allow the push:
   https://github.com/adoneabiilesh/mustiapp/security/secret-scanning/unblock-secret/352070mevuilL3c4XdDTZWkJvEt

2. **After pushing**, use BFG or filter-branch to clean history

3. **Rotate the API key** if it was exposed (important for security)

---

## Important Notes

⚠️ **If this is a production API key:**
- **Rotate it immediately** in your Stripe dashboard
- Remove it from git history
- Never commit `.env` files again

✅ **If this is a test key:**
- You can allow it temporarily
- Still remove it from history for cleanliness
- Use `.env.example` for templates

---

## Prevention

Make sure `.env` is in `.gitignore` (it already is):
- ✅ `.env` is in root `.gitignore`
- ✅ `.env` is in `admin-dashboard/.gitignore`

Always use `.env.example` for templates!

