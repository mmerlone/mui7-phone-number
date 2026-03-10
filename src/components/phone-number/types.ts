import type { FocusEvent, MouseEvent, Ref } from "react";
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

/**
 * TextField props that are managed internally by the phone number component
 * and must not be passed through from consumers.
 *
 * - Event handlers have enhanced signatures that include `CountryData`.
 * - `value` is narrowed to `string` (TextField accepts `unknown`).
 * - `type` is hard-coded to `"tel"`.
 * - `slotProps` is restricted to `{ input?, htmlInput? }` only.
 * - Layout/multiline props are not applicable to a phone input.
 */
type OmittedTextFieldProps =
  | "onChange"
  | "onFocus"
  | "onBlur"
  | "onClick"
  | "value"
  | "type"
  | "slotProps"
  | "defaultValue"
  | "select"
  | "multiline"
  | "rows"
  | "maxRows"
  | "minRows"
  | "children";

/** Phone-number-specific props that extend or override TextFieldProps. */
export interface PhoneNumberCustomProps {
  /** ISO 3166-1 alpha-2 codes to exclude from the dropdown. */
  excludeCountries?: string[];
  /** Restrict dropdown to these ISO 3166-1 alpha-2 codes only. */
  onlyCountries?: string[];
  /** ISO 3166-1 alpha-2 codes pinned to the top of the dropdown. */
  preferredCountries?: string[];
  /** ISO 3166-1 alpha-2 code for the initially selected country. */
  defaultCountry?: string;
  /** Controlled phone number value (including dial code). */
  value?: string;
  /** Use a native `<select>` instead of MUI Menu for the country selector. */
  native?: boolean;
  /** CSS class applied to the country dropdown (Menu). */
  dropdownClass?: string;
  /** Restricted subset of TextField slotProps. */
  slotProps?: {
    input?: NonNullable<TextFieldProps["slotProps"]>["input"];
    htmlInput?: NonNullable<TextFieldProps["slotProps"]>["htmlInput"];
  };
  /** Ref forwarded to the underlying `<input>` element. */
  inputRef?: Ref<HTMLInputElement>;
  /** Automatically format the number as the user types. @default true */
  autoFormat?: boolean;
  /** Hide area-code sub-entries from the dropdown. */
  disableAreaCodes?: boolean;
  /** Hide the country dial code prefix in the formatted number. */
  disableCountryCode?: boolean;
  /** Remove the country selector entirely. */
  disableDropdown?: boolean;
  /** Allow numbers longer than the country format pattern. */
  enableLongNumbers?: boolean;
  /** Whether the dial code portion can be edited. @default true */
  countryCodeEditable?: boolean;
  /** Filter countries by geographic region or subregion. */
  regions?: string | string[];
  /** Override country display names (key = iso2, value = localized name). */
  localization?: Record<string, string>;
  /** Fires on value change with the formatted number and country data. */
  onChange?: (value: string, country: CountryData) => void;
  /** Focus handler with country context. */
  onFocus?: (event: FocusEvent<HTMLInputElement>, country: CountryData) => void;
  /** Blur handler with country context. */
  onBlur?: (event: FocusEvent<HTMLInputElement>, country: CountryData) => void;
  /** Click handler with country context. */
  onClick?: (event: MouseEvent<HTMLInputElement>, country: CountryData) => void;
  /** Custom validation function receiving raw digits. */
  isValid?: (inputNumber: string) => boolean;
}

/**
 * Props accepted by the `MuiPhoneNumber` component.
 *
 * Extends MUI `TextFieldProps` (minus internally-managed keys) with
 * phone-number-specific props. Standard TextField props like `label`,
 * `helperText`, `fullWidth`, `className`, `sx`, `size`, `color`, `name`,
 * `id`, and `required` are forwarded to the inner TextField automatically.
 */
export type PhoneNumberProps = Omit<TextFieldProps, OmittedTextFieldProps> &
  PhoneNumberCustomProps;

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
