import { contactsV1 } from ".";
import { contactService } from "../services";

import DbConfig from "../config/db.config";

export const getBasicContacts = async (req, res) => {
  contactService.findContacts({
    fields: {
      firstName: 1,
      lastName: 1,
      primaryContactNumber: 1,
      primaryEmailAddress: 1
    },
    req,
    res
  });
};

export const getContacts = contactsV1.getContacts;

export const deleteContactImage = async (req, res, next) => {
  contactService.deleteContactImage(req, res, next);
};

export const getContactImage = async (req, res, next) => {
  contactService.getContactImage(req, res, next);
};

export const postContactImage = [
  DbConfig.getMulterUploadMiddleware(),
  async (req, res) => {
    res.json(req.file);
  }
];
