// inside db/seed.js

// grab our client with destructuring from the export in index.js
// const { client } = require('./index');

// async function testDB() {
//     try {
        // connect the client to the database, finally
        // client.connect();

        // queries are promises, so we can await them
        // const { rows } = await client.query(`SELECT * FROM users;`);

        // for now, logging is a fine way to see what's up
    //     console.log(rows);
    // } catch (error) {
    //     console.error(error);
    // } finally {
        // it's important to close out the client connection
//         client.end();
//     }
// }

// testDB();
// inside db/seed.js

const {
    client,
    getAllUsers // new
  } = require('./index');
  
  async function testDB() {
    try {
      client.connect();
  
      const users = await getAllUsers();
      console.log(users);
    } catch (error) {
      console.error(error);
    } finally {
      client.end();
    }
  }

  // inside db/seed.js

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
      await client.query(`
  
      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls dropTables
    }
  }
  
  // this function should call a query which creates all tables for our database 
  async function createTables() {
    try {
      await client.query(`
  
      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls createTables
    }
  }
  
  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
    } catch (error) {
      console.error(error);
    } finally {
      client.end();
    }
  }
  
  rebuildDB();

