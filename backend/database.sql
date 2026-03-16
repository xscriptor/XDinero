-- Script de creación de base de datos para XDinero
-- Autor: Oscar Preciado (Xscriptor)
-- Fecha: 2026

CREATE DATABASE IF NOT EXISTS xdinero_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xdinero_db;


-- Tabla: usuarios (antes users)

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `contrasena` VARCHAR(255) NOT NULL,
  `rol` ENUM('usuario', 'admin') DEFAULT 'usuario',
  `avatar` VARCHAR(255) DEFAULT 'uploads/avatars/default.svg',
  `biografia` VARCHAR(255) NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- Tabla: publicaciones (antes posts)

DROP TABLE IF EXISTS `publicaciones`;
CREATE TABLE `publicaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `contenido` TEXT NOT NULL,
  `url_imagen` VARCHAR(255) NULL,
  `publicacion_original_id` INT NULL, -- Para reposts
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_publicaciones_usuarios`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_publicaciones_original`
    FOREIGN KEY (`publicacion_original_id`)
    REFERENCES `publicaciones` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- Tabla: seguidores (antes follows)

DROP TABLE IF EXISTS `seguidores`;
CREATE TABLE `seguidores` (
  `seguidor_id` INT NOT NULL,
  `seguido_id` INT NOT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seguidor_id`, `seguido_id`),
  CONSTRAINT `fk_seguidores_seguidor`
    FOREIGN KEY (`seguidor_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_seguidores_seguido`
    FOREIGN KEY (`seguido_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB;


-- Tabla: me_gusta (antes likes)

DROP TABLE IF EXISTS `me_gusta`;
CREATE TABLE `me_gusta` (
  `usuario_id` INT NOT NULL,
  `publicacion_id` INT NOT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`, `publicacion_id`),
  CONSTRAINT `fk_megusta_usuarios`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_megusta_publicaciones`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `publicaciones` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB;


-- Tabla: comentarios (antes comments)

DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE `comentarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `publicacion_id` INT NOT NULL,
  `contenido` TEXT NOT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comentarios_usuarios`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_comentarios_publicaciones`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `publicaciones` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB;


-- Tabla: lista_seguimiento (antes watchlist)

DROP TABLE IF EXISTS `lista_seguimiento`;
CREATE TABLE `lista_seguimiento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `simbolo` VARCHAR(50) NOT NULL,
  CONSTRAINT `fk_listaseguimiento_usuarios`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB;


-- Datos de Prueba (Seed)
-- Contrasena para todos los usuarios: password

-- Insertando usuarios
INSERT INTO `usuarios` (`nombre_usuario`, `correo`, `contrasena`, `rol`, `avatar`, `biografia`) VALUES
('admin',        'admin@xdinero.com',   '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'admin',   'https://i.pravatar.cc/300?img=1',  'Administrador del sistema'),
('trader_pro',   'trader@gmail.com',    '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=2',  'Trader experto en BTC'),
('crypto_fan',   'fan@yahoo.com',       '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=3',  'HODL forever'),
('hodler_mx',    'hodler@xdinero.com',  '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=4',  'Inversion de largo plazo y DCA'),
('analyst_01',   'analyst@xdinero.com', '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=5',  'Analista tecnico y on-chain'),
('swing_queen',  'swing@xdinero.com',   '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=6',  'Swing trading con gestion de riesgo'),
('dca_daily',    'dca@xdinero.com',     '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=7',  'Compras periodicas y paciencia'),
('macro_watcher','macro@xdinero.com',   '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=8',  'Sigo tendencias macro y geopolitica'),
('defi_lover',   'defi@xdinero.com',    '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=9',  'DeFi, altcoins y comunidad'),
('btc_only',     'btconly@xdinero.com', '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy', 'usuario', 'https://i.pravatar.cc/300?img=10', 'Bitcoin maximalista convencido');

-- Insertando publicaciones
INSERT INTO `publicaciones` (`usuario_id`, `contenido`, `fecha_creacion`) VALUES
(1, 'Bienvenidos a XDinero, la red social del futuro financiero.', NOW()),
(2, 'Bitcoin rompiendo resistencias! #BTC', NOW()),
(3, 'Ethereum 2.0 se ve prometedor. #ETH', NOW()),
(4, 'DCA activo esta semana. Compras en retrocesos. #DCA', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'Dominancia de BTC al alza, atentos a rotacion de altcoins. #Macro', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'Cerrei una posicion con +3.8% hoy. Gestion de riesgo ante todo. #Trading', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 'Mercado lateral: momento de estudiar, no de sobreoperar. #Disciplina', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 'Tasas de interes siguen marcando el ritmo. Cuidado con el apalancamiento. #Macro', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(9, 'Liquidez en stake en Aave. Rendimiento pasivo mientras espero. #DeFi', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 'La mejor operacion del mes fue no operar por impulso. #Disciplina', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Niveles de soporte clave en BTC: 58k y 54k. Ojo al cierre semanal. #BTC', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'ETH gas fees bajando. Buen momento para interactuar con contratos. #ETH', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 'On-chain muestra acumulacion silenciosa. Las manos fuertes no venden. #BTC', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 'Stop loss respetado hoy. Pequena perdida es mejor que catastrofe. #Riesgo', DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Insertando seguidores
INSERT INTO `seguidores` (`seguidor_id`, `seguido_id`) VALUES
(2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(3, 2), (4, 2), (5, 2), (7, 2), (9, 2),
(2, 3), (4, 3), (6, 3), (8, 3), (10, 3),
(2, 4), (3, 4), (5, 4), (6, 4),
(3, 5), (4, 5), (7, 5), (9, 5), (10, 5),
(2, 6), (5, 6), (8, 6),
(4, 7), (6, 7), (9, 7),
(3, 8), (5, 8), (7, 8), (10, 8),
(2, 9), (4, 9), (6, 9), (8, 9),
(3, 10), (5, 10), (7, 10), (9, 10);

-- Insertando me_gusta
INSERT INTO `me_gusta` (`usuario_id`, `publicacion_id`) VALUES
(2, 1), (3, 1), (4, 1), (5, 1), (7, 1), (9, 1),
(1, 2), (3, 2), (5, 2), (8, 2), (10, 2),
(1, 3), (2, 3), (4, 3), (6, 3),
(1, 4), (3, 4), (5, 4), (7, 4), (9, 4),
(2, 5), (4, 5), (6, 5), (8, 5), (10, 5),
(1, 6), (3, 6), (5, 6), (7, 6),
(2, 7), (4, 7), (6, 7), (8, 7), (10, 7),
(1, 8), (3, 8), (5, 8), (9, 8),
(2, 9), (4, 9), (6, 9), (8, 9), (10, 9),
(1, 10), (3, 10), (5, 10), (7, 10),
(2, 11), (4, 11), (6, 11), (9, 11),
(1, 12), (3, 12), (5, 12), (7, 12), (10, 12),
(2, 13), (4, 13), (6, 13), (8, 13),
(1, 14), (3, 14), (5, 14), (9, 14);

-- Insertando comentarios
INSERT INTO `comentarios` (`usuario_id`, `publicacion_id`, `contenido`) VALUES
(2, 1, 'Excelente bienvenida! Ya estamos aqui.'),
(3, 1, 'Gracias por crear esta comunidad.'),
(5, 1, 'Listo para aprender y compartir analisis.'),
(1, 2, 'Atentos al cierre diario para confirmar.'),
(4, 2, 'Coincido, la estructura sigue siendo alcista.'),
(6, 2, 'Yo ya entre en soporte. Veremos.'),
(1, 3, 'ETH tiene fundamentos solidos a largo plazo.'),
(2, 3, 'La actualizacion de red cambiara todo.'),
(3, 4, 'DCA es lo mas sensato en laterales.'),
(5, 4, 'Total acuerdo, la consistencia gana.'),
(7, 4, 'Yo tambien sumo esta semana.'),
(2, 5, 'La dominancia es una metrica clave.'),
(6, 5, 'Rotacion a midcaps parece inminente.'),
(1, 6, 'Bien ejecutado. El riesgo siempre primero.'),
(4, 6, 'Que par operaste si se puede saber?'),
(3, 7, 'El mercado lateral es donde se forja la disciplina.'),
(8, 7, 'Exacto. Los que aguantan son los que ganan.'),
(2, 8, 'Las tasas son el factor dominante ahora mismo.'),
(5, 8, 'Macro manda. Todo lo demas es ruido.'),
(1, 9, 'DeFi bien utilizado es muy potente.'),
(4, 10, 'Esa es la mejor mentalidad posible.'),
(6, 10, 'Me la anoto para mi journal.');

-- Insertando lista_seguimiento
INSERT INTO `lista_seguimiento` (`usuario_id`, `simbolo`) VALUES
(1, 'bitcoin'), (1, 'ethereum'),
(2, 'bitcoin'), (2, 'ethereum'), (2, 'solana'),
(3, 'ethereum'), (3, 'dogecoin'), (3, 'cardano'),
(4, 'bitcoin'), (4, 'ethereum'), (4, 'avalanche'),
(5, 'bitcoin'), (5, 'xrp'), (5, 'polkadot'),
(6, 'ethereum'), (6, 'chainlink'), (6, 'solana'),
(7, 'bitcoin'), (7, 'dogecoin'),
(8, 'bitcoin'), (8, 'ethereum'), (8, 'matic'),
(9, 'ethereum'), (9, 'chainlink'), (9, 'avalanche'),
(10, 'bitcoin');
