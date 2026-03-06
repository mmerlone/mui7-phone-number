import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";

import { allCountries } from "../../country_data";
import { buildLogger, type Logger } from "../../logger/client";
import { MAX_PHONE_DIGITS, defaultKeys } from "./constants";
import type { Country, PhoneNumberProps, PhoneNumberState } from "./types";
import {
  buildInitialState,
  excludeCountriesFromList,
  formatNumber,
  getCountryData,
  getOnlyCountries,
  getPreferredCountries,
  getProcessedCountries,
  guessSelectedCountry,
  sanitizeDialInput,
} from "./utils";

const logger: Logger = buildLogger("phone-input");
const EMPTY_COUNTRY_LIST: string[] = [];
const SUPPORTS_SELECTION_RANGE =
  typeof document !== "undefined" &&
  Boolean(document.createElement("input").setSelectionRange);

export interface UsePhoneNumberStateResult {
  state: PhoneNumberState;
  inputRefElement: RefObject<HTMLInputElement | null>;
  isValidNumber: (inputNumber: string) => boolean;
  handleInput: (event: ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: (event: FocusEvent<HTMLInputElement>) => void;
  handleInputBlur: (event: FocusEvent<HTMLInputElement>) => void;
  handleInputClick: (event: MouseEvent<HTMLInputElement>) => void;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleOpen: (event: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  handleFlagItemClick: (country: Country) => void;
}

export const usePhoneNumberState = (
  props: PhoneNumberProps,
): UsePhoneNumberStateResult => {
  const isControlledValue = typeof props.value === "string";

  const {
    excludeCountries: excludeCountriesProp,
    onlyCountries: onlyCountriesPropInput,
    preferredCountries: preferredCountriesProp,
    defaultCountry = "",
    value: valueProp,
    placeholder = "+1 (702) 123-4567",
    disabled = false,
    autoFormat = true,
    disableAreaCodes = false,
    disableCountryCode = false,
    enableLongNumbers = false,
    countryCodeEditable = true,
    regions = "",
    isValid: isValidProp,
    onChange,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    onEnterKeyPress,
    keys = defaultKeys,
  } = props;

  const excludeCountries = excludeCountriesProp ?? EMPTY_COUNTRY_LIST;
  const onlyCountriesProp = onlyCountriesPropInput ?? EMPTY_COUNTRY_LIST;
  const preferredCountries = preferredCountriesProp ?? EMPTY_COUNTRY_LIST;
  const value = valueProp ?? "";

  const inputRefElement = useRef<HTMLInputElement | null>(null);

  const processedCountries = useMemo((): Country[] => {
    return getProcessedCountries(allCountries, disableAreaCodes, regions);
  }, [disableAreaCodes, regions]);

  const onlyCountriesList = useMemo((): Country[] => {
    const includedCountries = getOnlyCountries(
      processedCountries,
      onlyCountriesProp,
    );
    return excludeCountriesFromList(includedCountries, excludeCountries);
  }, [excludeCountries, onlyCountriesProp, processedCountries]);

  const preferredCountriesList = useMemo((): Country[] => {
    return getPreferredCountries(processedCountries, preferredCountries);
  }, [preferredCountries, processedCountries]);

  const formatNumberFn = useCallback(
    (text: string, pattern?: string | string[]): string => {
      return formatNumber({
        text,
        pattern,
        disableCountryCode,
        autoFormat,
        enableLongNumbers,
      });
    },
    [autoFormat, disableCountryCode, enableLongNumbers],
  );

  const [state, setState] = useState<PhoneNumberState>(() =>
    buildInitialState({
      allCountries,
      onlyCountries: onlyCountriesList,
      preferredCountries: preferredCountriesList,
      defaultCountry,
      disableCountryCode,
      placeholder,
      value,
      autoFormat,
      enableLongNumbers,
    }),
  );

  // Stable ref so event handlers always read current state without being
  // re-created on every state update.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect((): void => {
    setState((prevState: PhoneNumberState) => {
      const selectedCountry = prevState.selectedCountry;
      const selectedCountryIso2 = selectedCountry?.iso2;
      const selectedCountryDialCode = selectedCountry?.dialCode;

      const isCurrentSelectionAvailable = onlyCountriesList.some(
        (country: Country) => {
          return (
            country.iso2 === selectedCountryIso2 &&
            country.dialCode === selectedCountryDialCode
          );
        },
      );

      const fallbackSelection = isCurrentSelectionAvailable
        ? selectedCountry
        : guessSelectedCountry(
            sanitizeDialInput(prevState.formattedNumber).substring(0, 6),
            onlyCountriesList,
            defaultCountry,
          );

      const isSelectedCountryUnchanged =
        prevState.selectedCountry?.iso2 === fallbackSelection?.iso2 &&
        prevState.selectedCountry?.dialCode === fallbackSelection?.dialCode;
      const isCountryListsUnchanged =
        prevState.onlyCountries === onlyCountriesList &&
        prevState.preferredCountries === preferredCountriesList;
      const isDefaultCountryUnchanged =
        prevState.defaultCountry === defaultCountry;

      if (
        isSelectedCountryUnchanged &&
        isCountryListsUnchanged &&
        isDefaultCountryUnchanged
      ) {
        return prevState;
      }

      return {
        ...prevState,
        onlyCountries: onlyCountriesList,
        preferredCountries: preferredCountriesList,
        defaultCountry,
        selectedCountry: fallbackSelection,
      };
    });
  }, [defaultCountry, onlyCountriesList, preferredCountriesList]);

