import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, TextField, Container, Select, MenuItem,
  FormControl, InputLabel, Box, CircularProgress, TablePagination, Checkbox, FormControlLabel,
  Button, Popover, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid, Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { saveAs } from 'file-saver';
import Sidebar from './Sidebar';
import { BASE_URL } from './config';
import { io } from 'socket.io-client';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './InventoryPage.css';

// Real-time updates with WebSockets
const socket = io(BASE_URL);

const InventoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState(''); // No default sort order
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [stockFilters, setStockFilters] = useState({
    outOfStock: true,
    inventoryLow: true,
    inStock: true
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);

  // State for dialog forms
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [inventoryForm, setInventoryForm] = useState({
    productCode: '',
    variants: [{ color: '', size: '', quantity: 0 }]
  });
  const [editInventoryId, setEditInventoryId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchVendorDetails();
    fetchProducts();

    return () => {
      socket.off('inventory-update');
    };
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      setVendorDetails(vendorDetails);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;
      if (storeId) {
        const response = await axios.get(`${BASE_URL}/Product/inventory-by-store/${storeId}`);
        setProducts(response.data);
      } else {
        console.warn("No stores found for vendor");
        setProducts([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    setSortOrder(newSortOrder);
  };

  const handleStockFilterChange = (event) => {
    setStockFilters({
      ...stockFilters,
      [event.target.name]: event.target.checked
    });
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < lowStockThreshold) return 'Inventory Low';
    return 'In Stock';
  };

  const getTagStyle = (status) => {
    switch (status) {
      case 'Out of Stock':
        return { borderColor: '#d32f2f', color: '#d32f2f' }; // Bright Red
      case 'Inventory Low':
        return { borderColor: '#ffb300', color: '#ffb300' }; // Bright Amber
      case 'In Stock':
        return { borderColor: '#388e3c', color: '#388e3c' }; // Bright Green
      default:
        return { borderColor: '#757575', color: '#757575' }; // Bright Grey
    }
  };

  const flattenedProducts = products.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      productCode: product.productCode,
      name: product.name,
      inventoryId: product.inventoryId,
      productId: product._id,
    }))
  );

  const filteredProducts = flattenedProducts.filter((variant) => {
    const searchTerm = searchQuery.toLowerCase();
    const stockStatus = getStockStatus(variant.quantity).toLowerCase();
    return (
      (variant.productCode && variant.productCode.toLowerCase().includes(searchTerm)) ||
      (variant.name && variant.name.toLowerCase().includes(searchTerm)) ||
      (variant.color && variant.color.toLowerCase().includes(searchTerm)) ||
      (variant.size && variant.size.toLowerCase().includes(searchTerm)) ||
      (variant.quantity && variant.quantity.toString().toLowerCase().includes(searchTerm)) ||
      stockStatus.includes(searchTerm)
    );
  }).filter((variant) => {
    const stockStatus = getStockStatus(variant.quantity);
    return (
      (stockStatus === 'Out of Stock' && stockFilters.outOfStock) ||
      (stockStatus === 'Inventory Low' && stockFilters.inventoryLow) ||
      (stockStatus === 'In Stock' && stockFilters.inStock)
    );
  });

  const sortProductsByQuantity = (variants, order) => {
    return [...variants].sort((a, b) => {
      const quantityA = parseInt(a.quantity, 10);
      const quantityB = parseInt(b.quantity, 10);
      return order === 'asc' ? quantityA - quantityB : quantityB - quantityA;
    });
  };

  const sortedProducts = sortOrder ? sortProductsByQuantity(filteredProducts, sortOrder) : filteredProducts;

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  const handleDialogOpen = (type, inventory = null) => {
    setDialogType(type);
    if (type === 'edit' && inventory) {
      const productVariants = products.find(p => p.inventoryId === inventory.inventoryId).variants;
      setInventoryForm({
        productCode: inventory.productCode,
        variants: productVariants
      });
      setEditInventoryId(inventory.inventoryId); // Ensure the inventory ID is set
    } else {
      setInventoryForm({
        productCode: '',
        variants: [{ color: '', size: '', quantity: 0 }]
      });
      setEditInventoryId(null);
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event, index, type) => {
    const { name, value } = event.target;
    if (type === 'variant') {
      const updatedVariants = [...inventoryForm.variants];
      updatedVariants[index] = { ...updatedVariants[index], [name]: value };
      setInventoryForm({ ...inventoryForm, variants: updatedVariants });
    } else {
      setInventoryForm({ ...inventoryForm, [name]: value });
    }
  };

  const handleAddVariant = () => {
    setInventoryForm({
      ...inventoryForm,
      variants: [...inventoryForm.variants, { color: '', size: '', quantity: 0 }]
    });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = inventoryForm.variants.filter((_, i) => i !== index);
    setInventoryForm({ ...inventoryForm, variants: updatedVariants });
  };

  const handleAddInventory = async () => {
    try {
      const storeId = vendorDetails && vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;
      if (!storeId) {
        console.error('No store ID found');
        enqueueSnackbar('No store ID found', { variant: 'error', autoHideDuration: 3000 });
        return;
      }
      await axios.post(`${BASE_URL}/Inventory/createinventory`, { ...inventoryForm, storeId });
      enqueueSnackbar('Inventory added successfully', { variant: 'success', autoHideDuration: 3000 });
      fetchProducts();
      handleDialogClose();
    } catch (error) {
      console.error('Failed to add inventory:', error);
      enqueueSnackbar('Failed to add inventory', { variant: 'error', autoHideDuration: 3000 });
    }
  };

  const handleUpdateInventory = async () => {
    try {
      if (!editInventoryId) {
        console.error('No inventory ID set for update');
        throw new Error('No inventory ID set for update');
      }
      await axios.put(`${BASE_URL}/Inventory/updateinventory/${editInventoryId}`, inventoryForm);
      enqueueSnackbar('Inventory updated successfully', { variant: 'success', autoHideDuration: 3000 });
      fetchProducts();
      handleDialogClose();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      enqueueSnackbar('Failed to update inventory', { variant: 'error', autoHideDuration: 3000 });
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    try {
      await axios.delete(`${BASE_URL}/Inventory/deleteinventory/${inventoryId}`);
      enqueueSnackbar('Inventory deleted successfully', { variant: 'success', autoHideDuration: 3000 });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete inventory:', error);
      enqueueSnackbar('Failed to delete inventory', { variant: 'error', autoHideDuration: 3000 });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Product Code', 'Name', 'Color', 'Size', 'Quantity', 'Stock Status'];
    const rows = paginatedProducts.map((variant) => [
      variant.productCode,
      variant.name,
      variant.color,
      variant.size,
      variant.quantity,
      getStockStatus(variant.quantity)
    ]);
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(',')) 
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory.csv');
  };

  return (
    <Container maxWidth="lg" className="inventory-page">
      <Box className="main-container">
        <Sidebar />
        <Box component="main" className="inventory-main-content">
          <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1e90ff' }}>
            Inventory
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: '50%' }}
            />
            <Box className="button-container">
              <Button variant="contained" onClick={() => handleDialogOpen('add')} className="inventory-custom-button">
                Add Inventory
              </Button>
              <Button variant="contained" onClick={handleFilterButtonClick} className="inventory-custom-button">
                Filters
              </Button>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="sort-label">Sort</InputLabel>
                    <Select
                      labelId="sort-label"
                      value={sortOrder}
                      onChange={handleSortChange}
                      label="Sort"
                      size="small"
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="asc">Asc</MenuItem>
                      <MenuItem value="desc">Desc</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Low Stock Threshold"
                    variant="outlined"
                    type="number"
                    size="small"
                    fullWidth
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10))}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Stock Status</Typography>
                  <FormControlLabel
                    control={<Checkbox checked={stockFilters.outOfStock} onChange={handleStockFilterChange} name="outOfStock" />}
                    label="Out of Stock"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={stockFilters.inventoryLow} onChange={handleStockFilterChange} name="inventoryLow" />}
                    label="Inventory Low"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={stockFilters.inStock} onChange={handleStockFilterChange} name="inStock" />}
                    label="In Stock"
                  />
                  <Button variant="contained" onClick={handleFilterClose} sx={{ mt: 2 }}>
                    Done
                  </Button>
                </Box>
              </Popover>
              <Button variant="contained" onClick={handleExportCSV} className="inventory-custom-button">
                Export CSV
              </Button>
            </Box>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
              <CircularProgress />
            </Box>
          ) : filteredProducts.length > 0 ? (
            <>
              <TableContainer component={Paper} className="inventory-table-container">
                <Table className="inventory-custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Product Code</TableCell>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Color</TableCell>
                      <TableCell align="center">Size</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProducts.map((variant) => (
                      <TableRow key={`${variant.productCode}-${variant.color}-${variant.size}`}>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.productCode}</TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.name}</TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.color}</TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.size}</TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.quantity}</TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>
                          <Chip
                            label={getStockStatus(variant.quantity)}
                            style={{
                              border: `1px solid ${getTagStyle(getStockStatus(variant.quantity)).borderColor}`,
                              color: getTagStyle(getStockStatus(variant.quantity)).color,
                              backgroundColor: 'transparent'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" style={{ padding: '6px 12px' }}>
                          <IconButton className="edit-button" onClick={() => handleDialogOpen('edit', variant)}>
                            <FaEdit />
                          </IconButton>
                          <IconButton className="delete-button" onClick={() => handleDeleteInventory(variant.inventoryId)}>
                            <FaTrashAlt />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredProducts.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[15, 30, 45]}  // Options for rows per page
              />
            </>
          ) : (
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Nothing matches the search
            </Typography>
          )}

          <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>{dialogType === 'add' ? 'Add Inventory' : 'Edit Inventory'}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please fill in the form below to {dialogType === 'add' ? 'add a new' : 'edit the'} inventory item.
              </DialogContentText>
              <TextField
                margin="dense"
                label="Product Code"
                fullWidth
                name="productCode"
                value={inventoryForm.productCode}
                onChange={(e) => setInventoryForm({ ...inventoryForm, productCode: e.target.value })}
              />
              {inventoryForm.variants.map((variant, index) => (
                <Grid container spacing={2} key={index}>
                  <Grid item xs={4}>
                    <TextField
                      margin="dense"
                      label="Color"
                      name="color"
                      fullWidth
                      value={variant.color}
                      onChange={(e) => handleFormChange(e, index, 'variant')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      margin="dense"
                      label="Size"
                      name="size"
                      fullWidth
                      value={variant.size}
                      onChange={(e) => handleFormChange(e, index, 'variant')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      margin="dense"
                      label="Quantity"
                      name="quantity"
                      type="number"
                      fullWidth
                      value={variant.quantity}
                      onChange={(e) => handleFormChange(e, index, 'variant')}
                    />
                  </Grid>
                  {index > 0 && (
                    <Grid item xs={12}>
                      <Button onClick={() => handleRemoveVariant(index)}>Remove</Button>
                    </Grid>
                  )}
                </Grid>
              ))}
              <Button onClick={handleAddVariant}>Add Variant</Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={dialogType === 'add' ? handleAddInventory : handleUpdateInventory}>
                {dialogType === 'add' ? 'Add' : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default InventoryPage;
