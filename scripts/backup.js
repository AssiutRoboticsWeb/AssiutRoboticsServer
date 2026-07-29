#!/usr/bin/env node

/**
 * Backup all MongoDB collections to JSON files.
 * Connects using MONGODB_URI (or related env vars) and writes each collection
 * to a timestamped folder under ./backup.
 * Add "backup": "node scripts/backup.js" to package.json scripts to run.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DB_CONNECTION_STRING;
if (!mongoUri) {
  console.error('❌ MongoDB connection string not found in environment variables.');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, '..', 'backup', timestamp);
fs.mkdirSync(backupDir, { recursive: true });

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`🚀 Starting backup of ${collections.length} collections...`);
    for (const collInfo of collections) {
      const collName = collInfo.name;
      const collection = db.collection(collName);
      const docs = await collection.find({}).toArray();
      const filePath = path.join(backupDir, `${collName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
      console.log(`✅ Backed up ${collName} (${docs.length} docs)`);
    }
    console.log(`📦 Backup completed. Files stored in ${backupDir}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  }
})();
