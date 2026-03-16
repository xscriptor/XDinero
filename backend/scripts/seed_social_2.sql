-- Seed masivo y realista para XDinero
-- Uso exclusivo de base de datos. No modifica frontend ni backend funcional.
-- INSTRUCCIONES DE USO
--
-- Opcion A) Ejecutar desde terminal (contenedor MySQL en Docker Compose)
-- 1) En la raíz
-- 2) Ejecutar:
--    docker compose exec -T db mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < backend/scripts/seed_social.sql
--
-- Opcion B) Ejecutar desde phpMyAdmin
-- 1) Abre phpMyAdmin en http://localhost:8081
-- 2) entrar como root.
-- 3) Selecciona la base xdinero_db (o la definida en MYSQL_DATABASE).
-- 4) entrar en la pestaña Importar.
-- 5) subir este archivo: backend/scripts/seed_social.sql
-- 6) Formato SQL y dar click en Continuar.

USE xdinero_db;

START TRANSACTION;


-- 1) Garantizar usuario admin y limpiar datos semilla previos

INSERT INTO usuarios (nombre_usuario, correo, contrasena, rol, avatar, biografia)
VALUES (
  'admin',
  'admin@xdinero.com',
  '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy',
  'admin',
  'https://i.pravatar.cc/300?img=1',
  'Administrador del sistema'
)
ON DUPLICATE KEY UPDATE id = id;

DELETE FROM usuarios WHERE correo LIKE '%@seed.xdinero.local';

SELECT id INTO @admin_id
FROM usuarios
WHERE nombre_usuario = 'admin'
ORDER BY id
LIMIT 1;


-- 2) Usuarios ficticios (80)

INSERT INTO usuarios (nombre_usuario, correo, contrasena, rol, avatar, biografia, fecha_creacion)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 80
)
SELECT
  CONCAT('usuario_', LPAD(n, 3, '0')) AS nombre_usuario,
  CONCAT('usuario_', LPAD(n, 3, '0'), '@seed.xdinero.local') AS correo,
  '$2y$12$tbpWyXxWvKOLpnoozWCTT.52k6i2q6AtOxM/41Xt9h7n4Fxy3.apy' AS contrasena,
  'usuario' AS rol,
  CONCAT('https://i.pravatar.cc/300?img=', 1 + MOD(n, 70)) AS avatar,
  CONCAT(
    ELT(1 + MOD(n, 15),
      'Analista de cripto y mercados.',
      'Inversion de largo plazo y DCA.',
      'Aprendiendo trading cuantitativo.',
      'Fan de Bitcoin y gestion de riesgo.',
      'Sigo tendencias macro y on-chain.',
      'Me interesan altcoins con utilidad.',
      'Educacion financiera para todos.',
      'Construyendo disciplina y paciencia.',
      'Portafolio diversificado y estable.',
      'Tecnologia blockchain y comunidad.',
      'Aqui para aprender y compartir.',
      'Perfil de inversor conservador.',
      'Swing trader con enfoque tecnico.',
      'Cripto, macro y geopolitica.',
      'Hodler convencido desde 2020.'
    ),
    ' Perfil #', LPAD(n, 3, '0')
  ) AS biografia,
  DATE_SUB(NOW(), INTERVAL (2 + MOD(n * 13, 365)) DAY) AS fecha_creacion
FROM seq;


-- 3) Seguidores: todos siguen al admin + red densa entre usuarios

INSERT IGNORE INTO seguidores (seguidor_id, seguido_id)
SELECT u.id, @admin_id
FROM usuarios u
WHERE u.id <> @admin_id;

INSERT IGNORE INTO seguidores (seguidor_id, seguido_id)
SELECT a.id, b.id
FROM usuarios a
JOIN usuarios b ON a.id <> b.id
WHERE a.correo LIKE '%@seed.xdinero.local'
  AND b.correo LIKE '%@seed.xdinero.local'
  AND (
    MOD(a.id * 7 + b.id * 11, 5) = 0
    OR MOD(a.id * 3 + b.id * 5,  7) = 1
    OR MOD(a.id * 2 + b.id * 9, 11) = 2
  );


