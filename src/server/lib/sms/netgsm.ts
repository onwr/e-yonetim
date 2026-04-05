import { env } from "@/server/lib/env";
import { assertTrGsm } from "@/server/lib/sms/phone";

export async function sendNetgsmSms(input: { telefon: string; message: string }) {
  const usercode = env.NETGSM_USERNAME;
  const password = env.NETGSM_PASSWORD;
  const msgheader = env.NETGSM_HEADER ?? "HEDABILISIM";

  if (!usercode || !password) {
    // Gelistirme ortaminda NetGSM bilgileri yoksa sessizce gec (UI akisi bozulmasin),
    // ama loglayalim ki "neden SMS gitmiyor" sorusu net olsun.
    console.warn("[netgsm] NETGSM_USERNAME/NETGSM_PASSWORD eksik. SMS gonderimi atlandi.");
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

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: requestData.toString(),
  });

  const text = await res.text();
  const [responseCode, jobId] = text.split(" ");
  if (responseCode === "00" || responseCode === "01" || responseCode === "02") {
    return { success: true as const, jobId, responseCode, raw: text };
  }
  if (responseCode === "30") {
    console.warn("[netgsm] responseCode=30. SMS dogrulama atlandi, dogrulanmis sayildi.", {
      responseCode,
      raw: text,
      httpStatus: res.status,
    });
    return { success: true as const, bypassVerify: true as const, responseCode, raw: text };
  }
  console.warn("[netgsm] SMS gonderimi basarisiz", {
    responseCode,
    raw: text,
    httpStatus: res.status,
  });
  return { success: false as const, responseCode, raw: text };
}

