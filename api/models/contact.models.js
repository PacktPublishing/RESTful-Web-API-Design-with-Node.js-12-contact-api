import mongoose from "mongoose";

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
    ]
  },
  { versionKey: false }
);

export const Contact = mongoose.model("Contact", contactSchema);
