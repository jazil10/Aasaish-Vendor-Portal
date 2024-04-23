import React, { useState, useEffect } from 'react';
//import { List, ListItem, ListItemText} from '@mui/material';
import axios from 'axios';
import Sidebar from './Sidebar';
import DeleteIcon from '@mui/icons-material/Delete';
//import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {Paper, List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogActions, DialogContent, DialogTitle, Container } from '@mui/material';
import { BASE_URL } from './config';

const InventoryManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [storesDialogOpen, setStoresDialogOpen] = useState(false);
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productDialogOpen, setProductDialogOpen] = useState(false); // To control the product dialog visibility
    const [inventories, setInventories] = useState({});


    const [variantRows, setVariantRows] = useState([{
        color: '',
        size: '',
        quantity: ''
    }]);

    // Handle change for variantRows
    const handleVariantChange = (index, e) => {
        const updatedVariants = [...variantRows];
        updatedVariants[index][e.target.name] = e.target.value;
        setVariantRows(updatedVariants);
    };

    // Function to add a new variant row
    const addVariantRow = () => {
        setVariantRows([...variantRows, { color: '', size: '', quantity: '' }]);
    };

    // Function to delete a variant row
    const deleteVariantRow = (index) => {
        const updatedVariants = [...variantRows];
        updatedVariants.splice(index, 1);
        setVariantRows(updatedVariants);
    };


    const updateInventory = (storeID, productID, inventoryDetails) => {
      const key = `${storeID}-${productID}`;
      setInventories(prev => ({
        ...prev,
        [key]: inventoryDetails
      }));
    };
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        storeId: '',
        color: '',
        size: '',
        quantity: ''
    });
    var brandId="";

    const getProductsByStore = async (store) => {
        setSelectedStore(store);
        try {
            // Assuming you have an endpoint to get products by store  /getinventory/productsByStore/:storeId
            const response = await axios.get(`${BASE_URL}/Inventory/getinventory/productsByStore/${store._id}`);
            setProducts(response.data); // Assuming the response contains an array of products
            setProductDialogOpen(true); // Open the products dialog
        } catch (error) {
            console.error('Error fetching products by store:', error);
        }
    };
    const getInventoryDetails = async (product) => {
        setSelectedProduct(product); // Keep track of the selected product
        if (!selectedStore) {
            console.error('No store selected');
            return;
        }
    
        try {
            const response = await axios.get(`${BASE_URL}/Inventory/getinventory/getInventoryByStoreAndProduct/${selectedStore._id}/${product._id}`);
            console.log(response.data);
            // Directly access the 'variants' property of the response data
            const inventoryDetails = response.data.variants.map(variant => ({
                color: variant.color,
                size: variant.size,
                quantity: variant.quantity,
            }));
            
            // As 'productName' and 'productDescription' are part of the 'productId' object,
            // we don't need to map them. Just set them directly.
            const productName = response.data.productId.name;
            const productDescription = response.data.productId.description;
    
            // Now, update the state with the inventory details
            setInventory({
                productName,
                productDescription,
                variants: inventoryDetails
            });
    
            setInventoryDialogOpen(true); // Open the inventory details dialog
        } catch (error) {
            console.error('Error fetching inventory details:', error);
        }
    };
    
    // const getInventoryDetails = async (product) => {
    //     setSelectedProduct(product);
    //     try {
    //         // This API endpoint should return inventory details for the selected product
    //         // Adjust the endpoint as needed http://localhost:4000/Inventory/getinventory/product/:productId
    //         const response = await axios.get(`${BASE_URL}/Inventory/getinventory/product/${product._id}`);
    //         const inventoryDetails = response.data.map(item => ({
    //             productName: item.productId.name,
    //             productDescription: item.productId.description,
    //             variants: item.variants,
    //         }));
    //         setInventory(inventoryDetails);
    //         setInventoryDialogOpen(true); // Open the inventory details dialog
    //         setProductDialogOpen(false); // Close the product list dialog
    //     } catch (error) {
    //         console.error('Error fetching inventory details for product:', error);
    //     }
    // };
    

    const getInventoryByStore = async (store) => {
        setSelectedStore(store);
        console.log("inv by store :" + store._id)
        try {
            // Replace the URL with your actual API endpoint  /getinventory/store/:storeId
            const response = await axios.get(`http://localhost:4000/Inventory/getinventory/store/${store._id}`);
            const inventoryData = response.data.map(item => ({
                productName: item.productId.name, // Accessing name of the product
                productDescription: item.productId.description, // Assuming product has a description field
                variants: item.variants, // Directly using the variants array from the inventory item
                offers: item.offers // Optionally handling offers if needed
            }));
            setInventory(inventoryData);
            setInventoryDialogOpen(true);
        } catch (error) {
            console.error('Error fetching inventory by store:', error);
            // Handle the error appropriately
        }
    };
    

    const fetchInventory = async () => {
        try {
          const { data } = await axios.get(`http://localhost:4000/Inventory/allinventory`);
          setInventory(data);
          console.log(inventory);
        } catch (error) {
          console.error("Failed to fetch inventory:", error);
        }
      };

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const fetchVendorDetails = async () => {
            try {
                const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
                brandId = vendorDetails.brand._id;
                console.log(brandId);
                fetchProductsByBrand(brandId);
                fetchStoresByBrand(brandId);
            } catch (error) {
                console.error('Error fetching vendor details:', error);
            }
        };

        const fetchProductsByBrand = async (brandId) => {
            try {
                console.log("fn:"+brandId);
                const { data: productsData } = await axios.get(`${BASE_URL}/Product/getproductsbybrand/${brandId}`);
                console.log("prodata: "+productsData);
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchStoresByBrand = async (brandId) => {
            try {
                console.log("for store" +brandId);
                const { data: storesData } = await axios.get(`${BASE_URL}/Store//getstoresbybrand/${brandId}`);
                console.log("storedata: "+storesData);
                setStores(storesData);
            } catch (error) {
                console.error('Error fetching stores:', error);
            }
        };

        fetchVendorDetails();
        fetchInventory();
    }, []);

    const handleOpen = () => {
        setIsEditing(false);
        setCurrentItem({
            productId: '',
            storeId: '',
            color: '',
            size: '',
            quantity: ''
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // The inventoryItem structure now includes the variantRows array for variants
        const inventoryItem = {
            productId: currentItem.productId,
            storeId: currentItem.storeId,
            variants: variantRows.map(variant => ({
                color: variant.color,
                size: variant.size,
                quantity: parseInt(variant.quantity, 10) // Ensure quantity is an integer
            }))
        };
    
        // Adjust the inventoryItem structure to fit the Inventory model
        // const inventoryItem = {
        //     productId: currentItem.productId,
        //     storeId: currentItem.storeId,
        //     variants: [{
        //         color: currentItem.color,
        //         size: currentItem.size,
        //         quantity: parseInt(currentItem.quantity, 10) // Ensure quantity is an integer
        //     }]
        // };
        console.log(inventoryItem);
    
        try {
            if (isEditing) {
                // Update inventory item logic, ensure it supports the adjusted structure
            } else {
                await axios.post(`${BASE_URL}/Inventory/createinventory`, inventoryItem);
            }
            handleClose();
        } catch (error) {
            console.error('Failed to submit inventory:', error);
        }
    };
    


    const handleStoresDialogOpen = () => setStoresDialogOpen(true);
    const handleStoresDialogClose = () => setStoresDialogOpen(false);
    const handleInventoryDialogClose = () => setInventoryDialogOpen(false);

    return (
        <Container maxWidth="sm">
            <Sidebar />
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
                Add Inventory Item
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <Paper style={{ padding: '20px', width: '40%', overflow: 'auto' }}>
              
                    <h2>Stores</h2>
                    <List>
                        {stores.map((store) => (
                            <ListItem button key={store._id} onClick={() => getProductsByStore(store)}>
                                <ListItemText primary={store.name} />
                            </ListItem>
                        ))}
                    </List>
                    </Paper>
                </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
                <DialogContent>
                   
                <FormControl fullWidth margin="dense">
                        <InputLabel>Product</InputLabel>
                        <Select
                            name="productId"
                            value={currentItem.productId}
                            onChange={handleChange}
                            label="Product"
                        >
                            {products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Store</InputLabel>
                        <Select
                            name="storeId"
                            value={currentItem.storeId}
                            onChange={handleChange}
                            label="Store"
                        >
                            {stores.map((store) => (
                                <MenuItem key={store._id} value={store._id}>{store.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Editable Table for Variants */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Color</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {variantRows.map((variant, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            name="color"
                                            value={variant.color}
                                            onChange={(e) => handleVariantChange(index, e)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            name="size"
                                            value={variant.size}
                                            onChange={(e) => handleVariantChange(index, e)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            name="quantity"
                                            type="number"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(index, e)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => deleteVariantRow(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={addVariantRow} style={{ marginTop: '10px', float: 'right' }}>Add New Row</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
            {/* <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
                <DialogContent>
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Product</InputLabel>
                        <Select
                            name="productId"
                            value={currentItem.productId}
                            onChange={handleChange}
                            label="Product"
                        >
                            {products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Store</InputLabel>
                        <Select
                            name="storeId"
                            value={currentItem.storeId}
                            onChange={handleChange}
                            label="Store"
                        >
                            {stores.map((store) => (
                                <MenuItem key={store._id} value={store._id}>{store.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField margin="dense" name="color" label="Color" fullWidth variant="outlined" value={currentItem.color} onChange={handleChange} />
                    <TextField margin="dense" name="size" label="Size" fullWidth variant="outlined" value={currentItem.size} onChange={handleChange} />
                    <TextField margin="dense" name="quantity" label="Quantity" type="number" fullWidth variant="outlined" value={currentItem.quantity} onChange={handleChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog> */}
            <div>
            {/* <Button onClick={handleStoresDialogOpen}>View Stores</Button> */}

            {/* Dialog for listing stores */}
            <Dialog open={storesDialogOpen} onClose={handleStoresDialogClose}>
                <DialogTitle>Stores</DialogTitle>
                <DialogContent>
                    <List>
                        {stores.map((store) => (
                            <ListItem button key={store.id} onClick={() => getProductsByStore(store)}>
                            <ListItemText primary={store.name} />
                        </ListItem>                        
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            {/* Dialog for listing inventory of the selected store */}
            <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)}>
            <DialogTitle>Inventory Details</DialogTitle>
            <DialogContent>
                <div>
                    <h2>{inventory.productName}</h2>
                    <p>{inventory.productDescription}</p>
                    <List>
                        {inventory.variants && inventory.variants.map((variant, index) => (
                            <ListItem key={index}>
                                <ListItemText 
                                    primary={`Size: ${variant.size}, Color: ${variant.color}, Quantity: ${variant.quantity}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </DialogContent>
            </Dialog>

            <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)}>
            <DialogTitle>Products in {selectedStore?.name}</DialogTitle>
            <DialogContent>
                <List>
                    {products.map((product) => (
                        <ListItem button key={product.id} onClick={() => getInventoryDetails(product)}>
                            <ListItemText primary={product.name} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>

        {/* <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)}>
        <DialogTitle>Inventory for {selectedProduct?.name}</DialogTitle>
        <DialogContent>
            {inventory.map((item, index) => (
                <div key={index}>
                    <h3>{item.productName}</h3>
                    <p>{item.productDescription}</p>
                    <List>
                        {item.variants.map((variant, variantIndex) => (
                            <ListItem key={variantIndex}>
                                <ListItemText primary={`Size: ${variant.size}, Color: ${variant.color}, Quantity: ${variant.quantity}`} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            ))}
        </DialogContent>
    </Dialog> */}
        
        </div>
        </Container>
    );
};

export default InventoryManagementPage;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import {TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// const BASE_URL = "http://localhost:4000";

// const InventoryManagementPage = () => {
//     const [products, setProducts] = useState([]);
//     const [stores, setStores] = useState([]);
//     const [inventory, setInventory] = useState([]);
//     const [open, setOpen] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [currentItem, setCurrentItem] = useState({
//         productId: '',
//         storeId: '',
//         color: '',
//         size: '',
//         quantity: ''
//     });
//     var brandId="";

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//         const fetchProducts = async () => {
//             const response = await axios.get(`${BASE_URL}/Product/getproducts`);
//             setProducts(response.data);
//         };

//         const fetchStores = async () => {
//             const response = await axios.get(`${BASE_URL}/Store//getstoresbybrand/:brandId`);
//             setStores(response.data);
//         };

//         const fetchVendorDetails = async () => {
//             try {
//                 const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
//                 brandId = vendorDetails.brand._id;
//                 console.log(brandId);
//                 fetchProductsByBrand(brandId);
//                 fetchStoresByBrand(brandId);
//             } catch (error) {
//                 console.error('Error fetching vendor details:', error);
//             }
//         };

//         const fetchProductsByBrand = async (brandId) => {
//             try {
//                 console.log("fn:"+brandId);
//                 const { data: productsData } = await axios.get(`${BASE_URL}/Product/getproductsbybrand/${brandId}`);
//                 console.log("prodata: "+productsData);
//                 setProducts(productsData);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             }
//         };
            
//         const fetchStoresByBrand = async (brandId) => {
//             try {
//                 console.log("for store" +brandId);
//                 const { data: storesData } = await axios.get(`${BASE_URL}/Store/getproductsbystore/${brandId}`);
//                 console.log("storedata: "+storesData);
//                 setStores(storesData);
//             } catch (error) {
//                 console.error('Error fetching stores:', error);
//             }
//         };

//         const fetchInventory = async () => {
//             const response = await axios.get(`${BASE_URL}/Inventory/allinventory`);
//             setInventory(response.data);
//         };

//         fetchProductsByBrand();
//         fetchStoresByBrand();
//         //fetchInventory();
//     }, []);

//     // This function filters inventory items for a given store
//     const getInventoryByStore = (storeId) => inventory.filter(item => item.storeId._id === storeId);

//     // This function finds the name of a product by its ID
//     const getProductNameById = (productId) => {
//         const product = products.find(product => product._id === productId);
//         return product ? product.name : 'Product not found';
//     };

//         const handleOpen = () => {
//         setIsEditing(false);
//         setCurrentItem({
//             productId: '',
//             storeId: '',
//             color: '',
//             size: '',
//             quantity: ''
//         });
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setCurrentItem(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
    
//         // Adjust the inventoryItem structure to fit the Inventory model
//         const inventoryItem = {
//             productId: currentItem.productId,
//             storeId: currentItem.storeId,
//             variants: [{
//                 color: currentItem.color,
//                 size: currentItem.size,
//                 quantity: parseInt(currentItem.quantity, 10) // Ensure quantity is an integer
//             }]
//         };
//         console.log(inventoryItem);
    
//         try {
//             if (isEditing) {
//                 // Update inventory item logic, ensure it supports the adjusted structure
//             } else {
//                 await axios.post(`${BASE_URL}/Inventory/createinventory`, inventoryItem);
//             }
//             handleClose();
//         } catch (error) {
//             console.error('Failed to submit inventory:', error);
//         }
//     };
    

//     return (
//         <Container maxWidth="lg">
//             <Typography variant="h4" gutterBottom>
//                 Inventory Management
//             </Typography>
//             <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
//                  Add Inventory Item
//             </Button>

//             <Dialog open={open} onClose={handleClose}>
//                  <DialogTitle>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
//                  <DialogContent>
//                      {/* Product Dropdown */}
//                      <FormControl fullWidth margin="dense">
//                          <InputLabel>Product</InputLabel>
//                          <Select
//                             name="productId"
//                             value={currentItem.productId}
//                             onChange={handleChange}
//                             label="Product"
//                         >
//                             {products.map((product) => (
//                                 <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                     {/* Store Dropdown */}
//                     <FormControl fullWidth margin="dense">
//                          <InputLabel>Store</InputLabel>
//                          <Select
//                             name="storeId"
//                             value={currentItem.storeId}
//                             onChange={handleChange}
//                             label="Store"
//                         >
//                             {stores.map((store) => (
//                                 <MenuItem key={store._id} value={store._id}>{store.name}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                     {/* Other Fields */}
//                     <TextField margin="dense" name="color" label="Color" fullWidth variant="outlined" value={currentItem.color} onChange={handleChange} />
//                     <TextField margin="dense" name="size" label="Size" fullWidth variant="outlined" value={currentItem.size} onChange={handleChange} />
//                     <TextField margin="dense" name="quantity" label="Quantity" type="number" fullWidth variant="outlined" value={currentItem.quantity} onChange={handleChange} />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>Cancel</Button>
//                     <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
//                 </DialogActions>
//             </Dialog>

//             {stores.map((store) => (
//                 <Accordion key={store._id}>
//                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                         <Typography>{store.name}</Typography>
//                     </AccordionSummary>
//                     <AccordionDetails>
//                         <TableContainer component={Paper}>
//                             <Table>
//                                 <TableHead>
//                                     <TableRow>
//                                         <TableCell>Product Name</TableCell>
//                                         <TableCell align="right">Color</TableCell>
//                                         <TableCell align="right">Size</TableCell>
//                                         <TableCell align="right">Quantity</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {getInventoryByStore(store._id).map((item) => (
//                                         item.variants.map((variant, index) => (
//                                             <TableRow key={`${item._id}-${index}`}>
//                                                 <TableCell component="th" scope="row">
//                                                     {getProductNameById(item.productId)}
//                                                 </TableCell>
//                                                 <TableCell align="right">{variant.color}</TableCell>
//                                                 <TableCell align="right">{variant.size}</TableCell>
//                                                 <TableCell align="right">{variant.quantity}</TableCell>
//                                             </TableRow>
//                                         ))
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </AccordionDetails>
//                 </Accordion>
//             ))}
//         </Container>
//     );
// };

// export default InventoryManagementPage;
