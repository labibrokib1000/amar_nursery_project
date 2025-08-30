import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Snackbar,
  LinearProgress,
  styled
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  Category as CategoriesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '../../features/auth/authSlice';
import dataService from '../../utils/dataService';
import ImageUploadComponent from '../../components/common/ImageUploadComponent';

// Styled components for image upload
const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '10',
    borderColor: theme.palette.primary.dark,
  },
  '&.uploading': {
    opacity: 0.7,
    pointerEvents: 'none',
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const AdminDashboard = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0
  });

  // Order Dialog States
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderStatusDialog, setOrderStatusDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Product Dialog States
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    featured: false,
  });

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Image replacement confirmation dialog
  const [imageReplaceDialog, setImageReplaceDialog] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);

  // Product View Dialog States
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Category Dialog States
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Snackbar for notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [previousImageUrl, setPreviousImageUrl] = useState(null); // Track previous image for replacement

  // Helper function to create cache-busted image URLs
  const getCacheBustedImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}t=${Date.now()}`;
  };

  // Helper function to get image URL from either format (old: product.image, new: product.images[])
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    } else if (product.image) {
      return product.image;
    }
    return '/plant.svg'; // Fallback to default local image
  };

  // Helper to validate if image URL is accessible
  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) return '/plant.svg';
    
    // If it's a local asset, return as is
    if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
      return imageUrl;
    }
    
    // For external URLs, add cache busting and fallback handling
    return imageUrl;
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access Denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      console.log('🔄 Loading admin data with timestamp:', timestamp);
      
      // Load basic data that doesn't require admin endpoints with force refresh
      const [productsData, categoriesData, ordersData] = await Promise.all([
        dataService.getProducts({ 
          pageSize: 100, 
          _t: timestamp,
          refresh: true // Force refresh flag
        }), 
        dataService.getCategories({ _t: timestamp }),
        dataService.getAllOrders(token) // Load orders with admin privileges
      ]);

      console.log('📊 Products loaded:', (productsData.products || productsData).length);
      console.log('📦 Orders loaded:', ordersData.length);
      console.log('🏷️ Sample product featured status:', 
        (productsData.products || productsData).slice(0, 3).map(p => ({
          name: p.name,
          featured: p.featured,
          featuredType: typeof p.featured
        }))
      );
      
      // Clear existing data first to ensure clean state
      setProducts([]);
      setCategories([]);
      setOrders([]);
      
      // Small delay to ensure state is cleared, then set new data
      setTimeout(() => {
        setProducts(productsData.products || productsData);
        setCategories(categoriesData);
        setOrders(ordersData);
        
        // Update stats
        setStats({
          totalProducts: (productsData.products || productsData).length,
          totalOrders: ordersData.length,
          totalCategories: categoriesData.length
        });
      }, 50);

      // Force a re-render of any cached images
      setTimeout(() => {
        console.log('🔄 Forcing image refresh with timestamp:', timestamp);
      }, 100);

    } catch (error) {
      console.error('Error loading admin data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Image upload function using backend endpoint
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      console.log('🌤️ Uploading to backend/Cloudinary...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        token: token ? 'present' : 'missing',
        apiUrl: import.meta.env.VITE_API_URL,
        user: user ? { name: user.name, role: user.role } : 'not logged in'
      });

      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      if (!user || user.role !== 'admin') {
        throw new Error('Admin privileges required for image upload.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Use token from Redux state
        },
        body: formData,
      });

      console.log('📤 Backend upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Backend upload error:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Backend upload successful:', data);
      
      if (!data.success || !data.data?.url) {
        throw new Error('Invalid response from server: missing image URL');
      }
      
      return data.data.url;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      showSnackbar(`Failed to upload image: ${error.message}`, 'error');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image from Cloudinary
  const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log('⚠️ Not a Cloudinary image, skipping deletion:', imageUrl);
      return; // Not a Cloudinary image
    }

    try {
      console.log('🗑️ Attempting to delete Cloudinary image:', imageUrl);
      
      // Extract public_id from Cloudinary URL
      // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image-name.jpg
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex === -1) {
        console.error('❌ Invalid Cloudinary URL format:', imageUrl);
        return;
      }
      
      // Get everything after 'upload/v123456789/' (version is optional)
      let publicIdPart = urlParts.slice(uploadIndex + 1).join('/');
      
      // Remove version if present (starts with 'v' followed by numbers)
      if (publicIdPart.match(/^v\d+\//)) {
        publicIdPart = publicIdPart.split('/').slice(1).join('/');
      }
      
      // Remove file extension
      const publicId = publicIdPart.replace(/\.[^/.]+$/, '');
      
      console.log('🔍 Extracted public_id:', publicId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/image/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Image deleted from Cloudinary successfully:', {
          publicId,
          result: result.result
        });
      } else {
        const errorData = await response.json();
        console.warn('⚠️ Failed to delete image from Cloudinary:', {
          status: response.status,
          error: errorData,
          publicId
        });
      }
    } catch (error) {
      console.error('❌ Error deleting image from Cloudinary:', {
        error: error.message,
        imageUrl
      });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showSnackbar('Image size should be less than 5MB', 'error');
      return;
    }

    // If there's already an image, show confirmation dialog
    if (productForm.image && productForm.image.includes('cloudinary.com')) {
      setPendingImageFile(file);
      setImageReplaceDialog(true);
      return;
    }

    // No existing image, proceed with upload
    await uploadNewImage(file);
  };

  // Function to handle the actual image upload
  const uploadNewImage = async (file) => {
    try {
      // Store current image URL before replacing (if any)
      const currentImageUrl = productForm.image;
      
      // Clear current preview and show loading
      setImagePreview(null);
      
      // Upload new image to Cloudinary via backend
      const newCloudinaryUrl = await uploadImageToCloudinary(file);
      
      console.log('📸 New Cloudinary URL received:', newCloudinaryUrl);
      
      // Update form with the new Cloudinary URL
      handleProductFormChange('image', newCloudinaryUrl);
      
      // Force a small delay to ensure state update, then set preview with cache-busting
      setTimeout(() => {
        const urlWithCacheBust = getCacheBustedImageUrl(newCloudinaryUrl);
        console.log('🔄 Setting image preview with cache-bust:', urlWithCacheBust);
        setImagePreview(urlWithCacheBust);
      }, 100);
      
      // If there was a previous image and it's different from the new one, delete it
      if (currentImageUrl && 
          currentImageUrl !== newCloudinaryUrl && 
          currentImageUrl.includes('cloudinary.com')) {
        console.log('🗑️ Removing previous image from Cloudinary:', currentImageUrl);
        await deleteImageFromCloudinary(currentImageUrl);
        showSnackbar('New image uploaded and previous image removed from Cloudinary!', 'success');
      } else {
        showSnackbar('Image uploaded to Cloudinary successfully!', 'success');
      }
      
      // Store the new image URL as the previous one for future replacements
      setPreviousImageUrl(newCloudinaryUrl);
      
    } catch (error) {
      console.error('Failed to upload to Cloudinary:', error);
      setImagePreview(null);
      handleProductFormChange('image', '');
      showSnackbar('Failed to upload image to Cloudinary', 'error');
    }
  };

  // Product CRUD Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      featured: false,
    });
    setImagePreview(null);
    setPreviousImageUrl(null); // Clear previous image tracking
    setProductDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    // Handle both old format (product.image) and new format (product.images array)
    let imageUrl = '';
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0].url;
    } else if (product.image) {
      imageUrl = product.image;
    }
    
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category?._id || product.category || '',
      image: imageUrl,
      stock: product.stock?.toString() || '',
      featured: Boolean(product.featured),
    });
    
    // Set preview to existing Cloudinary image URL with cache-busting
    const imageWithCacheBust = getCacheBustedImageUrl(imageUrl);
    setImagePreview(imageWithCacheBust);
    // Track the current image as previous for replacement tracking
    setPreviousImageUrl(imageUrl || null);
    setProductDialog(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteDialog(true);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setViewDialog(true);
  };

  const handleProductFormChange = (field, value) => {
    // Debug logging for featured field changes
    if (field === 'featured') {
      console.log('🔄 Featured field changing:', { field, value, type: typeof value });
    }
    
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    try {
      // Ensure featured field is properly converted to boolean
      const featuredValue = productForm.featured === true || productForm.featured === 'true';
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        featured: featuredValue, // Use the validated boolean value
      };

      // Debug logging for featured field
      console.log('💾 Saving product with data:', {
        originalFeatured: productForm.featured,
        featuredType: typeof productForm.featured,
        validatedFeatured: featuredValue,
        finalProductData: productData
      });

      // Convert single image to images array format if image exists
      if (productForm.image) {
        // Extract public_id from Cloudinary URL
        const urlParts = productForm.image.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const public_id = fileWithExt.split('.')[0];
        
        productData.images = [{
          public_id: public_id,
          url: productForm.image
        }];
        
        // Remove the single image field
        delete productData.image;
      } else {
        productData.images = [];
      }

      console.log('🔧 Final product data to save:', productData);

      if (editingProduct) {
        // If image was changed, delete the old image from Cloudinary
        const oldImageUrl = getProductImageUrl(editingProduct);
        if (oldImageUrl && 
            productForm.image !== oldImageUrl && 
            oldImageUrl.includes('cloudinary.com')) {
          await deleteImageFromCloudinary(oldImageUrl);
        }
        
        // Update existing product
        const result = await dataService.updateProduct(editingProduct._id, productData, token);
        console.log('✅ Product update result:', result);
        showSnackbar('Product updated successfully');
      } else {
        // Create new product
        const result = await dataService.createProduct(productData, token);
        console.log('✅ Product create result:', result);
        showSnackbar('Product created successfully');
      }

      setProductDialog(false);
      
      // Force a complete data reload with a delay to ensure backend has processed the update
      setTimeout(async () => {
        console.log('🔄 Reloading data after product save...');
        await loadData();
      }, 500);
      
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar('Error saving product', 'error');
    }
  };

  const confirmDeleteProduct = async () => {
    try {
      // Delete the product from database
      await dataService.deleteProduct(productToDelete._id, token);
      
      // Also delete the image from Cloudinary if it exists
      const imageUrl = getProductImageUrl(productToDelete);
      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl);
      }
      
      showSnackbar('Product and image deleted successfully');
      setDeleteDialog(false);
      setProductToDelete(null);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar('Error deleting product', 'error');
    }
  };

  // Category CRUD Functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
    });
    setCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
    });
    setCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        await dataService.updateCategory(editingCategory._id, categoryForm, token);
        showSnackbar('Category updated successfully');
      } else {
        // Create new category
        await dataService.createCategory(categoryForm, token);
        showSnackbar('Category created successfully');
      }

      setCategoryDialog(false);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Error saving category', 'error');
    }
  };

  // Order Management Functions
  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setOrderDetailsDialog(true);
  };

  const handleUpdateOrderStatus = (order) => {
    setEditingOrder(order);
    setOrderStatusDialog(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (!editingOrder) return;
      
      await dataService.updateOrderStatus(editingOrder._id, newStatus, token);
      showSnackbar(`Order status updated to ${newStatus}`, 'success');
      
      setOrderStatusDialog(false);
      setEditingOrder(null);
      
      // Refresh orders
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar('Error updating order status', 'error');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await dataService.markOrderDelivered(orderId, token);
      showSnackbar('Order marked as delivered', 'success');
      loadData();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      showSnackbar('Error marking order as delivered', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await dataService.cancelOrder(orderId, token);
      showSnackbar('Order cancelled successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showSnackbar('Error cancelling order', 'error');
    }
  };

  // Helper functions for orders
  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const StatCard = ({ title, count, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" sx={{ color }}>
              {count}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: '3rem' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ProductsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Products Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          sx={{ 
            background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
            '&:hover': { background: 'linear-gradient(45deg, #2e7d32, #1b5e20)' }
          }}
        >
          Add Product
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.slice(0, 10).map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Avatar
                    src={getValidImageUrl(getProductImageUrl(product))}
                    alt={product.name}
                    key={`table-img-${product._id}-${Date.now()}`} // Force re-render
                    sx={{ width: 50, height: 50 }}
                    variant="rounded"
                    onError={(e) => {
                      console.warn('❌ Failed to load table image:', getProductImageUrl(product));
                      // Set fallback image
                      e.target.src = '/plant.svg';
                      // Prevent infinite error loop
                      e.target.onerror = null;
                    }}
                  >
                    <ImageIcon />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.category?.name || product.category || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="h6" color="success.main">
                    ৳{product.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${product.stock || 0} units`}
                    size="small"
                    color={product.stock > 0 ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    size="small"
                    color={product.stock > 0 ? 'success' : 'error'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.featured ? 'Featured' : 'Regular'}
                    size="small"
                    color={product.featured ? 'secondary' : 'default'}
                    variant={product.featured ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleViewProduct(product)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditProduct(product)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No products found. Click "Add Product" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const CategoriesTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Categories Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
          sx={{ 
            background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
            '&:hover': { background: 'linear-gradient(45deg, #2e7d32, #1b5e20)' }
          }}
        >
          Add Category
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const OrdersTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Orders Management</Typography>
        <Button
          variant="outlined"
          onClick={loadData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <ViewIcon />}
        >
          Refresh Orders
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {order.user?.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email || 'No email'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.orderItems?.length || 0} items
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.orderItems?.slice(0, 2).map(item => item.name).join(', ')}
                      {order.orderItems?.length > 2 && '...'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="success.main">
                      ৳{order.totalPrice || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${getOrderStatusIcon(order.orderStatus)} ${order.orderStatus || 'Pending'}`}
                      size="small"
                      color={getOrderStatusColor(order.orderStatus)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentMethod || 'N/A'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewOrder(order)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleUpdateOrderStatus(order)}
                            disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <Tooltip title="Cancel Order">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No orders found. Orders will appear here once customers place them.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
        color: 'white',
        borderRadius: '12px',
        padding: '16px 24px',
        textAlign: 'center',
        mb: 4
      }}>
        🛠️ Admin Dashboard
      </Typography>

      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Backend API: {import.meta.env.VITE_API_URL || 'Not configured'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Products"
            count={stats.totalProducts}
            icon={<ProductsIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Orders"
            count={stats.totalOrders}
            icon={<OrdersIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Categories"
            count={stats.totalCategories}
            icon={<CategoriesIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          <Tab label="Products" />
          <Tab label="Categories" />
          <Tab label="Orders" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <ProductsTab />}
          {activeTab === 1 && <CategoriesTab />}
          {activeTab === 2 && <OrdersTab />}
        </Box>
      </Paper>

      {/* Product Add/Edit Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => handleProductFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category}
                  label="Category"
                  onChange={(e) => handleProductFormChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => handleProductFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price (৳)"
                type="number"
                value={productForm.price}
                onChange={(e) => handleProductFormChange('price', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => handleProductFormChange('stock', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="featured-select-label">Featured</InputLabel>
                <Select
                  labelId="featured-select-label"
                  value={productForm.featured ? 'true' : 'false'}
                  label="Featured"
                  onChange={(e) => {
                    const newValue = e.target.value === 'true';
                    console.log('🎯 Featured select onChange:', { 
                      selectValue: e.target.value, 
                      booleanValue: newValue,
                      currentForm: productForm.featured 
                    });
                    handleProductFormChange('featured', newValue);
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <ImageUploadComponent
                currentImage={productForm.image || imagePreview}
                onImageChange={(imageUrl) => {
                  handleProductFormChange('image', imageUrl);
                  setImagePreview(imageUrl ? getCacheBustedImageUrl(imageUrl) : null);
                }}
                onImageUpload={uploadNewImage}
                onImageDelete={async () => {
                  try {
                    setUploadingImage(true);
                    
                    // Delete from Cloudinary if it's a Cloudinary URL
                    if (productForm.image && productForm.image.includes('cloudinary.com')) {
                      console.log('🗑️ Removing image from Cloudinary...');
                      await deleteImageFromCloudinary(productForm.image);
                      showSnackbar('Image removed from Cloudinary successfully!', 'success');
                    } else {
                      showSnackbar('Image removed successfully', 'success');
                    }
                    
                    // Clear the form and preview
                    handleProductFormChange('image', '');
                    setImagePreview(null);
                    setPreviousImageUrl(null);
                    
                  } catch (error) {
                    console.error('Error removing image:', error);
                    showSnackbar('Failed to remove image', 'error');
                  } finally {
                    setUploadingImage(false);
                  }
                }}
                uploading={uploadingImage}
                disabled={false}
              />
              
              {/* Cloudinary URL input as fallback */}
              <TextField
                fullWidth
                label="Or enter Cloudinary image URL directly"
                value={productForm.image}
                onChange={async (e) => {
                  const newUrl = e.target.value;
                  const currentUrl = productForm.image;
                  
                  // If there was a previous Cloudinary image and it's being replaced
                  if (currentUrl && 
                      currentUrl !== newUrl && 
                      currentUrl.includes('cloudinary.com') &&
                      currentUrl !== previousImageUrl) {
                    console.log('🔄 URL changed, removing previous image from Cloudinary...');
                    await deleteImageFromCloudinary(currentUrl);
                  }
                  
                  // Update form with new URL
                  handleProductFormChange('image', newUrl);
                  
                  // Update preview to show the new URL with cache-busting
                  if (newUrl && (newUrl.includes('cloudinary.com') || newUrl.startsWith('http'))) {
                    const urlWithCacheBust = getCacheBustedImageUrl(newUrl);
                    setImagePreview(urlWithCacheBust);
                    setPreviousImageUrl(newUrl);
                    console.log('🔄 Manual URL updated with cache-bust:', urlWithCacheBust);
                  } else if (!newUrl) {
                    setImagePreview(null);
                    setPreviousImageUrl(null);
                  }
                }}
                placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                sx={{ mt: 2 }}
                size="small"
                helperText="You can paste a Cloudinary image URL here as an alternative to file upload"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!productForm.name || !productForm.price}
          >
            {editingProduct ? 'Update' : 'Create'} Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Add/Edit Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!categoryForm.name}
          >
            {editingCategory ? 'Update' : 'Create'} Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Replacement Confirmation Dialog */}
      <Dialog open={imageReplaceDialog} onClose={() => setImageReplaceDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ImageIcon color="warning" />
          Replace Existing Image?
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You already have an image for this product. Do you want to replace it with the new image?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The previous image will be permanently deleted from Cloudinary.
          </Typography>
          {productForm.image && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current image:
              </Typography>
              <Avatar
                src={productForm.image}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto',
                  border: '2px solid',
                  borderColor: 'divider'
                }}
                variant="rounded"
              >
                <ImageIcon />
              </Avatar>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setImageReplaceDialog(false);
              setPendingImageFile(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              setImageReplaceDialog(false);
              if (pendingImageFile) {
                await uploadNewImage(pendingImageFile);
                setPendingImageFile(null);
              }
            }}
            color="warning" 
            variant="contained"
            startIcon={<UploadIcon />}
          >
            Replace Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product View Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ViewIcon />
          Product Details
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewingProduct && (
            <Box>
              {/* Product Image Section */}
              <Box sx={{ 
                position: 'relative',
                height: 300,
                background: 'linear-gradient(45deg, #f5f5f5, #e8f5e8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                {getProductImageUrl(viewingProduct) ? (
                  <Box
                    component="img"
                    src={getValidImageUrl(getProductImageUrl(viewingProduct))}
                    alt={viewingProduct.name}
                    key={`view-img-${viewingProduct._id}-${Date.now()}`} // Force re-render
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                    onLoad={() => console.log('✅ View dialog image loaded:', getProductImageUrl(viewingProduct))}
                    onError={(e) => {
                      console.error('❌ View dialog image failed to load:', getProductImageUrl(viewingProduct));
                      e.target.src = '/plant.svg';
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <ImageIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6">No Image Available</Typography>
                  </Box>
                )}
                
                {/* Featured Badge */}
                {viewingProduct.featured && (
                  <Chip
                    label="FEATURED"
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                
                {/* Stock Status Badge */}
                <Chip
                  label={viewingProduct.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                  color={viewingProduct.stock > 0 ? 'success' : 'error'}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              {/* Product Information Section */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600,
                      mb: 1
                    }}>
                      {viewingProduct.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Chip
                        label={viewingProduct.category?.name || viewingProduct.category || 'Uncategorized'}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.9rem' }}
                      />
                      <Typography variant="h4" sx={{ 
                        color: 'success.main', 
                        fontWeight: 'bold' 
                      }}>
                        ৳{viewingProduct.price}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Description
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        {viewingProduct.description || 'No description available'}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Product Stats */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Product Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            ৳{viewingProduct.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Price
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                          <Typography variant="h4" color={viewingProduct.stock > 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                            {viewingProduct.stock || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Stock Quantity
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                          <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {viewingProduct.category?.name || viewingProduct.category || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Category
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                          <Typography variant="h4" color={viewingProduct.featured ? 'secondary.main' : 'text.secondary'} fontWeight="bold">
                            {viewingProduct.featured ? 'YES' : 'NO'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Featured
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Product ID and Timestamps */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                      System Information
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Product ID
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace" sx={{ 
                            backgroundColor: 'background.paper', 
                            p: 1, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            {viewingProduct._id}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Created Date
                          </Typography>
                          <Typography variant="body1">
                            {viewingProduct.createdAt 
                              ? new Date(viewingProduct.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Not available'
                            }
                          </Typography>
                        </Grid>
                        
                        {viewingProduct.updatedAt && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Last Updated
                            </Typography>
                            <Typography variant="body1">
                              {new Date(viewingProduct.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Button 
            onClick={() => setViewDialog(false)} 
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setViewDialog(false);
              handleEditProduct(viewingProduct);
            }}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
              '&:hover': { background: 'linear-gradient(45deg, #2e7d32, #1b5e20)' }
            }}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialog} onClose={() => setOrderDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ViewIcon />
          Order Details
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewingOrder && (
            <Box>
              {/* Order Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography variant="body1" fontFamily="monospace" sx={{ mb: 2 }}>
                      {viewingOrder._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={`${getOrderStatusIcon(viewingOrder.orderStatus)} ${viewingOrder.orderStatus || 'Pending'}`}
                      color={getOrderStatusColor(viewingOrder.orderStatus)}
                      variant="filled"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">
                      {new Date(viewingOrder.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Customer Information</Typography>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {viewingOrder.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {viewingOrder.user?.email || 'No email'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Chip
                      label={viewingOrder.paymentMethod || 'N/A'}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Shipping Address */}
              {viewingOrder.shippingAddress && (
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                  <Typography variant="body1">
                    {viewingOrder.shippingAddress.street && `${viewingOrder.shippingAddress.street}, `}
                    {viewingOrder.shippingAddress.city && `${viewingOrder.shippingAddress.city}, `}
                    {viewingOrder.shippingAddress.state && `${viewingOrder.shippingAddress.state} `}
                    {viewingOrder.shippingAddress.zipCode}
                  </Typography>
                  {viewingOrder.shippingAddress.country && (
                    <Typography variant="body2" color="text.secondary">
                      {viewingOrder.shippingAddress.country}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Order Items */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewingOrder.orderItems?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.image && (
                                <Avatar
                                  src={item.image}
                                  alt={item.name}
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                />
                              )}
                              <Typography variant="body2">{item.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">৳{item.price}</TableCell>
                          <TableCell align="right">৳{(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Order Summary */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Items Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">৳{viewingOrder.itemsPrice || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Shipping Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">৳{viewingOrder.shippingPrice || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">Total Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold" align="right" color="success.main">
                        ৳{viewingOrder.totalPrice || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Button onClick={() => setOrderDetailsDialog(false)} variant="outlined">
            Close
          </Button>
          {viewingOrder && viewingOrder.orderStatus !== 'Delivered' && viewingOrder.orderStatus !== 'Cancelled' && (
            <Button
              onClick={() => {
                setOrderDetailsDialog(false);
                handleUpdateOrderStatus(viewingOrder);
              }}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Order Status Update Dialog */}
      <Dialog open={orderStatusDialog} onClose={() => setOrderStatusDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Update status for order: {editingOrder?._id?.slice(-8)}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleStatusUpdate('Processing')}
              disabled={editingOrder?.orderStatus === 'Processing'}
              startIcon={<Typography>🔄</Typography>}
            >
              Mark as Processing
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleStatusUpdate('Shipped')}
              disabled={editingOrder?.orderStatus === 'Shipped'}
              startIcon={<Typography>🚚</Typography>}
            >
              Mark as Shipped
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleStatusUpdate('Delivered')}
              disabled={editingOrder?.orderStatus === 'Delivered'}
              startIcon={<Typography>✅</Typography>}
            >
              Mark as Delivered
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderStatusDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            minWidth: '300px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#4caf50',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
              '& .MuiAlert-action .MuiIconButton-root': {
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