-- 4) Tablas temporales de apoyo (textos y simbolos)

DROP TEMPORARY TABLE IF EXISTS tmp_textos_post;
CREATE TEMPORARY TABLE tmp_textos_post (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contenido TEXT NOT NULL
);

INSERT INTO tmp_textos_post (contenido) VALUES
('Hoy ajuste mi estrategia: menos apalancamiento y mas paciencia.'),
('Semaforo de riesgo en amarillo; priorizo gestion de capital.'),
('BTC mantiene estructura alcista en temporalidad diaria.'),
('ETH sigue fuerte en volumen relativo frente al mercado.'),
('Voy a sostener compras periodicas esta semana.'),
('Acabo de cerrar una posicion con +4.2% de rendimiento.'),
('Mercado lateral: ideal para estudiar y no sobreoperar.'),
('Revisen niveles de soporte antes de tomar decisiones.'),
('Macro y tasas siguen marcando el ritmo de riesgo.'),
('La clave no es adivinar, es gestionar probabilidades.'),
('Aprendi que respetar el stop es mas importante que acertar.'),
('Sigo acumulando en retrocesos y evitando FOMO.'),
('Interes abierto subiendo, ojo con volatilidad repentina.'),
('Portafolio balanceado: BTC, ETH y caja para oportunidades.'),
('No es consejo financiero, solo comparto mi plan.'),
('DCA activo y seguimiento semanal de objetivos.'),
('Mejor operacion del mes: no operar por impulso.'),
('Atentos al cierre semanal, puede definir tendencia.'),
('Anote todas mis entradas en el journal de trading.'),
('Prefiero consistencia en 6 meses que euforia en 2 dias.'),
('La volatilidad es una oportunidad para quien esta preparado.'),
('Reducir posicion antes de noticias macro importantes.'),
('Soporte clave: si lo pierde, pausa en nuevas entradas.'),
('El mercado siempre tiene razon, ajusta tu tesis.'),
('Hoy toca revision de portafolio y rebalanceo mensual.'),
('Stop loss ajustado. No improviso en momentos de panico.'),
('Seguimiento de dominancia BTC para detectar rotaciones.'),
('Liquidez en caja: la mejor cobertura ante incertidumbre.'),
('Ciclo de halving ya en precio? No lo creo, espero mas.'),
('On-chain muestra acumulacion silenciosa de grandes carteras.');

DROP TEMPORARY TABLE IF EXISTS tmp_textos_comentario;
CREATE TEMPORARY TABLE tmp_textos_comentario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contenido VARCHAR(255) NOT NULL
);

INSERT INTO tmp_textos_comentario (contenido) VALUES
('Excelente punto, gracias por compartir.'),
('Coincido con ese enfoque de riesgo.'),
('Buen analisis, voy a revisarlo en detalle.'),
('Interesante lectura del mercado.'),
('Me gusto como lo explicaste.'),
('Tiene sentido, sobre todo por la volatilidad.'),
('Muy util para quienes empezamos.'),
('Buen dato, lo anoto para mi plan.'),
('Gracias, me ayudo a ordenar ideas.'),
('Aporto: vigilar liquidez tambien ayuda.'),
('Totalmente de acuerdo con el enfoque de largo plazo.'),
('Justo hoy estaba pensando lo mismo.'),
('Guardado, lo comparto con mi grupo de estudio.'),
('Dato clave que mucha gente ignora.'),
('Este tipo de publicaciones hacen crecer la comunidad.');

DROP TEMPORARY TABLE IF EXISTS tmp_simbolos;
CREATE TEMPORARY TABLE tmp_simbolos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  simbolo VARCHAR(50) NOT NULL
);

INSERT INTO tmp_simbolos (simbolo) VALUES
('bitcoin'),
('ethereum'),
('solana'),
('cardano'),
('xrp'),
('dogecoin'),
('chainlink'),
('polkadot'),
('avalanche'),
('matic');

