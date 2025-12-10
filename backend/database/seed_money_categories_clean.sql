USE habit_tracker;

INSERT INTO money_categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Salary', 'income', '💼', '#4CAF50', TRUE),
(NULL, 'Freelance', 'income', '💵', '#8BC34A', TRUE),
(NULL, 'Gift', 'income', '🎁', '#CDDC39', TRUE),
(NULL, 'Investment Returns', 'income', '📈', '#00BCD4', TRUE),
(NULL, 'Business', 'income', '🏪', '#009688', TRUE),
(NULL, 'Refund', 'income', '💸', '#4DB6AC', TRUE),
(NULL, 'Other Income', 'income', '🎯', '#26A69A', TRUE);

INSERT INTO money_categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Food & Dining', 'expense', '🍔', '#FF5722', TRUE),
(NULL, 'Rent & Bills', 'expense', '🏠', '#F44336', TRUE),
(NULL, 'Transportation', 'expense', '🚗', '#E91E63', TRUE),
(NULL, 'Shopping', 'expense', '🛒', '#9C27B0', TRUE),
(NULL, 'Entertainment', 'expense', '🎬', '#673AB7', TRUE),
(NULL, 'Healthcare', 'expense', '💊', '#3F51B5', TRUE),
(NULL, 'Education', 'expense', '📚', '#2196F3', TRUE),
(NULL, 'Clothing', 'expense', '👕', '#03A9F4', TRUE),
(NULL, 'Subscriptions', 'expense', '📱', '#00BCD4', TRUE),
(NULL, 'Other Expenses', 'expense', '🎯', '#607D8B', TRUE);
