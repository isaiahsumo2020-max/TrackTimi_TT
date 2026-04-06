const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Feedback = require('../models/Feedback');

// POST create feedback
router.post('/', (req, res) => {
  console.log('📨 Feedback POST request received');
  console.log('📨 User object:', req.user);
  console.log('📨 Request body:', req.body);
  
  try {
    // Validate authentication
    if (!req.user) {
      console.error('❌ No req.user - authentication middleware may not be working');
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'User context not found in request'
      });
    }
    
    // Extract data
    const { title, message, category, rating } = req.body;
    const userId = req.user.userId || req.user.User_ID;
    const orgId = req.user.orgId || req.user.Org_ID;
    
    console.log('📨 Extracted values:', { title, message, category, rating, userId, orgId });
    
    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: 'Title and message are required'
      });
    }
    
    if (!userId || !orgId) {
      console.error('❌ Missing userId or orgId:', { userId, orgId });
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'User or organization information missing'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Message cannot exceed 500 characters'
      });
    }
    
    console.log('✅ All validations passed, creating feedback...');
    
    // Create feedback in database
    Feedback.create({
      userId,
      orgId,
      title,
      message,
      category: category || 'general',
      rating: Math.min(Math.max(rating || 5, 1), 5)
    }, (err, feedback) => {
      if (err) {
        console.error('❌ Database error creating feedback:');
        console.error('   Error Message:', err.message);
        console.error('   Error Code:', err.code);
        console.error('   Full Error:', err);
        
        return res.status(500).json({ 
          error: 'Database error',
          details: err.message,
          code: err.code
        });
      }
      
      console.log('✅ Feedback created successfully');
      console.log('   Feedback ID:', feedback.Feedback_ID);
      console.log('   User ID:', feedback.userId);
      console.log('   Org ID:', feedback.orgId);
      
      res.status(201).json({ 
        success: true, 
        feedback,
        message: 'Feedback submitted successfully'
      });
    });
  } catch (err) {
    console.error('❌ Unexpected error in feedback POST handler:');
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
    
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
});

// GET all feedback for organization
router.get('/', (req, res) => {
  const orgId = req.user.orgId || req.user.Org_ID;
  const limit = req.query.limit || 50;
  
  Feedback.findByOrgId(orgId, parseInt(limit), (err, feedback) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    
    // Get stats
    Feedback.getStats(orgId, (statsErr, stats) => {
      res.json({ 
        feedback,
        stats: stats || { total: 0, pending: 0, responded: 0, avg_rating: 0 }
      });
    });
  });
});

// GET feedback by category
router.get('/category/:category', (req, res) => {
  const orgId = req.user.orgId || req.user.Org_ID;
  const category = req.params.category;
  
  Feedback.findByCategory(orgId, category, (err, feedback) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    res.json({ feedback });
  });
});

// GET feedback by status
router.get('/status/:status', (req, res) => {
  const orgId = req.user.orgId || req.user.Org_ID;
  const status = req.params.status;
  
  Feedback.findByStatus(orgId, status, (err, feedback) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    res.json({ feedback });
  });
});

// GET single feedback
router.get('/:feedbackId', (req, res) => {
  const feedbackId = req.params.feedbackId;
  
  Feedback.findById(feedbackId, (err, feedback) => {
    if (err || !feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ feedback });
  });
});

// PUT respond to feedback (admin only)
router.put('/:feedbackId/respond', (req, res) => {
  const feedbackId = req.params.feedbackId;
  const { response } = req.body;
  const respondedBy = req.user.userId || req.user.User_ID;
  
  if (!response) {
    return res.status(400).json({ error: 'Response is required' });
  }
  
  Feedback.respond(feedbackId, response, respondedBy, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to respond to feedback' });
    }
    res.json({ success: true, message: 'Feedback response added' });
  });
});

// PUT update feedback status
router.put('/:feedbackId/status', (req, res) => {
  const feedbackId = req.params.feedbackId;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'responded', 'acknowledged', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  Feedback.updateStatus(feedbackId, status, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update feedback status' });
    }
    res.json({ success: true, message: 'Feedback status updated' });
  });
});

// DELETE feedback
router.delete('/:feedbackId', (req, res) => {
  const feedbackId = req.params.feedbackId;
  
  Feedback.delete(feedbackId, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete feedback' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ success: true, message: 'Feedback deleted' });
  });
});

module.exports = router;
