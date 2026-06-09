/**
 * TOPIC Digital — Firestore Seed Script
 *
 * Run with: npx ts-node scripts/seed.ts
 *
 * Prerequisites:
 * 1. Set FIREBASE_PROJECT_ID environment variable
 * 2. Run: firebase login
 * 3. Run: firebase use <your-project-id>
 */

import * as admin from 'firebase-admin';

// Initialize with application default credentials
// Run `firebase login` first, then `gcloud auth application-default login`
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID ?? 'your-project-id',
});

const db = admin.firestore();

async function seedDevotionals() {
  console.log('Seeding devotionals...');

  const devotionals = [
    {
      title: 'Walking in Faith',
      subtitle: "Trust in God's perfect plan",
      scripture: {
        book: 'Proverbs',
        chapter: 3,
        verses: '5-6',
        text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        translation: 'NIV',
      },
      content: `Faith is not the absence of doubt — it is choosing to trust God in spite of doubt.

When we face uncertainties in life, our natural tendency is to lean on our own understanding, to analyze every possibility, to seek control. But God invites us into a different way of living.

"Trust in the LORD with all your heart." Note that this is not a partial trust — it is with ALL your heart. It is complete surrender to a God who sees what we cannot see, who knows what we do not know, and who loves us more than we can comprehend.

What area of your life are you trying to control today? What decision are you overthinking? Bring it to God in prayer, and practice the radical act of trust.`,
      prayer: 'Lord, I surrender my plans, my worries, and my need for control to You today. Teach me to walk by faith and not by sight. Make my paths straight as I submit every part of my life to You. Amen.',
      category: 'faith',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioDuration: 480,
      thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800',
      isFeatured: true,
      isDaily: true,
      dailyDate: new Date().toISOString().split('T')[0],
      tags: ['faith', 'trust', 'surrender'],
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      reflectionPrompts: [
        'What area of your life is hardest to surrender to God?',
        "How has God's plan surprised you in the past?",
        'What would it look like to fully trust God this week?',
      ],
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'The Power of Prayer',
      subtitle: 'Communicating with the Father',
      scripture: {
        book: 'Philippians',
        chapter: 4,
        verses: '6-7',
        text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
        translation: 'NIV',
      },
      content: `Prayer is not a religious ritual — it is a relationship. It is the daily conversation between a child and their Father.

The Apostle Paul writes these words from a prison cell, yet he speaks of peace that transcends understanding. How is this possible? Because he had learned the secret: in every situation, bring it to God.

Notice the three elements Paul mentions: prayer (the act of communicating), petition (bringing specific requests), and thanksgiving (maintaining a grateful heart). This combination — coming to God honestly, specifically, and gratefully — is the pathway to supernatural peace.

You do not need eloquent words. You do not need a quiet room. You simply need to turn your heart toward the Father.`,
      prayer: 'Father, I bring everything to You today — my fears, my needs, my hopes, my gratitude. Guard my heart and mind with Your peace that surpasses all understanding. Teach me to pray without ceasing. Amen.',
      category: 'prayer',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioDuration: 520,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800',
      isFeatured: true,
      isDaily: false,
      tags: ['prayer', 'peace', 'anxiety'],
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      reflectionPrompts: [
        'Do you have a regular prayer time? When is it?',
        'What anxiety do you need to bring to God today?',
        'How has prayer changed a situation in your life?',
      ],
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: 'Worship as a Lifestyle',
      subtitle: 'More than songs on Sunday',
      scripture: {
        book: 'Romans',
        chapter: 12,
        verses: '1',
        text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.",
        translation: 'NIV',
      },
      content: `Many believers think of worship as what happens on Sunday morning when the music plays. But Paul challenges us with a far more expansive vision.

Worship is not an event you attend. It is an orientation of your entire life toward God.

When you serve your neighbor, that is worship. When you work with integrity at your job, that is worship. When you choose forgiveness over bitterness, that is worship. When you tithe, when you pray, when you care for the poor — all of it is the offering of your life back to the One who gave it.

The call is to be a living sacrifice — not dead religion, but living, breathing, daily devotion to God expressed in everything you do.`,
      prayer: 'Lord, transform my understanding of worship. Let my entire life be an act of devotion to You — not just Sundays, but every Monday through Saturday as well. I offer myself to You as a living sacrifice. Amen.',
      category: 'worship',
      author: { id: 'pastor-2', name: 'Pastor Hanna Girma', title: 'Worship Director' },
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioDuration: 450,
      thumbnailUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
      isFeatured: false,
      isDaily: false,
      tags: ['worship', 'lifestyle', 'sacrifice'],
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      reflectionPrompts: [
        'What area of your everyday life could become an act of worship?',
        'How do you see worship beyond Sunday services?',
      ],
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      title: 'Leading Like Jesus',
      subtitle: 'Servant leadership in action',
      scripture: {
        book: 'Mark',
        chapter: 10,
        verses: '43-45',
        text: 'Instead, whoever wants to become great among you must be your servant, and whoever wants to be first must be slave of all. For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.',
        translation: 'NIV',
      },
      content: `The world's model of leadership is about climbing — climbing the corporate ladder, accumulating power, gaining recognition. Jesus turns this model completely upside down.

The greatest in the Kingdom of God is the servant of all. This is not weakness — it is the most courageous form of strength. It takes far more character to serve than to be served.

Think of the greatest leaders you have known in your life. Were they the ones who demanded attention, or the ones who gave it? Were they the ones who took credit, or the ones who gave it away?

Wherever you lead — your family, your small group, your team at work — practice the way of Jesus. Serve first. Lead from the bottom up. Watch what God does with that posture.`,
      prayer: 'Jesus, You washed the feet of Your disciples. Give me that same spirit of servanthood. Remove every trace of pride and self-promotion from my leadership. Let me lead the way You led — with love, sacrifice, and genuine care. Amen.',
      category: 'leadership',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioDuration: 510,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
      isFeatured: false,
      isDaily: false,
      tags: ['leadership', 'service', 'humility'],
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      reflectionPrompts: [
        'Where are you being called to lead right now?',
        'Who could you serve this week in a practical way?',
      ],
      publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      title: 'Discipleship Begins at Home',
      subtitle: 'Raising a godly family',
      scripture: {
        book: 'Deuteronomy',
        chapter: 6,
        verses: '6-7',
        text: 'These commandments that I give you today are to be on your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up.',
        translation: 'NIV',
      },
      content: `The most important discipleship happens not in church programs but around kitchen tables, on car rides, and in bedtime conversations.

God gives parents a sacred assignment: to impress His Word on the hearts of their children. The Hebrew word used here is "shanan" — to sharpen, to incise, to make a deep mark. This is not casual or occasional — it is intentional, repeated, woven into the fabric of daily life.

You don't need a theology degree to disciple your children. You need a heart that is itself saturated with the Word, and the willingness to share what God is teaching you in the ordinary moments of life.

If you are not a parent, you are still called to generational investment — in nieces and nephews, in young people at church, in mentoring relationships that pass faith to the next generation.`,
      prayer: 'Lord, make our homes places where faith is caught as well as taught. Give me wisdom to lead my family well. Help me to speak Your Word into the ordinary moments of daily life. Amen.',
      category: 'family',
      author: { id: 'pastor-2', name: 'Pastor Hanna Girma', title: 'Worship Director' },
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioDuration: 490,
      thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400',
      coverUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
      isFeatured: false,
      isDaily: false,
      tags: ['family', 'discipleship', 'parenting'],
      listenCount: 0,
      readCount: 0,
      shareCount: 0,
      reflectionPrompts: [
        'How are you passing faith to the next generation in your life?',
        'What is one spiritual practice you could start with your family?',
      ],
      publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];

  for (const devotional of devotionals) {
    const ref = await db.collection('devotionals').add(devotional);
    console.log(`  + Created devotional: "${devotional.title}" (${ref.id})`);
  }
}

async function seedAnnouncements() {
  console.log('Seeding announcements...');

  const announcements = [
    {
      title: 'Sunday Celebration Service',
      content: 'Join us this Sunday for our weekly celebration service at 9:00 AM and 11:00 AM. We look forward to worshipping together as a community. Doors open 30 minutes before each service.',
      type: 'service',
      priority: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b671e4e8f?w=800',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      publishedAt: new Date().toISOString(),
      isPinned: true,
      tags: ['sunday', 'service', 'worship'],
      readByUserIds: [],
    },
    {
      title: 'Youth Camp Registration Open',
      content: 'Registration for the annual TOPIC Youth Camp is now open! The camp will be held July 15-20 at Mount Zion Retreat Center. This is an incredible opportunity for young people aged 13-24 to grow in faith, build community, and encounter God. Spaces are limited — register through the church office.',
      type: 'event',
      priority: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      isPinned: false,
      tags: ['youth', 'camp', 'registration'],
      readByUserIds: [],
    },
    {
      title: 'Building Fund Update',
      content: "Praise God! We have reached 57.5% of our building fund goal. Thank you to everyone who has contributed to this vision. We are currently at ETB 287,500 of our ETB 500,000 goal. Your generosity is building a house for God's glory in Dilla.",
      type: 'news',
      priority: 'medium',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      isPinned: false,
      tags: ['building', 'fund', 'testimony'],
      readByUserIds: [],
    },
    {
      title: 'New Members Orientation',
      content: 'If you are new to TOPIC or have recently given your life to Christ, we invite you to our New Members Orientation this Saturday at 2:00 PM in the main hall. You will learn about our church vision, values, and ministries, and have the opportunity to meet the pastoral team.',
      type: 'event',
      priority: 'medium',
      author: { id: 'pastor-2', name: 'Pastor Hanna Girma', title: 'Worship Director' },
      publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      isPinned: false,
      tags: ['new members', 'orientation', 'welcome'],
      readByUserIds: [],
    },
    {
      title: 'Prayer and Fasting Week',
      content: 'Beginning next Monday, we invite all members to join us for a week of corporate prayer and fasting. Daily prayer meetings will be held at 6:00 AM and 6:00 PM in the sanctuary. The theme this year is "Seek His Face" based on 2 Chronicles 7:14.',
      type: 'service',
      priority: 'urgent',
      author: { id: 'pastor-1', name: 'Pastor Samuel Tesfaye', title: 'Senior Pastor' },
      publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      isPinned: true,
      tags: ['prayer', 'fasting', 'corporate'],
      readByUserIds: [],
    },
  ];

  for (const announcement of announcements) {
    const ref = await db.collection('announcements').add(announcement);
    console.log(`  + Created announcement: "${announcement.title}" (${ref.id})`);
  }
}

async function seedGroups() {
  console.log('Seeding groups...');

  const groups = [
    {
      name: 'Men of Valor',
      description: 'A community of men committed to growing in faith, accountability, and godly leadership. We meet weekly to study the Word, pray for one another, and sharpen each other as iron sharpens iron.',
      category: 'men',
      coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      leaderId: 'leader-1',
      leader: { id: 'leader-1', name: 'Yohannes Bekele', title: 'Group Leader' },
      coLeaderIds: [],
      memberCount: 18,
      maxMembers: 30,
      isPrivate: false,
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 'Saturday',
        time: '08:00',
        timezone: 'Africa/Addis_Ababa',
        nextMeeting: new Date(Date.now() + 4 * 86400000).toISOString(),
      },
      location: 'Church Hall B',
      isOnline: false,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      tags: ['men', 'accountability', 'leadership'],
      announcementsEnabled: true,
      prayerEnabled: true,
      isActive: true,
    },
    {
      name: 'Women of Purpose',
      description: "A sisterhood of women journeying together in faith, hope, and love. We study Scripture, support one another through life's seasons, and discover God's unique calling for each of our lives.",
      category: 'women',
      coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      leaderId: 'leader-2',
      leader: { id: 'leader-2', name: 'Miriam Haile', title: 'Group Leader' },
      coLeaderIds: [],
      memberCount: 24,
      maxMembers: 40,
      isPrivate: false,
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 'Wednesday',
        time: '17:30',
        timezone: 'Africa/Addis_Ababa',
        nextMeeting: new Date(Date.now() + 2 * 86400000).toISOString(),
      },
      location: 'Conference Room',
      isOnline: false,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      tags: ['women', 'purpose', 'sisterhood'],
      announcementsEnabled: true,
      prayerEnabled: true,
      isActive: true,
    },
    {
      name: 'TOPIC Youth',
      description: 'The youth ministry of TOPIC Church, for ages 13-24. A place to belong, ask hard questions, and grow in authentic faith. Weekly gatherings, monthly outreaches, and annual camps.',
      category: 'youth',
      coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      leaderId: 'leader-3',
      leader: { id: 'leader-3', name: 'Daniel Tadesse', title: 'Youth Pastor' },
      coLeaderIds: [],
      memberCount: 45,
      maxMembers: 100,
      isPrivate: false,
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 'Friday',
        time: '16:00',
        timezone: 'Africa/Addis_Ababa',
        nextMeeting: new Date(Date.now() + 1 * 86400000).toISOString(),
      },
      location: 'Youth Hall',
      isOnline: false,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      tags: ['youth', 'young adults', 'generation'],
      announcementsEnabled: true,
      prayerEnabled: true,
      isActive: true,
    },
    {
      name: 'Morning Prayer Warriors',
      description: 'Dedicated intercessors who meet daily to pray for the church, the city of Dilla, Ethiopia, and the nations. All are welcome to join this frontline prayer ministry.',
      category: 'prayer',
      coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
      leaderId: 'leader-4',
      leader: { id: 'leader-4', name: 'Ruth Alemu', title: 'Prayer Coordinator' },
      coLeaderIds: [],
      memberCount: 31,
      maxMembers: 50,
      isPrivate: false,
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 'Monday',
        time: '05:30',
        timezone: 'Africa/Addis_Ababa',
        nextMeeting: new Date(Date.now() + 86400000).toISOString(),
      },
      location: 'Sanctuary',
      isOnline: false,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      tags: ['prayer', 'intercession', 'morning'],
      announcementsEnabled: true,
      prayerEnabled: true,
      isActive: true,
    },
    {
      name: 'Bible Study Circle',
      description: 'A deep-dive group for those who want to go beyond Sunday sermons into serious Scripture study. We work through books of the Bible chapter by chapter, with discussion, context, and application.',
      category: 'bible-study',
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800',
      leaderId: 'leader-5',
      leader: { id: 'leader-5', name: 'Solomon Worku', title: 'Teaching Elder' },
      coLeaderIds: [],
      memberCount: 20,
      maxMembers: 25,
      isPrivate: false,
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 'Tuesday',
        time: '18:30',
        timezone: 'Africa/Addis_Ababa',
        nextMeeting: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
      location: 'Library Room',
      isOnline: false,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      tags: ['bible study', 'scripture', 'theology'],
      announcementsEnabled: true,
      prayerEnabled: true,
      isActive: true,
    },
  ];

  for (const group of groups) {
    const ref = await db.collection('groups').add(group);
    console.log(`  + Created group: "${group.name}" (${ref.id})`);
  }
}

