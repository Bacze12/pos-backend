/**
 * Calculates various prices based on the purchase price and additional factors
 * @param purchasePrice - The base purchase price of the product
 * @param marginPercent - The profit margin percentage to be applied
 * @param isIvaExempt - Indicates if the product is exempt from IVA (VAT) tax
 * @param hasExtraTax - Indicates if an additional tax should be applied
 * @param extraTaxRate - Optional percentage rate for additional tax
 * @returns An object containing:
 * - sellingPrice: Base selling price with margin (before taxes)
 * - minSellingPrice: Minimum selling price (10% above purchase price)
 * - finalPrice: Final price including all applicable taxes
 */
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
