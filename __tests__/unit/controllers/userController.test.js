/**
 * Pruebas unitarias para el controlador de usuarios
 * 
 * Estas pruebas verifican que los métodos del controlador de usuarios
 * funcionen correctamente tanto en casos normales como en situaciones de error.
 */

// Importamos los métodos del controlador que vamos a probar
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../../../src/controllers/userController');

// Importamos las funciones del modelo que serán mockeadas
const { loadJsonData, saveJsonData } = require('../../../src/models/dataLoader');

/**
 * MOCK DE MÓDULO ESPECÍFICO
 * 
 * A diferencia del mock completo de 'fs', aquí solo mockeamos el módulo dataLoader
 * Jest reemplazará automáticamente todas las funciones de este módulo por mocks
 * que podremos configurar en cada test.
 */
jest.mock('../../../src/models/dataLoader');

/**
 * SUITE DE PRUEBAS PRINCIPAL
 */
describe('User Controller', () => {
  /**
   * DATOS DE PRUEBA
   * 
   * Definimos datos de prueba realistas que simulan usuarios 
   * como los que manejaría la aplicación
   */
  const mockUsers = [
    { id: '1', name: 'User 1', email: 'user1@example.com' },
    { id: '2', name: 'User 2', email: 'user2@example.com' }
  ];

  /**
   * OBJETOS MOCK PARA EXPRESS
   * 
   * Estos objetos simulan los req, res y next que Express pasaría
   * a los controladores en una petición real
   */
  let req;
  let res;
  let next;

  /**
   * CONFIGURACIÓN ANTES DE CADA PRUEBA
   * 
   * Restablecemos el estado de los objetos mock antes de cada prueba
   * para evitar interferencias entre pruebas diferentes
   */
  beforeEach(() => {
    // Limpiamos el historial y comportamiento de los mocks
    jest.clearAllMocks();

    // Configuración de objetos Express simulados
    req = {
      params: {},     // Parámetros de ruta (ej: /users/:id)
      body: {},       // Cuerpo de la petición (ej: datos POST)
      query: {}       // Parámetros de consulta (ej: ?page=1)
    };
    
    res = {
      // Función json simulada para capturar la respuesta
      json: jest.fn(),
      
      // Función status simulada que devuelve 'this' para permitir encadenamiento
      // Esto permite probar res.status(200).json({...})
      status: jest.fn().mockReturnThis()
    };
    
    // Función next simulada para middleware de manejo de errores
    next = jest.fn();

    // Configuración predeterminada para loadJsonData
    // Usamos spread operator para evitar modificar el array original en las pruebas
    loadJsonData.mockResolvedValue([...mockUsers]);
  });

  /**
   * PRUEBAS DEL MÉTODO getAllUsers
   */
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // ACT: Llamamos al controlador como lo haría Express
      await getAllUsers(req, res, next);

      // ASSERT: Verificamos que se leyó el archivo correcto
      expect(loadJsonData).toHaveBeenCalledWith('users.json');

      // Verificamos la estructura de la respuesta API
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockUsers.length,
        data: { users: mockUsers }
      });
    });

    /**
     * PRUEBA DE MANEJO DE ERRORES
     * 
     * Verificamos que el controlador maneje correctamente los errores
     * pasándolos al middleware next para su procesamiento
     */
    it('should call next with error when loadJsonData fails', async () => {
      // ARRANGE: Simulamos un error en la carga de datos
      const error = new Error('Test error');
      loadJsonData.mockRejectedValue(error);

      // ACT: Llamamos al controlador
      await getAllUsers(req, res, next);

      // ASSERT: Verificamos que el error es pasado a next
      // Esto es crucial para el manejo centralizado de errores en Express
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  /**
   * PRUEBAS DEL MÉTODO getUserById
   */
  describe('getUserById', () => {
    it('should return the user with the specified ID', async () => {
      // ARRANGE: Simulamos un parámetro de ruta con ID
      req.params.id = '1';

      // ACT: Llamamos al controlador
      await getUserById(req, res, next);

      // ASSERT: Verificamos la correcta carga de datos
      expect(loadJsonData).toHaveBeenCalledWith('users.json');

      // Verificamos que la respuesta contiene el usuario correcto
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUsers[0] }
      });
    });

    /**
     * PRUEBA DE CASO DE ERROR: RECURSO NO ENCONTRADO
     * 
     * Verificamos que se genere un error 404 cuando el recurso no existe
     */
    it('should call next with 404 error when user is not found', async () => {
      // ARRANGE: Simulamos búsqueda de un ID inexistente
      req.params.id = 'nonexistent';

      // ACT: Llamamos al controlador
      await getUserById(req, res, next);

      // ASSERT: Verificamos que se pasa un error 404 a next
      // objectContaining permite verificar solo ciertas propiedades
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });

  /**
   * PRUEBAS DEL MÉTODO createUser
   */
  describe('createUser', () => {
    it('should create a new user', async () => {
      // ARRANGE: Simulamos datos en el cuerpo de la petición
      req.body = { name: 'New User', email: 'newuser@example.com' };

      // ACT: Llamamos al controlador
      await createUser(req, res, next);

      // ASSERT: Verificamos que se guarda en la base de datos
      // arrayContaining verifica que el array incluya ciertos elementos
      expect(saveJsonData).toHaveBeenCalledWith('users.json', expect.arrayContaining([
        ...mockUsers,
        // Verificamos solo las propiedades que conocemos (el ID será generado)
        expect.objectContaining({ name: 'New User', email: 'newuser@example.com' })
      ]));

      // Verificamos el código de estado y la respuesta
      expect(res.status).toHaveBeenCalledWith(201); // Código 201: Created
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: expect.objectContaining({ name: 'New User', email: 'newuser@example.com' }) }
      });
    });
  });

  /**
   * PRUEBAS DEL MÉTODO updateUser
   */
  describe('updateUser', () => {
    it('should update an existing user', async () => {
      // ARRANGE: Simulamos ID en la ruta y datos a actualizar
      req.params.id = '1';
      req.body = { name: 'Updated User' };

      // ACT: Llamamos al controlador
      await updateUser(req, res, next);

      // ASSERT: Verificamos la actualización en la base de datos
      expect(saveJsonData).toHaveBeenCalledWith('users.json', expect.arrayContaining([
        // El primer usuario debe tener el nombre actualizado
        expect.objectContaining({ id: '1', name: 'Updated User' }),
        // El segundo usuario debe permanecer sin cambios
        mockUsers[1]
      ]));

      // Verificamos la respuesta API
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: expect.objectContaining({ id: '1', name: 'Updated User' }) }
      });
    });

    it('should call next with 404 error when user is not found', async () => {
      // ARRANGE: Simulamos ID inexistente
      req.params.id = 'nonexistent';
      req.body = { name: 'Updated User' };

      // ACT: Llamamos al controlador
      await updateUser(req, res, next);

      // ASSERT: Verificamos error 404
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });

  /**
   * PRUEBAS DEL MÉTODO deleteUser
   */
  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      // ARRANGE: Simulamos ID en la ruta
      req.params.id = '1';

      // ACT: Llamamos al controlador
      await deleteUser(req, res, next);

      // ASSERT: Verificamos que se guarda el array sin el usuario eliminado
      // Aquí usamos una comparación exacta para verificar que solo queda el segundo usuario
      expect(saveJsonData).toHaveBeenCalledWith('users.json', [mockUsers[1]]);

      // Verificamos que la respuesta incluye el usuario eliminado
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUsers[0] }
      });
    });

    it('should call next with 404 error when user is not found', async () => {
      // ARRANGE: Simulamos ID inexistente
      req.params.id = 'nonexistent';

      // ACT: Llamamos al controlador
      await deleteUser(req, res, next);

      // ASSERT: Verificamos error 404
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'User not found'
      }));
    });
  });
}); 