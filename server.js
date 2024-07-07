/**
 * Middleware que analiza las solicitudes entrantes con el tipo de contenido 'application/json'
 * y analiza el cuerpo de la solicitud en un objeto JSON.
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {import('body-parser').OptionsJson} OptionsJson
 * @typedef {import('body-parser').OptionsUrlencoded} OptionsUrlencoded
 * @typedef {import('body-parser').OptionsText} OptionsText
 * @typedef {import('body-parser').OptionsRaw} OptionsRaw
 * @typedef {import('body-parser').Options} Options
 * @typedef {import('body-parser').OptionsText} OptionsText
 * @typedef {import('body-parser').OptionsRaw} OptionsRaw
 * @typedef {import('body-parser').Options} Options
 * @param {OptionsJson | OptionsUrlencoded | OptionsText | OptionsRaw | Options} [options] - Opciones para el middleware bodyParser.
 * @returns {RequestHandler} - Middleware de análisis de cuerpo de solicitud.
 */

const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(bodyParser.json({ type: 'application/json'}));

// Configurar encabezados CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir acceso desde cualquier origen
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Encabezados permitidos
    res.setHeader('Access-Control-Allow-Credentials', true); // Permitir credenciales (cookies, autenticación HTTP)
    next();
});

// Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ariel2004',
  database: 'db_curso_app'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL como id ' + db.threadId);
});


// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(express.json());

// Ruta para la página principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor Node.js!');
});

// Endpoint para insertar datos
app.post('/insertar-datos', (req, res) => {
  const { idpersona, cedula, nombres, apellidos, fecha_nacimiento, telefono, direccion} = req.body;

  // Validar los datos recibidos
  if ( !idpersona || !cedula || !nombres || !apellidos || !fecha_nacimiento || !telefono || !direccion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Insertar los datos en la base de datos
  const query = 'INSERT INTO persona (idpersona, cedula, nombres, apellidos, fecha_nacimiento, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [idpersona, cedula, nombres, apellidos, fecha_nacimiento, telefono, direccion], (err, result) => {
    if (err) {
      console.error('Error al insertar datos:', err);
      return res.status(500).json({ error: 'Error al insertar datos en la base de datos' });
    }

    res.status(200).json({ message: 'Datos insertados correctamente' });
  });
});

//Endpoint para modificar los datos "update"
app.post('/modificar-datos', (req, res) => {
  const {cedula, nombres, apellidos, fecha_nacimiento, telefono, direccion} = req.body;

  // Validar los datos recibidos
  if (!cedula || !nombres || !apellidos || !fecha_nacimiento || !telefono || !direccion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Actualizar los datos en la base de datos, utilizamos un where en cedula para no modificar todos los registros
  const query = 'UPDATE persona SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, telefono = ?, direccion = ? where cedula = ?';
  db.query(query, [nombres, apellidos, fecha_nacimiento, telefono, direccion, cedula], (err, result) => {
    if (err) {
      console.error('Error al modificar datos:', err);
      return res.status(500).json({ error: 'Error al modificar datos en la base de datos' });
    }

    res.status(200).json({ message: 'Datos modificados correctamente' });
  });
});

// Endpoint para seleccionar los datos
app.post('/seleccionar-datos', (req, res) => {
  const { cedula } = req.body;

  // Validar los datos recibidos
  if (!cedula) {
    return res.status(400).json({ error: 'Falta el ID de la persona' });
  }

  // Seleccionar los datos de la persona en la base de datos, utilizamos where para que me pase solo los datos de esa persona
  const query = 'SELECT * FROM persona WHERE cedula = ?';
  db.query(query, [cedula], (err, result) => {
    if (err) {
      console.error('Error al seleccionar datos:', err);
      return res.status(500).json({ error: 'Error al seleccionar datos de la base de datos' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'No se encontró ninguna persona con ese CI' });
    }

    res.status(200).json(result[0]);
  });
});

// Endpoint para eliminar datos
app.post('/eliminar-datos', (req, res) => {
  const { cedula } = req.body;

  // Validar los datos recibidos
  if (!cedula) {
    return res.status(400).json({ error: 'Falta la cedula de la persona' });
  }

  // Eliminar los datos de la persona en la base de datos, también utilizamos where para una mejor lógica,
  // en este caso, eliminamos todos los registros de la persona con la cedula seleccionada
  const query = 'DELETE FROM persona WHERE cedula = ?';
  db.query(query, [cedula], (err, result) => {
    if (err) {
      console.error('Error al eliminar datos:', err);
      return res.status(500).json({ error: 'Error al eliminar datos de la base de datos' });
    }

    res.status(200).json({ message: 'Datos eliminados correctamente' });
  });
});

// Endpoint usando where para buscar registros por número de cédula y fecha de nacimiento
app.post('/buscar-datos', (req, res) => {
  const { cedula, fecha_nacimiento } = req.body;

  // Validar los datos recibidos
  if (!cedula || !fecha_nacimiento) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Calcular la edad a partir de la fecha de nacimiento
  const fechaNacimiento = new Date(fecha_nacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

  // Buscar los datos en la base de datos utilizando where para filtrar por número de cédula y fecha de nacimiento
  const query = 'SELECT * FROM persona WHERE cedula = ? AND fecha_nacimiento = ?';
  db.query(query, [cedula, fecha_nacimiento], (err, result) => {
    if (err) {
      console.error('Error al buscar datos:', err);
      return res.status(500).json({ error: 'Error al buscar datos en la base de datos' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'No se encontraron registros con esa cédula y fecha de nacimiento' });
    }

    // Verificar si la persona es mayor o menor de edad
    const persona = result[0];
    const esMayorEdad = edad >= 18;

    res.status(200).json({ persona, edad, esMayorEdad });
  });
});

// Middleware para manejar las solicitudes de error
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor corriendo en: http://localhost:${port}`);
});
