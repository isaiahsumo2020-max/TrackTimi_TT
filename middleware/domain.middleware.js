const db = require('../config/db');

// Domain-based organization detection middleware
const detectOrganization = async (req, res, next) => {
  try {
    const host = req.headers.host; // e.g., "acme.com" or "acme.tracktimi.com"

    // Remove port if present
    const domain = host.split(':')[0].toLowerCase();

    // Skip if it's the main app domain (you can configure this)
    const mainDomain = process.env.MAIN_DOMAIN || 'localhost';
    if (domain === mainDomain || domain === 'localhost' || domain === '127.0.0.1') {
      return next();
    }

    // Try to find organization by domain
    const org = await new Promise((resolve, reject) => {
      db.get(
        'SELECT Org_ID, Org_Name, Org_Domain FROM Organization WHERE Org_Domain = ? AND Is_Active = 1',
        [domain],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (org) {
      // Attach organization info to request
      req.organization = {
        id: org.Org_ID,
        name: org.Org_Name,
        domain: org.Org_Domain
      };
    }

    next();
  } catch (error) {
    console.error('Domain detection error:', error);
    next(); // Continue even if domain detection fails
  }
};

module.exports = { detectOrganization };