import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Ensure jwtDecode is correctly imported; if jwtDecode is not used, consider removing it to clean up your code.
import { jwtDecode } from 'jwt-decode'; 
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Modal, Box, TextField, Grid, Container, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './config'
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

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState({
    name: '',
    address: '',
    contactInfo: '',
    location: { lat: 24.8607, lng: 67.0011 },
    brand: '',
  });

  const fetchStores = async () => {
    try {
      const { data } = await axios.get(`http://localhost:4000/Store/vendor`);
      setStores(data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };
  // Define fetchStores within useEffect to avoid 'fetchStores' is not defined error
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


    const fetchVendorDetails = async () => {
      try {
        const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
        console.log(vendorDetails.brand);
        setCurrentStore(prevState => ({
          ...prevState,
          brand: vendorDetails.brand._id,
        }));
        console.log(currentStore.brand);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };

    fetchVendorDetails();
    fetchStores();
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

  const handleEdit = (store) => {
    setOpen(true);
    setIsEditing(true);
    setCurrentStore({
      ...store,
      brand: currentStore.brand,
      location: { lat: store.location.coordinates[1], lng: store.location.coordinates[0], },
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
    console.log(payload);
    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/Store/${currentStore._id}`, payload);
      } else {
        await axios.post(`${BASE_URL}/Store/create`, payload);
      }
      setOpen(false);
      // Call fetchStores here after the update to refresh the list
      await fetchStores();
    } catch (error) {
      console.error("Failed to submit store:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/Store/${id}`);
      // Call fetchStores here after deletion to refresh the list
      await fetchStores();
    } catch (error) {
      console.error("Failed to delete store:", error);
    }
  };

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setCurrentStore(prevState => ({
          ...prevState,
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        }));
      },
    });
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="primary.main">
              Store Locations
            </Typography>
            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
              Add New Store
            </Button>
            <Modal open={open} onClose={handleClose}>
              <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  {isEditing ? 'Edit Store' : 'Add New Store'}
                </Typography>
                <TextField margin="normal" fullWidth label="Name" name="name" value={currentStore.name} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Address" name="address" value={currentStore.address} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Contact Info" name="contactInfo" value={currentStore.contactInfo} onChange={handleChange} />
                <MapContainer center={[currentStore.location.lat, currentStore.location.lng]} zoom={13} style={mapContainerStyle} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClick />
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>{store.contactInfo}</TableCell>
                      {/* <TableCell>{`Lat: ${store.location.coordinates[1]}, Lng: ${store.location.coordinates[0]}`}</TableCell> */}
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEdit(store)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleDelete(store._id)}>
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
    </ThemeProvider>
  );
};

export default StoresPage;