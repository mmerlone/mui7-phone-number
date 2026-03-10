import type { Country, CountryData, PhoneNumberState } from "./types";

/** Parameters for {@link formatNumber}. */
export interface FormatNumberParams {
  /** Raw digit string to format (without leading "+"). */
  text: string;
  /** Country format pattern(s) using "." as digit placeholders. */
  pattern?: string | string[];
  /** Whether to strip the country dial code prefix from the output. */
  disableCountryCode: boolean;
  /** Whether to apply the format pattern or return raw digits. */
  autoFormat: boolean;
  /** Whether to allow digits beyond the pattern length. */
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
  if (patterns.length === 0) {
    return "";
  }
  const ranked = patterns
    .map((p) => ({ p, dots: (p.match(/\./g) ?? []).length }))
    .sort((a, b) => a.dots - b.dots);
  return (
    ranked.find(({ dots }) => dots >= digitCount)?.p ??
    ranked[ranked.length - 1].p
  );
};

/** Parameters for {@link buildInitialState}. */
export interface BuildInitialStateParams {
  /** Complete list of countries (including area-code variants). */
  allCountries: Country[];
  /** Filtered list of allowed countries. */
  onlyCountries: Country[];
  /** Countries pinned to the top of the dropdown. */
  preferredCountries: Country[];
  /** ISO 3166-1 alpha-2 code for the initially selected country. */
  defaultCountry: string;
  /** Whether the country dial code prefix should be hidden. */
  disableCountryCode: boolean;
  /** Placeholder text when the input is empty. */
  placeholder: string;
  /** Initial phone number value (may include dial code). */
  value: string;
  /** Whether to auto-format the number on initialization. */
  autoFormat: boolean;
  /** Whether to allow digits beyond the format pattern length. */
  enableLongNumbers: boolean;
}

/**
 * Strip all non-digit characters from a phone input string.
 *
 * @param value - Raw input value (may contain formatting characters).
 * @returns Digits-only string.
 */
export const sanitizeDialInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Determine the best-matching country for a given digit prefix.
 *
 * Compares the input against each country's dial code. When multiple countries
 * share a prefix, the one with the longest dial code (or highest priority) wins.
 *
 * @param inputNumber - Digits-only phone number prefix (up to 6 digits).
 * @param onlyCountries - Pool of countries to search.
 * @param defaultCountryCode - Fallback ISO 3166-1 alpha-2 code.
 * @returns The best-matching {@link Country}, or the default country, or `null`.
 */
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

/**
 * Format a digits-only string into a human-readable phone number.
 *
 * Applies the country format pattern (e.g. `+.. (...) ...-....`) by replacing
 * each "." placeholder with the next input digit. Multi-pattern countries
 * (like Brazil) select the best-fitting pattern automatically.
 *
 * @param params - Formatting parameters.
 * @returns Formatted phone number string.
 */
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

/**
 * Apply region and area-code filters to the master country list.
 *
 * @param countries - Unfiltered country list.
 * @param disableAreaCodes - When `true`, remove area-code sub-entries.
 * @param regions - Region(s) to keep (e.g. `"europe"` or `["asia", "europe"]`).
 * @returns Filtered country list.
 */
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
        return regions.includes(countryRegion);
      }) ?? false
    );
  });
};

/**
 * Restrict the country list to a set of allowed ISO 3166-1 alpha-2 codes.
 *
 * @param countries - Source country list.
 * @param allowedIso2Codes - ISO codes to keep. An empty array returns all countries.
 * @returns Filtered country list.
 */
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

/**
 * Remove specific countries from the list by ISO 3166-1 alpha-2 code.
 *
 * @param countries - Source country list.
 * @param excludedIso2Codes - ISO codes to remove. An empty array returns all countries.
 * @returns Country list with exclusions applied.
 */
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

/**
 * Extract countries to be pinned at the top of the dropdown.
 *
 * @param countries - Source country list.
 * @param preferredIso2Codes - ISO 3166-1 alpha-2 codes to pin.
 * @returns Subset of countries matching the preferred codes.
 */
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

/**
 * Compute the initial {@link PhoneNumberState} from component props.
 *
 * Determines the selected country from the provided value or default,
 * formats the number accordingly, and returns a complete state object
 * ready for use by the phone number hook.
 *
 * @param params - Initialization parameters.
 * @returns Initial phone number state.
 */
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
  const inputDigits = sanitizeDialInput(value);

  let selectedCountry: Country | null = null;

  if (value.length > 1) {
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
    value.length < 2 &&
    selectedCountry &&
    !inputDigits.startsWith(selectedCountry.dialCode)
      ? selectedCountry.dialCode
      : "";

  const formattedNumber =
    value.length === 0 && selectedCountry === null
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

/**
 * Convert an internal {@link Country} object to the consumer-facing {@link CountryData} shape.
 *
 * @param selectedCountry - Country to convert, or `null`.
 * @returns Country data with name, dialCode, and countryCode fields.
 */
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
