export function handleFormatCoin(price) {
  if (!price && price !== 0) return 'Kz 0,00'
  return price.toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}