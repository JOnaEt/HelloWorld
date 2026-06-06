# TOPIC Digital — Analytics Plan

## Tracking Framework: Firebase Analytics

## Core Events to Implement

### Authentication
- `user_registered` — {method: 'email'}
- `user_logged_in` — {method: 'email'}
- `onboarding_completed` — {interests: string[]}
- `onboarding_skipped` — {step: string}

### Devotional Engagement
- `devotional_opened` — {id, category, title}
- `devotional_play_started` — {id, title, duration}
- `devotional_play_paused` — {id, position, completion_pct}
- `devotional_play_completed` — {id, duration}
- `devotional_shared` — {id, platform}
- `devotional_bookmarked` — {id}
- `devotional_speed_changed` — {speed}

### Bible Reading
- `reading_plan_started` — {plan_id, plan_name}
- `reading_completed` — {plan_id, day, passages}
- `streak_achieved` — {days: 7|30|100}
- `streak_broken` — {previous_days}

### Prayer
- `prayer_submitted` — {category, is_anonymous}
- `prayer_reaction` — {type: 'praying'|'amen', prayer_id}
- `prayer_marked_answered` — {days_active}

### Groups
- `group_joined` — {group_id, category}
- `group_left` — {group_id}
- `group_discussion_posted` — {group_id}
- `group_attendance_marked` — {group_id}

### Giving
- `giving_initiated` — {type, amount}
- `giving_completed` — {type, amount, currency}
- `giving_failed` — {type, error}

### Achievements
- `achievement_unlocked` — {badge_id, badge_name}
- `level_up` — {new_level, xp}

### Retention Signals
- `daily_active` — logged each session (Firebase handles automatically)
- `notification_opened` — {type, deep_link}
- `app_backgrounded` — {current_screen, session_duration}

## Retention Funnels
1. Registration → Onboarding → First Devotional → Day 3 Return
2. First Group Join → Second Meeting → Attendance
3. First Prayer → First Reaction → Week 2 Prayer

## KPIs to Monitor Weekly
- DAU/MAU ratio (target: >0.3)
- Devotional completion rate (target: >60%)
- 7-day retention (target: >40%)
- Average session duration (target: >5 min)
- Group participation rate (target: >30% of members)
