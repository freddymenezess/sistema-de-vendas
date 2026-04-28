export function handleFormatCoin(price) {
  const value = Number(price);

  if (isNaN(value)) return "Kz 0,00";

  return value.toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}