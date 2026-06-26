import { Router } from "express";
import type { Request, Response } from "express";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";

/**
 * Health check route for load balancers, Kubernetes probes,
 * and monitoring services like UptimeRobot or Datadog.
 *
 * Returns 200 with uptime, timestamp, and environment info.
 * This endpoint should NOT require authentication.
 */

const router = Router();

router.get("/", (req: Request, res: Response) => {
  responseHandler(
    res,
    HttpStatusCode.OK,
    "health.ok",
    {
      uptime: process.uptime(), // Total seconds the server has been running
      timestamp: new Date().toISOString(), // Current server time in ISO format
      environment: process.env["NODE_ENV"] ?? "development", // Current deployment mode
      memoryUsage: process.memoryUsage().rss, // Current RAM usage in bytes
    },
  );
});

export default router;
