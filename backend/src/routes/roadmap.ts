import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const roadmapSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['feature', 'bug', 'improvement']).optional(),
  status: z.enum(['backlog', 'planned', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  target_date: z.string().optional(),
});

// List roadmap items (public endpoint for customer-facing roadmap)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const type = req.query.type as string;

    let queryText = `
      SELECT ri.*,
             (SELECT COUNT(*) FROM roadmap_votes WHERE roadmap_item_id = ri.id) as vote_count,
             u.name as created_by_name
      FROM roadmap_items ri
      LEFT JOIN users u ON ri.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND ri.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      queryText += ` AND ri.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    queryText += ` ORDER BY 
      CASE ri.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      vote_count DESC,
      ri.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query('SELECT COUNT(*) FROM roadmap_items');

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Error listing roadmap items:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap items' });
  }
});

// Get single roadmap item
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT ri.*,
              (SELECT COUNT(*) FROM roadmap_votes WHERE roadmap_item_id = ri.id) as vote_count,
              u.name as created_by_name
       FROM roadmap_items ri
       LEFT JOIN users u ON ri.created_by = u.id
       WHERE ri.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap item not found' });
    }

    // Get linked tickets
    const linkedTickets = await query(
      `SELECT t.*, c.name as contact_name
       FROM tickets t
       JOIN ticket_roadmap_links trl ON t.id = trl.ticket_id
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE trl.roadmap_item_id = $1`,
      [req.params.id]
    );

    // Get voters (if authenticated)
    let voters = [];
    if (req.isAuthenticated()) {
      const votersResult = await query(
        `SELECT c.name, c.email, o.name as organization_name, rv.created_at
         FROM roadmap_votes rv
         LEFT JOIN contacts c ON rv.contact_id = c.id
         LEFT JOIN organizations o ON rv.organization_id = o.id
         WHERE rv.roadmap_item_id = $1
         ORDER BY rv.created_at DESC`,
        [req.params.id]
      );
      voters = votersResult.rows;
    }

    res.json({
      ...result.rows[0],
      linked_tickets: linkedTickets.rows,
      voters,
    });
  } catch (error) {
    console.error('Error fetching roadmap item:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap item' });
  }
});

// Create roadmap item (authenticated users only)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = roadmapSchema.parse(req.body);

    const result = await query(
      `INSERT INTO roadmap_items (title, description, type, status, priority, target_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.type || 'feature',
        data.status || 'backlog',
        data.priority || 'medium',
        data.target_date || null,
        req.user!.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating roadmap item:', error);
    res.status(500).json({ error: 'Failed to create roadmap item' });
  }
});

// Update roadmap item
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = roadmapSchema.partial().parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Handle completed_at timestamp
    if (req.body.status === 'completed') {
      updates.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE roadmap_items SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roadmap item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating roadmap item:', error);
    res.status(500).json({ error: 'Failed to update roadmap item' });
  }
});

// Vote for roadmap item
router.post('/:id/vote', async (req: AuthRequest, res) => {
  try {
    const { contact_id, organization_id } = req.body;

    if (!contact_id && !organization_id) {
      return res.status(400).json({ error: 'Either contact_id or organization_id is required' });
    }

    const result = await query(
      `INSERT INTO roadmap_votes (roadmap_item_id, contact_id, organization_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (roadmap_item_id, contact_id) DO NOTHING
       RETURNING *`,
      [req.params.id, contact_id || null, organization_id || null]
    );

    res.status(201).json(result.rows[0] || { message: 'Vote already exists' });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Remove vote
router.delete('/:id/vote', async (req: AuthRequest, res) => {
  try {
    const { contact_id } = req.body;

    if (!contact_id) {
      return res.status(400).json({ error: 'contact_id is required' });
    }

    const result = await query(
      'DELETE FROM roadmap_votes WHERE roadmap_item_id = $1 AND contact_id = $2 RETURNING *',
      [req.params.id, contact_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
});

export default router;
