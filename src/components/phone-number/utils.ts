import type { Country, CountryData, PhoneNumberState } from "./types";

export interface FormatNumberParams {
  text: string;
  pattern?: string | string[];
  disableCountryCode: boolean;
  autoFormat: boolean;
  enableLongNumbers: boolean;
}

/**
 * When a country has multiple format patterns, pick the one whose dot-count
 * best matches the number of input digits:
 * - Prefer the smallest pattern whose dot-count >= digitCount (exact or next up).
 * - Fall back to the largest pattern when the input exceeds all patterns
 *   (enableLongNumbers will append the overflow).
 */
const selectPattern = (patterns: string[], digitCount: number): string => {
  const ranked = patterns
    .map((p) => ({ p, dots: (p.match(/\./g) ?? []).length }))
    .sort((a, b) => a.dots - b.dots);
  return (
    ranked.find(({ dots }) => dots >= digitCount)?.p ??
    ranked[ranked.length - 1].p
  );
};

export interface BuildInitialStateParams {
  allCountries: Country[];
  onlyCountries: Country[];
  preferredCountries: Country[];
  defaultCountry: string;
  disableCountryCode: boolean;
  placeholder: string;
  value: string;
  autoFormat: boolean;
  enableLongNumbers: boolean;
}

export const sanitizeDialInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const guessSelectedCountry = (
  inputNumber: string,
  onlyCountries: Country[],
  defaultCountryCode: string,
): Country | null => {
  const defaultCountry =
    onlyCountries.find(
      (country: Country) => country.iso2 === defaultCountryCode,
    ) ?? null;

  if (inputNumber.trim().length === 0) {
    return defaultCountry;
  }

  let bestGuess: Country | null = null;

  for (const country of onlyCountries) {
    if (!inputNumber.startsWith(country.dialCode)) {
      continue;
    }

    if (bestGuess === null) {
      bestGuess = country;
      continue;
    }

    const countryDialLength = country.dialCode.length;
    const bestDialLength = bestGuess.dialCode.length;
    const countryPriority = country.priority ?? 0;
    const bestPriority = bestGuess.priority ?? 0;

    if (
      countryDialLength > bestDialLength ||
      (countryDialLength === bestDialLength && countryPriority < bestPriority)
    ) {
      bestGuess = country;
    }
  }

  return bestGuess ?? defaultCountry;
};

export const formatNumber = ({
  text,
  pattern,
  disableCountryCode,
  autoFormat,
  enableLongNumbers,
}: FormatNumberParams): string => {
  // Resolve multi-format: pick the pattern that best fits the digit count.
  const resolvedPattern = Array.isArray(pattern)
    ? selectPattern(pattern, text.length)
    : pattern;

  let normalizedPattern = resolvedPattern;

  if (disableCountryCode && normalizedPattern) {
    const [, ...patternParts] = normalizedPattern.split(" ");
    normalizedPattern = patternParts.join(" ");
  }

  if (text.length === 0) {
    return disableCountryCode ? "" : "+";
  }

  if (text.length < 2 || !normalizedPattern || !autoFormat) {
    return disableCountryCode ? text : `+${text}`;
  }

  let formattedText = "";
  let nextDigitIndex = 0;

  for (const character of normalizedPattern) {
    if (nextDigitIndex >= text.length) {
      break;
    }

    if (character === ".") {
      formattedText += text[nextDigitIndex];
      nextDigitIndex += 1;
    } else {
      formattedText += character;
    }
  }

  if (enableLongNumbers && nextDigitIndex < text.length) {
    formattedText += text.slice(nextDigitIndex);
  }

  if (formattedText.includes("(") && !formattedText.includes(")")) {
    formattedText += ")";
  }

  return formattedText;
};

