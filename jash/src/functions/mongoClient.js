const { MongoClient } = require("mongodb");
const env = require('../env')
const client = new MongoClient(env.mongoLink);

exports.connect = () => client.connect();
exports.db = client.db("ABot");