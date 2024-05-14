import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, IconButton, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Modal, Box, TextField, Container, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { blue, pink } from '@mui/material/colors';
import './config'
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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '400px',
  bgcolor: 'background.paper',
  borderRadius: '16px',
  p: 4,
  overflowY: 'auto',
  maxHeight: '90vh',
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/Category/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchCategories();
  }, []);

  const handleOpen = () => {
    console.log('Opening modal...');
    setOpen(true);
    setIsEditing(false);
    setCurrentCategory({
      name: '',
      description: '',
    });
  };

  const handleEdit = (category) => {
    setOpen(true);
    setIsEditing(true);
    setCurrentCategory(category);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form...', currentCategory);
    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/Category/updatecategory/${currentCategory._id}`, currentCategory);
      } else {
        await axios.post(`${BASE_URL}/Category/createcategory`, currentCategory);
      }
      setOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Failed to submit category:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/Category/deletecategory/${id}`);
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom align="center" color="primary.main">
          Category Management
        </Typography>
        <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
          Add New Category
        </Button>
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </Typography>
            <TextField margin="normal" fullWidth label="Name" name="name" value={currentCategory.name} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Description" name="description" value={currentCategory.description} onChange={handleChange} />
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
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(category._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
};

export default CategoriesPage;
