import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { APP_CONFIG } from "./config/app";
import { connectDB } from "./config/database";
import { logger } from "./config/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

// Import routes
import urlRoutes from "./routes/urlRoutes";
import redirectRoutes from "./routes/redirectRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Link Tracker API",
      version: "1.0.0",
      description: "API for tracking link clicks from HTML pages and emails",
    },
    servers: [
      {
        url: APP_CONFIG.baseUrl,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors());

    // Compression
    this.app.use(compression());

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use(requestLogger);

    // Swagger documentation
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use(`${APP_CONFIG.apiPrefix}/urls`, urlRoutes);
    this.app.use(`${APP_CONFIG.apiPrefix}/analytics`, analyticsRoutes);

    // Redirection route (needs to be last to avoid conflicts)
    this.app.use("/", redirectRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await connectDB();

      // Start the server
      const port = APP_CONFIG.port;
      this.app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
        logger.info(
          `API Documentation available at ${APP_CONFIG.baseUrl}/api-docs`
        );
      });
    } catch (error) {
      logger.error("Failed to start the server", error);
      process.exit(1);
    }
  }
}

export default App;
