// use aliases to avoid name conflicts
import { contactsV1 as v1 } from "../../controllers";
import { AsyncWrapper } from "../../utils/async-wrapper";

export default router => {
  // GET /api/v1/contacts
  router.get("/contacts", AsyncWrapper(v1.getContacts));

  // GET /api/v1/contacts/:id
  router.get("/contacts/:id", AsyncWrapper(v1.getContact));

  // POST /api/v1/contacts
  router.post("/contacts", AsyncWrapper(v1.postContact));

  // POST /api/v1/contacts/many?n=X
  router.post("/contacts/many", AsyncWrapper(v1.postManyContacts));

  // PUT /api/v1/contacts/:id
  router.put("/contacts/:id", AsyncWrapper(v1.putContact));

  // DELETE /api/v1/contacts/:id
  router.delete("/contacts/:id", AsyncWrapper(v1.deleteContact));

  // DELETE /api/v1/contacts
  router.delete("/contacts", AsyncWrapper(v1.deleteAllContact));
};
