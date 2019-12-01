import { errorHandler } from "../utils";
import { MongoDao } from "../config";
import { ObjectID } from "bson";

MongoDao;

const getGroups = async (req, res) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );
  const contacts = await contactsCollection.find({}).toArray();

  // use Set data structure to get array of unique values
  res.json([...new Set(contacts.flatMap(conntact => conntact.groups))]);
};

const getGroupsForContact = async (req, res, next) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );

  const contactId = req.params.contactId;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const contact = await contactsCollection.findOne({
    _id: new ObjectID(contactId)
  });
  res.json(contact.groups);
};

export { getGroups, getGroupsForContact };
