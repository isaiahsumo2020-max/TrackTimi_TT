const db = require('../config/db');

console.log('📊 Fetching user statistics by organization...\n');

const sql = `
  SELECT 
    o.Org_ID,
    o.Org_Name,
    COUNT(u.User_ID) as total_users,
    SUM(CASE WHEN u.User_Type_ID = 1 THEN 1 ELSE 0 END) as admins,
    SUM(CASE WHEN u.User_Type_ID = 2 THEN 1 ELSE 0 END) as managers,
    SUM(CASE WHEN u.User_Type_ID = 3 THEN 1 ELSE 0 END) as staff,
    SUM(CASE WHEN u.Is_Active = 1 THEN 1 ELSE 0 END) as active_users
  FROM Organization o
  LEFT JOIN User u ON o.Org_ID = u.Org_ID
  GROUP BY o.Org_ID, o.Org_Name
  ORDER BY total_users DESC
`;

db.all(sql, (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('📭 No organization data found');
    process.exit(0);
  }

  console.log(`✅ Statistics for ${rows.length} organization(s)\n`);
  console.table(rows);
  
  // Calculate totals
  const totals = rows.reduce((acc, row) => ({
    total_users: acc.total_users + (row.total_users || 0),
    admins: acc.admins + (row.admins || 0),
    managers: acc.managers + (row.managers || 0),
    staff: acc.staff + (row.staff || 0),
    active_users: acc.active_users + (row.active_users || 0)
  }), { total_users: 0, admins: 0, managers: 0, staff: 0, active_users: 0 });

  console.log('\n📈 OVERALL STATISTICS:');
  console.log(`   Total Users: ${totals.total_users}`);
  console.log(`   Admins: ${totals.admins}`);
  console.log(`   Managers: ${totals.managers}`);
  console.log(`   Staff: ${totals.staff}`);
  console.log(`   Active: ${totals.active_users}\n`);
  
  process.exit(0);
});
