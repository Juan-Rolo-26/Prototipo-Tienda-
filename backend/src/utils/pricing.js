function parsePriceToCents(value) {
  const raw = String(value || "").trim();
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(/\s+/g, "");
  let normalized = cleaned;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error("Invalid price");
  }
  return Math.round(number * 100);
}

function formatCentsToNumber(cents) {
  return Number((cents / 100).toFixed(2));
}

module.exports = { parsePriceToCents, formatCentsToNumber };
