import { Router } from "express";
import setCpntactsV1 from "./contactsV1";
import setGroupsV1 from "./groupsV1";

const router = Router();

setCpntactsV1(router);
setGroupsV1(router);

export const routerV1 = {
  baseUrl: "/api/v1",
  router
};
