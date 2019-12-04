import { ObjectID } from "bson";
import { errorHandler, fakeContacts } from "../utils";
import { Contact } from "../models";

export const getContacts = async (req, res) => {
  const contacts = await Contact.find();
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

export const getContact = async (req, res, next) => {
  const contactId = req.params.id;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const contact = await Contact.findOne({
    _id: new ObjectID(contactId)
  });
  res.json(contact);
};

export const postContact = async (req, res, next) => {
  const contact = req.body;
  (contact && contact.primaryContactNumber) ||
    next(errorHandler("Please submit valid contact", 422));

  const newContact = new Contact({ ...contact });
  await newContact.save();

  // const result = await Contact.insertOne(contact);

  // result.insertedCount === 1
  //   ? res.json({ message: "Contact created" })
  //   : next(errorHandler("No data inserted"));
};

export const postContactMany = async (req, res, next) => {
  await Contact.insertMany([...fakeContacts.values()]);

  res.json({ message: "Many contacts generated" });
};

export const putContact = async (req, res, next) => {
  const contactId = req.params.id;
  const contact = req.body;

  contactId || next(errorHandler("Please enter a contact ID", 422));
  (contact && contact.primaryContactNumber) ||
    next(errorHandler("Please submit valid contact", 422));

  const result = await Contact.updateOne(
    { _id: new ObjectID(contactId) },
    { $set: contact }
  );
  result.insertedCount === 1
    ? res.json({ message: "Contact created" })
    : next(errorHandler("No data inserted"));
};

export const deleteContact = async (req, res, next) => {
  const contactId = req.params.id;
  contactId || next(errorHandler("Please enter a contact ID", 422));

  const result = await Contact.deleteOne({
    _id: new ObjectID(contactId)
  });

  result.deletedCount === 1
    ? res.json({ message: "Contact deleted" })
    : next(errorHandler("No data deleted"));
};

export const deleteAllContact = async (req, res, next) => {
  await Contact.deleteMany({});

  res.json({ message: "All contacts deleted" });
};