  const isValidNumber = useCallback(
    (inputNumber: string): boolean => {
      if (isValidProp) {
        return isValidProp(inputNumber);
      }

      return allCountries.some((country: Country) => {
        return (
          inputNumber.startsWith(country.dialCode) ||
          country.dialCode.startsWith(inputNumber)
        );
      });
    },
    [isValidProp],
  );

  // setSelectionRange has 100% browser support — evaluated once at module load.
  const supportsSelectionRange = SUPPORTS_SELECTION_RANGE;

  const cursorToEnd = useCallback((): void => {
    const inputElement = inputRefElement.current;
    if (!inputElement) {
      return;
    }

    inputElement.focus();

    if (supportsSelectionRange) {
      const cursorPosition = inputElement.value.length;
      inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [supportsSelectionRange]);

  const updateFormattedNumber = useCallback(
    (number: string): void => {
      setState((prevState: PhoneNumberState) => {
        const stateOnlyCountries = prevState.onlyCountries;
        const stateDefaultCountry = prevState.defaultCountry;

        let countryGuess: Country | null = null;
        let nextFormattedNumber = number;

        if (!number.startsWith("+")) {
          countryGuess =
            stateOnlyCountries.find(
              (country: Country) => country.iso2 === stateDefaultCountry,
            ) ?? null;

          const rawInput = sanitizeDialInput(number);
          const dialCode =
            countryGuess && !rawInput.startsWith(countryGuess.dialCode)
              ? countryGuess.dialCode
              : "";

          nextFormattedNumber = formatNumberFn(
            `${disableCountryCode ? "" : dialCode}${rawInput}`,
            countryGuess?.format,
          );
        } else {
          const cleanedInput = sanitizeDialInput(number);
          countryGuess = guessSelectedCountry(
            cleanedInput.substring(0, 6),
            stateOnlyCountries,
            stateDefaultCountry,
          );
          nextFormattedNumber = formatNumberFn(
            cleanedInput,
            countryGuess?.format,
          );
        }

        return {
          ...prevState,
          selectedCountry: countryGuess,
          formattedNumber: nextFormattedNumber,
        };
      });
    },
    [disableCountryCode, formatNumberFn],
  );

  // The country-list effect above already sets state.defaultCountry when
  // defaultCountry prop changes, so no second effect is needed.

  useEffect((): void => {
    if (!isControlledValue) {
      return;
    }

    updateFormattedNumber(value);
  }, [isControlledValue, value, updateFormattedNumber]);

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const {
        selectedCountry: currentSelectedCountry,
        freezeSelection,
        onlyCountries: stateOnlyCountries,
        defaultCountry: stateDefaultCountry,
        formattedNumber: prevFormattedNumber,
      } = stateRef.current;

      let newSelectedCountry = currentSelectedCountry;
      let shouldFreezeSelection = freezeSelection;
      let nextFormattedNumber = disableCountryCode ? "" : "+";

      if (!countryCodeEditable && currentSelectedCountry) {
        const minimumValue = `+${currentSelectedCountry.dialCode}`;
        if (event.target.value.length < minimumValue.length) {
          return;
        }
      }

      if (sanitizeDialInput(event.target.value).length > MAX_PHONE_DIGITS) {
        return;
      }

      if (event.target.value === prevFormattedNumber) {
        return;
      }

      if (event.target.value.length > 0) {
        const inputNumber = sanitizeDialInput(event.target.value);

        if (
          !shouldFreezeSelection ||
          (currentSelectedCountry &&
            currentSelectedCountry.dialCode.length > inputNumber.length)
        ) {
          newSelectedCountry =
            guessSelectedCountry(
              inputNumber.substring(0, 6),
              stateOnlyCountries,
              stateDefaultCountry,
            ) ?? currentSelectedCountry;
          shouldFreezeSelection = false;
        }

        nextFormattedNumber = formatNumberFn(
          inputNumber,
          newSelectedCountry?.format,
        );
      }

      const caretPosition = event.target.selectionStart ?? 0;
      const diff = nextFormattedNumber.length - prevFormattedNumber.length;

      setState((prevState: PhoneNumberState) => ({
        ...prevState,
        formattedNumber: nextFormattedNumber,
        freezeSelection: shouldFreezeSelection,
        selectedCountry: newSelectedCountry?.dialCode
          ? newSelectedCountry
          : prevState.selectedCountry,
      }));

      if (supportsSelectionRange) {
        let newCaretPosition = caretPosition;
        if (diff > 0) {
          newCaretPosition += diff;
        }

        const lastChar = nextFormattedNumber.charAt(
          nextFormattedNumber.length - 1,
        );

        requestAnimationFrame((): void => {
          const inputElement = inputRefElement.current;
          if (!inputElement) {
            return;
          }

          if (lastChar === ")") {
            inputElement.setSelectionRange(
              nextFormattedNumber.length - 1,
              nextFormattedNumber.length - 1,
            );
            return;
          }

          if (
            newCaretPosition > 0 &&
            prevFormattedNumber.length >= nextFormattedNumber.length
          ) {
            inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
          }
        });
      }

      logger.debug({ value: nextFormattedNumber }, "Phone number changed");

      if (onChange) {
        const selectedForEvent = newSelectedCountry?.dialCode
          ? newSelectedCountry
          : currentSelectedCountry;
        onChange(nextFormattedNumber, getCountryData(selectedForEvent));
      }
    },
    [
      disableCountryCode,
      countryCodeEditable,
      formatNumberFn,
      supportsSelectionRange,
      onChange,
    ],
  );

