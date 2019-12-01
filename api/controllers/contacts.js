import { ObjectID } from "bson";
import { errorHandler } from "../utils";
import { MongoDao } from "../config";

const getContacts = async (req, res) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );
  const contacts = await contactsCollection.find({}).toArray();
  res.format({
    // using new object method syntax (instead of json: function() {...})
    json() {
      res.json(contacts);
    },

    text() {
      const contactsAstext = contacts
        .map(contact => Object.entries(contact).map(t => t.join(":")))
        .join("\n\n ==========================>>    ");
      res.send(contactsAstext);
    },

    html() {
      const html = [
        `<table style="border: 1px solid black;">`,
        `<th style="border: 1px solid black; background:red;">Contact ID</th>
          <th style="border: 1px solid black; background:black; color:white;">Contact Data</th>
          `
      ];

      contacts.forEach(({ _id, ...contact }) => {
        html.push(`
              <tr style="border: 1px solid black;">
              <td style="border: 1px solid black; background:yellow;">${_id}</td>
              <td style="border: 1px solid black;">${Object.entries(contact)
                .map(([key, value]) => {
                  return `<p><b>${key}</b>: ${JSON.stringify(value).replace(
                    /"/g,
                    ""
                  )}</p>`;
                })
                .join("\n")}</td>
              </tr>
            `);
      });

      res.send(html.join("\n"));
    }
  });
};

const getContact = async (req, res, next) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );

  const contactId = req.params.id;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const contact = await contactsCollection.findOne({
    _id: new ObjectID(contactId)
  });
  res.json(contact);
};

const postContact = async (req, res, next) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );

  const contact = req.body;
  (contact && contact.primaryContactNumber) ||
    next(errorHandler("Please submit valid contact", 422));

  const result = await contactsCollection.insertOne(contact);
  result.insertedCount === 1
    ? res.json({ message: "Contact created" })
    : next(errorHandler("No data inserted"));
};

const putContact = async (req, res, next) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );

  const contactId = req.params.id;
  const contact = req.body;

  contactId || next(errorHandler("Please enter a contact ID", 422));
  (contact && contact.primaryContactNumber) ||
    next(errorHandler("Please submit valid contact", 422));

  const result = await contactsCollection.updateOne(
    { _id: new ObjectID(contactId) },
    { $set: contact }
  );
  result.insertedCount === 1
    ? res.json({ message: "Contact created" })
    : next(errorHandler("No data inserted"));
};

const deleteContact = async (req, res, next) => {
  const contactsCollection = MongoDao.sharedDb.dbConnection.collection(
    "contacts"
  );

  const contactId = req.params.id;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const result = await contactsCollection.deleteOne({
    _id: new ObjectID(contactId)
  });

  result.deletedCount === 1
    ? res.json({ message: "Contact deleted" })
    : next(errorHandler("No data deleted"));
};

export { getContacts, getContact, postContact, putContact, deleteContact };
