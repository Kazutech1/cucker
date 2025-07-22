import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  Search,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Toast from '../../components/Toast';
import useProductAdmin from '../../../hooks/useAdminProducts';

const Products = () => {
  const {
    loading,
    error,
    createProduct,
    getProducts,
    updateProduct,
    toggleProductStatus,
    deleteProduct
  } = useProductAdmin();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    reviewText: '',
    defaultProfit: 0,
    defaultDeposit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

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

  // Filter products when search term changes
  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reviewText?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
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

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      image: product.image,
      reviewText: product.reviewText,
      defaultProfit: product.defaultProfit,
      defaultDeposit: product.defaultDeposit
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.image) {
      showToast('Name and Image are required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct(formData);
      showToast('Product created successfully', 'success');
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showToast('Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      await updateProduct(selectedProduct.id, formData);
      showToast('Product updated successfully', 'success');
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showToast('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
      showToast('Product status updated', 'success');
      fetchProducts();
    } catch (err) {
      showToast('Failed to update product status', 'error');
    }
  };

 const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };



  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'defaultProfit' || name === 'defaultDeposit' 
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

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="ml-1 inline" size={14} /> : 
      <ChevronDown className="ml-1 inline" size={14} />;
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
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
                setFormData({
                  name: '',
                  image: '',
                  reviewText: '',
                  defaultProfit: 0,
                  defaultDeposit: 0
                });
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
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-black" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matching products found' : 'No products available'}
            </div>
          ) : (
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
                  {filteredProducts.map((product) => (
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
                            <Package className="flex-shrink-0 h-10 w-10 text-gray-400" />
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
          onClick={() => handleDeleteProduct(product.id)}
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
                          Image URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                        {formData.image && (
                          <div className="mt-2">
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              className="h-20 rounded-md object-cover border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                          </div>
                        )}
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
                          <Package className="h-16 w-16 text-gray-400" />
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
                      Update Product
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
                      Create Product
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {/* <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          danger
        /> */}

        {/* Toast Notification */}
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      </div>
    </div>
  );
};

export default Products;