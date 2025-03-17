import { Router } from "express";
import { container } from "../di/container";
import { RedirectController } from "../controllers/redirectController";
import { requestLogger } from "../middlewares/requestLogger";

const router = Router();
const redirectController =
  container.get<RedirectController>(RedirectController);

/**
 * @swagger
 * /{shortId}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags: [Redirect]
 *     parameters:
 *       - in: path
 *         name: shortId
 *         required: true
 *         schema:
 *           type: string
 *         description: The short ID of the URL
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: URL not found
 *       500:
 *         description: Server error
 */
router.get("/:shortId", requestLogger, redirectController.redirect);

export default router;
