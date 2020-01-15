import { contactsV1 } from ".";
import { ContactService } from "../services";

import DbConfig from "../config/db.config";

const contactService = new ContactService();

export const getBasicContacts = async (req, res, next) => {
  const url = `${req.protocol}://${req.hostname}:${req.app.get("port")}`;

  const userId = req.user._id.toString();

  contactService.setAsyncDependencies();

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
    userId,
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
    const userId = req.user._id.toString();
    const contactId = req.params.id;

    contactService.setAsyncDependencies();

    if (req.file) {
      const uploaded = await contactService.attachContactImage(
        userId,
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
  const userId = req.user._id.toString();
  const contactId = req.params.id;

  contactService.setAsyncDependencies();

  await contactService.getContactImage(userId, contactId, res, next);
};

export const deleteContactImage = async (req, res, next) => {
  const userId = req.user._id.toString();
  const contactId = req.params.id;

  contactService.setAsyncDependencies();

  const deleted = await contactService.deleteContactImage(
    userId,
    contactId,
    next
  );

  return deleted && res.json({ message: "Image removed" });
};

export const postUserContact = async (req, res, next) => {
  const userId = req.user._id;
  const contactData = req.body;

  const created = await contactService.postUserContact(
    userId,
    contactData,
    next
  );

  res.status(created ? 201 : 500).json({ created });
};

export const putUserContact = async (req, res, next) => {
  const user = req.user;
  const contactId = req.params.id;
  const contactData = req.body;

  const updated = await contactService.putUserContact(
    user,
    contactId,
    contactData,
    next
  );

  res.status(updated ? 200 : 500).json({ updated });
};

export const deleteUserContact = async (req, res, next) => {
  const user = req.user;
  const contactId = req.params.id;

  const deleted = await contactService.deleteUserContact(user, contactId, next);

  res.status(deleted ? 200 : 500).json({ deleted });
};
