# iPhone Wallet Login - Troubleshooting Guide

## Issue: Cannot login on iPhone with Onchain Wallet or Coinbase Wallet

---

## Quick Fix Checklist

### ✓ Before You Start
- [ ] Your iPhone has iOS 14+ installed
- [ ] Your wallet app is fully updated (check App Store)
- [ ] You're connected to WiFi or cellular data
- [ ] Your wallet has at least some funds (or testnet funds)

---

## Method 1: Coinbase Wallet on iPhone

### Step 1: Open in Coinbase App Browser (IMPORTANT!)
**DO NOT use Safari or Chrome directly**

1. Open your **Coinbase Wallet app** on iPhone
2. Look for the **browser/compass icon** at bottom
3. Tap the address bar and paste: `https://onchainweb.app`
4. Press Enter

### Step 2: Connect Wallet
1. You should see the login page
2. Tap **"🔗 Connect Wallet"** button
3. A Web3Modal popup should appear
4. Tap **"Coinbase Wallet"**

### Step 3: Approve Connection
1. Coinbase will ask "Do you want to connect?"
2. Tap **"Connect"**
3. Confirm any permissions

### Step 4: Sign Message
1. Page will request signature
2. Check message content in Coinbase
3. Tap **"Sign"** to complete

### ✓ Expected Result
- You'll be logged in as your Coinbase wallet address
- Redirected to dashboard

---

## Method 2: Onchain Wallet on iPhone

### Step 1: Check Installation
1. Open App Store
2. Search for **"Onchain Wallet"** or **"Onchain"**
3. If not installed: **Tap "Get" to install**
4. If installed: Make sure it's fully updated

### Step 2: Open in Onchain Browser
1. Open **Onchain Wallet app**
2. Look for **browser** or **dApp** button
3. Paste URL: `https://onchainweb.app`
4. Press Enter

### Step 3: Connect Wallet
1. Tap **"🔗 Connect Wallet"**
2. Select **"Onchain Wallet"** from list
3. Confirm connection

### Step 4: Sign Message
1. Review the message to sign
2. Enter your password or use Face ID
3. Tap **"Sign"**

### ✓ Expected Result
- Login complete
- Redirected to dashboard

---

## If Connection Fails: Troubleshooting

### Error: "Wallet not detected"
**Cause:** You're not using the wallet's built-in browser

**Fix:**
1. ❌ Don't use Safari directly
2. ✓ Use Coinbase Wallet's browser
3. ✓ Use Onchain Wallet's dApp browser

### Error: "Connection timeout"
**Cause:** Backend server sleeping or network issue

**Fix:**
1. Check the **green dot** (server status) in the login UI
2. If **yellow/red**: Wait 30 seconds for server to wake up
3. Refresh page and try again

### Error: "Failed to sign message"
**Cause:** Wallet signature request cancelled

**Fix:**
1. Make sure you **tap "Sign"** in the wallet
2. Don't cancel/close the signature popup
3. Try again - wait for full popup to appear

### Error: "Server returned error"
**Cause:** Backend validation failed

**Fix:**
1. Check your internet connection
2. Try email login instead (below)
3. Copy debug info and send to support (see below)

---

## Method 3: Backup - Email Login

If wallet connection fails, **always use email login as backup**:

1. Scroll down past wallet connect button
2. Find **"or login with email"** section
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Tap **"Login"**

**This method doesn't require a wallet and always works!**

---

## Get Debug Information for Support

If login still fails:

1. Tap **"📋 Debug Info"** button at top of login form
2. A popup will show detailed information
3. Tap **"Copy"** when prompted
4. Email this info to support with:
   - What you were trying to do
   - What error you saw
   - Your iPhone model & iOS version
   - Your wallet app name & version

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Web3Modal doesn't appear | Try email login, or reload page and try again |
| Wallet app won't open | Make sure it's installed from App Store |
| Signature fails silently | Check if your wallet is locked - unlock it first |
| Connection drops | Your wifi might be unstable, try cellular |
| Page shows "Server offline" | Backend is sleeping, wait 30-60 seconds |
| Address looks wrong | Ensure you copied address correctly from wallet |

---

## Supported Wallets on iPhone

### Highly Recommended
- ✅ **Coinbase Wallet** (Works best on iPhone)
- ✅ **MetaMask** (Mobile app)
- ✅ **Trust Wallet** (Built on Ethereum)

### Also Supported
- ✓ Phantom (Solana-first)
- ✓ Ledger Live (Hardware wallet)
- ✓ OKX Wallet
- ✓ Bitget Wallet
- ✓ 50+ more via Web3Modal

### About "Onchain" Wallet
- **Onchain Wallet** (if available on App Store) uses Web3Modal
- Make sure to open pages in its in-app browser, not Safari
- Not to be confused with other wallet names

---

## Technical Details (For Advanced Users)

### What's Happening Behind the Scenes

1. **Connection Phase**
   - Web3Modal detects your wallet
   - Establishes connection to blockchain
   - Requests your address

2. **Signature Phase**
   - Server sends a message to sign
   - Your wallet app asks for approval
   - You authorize the signature

3. **Verification Phase**
   - Signature is sent to backend
   - Server verifies you own that address
   - JWT token issued
   - You're logged in!

### Why iPhone Can Be Different
- iOS has different URL schemes than Android
- App browsers have different permissions
- Some wallets need specific in-app browser to work

### Debug Console
- Open browser developer tools (if available)
- Look for console messages like:
  - 🔐 "Starting wallet login..."
  - ✍️ "Requesting signature..."
  - 📤 "Sending auth request..."
  - ✓ "Login successful!"
- These messages help diagnose where it fails

---

## Still Not Working?

Follow these steps:

1. **Gather Information**
   - Tap "📋 Debug Info" button
   - Copy all the information
   - Note the exact error message

2. **Try Backup Method**
   - Use email login (always works)
   - This confirms account access works

3. **Contact Support**
   - Share debug info
   - Include wallet name and version
   - Include iPhone model and iOS version
   - Tell us exactly what error you see

4. **Alternative: Use Desktop/Android**
   - Try logging in on desktop temporarily
   - Get support to help via desktop
   - Can switch back to mobile later

---

## Success Confirmation

✓ Login successful when you see:
- ✓ Dashboard page loads
- ✓ Your wallet address shown
- ✓ Account balance visible
- ✓ Trading/wallet sections available

---

## Support Information

**Need help?**
1. Copy debug info via 📋 button
2. Email with:
   - Debug info
   - Error message
   - Wallet & iPhone model
   - What you tried

**Server Status:**
- Green dot = Online ✓
- Yellow = Waking up (wait)
- Red = Offline (try later)

---

## Latest Improvements (v2.0)

- ✓ Web3Modal integration (50+ wallets)
- ✓ Multi-chain support (Ethereum, Polygon)
- ✓ Better error messages
- ✓ Debug information export
- ✓ iPhone-specific tips in UI
- ✓ Email backup login always available
- ✓ Server status indicator

---

**Last Updated:** December 19, 2025
