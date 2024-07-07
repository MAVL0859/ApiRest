CREATE DATABASE db_curso_app;
USE db_curso_app;

CREATE TABLE persona(
    idpersona INT PRIMARY KEY AUTO_INCREMENT,
    cedula VARCHAR(10),
    nombres VARCHAR(150),
    apellidos VARCHAR(150),
    fecha_nacimiento date,
    telefono VARCHAR(10),
    direccion VARCHAR(250),
    edad INT
);
