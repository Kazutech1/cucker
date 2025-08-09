import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlusCircle, Edit, Trash2, Eye, CheckCircle, XCircle, 
  Package, DollarSign, Search, ChevronUp, ChevronDown, 
  Loader2, Upload, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import useProducts from '../../../hooks/useAdminProducts';
import debounce from 'lodash.debounce';

// Debug configuration
const DEBUG = true;
const debugLog = (...args) => DEBUG && console.log('[ProductAdmin]', ...args);

// Pagination constants
const ITEMS_PER_PAGE = 10;
const PAGINATION_OPTIONS = [5, 10, 25, 50];

const Products = () => {
  const {
    loading,
    error,
    createProduct,
    updateProduct,
    getAllProducts,
    toggleProductStatus,
    deleteProduct
  } = useProducts();

  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    reviewText: '',
    defaultProfit: 0,
    defaultDeposit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounced search
  const debouncedFilter = useCallback(
    debounce((term, products) => {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.reviewText?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1); // Reset to first page on new search
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFilter(searchTerm, products);
    return () => debouncedFilter.cancel();
  }, [searchTerm, products, debouncedFilter]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        showToast('Invalid products data received', 'error');
      }
    } catch (err) {
      showToast('Failed to load products', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  // Optimized handlers
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      image: null,
      reviewText: product.reviewText || '',
      defaultProfit: product.defaultProfit || 0,
      defaultDeposit: product.defaultDeposit || 0
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      showToast('Please select an image file (JPEG, PNG, etc.)', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleCreateProduct = async () => {
    if (!formData.name) {
      showToast('Product name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('reviewText', formData.reviewText);
      productData.append('defaultProfit', formData.defaultProfit.toString());
      productData.append('defaultDeposit', formData.defaultDeposit.toString());
      
      if (formData.image) {
        productData.append('image', formData.image);
      }

      await createProduct(productData);
      showToast('Product created successfully', 'success');
      setShowModal(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('reviewText', formData.reviewText);
      productData.append('defaultProfit', formData.defaultProfit.toString());
      productData.append('defaultDeposit', formData.defaultDeposit.toString());
      
      if (formData.image) {
        productData.append('image', formData.image);
      }

      await updateProduct(selectedProduct.id, productData);
      showToast('Product updated successfully', 'success');
      setShowModal(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
      showToast('Product status updated', 'success');
      await fetchProducts();
    } catch (err) {
      showToast('Failed to update product status', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    setDeleteLoading(true);
    try {
      await deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      await fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: null,
      reviewText: '',
      defaultProfit: 0,
      defaultDeposit: 0
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Profit') || name.includes('Deposit') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // UI components
  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const SortIcon = ({ columnKey }) => (
    sortConfig.key === columnKey && (
      sortConfig.direction === 'asc' 
        ? <ChevronUp className="ml-1 inline" size={14} /> 
        : <ChevronDown className="ml-1 inline" size={14} />
    )
  );

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            toast.type === 'error' ? 'bg-red-100 text-red-800' :
            toast.type === 'success' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center">
              {toast.type === 'error' ? <XCircle className="mr-2" size={20} /> :
               toast.type === 'success' ? <CheckCircle className="mr-2" size={20} /> :
               <Package className="mr-2" size={20} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header with Search and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Package className="mr-2" size={24} />
            Product Management
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setSelectedProduct(null);
                setShowModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <PlusCircle className="mr-2" size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading && !products.length ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-black mb-2" />
              <p>Loading products...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? (
                <>
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No matching products found</p>
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="mt-2 text-sm text-black hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No products available</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Product
                          <SortIcon columnKey="name" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('defaultProfit')}
                      >
                        <div className="flex items-center">
                          Default Profit
                          <SortIcon columnKey="defaultProfit" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('defaultDeposit')}
                      >
                        <div className="flex items-center">
                          Default Deposit
                          <SortIcon columnKey="defaultDeposit" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon columnKey="isActive" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="flex-shrink-0 h-10 w-10 rounded-md object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40';
                                }}
                              />
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                {product.reviewText || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="mr-1" size={14} />
                            {product.defaultProfit?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="mr-1" size={14} />
                            {product.defaultDeposit?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(product.id)}
                            className={product.isActive 
                              ? "text-yellow-600 hover:text-yellow-900 transition-colors p-1 rounded hover:bg-yellow-50" 
                              : "text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </span>
                  
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {PAGINATION_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option} per page
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 border text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-3 py-1 text-sm">...</span>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={`px-3 py-1 border text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Product Detail/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <Package className="mr-2" size={20} />
                    {isEditMode ? 'Edit Product' : selectedProduct ? 'Product Details' : 'Create Product'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {(isEditMode || !selectedProduct) ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                        </label>
                        <div className="mt-1">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current.click()}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {formData.image ? 'Change Image' : 'Upload Image'}
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            {formData.image && (
                              <span className="text-sm text-gray-500">
                                {formData.image.name || 'Image selected'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            JPEG, PNG (Max 5MB)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="reviewText"
                          value={formData.reviewText}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter product description..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Default Profit ($)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                              <DollarSign size={14} />
                            </span>
                            <input
                              type="number"
                              name="defaultProfit"
                              value={formData.defaultProfit}
                              onChange={handleFormChange}
                              min="0"
                              step="0.01"
                              className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Default Deposit ($)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                              <DollarSign size={14} />
                            </span>
                            <input
                              type="number"
                              name="defaultDeposit"
                              value={formData.defaultDeposit}
                              onChange={handleFormChange}
                              min="0"
                              step="0.01"
                              className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4">
                        {selectedProduct.image ? (
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name}
                            className="h-16 w-16 rounded-md object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/64';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold">{selectedProduct.name}</h4>
                          <div className="text-sm text-gray-500">
                            {getStatusBadge(selectedProduct.isActive)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-gray-600 whitespace-pre-line">
                          {selectedProduct.reviewText || 'No description provided'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Default Profit</h4>
                          <div className="flex items-center text-lg font-medium">
                            <DollarSign className="mr-1" size={16} />
                            {selectedProduct.defaultProfit?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Default Deposit</h4>
                          <div className="flex items-center text-lg font-medium">
                            <DollarSign className="mr-1" size={16} />
                            {selectedProduct.defaultDeposit?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  {isEditMode ? (
                    <button
                      onClick={handleUpdateProduct}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-24"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : null}
                      {isSubmitting ? 'Saving...' : 'Update'}
                    </button>
                  ) : selectedProduct ? null : (
                    <button
                      onClick={handleCreateProduct}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors flex items-center justify-center min-w-24"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : null}
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Delete Product</h3>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={deleteLoading}
                >
                  ✕
                </button>
              </div>
              <p className="mb-6">
                Are you sure you want to delete <span className="font-semibold">"{selectedProduct?.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center min-w-24"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;