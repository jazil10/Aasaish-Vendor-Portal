import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './ProductsPage.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControlLabel, Paper, Typography, IconButton, Button, Modal, Box,
  Checkbox, TextField, Container, Select, MenuItem, InputLabel,
  FormControl, Chip, OutlinedInput, Grid, List, ListItem, ListItemText,
  CircularProgress, TablePagination, Menu
} from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebase'; 
import Sidebar from './Sidebar';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';
import { FaPlusCircle, FaEdit, FaTrashAlt } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ProductsPage() {
  const { enqueueSnackbar } = useSnackbar(); 
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({});
  const [fileHeaders, setFileHeaders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [collections, setCollections] = useState([]);
  const [openCollections, setOpenCollections] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [bulkImportCollection, setBulkImportCollection] = useState('');
  const [newProduct, setNewProduct] = useState({
    brandId: '',
    name: '',
    description: '',
    category: '',
    tags: [],
    price: '',
    images: [],
    offers: '',
    productCode: '' // Added productCode field
  });
  const [inventory, setInventory] = useState({
    storeId: '',
    variants: [{ color: '', size: '', quantity: '' }],
    offers: { discountPercentage: '', description: '', validUntil: '' }
  });
  const [currentVendor, setCurrentVendor] = useState({
    name: '',
    brand: '',
    store: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [loading, setLoading] = useState(true); // Loading state
  const [page, setPage] = useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [bulkImportLoading, setBulkImportLoading] = useState(false); // Loading state for bulk import
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchVendorDetails();
    fetchProducts();
    fetchCategories();
    fetchCollections();
  }, []);

  const showSuccessSnackbar = (message) => {
    enqueueSnackbar(message, { variant: 'success', anchorOrigin: {
      vertical: 'top',
      horizontal: 'right',
    }, autoHideDuration: 1000 }); // Notification appears for 1 second
  };

  const fetchVendorDetails = async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;
      setCurrentVendor(prevState => ({
        ...prevState,
        brand: vendorDetails.brand._id,
        store: storeId,
      }));
      setNewProduct(prevState => ({
        ...prevState,
        brand: vendorDetails.brand._id,
      }));
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;
      const response = await axios.get(`${BASE_URL}/Product/products-by-store/${storeId}`);
      const uniqueProducts = getUniqueProducts(response.data); // Get unique products
      setProducts(uniqueProducts);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false); // Set loading to false even if there's an error
    }
  };

  const getUniqueProducts = (products) => {
    const uniqueProductsMap = new Map();
    products.forEach(product => {
      if (!uniqueProductsMap.has(product.productCode)) {
        uniqueProductsMap.set(product.productCode, product);
      }
    });
    return Array.from(uniqueProductsMap.values());
  };

  const handleOpenForAdd = () => {
    setOpen(true);
    setIsEditing(false);
    setNewProduct({
      brandId: currentVendor.brand,
      name: '',
      description: '',
      category: '',
      tags: [],
      price: '',
      images: [],
      offers: '',
      productCode: '' // Added productCode field
    });
    handleMenuClose();
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = (product) => {
    setOpen(true);
    setIsEditing(true);
    setCurrentProduct(product);
    setNewProduct(product);
    setSelectedTags(product.tags.map(tag => tag._id));
    setInventory(prevState => ({
      ...prevState,
      variants: product.variants.map(variant => ({
        color: variant.color,
        size: variant.size,
        quantity: variant.quantity
      }))
    }));
  };

  const handleDeleteProduct = async (id) => {
    if (!id) {
      console.error("Product ID is undefined, cannot delete");
      return;
    }
    
    try {
      const response = await axios.delete(`${BASE_URL}/Product/deleteproducts/${id}`);
      fetchProducts(); // Refresh the list after deleting
    } catch (error) {
      console.error("Failed to delete product:", error.response ? error.response.data : error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const uploadedImageUrls = await uploadImages();
    
    const formData = {
      ...newProduct,
      collection: newProduct.collection,
      tags: selectedTags,
      images: uploadedImageUrls,
    };
    
    try {
      let productResponse;
      if (isEditing) {
        productResponse = await axios.put(`${BASE_URL}/Product/updateproducts/${currentProduct.id}`, formData);
        const productId = currentProduct._id;
      } else {
        productResponse = await axios.post(`${BASE_URL}/Product/createproducts`, formData);
        const productId = productResponse.data._id;
        await axios.post(`${BASE_URL}/Inventory/createinventory`, {
          productId,
          storeId: currentVendor.store,
          variants: inventory.variants,
          offers: inventory.offers
        });
      }
      
      setOpen(false); // Close modal
      fetchProducts(); // Refresh products list
      showSuccessSnackbar(isEditing ? 'Product Updated' : 'Product Added'); // Display success notification
    } catch (error) {
      console.error('Failed to submit product or inventory', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Collection/collections`);
      const filteredCollections = response.data.filter(
        (collection) => collection.brand._id === currentVendor.brand
      );
      setCollections(filteredCollections);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    }
  };

  const handleManageCollections = () => {
    fetchCollections(); // Fetch collections before opening the modal
    setOpenCollections(true);
  };

  const editCollection = (collection) => {
    setCurrentCollection(collection);
    setIsEditingCollection(true);
  };

  const deleteCollection = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/Collection/deletecollections/${id}`);
      fetchCollections(); // Refresh collections after delete
      enqueueSnackbar('Collection Deleted', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete collection:", error);
      enqueueSnackbar('Failed to delete collection', { variant: 'error' });
    }
  };

  const handleCollectionSubmit = async (event) => {
    event.preventDefault();
    try {
      const newCollection = { ...currentCollection, brand: currentVendor.brand };
      const response = isEditingCollection ?
        await axios.put(`${BASE_URL}/Collection/updatecollections/${currentCollection._id}`, newCollection) :
        await axios.post(`${BASE_URL}/Collection/createcollection`, newCollection);
      
      enqueueSnackbar(isEditingCollection ? 'Collection Updated' : 'Collection Added', { variant: 'success' });
      fetchCollections();
      setCurrentCollection(null);
    } catch (error) {
      console.error("Failed to submit collection", error);
      enqueueSnackbar('Failed to submit collection', { variant: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Category/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      category: selectedCategoryId,
    }));
    fetchTags(selectedCategoryId);
  };

  const fetchTags = async (parentCategoryId) => {
    if (!parentCategoryId) {
      console.log("Parent category ID is required to fetch tags");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/Tag/by-category/${parentCategoryId}`);
      setTags(response.data);
      setSelectedTags([]);
    } catch (error) {
      console.error(`Failed to fetch tags for category ${parentCategoryId}:`, error);
    }
  };

  const handleChangeTags = (event) => {
    const { target: { value } } = event;
    setSelectedTags(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleVariantChange = (index, event) => {
    const updatedVariants = inventory.variants.map((variant, i) =>
      i === index ? { ...variant, [event.target.name]: event.target.value } : variant
    );
    setInventory({ ...inventory, variants: updatedVariants });
  };

  const handleAddVariant = () => {
    setInventory({
      ...inventory,
      variants: [...inventory.variants, { color: '', size: '', quantity: '' }],
    });
  };

  const handleRemoveVariant = (index) => {
    const filteredVariants = inventory.variants.filter((_, i) => i !== index);
    setInventory({ ...inventory, variants: filteredVariants });
  };

  const handleImageChange = (event) => {
    setImages([...event.target.files]);
  };

  const uploadImages = async () => {
    const urls = await Promise.all(
      images.map(async (image) => {
        const imageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
      })
    );
    return urls;
  };

  const handleOpenBulkImport = () => {
    setOpenBulkImport(true);
    setFile(null);
    setMapping({});
    setFileHeaders([]);
  };

  const handleCloseBulkImport = () => {
    setOpenBulkImport(false);
    setFile(null);
    setMapping({});
    setFileHeaders([]);
    handleMenuClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setFile(file);
    setFileHeaders([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length > 0) {
          setFileHeaders(json[0]);
        }
      } catch (err) {
        console.error('Error reading file:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (e) => {
    const { name, value } = e.target;
    setMapping(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkImportSubmit = async (event) => {
    event.preventDefault();
    setBulkImportLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append('file', file);

    const enhancedMapping = {
      ...mapping,
      brandId: currentVendor.brand,
      storeId: currentVendor.store
    };

    formData.append('mapping', JSON.stringify(enhancedMapping));
    formData.append('collectionId', bulkImportCollection);

    try {
      const response = await axios.post(`${BASE_URL}/Product/bulk-import`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      setOpenBulkImport(false);
      fetchProducts(); // Refresh products list
      showSuccessSnackbar('Bulk Import Successful'); // Display success notification

    } catch (error) {
      console.error('Error during bulk import:', error);
    } finally {
      setBulkImportLoading(false); // Set loading state to false
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedProducts = new Set(products.map((product) => product._id));
      setSelectedProducts(newSelectedProducts);
      return;
    }
    setSelectedProducts(new Set());
  };

  const handleClick = (productId) => {
    const newSelectedProducts = new Set(selectedProducts);
    if (newSelectedProducts.has(productId)) {
      newSelectedProducts.delete(productId);
    } else {
      newSelectedProducts.add(productId);
    }
    setSelectedProducts(newSelectedProducts);
  };

  const isAllSelected = products.length > 0 && selectedProducts.size === products.length;
  const isIndeterminate = selectedProducts.size > 0 && selectedProducts.size < products.length;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (product.productCode && product.productCode.toLowerCase().includes(searchTerm)) ||
      (product.name && product.name.toLowerCase().includes(searchTerm)) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.price && product.price.toString().toLowerCase().includes(searchTerm)) ||
      (product.category && product.category.name && product.category.name.toLowerCase().includes(searchTerm)) ||
      (product.tags && product.tags.some(tag => tag.name.toLowerCase().includes(searchTerm)))
    );
  });

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExportCSV = () => {
    const headers = ['Product Code', 'Name', 'Description', 'Price', 'Category', 'Tags'];
    const rows = paginatedProducts.map((product) => [
      product.productCode,
      product.name,
      product.description,
      product.price,
      product.category ? product.category.name : 'N/A',
      product.tags.map((tag) => tag.name).join(", ")
    ]);
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.map(value => `"${value}"`).join(',')) 
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'products.csv');
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '1000px',
    height: 'auto',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
  };

  const bulkImportModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    height: 'auto',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
  };

  return (
    <Container maxWidth="lg" className="product-page">
      <Box className="p-d-flex p-flex-column p-jc-center">
        <Sidebar />
        <Box component="main" className="p-flex-grow-1 p-p-3 main-content">
        <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1e90ff' }}>
  InStore Products
</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: '50%' }}
            />
            <Box className="button-container">
              <Button
                aria-controls="actions-menu"
                aria-haspopup="true"
                onClick={handleMenuClick}
                variant="contained"
                className="p-mb-2 p-ml-2"
              >
                Actions
              </Button>
              <Menu
                id="actions-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleOpenBulkImport}>Bulk Import</MenuItem>
                <MenuItem onClick={handleOpenForAdd}>Add New Product</MenuItem>
                <MenuItem onClick={handleManageCollections}>
                  Manage Collections
                </MenuItem>
              </Menu>
              <Button variant="contained" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </Box>
          </Box>

          <Modal open={openCollections} onClose={() => setOpenCollections(false)}>
            <Box sx={modalStyle}>
              <Typography variant="h6" gutterBottom>
                {isEditingCollection || currentCollection ? "Edit Collection" : "Collections"}
              </Typography>
              {currentCollection ? (
                <Box component="form" onSubmit={handleCollectionSubmit}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Name"
                    name="name"
                    value={currentCollection.name}
                    onChange={(e) =>
                      setCurrentCollection({ ...currentCollection, name: e.target.value })
                    }
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Description"
                    name="description"
                    value={currentCollection.description || ""}
                    onChange={(e) =>
                      setCurrentCollection({ ...currentCollection, description: e.target.value })
                    }
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Image URL"
                    name="imageUrl"
                    value={currentCollection.imageUrl}
                    onChange={(e) =>
                      setCurrentCollection({ ...currentCollection, imageUrl: e.target.value })
                    }
                  />
                  <Button type="submit" variant="contained" className="p-mt-2">
                    Save
                  </Button>
                  <Button onClick={() => setCurrentCollection(null)} className="p-mt-2">
                    Cancel
                  </Button>
                </Box>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setCurrentCollection({
                        name: "",
                        description: "",
                        imageUrl: "",
                        brand: currentVendor.brand,
                        products: [],
                      });
                      setIsEditingCollection(false);
                    }}
                    variant="contained"
                  >
                    Add Collection
                  </Button>
                  <List>
                    {collections.map((collection) => (
                      <ListItem key={collection._id}>
                        <ListItemText
                          primary={collection.name}
                          secondary={collection.description}
                        />
                        <IconButton onClick={() => editCollection(collection)}>
                          <FaEdit />
                        </IconButton>
                        <IconButton onClick={() => deleteCollection(collection._id)}>
                          <FaTrashAlt />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </Modal>

          {/* Bulk Import Modal */}
          <Modal open={openBulkImport} onClose={handleCloseBulkImport}>
            <Box
              sx={bulkImportModalStyle}
              component="form"
              onSubmit={handleBulkImportSubmit}
              noValidate
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Bulk Import Products
              </Typography>
              <input
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                type="file"
                onChange={handleFileChange}
                style={{ margin: "10px 0" }}
              />
              {file && <Typography>Selected file: {file.name}</Typography>}
              {fileHeaders.length > 0 && (
                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel id="bulk-import-collection-label">Collection</InputLabel>
                  <Select
                    labelId="bulk-import-collection-label"
                    value={bulkImportCollection}
                    onChange={(event) => setBulkImportCollection(event.target.value)}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    {collections.map((collection) => (
                      <MenuItem key={collection._id} value={collection._id}>
                        {collection.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {fileHeaders.length > 0 && (
                <Grid container spacing={2}>
                  {[
                    "productCode", // Added productCode field
                    "name",
                    "description",
                    "category",
                    "tags",
                    "price",
                    "images",
                  ].map((field, index) => (
                    <Grid key={index} item xs={12} container spacing={2}>
                      <Grid item xs={6}>
                        <TextField fullWidth disabled value={field} />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>{`Map to ${field}`}</InputLabel>
                          <Select
                            name={field}
                            value={mapping[field] || ""}
                            onChange={handleMappingChange}
                          >
                            {fileHeaders.map((header, idx) => (
                              <MenuItem key={idx} value={header}>
                                {header}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  ))}
                  {["color", "size", "quantity"].map((variantField, variantIndex) => (
                    <Grid
                      key={`variant-${variantIndex}`}
                      item
                      xs={12}
                      container
                      spacing={2}
                    >
                      <Grid item xs={6}>
                        <TextField fullWidth disabled value={variantField} />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>{`Map to ${variantField}`}</InputLabel>
                          <Select
                            name={`variant-${variantField}`}
                            value={mapping[`variant-${variantField}`] || ""}
                            onChange={handleMappingChange}
                          >
                            {fileHeaders.map((header, idx) => (
                              <MenuItem key={idx} value={header}>
                                {header}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              )}
              <Button type="submit" variant="contained" color="secondary" className="p-mt-3">
                Upload
              </Button>
              {bulkImportLoading && ( // Show loading indicator when bulk import is in progress
                <Box className="p-d-flex p-jc-center p-mt-2">
                  <Typography>Bulk importing products, please wait...</Typography>
                  <CircularProgress className="p-ml-2" />
                </Box>
              )}
            </Box>
          </Modal>

          <Modal open={open} onClose={handleClose}>
            <Box
              sx={modalStyle}
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              {!isEditing && ( // Only show productCode field when not editing an existing product
                <TextField
                  margin="normal"
                  fullWidth
                  label="Product Code"
                  name="productCode"
                  value={newProduct.productCode}
                  onChange={handleChange}
                  helperText="Enter a unique product code"
                />
              )}
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                name="name"
                value={newProduct.name}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Description"
                name="description"
                value={newProduct.description}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Price"
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Image URL"
                name="images"
                value={newProduct.images}
                onChange={handleChange}
              />
              <input
                accept="image/*"
                type="file"
                multiple
                onChange={handleImageChange}
                style={{ margin: "10px 0" }}
              />
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="collection-label">Collection</InputLabel>
                <Select
                  labelId="collection-label"
                  id="collection-select"
                  value={newProduct.collection}
                  label="Collection"
                  onChange={(event) =>
                    handleChange({
                      target: {
                        name: "collection",
                        value: event.target.value,
                      },
                    })
                  }
                  name="collection"
                >
                  {collections.map((collection) => (
                    <MenuItem key={collection._id} value={collection._id}>
                      {collection.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Grid for Category and Tags */}
              <Grid container spacing={2}>
                {/* Category */}
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category-select"
                      value={newProduct.category}
                      label="Category"
                      onChange={handleCategoryChange}
                      name="category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Tags */}
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                    <InputLabel id="tags-label">Tags</InputLabel>
                    <Select
                      labelId="tags-label"
                      id="tags-select-multiple-chip"
                      multiple
                      value={selectedTags}
                      onChange={handleChangeTags}
                      input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                      renderValue={(selected) => (
                        <Box className="p-d-flex p-flex-wrap p-gap-1">
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={
                                tags.find((tag) => tag._id === value)?.name || value
                              }
                            />
                          ))}
                        </Box>
                      )}
                      name="tags"
                    >
                      {tags.map((tag) => (
                        <MenuItem key={tag._id} value={tag._id}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Variants Section */}
              {!isEditing && (
                <>
                  {inventory.variants.map((variant, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mt: 0.1, mb: 0.1 }}>
                        Variant {index + 1}
                      </Typography>
                      <TextField
                        margin="normal"
                        label="Color"
                        name="color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, e)}
                        sx={{ mr: 1, width: "30%" }}
                      />
                      <TextField
                        margin="normal"
                        label="Size"
                        name="size"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, e)}
                        sx={{ mr: 1, width: "30%" }}
                      />
                      <TextField
                        margin="normal"
                        label="Quantity"
                        type="number"
                        name="quantity"
                        value={variant.quantity}
                        onChange={(e) => handleVariantChange(index, e)}
                        sx={{ width: "30%" }}
                      />
                      {index > 0 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          <FaTrashAlt />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    startIcon={<FaPlusCircle />}
                    onClick={handleAddVariant}
                    sx={{ mb: 0.1 }}
                  >
                    Add Variant
                  </Button>
                </>
              )}
              <Box className="p-d-flex p-jc-end p-mt-1">
                <Button type="submit" variant="contained" color="primary">
                  {isEditing ? "Update" : "Add"}
                </Button>
              </Box>
            </Box>
          </Modal>

          {loading ? ( // Show loading spinner while fetching data
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} className="table-container">
                <Table className="custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell style={{ width: '200px' }}>Image</TableCell> {/* Adjusted width */}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.productCode}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.category ? product.category.name : "N/A"}</TableCell>
                        <TableCell>{product.tags.map((tag) => tag.name).join(", ")}</TableCell>
                        <TableCell className="table-cell-image">
                          <img
                            src={product.images && product.images[0]}
                            alt={product.name}
                            className="product-image"
                          />
                        </TableCell>
                        <TableCell className="action-buttons">
                          <IconButton
                            className="edit-button"
                            onClick={() => handleEdit(product)}
                          >
                            <FaEdit />
                          </IconButton>
                          <IconButton
                            className="delete-button"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <FaTrashAlt />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredProducts.length}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableContainer>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default ProductsPage;
