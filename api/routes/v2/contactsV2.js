// use aliases to avoid name conflicts
import { contactsV2 as v2 } from "../../controllers";
import { AsyncWrapper } from "../../utils/async-wrapper";

export default router => {
  // GET /api/v2/contacts
  router.get("/contacts", AsyncWrapper(v2.getBasicContacts));

  // GET /api/v2/contacts/full
  router.get("/contacts/full", AsyncWrapper(v2.getContacts));
};
