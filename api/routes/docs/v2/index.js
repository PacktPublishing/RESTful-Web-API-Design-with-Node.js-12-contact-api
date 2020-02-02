import { Router } from "express";
import { SwaggerMiddleware } from "../../../middlewares";

const swaggerMiddleware = new SwaggerMiddleware(
  "2.0.0",
  [
    {
      url: "http://localhost:3000/api/v2"
    }
  ],
  ["./config/*.js","./routes/**/*.yaml"]
);

const router = Router();
router.use("/", swaggerMiddleware.swaggerUiHandlers);

// GET /api/docs/v2
router.get("/", swaggerMiddleware.swaggerUiMiddleware);

export const routerV2Docs = {
  baseUrl: "/api/docs/v2",
  router
};
