import { MongoClient } from "mongodb";

export class MongoDao extends MongoClient {
  // shared connection to DB
  static sharedDb;

  constructor(url, dbname) {
    super(url || "mongodb://localhost:27017", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    return (async () => {
      try {
        const db = await this.connect();
        MongoDao.sharedDb = db;
        console.log("mongo client successfully connected \n");
        this.dbConnection = this.db(dbname);
        return this;
      } catch (error) {
        console.error({
          message: error.message,
          stack: error.stack
        });
      }
    })();
  }

  async findDocument(collectionName, filter) {
    return await this.dbConnection.collection(collectionName).findOne(filter);
  }

  async insertDocument(collectionName, doc) {
    return await this.dbConnection.collection(collectionName).insertOne(doc);
  }

  async insertDocuments(collectionName, docs) {
    return await this.dbConnection.collection(collectionName).insertMany(docs);
  }

  async updateDocument(collectionName, filter, updateOperation) {
    return await this.dbConnection
      .collection(collectionName)
      .updateOne(filter, updateOperation);
  }

  async deleteDocument(collectionName, filter) {
    return await this.dbConnection.collection(collectionName).deleteOne(filter);
  }

  async deleteAllDocument(collectionName) {
    return await this.dbConnection.collection(collectionName).deleteMany();
  }
}
