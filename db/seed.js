
const {
  
  createUser, client, getAllUsers, updateUser, getAllPosts, updatePost, 
} = require('./index');


async function dropTables() {
  try {
    await client.query(`
      DROP TABLE IF EXISTS posts;
    `);
    await client.query(`
      DROP TABLE IF EXISTS users;
    `);
  } catch (error) {
    throw error;
  }
}

//cannot have last coma in a SQL query

async function createTables() {
  try {
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true 
      );
    `);
    await client.query(`
    CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    "authorId" INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT true
    );
    `)
  } catch (error) {
    throw error;
  }
}


async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    await createPost({
      authorId: sandra.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    await createPost({
      authorId: glamgal.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    // a couple more
  } catch (error) {
    throw error;
  }
}


// new function, should attempt to create a few users
async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99', location: 'Santa Cruz', name: 'Al Bert' });
    const sandra = await createUser({ username: 'sandra', password: '2sandy4me', location: 'HELL!', name: 'Just Sandra' });
    const glamgal = await createUser({ username: 'glamgal', password: 'soglam', location: 'Chicago', name: 'Joshua' });

    // { id: 2, username: 'sandra', password: '2sandy4me' },
    // { id: 3, username: 'glamgal', password: 'soglam' }

    console.log(albert);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

// then modify rebuildDB to call our new function
async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    throw error;
  }
}



async function testDB() {
  try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    console.log("getAllUsers:", users);
    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content"
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");

    throw error;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());

