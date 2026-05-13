-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 12-05-2026 a las 00:39:55
-- Versión del servidor: 8.0.30
-- Versión de PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `loanlinkdb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_notificaciones`
--

CREATE TABLE `estado_notificaciones` (
  `id_estado_notificacion` int NOT NULL,
  `estado_notificacion` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_prestamos`
--

CREATE TABLE `estado_prestamos` (
  `id_estado_prestamo` int NOT NULL,
  `estado_prestamo` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_publicaciones`
--

CREATE TABLE `estado_publicaciones` (
  `id_estado_publicacion` int NOT NULL,
  `estado` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_solicitudes`
--

CREATE TABLE `estado_solicitudes` (
  `id_estado_solicitud` int NOT NULL,
  `estado_solicitud` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL,
  `id_destinatario` int NOT NULL,
  `mensaje` text NOT NULL,
  `estado_notificacion` int DEFAULT '1',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_notificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_notificacion` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamo`
--

CREATE TABLE `prestamo` (
  `id_prestamo` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_firmada` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `clausula` varchar(1000) DEFAULT NULL,
  `valoracion_prestamista` int DEFAULT NULL,
  `valoracion_cliente` int DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `id_prestamista` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id_prestamo` int NOT NULL,
  `id_cliente` int NOT NULL,
  `id_prestamista` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` int DEFAULT '1',
  `fecha_inici` varchar(1000) DEFAULT NULL,
  `fecha_fin` varchar(1000) NOT NULL,
  `Fartante` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion_prestamos`
--

CREATE TABLE `publicacion_prestamos` (
  `id_publicacion_prestamo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `nombre_prestamista` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `tasa_interes` decimal(5,2) NOT NULL,
  `cant_min` decimal(10,2) NOT NULL,
  `cant_max` decimal(10,2) NOT NULL,
  `requisitos` text NOT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cnt_cli` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla ` publications`
--

CREATE TABLE ` publications` (
  `id_publicacion` int NOT NULL,
  `code_user` varchar(20) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(50) DEFAULT 'pendiente',
  `valoracion_cliente` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publications`
--

CREATE TABLE `publications` (
  `id_publicacion` int NOT NULL,
  `code_user` varchar(20) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(50) DEFAULT 'pendiente',
  `valoracion_cliente` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud_prestamos`
--

CREATE TABLE `solicitud_prestamos` (
  `id_solicitud` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_publicacion` int DEFAULT NULL,
  `monto_solicitado` decimal(10,2) DEFAULT NULL,
  `plazo_deseado` int DEFAULT NULL,
  `motivo_prestamo` text,
  `empleo_actual` varchar(255) DEFAULT NULL,
  `contacto_empleador` varchar(255) DEFAULT NULL,
  `cargo_posicion` varchar(255) DEFAULT NULL,
  `ingresos_mensuales` decimal(10,2) DEFAULT NULL,
  `nombre_referencia` varchar(255) DEFAULT NULL,
  `contacto_referencia` varchar(255) DEFAULT NULL,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_solicitud` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pendiente',
  `garat` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `clapsula` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tiempo_apro` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monto_aproba` decimal(10,2) DEFAULT NULL,
  `despositos` int DEFAULT NULL,
  `restante` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_prestamo`
--

CREATE TABLE `tipo_prestamo` (
  `id_tipo_prestamo` int NOT NULL,
  `nombre_tipo` varchar(100) NOT NULL,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transferencia`
--

CREATE TABLE `transferencia` (
  `id_transferencia` int NOT NULL,
  `Id_Cliente` int DEFAULT NULL,
  `id_prestamista` int DEFAULT NULL,
  `cuenta_origen` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cuenta_destino` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monto` varchar(100) DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `code_user` varchar(20) NOT NULL,
  `password` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `document` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `client_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nationality` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `document_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_type` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `birth_date` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Estado_civil` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `occupation` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `photo` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cuenta` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `username` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `city` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone_2` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `name_user` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`code_user`, `password`, `first_name`, `document`, `client_id`, `client_secret`, `last_name`, `nationality`, `document_type`, `phone`, `address`, `user_type`, `birth_date`, `Estado_civil`, `occupation`, `photo`, `email`, `cuenta`, `username`, `city`, `phone_2`, `name_user`) VALUES
('CL1N', '$2b$10$dBflI4dUxgaMsWeZ6ehX/OhUo6IBDeZ0Yg8CmXl5ey36ks2h6f.Ku', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cliente', NULL, NULL, NULL, NULL, 'sasuke25an@gmail.com', NULL, NULL, NULL, NULL, 'juan perez'),
('PR1W', '$2b$10$.Aal8pxKqSQJaCYDIWcgS.tdsuF2daN.yRn2CusMmM45.Psxg/4Qa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'prestamista', NULL, NULL, NULL, NULL, 'sasuke25an@gmail.com', NULL, NULL, NULL, NULL, 'perez jacobo'),
('PR2N', '$2b$10$JCkojyXcHnvMd8lN50HZOODFDeEhgIDEhAtl9hYc7QC3KBo1P7dSK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'prestamista', NULL, NULL, NULL, NULL, 'an2@gmail.com', NULL, NULL, NULL, NULL, 'juan perez');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estado_notificaciones`
--
ALTER TABLE `estado_notificaciones`
  ADD PRIMARY KEY (`id_estado_notificacion`);

--
-- Indices de la tabla `estado_prestamos`
--
ALTER TABLE `estado_prestamos`
  ADD PRIMARY KEY (`id_estado_prestamo`) USING BTREE;

--
-- Indices de la tabla `estado_publicaciones`
--
ALTER TABLE `estado_publicaciones`
  ADD PRIMARY KEY (`id_estado_publicacion`) USING BTREE;

--
-- Indices de la tabla `estado_solicitudes`
--
ALTER TABLE `estado_solicitudes`
  ADD PRIMARY KEY (`id_estado_solicitud`) USING BTREE;

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `id_destinatario` (`id_destinatario`);

--
-- Indices de la tabla `prestamo`
--
ALTER TABLE `prestamo`
  ADD PRIMARY KEY (`id_prestamo`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_prestamista` (`id_prestamista`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id_prestamo`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_prestamista` (`id_prestamista`);

--
-- Indices de la tabla `publicacion_prestamos`
--
ALTER TABLE `publicacion_prestamos`
  ADD PRIMARY KEY (`id_publicacion_prestamo`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla ` publications`
--
ALTER TABLE ` publications`
  ADD PRIMARY KEY (`id_publicacion`),
  ADD KEY `code_user` (`code_user`);

--
-- Indices de la tabla `publications`
--
ALTER TABLE `publications`
  ADD PRIMARY KEY (`id_publicacion`),
  ADD KEY `code_user` (`code_user`);

--
-- Indices de la tabla `solicitud_prestamos`
--
ALTER TABLE `solicitud_prestamos`
  ADD PRIMARY KEY (`id_solicitud`),
  ADD KEY `fk_usuario` (`id_usuario`),
  ADD KEY `fk_publicacion` (`id_publicacion`);

--
-- Indices de la tabla `tipo_prestamo`
--
ALTER TABLE `tipo_prestamo`
  ADD PRIMARY KEY (`id_tipo_prestamo`);

--
-- Indices de la tabla `transferencia`
--
ALTER TABLE `transferencia`
  ADD PRIMARY KEY (`id_transferencia`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`code_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estado_notificaciones`
--
ALTER TABLE `estado_notificaciones`
  MODIFY `id_estado_notificacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_prestamos`
--
ALTER TABLE `estado_prestamos`
  MODIFY `id_estado_prestamo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_publicaciones`
--
ALTER TABLE `estado_publicaciones`
  MODIFY `id_estado_publicacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_solicitudes`
--
ALTER TABLE `estado_solicitudes`
  MODIFY `id_estado_solicitud` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prestamo`
--
ALTER TABLE `prestamo`
  MODIFY `id_prestamo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id_prestamo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publicacion_prestamos`
--
ALTER TABLE `publicacion_prestamos`
  MODIFY `id_publicacion_prestamo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla ` publications`
--
ALTER TABLE ` publications`
  MODIFY `id_publicacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publications`
--
ALTER TABLE `publications`
  MODIFY `id_publicacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitud_prestamos`
--
ALTER TABLE `solicitud_prestamos`
  MODIFY `id_solicitud` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_prestamo`
--
ALTER TABLE `tipo_prestamo`
  MODIFY `id_tipo_prestamo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transferencia`
--
ALTER TABLE `transferencia`
  MODIFY `id_transferencia` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla ` publications`
--
ALTER TABLE ` publications`
  ADD CONSTRAINT ` publications_ibfk_1` FOREIGN KEY (`code_user`) REFERENCES `user` (`code_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitud_prestamos`
--
ALTER TABLE `solicitud_prestamos`
  ADD CONSTRAINT `fk_publicacion` FOREIGN KEY (`id_publicacion`) REFERENCES `publicacion_prestamos` (`id_publicacion_prestamo`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
