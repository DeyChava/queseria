// Variables falsas para poder cargar la app sin tocar la base de datos real
process.env.JWT_SECRET = "clave-de-prueba-clave-de-prueba-123456";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.CODIGO_JEFE = "codigo-jefe";
process.env.CODIGO_EMPLEADO = "codigo-emp";
