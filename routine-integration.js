// Add this to the end of your "companies-dont-have-websites" routine in Claude Code
// This sends each audit to the API

const API_URL = "https://your-deployed-url.com/api/audit"; // Replace with your deployed URL
const API_TOKEN = "your-api-token-here"; // Set in your routine environment or .env

// For each business in your audit results:
async function sendAuditToAPI(businessData) {
  const auditPayload = {
    // Business info
    business_name: businessData.business_name,
    category: businessData.category,
    phone: businessData.phone,
    email: businessData.email,

    // Audit findings
    package: businessData.package,
    website_status: businessData.website_status,
    gbp_status: businessData.gbp_status,
    social_media_status: businessData.social_media_status,

    // Business metrics
    total_cost: businessData.total_cost, // Cost to build solution for this client
    total_profit: businessData.total_profit, // Potential profit if secured
    time_to_build_hours: businessData.time_to_build_hours, // Hours needed

    // Outreach & conversion
    outreach_status: businessData.outreach_status, // "not_contacted", "contacted", "interested", "negotiating", "secured"
    securing_probability: businessData.securing_probability, // 0-100 percentage
    wants_bundle: businessData.wants_bundle, // true/false
    bundle_details: businessData.bundle_details, // What bundle they're interested in

    // Scoring
    worth_score: businessData.worth_score, // 1-5 stars, is it worth pursuing?
    confidence_level: businessData.confidence_level, // 1-5 stars, how confident in this assessment?
    notes: businessData.notes, // Any other notes

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
//   total_cost: 2500,
//   total_profit: 8000,
//   time_to_build_hours: 40,
//   outreach_status: "contacted",
//   securing_probability: 75,
//   wants_bundle: true,
//   bundle_details: "Website + SEO + Social Media",
//   worth_score: 5,
//   confidence_level: 4,
//   notes: "High-value prospect, responsive to initial outreach"
// });
