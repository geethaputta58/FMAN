// Initialize default data
let budgets = [
    {
        id: 'groceries',
        name: 'Groceries',
        amount: 1200.00,
        spent: 63.92,
        remaining: 1136.08,
        color: '#e74c3c'
    },
    {
        id: 'personal',
        name: 'Personal',
        amount: 140.00,
        spent: 65.23,
        remaining: 74.77,
        color: '#e67e22'
    }
];

let expenses = [];

// DOM elements
const budgetNameInput = document.getElementById('budget-name');
const budgetAmountInput = document.getElementById('budget-amount');
const createBudgetBtn = document.getElementById('create-budget-btn');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const budgetCategorySelect = document.getElementById('budget-category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const budgetsContainer = document.getElementById('budgets-container');
const recentExpensesContainer = document.getElementById('recent-expenses');
const deleteUserBtn = document.querySelector('.delete-user-btn');
const modal = document.getElementById('details-modal');
const closeModalBtn = document.querySelector('.close-modal');

// Load data from localStorage or use defaults
function loadData() {
    const savedBudgets = localStorage.getItem('budgets');
    const savedExpenses = localStorage.getItem('expenses');
    
    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    }
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Render budgets
function renderBudgets() {
    budgetsContainer.innerHTML = '';
    
    budgets.forEach(budget => {
        const percentSpent = (budget.spent / budget.amount) * 100;
        
        const budgetEl = document.createElement('div');
        budgetEl.className = `budget-item ${budget.id}`;
        budgetEl.innerHTML = `
            <div class="budget-header">
                <div class="budget-title-section">
                    <h3>${budget.name}</h3>
                    <button class="delete-budget-btn" data-id="${budget.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <span>$${budget.amount.toFixed(2)} Budgeted</span>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${percentSpent}%; background-color: ${budget.color};"></div>
            </div>
            <div class="budget-details">
                <span>$${budget.spent.toFixed(2)} spent</span>
                <span>$${budget.remaining.toFixed(2)} remaining</span>
            </div>
            <button class="view-details-btn" data-id="${budget.id}">View Details <i class="fas fa-external-link-alt"></i></button>
        `;
        
        budgetsContainer.appendChild(budgetEl);
    });

    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', showBudgetDetails);
    });

    document.querySelectorAll('.delete-budget-btn').forEach(btn => {
        btn.addEventListener('click', deleteBudget);
    });
}

// Render budget categories in dropdown
function renderBudgetCategories() {
    budgetCategorySelect.innerHTML = '';
    
    budgets.forEach(budget => {
        const option = document.createElement('option');
        option.value = budget.id;
        option.textContent = budget.name;
        budgetCategorySelect.appendChild(option);
    });
}

// Render recent expenses
function renderExpenses() {
    recentExpensesContainer.innerHTML = '';
    
    if (expenses.length === 0) {
        recentExpensesContainer.innerHTML = '<p class="no-expenses">No recent expenses</p>';
        return;
    }
    
    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentExpenses.forEach(expense => {
        const budget = budgets.find(b => b.id === expense.budgetId);
        if (!budget) return;
        
        const expenseEl = document.createElement('div');
        expenseEl.className = 'expense-item';
        expenseEl.innerHTML = `
            <div>
                <div class="expense-name">${expense.name}</div>
                <div class="expense-category" style="color: ${budget.color}">${budget.name}</div>
            </div>
            <div>$${expense.amount.toFixed(2)}</div>
        `;
        
        recentExpensesContainer.appendChild(expenseEl);
    });
}

