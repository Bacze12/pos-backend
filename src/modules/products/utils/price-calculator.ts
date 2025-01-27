// src/products/utils/price-calculator.ts
export class PriceCalculator {
  static calculatePrices(
    purchasePrice: number,
    marginPercent: number,
    isIvaExempt: boolean,
    hasExtraTax: boolean,
    extraTaxRate?: number,
  ) {
    const marginMultiplier = 1 + marginPercent / 100;
    const sellingPrice = purchasePrice * marginMultiplier;
    const minSellingPrice = purchasePrice * 1.1;

    let finalPrice = sellingPrice;
    if (!isIvaExempt) finalPrice *= 1.19;
    if (hasExtraTax && extraTaxRate) finalPrice *= 1 + extraTaxRate / 100;

    return {
      sellingPrice: Number(sellingPrice.toFixed(2)),
      minSellingPrice: Number(minSellingPrice.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }
}
