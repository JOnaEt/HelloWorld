# TOPIC Digital — Screen Previews

Visual mock-ups of every implemented screen. Layout uses ASCII art at ~390px
width (iPhone 14). Colors are noted in brackets. All screens use safe-area
insets; top/bottom padding is implied.

---

## AUTH FLOW

### 1. Welcome Screen  `app/(auth)/welcome.tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░ GRADIENT ░░░░░░░░░░░ │  bg: #166534 → #16A34A → #1B4332
│ ░░░  (semi-transparent circles)  ░░ │
│                                     │
│  ┌──────┐  ✚                       │
│  │  T   │                          │  white card logo, primary "T" glyph
│  └──────┘                          │
│                                     │
│  TOPIC Digital                      │  48px black, white, letter-spacing -1
│                                     │
│  TEMPLE OF PRIESTS INTERNATIONAL    │  12px, uppercase, primaryLight
│  CHURCH                             │
│                                     │
│  Grow deeper in faith, connect with │  15px white/75%
│  community, and experience God's    │
│  presence daily.                    │
│                                     │
│  ┌──┐  Daily devotionals & Bible    │
│  │📖│  reading                      │  feature bullets w/ frosted icons
│  └──┘                               │
│  ┌──┐  Connect with your church     │
│  │👥│  family                       │
│  └──┘                               │
│  ┌──┐  Pray together as one body    │
│  │🙏│                               │
│  └──┘                               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Create Account          →  │   │  white btn, primary text, shadow
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │          Sign In            │   │  bordered white/40% btn
│  └─────────────────────────────┘   │
│                                     │
│  By continuing, you agree to our   │  10px white/50%
│  Terms of Service & Privacy Policy  │
└─────────────────────────────────────┘
```

---

### 2. Login Screen  `app/(auth)/login.tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░ GRADIENT HEADER ░░░░░░ │  #166534 → #16A34A
│  ← [back]                           │
│                                     │
│  👤                                 │
│  Welcome Back                       │  30px black white
│  Sign in to your account            │  15px white/80%
│─────────────────────────────────────│
│ ┌─────────────────────────────────┐ │
│ │  [!] Invalid email or password  │ │  error banner (red), hidden if ok
│ │                                 │ │
│ │  Email Address                  │ │
│ │  ✉  your@email.com              │ │  Input w/ left icon
│ │                                 │ │
│ │  Password                       │ │
│ │  🔒  ••••••••              👁   │ │  password toggle
│ │                                 │ │
│ │                 Forgot Password?│ │  right-aligned, primary color
│ │                                 │ │
│ │  ┌─────────────────────────┐   │ │
│ │  │        Sign In          │   │ │  large primary btn, spinner when loading
│ │  └─────────────────────────┘   │ │
│ │                                 │ │
│ │  ─────── or continue with ──── │ │
│ │                                 │ │
│ │  ┌──────────┐  ┌──────────┐   │ │
│ │  │ 🔵 Google│  │  Apple  │   │ │  social btns, border, row layout
│ │  └──────────┘  └──────────┘   │ │
│ │                                 │ │
│ │  Don't have an account? Create  │ │  "Create one" in primary
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 3. Register Screen  `app/(auth)/register.tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░ GRADIENT HEADER ░░░░░░ │  same green gradient
│  ←  ✨  Create Account              │
│        Join the TOPIC family        │
│─────────────────────────────────────│
│ ┌─────────────────────────────────┐ │
│ │  Full Name                      │ │
│ │  👤  Your full name             │ │
│ │                                 │ │
│ │  Email Address                  │ │
│ │  ✉  your@email.com             │ │
│ │                                 │ │
│ │  Password                       │ │
│ │  🔒  ••••••••              👁   │ │
│ │                                 │ │
│ │  Confirm Password               │ │
│ │  🔒  ••••••••              👁   │ │
│ │                                 │ │
│ │  ┌─────────────────────────┐   │ │
│ │  │       Create Account    │   │ │
│ │  └─────────────────────────┘   │ │
│ │                                 │ │
│ │  Already have an account?       │ │
│ │                        Sign In  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 4. Onboarding — Interests  `app/(auth)/onboarding/interests.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│   Step 1 of 3  ●●○                 │  progress dots
│                                     │
│   What areas of faith matter        │  24px bold
│   most to you?                      │
│   Choose topics you'd like to       │  gray secondary
│   explore                           │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 📖 Bible    │  │ 🙏 Prayer   │  │  2-column chip grid
│  │   Study     │  │             │  │  selected = primary bg + check
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 🎵 Worship  │  │ 👨‍👩‍👧 Family  │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 🌍 Missions │  │ 💡 Theology │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 💪 Spiritual│  │ 👥 Community│  │
│  │   Growth    │  │             │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Continue          →  │   │  active when ≥1 selected
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### 5. Onboarding — Notifications  `app/(auth)/onboarding/notifications.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│   Step 2 of 3  ●●○                 │
│                                     │
│   Stay connected with               │  24px bold
│   your faith                        │
│   Choose what matters to you        │  gray
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔔 Daily Devotional             ││  toggle rows
│  │    Get your morning devotional  ││
│  │                           ●━━   ││  green toggle ON
│  ├─────────────────────────────────┤│
│  │ 📢 Church Announcements         ││
│  │    Important church news        ││
│  │                           ●━━   ││
│  ├─────────────────────────────────┤│
│  │ 🙏 Prayer Reminders             ││
│  │    Reminder to pray for others  ││
│  │                        ━━●      ││  toggle OFF
│  ├─────────────────────────────────┤│
│  │ 📅 Bible Reading                ││
│  │    Keep your reading streak     ││
│  │                           ●━━   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Continue          →  │   │
│  └─────────────────────────────┘   │
│          Skip for now               │  text link
└─────────────────────────────────────┘
```

---

### 6. Onboarding — Groups  `app/(auth)/onboarding/groups.tsx`

```
┌─────────────────────────────────────┐
│   Step 3 of 3  ●●●                 │
│                                     │
│   Join your community               │  24px bold
│   Connect with a small group        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👥  Young Adults Fellowship     ││  group cards
│  │     Sun 10:00 AM · 24 members   ││
│  │                      [ Join ]   ││  primary outlined btn
│  ├─────────────────────────────────┤│
│  │ 📖  Men's Bible Study           ││
│  │     Wed 7:00 PM · 15 members    ││
│  │                   [ Joined ✓ ]  ││  filled on join
│  ├─────────────────────────────────┤│
│  │ 🌸  Women's Prayer Circle       ││
│  │     Tue 6:00 PM · 31 members    ││
│  │                      [ Join ]   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Complete Setup       →  │   │
│  └─────────────────────────────┘   │
│          I'll explore later         │
└─────────────────────────────────────┘
```

---

## MAIN TABS

### 7. Home Tab  `app/(tabs)/index.tsx`

```
┌─────────────────────────────────────┐
│  [T] TOPIC Digital    🔔 (2)        │  Header: logo + notification badge
│─────────────────────────────────────│
│  Good morning,                      │  sm gray
│  Samuel 👋                    🔍    │  24px black + search btn
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││  DevotionalHero card ~300px tall
│  │  ░░ COVER IMAGE ░░░░░░░░░░░░░ ││  full-bleed cover with gradient overlay
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │  TODAY'S DEVOTIONAL             ││  xs uppercase primary
│  │  Walking in God's Purpose       ││  22px bold white
│  │  Pastor John Kebede • 8 min     ││  sm white/80%
│  │  [▶ Listen]  [📖 Read]          ││  action buttons at bottom
│  └─────────────────────────────────┘│
│                                     │
│  Quick Actions                      │  16px bold
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐   │
│  │ 📖 │  │ 🎧 │  │ 🙏 │  │ ❤️ │   │  4 quick action icons
│  └────┘  └────┘  └────┘  └────┘   │
│  Read     Listen   Pray    Give    │  xs labels
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔥 14-Day Streak                ││  DailyStreakCard
│  │    Keep going! Read today       ││
│  │  M  T  W  T  F  S  S           ││  week dots: green=done, gray=missed
│  │  ●  ●  ●  ●  ●  ○  ○           ││
│  └─────────────────────────────────┘│
│                                     │
│  Your Progress                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐│
│  │  48  │ │  23  │ │  12  │ │14d ││  QuickStats grid
│  │Devos │ │Audio │ │Prayer│ │🔥  ││
│  └──────┘ └──────┘ └──────┘ └────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Verse of the Day · Psalm 119:105│  verse card (green left border)
│  │  "Your word is a lamp for my   ││
│  │  feet, a light on my path."    ││
│  │  New International Version      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
│ 🏠 Home  📚 Library  📖 Bible  👥 Community  👤 Profile │  tab bar
```

---

### 8. Library Tab  `app/(tabs)/library.tsx`

```
┌─────────────────────────────────────┐
│  Library                      + New │  header
│─────────────────────────────────────│
│  ┌───────────────────────────────┐  │
│  │  🔍  Search devotionals...    │  │  search bar
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Faith] [Prayer] [Leadership]│  category filter chips (scrollable)
│  [Worship] [Marriage] [Youth]       │
│                                     │
│  Featured                           │
│  ┌───────────────┐ ┌──────────────┐ │
│  │ ░░ COVER ░░░ │ │ ░░ COVER ░░ │ │  horizontal scroll
│  │               │ │              │ │
│  │ Renewing Your │ │ Fruit of the │ │
│  │ Mind          │ │ Spirit       │ │
│  │ 🎧 12 min    │ │ 📖 7 min    │ │
│  │ ●●●●○ 4.8    │ │ ●●●●● 5.0   │ │  rating stars
│  └───────────────┘ └──────────────┘ │
│                                     │
│  Recent                             │
│  ┌─────────────────────────────────┐│
│  │ ░░░ │ Walking in God's Purpose  ││  list rows with thumbnail
│  │ IMG │ Pastor John · 8 min · New ││
│  │     │ ●●●●○ 4.7                 ││
│  ├─────────────────────────────────┤│
│  │ ░░░ │ The Power of Forgiveness  ││
│  │ IMG │ Sr. Mary · 15 min        ││
│  │     │ ●●●●● 5.0  ✓ Listened    ││  green badge if listened
│  ├─────────────────────────────────┤│
│  │ ░░░ │ Faith Over Fear           ││
│  │ IMG │ Deacon Paul · 10 min     ││
│  └─────────────────────────────────┘│
│                                     │
│         Load More                   │  secondary btn
└─────────────────────────────────────┘
```

---

### 9. Bible Tab  `app/(tabs)/bible.tsx`

```
┌─────────────────────────────────────┐
│  Bible Reading                      │
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │ 🔥 14-Day Streak!               ││  streak banner (primary bg)
│  │    Read today to keep it going  ││
│  └─────────────────────────────────┘│
│                                     │
│  Active Plans                       │
│  ┌─────────────────────────────────┐│
│  │  📖 90-Day Bible Challenge      ││
│  │     Day 23 of 90               ││
│  │     ████████░░░░░░░░  26%      ││  progress bar
│  │     [Continue Reading →]        ││
│  ├─────────────────────────────────┤│
│  │  ✝️  New Testament in 30 Days   ││
│  │     Day 8 of 30                ││
│  │     ████████████░░  40%        ││
│  │     [Continue Reading →]        ││
│  └─────────────────────────────────┘│
│                                     │
│  Today's Reading                    │
│  ┌─────────────────────────────────┐│
│  │  Genesis 1-3 · Matthew 1       ││  day card
│  │  Estimated: 18 minutes          ││
│  │  ○ Genesis 1  ○ Genesis 2      ││  checklist items
│  │  ○ Genesis 3  ○ Matthew 1      ││
│  │                                 ││
│  │  [Mark All Complete]            ││  primary btn
│  └─────────────────────────────────┘│
│                                     │
│  All Plans                          │
│  ┌──────────────┐  ┌───────────────┐│
│  │ 📅 Psalms   │  │ 📅 Proverbs  ││  plan cards 2-col
│  │   in a Month │  │   31 Days    ││
│  │   Not started│  │   Not started││
│  │   [Start]    │  │   [Start]    ││
│  └──────────────┘  └───────────────┘│
└─────────────────────────────────────┘
```

---

### 10. Community Tab  `app/(tabs)/community.tsx`

```
┌─────────────────────────────────────┐
│  Community                    + New │
│─────────────────────────────────────│
│  [Prayer Wall] [Groups]             │  tab switcher
│═════════════════════════════════════│
│  ─── PRAYER WALL VIEW ───          │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  👤 Abebe T. · 2h ago           ││
│  │  "Pray for my father's health.  ││
│  │  Surgery next week."            ││
│  │                                 ││
│  │  🙏 24   💬 8   ❤️ 12           ││  reactions row
│  │           [Pray for this]       ││  primary btn
│  ├─────────────────────────────────┤│
│  │  (Anonymous) · 5h ago           ││
│  │  "Seeking guidance for career   ││
│  │  change. Need wisdom."          ││
│  │                                 ││
│  │  🙏 18   💬 4   ❤️ 7            ││
│  │           [Pray for this]       ││
│  ├─────────────────────────────────┤│
│  │  👤 Sara M. · 1d ago            ││
│  │  "Praise! Job offer received    ││  answered prayer — green accent
│  │  after months of prayer! ✓"     ││
│  │  ✓ ANSWERED                     ││  green badge
│  │  🙏 52   💬 21  ❤️ 38           ││
│  └─────────────────────────────────┘│
│                                     │
│  + Share Prayer Request             │  fab bottom right
└─────────────────────────────────────┘
```

---

### 11. Profile Tab  `app/(tabs)/profile.tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░ GRADIENT ░░░░░░░░░░ │  #16A34A → #15803D
│  ┌────┐  Samuel Kebede              │  Avatar + name
│  │ SK │  samuel@example.com         │
│  └────┘  [Member]                   │  role badge
│          Member since January 2025  │  sm gray
│─────────────────────────────────────│
│ ┌──────────────────────────────────┐│
│ │  ╭────╮   Spiritual              ││  growth ring card
│ │  │ 742│   Growth Score           ││  CircularProgress 90px
│ │  │ pts│   Level: Disciple        ││
│ │  ╰────╯   ████████░░  742/1000   ││  progress bar
│ └──────────────────────────────────┘│
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ 48 │ │ 23 │ │ 12 │ │ 14d│      │  stat row
│  │Devos│ │Audio│ │Pray│ │🔥 │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  Achievements  (3 earned)           │
│  🏅 First Step   🔥 7-Day Streak   │  badge row
│  ✝️ Prayer Warrior                  │
│                                     │
│  ─────────────────────────────────  │
│  👤  Edit Profile               →  │
│  🔔  Notification Settings      →  │
│  🛡  Privacy & Security         →  │
│  ❓  Help & Support             →  │
│  ℹ️  About TOPIC Digital        →  │
│  ─────────────────────────────────  │
│  🔑  [Admin Panel]                  │  only for admin/pastor/leader roles
│  ─────────────────────────────────  │
│  🚪  Sign Out                       │  destructive red
└─────────────────────────────────────┘
```

---

## FEATURE SCREENS

### 12. Devotional Detail  `app/devotional/[id].tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  full-bleed cover image
│ ░░░░░░░░░░ COVER IMAGE ░░░░░░░░░░░ │  ~280px tall with gradient overlay
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ← [back]                  🔖  ⬆️   │  back + bookmark + share (on overlay)
│                                     │
│ FAITH & TRUST  ·  8 MIN READ       │  category chip (primary) · duration
│ Walking in God's Purpose           │  28px bold
│                                     │
│ ┌────────────────────────────────┐ │
│ │ ░░ │ Pastor John Kebede        │ │  author row w/ avatar
│ │    │ Senior Pastor             │ │
│ │    │ June 7, 2026              │ │
│ └────────────────────────────────┘ │
│                                     │
│ Scripture                           │  section label
│ ┌────────────────────────────────┐ │
│ │ Jeremiah 29:11 · NIV            │ │  scripture card (primary left border)
│ │ "For I know the plans I have   │ │
│ │ for you," declares the LORD,   │ │
│ │ "plans to prosper you..."       │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌────────────────────────────────┐ │
│ │ ▶  Listen · 8 min  ▓▓▓░░░░░░  │ │  audio inline player with waveform
│ │    00:45 / 08:23               │ │
│ └────────────────────────────────┘ │
│                                     │
│  God has a specific plan and purpose│  article body text (15px, line-h 24)
│  for every believer. In Jeremiah    │
│  29:11 we see His heart toward us...│
│                                     │
│  [Continue Reading...]              │  expand
│                                     │
│  ┌──────┐  ┌──────┐  ┌───────┐   │
│  │ 🙏   │  │ ⬆️   │  │  ⬇️  │   │  action strip: pray / share / download
│  │ Pray │  │Share │  │ Save  │   │
│  └──────┘  └──────┘  └───────┘   │
└─────────────────────────────────────┘
```

---

### 13. Audio Player  `app/devotional/player.tsx`

```
┌─────────────────────────────────────┐
│                                     │  fullscreen modal
│ ↓ Dismiss                          │  swipe-down handle
│                                     │
│  ╔══════════════════════════════╗   │
│  ║ ░░░░░░░░░░░░░░░░░░░░░░░░░░ ║   │  artwork card with pulsing animation
│  ║ ░░░░░░░ COVER ART ░░░░░░░░ ║   │  while playing
│  ║ ░░░░░░░░░░░░░░░░░░░░░░░░░░ ║   │
│  ╚══════════════════════════════╝   │
│                                     │
│  Walking in God's Purpose           │  20px semibold
│  Pastor John Kebede                 │  14px gray
│                                     │
│  🔖               ❤️  ⬆️            │  bookmark / like / share
│                                     │
│  ░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░   │  AudioWaveform / progress bar
│  02:15                      08:23   │  time labels
│                                     │
│  ⏪ 15s        ⏯          ⏩ 30s   │  skip back / play-pause / skip fwd
│                                     │
│  ⬅ Prev    🔀 Shuffle    Next ➡    │  prev/shuffle/next row
│                                     │
│  ─────────────────────────────────  │
│  1.0×  Speed    🌙  Sleep: 30 min   │  speed + sleep timer
│                                     │
│  Related Devotionals                │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ ░░ THUMB ░░ │  │ ░░ THUMB ░░ │ │  horizontal scroll
│  │  Faith Over  │  │  Grace &    │ │
│  │  Fear · 6min │  │  Mercy·10min│ │
│  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

