# TOPIC Digital — Technical Debt Register

## High Priority
1. **No offline detection** — App has no NetInfo integration (NetworkError component added, but wiring needed)
2. **Firebase listeners not cleaned up** — Potential memory leaks in hooks
3. **Auth redirect logic** — Currently manual redirect; should use Expo Router's protected routes

## Medium Priority
4. **Image loading** — Using React Native Image instead of expo-image in some components
5. **FlatList not optimized** — Missing keyExtractor and performance props in several screens
6. **Hardcoded strings** — No i18n support (acceptable for v1 but adds debt)
7. **Audio queue** — Single audio plays; no queue management for sequential devotionals
8. **No app versioning check** — No force-update mechanism (admin setting added, enforcement needed)

## Low Priority
9. **Dark mode** — Not implemented; system appearance not respected
10. **Tablet layout** — No responsive breakpoints implemented
11. **Accessibility** — AccessibilityLabel missing on most touchable elements
12. **Tests** — Zero test coverage (unit, integration, E2E)
13. **Storybook** — No component documentation/preview

## Admin Portal Specific Debt
14. **Admin analytics** — Dashboard uses mock chart data; real Firebase Analytics integration needed
15. **Admin push notifications** — Send push button shows Alert; actual FCM sending needs Cloud Functions
16. **Giving CSV export** — Export button shows placeholder; real CSV generation needed
17. **Leader search** — Group create leader search field is text-only; real user search needed

## Accepted Trade-offs (Intentional)
- No i18n for v1 (English-first launch)
- No dark mode for v1
- Basic push notification (no rich media)
- No offline audio (download feature UI exists, not wired)
- Mock data in analytics charts (Firebase Analytics API integration deferred)
