import { Router, Request } from 'express';
import { query } from '../config/database';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(requireAuth);

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['admin', 'agent', 'user']).optional(),
});

// List all users (admin only)
router.get('/', requireAdmin, async (req: Request, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    // Get users
    const result = await query(
      `SELECT id, email, name, avatar, role, oauth_provider, created_at, updated_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Get specific user (admin only)
router.get('/:id', requireAdmin, async (req: Request, res) => {
  try {
    const result = await query(
      `SELECT id, email, name, avatar, role, oauth_provider, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user (admin only)
router.patch('/:id', requireAdmin, async (req: Request, res) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const userId = parseInt(req.params.id);

    // Don't allow users to remove all admins
    if (data.role && data.role !== 'admin') {
      const adminCount = await query(
        `SELECT COUNT(*) FROM users WHERE role = 'admin' AND id != $1`,
        [userId]
      );

      if (parseInt(adminCount.rows[0].count) === 0) {
        return res.status(400).json({ 
          error: 'Cannot remove the last admin user' 
        });
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(data.role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, name, avatar, role, oauth_provider, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, async (req: Request, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Don't allow deleting yourself
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Don't allow deleting the last admin
    const user = await query('SELECT role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.rows[0].role === 'admin') {
      const adminCount = await query(
        'SELECT COUNT(*) FROM users WHERE role = \'admin\' AND id != $1',
        [userId]
      );

      if (parseInt(adminCount.rows[0].count) === 0) {
        return res.status(400).json({ 
          error: 'Cannot delete the last admin user' 
        });
      }
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