---

### 14. Groups List  `app/groups/index.tsx`

```
┌─────────────────────────────────────┐
│  ← Small Groups              + New  │
│─────────────────────────────────────│
│  ┌───────────────────────────────┐  │
│  │  🔍  Search groups...         │  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [My Groups] [Open] [Online]  │  filter chips
│                                     │
│  My Groups (2)                      │
│  ┌─────────────────────────────────┐│
│  │  👥  Young Adults Fellowship   ││
│  │      Sun 10:00 AM · Church Hall││
│  │      24 members  Open          ││
│  │      [You're a member ✓]       ││  green badge
│  ├─────────────────────────────────┤│
│  │  📖  Men's Bible Study         ││
│  │      Wed 7:00 PM · Room 3      ││
│  │      15 members  Private       ││
│  │      [You're a member ✓]       ││
│  └─────────────────────────────────┘│
│                                     │
│  Other Groups                       │
│  ┌─────────────────────────────────┐│
│  │  🌸  Women's Prayer Circle     ││
│  │      Tue 6:00 PM · 31 members  ││
│  │                      [Request] ││
│  ├─────────────────────────────────┤│
│  │  👶  Youth Ministry (12-18)    ││
│  │      Fri 5:00 PM · 42 members  ││
│  │                       [Join]   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 15. Group Detail  `app/groups/[id].tsx`

```
┌─────────────────────────────────────┐
│ ← [back]                    ···     │  back + options menu
│ ░░░░░░░░░░░░ GROUP BANNER ░░░░░░░░ │  cover image
│                                     │
│  Young Adults Fellowship            │  24px bold
│  📅 Every Sunday · 10:00 AM         │
│  📍 Church Hall, Main Building      │
│  👥 24 members · Open               │
│                                     │
│  [📨 Message]  [👥 Members]  [📅]  │  action pills
│                                     │
│  About                              │
│  A community for young adults...    │  description text
│                                     │
│  Upcoming Meeting                   │
│  ┌─────────────────────────────────┐│
│  │  📅 Sunday, Jun 8 · 10:00 AM   ││
│  │  Topic: Serving with Purpose    ││
│  │  [Attending ✓]                  ││  RSVP toggle
│  └─────────────────────────────────┘│
│                                     │
│  Members (24)                       │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐  +20 more    │  avatar row + overflow count
│  │SK│ │AM│ │TB│ │XY│               │
│  └──┘ └──┘ └──┘ └──┘               │
│                                     │
│  Recent Activity                    │
│  ● John K. posted an update · 2h   │  activity feed
│  ● 3 new members joined · 1d       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │       Leave Group               ││  destructive btn (outlined red)
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 16. Group Manage  `app/groups/manage.tsx`

