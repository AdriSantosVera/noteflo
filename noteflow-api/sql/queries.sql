-- Consulta resumen de notas con checklist items y tags.
-- Se usa LEFT JOIN para no perder notas que todavía no tengan
-- ni items de checklist ni etiquetas.
SELECT
  n.id,
  n.user_id,
  n.title,
  n.type,
  n.content,
  n.color,
  n.start_date,
  n.end_date,
  n.created_at,
  n.updated_at,
  -- Agrupa los items relacionados en un array JSON.
  -- FILTER evita añadir una fila vacía cuando la nota no tiene items.
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', ci.id,
        'text', ci.text,
        'isCompleted', ci.is_completed,
        'createdAt', ci.created_at,
        'updatedAt', ci.updated_at
      )
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) AS checklist_items,
  -- Agrupa las etiquetas en otro array JSON.
  -- DISTINCT evita etiquetas repetidas si la consulta cruza varias filas.
  COALESCE(
    json_agg(DISTINCT nt.tag) FILTER (WHERE nt.id IS NOT NULL),
    '[]'::json
  ) AS tags
FROM notes AS n
LEFT JOIN checklist_items AS ci
  ON ci.note_id = n.id
LEFT JOIN note_tags AS nt
  ON nt.note_id = n.id
GROUP BY n.id
ORDER BY n.created_at DESC;
