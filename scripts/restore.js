#!/usr/bin/env node

/**
 * Restore all MongoDB collections from the most recent backup folder.
 * Mirrors the behavior of `backup_db.js` – finds the latest timestamped directory
 * under ./backup/Robotics and restores each *.json file into the "Robotics"
 * database using the native MongoDB driver.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

// Resolve MongoDB connection string
const mongoUri = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DB_CONNECTION_STRING;
if (!mongoUri) {
  console.error('❌ MongoDB connection string not found in environment variables.');
  process.exit(1);
}

// Base backup directory for the Robotics DB
const backupBaseDir = path.join(__dirname, '..', 'backup', 'Robotics');
if (!fs.existsSync(backupBaseDir)) {
  console.error(`❌ Backup directory not found at ${backupBaseDir}`);
  process.exit(1);
}

// Find the most recent timestamped subdirectory (lexicographically highest)
const backupSubdirs = fs.readdirSync(backupBaseDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .sort()
  .reverse();

if (backupSubdirs.length === 0) {
  console.error('❌ No backup folders found in', backupBaseDir);
  process.exit(1);
}

const latestBackup = backupSubdirs[0];
const restoreDir = path.join(backupBaseDir, latestBackup);
console.log(`🚀 Restoring from latest backup folder: ${restoreDir}`);

const dbName = 'Robotics';

(async () => {
  try {
    const client = new MongoClient(mongoUri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    const db = client.db(dbName);
    console.log(`✅ Connected to database '${dbName}' \n`);

    const jsonFiles = fs.readdirSync(restoreDir).filter(f => f.endsWith('.json'));
    for (const file of jsonFiles) {
      const collName = path.basename(file, '.json');
      const filePath = path.join(restoreDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const docs = JSON.parse(raw);

      // Drop existing collection if present
      const existing = await db.listCollections({ name: collName }).toArray();
      if (existing.length > 0) {
        await db.collection(collName).drop();
        console.log(`⚠️ Dropped existing collection '${collName}'.`);
      }

      if (docs.length > 0) {
        await db.collection(collName).insertMany(docs);
        console.log(`✅ Restored '${collName}' with ${docs.length} documents.`);
      } else {
        // Ensure empty collection exists
        await db.createCollection(collName);
        console.log(`✅ Created empty collection '${collName}'.`);
      }

      console.log(`\n`);
    }

    await client.close();
    console.log('📦 Restore completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  }
})();
