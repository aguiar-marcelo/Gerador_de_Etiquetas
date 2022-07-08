
const oracledb = require('oracledb');
async function checkConnection() {
  try {
    connection = await oracledb.getConnection({
      user: 'user',
      password: 'senha',
      connectString: 'database'
    });
    console.log('connected to database');
  } catch (err) {
    console.error(err.message);
  } finally {
    if (connection) {
      try {
        
        await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}

checkConnection();