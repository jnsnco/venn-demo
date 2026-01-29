import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  organization_id: z.number().optional(),
  lifecycle_stage: z.enum(['lead', 'prospect', 'customer', 'churned']).optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

// List contacts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let queryText = `
      SELECT c.*, o.name as organization_name,
             (SELECT COUNT(*) FROM tickets WHERE contact_id = c.id) as ticket_count
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
    `;
    const params: any[] = [];

    if (search) {
      queryText += ` WHERE c.name ILIKE $1 OR c.email ILIKE $1`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query('SELECT COUNT(*) FROM contacts');

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Error listing contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT c.*, o.name as organization_name
       FROM contacts c
       LEFT JOIN organizations o ON c.organization_id = o.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get recent activities
    const activities = await query(
      'SELECT * FROM activities WHERE contact_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );

    // Get open tickets
    const tickets = await query(
      'SELECT * FROM tickets WHERE contact_id = $1 AND status != $2 ORDER BY created_at DESC',
      [req.params.id, 'closed']
    );

    res.json({
      ...result.rows[0],
      activities: activities.rows,
      open_tickets: tickets.rows,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create contact
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = contactSchema.parse(req.body);

    const result = await query(
      `INSERT INTO contacts (name, email, phone, title, organization_id, lifecycle_stage, tags, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.name,
        data.email || null,
        data.phone || null,
        data.title || null,
        data.organization_id || null,
        data.lifecycle_stage || 'lead',
        JSON.stringify(data.tags || []),
        JSON.stringify(data.custom_fields || {}),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const data = contactSchema.partial().parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tags' || key === 'custom_fields') {
        updates.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE contacts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query('DELETE FROM contacts WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
