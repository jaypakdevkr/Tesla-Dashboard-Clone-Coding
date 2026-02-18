# Tesla Dashboard Clone Coding

Tesla-like dashboard UI prototype implemented from `PRD.md`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Implemented MVP Scope

- App shell: top status bar, split panes, bottom dock, overlay layer
- Left pane: status icons, 3 driving visualization modes, speed cluster, media mini player
- Right pane: map placeholder with controls, navigation overlay, settings panel, app mode view
- Overlay: launcher modal (quick toggles + app grid), on-screen keyboard
- Interaction flows:
  - Dock vehicle button opens launcher
  - Map search opens keyboard
  - Keyboard enter activates navigation UI
  - End Trip deactivates navigation
  - Settings controls update immediately (toggle/segment/slider/tabs/checkbox/tile)
  - Media controls update playback/favorite/progress UI
