const db = require('./config/db');

db.get('SELECT Password_Reset_Token FROM User WHERE Email = ? LIMIT 1', ['ab@gmail.com'], (err, row) => {
  if (row && row.Password_Reset_Token) {
    console.log(row.Password_Reset_Token);
  } else {
    console.log('No token found');
  }
  process.exit();
});
