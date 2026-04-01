#!/usr/bin/env node
/**
 * Run User Avatar Migration
 * Adds Avatar_Data and Avatar_MIME_Type columns to User table
 */

const fs = require('fs');
const path = require('path');
const db = require('./config/db');

console.log('🔄 Running User Avatar Migration...\n');

const migrationFile = path.join(__dirname, 'sql', 'migration_add_user_avatars.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'));

let executed = 0;
const total = statements.length;

const executor = (statements, index = 0) => {
  if (index >= statements.length) {
    console.log('\n✅ User Avatar Migration completed successfully!');
    console.log(`✓ ${executed} SQL statements executed`);
    db.close();
    process.exit(0);
  }

  const statement = statements[index];
  console.log(`[${index + 1}/${total}] Executing: ${statement.substring(0, 60)}...`);

  db.exec(statement, (err) => {
    if (err) {
      console.error(`❌ Error executing statement ${index + 1}:`, err.message);
      console.error('Statement:', statement);
      db.close();
      process.exit(1);
    }
    executed++;
    executor(statements, index + 1);
  });
};

executor(statements);
