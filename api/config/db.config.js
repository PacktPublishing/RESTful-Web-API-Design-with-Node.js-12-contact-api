// @ts-checkh

import multer from "multer";
import mongoose from "mongoose";
import GridFsStorage from "multer-gridfs-storage";

import { ConfigService } from "../services/config.service";
// eslint-disable-next-line no-unused-vars
import { GridFSBucket } from "mongodb";

export default class DbCobfig {
  /** @type {mongoose.Connection} */
  static conn;
  /** @type {string} */
  static mongoURI;
  /** @type {multer.Instance} */
  static upload;
  /** @type {GridFSBucket} */
  gfsBucket;

  constructor(dbName) {
    this.dbName = dbName;
    this.mongoURI = `mongodb+srv://${ConfigService.MONGO_USER}:${ConfigService.MONGO_PASS}@${ConfigService.MONGO_HOST}/${dbName}?retryWrites=true&w=majority`;
  }

  async connectDb() {
    DbCobfig.conn = mongoose.createConnection(this.mongoURI, {
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    DbCobfig.conn.once("open", () => {
      console.log(`Connected to ${this.dbName} database`);

      this.gfsBucket = this.createGridFsBucket("uploads");
    });
    DbCobfig.conn.on("error", err => console.error(err.message));
    try {
      return await DbCobfig.conn;
    } catch (error) {
      console.error(error);
    }
  }

  createGridFsBucket(bucketName) {
    return new mongoose.mongo.GridFSBucket(DbCobfig.conn.db, {
      bucketName
    });
  }

  createMulterInstanceConnectedToGridfs() {
    const storage = new GridFsStorage({ db: this.conn.db });

    DbCobfig.upload = multer({
      storage
    });
  }
}