async function seedBibleReadingPlans() {
  console.log('Seeding Bible reading plans...');

  const plans = [
    {
      title: '30-Day New Testament Journey',
      description: 'A month-long journey through the highlights of the New Testament. Perfect for new believers and those wanting to rediscover the life and teachings of Jesus.',
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400',
      durationDays: 30,
      category: 'new-testament',
      author: 'TOPIC Church',
      enrolledCount: 0,
      completionRate: 0,
      readings: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        passages: [
          {
            book: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Philippians'][Math.floor(i / 4.3) % 7],
            chapter: (i % 10) + 1,
            verses: '1-15',
            text: '',
            translation: 'NIV',
          },
        ],
        estimated_minutes: 10,
      })),
    },
    {
      title: 'Psalms & Proverbs: 31 Days of Wisdom',
      description: 'Begin each morning with a Psalm and a chapter of Proverbs. This plan pairs the poetry of worship with the practical wisdom of Solomon for a complete spiritual start to every day.',
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400',
      durationDays: 31,
      category: 'wisdom',
      author: 'TOPIC Church',
      enrolledCount: 0,
      completionRate: 0,
      readings: Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        passages: [
          { book: 'Psalms', chapter: i + 1, verses: '1-end', text: '', translation: 'NIV' },
          { book: 'Proverbs', chapter: i + 1, verses: '1-end', text: '', translation: 'NIV' },
        ],
        estimated_minutes: 12,
      })),
    },
    {
      title: 'The Life of Paul: 14-Day Study',
      description: 'Walk through the missionary journeys of the Apostle Paul — from Damascus to Rome. Understand his theology and his heart through Acts and his letters.',
      coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
      durationDays: 14,
      category: 'character-study',
      author: 'TOPIC Church',
      enrolledCount: 0,
      completionRate: 0,
      readings: [
        { day: 1, passages: [{ book: 'Acts', chapter: 9, verses: '1-31', text: '', translation: 'NIV' }], estimated_minutes: 8 },
        { day: 2, passages: [{ book: 'Acts', chapter: 13, verses: '1-52', text: '', translation: 'NIV' }], estimated_minutes: 10 },
        { day: 3, passages: [{ book: 'Acts', chapter: 16, verses: '1-40', text: '', translation: 'NIV' }], estimated_minutes: 9 },
        { day: 4, passages: [{ book: 'Acts', chapter: 17, verses: '1-34', text: '', translation: 'NIV' }], estimated_minutes: 9 },
        { day: 5, passages: [{ book: 'Romans', chapter: 1, verses: '1-32', text: '', translation: 'NIV' }], estimated_minutes: 10 },
        { day: 6, passages: [{ book: 'Romans', chapter: 8, verses: '1-39', text: '', translation: 'NIV' }], estimated_minutes: 10 },
        { day: 7, passages: [{ book: 'Galatians', chapter: 2, verses: '1-21', text: '', translation: 'NIV' }], estimated_minutes: 7 },
        { day: 8, passages: [{ book: 'Philippians', chapter: 1, verses: '1-30', text: '', translation: 'NIV' }], estimated_minutes: 8 },
        { day: 9, passages: [{ book: 'Philippians', chapter: 4, verses: '1-23', text: '', translation: 'NIV' }], estimated_minutes: 7 },
        { day: 10, passages: [{ book: 'Colossians', chapter: 1, verses: '1-29', text: '', translation: 'NIV' }], estimated_minutes: 8 },
        { day: 11, passages: [{ book: '1 Timothy', chapter: 1, verses: '1-20', text: '', translation: 'NIV' }], estimated_minutes: 7 },
        { day: 12, passages: [{ book: '2 Timothy', chapter: 3, verses: '1-17', text: '', translation: 'NIV' }], estimated_minutes: 6 },
        { day: 13, passages: [{ book: '2 Timothy', chapter: 4, verses: '1-22', text: '', translation: 'NIV' }], estimated_minutes: 7 },
        { day: 14, passages: [{ book: 'Acts', chapter: 28, verses: '1-31', text: '', translation: 'NIV' }], estimated_minutes: 9 },
      ],
    },
  ];

  for (const plan of plans) {
    const ref = await db.collection('readingPlans').add(plan);
    console.log(`  + Created reading plan: "${plan.title}" (${ref.id})`);
  }
}

