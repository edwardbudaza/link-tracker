import { Router, Request, Response, NextFunction } from "express";
import { container } from "../di/container";
import { RedirectController } from "../controllers/redirectController";
import { requestLogger } from "../middlewares/requestLogger";
import { TYPES } from "../di/types";

const router = Router();
const redirectController = container.get<RedirectController>(TYPES.RedirectController);

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
router.get("/:shortId", requestLogger, (req: Request, res: Response, next: NextFunction) => {
  redirectController.redirect(req, res, next);
});

export default router;
