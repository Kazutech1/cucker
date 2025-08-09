import { useState } from 'react';
import axios from 'axios';

const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Create a form data instance for file uploads
//   const createFormData = (data, file) => {
//   const formData = new FormData();
  
//   // Append all product data fields
//   for (const key in data) {
//     if (data[key] !== undefined) {
//       formData.append(key, data[key]);
//     }
//   }

//   // Append file if it exists
//   if (file) {
//     formData.append('image', file);  // Must match the field name expected by multer
//   }

//   return formData;
// };

// In useProducts.js
const createProduct = async (formData) => {  // Accept FormData directly
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.post('/api/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create product');
    throw err;
  } finally {
    setLoading(false);
  }
};



  // Update a product
  const updateProduct = async (productId, formData) => {  // Accept FormData directly
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.put(`/api/admin/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update product');
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/products');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single product
  const getProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/products/${productId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle product status
  const toggleProductStatus = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/api/admin/products/${productId}/toggle-status`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle product status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/api/admin/products/${productId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProduct,
    updateProduct,
    getAllProducts,
    getProduct,
    toggleProductStatus,
    deleteProduct
  };
};

export default useProducts;