import { Router } from "express";
import { getGroups, getGroupsForContact } from "../controllers";
import { AsyncWrapper } from "../utils";

const router = Router();

// GET /groups
router.get("/", AsyncWrapper(getGroups));

// GET /groups/:contactId
router.get("/:contactId", AsyncWrapper(getGroupsForContact));

// DELETE /groups/:id
router.get("/:id", () => null);

export const groups = {
  baseUrl: "/groups",
  router
};