async function seedChurchSettings() {
  console.log('Seeding church settings...');

  await db.collection('churchSettings').doc('main').set({
    churchName: 'Temple of Priests International Church – Dilla',
    tagline: 'Raising a generation of priests and kings',
    location: 'Dilla, SNNPR, Ethiopia',
    website: 'https://www.topicchurch.org',
    contactEmail: 'info@topicchurch.org',
    contactPhone: '+251 46 111 0000',
    defaultBibleTranslation: 'NIV',
    currency: 'ETB',
    annualGivingGoal: 1000000,
    contentModeration: 'manual',
    devotionalReminderEnabled: true,
    devotionalReminderTime: '07:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('  + Created church settings');
}

async function main() {
  console.log('Starting TOPIC Digital Firestore seed...\n');

  try {
    await seedDevotionals();
    await seedAnnouncements();
    await seedGroups();
    await seedBibleReadingPlans();
    await seedChurchSettings();

    console.log('\nSeed complete! Your Firebase project now has sample data.');
    console.log('\nNext steps:');
    console.log('  1. Open the app and register an account');
    console.log("  2. In Firebase Console, set your account's role to \"admin\"");
    console.log('  3. Log out and back in to see the Admin Panel');
  } catch (error) {
    console.error('\nSeed failed:', error);
    console.log('\nMake sure you:');
    console.log('  1. Ran `firebase login`');
    console.log('  2. Set FIREBASE_PROJECT_ID environment variable');
    console.log('  3. Deployed Firestore rules first');
    process.exit(1);
  }
}

main();
