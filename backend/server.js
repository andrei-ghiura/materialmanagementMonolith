const app = require("./app");
const connectToDatabase = require("./db");
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

async function main() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Main function error:", err);
    process.exit(1);
  });
} else {
  module.exports = app;
}
