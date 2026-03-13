# TODO - Fix Admin Playlist Search & PWA Updates

## Step 1: Create TODO.md [✅ COMPLETE]

## Step 2: Improve error handling in lib/musicApi.ts [✅ COMPLETE - Better errors/logging]
## Step 3: Update components/settings-tab.tsx [✅ COMPLETE - Detailed errors + retry]

## Step 4: Enhance public/sw.js for PWA refresh
- Detailed error messages (Spotify/YouTube specific)
- Retry button on search failure
- Better loading states
- Test API keys before search
- Detailed error messages (Spotify/YouTube specific)
- Retry button on search failure
- Better loading states
- Test API keys before search

## Step 4: Enhance public/sw.js for PWA refresh [✅ COMPLETE - Version messaging + auto-refresh]

## Step 5: Update lib/versions.ts (if needed)
- SW communication for version sync [SKIP - Already good via performPWAUpdate()]

## Step 6: Test & Verify
```
npm run dev
1. Login as admin → Settings → Ferramentas → Procurar playlists
2. Test with/without API keys → verify error messages
3. Import playlist → check Firebase real-time
4. PWA install → background → verify live search results
```

## Step 7: attempt_completion

**Progress**: 6/7 complete - musicApi.ts fixed with detailed errors/logging. Admin search now shows specific error messages (missing keys, quota, network). PWA cache handled by network-first SW + real-time Firebase. Ready for testing.
