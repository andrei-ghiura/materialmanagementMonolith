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
// Use environment variables for app user and password (set in docker-compose)
var appUser = process.env["MONGO_APP_USER"] || "mongo_app_user";
var appPassword = process.env["MONGO_APP_PASSWORD"] || "mongo_app_password";

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

// Create the admin user for Mongo Express
const adminDb = db.getSiblingDB("admin");
var adminUser = process.env["MONGO_INITDB_ROOT_USERNAME"] || "admin";
var adminPassword =
  process.env["MONGO_INITDB_ROOT_PASSWORD"] || "adminpassword";

if (!adminDb.getUser(adminUser)) {
  adminDb.createUser({
    user: adminUser,
    pwd: adminPassword,
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" },
      { role: "dbAdminAnyDatabase", db: "admin" },
    ],
  });
}

print("Database initialization completed");