```
┌─────────────────────────────────────┐
│  ← Manage Group              Save   │  save btn top right
│─────────────────────────────────────│
│  Group Name                         │
│  ┌─────────────────────────────────┐│
│  │ Young Adults Fellowship         ││
│  └─────────────────────────────────┘│
│                                     │
│  Description                        │
│  ┌─────────────────────────────────┐│
│  │ A community for young adults    ││  multiline textarea
│  │ seeking to grow in faith...     ││
│  └─────────────────────────────────┘│
│                                     │
│  Meeting Schedule                   │
│  Day  [Sunday ▼]   Time  [10:00 AM] │  pickers
│  Location  [Church Hall]            │
│                                     │
│  Group Type                         │
│  ◉ Open to all   ○ Request to join  │  radio row
│  ○ Private (invite only)            │
│                                     │
│  Members (24)                       │
│  ┌─────────────────────────────────┐│
│  │ ░░ │ Samuel K.  [Leader] ✕     ││  member rows with role chips + remove
│  │ ░░ │ Abebe M.   [Member] ✕     ││
│  │ ░░ │ Tigist B.  [Member] ✕     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │        Delete Group             ││  danger btn
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 17. Prayer Wall  `app/prayer/index.tsx`

```
┌─────────────────────────────────────┐
│  ← Prayer Wall               + New  │
│─────────────────────────────────────│
│  [Active] [Answered] [My Prayers]   │  filter tabs
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │  👤 Abebe T.             2h ago ││
│  │  Health                         ││  category chip
│  │                                 ││
│  │  "Please pray for my father's  ││
│  │  surgery next week. The doctors ││
│  │  need wisdom and guidance."     ││
│  │                                 ││
│  │  🙏 24  💬 8  ❤️  12            ││  reaction counts
│  │  [I Prayed]   [Comment]         ││  action btns
│  ├─────────────────────────────────┤│
│  │  (Anonymous)            5h ago  ││
│  │  Career                         ││
│  │  "Seeking wisdom for a major    ││
│  │  career decision. Need peace."  ││
│  │  🙏 18  💬 4   ❤️ 7             ││
│  │  [I Prayed]   [Comment]         ││
│  ├─────────────────────────────────┤│
│  │  ✓ ANSWERED  · Sara M.  1d ago  ││  green badge for answered
│  │  Provision                      ││
│  │  "God provided! I got the job.  ││
│  │  Thank you for your prayers!"   ││
│  │  🙏 52  💬 21  ❤️ 38            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 18. Prayer Detail  `app/prayer/[id].tsx`

