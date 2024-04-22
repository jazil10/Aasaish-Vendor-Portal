import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, IconButton, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Modal, Box, TextField, Container, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { blue, pink } from '@mui/material/colors';
import '../config';
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

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);

  const [currentTag, setCurrentTag] = useState({
    name: '',
    parentTag: '',
  });
  const [parentTags, setParentTags] = useState([]);

  const fetchTags = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/Tag/tags`);
      console.log("Tags:", data); // Debugging line to inspect tags
      setTags(data);
      setParentTags(data.filter(tag => !tag.parentTag));
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/Category/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
  
    fetchTags();
    fetchCategories();
  }, []);
  
  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    setCurrentTag({
      name: '',
      parentTag: '',
    });
  };

  const handleEdit = (tag) => {
    setOpen(true);
    setIsEditing(true);
    setCurrentTag(tag);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTag(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        console.log(currentTag);
        const parentCategoryObj = categories.find(category => category._id === currentTag.parentCategory);
  
        console.log(`Submitting tag: ${currentTag.name}, Parent Category: ${parentCategoryObj ? parentCategoryObj.name : 'None'}`);

        await axios.put(`${BASE_URL}/Tag/updatetag/${currentTag._id}`, currentTag);
        console.log(tags);
        console.log(categories);

      } else {
        console.log(currentTag);
        await axios.post(`${BASE_URL}/Tag/createtag`, currentTag);

      }
      setOpen(false);
      await fetchTags();
    } catch (error) {
      console.error("Failed to submit tag:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/Tag/deletetag/${id}`);
      await fetchTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom align="center" color="primary.main">
          Tag Management
        </Typography>
        <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
          Add New Tag
        </Button>
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              {isEditing ? 'Edit Tag' : 'Add New Tag'}
            </Typography>
            <TextField margin="normal" fullWidth label="Name" name="name" value={currentTag.name} onChange={handleChange} />
            <TextField
              select
              label="Parent Category"
              name="parentCategory" // Changed from parentTag to parentCategory
              value={currentTag.parentCategory} // Adjust based on your state structure
              onChange={handleChange}
              fullWidth
              SelectProps={{ native: true }}
              helperText="Please select a parent category (optional)"
              margin="normal"
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </TextField>

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
                <TableCell>Parent Category</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag._id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>
                  {categories.find(category => category._id === tag .parentCategory)?.name || 'None'}
                </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(tag)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(tag._id)}>
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

export default TagsPage;
