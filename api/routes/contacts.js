import { Router } from "express";

import {
  getContacts,
  getContact,
  postContact,
  putContact,
  deleteContact,
  deleteAllContact,
  postManyContacts
} from "../controllers";
import { AsyncWrapper } from "../utils/async-wrapper";

const router = Router();

// GET /contacts
router.get("/", AsyncWrapper(getContacts));

// GET /contacts/:id
router.get("/:id", AsyncWrapper(getContact));

// POST /contacts
router.post("/", AsyncWrapper(postContact));

// POST /contacts/many?n=X
router.post("/many", AsyncWrapper(postManyContacts));

// PUT /contacts/:id
router.put("/:id", AsyncWrapper(putContact));

// DELETE /contacts/:id
router.delete("/:id", AsyncWrapper(deleteContact));

// DELETE /contacts
router.delete("/", AsyncWrapper(deleteAllContact));

export const contacts = {
  baseUrl: "/contacts",
  router
};
