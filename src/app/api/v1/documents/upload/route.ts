import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created } from "@/server/lib/response";
import { prisma } from "@/server/db/prisma";
import { badRequest } from "@/server/lib/errors";

export const POST = createProtectedRouteHandler(async (request, session) => {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw badRequest("Yuklenecek dosya bulunamadi.");
  }

  const cdnForm = new FormData();
  cdnForm.set("file", file, file.name);

  type CdnUploadResponse =
    | { success: true; url: string; filename?: string; original_name?: string }
    | { success: false; error?: string };

  let cdnJson: CdnUploadResponse;
  try {
    const cdnRes = await fetch("https://cdn.e-puantaj.net/upload.php", {
      method: "POST",
      body: cdnForm,
    });

    cdnJson = (await cdnRes.json()) as CdnUploadResponse;
    if (!cdnRes.ok) {
      throw badRequest("CDN dosya yukleme basarisiz.", cdnJson);
    }
  } catch (err) {
    throw badRequest("CDN dosya yukleme basarisiz.", err);
  }

  if (!cdnJson || cdnJson.success !== true || typeof cdnJson.url !== "string" || cdnJson.url.length === 0) {
    throw badRequest("CDN beklenmeyen yanit dondu.", cdnJson);
  }

  const document = await prisma.document.create({
    data: {
      tenantId: session.tenantId,
      uploadedBy: session.userId,
      path: cdnJson.url,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      originalName: file.name,
      bucket: "cdn",
    },
  });

  return created(document);
});
