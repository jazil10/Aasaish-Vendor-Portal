// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Button, Modal, Box, TextField, Container } from '@mui/material';
// import Sidebar from './Sidebar';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [open, setOpen] = useState(false); // For modal visibility
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);
//   const [newProduct, setNewProduct] = useState({ // Adjusted for new product fields
//     brand: '',
//     name: '',
//     description: '',
//     category: '',
//     price: '',
//     images: '', // Assuming single image URL; adjust if necessary
//     offers: '',
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


//     const fetchVendorDetails = async () => {
//       try {
//         const { data: vendorDetails } = await axios.get(`http://localhost:4000/User/vendorbyid`);
//         setCurrentProduct(prevState => ({
//           ...prevState,
//           brand: vendorDetails.brand._id,
//         }));
//         console.log(vendorDetails.brand._id);
//       } catch (error) {
//         console.error('Error fetching vendor details:', error);
//       }
//     };

//     fetchVendorDetails();
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get('http://localhost:4000/Product/getproducts');
//       setProducts(response.data);
//     } catch (error) {
//       console.error("Failed to fetch products:", error);
//     }
//   };

//   const handleEdit = (product) => {
//     setOpen(true);
//     setIsEditing(true);
//     setCurrentProduct(product);
//   };

//   const handleOpenForAdd = (product) => {
//     setOpen(true);
//     setIsEditing(false);
//     setCurrentProduct({
//      ...product
//     });
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setIsEditing(false);
//     setCurrentProduct(null);
//   };

//   const handleDeleteProduct = async (id) => {
//     try {
//       await axios.delete(`http://localhost:4000/Product/deleteproducts/${id}`);
//       fetchProducts(); // Refresh the list after deleting
//     } catch (error) {
//       console.error("Failed to delete product:", error);
//     }
//   };

