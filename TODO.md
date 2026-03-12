# PWA Update Detection Implementation
Status: ✅ In Progress | 📦 Plan Approved | 🔧 Editing Files

## Breakdown of Approved Plan

### 1. **lib/versions.ts** (Priority 1) ✅
- [x] Fix TS error line 192
- [x] Update GitHub URL to https://raw.githubusercontent.com/xalanify/xalanify/main/lib/versions.ts
- [x] Add `performPWAUpdate()` function
- [x] Enhance `forceClearPWA()` with SW postMessage

### 2. **app/page.tsx** (Priority 1) ✅
- [x] Import `performPWAUpdate`
- [x] Update `handleForceUpdate()` to use it
- [x] Modal now triggers full PWA refresh

### 3. **public/sw.js** (Priority 2)
- [ ] Dynamic CACHE_NAME with APP_VERSION
- [ ] Enhanced version messaging

### 4. **components/settings-tab.tsx** (Priority 2)
- [ ] Implement "updates" view with changelog
- [ ] Add "Check Updates" + "Clear Cache" buttons

### 5. **app/layout.tsx** (Priority 3)
- [ ] SW updatefound event handling

## Follow-up After Edits
- [ ] `npm run build` to check TS errors
- [ ] Test local: bump version → verify modal + update works
- [ ] Deploy to test PWA install → update → auto-refresh
- [ ] Update this TODO as steps complete ✅

**Current Step: Editing lib/versions.ts first**

