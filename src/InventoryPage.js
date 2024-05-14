import React, { useState, useEffect } from 'react';

// Importing Axios for HTTP requests
import axios from 'axios';

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

// Importing Snackbar for notifications
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

function InventoryPage() {
  // Snackbar for user notifications
  const { enqueueSnackbar } = useSnackbar(); 

  // State for managing product data
  const [products, setProducts] = useState([]);

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

    // State for search query
    const [searchQuery, setSearchQuery] = useState('');

  // State for sorting order
  const [sortOrder, setSortOrder] = useState('asc');


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
}, []);

// Vendor Details -----------------------
// Functions related to fetching and setting vendor details
const fetchVendorDetails = async () => {
  try {
    const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
    const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;

    console.log("brand:" + vendorDetails.brand._id); // Log brand ID
    console.log("store:" + storeId); // Log store ID

    // Set the brand and store in the currentVendor state
    setCurrentVendor(prevState => ({
      ...prevState,
      brand: vendorDetails.brand._id,
      store: storeId,
    }));
  } catch (error) {
    console.error('Error fetching vendor details:', error);
  }
};

// Product Management -----------------------
// Functions to handle CRUD operations on products
const fetchProducts = async () => {
  try {
    const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
    const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;    // Replace this with actual store ID retrieval logic
    const response = await axios.get(`${BASE_URL}/Product/by-store/${storeId}`);
    setProducts(response.data);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
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

// Function to handle search query change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
};

// Filtered products based on search query
const filteredProducts = products.filter((product) => {
  // Check if any variant matches the search query
  return product.variants.some((variant) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (variant.id && variant.id.toString().toLowerCase().includes(searchTerm)) ||
      (variant.name && variant.name.toLowerCase().includes(searchTerm)) ||
      (variant.color && variant.color.toLowerCase().includes(searchTerm)) ||
      (variant.size && variant.size.toLowerCase().includes(searchTerm)) ||
      (variant.quantity && variant.quantity.toString().toLowerCase().includes(searchTerm))
    );
  });
});


const sortProductsByQuantity = (order) => {
  return [...filteredProducts].sort((a, b) => {
    // Calculate total quantity for each product
    const totalQuantityA = a.variants.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
    const totalQuantityB = b.variants.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);

    // Compare total quantities based on the sort order
    if (order === 'asc') {
      return totalQuantityA - totalQuantityB;
    } else {
      return totalQuantityB - totalQuantityA;
    }
  });
};

// Function to handle sort change
const handleSortChange = (event) => {
  const newSortOrder = event.target.value;
  setSortOrder(newSortOrder);

  // Sort the products based on the new sort order
  const sortedProducts = sortProductsByQuantity(newSortOrder);
  setProducts(sortedProducts); // Update 'products' state instead of 'filteredProducts'
};

  return (
    <Container maxWidth="lg">
    <Box sx={{ display: "flex" }}>
      <Sidebar />
    
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    {/* Search bar */}
    <TextField
      label="Search"
      variant="outlined"
      fullWidth
      size="small"
      value={searchQuery}
      onChange={handleSearchChange}
      sx={{ width: '50%' }} // Adjust width as needed
    />

    {/* Sort options */}
    <FormControl sx={{ minWidth: 100, marginLeft: 2 }}>
      <InputLabel id="sort-label" sx={{ fontSize: '0.9rem' }}>Sort</InputLabel>
      <Select
        labelId="sort-label"
        value={sortOrder}
        onChange={handleSortChange}
        label="Sort"
        size="small"
        sx={{ fontSize: '0.9rem' }}
      >
        <MenuItem value="asc">Asc</MenuItem>
        <MenuItem value="desc">Desc</MenuItem>
      </Select>
    </FormControl>
  </Box>
        
        {/* Display products or message */}
        {filteredProducts.length > 0 ? (
          <TableContainer component={Paper}>
            {/* Table code... */}
          </TableContainer>
        ) : (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Nothing matches the search
          </Typography>
        )}

          <TableContainer component={Paper}>
  <Table sx={{ minWidth: 650 }} aria-label="customized table">
    <TableHead>
      <TableRow>
        <TableCell align="center">Product ID</TableCell>
        <TableCell align="center">Name</TableCell>
        <TableCell align="center">Color</TableCell>
        <TableCell align="center">Size</TableCell>
        <TableCell align="center">Quantity</TableCell>
        <TableCell align="center">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
  {filteredProducts.map((product) => (
    product.variants.map((variant, index) => (
      <TableRow key={`${product.id}-${variant.color}-${variant.size}`}>
        <TableCell align="center" style={{ padding: '6px 12px' }}>{product.id}</TableCell>
        <TableCell align="center" style={{ padding: '6px 12px' }}>{product.name}</TableCell>
        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.color}</TableCell>
        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.size}</TableCell>
        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.quantity}</TableCell>
        <TableCell align="center" style={{ padding: '6px 12px' }}>
          <IconButton color="primary">
            <EditIcon />
          </IconButton>
          <IconButton color="secondary">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ))}
</TableBody>

  </Table>
</TableContainer>



        </Box>
      </Box>
    </Container>
  );
};
  export default InventoryPage;
