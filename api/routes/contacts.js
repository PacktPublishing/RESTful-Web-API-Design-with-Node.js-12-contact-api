import { Router } from "express";

import {
  getContacts,
  getContact,
  postContact,
  putContact,
  deleteContact
} from "../controllers";
import { AsyncWrapper } from "../utils/async-wrapper";

const router = Router();

// GET /contacts
router.get("/", AsyncWrapper(getContacts));

// GET /contacts/:id
router.get("/:id", AsyncWrapper(getContact));

// POST /contacts
router.post("/", AsyncWrapper(postContact));

// PUT /contacts/:id
router.put("/:id", AsyncWrapper(putContact));

// DELETE /contacts/:id
router.delete("/:id", AsyncWrapper(deleteContact));

export const contacts = {
  baseUrl: "/contacts",
  router
};
