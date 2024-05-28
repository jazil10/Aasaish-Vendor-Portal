import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Paper, IconButton, InputAdornment, LinearProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';
import Sidebar from './Sidebar'; // Import the Sidebar component

const SettingsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${BASE_URL}/User/vendorbyid`);
      setEmail(response.data.user.email);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
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

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 50;
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) strength += 50;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
    setPasswordsMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', mt: 8 }}>
        <Sidebar /> {/* Add Sidebar here */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              disabled
            />
            <TextField
              label="Old Password"
              variant="outlined"
              type={showOldPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              variant="outlined"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LinearProgress variant="determinate" value={passwordStrength} sx={{ my: 2 }} />
            <Typography variant="caption" color={passwordStrength < 100 ? 'error' : 'success'}>
              {passwordStrength < 100 ? 'Password strength is weak' : 'Password strength is strong'}
            </Typography>
            <TextField
              label="Confirm New Password"
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!passwordsMatch}
              helperText={!passwordsMatch ? 'Passwords do not match' : ''}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePasswordChange}
              disabled={passwordStrength < 100 || !passwordsMatch}
            >
              Update Password
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