  const handleFlagItemClick = useCallback(
    (country: Country): void => {
      const currentSelectedCountry = stateRef.current.selectedCountry;
      const currentDigits = sanitizeDialInput(stateRef.current.formattedNumber);
      const currentDialCode = currentSelectedCountry?.dialCode ?? "";
      const nationalNumber = currentDigits.startsWith(currentDialCode)
        ? currentDigits.slice(currentDialCode.length)
        : currentDigits;

      const nextDigits = `${country.dialCode}${nationalNumber}`;
      const newFormattedNumber = formatNumberFn(nextDigits, country.format);

      logger.info({ country: country.iso2 }, "Country changed");

      setState((prevState: PhoneNumberState) => ({
        ...prevState,
        anchorEl: null,
        selectedCountry: country,
        freezeSelection: true,
        formattedNumber: newFormattedNumber,
      }));

      if (onChange) {
        onChange(newFormattedNumber, getCountryData(country));
      }

      requestAnimationFrame(cursorToEnd);
    },
    [cursorToEnd, formatNumberFn, onChange],
  );

  const handleInputFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>): void => {
      const selectedCountry = stateRef.current.selectedCountry;
      const inputElement = inputRefElement.current;
      const needsDialCode =
        inputElement?.value === "+" &&
        Boolean(selectedCountry) &&
        !disableCountryCode;

      setState((prevState: PhoneNumberState) => ({
        ...prevState,
        formattedNumber: needsDialCode
          ? `+${selectedCountry!.dialCode}`
          : prevState.formattedNumber,
        placeholder: "",
      }));

      if (onFocus) {
        onFocus(event, getCountryData(selectedCountry));
      }

      requestAnimationFrame(cursorToEnd);
    },
    [cursorToEnd, disableCountryCode, onFocus],
  );

  const handleInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>): void => {
      if (!event.target.value) {
        setState((prevState: PhoneNumberState) => ({
          ...prevState,
          placeholder,
        }));
      }

      if (onBlur) {
        onBlur(event, getCountryData(stateRef.current.selectedCountry));
      }
    },
    [onBlur, placeholder],
  );

  const handleInputClick = useCallback(
    (event: MouseEvent<HTMLInputElement>): void => {
      if (onClick) {
        onClick(event, getCountryData(stateRef.current.selectedCountry));
      }
    },
    [onClick],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === keys.ENTER && onEnterKeyPress) {
        onEnterKeyPress(event);
      }

      if (onKeyDown) {
        onKeyDown(event);
      }
    },
    [keys.ENTER, onEnterKeyPress, onKeyDown],
  );

  const handleClose = useCallback((): void => {
    setState((prevState: PhoneNumberState) => ({
      ...prevState,
      anchorEl: null,
    }));
  }, []);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      setState((prevState: PhoneNumberState) => ({
        ...prevState,
        anchorEl: event.currentTarget,
      }));
    },
    [disabled],
  );

  return {
    state,
    inputRefElement,
    isValidNumber,
    handleInput,
    handleInputFocus,
    handleInputBlur,
    handleInputClick,
    handleInputKeyDown,
    handleOpen,
    handleClose,
    handleFlagItemClick,
  };
};
