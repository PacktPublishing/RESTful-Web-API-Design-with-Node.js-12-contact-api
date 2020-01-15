import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { GFS } from "./contact.models";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    title: String,
    company: String,
    jobTitle: String,
    address: String,
    city: String,
    country: String,
    primaryContactNumber: String,
    otherContactNumbers: [String],
    primaryEmailAddress: {
      type: String,
      unique: true
    },
    otherEmailAddresses: [String],
    groups: [String],
    socialMedia: [
      {
        name: String,
        link: String
      }
    ],
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GFS"
    },
    credential: {
      password: String
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
      }
    ]
  },
  { versionKey: false }
);

userSchema.plugin(mongoosePaginate);

export const User = mongoose.model("User", userSchema);
