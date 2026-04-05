import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { openApiSpec } from "@/server/lib/openapi";

export const GET = createRouteHandler(async () => ok(openApiSpec));
