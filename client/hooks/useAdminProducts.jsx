import { useState } from 'react';
import axios from 'axios';

const useProductAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Create a new product with file upload
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('reviewText', productData.reviewText || '');
      formData.append('defaultProfit', productData.defaultProfit.toString());
      formData.append('defaultDeposit', productData.defaultDeposit.toString());
      
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
      } else if (productData.image) {
        formData.append('imageUrl', productData.image);
      }

      const response = await api.post('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
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

  // Get all products
  const getProducts = async () => {
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

  // Update product with file upload
  const updateProduct = async (productId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('name', updateData.name);
      formData.append('reviewText', updateData.reviewText || '');
      formData.append('defaultProfit', updateData.defaultProfit.toString());
      formData.append('defaultDeposit', updateData.defaultDeposit.toString());
      
      if (updateData.image instanceof File) {
        formData.append('image', updateData.image);
      } else if (updateData.image) {
        formData.append('imageUrl', updateData.image);
      }

      const response = await api.put(`/api/admin/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
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

  // Delete product
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
    getProducts,
    updateProduct,
    toggleProductStatus,
    deleteProduct
  };
};

export default useProductAdmin;