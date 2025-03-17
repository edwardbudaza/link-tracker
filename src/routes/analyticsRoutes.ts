import { Router } from "express";
import { container } from "../di/container";
import { AnalyticsController } from "../controllers/analyticsController";
import { requestLogger } from "../middlewares/requestLogger";

const router = Router();
const analyticsController =
  container.get<AnalyticsController>(AnalyticsController);

/**
 * @swagger
 * /analytics/url/{urlId}:
 *   get:
 *     summary: Get clicks for a specific URL
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *         description: The short ID of the URL
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get("/url/:urlId", requestLogger, analyticsController.getClicksByUrlId);

/**
 * @swagger
 * /analytics/date-range:
 *   get:
 *     summary: Get clicks within a date range
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in ISO format
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in ISO format
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get(
  "/date-range",
  requestLogger,
  analyticsController.getClicksByDateRange
);

/**
 * @swagger
 * /analytics/top:
 *   get:
 *     summary: Get top clicked URLs
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Top URLs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/top", requestLogger, analyticsController.getTopClicks);

export default router;
