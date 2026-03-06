import type { FocusEvent, KeyboardEvent, MouseEvent, Ref } from "react";
import type { TextFieldProps } from "@mui/material/TextField";

export interface Country {
  name: string;
  iso2: string;
  dialCode: string;
  format?: string | string[];
  priority?: number;
  isAreaCode?: boolean;
  regions?: string[];
}

export interface CountryData {
  name: string;
  dialCode: string;
  countryCode: string;
}

export interface Keys {
  UP: string;
  DOWN: string;
  RIGHT: string;
  LEFT: string;
  ENTER: string;
  ESC: string;
  PLUS: string;
  A: string;
  Z: string;
  SPACE: string;
}

export interface PhoneNumberProps {
  excludeCountries?: string[];
  onlyCountries?: string[];
  preferredCountries?: string[];
  defaultCountry?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  variant?: "standard" | "outlined" | "filled";
  native?: boolean;
  inputClass?: string;
  dropdownClass?: string;
  slotProps?: {
    input?: NonNullable<TextFieldProps["slotProps"]>["input"];
    htmlInput?: NonNullable<TextFieldProps["slotProps"]>["htmlInput"];
  };
  inputRef?: Ref<HTMLInputElement>;
  autoFormat?: boolean;
  disableAreaCodes?: boolean;
  disableCountryCode?: boolean;
  disableDropdown?: boolean;
  enableLongNumbers?: boolean;
  countryCodeEditable?: boolean;
  regions?: string | string[];
  localization?: Record<string, string>;
  onChange?: (value: string, country: CountryData) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>, country: CountryData) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>, country: CountryData) => void;
  onClick?: (event: MouseEvent<HTMLInputElement>, country: CountryData) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  isValid?: (inputNumber: string) => boolean;
  onEnterKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  keys?: Keys;
}

export interface PhoneNumberState {
  formattedNumber: string;
  placeholder: string;
  onlyCountries: Country[];
  preferredCountries: Country[];
  defaultCountry: string;
  selectedCountry: Country | null;
  freezeSelection: boolean;
  anchorEl: HTMLElement | null;
}
