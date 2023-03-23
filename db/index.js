// require('dotenv').config();
const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");
                                                                             
async function getAllUsers() {                                     // get all Users
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
      FROM users;
    `
  );

  return rows;
}

async function updateUser(id, fields = {}) {                                         // update User
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function createUser({ username, password, name, location }) {                        //  create user
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, location) 
        VALUES($1, $2, $3, $4) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
}
async function createPost({ authorId, title, content }) {                                             //   create post
  console.log("from create post");
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts( "authorId", title, content ) 
      VALUES($1, $2, $3) 
      RETURNING *;
    `,
      [authorId, title, content]
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {                                                    //    update post
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [post],
    } = await client.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
}
async function getAllPosts() {                                                // get all posts
  try {
    const { rows } = await client.query(
      `SELECT * FROM posts;
    `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}
async function getPostsByUser(userId) {                                                   //  get posts by user
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${userId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {                                        //   get user by ID
  try {
    const { rows } = await client.query(`
    SELECT * FROM users
    WHERE id = ${userId};
    `);
    if (!rows || rows.length === 0) {
      return null;
    } else {
      const user = rows[0];
      delete user.password;
      const userPosts = await getPostsByUser(userId);
      user.posts = userPosts;
      return user;
    }
  } catch (error) {
    throw error;
  }
  // first get the user (NOTE: Remember the query returns
  // (1) an object that contains
  // (2) a `rows` array that (in this case) will contain
  // (3) one object, which is our user.
  // if it doesn't exist (if there are no `rows` or `rows.length`), return null

  // if it does:
  // delete the 'password' key from the returned object
  // get their posts (use getPostsByUser)
  // then add the posts to the user object with key 'posts'
  // return the user object
}

//tag functions

async function createPostTag(postId, tagId) {                                       // create post tag
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `,
      [postId, tagId]
    );
  } catch (error) {
    throw error;
  }
}

async function addTagsToPost(postId, tagList) {                                          //   add tags to post
  try {
    const createPostTagPromises = tagList.map((tag) => createPostTag(postId, tag.id));

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {                                               // get post by id
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
}

async function createTags(tagList) {                                          //  create tags
  if (tagList.length === 0) {
    return;
  }

  // need something like: $1), ($2), ($3
  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  // then we can use: (${ insertValues }) in our string template

  // need something like $1, $2, $3
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  // then we can use (${ selectValues }) in our string template
  console.log("insertvalues", insertValues);
  console.log("selectValues", selectValues);
  try {
    await client.query(
      `
    insert into tags (name)
    values (${insertValues})
    ON CONFLICT (name) DO NOTHING;`,
      tagList
    );
    // insert the tags, doing nothing on conflict
    // returning nothing, we'll query after
    const { rows } = await client.query(
      `
    SELECT * FROM tags
    where name IN (${selectValues});`,
      tagList
    );
    return rows;
    // select all tags where the name is in our taglist
    // return the rows from the query
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
  getAllUsers,
  updateUser,
  getAllPosts,
  updatePost,
  createPost,
  getPostsByUser,
  getUserById,
  createPostTag,
  addTagsToPost,
  createTags,
};
