import { Router } from "express";
import { container } from "../di/container";
import { UrlController } from "../controllers/urlController";
import { requestLogger } from "../middlewares/requestLogger";

const router = Router();
const urlController = container.get<UrlController>(UrlController);

/**
 * @swagger
 * /urls/shorten:
 *   post:
 *     summary: Shorten a URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: The original URL to shorten
 *               customSlug:
 *                 type: string
 *                 description: Optional custom slug for the shortened URL
 *     responses:
 *       201:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Custom slug already in use
 *       500:
 *         description: Server error
 */
router.post("/shorten", requestLogger, urlController.shortenUrl);

/**
 * @swagger
 * /urls/process-html:
 *   post:
 *     summary: Process HTML to replace links with trackable links
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - html
 *             properties:
 *               html:
 *                 type: string
 *                 description: HTML content with links to process
 *               baseUrl:
 *                 type: string
 *                 description: Optional base URL for the shortened links
 *     responses:
 *       200:
 *         description: HTML processed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post("/process-html", requestLogger, urlController.processHtml);

export default router;
