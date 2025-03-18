/**
 * Pruebas unitarias para el módulo dataLoader
 * 
 * Este archivo prueba las funciones que manejan la carga y guardado
 * de datos JSON desde/hacia archivos.
 */

// Importamos el módulo fs.promises que queremos mockear
const fs = require('fs').promises;
const path = require('path');
// Importamos las funciones que vamos a probar
const { loadJsonData, saveJsonData } = require('../../../src/models/dataLoader');

/**
 * MOCK COMPLETO DE MÓDULO:
 * Reemplazamos completamente el módulo 'fs' por nuestras propias implementaciones.
 * Esto es crucial para evitar operaciones reales de archivos durante las pruebas.
 * 
 * Las funciones mock devuelven promesas para simular operaciones asíncronas:
 * - readFile: se configurará en cada prueba para devolver datos o errores
 * - writeFile: por defecto devuelve una promesa resuelta (undefined)
 */
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }
}));

/**
 * SUITE DE PRUEBAS PRINCIPAL
 * 
 * describe: agrupa pruebas relacionadas, creando una jerarquía legible
 */
describe('dataLoader Module', () => {
  /**
   * HOOK DE LIMPIEZA
   * 
   * afterEach: se ejecuta después de cada prueba individual
   * Limpiamos el estado de los mocks para evitar influencias entre pruebas
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * GRUPO DE PRUEBAS PARA loadJsonData
   */
  describe('loadJsonData', () => {
    /**
     * CASO DE ÉXITO
     * 
     * Prueba el funcionamiento normal de la función cuando todo va bien
     * Sigue el patrón AAA: Arrange (preparar), Act (actuar), Assert (verificar)
     */
    it('should load and parse JSON data correctly', async () => {
      // ARRANGE: Preparamos los datos y el comportamiento del mock
      const mockData = [{ id: 1, name: 'Test Product' }];
      const mockJsonString = JSON.stringify(mockData);

      // Configuramos readFile para que devuelva nuestros datos de prueba
      fs.readFile.mockResolvedValue(mockJsonString);

      // ACT: Ejecutamos la función que queremos probar
      const result = await loadJsonData('test.json');

      // ASSERT: Verificamos que la función se comportó como esperamos
      
      // Verificamos que se llamó a readFile con la ruta correcta
      // stringContaining es útil cuando no conocemos la ruta absoluta exacta
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('test.json'),
        'utf8'
      );

      // Verificamos que el resultado es el esperado (comparación profunda de objetos)
      expect(result).toEqual(mockData);
    });

    /**
     * CASO DE ERROR
     * 
     * Prueba el manejo de errores cuando la lectura del archivo falla
     */
    it('should throw an error when file reading fails', async () => {
      // ARRANGE: Configuramos el mock para simular un error
      const mockError = new Error('File read error');
      fs.readFile.mockRejectedValue(mockError);

      // ACT & ASSERT: Verificamos que la función arroja el error esperado
      // rejects.toThrow: verifica que una promesa es rechazada con un error específico
      await expect(loadJsonData('test.json')).rejects.toThrow(
        'Could not load data from test.json'
      );
    });
  });

  /**
   * GRUPO DE PRUEBAS PARA saveJsonData
   */
  describe('saveJsonData', () => {
    /**
     * CASO DE ÉXITO
     * 
     * Prueba el guardado correcto de datos en formato JSON
     */
    it('should stringify and save data correctly', async () => {
      // ARRANGE: Preparamos los datos de prueba
      const mockData = [{ id: 1, name: 'Test Product' }];

      // ACT: Ejecutamos la función que queremos probar
      await saveJsonData('test.json', mockData);

      // ASSERT: Verificamos que writeFile fue llamada con los parámetros correctos
      // Verificamos tanto la ruta como los datos y opciones
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test.json'),
        JSON.stringify(mockData, null, 2), // null, 2 para formateo bonito del JSON
        'utf8'
      );
    });

    /**
     * CASO DE ERROR
     * 
     * Prueba el manejo de errores cuando la escritura del archivo falla
     */
    it('should throw an error when file writing fails', async () => {
      // ARRANGE: Configuramos el mock para simular un error
      const mockError = new Error('File write error');
      fs.writeFile.mockRejectedValue(mockError);

      // ACT & ASSERT: Verificamos que la función arroja el error esperado
      await expect(saveJsonData('test.json', [])).rejects.toThrow(
        'Could not save data to test.json'
      );
    });
  });
}); 