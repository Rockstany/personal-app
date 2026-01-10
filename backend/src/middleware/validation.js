// Input validation middleware
// Provides reusable validation functions for API endpoints

export const validateHabitInput = (req, res, next) => {
  const { name, target_type, category } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Habit name is required' });
  }

  if (name.length > 100) {
    return res.status(400).json({ error: 'Habit name must be less than 100 characters' });
  }

  if (!target_type || !['duration_90', 'numeric'].includes(target_type)) {
    return res.status(400).json({ error: 'Invalid target type. Must be "duration_90" or "numeric"' });
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json({ error: 'Category is required' });
  }

  if (target_type === 'numeric') {
    const { target_value } = req.body;
    if (!target_value || isNaN(target_value) || target_value <= 0) {
      return res.status(400).json({ error: 'Valid target value is required for numeric habits' });
    }
  }

  next();
};

export const validateTaskInput = (req, res, next) => {
  const { name, deadline } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  if (name.length > 200) {
    return res.status(400).json({ error: 'Task name must be less than 200 characters' });
  }

  if (!deadline) {
    return res.status(400).json({ error: 'Deadline is required' });
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return res.status(400).json({ error: 'Invalid deadline date format' });
  }

  next();
};

export const validateAccountInput = (req, res, next) => {
  const { account_name, account_type } = req.body;

  if (!account_name || typeof account_name !== 'string' || account_name.trim().length === 0) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  if (account_name.length > 100) {
    return res.status(400).json({ error: 'Account name must be less than 100 characters' });
  }

  const validAccountTypes = ['cash', 'bank', 'credit_card', 'wallet', 'investment', 'business', 'crypto'];
  if (!account_type || !validAccountTypes.includes(account_type)) {
    return res.status(400).json({ error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}` });
  }

  const { balance, credit_limit } = req.body;
  if (balance !== undefined && (isNaN(balance) || balance < 0)) {
    return res.status(400).json({ error: 'Balance must be a positive number' });
  }

  if (credit_limit !== undefined && credit_limit !== null && credit_limit !== '' && (isNaN(credit_limit) || credit_limit < 0)) {
    return res.status(400).json({ error: 'Credit limit must be a positive number' });
  }

  next();
};

export const validateTransactionInput = (req, res, next) => {
  const { account_id, category_id, type, amount, transaction_date } = req.body;

  if (!account_id || isNaN(account_id)) {
    return res.status(400).json({ error: 'Valid account ID is required' });
  }

  if (!category_id || isNaN(category_id)) {
    return res.status(400).json({ error: 'Valid category ID is required' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Transaction type must be "income" or "expense"' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount greater than 0 is required' });
  }

  if (!transaction_date) {
    return res.status(400).json({ error: 'Transaction date is required' });
  }

  const dateCheck = new Date(transaction_date);
  if (isNaN(dateCheck.getTime())) {
    return res.status(400).json({ error: 'Invalid transaction date format' });
  }

  next();
};

export const validateCategoryInput = (req, res, next) => {
  const { name, type } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  if (name.length > 100) {
    return res.status(400).json({ error: 'Category name must be less than 100 characters' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Category type must be "income" or "expense"' });
  }

  next();
};

export const validateRecurringInput = (req, res, next) => {
  const { account_id, category_id, type, amount, frequency, start_date } = req.body;

  if (!account_id || isNaN(account_id)) {
    return res.status(400).json({ error: 'Valid account ID is required' });
  }

  if (!category_id || isNaN(category_id)) {
    return res.status(400).json({ error: 'Valid category ID is required' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Transaction type must be "income" or "expense"' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount greater than 0 is required' });
  }

  const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly', 'custom'];
  if (!frequency || !validFrequencies.includes(frequency)) {
    return res.status(400).json({ error: `Frequency must be one of: ${validFrequencies.join(', ')}` });
  }

  if (!start_date) {
    return res.status(400).json({ error: 'Start date is required' });
  }

  const dateCheck = new Date(start_date);
  if (isNaN(dateCheck.getTime())) {
    return res.status(400).json({ error: 'Invalid start date format' });
  }

  next();
};

// Sanitize string inputs to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent script tags
    .substring(0, 1000); // Limit length
};

// Validate ID parameter
export const validateIdParam = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  req.params.id = id;
  next();
};