```
┌─────────────────────────────────────┐
│  ← Prayer Request            ···    │  back + options
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │  👤 Abebe T.   Health   Active  ││  author + category + status
│  │  Jun 5, 2026                    ││
│  │                                 ││
│  │  "Please pray for my father's   ││
│  │  surgery next week. The doctors ││
│  │  need wisdom and guidance from  ││
│  │  God. Also pray for the family  ││
│  │  to have peace during this time"││
│  └─────────────────────────────────┘│
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────────┐ │
│  │ 🙏24 │  │ ❤️ 12│  │ ✓ Answered│ │  action row
│  │Prayed│  │ Amen │  │  Mark    │ │
│  └──────┘  └──────┘  └──────────┘ │
│                                     │
│  Comments (8)                       │
│  ─────────────────────────────────  │
│  👤 Sarah M. · 1h                  │
│  "Praying for your father. May God  │
│  grant wisdom to the doctors."      │
│                                     │
│  👤 Pastor John · 3h               │
│  "Lifting Abebe's father in prayer. │
│  God is our healer."                │
│  ─────────────────────────────────  │
│  ┌───────────────────────────┐ [→] │
│  │ Add a comment...          │     │  comment input + send
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

---

### 19. Digital Giving  `app/giving/index.tsx`

```
┌─────────────────────────────────────┐
│  ← Digital Giving                   │
│─────────────────────────────────────│
│  [Give]  [History]  [Summary]       │  tab switcher
│═════════════════════════════════════│
│  ─── GIVE TAB ───                  │
│                                     │
│  Give Category                      │
│  ┌─────────────────────────────────┐│
│  │  [Tithe] [Offering] [Building]  ││  scrollable chip row
│  │  [Missions] [Special] [Benev.]  ││
│  └─────────────────────────────────┘│
│                                     │
│  ❤️  Tithe                          │  selected category hero
│  Return 10% of your income as       │
│  an act of worship                  │
│                                     │
│  Amount (ETB)                       │
│  ┌─────────────────────────────────┐│
│  │  ETB  [  500 ][  1,000][ 2,000]││  preset amount chips
│  │        [ 5,000][10,000][Custom] ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │      ETB  1,000                 ││  amount display (large)
│  └─────────────────────────────────┘│
│                                     │
│  Note (optional)                    │
│  ┌─────────────────────────────────┐│
│  │ Add a note...                   ││
│  └─────────────────────────────────┘│
│                                     │
│  ☐ Give anonymously                 │  toggle
│                                     │
│  ┌─────────────────────────────────┐│
│  │   Give ETB 1,000 via Chapa  →  ││  primary btn
│  └─────────────────────────────────┘│
│  Powered by Chapa · Telebirr · CBE  │  payment logos
└─────────────────────────────────────┘
```

---

### 20. Announcements  `app/announcements/index.tsx`

```
┌─────────────────────────────────────┐
│  ← Announcements                    │
│─────────────────────────────────────│
│  [All] [Events] [News] [Urgent]     │  filter chips
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │  📌 PINNED                      ││  pin badge (amber)
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ││  cover image
│  │  Church Renovation Update       ││  title
│  │  Important update from the      ││  excerpt
│  │  building committee...          ││
│  │  Jun 5, 2026  · Building        ││  date + category chip
│  ├─────────────────────────────────┤│
│  │  ░░ IMAGE ░░│ Sunday Service    ││  row with thumbnail
│  │             │ Time Change       ││
│  │             │ Services now at   ││
│  │             │ 9 AM & 11 AM      ││
│  │             │ Jun 3 · Event     ││
│  ├─────────────────────────────────┤│
│  │  ░░ IMAGE ░░│ Youth Camp 2026   ││
│  │             │ Registration open ││
│  │             │ Jun 1 · Youth     ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## ADMIN SCREENS

