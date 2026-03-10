/**
 * @module @mmerlone/mui7-phone-number
 *
 * MUI 7 phone number input component with international country selector.
 *
 * @example
 * ```tsx
 * import MuiPhoneNumber from '@mmerlone/mui7-phone-number'
 *
 * <MuiPhoneNumber defaultCountry="us" onChange={(v, c) => console.log(v, c)} />
 * ```
 */
export { default } from "./components/index";
export type {
  CountryData,
  PhoneNumberProps,
} from "./components/phone-number/types";
