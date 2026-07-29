#!/usr/bin/env node

/**
 * Restore MongoDB collections from JSON backups.
 * The script looks for the most recent timestamped directory inside ./backup
 * (created by the backup script) and imports each <collection>.json file back
 * into the database, replacing existing data.
 *
 * Usage: node scripts/restore.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Resolve MongoDB connection string (same order as backup script).
const mongoUri = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DB_CONNECTION_STRING;
if (!mongoUri) {
  console.error('❌ MongoDB connection string not found in environment variables.');
  process.exit(1);
}

// Base backup directory (relative to project root).
const backupBaseDir = path.join(__dirname, '..', 'backup');
if (!fs.existsSync(backupBaseDir)) {
  console.error(`❌ Backup directory not found at ${backupBaseDir}`);
  process.exit(1);
}

// Choose the most recent backup folder (lexicographically highest timestamp).
const backupSubdirs = fs.readdirSync(backupBaseDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .sort()
  .reverse();

if (backupSubdirs.length === 0) {
  console.error('❌ No backup folders found.');
  process.exit(1);
}

const latestBackup = backupSubdirs[0];
const restoreDir = path.join(backupBaseDir, latestBackup);
console.log(`🚀 Restoring from backup folder: ${latestBackup}`);

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;

    const files = fs.readdirSync(restoreDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const collName = path.basename(file, '.json');
      const filePath = path.join(restoreDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const docs = JSON.parse(raw);
      // Drop existing collection to avoid duplicate keys.
      const existing = await db.listCollections({ name: collName }).toArray();
      if (existing.length > 0) {
        await db.collection(collName).drop();
        console.log(`⚠️ Dropped existing collection '${collName}'.`);
      }
      if (docs.length > 0) {
        await db.collection(collName).insertMany(docs);
        console.log(`✅ Restored '${collName}' with ${docs.length} documents.`);
      } else {
        // Create empty collection.
        await db.createCollection(collName);
        console.log(`✅ Created empty collection '${collName}'.`);
      }
      console.log(`\n`)
    }
    console.log('📦 Restore completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  }
})();
