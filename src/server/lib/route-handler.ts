import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/server/lib/errors";
import { fail } from "@/server/lib/response";
import { createRequestContext } from "@/server/lib/request-context";
import { logger } from "@/server/lib/logger";

type RouteExecutor = (request: NextRequest, ctx: ReturnType<typeof createRequestContext>) => Promise<NextResponse>;

export function createRouteHandler(executor: RouteExecutor) {
  return async function handler(request: NextRequest) {
    const requestContext = createRequestContext(request);
    const startedAt = Date.now();

    try {
      const response = await executor(request, requestContext);
      response.headers.set("x-request-id", requestContext.requestId);
      logger.info("api_request_ok", {
        requestId: requestContext.requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        logger.warn("api_request_error", {
          requestId: requestContext.requestId,
          method: request.method,
          path: request.nextUrl.pathname,
          statusCode: error.statusCode,
          code: error.code,
          durationMs: Date.now() - startedAt,
        });
        return fail(error.statusCode, error.code, error.message, error.details);
      }
      logger.error("api_request_unhandled_error", {
        requestId: requestContext.requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        durationMs: Date.now() - startedAt,
      });
      return fail(500, "INTERNAL_SERVER_ERROR", "Beklenmeyen bir hata olustu.");
    }
  };
}
