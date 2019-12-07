import { Router } from "express";

// use aliases to avoid name conflicts
import { contactsV1 as v1 } from "../controllers";
import { AsyncWrapper } from "../utils/async-wrapper";

const router = Router();

// GET /api/v1/contacts
router.get("/", AsyncWrapper(v1.getContacts));

// GET /api/v1/contacts/:id
router.get("/:id", AsyncWrapper(v1.getContact));

// POST /api/v1/contacts
router.post("/", AsyncWrapper(v1.postContact));

// POST /api/v1/contacts/many?n=X
router.post("/many", AsyncWrapper(v1.postManyContacts));

// PUT /api/v1/contacts/:id
router.put("/:id", AsyncWrapper(v1.putContact));

// DELETE /api/v1/contacts/:id
router.delete("/:id", AsyncWrapper(v1.deleteContact));

// DELETE /api/v1/contacts
router.delete("/", AsyncWrapper(v1.deleteAllContact));

export const contactsV1 = {
  baseUrl: "/api/v1/contacts",
  router
};
