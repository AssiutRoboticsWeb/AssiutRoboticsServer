/**
 * Member Seeder
 * =============
 * Seeds sample members into the MongoDB database based on the Member schema.
 *
 * Usage:
 *   node seeders/memberSeeder.js           # Seed members (skip if DB not empty)
 *   node seeders/memberSeeder.js --fresh   # Drop all members & reseed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Member = require('../mongoose.models/member');

// ============================================
// Configuration
// ============================================
const DEFAULT_PASSWORD = 'assiutRoboticsWeb@2025';
const SALT_ROUNDS = 10;

// ============================================
// Sample Member Data (based on Member schema)
// ============================================
const SAMPLE_MEMBERS = [
  {
    name: 'Assiut Robotics',
    email: 'assiutroboticsweb@gmail.com',
    committee: 'High Board',
    gender: 'male',
    phoneNumber: '01064713712',
    role: 'head',
    avatar: '../all-images/default.png',
  },
];

// ============================================
// Main Seeder
// ============================================
async function seedMembers() {
  const isFresh = process.argv.includes('--fresh');

  // --- Validate env ---
  if (!process.env.MONGOURL) {
    throw new Error('MONGOURL is not defined in your .env file!');
  }

  // --- Connect ---
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGOURL);
  console.log('✅ Connected to MongoDB');

  // --- Fresh mode: drop existing members ---
  if (isFresh) {
    console.log('🗑️  --fresh flag detected. Dropping all members…');
    const { deletedCount } = await Member.deleteMany({});
    console.log(`   Deleted ${deletedCount} existing member(s).`);
  }

  // --- Hash default password once ---
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // --- Seed ---
  let seededCount = 0;
  let skippedCount = 0;

  for (const memberData of SAMPLE_MEMBERS) {
    // Check if member already exists by email
    const exists = await Member.findOne({ email: memberData.email });
    if (exists) {
      console.log(`⏭️  "${memberData.name}" (${memberData.email}) already exists — skipping`);
      skippedCount++;
      continue;
    }

    // Build full member document matching the schema
    const doc = {
      name: memberData.name,
      email: memberData.email,
      password: hashedPassword,
      committee: memberData.committee,
      gender: memberData.gender,
      phoneNumber: memberData.phoneNumber,
      role: memberData.role,
      avatar: memberData.avatar || '../all-images/default.png',
      verified: true,
      messages: [],
      alerts: [],
      warnings: [],
      avg_rate: [],
      tasks: [],
      hr_rate: [],
      startedTracks: [],
      visits: [],
      feedBacks: [],
    };

    // Insert directly to bypass the registration deadline pre-save hook
    const member = new Member(doc);
    await Member.collection.insertOne(member.toObject());

    console.log(`✅ Seeded: ${memberData.name} | ${memberData.committee} | ${memberData.role}`);
    seededCount++;
  }

  // --- Summary ---
  console.log('\n' + '='.repeat(50));
  console.log('🌱 Member Seeding Complete!');
  console.log('='.repeat(50));
  console.log(`   ✅ Seeded:  ${seededCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   📊 Total in DB: ${await Member.countDocuments()}`);
  console.log(`   🔑 Default password: ${DEFAULT_PASSWORD}`);
  console.log('='.repeat(50));

  // --- Disconnect ---
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

// ============================================
// Run
// ============================================
seedMembers().catch((err) => {
  console.error('❌ Seeder failed:', err.message);
  console.error(err);
  process.exit(1);
});
