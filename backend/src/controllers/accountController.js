import * as accountModel from '../models/accountModel.js';

export async function createAccountHandler(req, res) {
  try {
    console.log('=== CREATE ACCOUNT BACKEND ===');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const accountId = await accountModel.createAccount(req.userId, req.body);
    console.log('Account created with ID:', accountId);

    res.status(201).json({ id: accountId, message: 'Account created successfully' });
  } catch (error) {
    console.error('=== CREATE ACCOUNT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error SQL:', error.sql);
    console.error('Full error:', error);

    res.status(500).json({
      error: 'Failed to create account',
      details: error.message,
      code: error.code
    });
  }
}

export async function getAccountsHandler(req, res) {
  try {
    const accounts = await accountModel.getAccountsByUser(req.userId);
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
}

export async function getAccountHandler(req, res) {
  try {
    const account = await accountModel.getAccountById(req.params.id, req.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
}

export async function updateAccountHandler(req, res) {
  try {
    const success = await accountModel.updateAccount(req.params.id, req.userId, req.body);
    if (!success) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
}

export async function deleteAccountHandler(req, res) {
  try {
    await accountModel.deleteAccount(req.params.id, req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

export async function getTotalBalanceHandler(req, res) {
  try {
    const total = await accountModel.getTotalBalance(req.userId);
    res.json({ total });
  } catch (error) {
    console.error('Get total balance error:', error);
    res.status(500).json({ error: 'Failed to fetch total balance' });
  }
}
