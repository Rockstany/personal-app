import * as categoryModel from '../models/categoryModel.js';

export async function createCategoryHandler(req, res) {
  try {
    const categoryId = await categoryModel.createCategory(req.userId, req.body);
    res.status(201).json({ id: categoryId, message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function getCategoriesHandler(req, res) {
  try {
    const { type } = req.query;
    const categories = await categoryModel.getCategoriesByUser(req.userId, type);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getCategoryHandler(req, res) {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}

export async function updateCategoryHandler(req, res) {
  try {
    const success = await categoryModel.updateCategory(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update or cannot update default categories' });
    }
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategoryHandler(req, res) {
  try {
    await categoryModel.deleteCategory(req.params.id, req.userId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

export async function getCategoryStatsHandler(req, res) {
  try {
    const { start_date, end_date, type } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const stats = await categoryModel.getCategoryStats(req.userId, start_date, end_date, type);
    res.json(stats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
}
