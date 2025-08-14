// Simple test script to verify processing types endpoint
const axios = require("axios");

async function testProcessingTypes() {
  try {
    console.log("Testing processing types endpoint...");

    // Test basic endpoint
    const response = await axios.get("http://localhost:3000/processing-types");
    console.log(`✓ Got ${response.data.length} processing types`);
    console.log(
      `✓ First processing type: ${response.data[0].id} - ${response.data[0].label}`
    );

    // Test material-specific endpoint
    const bstnResponse = await axios.get(
      "http://localhost:3000/processing-types/BSTN"
    );
    console.log(
      `✓ Got ${bstnResponse.data.length} processing types for BSTN materials`
    );

    console.log("\n✅ All processing types endpoints are working correctly!");
  } catch (error) {
    console.error("❌ Error testing processing types:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testProcessingTypes();
