import { contactsV1 } from ".";
import { ContactService } from "../services";

import DbConfig from "../config/db.config";

const contactService = new ContactService();

export const getBasicContacts = async (req, res) => {
  const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;

  console.log(url);

  const contacts = await contactService.findContacts({
    firstName: 1,
    lastName: 1,
    primaryContactNumber: 1,
    primaryEmailAddress: 1,
    image: 1
  });

  res.format({
    json() {
      res.json(contactService.generateLinkedContacts(contacts, url));
    },
    html() {
      res.send(contactService.generateHTMLContacts(contacts));
    },
    csv() {
      res.send(contactService.generateCSVContacts(contacts));
    },
    text() {
      res.send(contactService.generateTextContacts(contacts));
    }
  });
};

export const getContacts = contactsV1.getContacts;

export const postContactImage = [
  DbConfig.getMulterUploadMiddleware(),
  async (req, res, next) => {
    const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;
    const contactId = req.params.id;

    if (req.file) {
      await contactService.attachContactImage(url, contactId, req.file, next);

      return res.json(req.file);
    }

    next(new Error("No uploaded file."))
  }
];

export const getContactImage = async (req, res, next) => {
  const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;
  const contactId = req.params.id;

  await contactService.getContactImage(url, contactId, res, next);
};

export const deleteContactImage = async (req, res, next) => {
  const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;
  const contactId = req.params.id;

  await contactService.deleteContactImage(url, contactId, next);

  return res.json({ message: "Image removed" });
};
