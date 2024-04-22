import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Container, Grid, Box } from '@mui/material';
import { FaTshirt } from 'react-icons/fa';
import axios from 'axios';
import './LoginPage.css';
import '../config';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Assuming your login API endpoint is '/api/login'
      // Update the URL to match your actual login endpoint
      const response = await axios.post(`${BASE_URL}/User/login`, {
        email: username, // Adjust according to your API's expected payload
        password: password,
      });

      const { accessToken, refreshToken } = response.data;
      // Store the access token in localStorage for session management
      localStorage.setItem('token', accessToken);
      // Storing the refresh token in localStorage for simplicity in this example
      // For a more secure application, consider handling refresh tokens server-side
      localStorage.setItem('refreshToken', refreshToken);

      setLoading(false);
      // Redirect or perform additional actions upon successful login
      // For instance, navigate to a dashboard
      window.location.href = '/stores'; // Update with your route as needed
    } catch (err) {
      setError('Failed to login. Please check your username and password.');
      setLoading(false);
    }
  };
  // Enhanced styling for a modern look
  const styleOverrides = {
    background: {
      backgroundColor: '#f0f2f5', // Updated for a cohesive look
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paperStyle: {
      padding: '40px', // Increased padding for a more spacious layout
      width: '100%',
      maxWidth: '450px', // Slightly larger to accommodate enhanced form elements
      margin: '20px auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // More pronounced shadow for depth
      borderRadius: '8px', // Rounded corners for a softer look
    },
    iconStyle: {
      fontSize: '80px', // Larger icon for a bold statement
      color: '#1976d2', // A deeper blue for contrast
      marginBottom: '20px',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px', // Increased gap for better visual separation
    },
    buttonStyle: {
      marginTop: '20px',
      padding: '10px 0', // More padding for a larger, easier-to-click button
      fontSize: '16px', // Larger font size for readability
      letterSpacing: '1px', // Letter spacing for a modern touch
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
      transition: 'all 0.3s ease', // Smooth transition for hover effects
      '&:hover': {
        transform: 'translateY(-2px)', // Slight raise effect on hover
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Enhanced shadow on hover
      },
    },
  };

  return (
    <Box style={styleOverrides.background}>
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={5} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <FaTshirt size={240} style={styleOverrides.iconStyle} />
            <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Aasaish - The Revolution in Clothing Industry
            </Typography>
            <Typography style={{ fontFamily: 'Poppins, sans-serif' }}>
              Bringing all the big clothing brands to one platform to transform user shopping experience.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} style={styleOverrides.paperStyle}>
              <form onSubmit={handleSubmit} style={styleOverrides.formContainer}>
                <Typography variant="h5" gutterBottom style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                  Welcome to Vendor Portal
                </Typography>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={styleOverrides.buttonStyle}>
                  Login
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LoginPage;
