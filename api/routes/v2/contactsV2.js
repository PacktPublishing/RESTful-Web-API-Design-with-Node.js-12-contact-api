// use aliases to avoid name conflicts
import { contactsV2 as v2 } from "../../controllers";
import { AsyncWrapper } from "../../utils/async-wrapper";

export default async router => {
  // GET /api/v2/contacts
  router.get("/contacts", AsyncWrapper(v2.getBasicContacts));

  // GET /api/v2/contacts/full
  router.get("/contacts/full", AsyncWrapper(v2.getContacts));

  // POST /api/v2/contacts/:id/image
  router.post("/contacts/:id/image", v2.postContactImage.map(AsyncWrapper));

  // GET /api/v2/contacts/:id/image
  router.get("/contacts/:id/image", AsyncWrapper(v2.getContactImage));

  // DELETE /api/v2/contacts/:id/image
  router.delete("/contacts/:id/image", AsyncWrapper(v2.deleteContactImage));
};
