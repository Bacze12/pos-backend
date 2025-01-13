# Testing Documentation

## Unit Tests

Unit tests are designed to test individual components or functions in isolation. They help ensure that each part of the application works as expected.

### Locations
- `src/app.controller.spec.ts`
- `src/test/auth/auth.service.spec.ts`
- `src/test/tenants/tenants.controller.spec.ts`
- `src/test/users/users.controller.spec.ts`
- `src/test/users/users.service.spec.ts`

## Integration Tests

Integration tests verify that different parts of the application work together correctly. They test the interactions between multiple components or modules.

### Locations
- `src/test/tenants/tenants.integration.spec.ts`

## End-to-End Tests

End-to-end tests simulate real user scenarios and test the entire application from start to finish. They help ensure that the application behaves as expected in a production-like environment.

### Locations
- `test/app.e2e-spec.ts`

## Running Tests

To run the tests, you can use the provided scripts in `package.json`. Here are the available scripts:

- Run all tests:
  ```bash
  npm run test
  ```

- Clear Jest cache:
  ```bash
  npm run test:clean
  ```

- Run tests in watch mode:
  ```bash
  npm run test:watch
  ```

- Run tests with coverage report:
  ```bash
  npm run test:cov
  ```

- Debug tests:
  ```bash
  npm run test:debug
  ```

- Run end-to-end tests:
  ```bash
  npm run test:e2e
  ```

### Testing Framework and Configuration

This project uses Jest as the testing framework. The Jest configuration can be found in the `jest.config.js` file. The configuration includes settings for transforming TypeScript files, specifying the test environment, and collecting coverage reports.

### Interpreting Test Results and Coverage Reports

- **Test Results:** After running the tests, Jest will display the results in the terminal. Each test file will show the number of passed and failed tests. You can also see detailed information about each test case.

- **Coverage Reports:** If you run the tests with coverage (`npm run test:cov`), Jest will generate a coverage report. The report shows the percentage of code covered by tests, including statements, branches, functions, and lines. The coverage report can be found in the `coverage` directory.
