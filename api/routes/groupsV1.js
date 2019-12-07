import { Router } from "express";
import { groupsV1 as v1 } from "../controllers";
import { AsyncWrapper } from "../utils";

const router = Router();

// GET /api/v1/groups
router.get("/", AsyncWrapper(v1.getGroups));

// GET /api/v1/groups/:contactId
router.get("/:contactId", AsyncWrapper(v1.getGroupsForContact));

export const groupsV1 = {
  baseUrl: "/api/v1/groups",
  router
};
