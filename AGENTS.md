# AGENTS.md

This file provides guidance to LLM or SML tools when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server with pino-pretty logging
pnpm build                  # Production build
pnpm start                  # Start production server

# Code quality (run after every task)
pnpm lint                   # Run ESLint
pnpm lint:fix               # Auto-fix ESLint issues
pnpm type-check             # TypeScript validation
pnpm format                 # Format with Prettier

# Other
pnpm test                   # Run test suite
pnpm format:check           # Check formatting without changes

```

**Package Manager**: Always use `pnpm`. Never use npm or yarn.

## GIT operations

**NEVER change the repository state unless explicitly asked to!**

## Coding Standards

### TypeScript

- **NEVER relax or disable eslint rules.** Only eslint allowed changes are to make them stricter.
- **Explicit return types required** on all functions (ESLint enforced)
- Avoid type casts, unless necessary and on data conversion functions.
- Cast `as any` or `as unknown as` is forbidden by eslint rules.
- Validate all inputs appropriately

### Logging (Pino-compatible - Context First)

```typescript
// CORRECT - context object first, then message
logger.info({ userId, op: 'updateProfile' }, 'Profile updated')
logger.error({ error, userId }, 'Operation failed')

// WRONG - causes TypeScript errors
logger.info('Profile updated', { userId })
```

### Error Handling

Fail fast, log and handle gracefully.

### Import Order

1. External libraries (React, Next.js, MUI)
2. Internal modules (`@/*`)
3. Relative imports (`./`, `../`)
4. Types-only imports

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with `use` prefix
- Utils/Services: `camelCase.ts`
- Routes: `kebab-case` directories

### Styling

- MUI v7 with Emotion for component styling
- Use `sx` prop for one-off MUI styles

## Post-Task Process

After completing any coding task:

1. **Run lint**: `pnpm lint` - fix all issues
2. **Run type-check**: `pnpm type-check` - fix all errors
3. **Run build** (if config changed): `pnpm build`

## Commit Guidelines

- **Group by feature/domain** - each commit addresses a single logical change
- **Lowercase semantic messages**: `feat(auth): add login`, `fix(rate-limit): correct reset time`
- Do not combine unrelated changes
- Stage and commit each group separately

## Servers
- DO NOT start or kill any server! Ask the user to test.