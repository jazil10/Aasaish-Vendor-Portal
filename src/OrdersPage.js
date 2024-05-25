import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrdersPage.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Container, CircularProgress, TablePagination
} from '@mui/material';
import Sidebar from './Sidebar';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

function OrdersPage() {
  const { enqueueSnackbar } = useSnackbar(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get(`${BASE_URL}/Order/vendor-orders`);
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, itemId) => {
    try {
      console.log(`Deleting order item. Order ID: ${orderId}, Item ID: ${itemId}`);
      await axios.put(`${BASE_URL}/Order/cancel/vendor/${orderId}/${itemId}`);
      console.log('Order item cancelled successfully');
      fetchOrders(); // Refresh the list after deleting
      enqueueSnackbar('Order item cancelled successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to cancel order item:", error);
      enqueueSnackbar('Failed to cancel order item', { variant: 'error' });
    }
  };

  const handlePageChange = (event, newPage) => {
    console.log(`Page changed to: ${newPage}`);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    console.log(`Rows per page changed to: ${event.target.value}`);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  console.log('Paginated orders:', paginatedOrders);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Vendor Orders
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} className="table-container">
                <Table className="custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      order.items.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>{order._id}</TableCell>
                          <TableCell>{item.productId ? item.productId.name : 'N/A'}</TableCell>
                          <TableCell>{`Color: ${item.variant.color}, Size: ${item.variant.size}`}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell className="action-buttons">
                            <IconButton
                              className="delete-button"
                              onClick={() => handleDeleteOrder(order._id, item._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={orders.length}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableContainer>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default OrdersPage;
