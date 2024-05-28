import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Container, Grid, Box, IconButton, InputAdornment } from '@mui/material';
import { FaTshirt } from 'react-icons/fa';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import './LoginPage.css';
import { BASE_URL } from './config';
import { useSnackbar } from 'notistack';

function LoginPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/User/login`, {
        email: username,
        password: password,
      });

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setLoading(false);
      window.location.href = '/Product'; // Update with your route as needed
    } catch (err) {
      setError('Failed to login. Please check your username and password.');
      setLoading(false);
      enqueueSnackbar('Failed to login. Please check your username and password.', { variant: 'error', autoHideDuration: 3000 });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const styleOverrides = {
    paperStyle: {
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      margin: '20px auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
    },
    iconStyle: {
      fontSize: '80px',
      color: '#1976d2',
      marginBottom: '20px',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    buttonStyle: {
      marginTop: '20px',
      padding: '10px 0',
      fontSize: '16px',
      letterSpacing: '1px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      },
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: '10px',
    },
  };

  return (
    <Box className="login-background">
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6} className="login-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <FaTshirt size={240} style={styleOverrides.iconStyle} />
            <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, textAlign: 'center' }}>
              Aasaish - The Revolution in Clothing Industry
            </Typography>
            <Typography style={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
              Bringing all the big clothing brands to one platform to transform user shopping experience.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} className="login-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={3} style={styleOverrides.paperStyle}>
              <form onSubmit={handleSubmit} style={styleOverrides.formContainer}>
                <Typography variant="h5" gutterBottom style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                  Welcome to Vendor Portal
                </Typography>
                {error && <Typography style={styleOverrides.errorText}>{error}</Typography>}
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={styleOverrides.buttonStyle}
                >
                  {loading ? 'Logging in...' : 'Login'}
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
