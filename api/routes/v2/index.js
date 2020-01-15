import { Router } from "express";
import setContactsV2 from "./contactsV2";
import { RouteProtectorMiddleware } from "../../middlewares";

const router = Router();

router.use(new RouteProtectorMiddleware().authenticate());

setContactsV2(router);

export const routerV2 = {
  baseUrl: "/api/v2",
  router
};
