import React, { forwardRef, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import { CountrySelectorAdornment } from "./phone-number/CountrySelectorAdornment";
import type { PhoneNumberProps } from "./phone-number/types";
import { usePhoneNumberState } from "./phone-number/usePhoneNumberState";

// Stable empty defaults — avoid creating new object literals in destructuring
// which would bust downstream memos on every render.
const EMPTY_LOCALIZATION: Record<string, string> = {};
const EMPTY_SLOT_PROPS: NonNullable<PhoneNumberProps["slotProps"]> = {};

/**
 * MUI-based international phone number input with country selector.
 *
 * Wraps a MUI `TextField` with dial-code-based country matching, number formatting,
 * and a flag-based country dropdown. Supports controlled and uncontrolled modes,
 * native `<select>` fallback, and forwards all remaining `TextFieldProps` to the
 * inner `TextField` via spread.
 *
 * @see {@link PhoneNumberProps} for accepted props.
 *
 * @example
 * ```tsx
 * import MuiPhoneNumber from '@mmerlone/mui7-phone-number'
 *
 * <MuiPhoneNumber
 *   defaultCountry="us"
 *   onChange={(value, country) => console.log(value, country)}
 * />
 * ```
 */
const MaterialUiPhoneNumber = forwardRef<HTMLDivElement, PhoneNumberProps>(
  (props: PhoneNumberProps, ref): React.JSX.Element => {
    const {
      // ── Phone-number-specific props (not forwarded to TextField) ──
      excludeCountries,
      onlyCountries,
      preferredCountries,
      defaultCountry,
      value,
      native = false,
      dropdownClass = "",
      slotProps = EMPTY_SLOT_PROPS,
      inputRef,
      autoFormat,
      disableAreaCodes,
      disableCountryCode,
      disableDropdown = false,
      enableLongNumbers,
      countryCodeEditable,
      regions,
      localization = EMPTY_LOCALIZATION,
      onChange,
      onFocus,
      onBlur,
      onClick,
      isValid,
      // ── TextField props with local defaults or custom handling ──
      error = false,
      disabled = false,
      variant = "standard",
      // ── Remaining TextField props forwarded via spread ──
      ...textFieldProps
    } = props;
    const inputSlotProps = slotProps.input ?? {};
    const htmlInputSlotProps = slotProps.htmlInput ?? {};

    // Cast to allow ref property which may be passed by users
    const htmlInputRef = (
      htmlInputSlotProps as { ref?: React.Ref<HTMLInputElement> }
    ).ref;

    const {
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
    } = usePhoneNumberState(props);

    const isError = useMemo(
      () =>
        error ||
        (state.formattedNumber.length > 0 &&
          !isValidNumber(state.formattedNumber.replace(/\D/g, ""))),
      [error, isValidNumber, state.formattedNumber],
    );

    const assignInputRef = useCallback(
      (element: HTMLInputElement | null): void => {
        inputRefElement.current = element;

        if (!inputRef) {
          return;
        }

        if (typeof inputRef === "function") {
          inputRef(element);
          return;
        }

        inputRef.current = element;
      },
      [inputRef, inputRefElement],
    );

    const mergeRefs = useCallback(
      (element: HTMLInputElement | null): void => {
        assignInputRef(element);
        const userRef = htmlInputRef;
        if (typeof userRef === "function") {
          userRef(element);
        } else if (userRef && "current" in userRef) {
          userRef.current = element;
        }
      },
      [assignInputRef, htmlInputRef],
    );

    return (
      <TextField
        ref={ref}
        {...textFieldProps}
        placeholder={state.placeholder}
        value={state.formattedNumber}
        error={isError}
        onChange={handleInput}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        type="tel"
        disabled={disabled}
        variant={variant}
        slotProps={{
          input: {
            ...inputSlotProps,
            ...(disableDropdown
              ? {}
              : {
                  startAdornment: (
                    <CountrySelectorAdornment
                      anchorEl={state.anchorEl}
                      dropdownClass={dropdownClass}
                      localization={localization}
                      native={native}
                      onlyCountries={state.onlyCountries}
                      preferredCountries={state.preferredCountries}
                      selectedCountry={state.selectedCountry}
                      onClose={handleClose}
                      onOpen={handleOpen}
                      onSelectCountry={handleFlagItemClick}
                    />
                  ),
                }),
          },
          htmlInput: {
            ...htmlInputSlotProps,
            ref: undefined,
          },
        }}
        inputRef={mergeRefs}
      />
    );
  },
);

MaterialUiPhoneNumber.displayName = "MuiPhoneNumber";

export default MaterialUiPhoneNumber;
