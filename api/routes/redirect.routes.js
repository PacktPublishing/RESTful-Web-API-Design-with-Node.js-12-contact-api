import { Router } from "express";

const router = Router();

// 308 Permanent Redirect (method + body not modified)
router.all("/contacts*", (req, res) => {
  res.redirect(308, `/api/v1${req.url}`);
});

// 308 Permanent Redirect (method + body not modified)
router.all("/groups*", (req, res) => {
  res.redirect(308, `/api/v1${req.url}`);
});

export const redirectRouter = {
  baseUrl: "/",
  router
};
