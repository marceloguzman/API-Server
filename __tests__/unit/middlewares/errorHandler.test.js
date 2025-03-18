/**
 * Pruebas unitarias para el middleware de manejo de errores
 * 
 * Estas pruebas verifican que el middleware errorHandler gestione correctamente
 * los errores en diferentes situaciones y entornos.
 */

// Importamos el middleware que vamos a probar
const errorHandler = require('../../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  /**
   * GUARDAR ESTADO ORIGINAL DEL ENTORNO
   * 
   * Es importante guardar y restaurar el estado global para que las pruebas
   * no tengan efectos secundarios en otras pruebas o en el entorno real.
   */
  const originalNodeEnv = process.env.NODE_ENV;
  const originalConsoleError = console.error;

  /**
   * OBJETOS MOCK PARA EXPRESS
   */
  let res;
  let req;
  let next;

  /**
   * CONFIGURACIÓN ANTES DE CADA PRUEBA
   * 
   * Configuramos el entorno de prueba antes de cada test
   */
  beforeEach(() => {
    /**
     * MOCK DE FUNCIÓN NATIVA
     * 
     * Reemplazamos console.error para:
     * 1. Evitar mensajes de error en la consola durante las pruebas
     * 2. Poder verificar que se llama correctamente
     */
    console.error = jest.fn();

    // Objetos Express simulados
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  /**
   * LIMPIEZA DESPUÉS DE CADA PRUEBA
   * 
   * Restauramos el estado original después de cada prueba
   * para evitar afectar otras pruebas.
   */
  afterEach(() => {
    // Restaurar variables globales
    process.env.NODE_ENV = originalNodeEnv;
    console.error = originalConsoleError;
  });

  /**
   * CASO BÁSICO: MANEJO CORRECTO DE ERRORES
   * 
   * Verifica que se respondan con el código de estado y mensaje apropiados
   */
  it('should respond with the correct status code and error message', () => {
    // ARRANGE: Crear un error de prueba con código de estado
    const error = new Error('Test error message');
    error.statusCode = 400;

    // ACT: Llamar al middleware con el error
    errorHandler(error, req, res, next);

    // ASSERT: Verificar respuesta correcta
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      statusCode: 400,
      message: 'Test error message'
    }));
  });

  /**
   * CASO DE VALOR POR DEFECTO
   * 
   * Verifica que se use un código de estado predeterminado cuando no se especifica
   */
  it('should default to status code 500 when not specified', () => {
    // ARRANGE: Error sin código de estado
    const error = new Error('Internal server error');

    // ACT: Llamar al middleware
    errorHandler(error, req, res, next);

    // ASSERT: Verificar que se usa el código 500 por defecto
    expect(res.status).toHaveBeenCalledWith(500);
  });

  /**
   * COMPORTAMIENTO SEGÚN ENTORNO: DESARROLLO
   * 
   * Verifica que en modo desarrollo se incluya el stack trace para depuración
   */
  it('should include stack trace in development environment', () => {
    // ARRANGE: Configurar entorno de desarrollo
    process.env.NODE_ENV = 'development';

    // Error con stack para prueba
    const error = new Error('Development error');
    error.stack = 'Stack trace info';

    // ACT: Llamar al middleware
    errorHandler(error, req, res, next);

    // ASSERT: Verificar que el stack se incluye en la respuesta
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: 'Stack trace info'
    }));
  });

  /**
   * COMPORTAMIENTO SEGÚN ENTORNO: PRODUCCIÓN
   * 
   * Verifica que en modo producción NO se incluya el stack trace
   * para mejorar seguridad y reducir volumen de respuesta
   */
  it('should not include stack trace in production environment', () => {
    // ARRANGE: Configurar entorno de producción
    process.env.NODE_ENV = 'production';

    // Error con stack para prueba
    const error = new Error('Production error');
    error.stack = 'Stack trace info';

    // ACT: Llamar al middleware
    errorHandler(error, req, res, next);

    // ASSERT: Verificar que el stack NO está en la respuesta
    // Usamos "not.objectContaining" para verificar ausencia
    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({
        stack: expect.anything()
      })
    );
  });

  /**
   * VERIFICACIÓN DE LOGGING
   * 
   * Verificar que los errores se registran apropiadamente
   * independientemente de la respuesta HTTP
   */
  it('should log the error message and stack trace', () => {
    // ARRANGE: Error para prueba
    const error = new Error('Logged error');
    error.stack = 'Stack trace to log';

    // ACT: Llamar al middleware
    errorHandler(error, req, res, next);

    // ASSERT: Verificar que se registra tanto el mensaje como el stack
    expect(console.error).toHaveBeenCalledWith(`Error: Logged error`);
    expect(console.error).toHaveBeenCalledWith('Stack trace to log');
  });
}); 