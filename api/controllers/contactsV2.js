import { contactsV1 } from ".";
import { findContacts } from "../services";

export const getBasicContacts = async (req, res) => {
  findContacts({
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
