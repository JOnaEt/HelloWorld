# TOPIC Digital — Performance Report

## Analysis Date: June 6, 2026

## Critical Performance Risks

### 1. FlatList Optimization
- Risk: Large lists (prayer wall, devotional library) without proper optimization
- Fix: Add keyExtractor, getItemLayout, removeClippedSubviews, maxToRenderPerBatch=10, windowSize=5

### 2. Image Loading
- Risk: No image caching strategy
- Fix: Use expo-image (installed) with contentFit="cover" and proper cachePolicy

### 3. Re-render Prevention
- Risk: Screens not memoized
- Fix: Wrap list item components in React.memo()

### 4. Audio Memory
- Risk: Audio sound objects not unloaded
- Fix: useAudio hook must call sound.unloadAsync() on unmount

### 5. Firebase Listeners
- Risk: Firestore onSnapshot listeners not unsubscribed
- Fix: Return unsubscribe from useEffect cleanup

## Recommended Fixes (Priority Order)
1. Add React.memo to all FlatList item components
2. Add windowSize={5} and maxToRenderPerBatch={10} to all FlatLists
3. Use expo-image instead of Image for all remote images
4. Implement audio cleanup in useAudio hook
5. Add Firestore listener cleanup

## Bundle Size Estimate
- Current dependencies are well-chosen with minimal bloat
- firebase package adds ~200KB — consider modular imports
- react-native-svg adds ~1.5MB — justified by analytics charts

## Expected Performance on Mid-Range Android
- Cold start: ~3-4 seconds (acceptable for Expo)
- Tab switch: <100ms (Expo Router handles well)
- FlatList scroll (1000 items): ~60fps with optimization
