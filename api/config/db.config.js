import mongoose from "mongoose";
import { ConfigService } from "../services/config.service";

export const connectDb = async dbName => {
  mongoose.connect(
    `mongodb+srv://${ConfigService.MONGO_USER}:${ConfigService.MONGO_PASS}@${ConfigService.MONGO_HOST}/${dbName}?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  );

  const db = mongoose.connection;
  db.on("open", () => console.log(`Connected to ${dbName} database`));
  db.on("error", err => console.error(err.message));
};
