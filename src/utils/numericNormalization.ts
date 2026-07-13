export interface NumericNormalizationOptions {
  /**
   * Resolve a single separator followed by exactly three digits as a grouping
   * separator. Keep this off unless the surrounding text makes U.S. grouping
   * explicit (for example, a dollar-prefixed value).
   */
  allowSingleUsGroupingSeparator?: boolean;
}

export function normalizeNumericString(
  raw: string,
  options: NumericNormalizationOptions = {},
): string | null {
  const trimmed = raw
    .trim()
    .replace(/^([+-]?)([.,])/, (_match, sign: string, separator: string) => `${sign}0${separator}`);
  const match = /^([+-]?)(\d+(?:[.,]\d+)*)$/.exec(trimmed);
  if (!match) return null;

  const [, sign, unsigned] = match;
  const commaCount = countOccurrences(unsigned, ",");
  const dotCount = countOccurrences(unsigned, ".");

  if (commaCount === 0 && dotCount === 0) return `${sign}${unsigned}`;

  if (commaCount > 0 && dotCount > 0) {
    const decimalSeparator = unsigned.lastIndexOf(",") > unsigned.lastIndexOf(".") ? "," : ".";
    const groupingSeparator = decimalSeparator === "," ? "." : ",";

    if (countOccurrences(unsigned, decimalSeparator) !== 1) return null;

    const [integerPart, decimalPart] = unsigned.split(decimalSeparator);
    if (!decimalPart || !isGroupedInteger(integerPart, groupingSeparator)) return null;

    return `${sign}${integerPart.replaceAll(groupingSeparator, "")}.${decimalPart}`;
  }

  const separator = commaCount > 0 ? "," : ".";
  const separatorCount = commaCount + dotCount;

  if (separatorCount > 1) {
    if (!isGroupedInteger(unsigned, separator)) return null;
    return `${sign}${unsigned.replaceAll(separator, "")}`;
  }

  const [integerPart, fractionalPart] = unsigned.split(separator);
  const isAmbiguousSingleGrouping =
    integerPart !== "0" && integerPart.length <= 3 && fractionalPart.length === 3;

  if (isAmbiguousSingleGrouping) {
    return options.allowSingleUsGroupingSeparator && separator === ","
      ? `${sign}${integerPart}${fractionalPart}`
      : null;
  }

  return `${sign}${integerPart}.${fractionalPart}`;
}

export function parseLocaleNumber(
  raw: string,
  options: NumericNormalizationOptions = {},
): number | null {
  const normalized = normalizeNumericString(raw, options);
  if (normalized === null) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function countOccurrences(value: string, character: string): number {
  return value.split(character).length - 1;
}

function isGroupedInteger(value: string, separator: string): boolean {
  const groups = value.split(separator);
  return /^\d{1,3}$/.test(groups[0]) && groups.slice(1).every((group) => /^\d{3}$/.test(group));
}
