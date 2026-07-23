const Customer = require('../models/Customer');
const aiService = require('../services/aiService');

// Helper to flatten a customer's notes array into a single text blob for the AI
const getNotesText = (customer) => {
  if (!customer.notes || customer.notes.length === 0) return '';
  return customer.notes.map((n) => n.text).join('. ');
};

// @desc    Generate AI summary of a customer's notes
// @route   POST /api/ai/summarize/:id
// @access  Private
const summarizeNotes = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const notesText = getNotesText(customer);
    if (!notesText) {
      return res.status(400).json({ success: false, message: 'This customer has no notes to summarize' });
    }

    const summary = await aiService.generateSummary(notesText);
    customer.aiSummary = summary;
    await customer.save();

    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI follow-up recommendation
// @route   POST /api/ai/follow-up/:id
// @access  Private
const suggestFollowUp = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const notesText = getNotesText(customer);
    if (!notesText) {
      return res.status(400).json({ success: false, message: 'This customer has no notes to analyze' });
    }

    const followUp = await aiService.generateFollowUp(notesText, customer.status);
    customer.aiFollowUp = followUp;
    await customer.save();

    res.json({ success: true, data: { followUp } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI sentiment analysis
// @route   POST /api/ai/sentiment/:id
// @access  Private
const analyzeSentiment = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const notesText = getNotesText(customer);
    if (!notesText) {
      return res.status(400).json({ success: false, message: 'This customer has no notes to analyze' });
    }

    const sentiment = await aiService.analyzeSentiment(notesText);
    customer.aiSentiment = sentiment;
    await customer.save();

    res.json({ success: true, data: sentiment });
  } catch (error) {
    next(error);
  }
};

module.exports = { summarizeNotes, suggestFollowUp, analyzeSentiment };
