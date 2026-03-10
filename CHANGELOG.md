# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-03-09
### Changed
- **BREAKING**: `PhoneNumberProps` now extends `Omit<TextFieldProps, 'value' | 'onChange' | 'type'>` — standard TextField props (`label`, `helperText`, `fullWidth`, `sx`, `size`, `color`, `name`, `id`, `required`, etc.) are forwarded automatically
- externalize all `@mui/*` subpaths via regex function instead of explicit list
- **BREAKING**: drop UMD build format — distribute ES module only
- move `@emotion/react`, `@emotion/styled`, `@mui/material` to devDependencies so the library builds without installing peer deps locally
- hardcode eslint react version to "19" since react is no longer installed as a dependency
- add `.npmrc` with `auto-install-peers=false` to prevent pnpm from auto-installing react/react-dom alongside the host app
- spread remaining TextField props instead of forwarding named props one-by-one
- simplify blur/focus placeholder handling in `usePhoneNumberState`
- simplify region array filter using `Array.includes`
- remove redundant `inputValue` variable in `buildInitialState`

### Fixed
- fix "carribean" typo → "caribbean" across all country data entries and sub-region comment
- fix priority-based country code sorting — `addCountryCode` now uses push + explicit sort instead of sparse array index assignment
- fix logger mutating shared context object — create a separate `sanitizedContext` copy before masking PII
- remove stale `className="margin"` from flag icon in `CountrySelectorAdornment`

### Removed
- **BREAKING**: `inputClass` prop — use `className` (inherited from TextField) instead
- **BREAKING**: `onEnterKeyPress` prop and `keys` prop — use `onKeyDown` directly
- `Keys` interface and `defaultKeys` constant (unused internals)
- remove `peerDependenciesMeta` from package.json (unnecessary)

### Added
- export `CountryData` and `PhoneNumberProps` types from package entry point
- comprehensive JSDoc comments on all exported types, interfaces, functions, and components
- `@module` JSDoc tag with usage example on package entry point
- `@typescript-eslint/return-await` rule (replacing deprecated `no-return-await`)
- `ignoreRestSiblings` option to `@typescript-eslint/no-unused-vars`
- shebang line to `.husky/pre-commit`

## [1.0.0] - 2026-03-07
### Changed
- stable release

## [0.0.1] - 2026-03-05
### Added
- initial release — phone number input component for MUI v7+ and React 19, written in TypeScript
