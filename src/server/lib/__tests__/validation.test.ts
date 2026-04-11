import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateSchema } from "@/server/lib/validation";
import { ApiError } from "@/server/lib/errors";

describe("validateSchema", () => {
  it("valid payload geldiginde parse eder", () => {
    const schema = z.object({ name: z.string().min(2) });
    const result = validateSchema(schema, { name: "Ali" });
    expect(result.name).toBe("Ali");
  });

  it("invalid payload geldiginde ApiError firlatir", () => {
    const schema = z.object({ name: z.string().min(2) });
    expect(() => validateSchema(schema, { name: "A" })).toThrowError(ApiError);
  });
});
