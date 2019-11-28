import { fakeContacts, errorHandler } from "../utils";
import { random } from "faker";

const getContacts = async (req, res) => {
  res.format({
    json: function() {
      res.json([...fakeContacts]);
    },
    
    text: function() {
      const toto = [...fakeContacts.values()]
        .map(contact => Object.entries(contact).map(t => t.join(":")))
        .join("\n\n ==========================>>    ");
      res.send(toto);
    },

    html: function() {
      const html = [
        `<table style="border: 1px solid black;">`,
        `<th style="border: 1px solid black; background:red;">Contact ID</th>
        <th style="border: 1px solid black; background:black; color:white;">Contact Data</th>
        `
      ];

      [...fakeContacts].forEach(([id, contact]) => {
        html.push(`
            <tr style="border: 1px solid black;">
            <td style="border: 1px solid black; background:yellow;">${id}</td>
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
  const id = req.params.id;

  fakeContacts.has(id)
    ? res.json(fakeContacts.get(id))
    : next(errorHandler("Unknown contact", 422));
};

const postContact = async (req, res, next) => {
  const contact = req.body;

  contact && contact.firstName
    ? fakeContacts.set(random.uuid(), contact) &&
      res.json({ message: "Contact created" })
    : next(errorHandler("Please submit valid contact", 422));
};

const putContact = async (req, res, next) => {
  const id = req.params.id;
  const contact = req.body;

  id && contact && contact.firstName
    ? fakeContacts.set(id, contact) && res.json({ message: "Contact updated" })
    : next(errorHandler("Please submit valid contact", 422));
};

const deleteContact = async (req, res, next) => {
  const id = req.params.id;

  fakeContacts.has(id)
    ? fakeContacts.delete(id) && res.json({ message: "Contact deleted" })
    : next(errorHandler("Unknown contact", 422));
};

export { getContacts, getContact, postContact, putContact, deleteContact };
