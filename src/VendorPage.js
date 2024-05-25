import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, CircularProgress, Paper
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Sidebar from './Sidebar';
import { BASE_URL } from './config';

const VendorPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${BASE_URL}/User/vendorbyid`);
      setVendorDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.put(`${BASE_URL}/User/updateUser`, { oldPassword, newPassword });
      enqueueSnackbar("Password updated successfully", { variant: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update password', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Vendor Details
            </Typography>
            {vendorDetails ? (
              <>
                <Typography variant="body1"><strong>Name:</strong> {vendorDetails.user.name}</Typography>
                <Typography variant="body1"><strong>Email:</strong> {vendorDetails.user.email}</Typography>
                <Typography variant="body1"><strong>Brand:</strong> {vendorDetails.brand.name}</Typography>
                {/* Add more vendor details as needed */}
              </>
            ) : (
              <Typography variant="body2">No vendor details available</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Change Password
            </Typography>
            <TextField
              label="Old Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm New Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePasswordChange}
            >
              Update Password
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default VendorPage;
