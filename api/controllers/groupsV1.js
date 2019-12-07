import { errorHandler } from "../utils";
import { ObjectID } from "bson";
import { Contact } from "../models";

export const getGroups = async (req, res) => {
  const contacts = await Contact.find();

  // use Set data structure to get array of unique values
  res.json([...new Set(contacts.flatMap(conntact => conntact.groups))]);
};

export const getGroupsForContact = async (req, res, next) => {
  const contactId = req.params.contactId;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const contact = await Contact.findOne({
    _id: new ObjectID(contactId)
  });
  res.json(contact.groups);
};
