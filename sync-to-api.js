// Add this to your routine to sync pending audits to the API
// Call this at the end of your routine to push all pending audits

const fs = require('fs');
const path = require('path');

const API_URL = "https://brisbane-audit-mh2d0vaae-crayzewastakens-projects.vercel.app/api/audit";
const API_TOKEN = "your-api-token"; // Set in your routine environment
const PENDING_FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'audits_pending.json');

async function syncAuditsToDB() {
  try {
    // Read pending audits file
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

    let synced = 0;
    let failed = 0;

    // Send each pending audit to the API
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
          console.log(`✓ Synced: ${audit.business_name}`);
        } else {
          failed++;
          console.error(`✗ Failed to sync ${audit.business_name}: ${response.status}`);
        }
      } catch (error) {
        failed++;
        console.error(`✗ Error syncing ${audit.business_name}: ${error.message}`);
      }
    }

    // Clear the pending file after syncing
    fs.writeFileSync(PENDING_FILE, JSON.stringify([]));
    console.log(`\n✓ Sync complete: ${synced} succeeded, ${failed} failed`);

    return { synced, failed };
  } catch (error) {
    console.error(`Fatal error during sync: ${error.message}`);
    return { synced: 0, failed: pendingAudits.length };
  }
}

// Add audit to pending file
function addToPending(auditData) {
  try {
    let pending = [];

    if (fs.existsSync(PENDING_FILE)) {
      const data = fs.readFileSync(PENDING_FILE, 'utf8');
      pending = JSON.parse(data);
    }

    pending.push({
      ...auditData,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
    console.log(`+ Added to pending: ${auditData.business_name}`);
  } catch (error) {
    console.error(`Error adding to pending file: ${error.message}`);
  }
}

// Export for use in your routine
module.exports = { syncAuditsToDB, addToPending };
