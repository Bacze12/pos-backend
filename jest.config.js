module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!@nestjs/common)', // Permitir la transformación de @nestjs/common
  ],
  rootDir: 'src', // Asegura que Jest busque archivos de prueba en la carpeta src
  testRegex: '.*\\.spec\\.ts$', // Solo ejecuta archivos de prueba con esta extensión
  collectCoverageFrom: [
    '**/*.(t|j)s', // Incluir archivos para la cobertura
  ],
  coverageDirectory: '../coverage', // Salida de informes de cobertura
};