// Create new budget
function createBudget() {
    const name = budgetNameInput.value.trim();
    const amountStr = budgetAmountInput.value.trim().replace('$', '');
    const amount = parseFloat(amountStr);
    
    if (!name || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid budget name and amount');
        return;
    }
    
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    if (budgets.some(b => b.id === id)) {
        alert('A budget with this name already exists');
        return;
    }
    
    const colors = ['#3498db', '#9b59b6', '#1abc9c', '#e74c3c', '#e67e22', '#f1c40f'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const newBudget = {
        id,
        name,
        amount,
        spent: 0,
        remaining: amount,
        color
    };
    
    budgets.push(newBudget);
    saveData();
    renderBudgets();
    renderBudgetCategories();
    
    budgetNameInput.value = '';
    budgetAmountInput.value = '';
}

// Add new expense
function addExpense() {
    const name = expenseNameInput.value.trim();
    const amountStr = expenseAmountInput.value.trim().replace('$', '');
    const amount = parseFloat(amountStr);
    const budgetId = budgetCategorySelect.value;
    
    if (!name || isNaN(amount) || amount <= 0 || !budgetId) {
        alert('Please enter a valid expense name, amount, and select a budget category');
        return;
    }
    
    const budgetIndex = budgets.findIndex(b => b.id === budgetId);
    
    if (budgetIndex === -1) {
        alert('Selected budget category not found');
        return;
    }
    
    budgets[budgetIndex].spent += amount;
    budgets[budgetIndex].remaining = budgets[budgetIndex].amount - budgets[budgetIndex].spent;
    
    const newExpense = {
        id: Date.now().toString(),
        name,
        amount,
        budgetId,
        date: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    saveData();
    renderBudgets();
    renderExpenses();
    
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
}

// Delete user
function deleteUser() {
    if (confirm('Are you sure you want to delete your user data? This cannot be undone.')) {
        localStorage.removeItem('budgets');
        localStorage.removeItem('expenses');
        alert('User deleted successfully!');
        location.reload();
    }
}

// Show budget details
function showBudgetDetails(e) {
    const budgetId = e.currentTarget.getAttribute('data-id');
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) return;
    
    document.getElementById('modal-title').textContent = `${budget.name} Details`;
    document.getElementById('modal-total').textContent = `$${budget.amount.toFixed(2)}`;
    document.getElementById('modal-spent').textContent = `$${budget.spent.toFixed(2)}`;
    document.getElementById('modal-remaining').textContent = `$${budget.remaining.toFixed(2)}`;
    
    const budgetExpenses = expenses.filter(exp => exp.budgetId === budgetId);
    const expensesContainer = document.getElementById('modal-expenses');
    
    if (budgetExpenses.length === 0) {
        expensesContainer.innerHTML = '<p class="no-expenses">No expenses recorded for this budget</p>';
    } else {
        expensesContainer.innerHTML = '';
        budgetExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            
            const expenseEl = document.createElement('div');
            expenseEl.className = 'expense-item';
            expenseEl.innerHTML = `
                <div>
                    <div class="expense-name">${expense.name}</div>
                    <div class="expense-category">${formattedDate}</div>
                </div>
                <div>$${expense.amount.toFixed(2)}</div>
            `;
            
            expensesContainer.appendChild(expenseEl);
        });
    }
    
    modal.style.display = 'flex';
}

// Delete a budget
function deleteBudget(e) {
    e.stopPropagation();
    const budgetId = e.currentTarget.getAttribute('data-id');
    
    if (confirm('Are you sure you want to delete this budget? All related expenses will also be deleted.')) {
        budgets = budgets.filter(b => b.id !== budgetId);
        expenses = expenses.filter(exp => exp.budgetId !== budgetId);
        saveData();
        renderBudgets();
        renderBudgetCategories();
        renderExpenses();
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Format currency inputs
budgetAmountInput.addEventListener('blur', function() {
    const value = parseFloat(this.value.replace('$', ''));
    if (!isNaN(value)) {
        this.value = `$${value.toFixed(2)}`;
    }
});

expenseAmountInput.addEventListener('blur', function() {
    const value = parseFloat(this.value.replace('$', ''));
    if (!isNaN(value)) {
        this.value = `$${value.toFixed(2)}`;
    }
});

// Event listeners
createBudgetBtn.addEventListener('click', createBudget);
addExpenseBtn.addEventListener('click', addExpense);
deleteUserBtn.addEventListener('click', deleteUser);
closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize app
function init() {
    loadData();
    renderBudgets();
    renderBudgetCategories();
    renderExpenses();
}

document.addEventListener('DOMContentLoaded', init);
