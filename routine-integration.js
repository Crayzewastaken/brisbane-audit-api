// ============================================
// ADD THIS TO YOUR ROUTINE
// ============================================

const fs = require('fs');
const path = require('path');

const API_URL = "https://brisbane-audit-mh2d0vaae-crayzewastakens-projects.vercel.app/api/audit";
const API_TOKEN = "your-api-token-from-vercel"; // Set in your routine environment
const PENDING_FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'audits_pending.json');

// ============================================
// 1. ADD THIS FOR EACH BUSINESS (in your loop)
// ============================================

function addAuditToPending(businessData) {
  try {
    let pending = [];

    if (fs.existsSync(PENDING_FILE)) {
      const data = fs.readFileSync(PENDING_FILE, 'utf8');
      pending = JSON.parse(data);
    }

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
      total_cost: businessData.total_cost,
      total_profit: businessData.total_profit,
      time_to_build_hours: businessData.time_to_build_hours,

      // Outreach & conversion
      outreach_status: businessData.outreach_status,
      securing_probability: businessData.securing_probability,
      wants_bundle: businessData.wants_bundle,
      bundle_details: businessData.bundle_details,

      // Scoring
      worth_score: businessData.worth_score,
      confidence_level: businessData.confidence_level,
      notes: businessData.notes,

      timestamp: new Date().toISOString()
    };

    pending.push(auditPayload);
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
    console.log(`+ Added to pending: ${businessData.business_name}`);
  } catch (error) {
    console.error(`Error adding to pending: ${error.message}`);
  }
}

// ============================================
// 2. ADD THIS AT THE END OF YOUR ROUTINE
// ============================================

async function syncPendingAudits() {
  try {
    if (!fs.existsSync(PENDING_FILE)) {
      console.log('No pending audits to sync');
      return { synced: 0, failed: 0 };
    }

    const pendingData = fs.readFileSync(PENDING_FILE, 'utf8');
    const pendingAudits = JSON.parse(pendingData);

    if (!Array.isArray(pendingAudits) || pendingAudits.length === 0) {
      console.log('No pending audits to sync');
      return { synced: 0, failed: 0 };
    }

    console.log(`\nSyncing ${pendingAudits.length} pending audits to API...`);

    let synced = 0;
    let failed = 0;

    for (const audit of pendingAudits) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(audit)
        });

        if (response.ok) {
          synced++;
          console.log(`  ✓ ${audit.business_name}`);
        } else {
          failed++;
          console.log(`  ✗ ${audit.business_name} (${response.status})`);
        }
      } catch (error) {
        failed++;
        console.log(`  ✗ ${audit.business_name} (${error.message})`);
      }
    }

    // Clear pending file after syncing
    fs.writeFileSync(PENDING_FILE, JSON.stringify([]));
    console.log(`\n✓ Sync complete: ${synced} succeeded, ${failed} failed`);

    return { synced, failed };
  } catch (error) {
    console.error(`Fatal sync error: ${error.message}`);
    return { synced: 0, failed: 0 };
  }
}

// ============================================
// USAGE IN YOUR ROUTINE:
// ============================================

// For each business you audit, call:
// addAuditToPending({
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

// At the very end of your routine (after all businesses), call:
// await syncPendingAudits();
// This syncs ALL pending audits to the API in one batch.
