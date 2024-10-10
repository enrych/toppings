# Unit Tests

This guide provides an overview of our unit test setup and instructions for running and writing tests.

## Running Unit Tests

To execute all unit tests using Mocha, run:

```bash
bun run test:unit
```

## Writing Tests

When adding unit tests, place them in this directory and mirror the structure of the `src` directory. Each test file should have a `.spec.ts` extension.

## Additional Testing Commands

To run a specific test file, use the following command:

```bash
bunx mocha "test/unit/content_scripts/lib/formatRuntime.spec.ts"
```
