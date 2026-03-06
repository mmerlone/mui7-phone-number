import React, { useMemo, type ChangeEvent, type MouseEvent } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import NativeSelect from "@mui/material/NativeSelect";
import SvgIcon from "@mui/material/SvgIcon";
import type { Country } from "./types";
import { buildLogger, type Logger } from "../../logger/client";

interface CountrySelectorAdornmentProps {
  anchorEl: HTMLElement | null;
  dropdownClass: string;
  localization: Record<string, string>;
  native: boolean;
  onlyCountries: Country[];
  preferredCountries: Country[];
  selectedCountry: Country | null;
  onClose: () => void;
  onOpen: (event: MouseEvent<HTMLElement>) => void;
  onSelectCountry: (country: Country) => void;
}

const logger: Logger = buildLogger("country-selector");

type FlagComponentType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { title?: string }
>;

const getLocalizedName = (
  country: Country,
  localization: Record<string, string>,
): string => {
  return localization[country.name] ?? country.name;
};

export const CountrySelectorAdornment = ({
  anchorEl,
  dropdownClass,
  localization,
  native,
  onlyCountries,
  preferredCountries,
  selectedCountry,
  onClose,
  onOpen,
  onSelectCountry,
}: CountrySelectorAdornmentProps): React.JSX.Element => {
  const sortedCountries = useMemo((): Country[] => {
    const preferredIso2Set = new Set(preferredCountries.map((c) => c.iso2));
    return [...onlyCountries]
      .filter((country) => !preferredIso2Set.has(country.iso2))
      .sort((countryA: Country, countryB: Country) => {
        const localizedA = getLocalizedName(countryA, localization);
        const localizedB = getLocalizedName(countryB, localization);
        return localizedA.localeCompare(localizedB);
      });
  }, [localization, onlyCountries, preferredCountries]);

  const SelectedFlag = useMemo((): FlagComponentType | null => {
    if (!selectedCountry) {
      return null;
    }

    const countryCode =
      selectedCountry.iso2.toUpperCase() as keyof typeof Flags;
    return (Flags[countryCode] as FlagComponentType | undefined) ?? null;
  }, [selectedCountry]);

  const handleNativeSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const selectedIso2Code = event.target.value;
    const selectedOption =
      onlyCountries.find(
        (country: Country) => country.iso2 === selectedIso2Code,
      ) ?? null;

    if (selectedOption) {
      logger.debug(
        { country: selectedOption.iso2 },
        "Country selected via native select",
      );
      onSelectCountry(selectedOption);
    }
  };

  const isCountrySelected = (country: Country): boolean => {
    return selectedCountry?.iso2 === country.iso2;
  };

  return (
    <InputAdornment position="start">
      {native ? (
        <NativeSelect
          id="country-native-select"
          value={selectedCountry?.iso2 ?? ""}
          onChange={handleNativeSelectChange}
          disableUnderline
        >
          {preferredCountries.map((country: Country, index: number) => (
            <option
              key={`preferred_${country.iso2}_${index}`}
              value={country.iso2}
            >
              {getLocalizedName(country, localization)} +{country.dialCode}
            </option>
          ))}
          {sortedCountries.map((country: Country, index: number) => (
            <option
              key={`country_${country.iso2}_${index}`}
              value={country.iso2}
            >
              {getLocalizedName(country, localization)} +{country.dialCode}
            </option>
          ))}
        </NativeSelect>
      ) : (
        <>
          <IconButton
            aria-owns={anchorEl ? "country-menu" : undefined}
            aria-label="Select country"
            aria-haspopup="menu"
            aria-expanded={Boolean(anchorEl)}
            onClick={onOpen}
            size="small"
          >
            {SelectedFlag ? (
              <SelectedFlag
                className="margin"
                style={{ width: 24, height: 16 }}
              />
            ) : (
              <SvgIcon
                titleAccess="No country selected"
                viewBox="0 0 24 24"
                style={{ width: 20, height: 20 }}
              >
                <path d="M20.5 10.24C20.5 4.8 16.227 0.338 10.854 0.02A3.2 3.2 0 0 0 10.52 0c-0.033 0 -0.067 0.004 -0.1 0.004Q10.33 0.001 10.24 0C4.582 -0.001 -0.021 4.593 -0.021 10.24s4.603 10.241 10.26 10.241l0.18 -0.005 0.1 0.005q0.17 -0.001 0.334 -0.02c5.373 -0.318 9.646 -4.78 9.646 -10.22m-1.909 3.297c-0.353 -0.102 -1.238 -0.325 -2.801 -0.508 0.129 -0.884 0.2 -1.818 0.2 -2.789q-0.002 -1.149 -0.126 -2.22c1.98 -0.236 2.848 -0.534 2.906 -0.555l-0.238 -0.672a8.88 8.88 0 0 1 0.691 3.447 8.88 8.88 0 0 1 -0.632 3.297M5.71 10.24c0 -0.716 0.047 -1.415 0.134 -2.088 1.038 0.082 2.279 0.142 3.737 0.156v4.441a56 56 0 0 0 -3.654 0.149 16 16 0 0 1 -0.218 -2.659m5.15 -8.875c1.569 0.455 2.913 2.634 3.515 5.522a51.2 51.2 0 0 1 -3.515 0.147zm-1.278 0.016V7.032a52.8 52.8 0 0 1 -3.521 -0.145c0.614 -2.852 1.969 -5.015 3.521 -5.508m0 12.644v5.075c-1.448 -0.46 -2.724 -2.372 -3.387 -4.94a53.6 53.6 0 0 1 3.387 -0.134m1.278 5.091V14.024c1.319 0.012 2.441 0.066 3.384 0.139 -0.652 2.603 -1.92 4.528 -3.384 4.953m0 -6.366v-4.44a52 52 0 0 0 3.724 -0.16 16.8 16.8 0 0 1 0.13 2.092c0 0.923 -0.074 1.817 -0.211 2.662a51.2 51.2 0 0 0 -3.643 -0.154m7.437 -6.47c-0.193 0.06 -1.001 0.29 -2.62 0.481 -0.361 -1.919 -1.013 -3.559 -1.862 -4.743a9.024 9.024 0 0 1 4.482 4.261zM7.176 1.812C6.132 3.011 5.279 4.735 4.814 6.774c-1.45 -0.157 -2.318 -0.342 -2.666 -0.426A9.032 9.032 0 0 1 7.176 1.811M1.673 7.544c0.246 0.067 1.178 0.299 2.911 0.49a16 16 0 0 0 -0.154 2.206c0 0.965 0.087 1.894 0.245 2.774 -1.488 0.161 -2.403 0.353 -2.814 0.452a8.88 8.88 0 0 1 -0.604 -3.226c0 -0.939 0.146 -1.845 0.416 -2.696m0.749 7.103a24.8 24.8 0 0 1 2.532 -0.379c0.486 1.794 1.276 3.312 2.223 4.399a9.04 9.04 0 0 1 -4.755 -4.021m11.391 3.818c0.764 -1.065 1.37 -2.5 1.746 -4.176 1.268 0.146 2.064 0.316 2.466 0.417a9.04 9.04 0 0 1 -4.212 3.759" />
              </SvgIcon>
            )}
          </IconButton>
          <Menu
            className={dropdownClass}
            id="country-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            slotProps={{
              paper: {
                style: {
                  maxHeight: 300,
                  width: 250,
                },
              },
            }}
          >
            {preferredCountries.map((country: Country, index: number) => (
              <MenuItem
                key={`preferred_${country.iso2}_${index}`}
                selected={isCountrySelected(country)}
                onClick={(): void => {
                  logger.debug(
                    { country: country.iso2 },
                    "Country selected from preferred list",
                  );
                  onSelectCountry(country);
                }}
              >
                <span>{getLocalizedName(country, localization)}</span>
                <span style={{ marginLeft: "auto" }}>+{country.dialCode}</span>
              </MenuItem>
            ))}
            {preferredCountries.length > 0 ? <Divider /> : null}
            {sortedCountries.map((country: Country, index: number) => (
              <MenuItem
                key={`country_${country.iso2}_${index}`}
                selected={isCountrySelected(country)}
                onClick={(): void => {
                  logger.debug(
                    { country: country.iso2 },
                    "Country selected from full list",
                  );
                  onSelectCountry(country);
                }}
              >
                <span>{getLocalizedName(country, localization)}</span>
                <span style={{ marginLeft: "auto" }}>+{country.dialCode}</span>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </InputAdornment>
  );
};
