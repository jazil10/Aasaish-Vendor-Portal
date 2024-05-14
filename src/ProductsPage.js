import React, { useState, useEffect } from 'react';

// Importing Axios for HTTP requests
import axios from 'axios';

import './ProductsPage.css';

// Importing Material-UI components
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControlLabel, Paper, Typography, IconButton, Button, Modal, Box,
  Checkbox, TextField, Container, Select, Menu, MenuItem, InputLabel,
  FormControl, Chip, OutlinedInput, Grid, List, ListItem, ListItemText
} from '@mui/material';

// Importing Firebase storage functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebase'; 

// Importing custom components and icons
import Sidebar from './Sidebar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';

// Importing utility for Excel operations
import * as XLSX from 'xlsx';

// Importing Snackbar for notifications
import { useSnackbar } from 'notistack';

function ProductsPage() {
  // Snackbar for user notifications
  const { enqueueSnackbar } = useSnackbar(); 

  // State for managing UI modals and menus
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const [file, setFile] = useState(null); // Holds the file for bulk import
  const [mapping, setMapping] = useState({}); 
  const [fileHeaders, setFileHeaders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [open, setOpen] = useState(false); // Controls modal visibility

  // State for managing product data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // State for managing product collections
  const [collections, setCollections] = useState([]);
  const [openCollections, setOpenCollections] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [bulkImportCollection, setBulkImportCollection] = useState('');

  

  // State for new product details
  const [newProduct, setNewProduct] = useState({
    _id: '',
    brandId: '',
    name: '',
    description: '',
    category: '',
    tags: [],
    price: '',
    images: [],
    offers: '',
  });

  // State for inventory details
  const [inventory, setInventory] = useState({
    storeId: '',
    variants: [{ color: '', size: '', quantity: '' }],
    offers: { discountPercentage: '', description: '', validUntil: '' }
  });

  // State for vendor details
  const [currentVendor, setCurrentVendor] = useState({
    name: '',
    brand: '',
    store: '',
  });

  // State for editing controls
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

// Snackbar Notifications -----------------------
// These functions handle showing snackbar notifications
const showSuccessSnackbar = (message) => {
  enqueueSnackbar(message, { variant: 'success', anchorOrigin: {
    vertical: 'top',
    horizontal: 'right',
  }, autoHideDuration: 1000 }); // Notification appears for 1 second
};

// API Initialization -----------------------
// Setup common API configurations and fetch initial data
useEffect(() => {
  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  fetchVendorDetails();
  fetchProducts();
  fetchCategories();
  fetchCollections();
}, []);

// Vendor Details -----------------------
// Functions related to fetching and setting vendor details
const fetchVendorDetails = async () => {
  try {
    const { data: vendorDetails } = await axios.get(`http://localhost:4000/User/vendorbyid`);
    const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;

    console.log("brand:" + vendorDetails.brand._id); // Log brand ID
    console.log("store:" + storeId); // Log store ID

    // Set the brand and store in the currentVendor state
    setCurrentVendor(prevState => ({
      ...prevState,
      brand: vendorDetails.brand._id,
      store: storeId,
    }));

    console.log("curven "+ currentVendor.brand);
    setNewProduct(prevState => ({
      ...prevState,
      brand: vendorDetails.brand._id,
    }));
    console.log("newprodbrand: "+ newProduct.brand);
  } catch (error) {
    console.error('Error fetching vendor details:', error);
  }
};

// Product Management -----------------------
// Functions to handle CRUD operations on products
const fetchProducts = async () => {
  try {
    const { data: vendorDetails } = await axios.get(`http://localhost:4000/User/vendorbyid`);
    const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;    // Replace this with actual store ID retrieval logic
    const response = await axios.get(`http://localhost:4000/Product/by-store/${storeId}`);
    setProducts(response.data);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};


const handleOpenForAdd = () => {
  setOpen(true);
  setIsEditing(false);
  setNewProduct({
    productCode: '', // Add field for product code
    brandId: currentVendor.brand,
    name: '',
    description: '',
    category: '',
    price: '',
    images: '', 
    offers: '',
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
};

const handleDeleteProduct = async (id) => {
  if (!id) {
    console.error("Product ID is undefined, cannot delete");
    return;
  }
  
  try {
    const response = await axios.delete(`http://localhost:4000/Product/deleteproducts/${id}`);
    console.log('Delete response:', response.data); // For debugging
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
    collection: newProduct.collection, // Directly use selected collection ID
    tags: selectedTags,
    images: uploadedImageUrls,
  };
  
  try {
    let productResponse;
    if (isEditing) {
      productResponse = await axios.put(`http://localhost:4000/Product/updateproducts/${currentProduct._id}`, formData);
    } else {
      productResponse = await axios.post('http://localhost:4000/Product/createproducts', formData);
    }
    
    const productId = productResponse.data._id;
    
    // Call Inventory API only after successful product addition/update
    const inventoryData = {
      productId,
      storeId: currentVendor.store,
      variants: inventory.variants,
      offers: inventory.offers
    };
    
    await axios.post('http://localhost:4000/Inventory/createinventory', inventoryData);
    
    setOpen(false); // Close modal
    showSuccessSnackbar(isEditing ? 'Product Updated' : 'Product Added'); // Display success notification

  } catch (error) {
    console.error('Failed to submit product or inventory', error);
  }
};

// Collection Management -----------------------
// Functions to handle CRUD operations on collections
const fetchCollections = async () => {
  try {
    const response = await axios.get('http://localhost:4000/Collection/collections');
    setCollections(response.data);
  } catch (error) {
    console.error("Failed to fetch collections:", error);
  }
};

const handleManageCollections = () => {
  setOpenCollections(true);
};

const editCollection = (collection) => {
  setCurrentCollection(collection);
  setIsEditingCollection(true);
};

const deleteCollection = async (id) => {
  try {
    await axios.delete(`http://localhost:4000/Collection/deletecollections/${id}`);
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
    const response = isEditingCollection ?
      await axios.put(`http://localhost:4000/Collection/updatecollections/${currentCollection._id}`, currentCollection) : // Corrected URL for PUT
      await axios.post('http://localhost:4000/Collection/createcollection', currentCollection); // Corrected URL for POST
    
    enqueueSnackbar(isEditingCollection ? 'Collection Updated' : 'Collection Added', { variant: 'success' });
    fetchCollections();
    setCurrentCollection(null);
  } catch (error) {
    console.error("Failed to submit collection", error);
    enqueueSnackbar('Failed to submit collection', { variant: 'error' });
  }
};

// Category and Tag Management -----------------------
// Functions to handle fetching and managing categories and tags
const fetchCategories = async () => {
  try {
      const response = await axios.get('http://localhost:4000/Category/categories');
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
  fetchTags(selectedCategoryId); // Fetch tags for the selected category
};

const fetchTags = async (parentCategoryId) => {
  if (!parentCategoryId) {
    console.log("Parent category ID is required to fetch tags");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:4000/Tag/by-category/${parentCategoryId}`);
    setTags(response.data);
    setSelectedTags([]); // Reset selected tags if any
  } catch (error) {
    console.error(`Failed to fetch tags for category ${parentCategoryId}:`, error);
  }
};

const handleChangeTags = (event) => {
  const {
    target: { value },
  } = event;
  setSelectedTags(
    // On autofill we get a stringified value.
    typeof value === 'string' ? value.split(',') : value,
  );
};

// Inventory Variants -----------------------
// Functions to handle inventory variants
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

// Image Management -----------------------
// Functions to handle image uploads and changes
const handleImageChange = (event) => {
  setImages([...event.target.files]);
};

const uploadImages = async () => {
  const urls = await Promise.all(
    images.map(async (image) => {
      // Correctly obtain a reference to the storage location for each image
      const imageRef = ref(storage, `products/${image.name}`);
      // Upload the file
      await uploadBytes(imageRef, image);
      // Get the download URL
      return getDownloadURL(imageRef);
    })
  );
  return urls;
};

// Bulk Import -----------------------
// Functions related to bulk importing of products
const handleOpenBulkImport = () => {
  setOpenBulkImport(true);
  setFile(null);
  setMapping({});
  setFileHeaders([]);
};

const handleCloseBulkImport = () => {
  setOpenBulkImport(false);
  setFile(null); // Optional, already handled in handleOpenBulkImport
  setMapping({}); // Optional, already handled in handleOpenBulkImport
  setFileHeaders([]); // Optional, already handled in handleOpenBulkImport
  handleMenuClose();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return; // No file selected
  }

  setFile(file);
  setFileHeaders([]); // Clear previous headers

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
        // Optionally set an error state here
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
  const formData = new FormData();
  formData.append('file', file);

  // Directly assign `brandId` from `currentVendor.brand` for all products
  const enhancedMapping = {
    ...mapping,
    brandId: currentVendor.brand,
    storeId: currentVendor.store // Add store ID to the mapping
  };

  formData.append('mapping', JSON.stringify(enhancedMapping));
  formData.append('collectionId', bulkImportCollection);


  try {
    const response = await axios.post('http://localhost:4000/Product/bulk-import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    setOpenBulkImport(false);
    fetchProducts(); // Refresh products list
    showSuccessSnackbar('Bulk Import Successful'); // Display success notification

    console.log('Bulk import response:', response.data);
  } catch (error) {
    console.error('Error during bulk import:', error);
  }
};

// Menu Handling -----------------------
// Functions related to handling menu operations
const handleMenuClick = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
  setAnchorEl(null);
};

// Product and Collection Selection -----------------------
// Functions to handle selection and deselection of products and collections
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


  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%', // Increased width
    maxWidth: '1000px', // Maximum width
    height: 'auto',
    maxHeight: '90vh', // Maximum height
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Make content scrollable
  };
  const bulkImportModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%', // Increased width
    maxWidth: '800px', // Set a maximum width
    height: 'auto',
    maxHeight: '90vh', // Set a maximum height
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Make content scrollable
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Products
          </Typography>
          {/* Actions Button with Dropdown */}
          <Button
            aria-controls="actions-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            variant="contained"
            sx={{ mb: 2, ml: 2 }}
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
  
          {/* Manage Collections */}
          <Modal open={openCollections} onClose={() => setOpenCollections(false)}>
            <Box sx={modalStyle}>
              <Typography variant="h6" gutterBottom>
                {isEditingCollection || currentCollection
                  ? "Edit Collection"
                  : "Collections"}
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
                      setCurrentCollection({
                        ...currentCollection,
                        name: e.target.value,
                      })
                    }
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Description"
                    name="description"
                    value={currentCollection.description || ""}
                    onChange={(e) =>
                      setCurrentCollection({
                        ...currentCollection,
                        description: e.target.value,
                      })
                    }
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Image URL"
                    name="imageUrl"
                    value={currentCollection.imageUrl}
                    onChange={(e) =>
                      setCurrentCollection({
                        ...currentCollection,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Save
                  </Button>
                  <Button
                    onClick={() => setCurrentCollection(null)}
                    sx={{ mt: 2 }}
                  >
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
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => deleteCollection(collection._id)}
                        >
                          <DeleteIcon />
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
                  <InputLabel id="bulk-import-collection-label">
                    Collection
                  </InputLabel>
                  <Select
                    labelId="bulk-import-collection-label"
                    value={bulkImportCollection}
                    onChange={(event) =>
                      setBulkImportCollection(event.target.value)
                    }
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
                  {/* Mapping for basic product fields */}
                  {[
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
  
                  {/* Mapping for variant specific fields */}
                  {["color", "size", "quantity"].map(
                    (variantField, variantIndex) => (
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
                    )
                  )}
                </Grid>
              )}
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{ mt: 3 }}
              >
                Upload
              </Button>
            </Box>
          </Modal>
  
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={modalStyle}
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                {isEditing ? "Edit Product" : "Add New Product"}
              </Typography>
              <TextField
  margin="normal"
  fullWidth
  label="Product Code"
  name="productCode"
  value={newProduct._id}
  onChange={handleChange}
  required
/>

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
                      input={
                        <OutlinedInput id="select-multiple-chip" label="Tags" />
                      }
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={
                                tags.find((tag) => tag._id === value)?.name ||
                                value
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
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddVariant}
                sx={{ mb: 0.1 }}
              >
                Add Variant
              </Button>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button type="submit" variant="contained" color="primary">
                  {isEditing ? "Update" : "Add"}
                </Button>
              </Box>
            </Box>
          </Modal>
  
          <TableContainer component={Paper}>
  <Table sx={{ width: '100%' }} aria-label="customized table">
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={handleSelectAllClick}
          />
        </TableCell>
        <TableCell style={{ width: '15%' }}>Product ID</TableCell>
        <TableCell style={{ width: '15%' }}>Name</TableCell>
        <TableCell style={{ width: '20%' }}>Description</TableCell>
        <TableCell style={{ width: '10%' }}>Price</TableCell>
        <TableCell style={{ width: '10%' }}>Category</TableCell>
        <TableCell style={{ width: '10%' }}>Tags</TableCell>
        <TableCell style={{ width: '10%' }}>Colors</TableCell>
        <TableCell style={{ width: '10%' }}>Sizes</TableCell>
        <TableCell style={{ width: '100px' }}>Image</TableCell> {/* Fixed width for image column */}
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {products.map((product) => (
        <TableRow
          key={product.id}
          selected={selectedProducts.has(product.id)}
        >
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedProducts.has(product.id)}
              onChange={() => handleClick(product.id)}
            />
          </TableCell>
          <TableCell>{product.id}</TableCell>
          <TableCell>{product.name}</TableCell>
          <TableCell>{product.description}</TableCell>
          <TableCell>{product.price}</TableCell>
          <TableCell>
            {product.category ? product.category.name : "N/A"}
          </TableCell>
          <TableCell>
            {product.tags.map((tag) => tag.name).join(", ")}
          </TableCell>
          <TableCell>
            {product.variants
              .map((variant) => variant.color)
              .join(", ")}
          </TableCell>
          <TableCell>
            {product.variants.map((variant) => variant.size).join(", ")}
          </TableCell>
          <TableCell>
            <img
              src={product.images && product.images[0]}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }} // making image responsive within the fixed width cell
            />
          </TableCell>
          <TableCell>
            <IconButton
              color="primary"
              onClick={() => handleEdit(product)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="secondary"
              onClick={() => handleDeleteProduct(product.id)}
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
        </Box>
      </Box>
    </Container>
  );
};
  export default ProductsPage;
