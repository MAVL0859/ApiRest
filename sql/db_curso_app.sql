CREATE DATABASE db_curso_app;
USE db_curso_app;

CREATE TABLE persona(
  idpersona SERIAL,
  cedula VARCHAR(20),
  nombres VARCHAR(50),
  apellidos VARCHAR(50),
  fecha_nacimiento date,
  telefono VARCHAR(50),
  direccion VARCHAR(50)
);

SELECT * FROM persona;
-- DROP SCHEMA db_curso_app;


