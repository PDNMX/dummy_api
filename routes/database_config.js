// Connection URL
require('dotenv').config();

const MONGO_USER = process.env.DB_USER;
const MONGO_PASS = process.env.DB_PASSWORD;
const MONGO_HOST = process.env.DB_HOST;
const MONGO_PORT = process.env.DB_PORT;
const MONGO_DB = process.env.DB_NAME;

const MONGO_DBAUTH = process.env.MONGO_DBAUTH;
const MONGO_AUTHMECHANISM = process.env.MONGO_AUTHMECHANISM;

let url = "mongodb://" + MONGO_HOST + ":" + MONGO_PORT;

if (MONGO_USER !== "" && MONGO_PASS !== "") {
  url = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
  // url = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/?authMechanism=${MONGO_AUTHMECHANISM}&authSource=${MONGO_DBAUTH}`;
  console.log(url);
}

module.exports = {
  url:url,
  dbname:MONGO_DB
};
