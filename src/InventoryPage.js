import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, TextField, Container, Select, MenuItem,
  FormControl, InputLabel, Box, CircularProgress, TablePagination, Checkbox, FormControlLabel,
  Button, Popover
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Sidebar from './Sidebar';
import { BASE_URL } from './config';
import { io } from 'socket.io-client';

// Real-time updates with WebSockets
const socket = io(BASE_URL);

const InventoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [stockFilters, setStockFilters] = useState({
    outOfStock: true,
    inventoryLow: true,
    inStock: true
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchVendorDetails();
    fetchProducts();

    // Real-time updates
    socket.on('inventory-update', (updatedInventory) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedInventory.productId ? updatedInventory : product
        )
      );
    });

    return () => {
      socket.off('inventory-update');
    };
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      // Handle vendor details logic
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const { data: vendorDetails } = await axios.get(`${BASE_URL}/User/vendorbyid`);
      const storeId = vendorDetails.stores.length > 0 ? vendorDetails.stores[0]._id : null;
      const response = await axios.get(`${BASE_URL}/Product/inventory-by-store/${storeId}`);
      setProducts(response.data);
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

  const filteredProducts = products.filter((product) => {
    const searchTerm = searchQuery.toLowerCase();
    return product.variants.some((variant) => {
      const stockStatus = getStockStatus(variant.quantity).toLowerCase();
      return (
        (product.productCode && product.productCode.toLowerCase().includes(searchTerm)) ||
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (variant.color && variant.color.toLowerCase().includes(searchTerm)) ||
        (variant.size && variant.size.toLowerCase().includes(searchTerm)) ||
        (variant.quantity && variant.quantity.toString().toLowerCase().includes(searchTerm)) ||
        stockStatus.includes(searchTerm)
      );
    });
  }).filter((product) => {
    return product.variants.some((variant) => {
      const stockStatus = getStockStatus(variant.quantity);
      return (
        (stockStatus === 'Out of Stock' && stockFilters.outOfStock) ||
        (stockStatus === 'Inventory Low' && stockFilters.inventoryLow) ||
        (stockStatus === 'In Stock' && stockFilters.inStock)
      );
    });
  });

  const sortProductsByQuantity = (products, order) => {
    return [...products].sort((a, b) => {
      const totalQuantityA = a.variants.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
      const totalQuantityB = b.variants.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
      return order === 'asc' ? totalQuantityA - totalQuantityB : totalQuantityB - totalQuantityA;
    });
  };

  const sortedProducts = sortProductsByQuantity(filteredProducts, sortOrder);

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: '50%' }}
            />
            <Button variant="contained" onClick={handleFilterButtonClick}>
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
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
              <CircularProgress />
            </Box>
          ) : filteredProducts.length > 0 ? (
            <>
              <TableContainer component={Paper} className="table-container">
                <Table className="custom-table" aria-label="customized table">
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
                    {paginatedProducts.map((product) =>
                      product.variants.map((variant) => (
                        <TableRow key={`${product.id}-${variant.color}-${variant.size}`}>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{product.productCode}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{product.name}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.color}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.size}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{variant.quantity}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>{getStockStatus(variant.quantity)}</TableCell>
                          <TableCell align="center" style={{ padding: '6px 12px' }}>
                            <IconButton color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton color="secondary">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
                rowsPerPageOptions={[10, 20, 30]}  // Options for rows per page
              />
            </>
          ) : (
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Nothing matches the search
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default InventoryPage;

