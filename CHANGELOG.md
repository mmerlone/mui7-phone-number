# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-03-09
### Changed
- **BREAKING**: `PhoneNumberProps` now extends `Omit<TextFieldProps, …>` — standard TextField props (`label`, `helperText`, `fullWidth`, `sx`, `size`, `color`, `name`, `id`, `required`, etc.) are forwarded automatically
- externalize all `@mui/*` subpaths via regex function instead of explicit list
- drop UMD build format — distribute ES module only
- move `@emotion/react`, `@emotion/styled`, `@mui/material` to devDependencies so the library builds without installing peer deps locally
- hardcode eslint react version to "19" since react is no longer installed as a dependency
- add `.npmrc` with `auto-install-peers=false` to prevent pnpm from auto-installing react/react-dom alongside the host app

### Removed
- **BREAKING**: `inputClass` prop — use `className` (inherited from TextField) instead
- **BREAKING**: `onEnterKeyPress` prop and `keys` prop — use `onKeyDown` directly
- `Keys` interface and `defaultKeys` constant (unused internals)

### Added
- export `CountryData` and `PhoneNumberProps` types from package entry point
- JSDoc comments on all public props

## [1.0.0] - 2026-03-07
### Changed
- stable release

## [0.0.1] - 2026-03-05
### Added
- initial release — phone number input component for MUI v7+ and React 19, written in TypeScript
