// mongo-init.js
// This script will be run by MongoDB on container startup to initialize the database, collection, and user.

// Create the database
const db = db.getSiblingDB('materialmanager');

// Create the collection
if (!db.getCollectionNames().includes('material')) {
  db.createCollection('material');
}

// Create a test user
// Username: testuser, Password: testpass
// Roles: readWrite on materialmanager
if (!db.getUser('testuser')) {
  db.createUser({
    user: 'testuser',
    pwd: 'testpass',
    roles: [
      { role: 'readWrite', db: 'materialmanager' }
    ]
  });
}
