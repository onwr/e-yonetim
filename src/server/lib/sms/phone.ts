export function normalizeTrPhone(phone: string) {
  let formatted = String(phone ?? "")
    .replace(/\D/g, "")
    .replace(/^\+90/, "")
    .replace(/^90/, "")
    .replace(/^0/, "");

  // 5xxxxxxxxx -> 05xxxxxxxxx
  if (formatted.length === 10) formatted = `0${formatted}`;
  return formatted;
}

export function assertTrGsm(phone: string) {
  const formatted = normalizeTrPhone(phone);
  if (formatted.length !== 11) {
    throw new Error("Gecersiz telefon numarasi formatı.");
  }
  return formatted;
}

