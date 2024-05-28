import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Card, CardContent, Typography, IconButton, Modal, Box, TextField, Grid, Container, createTheme, ThemeProvider, CssBaseline, CircularProgress, List, ListItem, ListItemText, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';
import { blue, pink } from '@mui/material/colors';
import { BASE_URL } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink['A400'],
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1.1rem',
    },
    body2: {
      fontSize: '1rem',
      color: 'text.secondary',
    },
  },
});

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  marginTop: '20px',
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  borderRadius: '16px',
  p: 4,
  overflowY: 'auto',
  maxHeight: '90vh',
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png',
});

const StoresPage = () => {
  const [store, setStore] = useState(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState({
    name: '',
    address: '',
    contactInfo: '',
    location: { lat: 24.8607, lng: 67.0011 },
    brand: '',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchStore = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/Store/vendor`);
      if (data.length > 0) {
        setStore(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch store:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchVendorDetails = async () => {
      try {
        const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
        setCurrentStore(prevState => ({
          ...prevState,
          brand: vendorDetails.brand.name,
        }));
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };

    fetchVendorDetails();
    fetchStore();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    setCurrentStore({
      name: '',
      address: '',
      contactInfo: '',
      location: { lat: 24.8607, lng: 67.0011 },
      brand: currentStore.brand,
    });
  };

  const handleEdit = () => {
    setOpen(true);
    setIsEditing(true);
    setCurrentStore({
      ...store,
      brand: currentStore.brand,
      location: { lat: store.location.coordinates[1], lng: store.location.coordinates[0] },
    });
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentStore(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...currentStore,
      location: {
        type: "Point",
        coordinates: [currentStore.location.lng, currentStore.location.lat],
      },
    };
    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/Store/${currentStore._id}`, payload);
      } else {
        await axios.post(`${BASE_URL}/Store/create`, payload);
      }
      setOpen(false);
      await fetchStore();
    } catch (error) {
      console.error("Failed to submit store:", error);
    }
  };

  const handleMapClick = (e) => {
    setCurrentStore(prevState => ({
      ...prevState,
      location: { lat: e.latlng.lat, lng: e.latlng.lng },
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error during location search:", error);
    }
  };

  const handleSearchResultClick = (result) => {
    setCurrentStore(prevState => ({
      ...prevState,
      location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="primary.main">
              {currentStore.brand}
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : store ? (
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {store.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Address: {store.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact Info: {store.contactInfo}
                  </Typography>
                  <MapContainer center={[store.location.coordinates[1], store.location.coordinates[0]]} zoom={10} style={mapContainerStyle} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[store.location.coordinates[1], store.location.coordinates[0]]}>
                      <Popup>Store Location</Popup>
                    </Marker>
                  </MapContainer>
                  <Button startIcon={<EditIcon />} variant="contained" color="primary" onClick={handleEdit} sx={{ mt: 2 }}>
                    Edit Store
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="h6" gutterBottom>
                  No store found. Please add your store.
                </Typography>
                <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpen}>
                  Add New Store
                </Button>
              </Box>
            )}
            <Modal open={open} onClose={handleClose}>
              <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  {isEditing ? 'Edit Store' : 'Add New Store'}
                </Typography>
                <TextField margin="normal" fullWidth label="Name" name="name" value={currentStore.name} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Address" name="address" value={currentStore.address} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Contact Info" name="contactInfo" value={currentStore.contactInfo} onChange={handleChange} />
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search Location"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  />
                  <Paper style={{ maxHeight: 200, overflow: 'auto' }}>
                    <List>
                      {searchResults.map((result, index) => (
                        <ListItem button key={index} onClick={() => handleSearchResultClick(result)}>
                          <ListItemText primary={result.display_name} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
                <MapContainer center={[currentStore.location.lat, currentStore.location.lng]} zoom={10} style={mapContainerStyle} scrollWheelZoom={false} onClick={handleMapClick}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[currentStore.location.lat, currentStore.location.lng]}>
                    <Popup>Store Location</Popup>
                  </Marker>
                </MapContainer>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Latitude" name="lat" value={currentStore.location.lat} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Longitude" name="lng" value={currentStore.location.lng} onChange={handleChange} />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                  {isEditing ? 'Update' : 'Add'}
                </Button>
              </Box>
            </Modal>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default StoresPage;
