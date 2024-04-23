import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Typography, Modal, Box, TextField, FormGroup, FormControlLabel, Checkbox, Container, CssBaseline, createTheme, ThemeProvider, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import these from Firebase
import { storage } from './firebase'; // Make sure to configure your Firebase project and export 'storage'
import './config';
import { BASE_URL } from './config';
const theme = createTheme();

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [images, setImages] = useState([]); // Change to handle file inputs for images
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    images: [],
  });
  const [brandForProducts, setBrandForProducts] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("auth done");
  
    const fetchVendorDetails = async () => {
      try {
        const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
        console.log("vendor brand " + vendorDetails.brand._id);
        setBrandForProducts(vendorDetails.brand._id);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };
  
    fetchVendorDetails();
  }, []);
  
  // New useEffect that depends on brandForProducts
  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (brandForProducts) { // Check if brandForProducts is not empty
        try {
          console.log('Fetching products for brand:', brandForProducts);
          const { data } = await axios.get(`${BASE_URL}/Product/getproductsbybrand/${brandForProducts}`);
          setProducts(data);
        } catch (error) {
          console.error("Failed to fetch vendor's products:", error);
        }
      }
    };
  
    fetchVendorProducts();
  }, [brandForProducts]); // This useEffect depends on brandForProducts
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCollection(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    setImages([...event.target.files]); // Handle file inputs
  };

  const uploadImages = async () => {
    const urls = await Promise.all(
      images.map(async (image) => {
        const imageRef = ref(storage, `collections/${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
      })
    );
    return urls;
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const isChecked = event.target.checked;
    setSelectedProducts(prev => 
      isChecked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const uploadedImageUrls = await uploadImages(); // Upload images and get their URLs
    const collectionData = {
      ...newCollection,
      products: selectedProducts,
      images: uploadedImageUrls, // Add the URLs to the collection data
      brand: brandForProducts, // Include the brand ID here
    };
    console.log('Submitting collection data:', collectionData); // Log data being sent
    try {
      const response = await axios.post(`${BASE_URL}/Collection/createcollection`, collectionData);
      console.log('Creation response:', response); // Log successful response
      setCollections([...collections, response.data]);
      handleClose();
      setNewCollection({
        name: '',
        description: '',
        images: '',
      });
      setSelectedProducts([]);
      setImages([]);
    } catch (error) {
      console.error("Error creating collection:", error.response ? error.response.data : error); // Log detailed error
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Collections
        </Typography>
        <Button startIcon={<AddCircleOutlineIcon />} onClick={handleOpen} variant="contained" color="primary">
          Add New Collection
        </Button>
        <Modal open={open} onClose={handleClose}>
  <Box component="form" onSubmit={handleSubmit} sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400, // You might want to adjust the width based on your design requirements
    maxHeight: '90vh', // Maximum height before scrolling
    overflow: 'auto', // Allows scrolling
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  }}>
    <Typography variant="h6">New Collection</Typography>
    <TextField margin="normal" fullWidth name="name" label="Collection Name" value={newCollection.name} onChange={handleChange} />
    <TextField margin="normal" fullWidth name="description" label="Description" value={newCollection.description} onChange={handleChange} />
    <input
      accept="image/*"
      type="file"
      multiple
      onChange={handleImageChange}
      style={{ display: 'block', margin: '10px 0' }}
    />
    <FormGroup>
      {products.map((product) => (
        <FormControlLabel
          control={<Checkbox checked={selectedProducts.includes(product._id)} onChange={handleProductChange} value={product._id} />}
          label={product.name}
          key={product._id}
        />
      ))}
    </FormGroup>
    <Button type="submit" color="primary" variant="contained">Create Collection</Button>
  </Box>
</Modal>

        {/* Display collections here */}

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Existing Collections
        </Typography>
        {collections.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {collections.map((collection) => (
            <Box key={collection._id} sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
                <Typography variant="h6">{collection.name}</Typography>
                <Typography variant="body1">{collection.description}</Typography>
                <Box component="img" src={collection.imageUrl} sx={{ width: '100%', maxHeight: '300px', objectFit: 'cover', mt: 1 }} alt={collection.name} />
            </Box>
            ))}
        </Box>
        ) : (
        <Typography variant="body1">No collections found.</Typography>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default CollectionsPage;
