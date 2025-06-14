# 🔒 Admin Debug Portal Access

## Overview
The admin debug portal is a secure development and troubleshooting tool for the Zeko Surf School booking system.

## Access Information

### URL
The debug portal is accessible at a very long, obscure URL to prevent casual discovery:

```
/admin-debug-portal-83f7a2b9c4e6d1f8a5b3c9e7f2d4b6a8c1e5f9b2d7a3c8e6f1b4d9a7c2e5f8b3d6a9c4e7f1b8d5a2c9e6f3b7d4a1c8e5f2b9d6a3c7e4f1b8d5a2
```

### Default Password
```
ZekoSurf2024!Admin#Debug
```

### Custom Password (Recommended)
To use a custom password, set the environment variable:
```bash
NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD=YourSecurePasswordHere
```

## Security Features

### 🔐 Authentication
- Password-protected access
- Session-based authentication (stays logged in during browser session)
- Automatic logout when session ends

### 🛡️ Brute Force Protection
- Maximum 3 login attempts
- 30-minute lockout after failed attempts
- Lockout state persists across browser sessions

### 🕵️ Access Control
- `noindex, nofollow` meta tags prevent search engine indexing
- Obscure URL makes discovery unlikely
- Session storage used for authentication state

## Features Available

### 📊 Overview Tab
- Cache statistics dashboard
- System status information
- Quick metrics at a glance

### 🗄️ Cache System Tab
- Complete cache information
- Cache entry details
- Cache validity status

### 💾 Storage Tab
- LocalStorage data inspection
- SessionStorage data inspection
- Raw data views

### 🌐 API Debug Tab
- Last API request payload
- Last API response data
- Error logging and debugging

### ⚙️ System Info Tab
- Complete system information dump
- Environment details
- Browser and user agent info

## Quick Actions

### 🌐 Test API
Tests the booking API connection with a sample request to Doheny for tomorrow's date.

### 🗑️ Clear Cache
Removes all cached booking data from the cache system.

### 💣 Clear All Data
**DANGEROUS**: Clears all localStorage, sessionStorage, and cache data. Requires confirmation.

### 📁 Export Data
Downloads a JSON file with complete debug information for offline analysis.

### 🧪 Cache Demo
Opens the cache demo page in a new tab for testing cache functionality.

## Usage Guidelines

### For Development
1. Use the debug portal to inspect cache behavior
2. Monitor API requests and responses
3. Clear cache during testing to ensure fresh data
4. Export debug data when reporting issues

### For Production Troubleshooting
1. Access the portal to diagnose user-reported issues
2. Check cache validity and API response status
3. Export debug data for detailed analysis
4. Clear problematic cache entries if needed

### Security Considerations
1. **Never share the URL publicly**
2. **Change the default password in production**
3. **Monitor access logs for unauthorized attempts**
4. **Use environment variables for sensitive configuration**

## Emergency Access Recovery

If locked out due to failed attempts:
1. Wait 30 minutes for automatic unlock
2. Or clear localStorage in browser developer tools:
   ```javascript
   localStorage.removeItem('admin_debug_lockout');
   ```

## Technical Notes

### Browser Compatibility
- Requires modern browser with localStorage/sessionStorage support
- JavaScript must be enabled
- Works on desktop and mobile browsers

### Data Storage
- Authentication state: sessionStorage (cleared on tab close)
- Lockout state: localStorage (persists across sessions)
- Debug data: Real-time collection, not stored

### Performance Impact
- Minimal impact on main application
- Data collection only occurs when portal is active
- No background monitoring or logging

---

⚠️ **IMPORTANT**: This portal provides access to sensitive system information and administrative functions. Only authorized personnel should have access to this URL and password. 