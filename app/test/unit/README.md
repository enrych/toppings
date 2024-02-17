# Unit Tests

Thanks for writing tests! Here's a quick run-down on our current setup.

## Running Unit Tests

```bash
npm run test:unit
```

This will run all the unit tests using Mocha.

## Writing Tests

All unit tests are located in the `test` directory, mirroring the structure of the `src` directory. Each test file has a `.spec.ts` extension.

## Additional Testing Commands

- Run a specific test file:

  ```bash
  npx cross-env TS_NODE_COMPILER_OPTIONS='{"module": "commonjs" }' mocha "test/unit/formatRuntime.spec.ts"
  ```