//   const handleOpen = () => {
//     setOpen(true);
//     setIsEditing(false);
//     setCurrentProduct({
//       brand: '',
//       name: '',
//       description: '',
//       category: '',
//       price: '',
//       images: '', // Assuming single image URL; adjust if necessary
//       offers: '',
//     })
//   }
  

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduct(prevState => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   const payload = {
//   //     ...currentProduct,
//   //     brand:currentProduct.brand
//   //   }
//   //   console.log(payload);
//   //   console.log(currentProduct.brand);
//   //   if (isEditing) {
//   //     await axios.put(`http://localhost:4000/Product/updateproducts/${currentProduct.id}`, payload);
//   //   } else {
//   //     await axios.post('http://localhost:4000/Product/createproducts', payload);
//   //   }
//   //   fetchProducts();
//   //   handleClose();
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     let payload;
  
//     if (isEditing) {
//       // When editing, ensure currentProduct is updated with form values before using it
//       payload = { ...currentProduct,
//       brand: currentProduct.brand };
//     } else {
//       // When adding a new product, use newProduct as it contains form input values
//       payload = { ...newProduct , brand: currentProduct.brand };
//     }
  
//     console.log(payload); // This should now reflect the correct values entered in the form
//     console.log(currentProduct.brand);
//     try {
//       if (isEditing) {
//         await axios.put(`http://localhost:4000/Product/updateproducts/${currentProduct._id}`, payload);
//       } else {
//         await axios.post('http://localhost:4000/Product/createproducts', payload);
//       }
//       fetchProducts(); // Refresh the products list
//       handleClose(); // Close the modal
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };
  
  
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     await axios.post('http://localhost:4000/Product/createproducts', newProduct);
//   //     setNewProduct({ // Reset form after successful add
//   //       brandId: '',
//   //       name: '',
//   //       description: '',
//   //       category: '',
//   //       price: '',
//   //       images: '',
//   //       offers: '',
//   //     });
//   //     fetchProducts(); // Refresh products list
//   //     handleClose(); // Close the modal
//   //   } catch (error) {
//   //     console.error("Error submitting form:", error);
//   //   }
//   // };

//   const modalStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'background.paper',
//     boxShadow: 24,
//     p: 4,
//   };

//   return (
//     <Container maxWidth="lg">
//       <Box sx={{ display: 'flex' }}>
//         <Sidebar />
//         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//           <Typography variant="h4" gutterBottom align="center">
//             Products
//           </Typography>
//           <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
//             Add New Product
//           </Button>
//           <Modal open={open} onClose={handleClose}>
//             <Box sx={modalStyle} component="form" onSubmit={handleSubmit} noValidate>
//             <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
//                   {isEditing ? 'Edit Product' : 'Add New Product'}
//                 </Typography>
//               {/* <TextField margin="normal" fullWidth label="Brand ID" name="brandId" value={newProduct.brandId} onChange={handleChange} /> */}
//               <TextField margin="normal" fullWidth label="Name" name="name" value={newProduct.name} onChange={handleChange} />
//               <TextField margin="normal" fullWidth label="Description" name="description" value={newProduct.description} onChange={handleChange} />
//               <TextField margin="normal" fullWidth label="Category" name="category" value={newProduct.category} onChange={handleChange} />
//               <TextField margin="normal" fullWidth label="Price" type="number" name="price" value={newProduct.price} onChange={handleChange} />
//               <TextField margin="normal" fullWidth label="Image URL" name="images" value={newProduct.images} onChange={handleChange} />
//               <TextField margin="normal" fullWidth label="Offers" name="offers" value={newProduct.offers} onChange={handleChange} />
//               <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
//                   {isEditing ? 'Update' : 'Add'}
//                 </Button>
//             </Box>
//           </Modal>
//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Name</TableCell>
//                   <TableCell>Description</TableCell>
//                   <TableCell>Price</TableCell>
//                   <TableCell>Category</TableCell>
//                   <TableCell>Discount</TableCell>
//                   <TableCell>Image</TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {products.map((product) => (
//                   <TableRow key={product.id}>
//                     <TableCell>{product.name}</TableCell>
//                     <TableCell>{product.description}</TableCell>
//                     <TableCell>{product.price}</TableCell>
//                     <TableCell>{product.category}</TableCell>
//                     <TableCell>{product.discount}</TableCell>
//                     <TableCell>
//                       <img src={product.image} alt={product.name} style={{ width: 100, height: 100 }} />
//                     </TableCell>
//                     <TableCell>
//                       <IconButton color="primary" onClick={() => handleEdit(product)}>
//                         <EditIcon />
//                       </IconButton>
//                       <IconButton color="secondary" onClick={() => handleDeleteProduct(product.id)}>
//                         <DeleteIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </Box>
//       </Box>
//     </Container>
//   );
// }

// export default ProductsPage;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Button, Modal, Box, TextField, Container } from '@mui/material';
import Sidebar from './Sidebar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false); // For modal visibility
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ // Adjusted for new product fields
    brandId: '',
    name: '',
    description: '',
    category: '',
    price: '',
    images: '', // Assuming single image URL; adjust if necessary
    offers: '',
  });
  const [currentVendor, setCurrentVendor] = useState({
    name: '',
    brand: '',
  });
  var venbrandId;

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchVendorDetails = async () => {
      try {
        const { data: vendorDetails } = await axios.get(`http://localhost:4000/User/vendorbyid`);
        console.log("brand:" + vendorDetails.brandId);
        setCurrentVendor(prevState => ({
          ...prevState,
          brand: vendorDetails.brand._id,
        }));
        console.log("curven "+ currentVendor.brand);
        setNewProduct(prevState => ({
          ...prevState,
          brand: vendorDetails.brand._id,
        }));
        console.log("newprodbrand: "+ newProduct.brand);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };


    fetchVendorDetails();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/Product/getproducts');
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleEdit = (product) => {
    setOpen(true);
    setIsEditing(true);
    setCurrentProduct(product);
    setNewProduct(product);
  };

  const handleOpenForAdd = () => {
    setOpen(true);
    setIsEditing(false);
    setNewProduct({
      brandId: currentVendor.brand,
      name: '',
      description: '',
      category: '',
      price: '',
      images: '', 
      offers: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!id) {
      console.error("Product ID is undefined, cannot delete");
      return;
    }
  
    try {
      const response = await axios.delete(`http://localhost:4000/Product/deleteproducts/${id}`);
      console.log('Delete response:', response.data); // For debugging
      fetchProducts(); // Refresh the list after deleting
    } catch (error) {
      console.error("Failed to delete product:", error.response ? error.response.data : error);
    }
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //const payload = isEditing ? currentProduct : { ...newProduct};
    const payload = { ...newProduct };
    console.log("payoad" + payload);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:4000/Product/updateproducts/${currentProduct._id}`, payload);
      } else {
        await axios.post('http://localhost:4000/Product/createproducts', payload);
      }
      fetchProducts(); // Refresh the products list
      handleClose(); // Close the modal
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Products
          </Typography>
          <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenForAdd} sx={{ mb: 2 }}>
            Add New Product
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </Typography>
              <TextField margin="normal" fullWidth label="Name" name="name" value={newProduct.name} onChange={handleChange} />
              <TextField margin="normal" fullWidth label="Description" name="description" value={newProduct.description} onChange={handleChange} />
              <TextField margin="normal" fullWidth label="Category" name="category" value={newProduct.category} onChange={handleChange} />
              <TextField margin="normal" fullWidth label="Price" type="number" name="price" value={newProduct.price} onChange={handleChange} />
              <TextField margin="normal" fullWidth label="Image URL" name="images" value={newProduct.images} onChange={handleChange} />
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
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.discount}</TableCell>
                    <TableCell>
                      <img src={product.image} alt={product.name} style={{ width: 100, height: 100 }} />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteProduct(product._id)}>
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
}

export default ProductsPage;
