import { query } from '../config/db';
import { CareerPathway, CareerPathwayNode } from '../types/careerTypes';

export interface GraphTraversalOptions {
  startNodeId?: number;
  startCode?: string;
  destinationNodeId?: number;
  destinationCode?: string;
  maxDepth?: number;
  limit?: number;
  transitionTypes?: string[];
  reversibility?: string[];
}

export interface TraversalPathResult {
  start_node: {
    id: number;
    code: string;
    title: string;
    node_type: string;
  };
  destination_node?: {
    id: number;
    code: string;
    title: string;
    node_type: string;
  };
  total_pathways: number;
  pathways: Array<{
    pathway_id: string;
    title: string;
    nodes: string[];
    node_ids: number[];
    node_codes: string[];
    depth: number;
    total_duration_months: number;
  }>;
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
 * Generalized Graph Traversal Engine using PostgreSQL recursive CTE
 * Supports starting by node ID or code, optional destination node,
 * configurable depth limits, result limits, and cycle prevention.
 */
export async function traverseGraph(options: GraphTraversalOptions): Promise<TraversalPathResult> {
  // 1. Resolve starting node
  let startNode: any = null;
  if (options.startNodeId !== undefined) {
    if (!Number.isInteger(options.startNodeId) || options.startNodeId <= 0) {
      throw new Error(`Invalid startNodeId: must be a positive integer.`);
    }
    const res = await query(
      `SELECT id, code, title, node_type FROM career_nodes WHERE id = $1`,
      [options.startNodeId]
    );
    if (res.rows.length === 0) {
      throw new Error(`Starting node not found with ID ${options.startNodeId}.`);
    }
    startNode = res.rows[0];
  } else if (options.startCode) {
    const res = await query(
      `SELECT id, code, title, node_type FROM career_nodes WHERE UPPER(code) = UPPER($1)`,
      [options.startCode]
    );
    if (res.rows.length === 0) {
      throw new Error(`Starting node not found with code "${options.startCode}".`);
    }
    startNode = res.rows[0];
  } else {
    throw new Error('Either startNodeId or startCode must be provided for graph traversal.');
  }

  // 2. Resolve optional destination node
  let destNode: any = null;
  if (options.destinationNodeId !== undefined) {
    if (!Number.isInteger(options.destinationNodeId) || options.destinationNodeId <= 0) {
      throw new Error(`Invalid destinationNodeId: must be a positive integer.`);
    }
    const res = await query(
      `SELECT id, code, title, node_type FROM career_nodes WHERE id = $1`,
      [options.destinationNodeId]
    );
    if (res.rows.length === 0) {
      throw new Error(`Destination node not found with ID ${options.destinationNodeId}.`);
    }
    destNode = res.rows[0];
  } else if (options.destinationCode) {
    const res = await query(
      `SELECT id, code, title, node_type FROM career_nodes WHERE UPPER(code) = UPPER($1)`,
      [options.destinationCode]
    );
    if (res.rows.length === 0) {
      throw new Error(`Destination node not found with code "${options.destinationCode}".`);
    }
    destNode = res.rows[0];
  }

  // 3. Configure parameters
  const maxDepth = Math.min(Math.max(Number(options.maxDepth) || 5, 1), 8);
  const limit = Math.min(Math.max(Number(options.limit) || 10, 1), 50);

  // 4. Build SQL with filters
  const queryParams: any[] = [startNode.id, maxDepth, limit];
  let destClause = '';

  if (destNode) {
    queryParams.push(destNode.id);
    destClause = `WHERE to_node_id = $${queryParams.length}`;
  }

  const sql = `
    WITH RECURSIVE pathway_search AS (
      SELECT 
        e.from_node_id,
        fn.code AS from_code,
        fn.title AS from_title,
        fn.node_type AS from_type,
        e.to_node_id,
        tn.code AS to_code,
        tn.title AS to_title,
        tn.node_type AS to_type,
        ARRAY[fn.id, tn.id] AS path_ids,
        ARRAY[fn.title::text, tn.title::text] AS path_titles,
        ARRAY[fn.code::text, tn.code::text] AS path_codes,
        1 AS depth,
        COALESCE(e.min_duration_months, 0) AS total_duration
      FROM career_edges e
      JOIN career_nodes fn ON e.from_node_id = fn.id
      JOIN career_nodes tn ON e.to_node_id = tn.id
      WHERE fn.id = $1 AND e.is_active = true

      UNION ALL

      SELECT 
        e.from_node_id,
        fn.code AS from_code,
        fn.title AS from_title,
        fn.node_type AS from_type,
        e.to_node_id,
        tn.code AS to_code,
        tn.title AS to_title,
        tn.node_type AS to_type,
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
        AND NOT (tn.id = ANY(ps.path_ids))
        AND ps.depth < $2
    )
    SELECT path_titles, path_codes, path_ids, total_duration, depth
    FROM pathway_search
    ${destClause}
    ORDER BY depth ASC, total_duration ASC
    LIMIT $3;
  `;

  const res = await query(sql, queryParams);

  const pathways = res.rows.map((r, idx) => ({
    pathway_id: `pathway_${idx + 1}`,
    title: idx === 0 ? 'Primary Pathway' : `Alternative Pathway ${idx}`,
    nodes: r.path_titles,
    node_ids: r.path_ids,
    node_codes: r.path_codes,
    depth: Number(r.depth),
    total_duration_months: Number(r.total_duration || 0),
  }));

  return {
    start_node: startNode,
    ...(destNode ? { destination_node: destNode } : {}),
    total_pathways: pathways.length,
    pathways,
  };
}

/**
 * Finds all connected pathways from a start node to a target career node using PostgreSQL recursive CTE
 */
export async function findPathwaysForCareer(
  startCode: string,
  targetCareerId: number
): Promise<CareerPathway[]> {
  try {
    const traversal = await traverseGraph({
      startCode,
      destinationNodeId: targetCareerId,
      maxDepth: 5,
      limit: 5,
    });

    if (traversal.pathways.length === 0 && startCode !== 'CLASS_10') {
      // Check fallback from universal CLASS_10 origin
      const fallback = await traverseGraph({
        startCode: 'CLASS_10',
        destinationNodeId: targetCareerId,
        maxDepth: 5,
        limit: 5,
      });

      return fallback.pathways.map((p) => ({
        pathway_id: p.pathway_id,
        title: p.title,
        nodes: p.nodes,
        total_duration_months: p.total_duration_months,
      }));
    }

    return traversal.pathways.map((p) => ({
      pathway_id: p.pathway_id,
      title: p.title,
      nodes: p.nodes,
      total_duration_months: p.total_duration_months,
    }));
  } catch (err) {
    return [];
  }
}
