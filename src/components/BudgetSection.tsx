import { useState, useEffect } from 'react';
import { BudgetItem, BudgetItemType } from '../types';
import { fetchBudgetItems, createBudgetItem, deleteBudgetItem } from '../services/budgetService';
import { useAuth } from '../contexts/AuthContext';

interface BudgetSectionProps {
  projectId: string | null;
  readOnly?: boolean;
}

export default function BudgetSection({ projectId, readOnly = false }: BudgetSectionProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<BudgetItemType>('original');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadItems();
    } else {
      setItems([]);
    }
  }, [projectId]);

  const loadItems = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await fetchBudgetItems(projectId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load budget items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!projectId || !user || !newDescription.trim() || !newAmount) return;

    const amount = parseFloat(newAmount);
    if (isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setIsAdding(true);
      const item = await createBudgetItem(
        projectId,
        newDescription.trim(),
        amount,
        newType,
        user.id
      );
      setItems([...items, item]);
      setNewDescription('');
      setNewAmount('');
      setNewType('original');
    } catch (err) {
      alert('Failed to add budget item');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this budget item?')) return;

    try {
      await deleteBudgetItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) {
      alert('Failed to delete budget item');
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const originalTotal = items
    .filter(i => i.item_type === 'original')
    .reduce((sum, i) => sum + i.amount, 0);

  const changeOrderTotal = items
    .filter(i => i.item_type === 'change_order')
    .reduce((sum, i) => sum + i.amount, 0);

  const grandTotal = originalTotal + changeOrderTotal;

  if (!projectId) {
    return (
      <div className="budget-section">
        <h2>Budget</h2>
        <p className="budget-empty">Save the project first to manage budget.</p>
      </div>
    );
  }

  return (
    <div className="budget-section">
      <h2>Budget</h2>

      {loading ? (
        <div className="budget-loading">Loading budget...</div>
      ) : (
        <>
          {/* Budget Summary */}
          <div className="budget-summary">
            <div className="budget-summary-item">
              <span className="budget-label">Original Budget</span>
              <span className="budget-value">{formatCurrency(originalTotal)}</span>
            </div>
            <div className="budget-summary-item">
              <span className="budget-label">Change Orders</span>
              <span className="budget-value change-order">{formatCurrency(changeOrderTotal)}</span>
            </div>
            <div className="budget-summary-item total">
              <span className="budget-label">Total</span>
              <span className="budget-value">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Budget Items Table */}
          {items.length > 0 && (
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  {!readOnly && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>
                      <span className={`budget-type-badge ${item.item_type}`}>
                        {item.item_type === 'original' ? 'Original' : 'Change Order'}
                      </span>
                    </td>
                    <td className="budget-amount">{formatCurrency(item.amount)}</td>
                    {!readOnly && (
                      <td>
                        <button
                          className="btn-delete-budget"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {items.length === 0 && (
            <p className="budget-empty">No budget items yet.</p>
          )}

          {/* Add New Item Form */}
          {!readOnly && (
            <div className="budget-form">
              <input
                className="input"
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <input
                className="input budget-amount-input"
                type="number"
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
              <select
                className="select"
                value={newType}
                onChange={(e) => setNewType(e.target.value as BudgetItemType)}
              >
                <option value="original">Original</option>
                <option value="change_order">Change Order</option>
              </select>
              <button
                className="btn-primary"
                onClick={handleAddItem}
                disabled={isAdding || !newDescription.trim() || !newAmount}
              >
                {isAdding ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
