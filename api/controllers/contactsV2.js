import { contactsV1 } from ".";
import { ContactService } from "../services";

import DbConfig from "../config/db.config";

const contactService = new ContactService();

export const getBasicContacts = async (req, res, next) => {
  const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;

  const filter = req.body.filter;
  const offset = +req.query.offset;
  const limit = +req.query.limit;
  const fields = {
    firstName: 1,
    lastName: 1,
    primaryContactNumber: 1,
    primaryEmailAddress: 1,
    image: 1
  };

  const contacts = await contactService.findContacts(
    filter,
    fields,
    offset,
    limit,
    next
  );

  contacts &&
    res.format({
      json() {
        res.json({
          ...contacts,
          docs: contactService.generateLinkedContacts(contacts.docs, url)
        });
      },
      html() {
        res.send(contactService.generateHTMLContacts(contacts.docs));
      },
      csv() {
        res.send(contactService.generateCSVContacts(contacts.docs));
      },
      text() {
        res.send(contactService.generateTextContacts(contacts.docs));
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
      const uploaded = await contactService.attachContactImage(
        url,
        contactId,
        req.file,
        next
      );

      return uploaded && res.json(req.file);
    }

    next(new Error("No uploaded file."));
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

  const deleted = await contactService.deleteContactImage(url, contactId, next);

  return deleted && res.json({ message: "Image removed" });
};
