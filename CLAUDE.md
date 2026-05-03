# Project memory

## User preferences

- **Device**: iPhone only. **Never** give Android, browser-extension, or
  cross-platform instructions. Skip iOS-vs-Android tables. iPhone-Safari
  steps only.
- **Language**: Spanish (Mexican). Reply in Spanish unless the user
  switches to English.
- **App**: This is a personal fitness app called "Coach" deployed to
  GitHub Pages at:
  https://fructuosogalez-oss.github.io/tomate/coach.html
- **Workflow**: Build → commit → push → merge PR to `main` → user updates
  PWA on iPhone. Always merge to main so GitHub Pages rebuilds.
- **Branch**: develop on `claude/fitness-coach-app-7Rvpm`, merge to
  `main` when done.

## How user updates the iPhone

- If installed as PWA from home screen: close completely (swipe up
  + flick), reopen.
- If a refresh doesn't pick up changes: open Safari → go to URL → "Add
  to Home Screen" again (delete the old icon first).

## Do not suggest

- Android instructions
- Chrome / Firefox / Edge instructions
- Desktop browser steps
- "Open in Chrome" / "Open in incognito" as primary path

If the user mentions something not working on their phone, default to
iPhone-Safari troubleshooting.