export const getProcessedCountries = (
  countries: Country[],
  disableAreaCodes: boolean,
  regions: string | string[],
): Country[] => {
  let filteredCountries = countries;

  if (disableAreaCodes) {
    filteredCountries = filteredCountries.filter((country: Country) => {
      return country.isAreaCode !== true;
    });
  }

  if (typeof regions === "string") {
    if (regions.length === 0) {
      return filteredCountries;
    }

    return filteredCountries.filter((country: Country) => {
      return (
        country.regions?.some((region: string) => region === regions) ?? false
      );
    });
  }

  if (regions.length === 0) {
    return filteredCountries;
  }

  return filteredCountries.filter((country: Country) => {
    return (
      country.regions?.some((countryRegion: string) => {
        return regions.some((selectedRegion: string) => {
          return selectedRegion === countryRegion;
        });
      }) ?? false
    );
  });
};

export const getOnlyCountries = (
  countries: Country[],
  allowedIso2Codes: string[],
): Country[] => {
  if (allowedIso2Codes.length === 0) {
    return countries;
  }

  const allowed = new Set(allowedIso2Codes);
  return countries.filter((country: Country) => allowed.has(country.iso2));
};

export const excludeCountriesFromList = (
  countries: Country[],
  excludedIso2Codes: string[],
): Country[] => {
  if (excludedIso2Codes.length === 0) {
    return countries;
  }

  const excluded = new Set(excludedIso2Codes);
  return countries.filter((country: Country) => !excluded.has(country.iso2));
};

export const getPreferredCountries = (
  countries: Country[],
  preferredIso2Codes: string[],
): Country[] => {
  if (preferredIso2Codes.length === 0) {
    return [];
  }

  const preferred = new Set(preferredIso2Codes);
  return countries.filter((country: Country) => preferred.has(country.iso2));
};

export const buildInitialState = ({
  allCountries,
  onlyCountries,
  preferredCountries,
  defaultCountry,
  disableCountryCode,
  placeholder,
  value,
  autoFormat,
  enableLongNumbers,
}: BuildInitialStateParams): PhoneNumberState => {
  const inputValue = value;
  const inputDigits = sanitizeDialInput(inputValue);

  let selectedCountry: Country | null = null;

  if (inputValue.length > 1) {
    selectedCountry = guessSelectedCountry(
      inputDigits.substring(0, 6),
      onlyCountries,
      defaultCountry,
    );
  } else if (defaultCountry.length > 0) {
    selectedCountry =
      onlyCountries.find(
        (country: Country) => country.iso2 === defaultCountry,
      ) ?? null;
  }

  const dialCode =
    inputValue.length < 2 &&
    selectedCountry &&
    !inputDigits.startsWith(selectedCountry.dialCode)
      ? selectedCountry.dialCode
      : "";

  const formattedNumber =
    inputValue.length === 0 && selectedCountry === null
      ? ""
      : formatNumber({
          text: `${disableCountryCode ? "" : dialCode}${inputDigits}`,
          pattern: selectedCountry?.format,
          disableCountryCode,
          autoFormat,
          enableLongNumbers,
        });

  const selectedCountryDialCode = selectedCountry?.dialCode;
  const selectedCountryIso2 = selectedCountry?.iso2;
  const selectedCountryIndex = allCountries.findIndex((country: Country) => {
    return (
      country.iso2 === selectedCountryIso2 &&
      country.dialCode === selectedCountryDialCode
    );
  });

  const fallbackCountry =
    selectedCountryIndex >= 0
      ? allCountries[selectedCountryIndex]
      : selectedCountry;

  return {
    formattedNumber,
    placeholder,
    onlyCountries,
    preferredCountries,
    defaultCountry,
    selectedCountry: fallbackCountry ?? null,
    freezeSelection: false,
    anchorEl: null,
  };
};

export const getCountryData = (
  selectedCountry: Country | null,
): CountryData => {
  if (selectedCountry === null) {
    return { name: "", dialCode: "", countryCode: "" };
  }

  return {
    name: selectedCountry.name,
    dialCode: selectedCountry.dialCode,
    countryCode: selectedCountry.iso2,
  };
};
