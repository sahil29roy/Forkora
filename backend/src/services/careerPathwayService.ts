import { query } from '../config/db';
import { CareerPathway, CareerPathwayNode } from '../types/careerTypes';

interface GraphEdgeRow {
  from_id: number;
  from_code: string;
  from_title: string;
  from_type: string;
  from_level: string;
  to_id: number;
  to_code: string;
  to_title: string;
  to_type: string;
  to_level: string;
  transition_type: string;
  reversibility: string;
  min_duration_months: number;
}

/**
 * Maps student current stage to starting node code in the career graph
 */
export function getStartNodeCode(currentClass: number, stream: string | null): string {
  if (currentClass <= 10) {
    return 'CLASS_10';
  }

  // For Class 11 & 12, start from their enrolled stream
  const s = (stream || '').toUpperCase();
  if (s.includes('PCMB')) return 'STREAM_SCIENCE_PCMB';
  if (s.includes('PCB')) return 'STREAM_SCIENCE_PCB';
  if (s.includes('PCM') || s.includes('SCIENCE')) return 'STREAM_SCIENCE_PCM';
  if (s.includes('COMMERCE') && s.includes('WITHOUT')) return 'STREAM_COMMERCE_NO_MATH';
  if (s.includes('COMMERCE')) return 'STREAM_COMMERCE_MATH';
  if (s.includes('HUMANITIES') || s.includes('ARTS')) return 'STREAM_HUMANITIES';

  return 'CLASS_10';
}

/**
 * Finds all connected pathways from a start node to a target career node using PostgreSQL recursive CTE
 */
export async function findPathwaysForCareer(
  startCode: string,
  targetCareerId: number
): Promise<CareerPathway[]> {
  // Query recursive pathways using PostgreSQL CTE
  const sql = `
    WITH RECURSIVE pathway_search AS (
      -- Base Case: Edges starting from startCode node
      SELECT 
        e.from_node_id,
        fn.code AS from_code,
        fn.title AS from_title,
        fn.node_type AS from_type,
        fn.education_level AS from_level,
        e.to_node_id,
        tn.code AS to_code,
        tn.title AS to_title,
        tn.node_type AS to_type,
        tn.education_level AS to_level,
        ARRAY[fn.id, tn.id] AS path_ids,
        ARRAY[fn.title::text, tn.title::text] AS path_titles,
        ARRAY[fn.code::text, tn.code::text] AS path_codes,
        1 AS depth,
        COALESCE(e.min_duration_months, 0) AS total_duration
      FROM career_edges e
      JOIN career_nodes fn ON e.from_node_id = fn.id
      JOIN career_nodes tn ON e.to_node_id = tn.id
      WHERE fn.code = $1 AND e.is_active = true

      UNION ALL

      -- Recursive Step: Traverse next edges
      SELECT 
        e.from_node_id,
        fn.code AS from_code,
        fn.title AS from_title,
        fn.node_type AS from_type,
        fn.education_level AS from_level,
        e.to_node_id,
        tn.code AS to_code,
        tn.title AS to_title,
        tn.node_type AS to_type,
        tn.education_level AS to_level,
        ps.path_ids || tn.id,
        ps.path_titles || tn.title::text,
        ps.path_codes || tn.code::text,
        ps.depth + 1,
        ps.total_duration + COALESCE(e.min_duration_months, 0)
      FROM career_edges e
      JOIN pathway_search ps ON e.from_node_id = ps.to_node_id
      JOIN career_nodes fn ON e.from_node_id = fn.id
      JOIN career_nodes tn ON e.to_node_id = tn.id
      WHERE e.is_active = true
        AND NOT (tn.id = ANY(ps.path_ids)) -- Prevent cycles
        AND ps.depth < 6                   -- Safety depth limit
    )
    SELECT path_titles, path_codes, path_ids, total_duration, depth
    FROM pathway_search
    WHERE to_node_id = $2
    ORDER BY depth ASC, total_duration ASC
    LIMIT 5;
  `;

  const res = await query(sql, [startCode, targetCareerId]);

  if (res.rows.length === 0) {
    // If no direct pathway found from specific stream (e.g. Class 12 Commerce to Doctor),
    // check if universal pathway exists from Class 10
    if (startCode !== 'CLASS_10') {
      const fallbackRes = await query(sql, ['CLASS_10', targetCareerId]);
      return formatPathwayRows(fallbackRes.rows);
    }
    return [];
  }

  return formatPathwayRows(res.rows);
}

function formatPathwayRows(rows: any[]): CareerPathway[] {
  return rows.map((r, idx) => ({
    pathway_id: `pathway_${idx + 1}`,
    title: idx === 0 ? 'Primary Pathway' : `Alternative Pathway ${idx}`,
    nodes: r.path_titles,
    total_duration_months: Number(r.total_duration || 0),
  }));
}
