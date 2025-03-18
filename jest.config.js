/**
 * Configuración de Jest para el proyecto API-Server
 * 
 * Este archivo define cómo Jest debe comportarse al ejecutar pruebas
 * en este proyecto, incluyendo qué archivos probar, qué métricas de
 * cobertura recopilar y cómo estructurar la salida.
 */

module.exports = {
  /**
   * DIRECTORIOS RAÍZ
   * 
   * Define dónde Jest debe buscar archivos de código fuente y pruebas.
   * - '<rootDir>/src': Directorio del código fuente
   * - '<rootDir>/__tests__': Directorio de pruebas
   * 
   * Modifica esto si cambias la estructura de directorios del proyecto.
   */
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  
  /**
   * PATRÓN DE COINCIDENCIA DE PRUEBAS
   * 
   * Define qué archivos son considerados archivos de prueba.
   * Aquí, cualquier archivo que termine en .test.js dentro de __tests__
   * 
   * Patrones comunes:
   * - Archivos .test.js en carpetas __tests__
   * - Archivos .spec.js en cualquier lugar
   */
  testMatch: ['**/__tests__/**/*.test.js'],
  
  /**
   * ENTORNO DE PRUEBAS
   * 
   * Define el entorno donde las pruebas se ejecutarán.
   * - 'node': Para pruebas de backend (Node.js)
   * - 'jsdom': Para pruebas de frontend (simulación de navegador)
   * 
   * Usa 'node' para APIs y servicios backend, 'jsdom' para aplicaciones React/web.
   */
  testEnvironment: 'node',
  
  /**
   * CONFIGURACIÓN DE COBERTURA
   * 
   * Define de qué archivos se debe recopilar información de cobertura.
   * Excluye archivos que no necesitan pruebas como el punto de entrada del servidor.
   * 
   * Añade patrones de exclusión si hay archivos que no requieren pruebas
   * (como configuraciones, constantes, etc.)
   */
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',         // Excluye el archivo principal del servidor
    '!**/node_modules/**'      // Excluye node_modules
  ],
  
  /**
   * UMBRALES DE COBERTURA
   * 
   * Define los porcentajes mínimos de cobertura requeridos para considerar
   * las pruebas como "exitosas". Si la cobertura cae por debajo de estos umbrales,
   * Jest mostrará advertencias o errores.
   * 
   * Esto ayuda a mantener un estándar de calidad en el código:
   * - branches: Porcentaje de ramas de código probadas (if/else, switch, etc.)
   * - functions: Porcentaje de funciones probadas
   * - lines: Porcentaje de líneas de código probadas
   * - statements: Porcentaje de declaraciones probadas
   * 
   * Ajusta estos valores según las necesidades del proyecto y su madurez.
   * Proyectos nuevos pueden empezar con umbrales más bajos e ir aumentando.
   */
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  /**
   * MODO VERBOSO
   * 
   * Cuando es true, Jest mostrará información detallada durante la ejecución de pruebas.
   * Útil para depuración, pero puede ser excesivo para CI/CD.
   */
  verbose: true,
  
  /**
   * LIMPIEZA DE MOCKS
   * 
   * Cuando es true, Jest limpiará automáticamente el estado de todos los mocks
   * entre cada prueba para evitar influencias entre pruebas diferentes.
   * 
   * Es una buena práctica mantener esto activado para pruebas más fiables.
   */
  clearMocks: true,
  
  /**
   * MAPEO DE NOMBRES DE MÓDULOS
   * 
   * Permite definir alias para importaciones. Por ejemplo, '@/utils' podría
   * apuntar a 'src/utils', facilitando importaciones más limpias.
   * 
   * Debe coincidir con la configuración del sistema de construcción (webpack, etc.)
   * si se utilizan estos alias en el código fuente.
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}; 