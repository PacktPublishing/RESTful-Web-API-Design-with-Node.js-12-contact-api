import { fakeContacts, errorHandler } from "../utils";

const getGroups = async (req, res) => {
  // use Set data structure to get array of unique values
  res.json([
    ...new Set([...fakeContacts].flatMap(([, conntact]) => conntact.groups))
  ]);
};
const getGroupsForContact = async (req, res, next) => {
  const contactId = req.params.contactId;

  fakeContacts.has(contactId)
    ? res.json(fakeContacts.get(contactId).groups)
    : next(await errorHandler("Unknown contact", 422));
};

export { getGroups, getGroupsForContact };
