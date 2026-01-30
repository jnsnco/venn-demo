import { Router } from 'express';
import { Request } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const ticketSchema = z.object({
  subject: z.string().min(1),
  contact_id: z.number(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  channel: z.enum(['email', 'chat', 'phone', 'web']).optional(),
  body: z.string().optional(),
});

const messageSchema = z.object({
  body: z.string().min(1),
  is_internal: z.boolean().optional(),
});

// List tickets
router.get('/', async (req: Request, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let queryText = `
      SELECT t.*, c.name as contact_name, c.email as contact_email,
             u.name as assigned_to_name,
             (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM tickets t
      LEFT JOIN contacts c ON t.contact_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
    `;
    const params: any[] = [];

    if (status && ['open', 'pending', 'resolved', 'closed'].includes(status)) {
      queryText += ` WHERE t.status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY 
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query('SELECT COUNT(*) FROM tickets');

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', async (req: Request, res) => {
  try {
    const ticketResult = await query(
      `SELECT t.*, c.name as contact_name, c.email as contact_email,
              u.name as assigned_to_name
       FROM tickets t
       LEFT JOIN contacts c ON t.contact_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get messages
    const messages = await query(
      `SELECT tm.*, u.name as user_name, c.name as contact_name
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.user_id = u.id
       LEFT JOIN contacts c ON tm.contact_id = c.id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [req.params.id]
    );

    // Get linked roadmap items
    const linkedItems = await query(
      `SELECT ri.* FROM roadmap_items ri
       JOIN ticket_roadmap_links trl ON ri.id = trl.roadmap_item_id
       WHERE trl.ticket_id = $1`,
      [req.params.id]
    );

    res.json({
      ...ticketResult.rows[0],
      messages: messages.rows,
      linked_roadmap_items: linkedItems.rows,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create ticket
router.post('/', async (req: Request, res) => {
  try {
    const data = ticketSchema.parse(req.body);

    const result = await query(
      `INSERT INTO tickets (subject, contact_id, priority, channel, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.subject, data.contact_id, data.priority || 'medium', data.channel || 'web', 'open']
    );

    const ticket = result.rows[0];

    // Add initial message if body provided
    if (data.body) {
      await query(
        `INSERT INTO ticket_messages (ticket_id, contact_id, body, is_internal)
         VALUES ($1, $2, $3, $4)`,
        [ticket.id, data.contact_id, data.body, false]
      );
    }

    res.status(201).json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.patch('/:id', async (req: Request, res) => {
  try {
    const allowedFields = ['subject', 'status', 'priority', 'assigned_to'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Handle resolved_at timestamp
    if (req.body.status === 'resolved' || req.body.status === 'closed') {
      updates.push(`resolved_at = CURRENT_TIMESTAMP`);
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE tickets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Add message to ticket
router.post('/:id/messages', async (req: Request, res) => {
  try {
    const data = messageSchema.parse(req.body);

    const result = await query(
      `INSERT INTO ticket_messages (ticket_id, user_id, body, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user!.id, data.body, data.is_internal || false]
    );

    // Update ticket's updated_at
    await query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Link ticket to roadmap item
router.post('/:id/roadmap-links', async (req: Request, res) => {
  try {
    const { roadmap_item_id } = req.body;

    if (!roadmap_item_id) {
      return res.status(400).json({ error: 'roadmap_item_id is required' });
    }

    const result = await query(
      `INSERT INTO ticket_roadmap_links (ticket_id, roadmap_item_id)
       VALUES ($1, $2)
       ON CONFLICT (ticket_id, roadmap_item_id) DO NOTHING
       RETURNING *`,
      [req.params.id, roadmap_item_id]
    );

    res.status(201).json(result.rows[0] || { message: 'Link already exists' });
  } catch (error) {
    console.error('Error linking to roadmap:', error);
    res.status(500).json({ error: 'Failed to link to roadmap item' });
  }
});

export default router;