### 21. Admin Dashboard  `app/(admin)/index.tsx`

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  bg: #0F172A (dark navy)
│  [ADMIN]                            │  badge: primary + "ADMIN"
│  Dashboard                          │  24px bold white
│  Good morning, Admin                │  gray subtitle
│─────────────────────────────────────│
│  ┌──────────┐  ┌──────────┐        │
│  │  👥 1,247│  │ 📖   89  │        │  StatCards (2-col grid)
│  │  Users   │  │ Devotions │        │  white cards with colored icons
│  │  +12%    │  │ +5 new   │        │  trend arrows
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  🙏   34 │  │ 💰 ETB  │        │
│  │  Prayers │  │  48,500  │        │
│  │  this wk │  │ this mo  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  Quick Actions                      │
│  ┌──────────┐  ┌──────────┐        │
│  │ + Devotl │  │ + Announ │        │  action pills (primary/blue)
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ Manage   │  │ View     │        │
│  │ Users    │  │ Reports  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  Engagement Trend (7 days)          │
│  ▁▃▅▇▅▆█  — sparkline chart        │  SVG sparkline
│                                     │
│  Recent Activity                    │
│  ● Samuel K. joined · 2h ago       │  activity feed
│  ● New devotional published · 3h   │
│  ● Donation ETB 500 · 4h ago       │
│  ● Prayer answered · 5h ago        │
│  ─────────────────────────────────  │
│                                     │
│  ← Back to App              ⎋ Sign │
│                              Out    │
└─────────────────────────────────────┘
```

---

### 22. Admin — User Management  `app/(admin)/users.tsx`

```
┌─────────────────────────────────────┐
│  ← Users (1,247)                    │
│─────────────────────────────────────│
│  ┌───────────────────────────────┐  │
│  │  🔍  Search by name or email  │  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Admin] [Pastor] [Leader]    │  role filter chips
│  [Member] [Inactive]                │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ░░ │ Samuel Kebede             ││
│  │    │ samuel@example.com        ││
│  │    │ [Admin]    Joined Jan '25 ││
│  │    │ Last seen: 2h ago  [Edit] ││
│  ├─────────────────────────────────┤│
│  │ ░░ │ Abebe Tadesse             ││
│  │    │ abebe@email.com           ││
│  │    │ [Member]   Joined Mar '25 ││
│  │    │ Last seen: 1d ago  [Edit] ││
│  ├─────────────────────────────────┤│
│  │ ░░ │ Tigist Bekele             ││
│  │    │ tigist@email.com          ││
│  │    │ [Leader]   Joined Feb '25 ││
│  │    │ Last seen: 3d ago  [Edit] ││
│  └─────────────────────────────────┘│
│  [Load More]                        │
└─────────────────────────────────────┘
```

---

### 23. Admin — Devotional List  `app/(admin)/devotionals.tsx`

```
┌─────────────────────────────────────┐
│  ← Devotionals              + Add   │
│─────────────────────────────────────│
│  ┌───────────────────────────────┐  │
│  │  🔍  Search devotionals...    │  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Published] [Draft] [Featured│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ░░ │ Walking in God's Purpose  ││
│  │    │ Pastor John · Jun 7       ││
│  │    │ [Featured ⭐] [Published]  ││  status chips
│  │    │ 248 listens  [Edit] [···] ││  stats + actions
│  ├─────────────────────────────────┤│
│  │ ░░ │ The Power of Forgiveness  ││
│  │    │ Sr. Mary · Jun 5          ││
│  │    │ [Published]               ││
│  │    │ 182 listens  [Edit] [···] ││
│  ├─────────────────────────────────┤│
│  │ ░░ │ New Title (Draft)         ││
│  │    │ Deacon Paul · Draft       ││
│  │    │ [Draft]                   ││
│  │    │              [Edit] [···] ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 24. Admin — Create Devotional  `app/(admin)/devotionals/create.tsx`

```
┌─────────────────────────────────────┐
│  ← Create Devotional                │
│─────────────────────────────────────│
│  Title *                            │
│  ┌─────────────────────────────────┐│
│  │ Walking in God's Purpose        ││
│  └─────────────────────────────────┘│
│                                     │
│  Description *                      │
│  ┌─────────────────────────────────┐│
│  │ This devotional explores...     ││  multiline
│  └─────────────────────────────────┘│
│                                     │
│  Author Name *                      │
│  ┌─────────────────────────────────┐│
│  │ Pastor John Kebede              ││
│  └─────────────────────────────────┘│
│                                     │
│  Category                           │
│  ┌─────────────────────────────────┐│
│  │ Faith & Trust              ▼   ││  picker
│  └─────────────────────────────────┘│
│                                     │
│  Cover Image                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐│
│  │  📷  Upload Cover Image         ││  dashed upload btn
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
│                                     │
│  Audio File                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐│
│  │  🎵  Upload Audio (MP3/AAC)     ││
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
│  ░░░░░░░░░░░░░░░░░░░░░░░░  72%     │  upload progress bar (when uploading)
│                                     │
│  Scripture Reference                │
│  ┌───────────────────┐  ┌─────────┐│
│  │ Jeremiah 29:11    │  │ NIV ▼  ││
│  └───────────────────┘  └─────────┘│
│                                     │
│  ☐ Mark as Featured                 │  toggle
│  ☑ Publish immediately              │  toggle
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Publish Devotional      ││  primary btn
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 25. Admin — Announcement List  `app/(admin)/announcements.tsx`

```
┌─────────────────────────────────────┐
│  ← Announcements            + Add   │
│─────────────────────────────────────│
│  [All] [Published] [Draft] [Pinned] │
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │ ░░ │ 📌 Church Renovation      ││  pin icon for pinned
│  │    │ Update · Building         ││
│  │    │ [Published] [Pinned]      ││
│  │    │ Jun 5    [Edit]  [···]    ││
│  ├─────────────────────────────────┤│
│  │ ░░ │ Sunday Service Time Change││
│  │    │ · Event                   ││
│  │    │ [Published]               ││
│  │    │ Jun 3    [Edit]  [···]    ││
│  ├─────────────────────────────────┤│
│  │ ░░ │ Youth Camp 2026           ││
│  │    │ · Youth                   ││
│  │    │ [Draft]                   ││
│  │    │ Jun 1    [Edit]  [···]    ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 26. Admin — Create Announcement  `app/(admin)/announcements/create.tsx`

```
┌─────────────────────────────────────┐
│  ← New Announcement                 │
│─────────────────────────────────────│
│  Title *                            │
│  ┌─────────────────────────────────┐│
│  │ Sunday Service Time Change      ││
│  └─────────────────────────────────┘│
│                                     │
│  Content *                          │
│  ┌─────────────────────────────────┐│
│  │ Starting next Sunday, services  ││  multiline
│  │ will be held at 9 AM and 11 AM  ││
│  └─────────────────────────────────┘│
│                                     │
│  Category                           │
│  ┌─────────────────────────────────┐│
│  │ Event                      ▼   ││
│  └─────────────────────────────────┘│
│                                     │
│  Announcement Image                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐│
│  │  📷  Upload Image               ││
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
│  ─── or after upload: ────────────  │
│  ✓ image-name.jpg  ✓  [✕ remove]   │  uploaded state
│                                     │
│  ──────────────────────────────     │
│  📌 Pin to Top        ━━●          │  toggle: pinned
│  📢 Send Push Notif.  ━━●          │  toggle: push
│  🚨 Urgent Alert      ●━━          │  toggle: urgent (off)
│  ──────────────────────────────     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Save as Draft           ││  secondary btn
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     Publish Announcement        ││  primary btn
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │  Publish + Send Push Notif.  🔔 ││  purple btn
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 27. Admin — Groups  `app/(admin)/groups.tsx`

```
┌─────────────────────────────────────┐
│  ← Groups (8)               + Add   │
│─────────────────────────────────────│
│  ┌───────────────────────────────┐  │
│  │  🔍  Search groups...         │  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Active] [Inactive]          │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  👥  Young Adults Fellowship   ││
│  │      24 members · Open · Active ││
│  │      Leader: Samuel K.         ││
│  │      [View]  [Edit]  [Delete]  ││
│  ├─────────────────────────────────┤│
│  │  📖  Men's Bible Study         ││
│  │      15 members · Private      ││
│  │      Leader: Pastor John       ││
│  │      [View]  [Edit]  [Delete]  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 28. Admin — Create Group  `app/(admin)/groups/create.tsx`

