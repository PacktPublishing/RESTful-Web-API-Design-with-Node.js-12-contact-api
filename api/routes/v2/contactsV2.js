// use aliases to avoid name conflicts
import { contactsV2 as v2 } from "../../controllers";
import { AsyncWrapper } from "../../utils/async-wrapper";
import { CorsConfig } from "../../config";
import { ConfigService } from "../../services";

export default async router => {
  const corsConf = new CorsConfig(ConfigService.get("CORS_WHITELIST"));

  // GET /api/v2/contacts
  router.get(
    "/contacts",
    (res, req, next) => corsConf.setAsyncConfig()(res, req, next),
    AsyncWrapper(v2.getBasicContacts)
  );

  // GET /api/v2/contacts/full
  router.get("/contacts/full", AsyncWrapper(v2.getContacts));

  // POST /api/v2/contacts/:id/image
  router.post("/contacts/:id/image", v2.postContactImage.map(AsyncWrapper));

  // GET /api/v2/contacts/:id/image
  router.get("/contacts/:id/image", AsyncWrapper(v2.getContactImage));

  // DELETE /api/v2/contacts/:id/image
  router.delete("/contacts/:id/image", AsyncWrapper(v2.deleteContactImage));

  // POST /api/v2/contacts
  router.post("/contacts", AsyncWrapper(v2.postUserContact));

  // PUT /api/v2/contacts/:id
  router.put("/contacts/:id", AsyncWrapper(v2.putUserContact));

  // DELETE /api/v2/contacts/:id
  router.delete("/contacts/:id", AsyncWrapper(v2.deleteUserContact));
};
