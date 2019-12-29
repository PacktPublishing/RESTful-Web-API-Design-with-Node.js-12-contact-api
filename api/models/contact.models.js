import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

//define Model for metadata collection.
const GFS = mongoose.model(
  "GFS",
  new mongoose.Schema({}, { strict: false }),
  "images.files"
);

const contactSchema = new mongoose.Schema(
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
    primaryEmailAddress: String,
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
    }
  },
  { versionKey: false }
);

contactSchema.plugin(mongoosePaginate);

export const Contact = mongoose.model("Contact", contactSchema);
