import { Router } from "express";
import setContactsV2 from "./contactsV2";

const router = Router();

setContactsV2(router);

export const routerV2 = {
  baseUrl: "/api/v2",
  router
};
