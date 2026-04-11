import { env } from "@/server/lib/env";
import { assertTrGsm } from "@/server/lib/sms/phone";

export async function sendNetgsmSms(input: { telefon: string; message: string }) {
  const usercode = env.NETGSM_USERNAME;
  const password = env.NETGSM_PASSWORD;
  const msgheader = env.NETGSM_HEADER ?? "HEDABILISIM";

  if (!usercode || !password) {
    console.warn("[netgsm] NETGSM_USERNAME/NETGSM_PASSWORD eksik. SMS gonderimi atlandi.");
    // Geliştirme ortamında bypass et ama production'da hata ver
    if (process.env.NODE_ENV === "production") {
      return { success: false as const, responseCode: "ENV_MISSING", raw: "" };
    }
    return { success: true as const, skipped: true as const };
  }

  const gsmno = assertTrGsm(input.telefon);
  const apiUrl = "https://api.netgsm.com.tr/sms/send/get";

  const requestData = new URLSearchParams({
    usercode,
    password,
    gsmno,
    message: input.message,
    msgheader,
    dil: "TR",
  });

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: requestData.toString(),
    });
  } catch (err) {
    console.error("[netgsm] Ag hatasi:", err);
    return { success: false as const, responseCode: "NETWORK_ERROR", raw: "" };
  }

  const text = await res.text();
  const parts = text.trim().split(" ");
  const responseCode = parts[0];
  const jobId = parts[1];

  console.log("[netgsm] Yanit:", { responseCode, jobId, raw: text, httpStatus: res.status });

  // Başarılı kodlar: 00=gönderildi, 01=gönderildi (ücretli), 02=gönderildi (kuyruğa alındı)
  if (responseCode === "00" || responseCode === "01" || responseCode === "02") {
    return { success: true as const, jobId, responseCode, raw: text };
  }

  // Tüm diğer kodlar hata — bypass YOK
  console.error("[netgsm] SMS gonderimi basarisiz:", { responseCode, raw: text, httpStatus: res.status });
  return { success: false as const, responseCode, raw: text };
}
