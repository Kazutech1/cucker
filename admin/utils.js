const API_BASE_URL = 'http://localhost:5000/api/admin';

// Function to get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

// Function to display error message
const showError = (message) => {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
};