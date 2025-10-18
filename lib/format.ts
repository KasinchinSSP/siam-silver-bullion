// lib/format.ts
export function formatTHBInt(n: number) {
  return Number(n ?? 0).toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export function formatTHB(n: number, digits = 2) {
  return Number(n ?? 0).toLocaleString("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function toThaiDateLabel(dateISO: string) {
  try {
    const d = new Date(dateISO);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateISO;
  }
}

export function toThaiTimeLabel(dateISO: string) {
  try {
    const d = new Date(dateISO);
    return (
      d.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " น."
    );
  } catch {
    return dateISO;
  }
}
