import { Router } from "express";

// use aliases to avoid name conflicts
import { contactsV2 as v2 } from "../controllers";
import { AsyncWrapper } from "../utils/async-wrapper";

const router = Router();

// GET /api/v2/contacts
router.get("/", AsyncWrapper(v2.getBasicContacts));

// GET /api/v2/contacts/full
router.get("/full", AsyncWrapper(v2.getContacts));

export const contactsV2 = {
  baseUrl: "/api/v2/contacts",
  router
};