SELECT COUNT(*) INTO @cnt_textos_post FROM tmp_textos_post;
SELECT COUNT(*) INTO @cnt_textos_comentario FROM tmp_textos_comentario;


-- 5) Publicaciones de texto (12 por usuario seed, sin imagenes)

INSERT INTO publicaciones (usuario_id, contenido, url_imagen, fecha_creacion)
WITH RECURSIVE reps AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM reps WHERE n < 12
)
SELECT
  u.id AS usuario_id,
  CONCAT(
    t.contenido,
    ' #', ELT(1 + MOD(u.id + reps.n, 8), 'BTC', 'ETH', 'Riesgo', 'Trading', 'DCA', 'Macro', 'Portfolio', 'Disciplina')
  ) AS contenido,
  NULL AS url_imagen,
  DATE_SUB(NOW(), INTERVAL MOD(u.id * 17 + reps.n * 31, 2160) HOUR) AS fecha_creacion
FROM usuarios u
JOIN reps
JOIN tmp_textos_post t
  ON t.id = 1 + MOD(u.id + reps.n, @cnt_textos_post)
WHERE u.correo LIKE '%@seed.xdinero.local';


-- 6) Reposts (sin imagen)

INSERT INTO publicaciones (usuario_id, contenido, url_imagen, publicacion_original_id, fecha_creacion)
SELECT
  u.id,
  'Comparto esta publicacion porque aporta contexto util para la semana.',
  NULL,
  p.id,
  DATE_ADD(p.fecha_creacion, INTERVAL MOD(u.id + p.id, 90) MINUTE)
FROM usuarios u
JOIN publicaciones p ON p.usuario_id <> u.id
WHERE u.correo LIKE '%@seed.xdinero.local'
  AND MOD(u.id * 5 + p.id * 7, 20) = 0;


-- 7) Likes (densos)

INSERT IGNORE INTO me_gusta (usuario_id, publicacion_id, fecha_creacion)
SELECT
  u.id,
  p.id,
  DATE_ADD(p.fecha_creacion, INTERVAL MOD(u.id + p.id, 240) MINUTE)
FROM usuarios u
JOIN publicaciones p ON p.usuario_id <> u.id
WHERE (u.correo LIKE '%@seed.xdinero.local' OR u.id = @admin_id)
  AND MOD(u.id * 11 + p.id * 3, 7) = 0;


-- 8) Comentarios (densos)

INSERT INTO comentarios (usuario_id, publicacion_id, contenido, fecha_creacion)
SELECT
  u.id,
  p.id,
  c.contenido,
  DATE_ADD(p.fecha_creacion, INTERVAL MOD(u.id * 3 + p.id * 5, 360) MINUTE)
FROM usuarios u
JOIN publicaciones p ON p.usuario_id <> u.id
JOIN tmp_textos_comentario c
  ON c.id = 1 + MOD(u.id + p.id, @cnt_textos_comentario)
WHERE (u.correo LIKE '%@seed.xdinero.local' OR u.id = @admin_id)
  AND MOD(u.id * 2 + p.id * 7, 11) = 0;


-- 9) Lista de seguimiento

INSERT INTO lista_seguimiento (usuario_id, simbolo)
SELECT u.id, s.simbolo
FROM usuarios u
JOIN tmp_simbolos s
WHERE (u.correo LIKE '%@seed.xdinero.local' OR u.id = @admin_id)
  AND MOD(u.id + s.id, 3) = 0
  AND NOT EXISTS (
    SELECT 1
    FROM lista_seguimiento ls
    WHERE ls.usuario_id = u.id
      AND ls.simbolo = s.simbolo
  );

COMMIT;

-- Resumen rapido post-seed
SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM usuarios
UNION ALL
SELECT 'publicaciones', COUNT(*) FROM publicaciones
UNION ALL
SELECT 'seguidores', COUNT(*) FROM seguidores
UNION ALL
SELECT 'me_gusta', COUNT(*) FROM me_gusta
UNION ALL
SELECT 'comentarios', COUNT(*) FROM comentarios
UNION ALL
SELECT 'lista_seguimiento', COUNT(*) FROM lista_seguimiento;
