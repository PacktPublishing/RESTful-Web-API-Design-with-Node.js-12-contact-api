// @ts-checkh

import multer from "multer";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import GridFsStorage from "multer-gridfs-storage";

import { ConfigService } from "../services/config.service";
// eslint-disable-next-line no-unused-vars
import { GridFSBucket } from "mongodb";

export default class DbConfig {
  /** @type {mongoose.Connection} */
  static conn;
  /** @type {string} */
  static mongoURI;
  /** @type {multer.Instance} */
  static upload;
  /** @type {GridFSBucket} */
  static gfsBucket;

  constructor(dbName) {
    this.dbName = dbName;
    this.mongoURI = `mongodb+srv://${ConfigService.MONGO_USER}:${ConfigService.MONGO_PASS}@${ConfigService.MONGO_HOST}/${dbName}?retryWrites=true&w=majority`;
  }

  async connectDb() {
    mongoose.connect(this.mongoURI, {
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    // retrieve mongoose default connectionj
    DbConfig.conn = mongoose.connection;

    DbConfig.conn.once("open", () => {
      console.log(`Connected to ${this.dbName} database`);

      DbConfig.gfsBucket = new mongoose.mongo.GridFSBucket(DbConfig.conn.db, {
        bucketName: "images"
      });
    });

    DbConfig.conn.on("error", err => console.error(err.message));

    const storage = new GridFsStorage({
      // url: this.mongoURI,
      db: DbConfig.conn,
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }
            const filename =
              buf.toString("hex") + path.extname(file.originalname);
            const fileInfo = {
              filename: filename,
              bucketName: "images"
            };
            resolve(fileInfo);
          });
        });
      }
    });

    DbConfig.upload = multer({
      storage
    });

    return DbConfig.conn;
  }

  static getMulterUploadMiddleware() {
    return async (...args) => DbConfig.upload.single("file")(...args);
  }

  static get gfsBucket() {
    return this.gfsBucket;
  }
}