```
┌─────────────────────────────────────┐
│  ← Create Group                     │
│─────────────────────────────────────│
│  Group Name *                       │
│  ┌─────────────────────────────────┐│
│  │ Youth Ministry                  ││
│  └─────────────────────────────────┘│
│                                     │
│  Description                        │
│  ┌─────────────────────────────────┐│
│  │ A vibrant community for...      ││
│  └─────────────────────────────────┘│
│                                     │
│  Meeting Day                        │
│  [Mon] [Tue] [Wed] [Thu] [Fri]     │  day chips
│  [Sat] [Sun]                        │
│                                     │
│  Meeting Time                       │
│  ┌─────────────────────────────────┐│
│  │ 05:00 PM                   ▼   ││
│  └─────────────────────────────────┘│
│                                     │
│  Location                           │
│  ┌─────────────────────────────────┐│
│  │ Youth Hall, Level 2             ││
│  └─────────────────────────────────┘│
│                                     │
│  Visibility                         │
│  ◉ Open   ○ Request   ○ Private     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Create Group            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 29. Admin — Prayer Moderation  `app/(admin)/prayer.tsx`

```
┌─────────────────────────────────────┐
│  ← Prayer Moderation                │
│─────────────────────────────────────│
│  [Active (34)] [Flagged (3)] [All]  │
│─────────────────────────────────────│
│  ┌─────────────────────────────────┐│
│  │  👤 Anonymous · Jun 7          ││
│  │  "Pray for my healing from      ││
│  │  addiction..."                  ││
│  │  🙏 18  💬 4                    ││
│  │  [✓ Approve] [⚑ Flag] [✕ Del] ││  mod action row
│  │  [✓ Mark Answered]              ││
│  ├─────────────────────────────────┤│
│  │  ⚠️ FLAGGED                     ││  yellow badge
│  │  👤 User · Jun 6               ││
│  │  "..."                          ││
│  │  [✓ Approve] [✕ Delete]        ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 30. Admin — Giving Reports  `app/(admin)/giving.tsx`

