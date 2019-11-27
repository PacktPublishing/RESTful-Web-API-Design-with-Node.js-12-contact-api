import { fakeContacts, errorHandler } from "../utils";
import { random } from "faker";

const getContacts = async (req, res) => {
  res.json([...fakeContacts]);
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
