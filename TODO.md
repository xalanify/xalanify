# TODO - Search Enhancement with Spotify API

## Phase 1: Update lib/musicApi.ts
- [x] Add `searchSpotifyTracks()` function to search tracks using Spotify API
- [x] Modify `searchMusic()` to search both Spotify AND YouTube
- [x] Return combined results with source badges (spotify/youtube)
- [x] Add Spotify track search function

## Phase 2: Update components/search-tab.tsx
- [x] Add source filter tabs (All/Spotify/YouTube)
- [x] Display source badge on each track card
- [x] Enhance UI to show different sources clearly

## Phase 3: Testing
- [ ] Verify Spotify search returns tracks with thumbnails
- [ ] Verify YouTube search still works
- [ ] Verify clicking a card plays the audio via ReactPlayer