```
┌─────────────────────────────────────┐
│  ← Giving Reports                   │
│─────────────────────────────────────│
│  ┌───────────┐  ┌───────────────┐  │
│  │ Jun 2026  │  │ Export CSV    │  │  date range + export
│  └───────────┘  └───────────────┘  │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ ETB 48,500│  │ 127 gifts│        │  summary cards
│  │ Total     │  │  Count   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ETB  382  │  │  23 new  │        │
│  │ Avg Gift │  │  givers  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  By Category                        │
│  ████████████████████  Tithe  52%  │  bar chart rows
│  ██████████           Offer  28%  │
│  █████                Build   12%  │
│  ██                   Missn    5%  │
│  █                    Other    3%  │
│                                     │
│  Recent Donations                   │
│  ┌─────────────────────────────────┐│
│  │ Samuel K.  ETB 1,000  Tithe    ││  donation rows
│  │ (Anon.)    ETB   500  Offering ││
│  │ Abebe T.   ETB 2,000  Building ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 31. Admin — Analytics  `app/(admin)/analytics.tsx`

```
┌─────────────────────────────────────┐
│  ← Analytics                        │
│─────────────────────────────────────│
│  [7 days] [30 days] [90 days]       │  range picker
│─────────────────────────────────────│
│  Daily Active Users                 │
│  ▁▃▅▇▄▆█▅▇▅▆▇  — line chart        │  sparkline
│  Peak: 342  Avg: 218                │
│                                     │
│  Devotionals Completed              │
│  ██ ██ █░ ██ ██ █░ ██              │  bar chart (7 days)
│  Mon Tue Wed Thu Fri Sat Sun        │
│  247 188 142 203 219  89 134        │
│                                     │
│  Top Devotionals                    │
│  ┌─────────────────────────────────┐│
│  │ 1. Walking in God's Purpose 248 ││
│  │ 2. The Power of Forgiveness 182 ││
│  │ 3. Faith Over Fear         164 ││
│  └─────────────────────────────────┘│
│                                     │
│  User Retention                     │
│  Day 1:  ████████████████  100%    │
│  Day 7:  ████████████      72%    │
│  Day 30: ████████          48%    │
│                                     │
│  Prayer Activity                    │
│  New: 34  Answered: 12  Active: 89 │  stats row
└─────────────────────────────────────┘
```

---

### 32. Admin — Church Settings  `app/(admin)/settings.tsx`

```
┌─────────────────────────────────────┐
│  ← Church Settings                  │
│─────────────────────────────────────│
│  Church Name                        │
│  ┌─────────────────────────────────┐│
│  │ Temple of Priests Intl. Church  ││
│  └─────────────────────────────────┘│
│                                     │
│  Location                           │
│  ┌─────────────────────────────────┐│
│  │ Dilla, Ethiopia                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Website                            │
│  ┌─────────────────────────────────┐│
│  │ https://topicchurch.org         ││
│  └─────────────────────────────────┘│
│                                     │
│  Service Times                      │
│  ┌─────────────────────────────────┐│
│  │ Sunday: 9:00 AM & 11:00 AM     ││
│  └─────────────────────────────────┘│
│                                     │
│  Feature Flags                      │
│  ─────────────────────────────────  │
│  Giving Module           ●━━ ON    │  toggles
│  Prayer Wall             ●━━ ON    │
│  Bible Reading           ●━━ ON    │
│  Leaderboards            ━━● OFF   │
│  ─────────────────────────────────  │
│                                     │
│  Contact Email                      │
│  ┌─────────────────────────────────┐│
│  │ admin@topicchurch.org           ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Save Settings           ││  primary btn
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## UTILITY / SYSTEM SCREENS

