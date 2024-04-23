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
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Inventory
          </Typography>

  
          <TableContainer component={Paper}>
  <Table sx={{ width: '100%' }} aria-label="customized table">
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
        </TableCell>
        <TableCell style={{ width: '15%' }}>Product ID</TableCell>
        <TableCell style={{ width: '15%' }}>Name</TableCell>
        <TableCell style={{ width: '10%' }}>Colors</TableCell>
        <TableCell style={{ width: '10%' }}>Sizes</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {products.map((product) => (
        <TableRow
          key={product.id}        >
          <TableCell padding="checkbox">
          </TableCell>
          <TableCell>{product.id}</TableCell>
          <TableCell>{product.name}</TableCell>
          <TableCell>
            {product.variants
              .map((variant) => variant.color)
              .join(", ")}
          </TableCell>
          <TableCell>
            {product.variants.map((variant) => variant.size).join(", ")}
          </TableCell>
          <TableCell>
            <IconButton
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="secondary"
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
  export default InventoryPage;
