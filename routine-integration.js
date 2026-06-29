// Add this to the end of your "companies-dont-have-websites" routine in Claude Code
// This sends each audit to the API

const API_URL = "https://your-deployed-url.com/api/audit"; // Replace with your deployed URL
const API_TOKEN = "your-api-token-here"; // Set in your routine environment or .env

// For each business in your audit results:
async function sendAuditToAPI(businessData) {
  const auditPayload = {
    business_name: businessData.business_name,
    category: businessData.category,
    phone: businessData.phone,
    email: businessData.email,
    package: businessData.package,
    website_status: businessData.website_status,
    gbp_status: businessData.gbp_status,
    social_media_status: businessData.social_media_status,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auditPayload)
    });

    if (response.ok) {
      console.log(`✓ Sent audit for ${businessData.business_name}`);
    } else {
      console.error(`✗ Failed to send audit for ${businessData.business_name}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error sending audit: ${error.message}`);
  }
}

// Example usage:
// sendAuditToAPI({
//   business_name: "Ben Clarke Plumbing",
//   category: "Plumber",
//   phone: "(07) 3257 4660",
//   email: "contact@benclarkeplumbing.com.au",
//   package: "Package 2 – Digital Presence",
//   website_status: "Active and optimized",
//   gbp_status: "Claimed and complete",
//   social_media_status: "Active on Facebook and Instagram",
//   timestamp: new Date().toISOString()
// });