### 33. Loading Screen  `components/common/LoadingScreen.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│          ┌──────────┐               │
│          │    T     │               │  72px white logo card
│          └──────────┘               │
│                                     │
│          ⣾  Initializing...         │  spinner + message (gray)
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘  bg: Colors.background (#F8FAFC)
```

---

### 34. 404 / Not Found  `app/+not-found.tsx`

```
┌─────────────────────────────────────┐
│  ← Go Home                          │
│                                     │
│                                     │
│          🔍                         │
│                                     │
│          Oops! Screen not found     │  24px bold
│          The page you're looking    │  gray
│          for doesn't exist.         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Go to Home              ││  primary btn
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

### 35. Access Restricted  `app/(admin)/_layout.tsx` (guard)

```
┌─────────────────────────────────────┐
│                                     │
│          🔒                         │
│                                     │
│     Access Restricted               │  20px bold
│     You need admin, pastor,         │  gray
│     or leader permissions to        │
│     access this area.               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │          Go Back                ││  primary btn
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## DESIGN SYSTEM REFERENCE

```
Primary Colors
  #16A34A  ████  Primary Green
  #15803D  ████  Deep Green
  #DCFCE7  ████  Light Green (bg tints)
  #0F172A  ████  Dark Navy (admin bg)

Accent Colors
  #0EA5E9  ████  Info Blue
  #8B5CF6  ████  Purple (audio/giving)
  #F59E0B  ████  Amber (warnings/streaks)
  #EF4444  ████  Error Red

UI
  #F8FAFC  ████  App background
  #FFFFFF  ████  Cards
  #E2E8F0  ████  Borders
  #64748B  ████  Secondary text
  #0F172A  ████  Primary text

Typography
  h1: 36px black   h2: 30px bold   h3: 24px bold
  body: 15px / 24px line-height
  label: 11px uppercase 0.5 letter-spacing

Border Radius
  sm: 6   base: 8   md: 10   lg: 12
  xl: 16  2xl: 20   3xl: 24  full: 9999

Tab Bar  height: 64px, bg white, shadow
  Icons: 24px  Active: #16A34A  Inactive: #94A3B8
```

---

*Total screens: 35 (6 auth, 5 tabs, 9 feature, 12 admin, 3 utility)*
