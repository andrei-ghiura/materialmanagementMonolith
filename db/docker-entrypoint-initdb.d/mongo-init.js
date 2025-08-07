// mongo-init.js
// This script will be run by MongoDB on container startup to initialize the database, collection, and user.

// Create the application database
const db = db.getSiblingDB("materialmanager_db");

// Create the materials collection with proper indexes
if (!db.getCollectionNames().includes("materials")) {
  db.createCollection("materials");

  // Create indexes for better performance
  db.materials.createIndex({ type: 1 });
  db.materials.createIndex({ specie: 1 });
  db.materials.createIndex({ cod_unic_aviz: 1 }, { unique: true });
  db.materials.createIndex({ data: 1 });
}

// Create the processings collection
if (!db.getCollectionNames().includes("processings")) {
  db.createCollection("processings");

  // Create indexes for processing history
  db.processings.createIndex({ processingDate: 1 });
  db.processings.createIndex({ processingTypeId: 1 });
  db.processings.createIndex({ sourceIds: 1 });
  db.processings.createIndex({ outputIds: 1 });
}

// Create application user with proper permissions
// This user will be used by the Node.js application
const appUser = "app_user_mm_202508";
const appPassword = "ob76Be6LOIQWAixn8KIcBEOL";

if (!db.getUser(appUser)) {
  db.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [
      { role: "readWrite", db: "materialmanager_db" },
      { role: "dbAdmin", db: "materialmanager_db" },
    ],
  });
  print("Application user created successfully");
} else {
  print("Application user already exists");
}

print("Database initialization completed");
