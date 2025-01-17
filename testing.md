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


## Adding New Tests

To add new tests to the project, follow these steps:

1. **Create a new test file:** Create a new file with the `.spec.ts` extension in the appropriate directory. For example, if you are adding a unit test for a service, create the test file in the same directory as the service file.

2. **Write test cases:** Use the Jest framework to write test cases. Import the necessary modules and write test cases using the `describe`, `it`, and `expect` functions.

3. **Run the tests:** Use the provided scripts in `package.json` to run the tests and ensure that your new tests pass.

4. **Check coverage:** Run the tests with coverage (`npm run test:cov`) to ensure that your new tests are included in the coverage report.

5. **Commit and push:** Once your tests pass and the coverage is satisfactory, commit your changes and push them to the repository.

## Test Cases

### `src/app.controller.spec.ts`
- **Test Case:** `should return "Hello World!"`
  - **Description:** This test case verifies that the `getHello` method of the `AppController` returns the string "Hello World!".

### `src/test/auth/auth.service.spec.ts`
- **Test Case:** `debería retornar un token JWT para credenciales correctas`
  - **Description:** This test case verifies that the `login` method of the `AuthService` returns a JWT token for valid credentials.
- **Test Case:** `debería retornar un token JWT para credenciales correctas con findByBusinessName`
  - **Description:** This test case verifies that the `login` method of the `AuthService` returns a JWT token for valid credentials using the `findByBusinessName` method.
- **Test Case:** `debería lanzar UnauthorizedException para credenciales incorrectas`
  - **Description:** This test case verifies that the `login` method of the `AuthService` throws an `UnauthorizedException` for invalid credentials.

### `src/test/tenants/tenants.controller.spec.ts`
- **Test Case:** `debería devolver todos los tenants`
  - **Description:** This test case verifies that the `getTenants` method of the `TenantsController` returns all tenants.
- **Test Case:** `debería lanzar un error si el servicio falla`
  - **Description:** This test case verifies that the `getTenants` method of the `TenantsController` throws an error if the service fails.
- **Test Case:** `debería crear un tenant exitosamente`
  - **Description:** This test case verifies that the `createTenant` method of the `TenantsController` creates a tenant successfully.
- **Test Case:** `debería lanzar un error si el tenant ya existe`
  - **Description:** This test case verifies that the `createTenant` method of the `TenantsController` throws an error if the tenant already exists.
- **Test Case:** `debería lanzar un error si los datos son inválidos`
  - **Description:** This test case verifies that the `createTenant` method of the `TenantsController` throws an error if the tenant data is invalid.

### `src/test/users/users.controller.spec.ts`
- **Test Case:** `debería retornar todos los usuarios del tenant`
  - **Description:** This test case verifies that the `getUsers` method of the `UsersController` returns all users of the tenant.
- **Test Case:** `debería lanzar un error si falta tenantId`
  - **Description:** This test case verifies that the `getUsers` method of the `UsersController` throws an error if the tenantId is missing.
- **Test Case:** `debería lanzar un error si el servicio falla`
  - **Description:** This test case verifies that the `getUsers` method of the `UsersController` throws an error if the service fails.
- **Test Case:** `debería retornar un usuario por ID`
  - **Description:** This test case verifies that the `getUserById` method of the `UsersController` returns a user by ID.
- **Test Case:** `debería lanzar un error si no encuentra un usuario por ID`
  - **Description:** This test case verifies that the `getUserById` method of the `UsersController` throws an error if the user is not found by ID.
- **Test Case:** `debería crear un usuario`
  - **Description:** This test case verifies that the `createUser` method of the `UsersController` creates a user successfully.
- **Test Case:** `debería lanzar un error si los datos del usuario son inválidos`
  - **Description:** This test case verifies that the `createUser` method of the `UsersController` throws an error if the user data is invalid.
- **Test Case:** `debería actualizar un usuario`
  - **Description:** This test case verifies that the `updateUser` method of the `UsersController` updates a user successfully.
- **Test Case:** `debería lanzar un error si no se encuentra el usuario para actualizar`
  - **Description:** This test case verifies that the `updateUser` method of the `UsersController` throws an error if the user to be updated is not found.
- **Test Case:** `debería eliminar un usuario`
  - **Description:** This test case verifies that the `deleteUser` method of the `UsersController` deletes a user successfully.
- **Test Case:** `debería lanzar un error si no se encuentra el usuario para eliminar`
  - **Description:** This test case verifies that the `deleteUser` method of the `UsersController` throws an error if the user to be deleted is not found.

### `src/test/users/users.service.spec.ts`
- **Test Case:** `debería encontrar un usuario por email y tenantId`
  - **Description:** This test case verifies that the `findByEmailAndTenant` method of the `UsersService` finds a user by email and tenantId.
- **Test Case:** `debería retornar null si no encuentra el usuario`
  - **Description:** This test case verifies that the `findByEmailAndTenant` method of the `UsersService` returns null if the user is not found.
- **Test Case:** `debería encontrar todos los usuarios de un tenant`
  - **Description:** This test case verifies that the `findAllByTenant` method of the `UsersService` finds all users of a tenant.
- **Test Case:** `debería lanzar NotFoundException si no se proporciona tenantId`
  - **Description:** This test case verifies that the `findAllByTenant` method of the `UsersService` throws a `NotFoundException` if the tenantId is not provided.
- **Test Case:** `debería encontrar un usuario por id y tenantId`
  - **Description:** This test case verifies that the `findById` method of the `UsersService` finds a user by id and tenantId.
- **Test Case:** `debería lanzar NotFoundException si no encuentra el usuario`
  - **Description:** This test case verifies that the `findById` method of the `UsersService` throws a `NotFoundException` if the user is not found.
- **Test Case:** `debería crear un nuevo usuario exitosamente`
  - **Description:** This test case verifies that the `create` method of the `UsersService` creates a new user successfully.
- **Test Case:** `debería lanzar BadRequestException si falta el tenantId`
  - **Description:** This test case verifies that the `create` method of the `UsersService` throws a `BadRequestException` if the tenantId is missing.
- **Test Case:** `debería lanzar ConflictException si el email ya existe para ese tenant`
  - **Description:** This test case verifies that the `create` method of the `UsersService` throws a `ConflictException` if the email already exists for the tenant.
- **Test Case:** `debería actualizar un usuario exitosamente`
  - **Description:** This test case verifies that the `update` method of the `UsersService` updates a user successfully.
- **Test Case:** `debería lanzar NotFoundException si no encuentra el usuario para actualizar`
  - **Description:** This test case verifies that the `update` method of the `UsersService` throws a `NotFoundException` if the user to be updated is not found.
- **Test Case:** `debería eliminar un usuario exitosamente`
  - **Description:** This test case verifies that the `delete` method of the `UsersService` deletes a user successfully.
- **Test Case:** `debería lanzar NotFoundException si no encuentra el usuario para eliminar`
  - **Description:** This test case verifies that the `delete` method of the `UsersService` throws a `NotFoundException` if the user to be deleted is not found.
