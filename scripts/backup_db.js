#!/usr/bin/env node

/**
 * Backup all collections from the configured MongoDB database (Robotics) to a timestamped folder.
 * Usage: node scripts/backup_db.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
// Load production environment variables (contains the Robotics DB connection string)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { MongoClient, ServerApiVersion } = require('mongodb');

(async () => {
  try {
    const rawUri = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DB_CONNECTION_STRING;
    const mongoUri = rawUri ? rawUri.replace(/^"|"$/g, '') : '';
    if (!mongoUri) {
      console.error('❌ MongoDB connection string not found in environment variables.');
      process.exit(1);
    }
    const dbName = 'Robotics';
    const client = new MongoClient(mongoUri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    const db = client.db(dbName);
    console.log(`Database     : ${db.databaseName}`);
    const collections = await db.listCollections().toArray();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backup', `${dbName}`, timestamp);
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`🔎 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}`);
    for (const coll of collections) {
      const docs = await db.collection(coll.name).find({}).toArray();
      const filePath = path.join(backupDir, `${coll.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
      console.log(`✅ Backed up collection '${coll.name}' (${docs.length} docs) to ${filePath} \n`);
    }
    await client.close();
    console.log('✅ Full database backup completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  }
})();
