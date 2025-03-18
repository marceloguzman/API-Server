/**
 * Pruebas de integración para las rutas de la API
 * 
 * A diferencia de las pruebas unitarias que evalúan componentes aislados,
 * estas pruebas verifican que los diferentes componentes (rutas, controladores, 
 * middleware) trabajen juntos correctamente para manejar solicitudes HTTP completas.
 */

// Importamos supertest para simular peticiones HTTP
const request = require('supertest');
// Importamos la aplicación Express (sin iniciar el servidor)
const app = require('../../src/app');
// Importamos funciones del modelo que serán mockeadas
const { loadJsonData, saveJsonData } = require('../../src/models/dataLoader');

/**
 * MOCK DEL MODELO DE DATOS
 * 
 * Aunque es una prueba de integración, seguimos mockeando la capa de datos
 * para evitar dependencias de archivos físicos o bases de datos reales.
 */
jest.mock('../../src/models/dataLoader');

/**
 * SUITE PRINCIPAL DE PRUEBAS DE INTEGRACIÓN
 */
describe('API Routes Integration Tests', () => {
  /**
   * DATOS DE PRUEBA
   * 
   * Definimos datos realistas para las pruebas
   */
  const mockUsers = [
    { id: '1', name: 'Test User 1', email: 'user1@example.com', role: 'admin' },
    { id: '2', name: 'Test User 2', email: 'user2@example.com', role: 'user' }
  ];

  const mockProducts = [
    { id: 1, name: 'Test Product 1', price: 99.99, category: 'electronics', stock: 10 },
    { id: 2, name: 'Test Product 2', price: 49.99, category: 'accessories', stock: 20 }
  ];

  /**
   * CONFIGURACIÓN ANTES DE CADA PRUEBA
   */
  beforeEach(() => {
    // Resetear mocks
    jest.clearAllMocks();
    
    /**
     * IMPLEMENTACIÓN CONDICIONAL DE MOCK
     * 
     * Configuramos loadJsonData para devolver diferentes datos según el nombre del archivo.
     * Esta técnica permite que el mismo mock se comporte de manera diferente según los parámetros.
     */
    loadJsonData.mockImplementation(filename => {
      if (filename === 'users.json') return Promise.resolve([...mockUsers]);
      if (filename === 'products.json') return Promise.resolve([...mockProducts]);
      return Promise.resolve([]);
    });

    // Mock de saveJsonData para evitar escritura real a disco
    saveJsonData.mockResolvedValue(undefined);
  });

  /**
   * PRUEBAS DE RUTAS DE USUARIOS
   */
  describe('User Routes', () => {
    /**
     * PRUEBA DE ENDPOINT GET /api/v1/users
     */
    describe('GET /api/v1/users', () => {
      it('should return all users', async () => {
        /**
         * PETICIÓN HTTP SIMULADA CON SUPERTEST
         * 
         * request(app) crea un agente HTTP que puede realizar peticiones a nuestra app
         * .get('/ruta') envía una petición GET a la ruta especificada
         */
        const response = await request(app).get('/api/v1/users');

        // Verificamos el código de estado HTTP
        expect(response.status).toBe(200);
        // Verificamos la estructura y contenido de la respuesta JSON
        expect(response.body).toEqual({
          status: 'success',
          results: mockUsers.length,
          data: { users: mockUsers }
        });
      });
    });

    /**
     * PRUEBA DE ENDPOINT GET /api/v1/users/:id
     */
    describe('GET /api/v1/users/:id', () => {
      it('should return a user by ID', async () => {
        // Petición con parámetro de ruta (ID del usuario)
        const response = await request(app).get('/api/v1/users/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          data: { user: mockUsers[0] }
        });
      });

      /**
       * CASO DE ERROR: RECURSO NO ENCONTRADO
       * 
       * Verificamos que la API maneje correctamente la solicitud de un recurso inexistente
       */
      it('should return 404 for non-existent user', async () => {
        // Petición con ID inexistente
        const response = await request(app).get('/api/v1/users/999');

        // Verificar código de error 404 y mensaje
        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('User not found');
      });
    });

    /**
     * PRUEBA DE ENDPOINT POST /api/v1/users
     */
    describe('POST /api/v1/users', () => {
      it('should create a new user', async () => {
        // Datos para el nuevo usuario
        const newUser = { name: 'New User', email: 'newuser@example.com', role: 'user' };
        
        /**
         * PETICIÓN POST CON DATOS
         * 
         * .post('/ruta') envía una petición POST
         * .send(datos) adjunta los datos al cuerpo de la petición
         */
        const response = await request(app)
          .post('/api/v1/users')
          .send(newUser);

        // Verificar código 201 (Created) para recursos creados
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        // Verificar que los datos del usuario creado están en la respuesta
        expect(response.body.data.user).toMatchObject(newUser);
        // Verificar que se llamó a la función para guardar datos
        expect(saveJsonData).toHaveBeenCalled();
      });
    });

    /**
     * PRUEBA DE ENDPOINT PATCH /api/v1/users/:id
     */
    describe('PATCH /api/v1/users/:id', () => {
      it('should update a user', async () => {
        // Datos para actualizar el usuario
        const updateData = { name: 'Updated User' };
        
        /**
         * PETICIÓN PATCH
         * 
         * PATCH se usa para actualizaciones parciales de recursos
         */
        const response = await request(app)
          .patch('/api/v1/users/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        // Verificar que el nombre se actualizó
        expect(response.body.data.user.name).toBe('Updated User');
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .patch('/api/v1/users/999')
          .send({ name: 'Updated User' });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });

    /**
     * PRUEBA DE ENDPOINT DELETE /api/v1/users/:id
     */
    describe('DELETE /api/v1/users/:id', () => {
      it('should delete a user', async () => {
        const response = await request(app).delete('/api/v1/users/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        // Verificar que la respuesta incluye el usuario eliminado
        expect(response.body.data.user).toEqual(mockUsers[0]);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app).delete('/api/v1/users/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });
  });

  /**
   * PRUEBAS DE RUTAS DE PRODUCTOS
   * 
   * Sigue una estructura similar a las pruebas de rutas de usuarios
   */
  describe('Product Routes', () => {
    describe('GET /api/v1/products', () => {
      it('should return all products', async () => {
        const response = await request(app).get('/api/v1/products');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          results: mockProducts.length,
          data: { products: mockProducts }
        });
      });

      /**
       * PRUEBA DE FILTRADO
       * 
       * Verificamos que los parámetros de consulta funcionen correctamente para filtrar resultados
       */
      it('should filter products by category', async () => {
        // Petición con parámetro de consulta (query string)
        const response = await request(app).get('/api/v1/products?category=accessories');

        expect(response.status).toBe(200);
        // Verificar que el filtro se aplicó correctamente
        expect(response.body.data.products).toHaveLength(1);
        expect(response.body.data.products[0].category).toBe('accessories');
      });

      /**
       * PRUEBA DE MÚLTIPLES PARÁMETROS DE CONSULTA
       */
      it('should filter products by price range', async () => {
        // Petición con múltiples parámetros de consulta
        const response = await request(app).get('/api/v1/products?minPrice=80&maxPrice=100');

        expect(response.status).toBe(200);
        expect(response.body.data.products).toHaveLength(1);
        expect(response.body.data.products[0].price).toBe(99.99);
      });
    });

    // Más pruebas de productos...
    describe('GET /api/v1/products/:id', () => {
      it('should return a product by ID', async () => {
        const response = await request(app).get('/api/v1/products/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'success',
          data: { product: mockProducts[0] }
        });
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app).get('/api/v1/products/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Product not found');
      });
    });

    describe('POST /api/v1/products', () => {
      it('should create a new product', async () => {
        const newProduct = { 
          name: 'New Product', 
          price: 149.99, 
          category: 'gaming', 
          stock: 15 
        };
        
        const response = await request(app)
          .post('/api/v1/products')
          .send(newProduct);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product).toMatchObject(newProduct);
        expect(saveJsonData).toHaveBeenCalled();
      });
    });

    describe('PATCH /api/v1/products/:id', () => {
      it('should update a product', async () => {
        const updateData = { price: 89.99, stock: 5 };
        
        const response = await request(app)
          .patch('/api/v1/products/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product.price).toBe(89.99);
        expect(response.body.data.product.stock).toBe(5);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app)
          .patch('/api/v1/products/999')
          .send({ price: 89.99 });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });

    describe('DELETE /api/v1/products/:id', () => {
      it('should delete a product', async () => {
        const response = await request(app).delete('/api/v1/products/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.product).toEqual(mockProducts[0]);
        expect(saveJsonData).toHaveBeenCalled();
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app).delete('/api/v1/products/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });
  });

  /**
   * PRUEBAS DE RUTAS DE INFORMACIÓN DE LA API
   * 
   * Verificamos endpoints informativos y manejo de rutas no existentes
   */
  describe('API Info Routes', () => {
    it('should return welcome message on root path', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Welcome to the API');
    });

    it('should return API information on /api/v1', async () => {
      const response = await request(app).get('/api/v1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('API v1');
      // Verificamos que la respuesta incluye información sobre los endpoints disponibles
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('products');
    });

    /**
     * PRUEBA DE MANEJO DE RUTAS NO EXISTENTES
     * 
     * Verificamos que la API responde adecuadamente a rutas que no existen
     */
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
}); 