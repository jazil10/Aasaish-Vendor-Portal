import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrdersPage.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Container, CircularProgress, TablePagination, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Modal, Link, Divider, Button, Grid
} from '@mui/material';
import Sidebar from './Sidebar';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'; // Icon for returning a package
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PaymentIcon from '@mui/icons-material/Payment';
import ListIcon from '@mui/icons-material/List';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

function OrdersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Order/vendor-orders`);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find((order) => order._id === orderId);
      if (!order) return;

      const updateRequests = order.items.map((item) =>
        axios.patch(`${BASE_URL}/Order/update-item-status`, { orderId, itemId: item._id, status: newStatus })
      );

      await Promise.all(updateRequests);
      fetchOrders();
      enqueueSnackbar('Order status updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update order status', { variant: 'error' });
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const getMainStatus = (status) => {
    if (status === 'Pending' || status === 'Processing' || status === 'Shipped') {
      return 'Active';
    } else if (status === 'Delivered' || status === 'Returned') {
      return 'Inactive';
    } else if (status === 'Cancelled') {
      return 'Inactive';
    }
    return 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Error':
        return '#e57373'; // Bright Red
      case 'Active':
        return '#388e3c'; // Sharp Green
      case 'Inactive':
        return '#bdbdbd'; // Bright Grey
      default:
        return '#bdbdbd'; // Bright Grey
    }
  };

  const filteredOrders = orders.filter((order) => {
    return order.items.some((item) => {
      const matchesSearchQuery =
        !searchQuery ||
        item.productId?.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variant.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variant.size.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearchQuery && matchesStatus;
    });
  });

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" className="orders-main-content">
          <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1e90ff' }}>
            Orders
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: '30%' }}
            />
            <FormControl variant="outlined" size="small" sx={{ width: '20%' }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={handleFilterStatusChange} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} className="orders-table-container">
                <Table className="orders-custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Total Quantity</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Most Recent Tag</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => {
                      const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);
                      const mainStatus = getMainStatus(order.items[0].status);
                      const mostRecentTag = order.items[order.items.length - 1].status;

                      return (
                        <TableRow key={order._id}>
                          <TableCell>
                            <Link href="#" onClick={() => handleOpenModal(order)}>
                              {order._id}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getStatusColor(mainStatus), marginRight: 8 }}></span>
                              {mainStatus}
                            </Box>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{totalQuantity}</TableCell>
                          <TableCell>Rs. {order.total}</TableCell>
                          <TableCell>{order.paymentMethod}</TableCell>
                          <TableCell>
                            <Chip
                              label={mostRecentTag}
                              style={{ border: `1px solid ${getStatusColor(getMainStatus(mostRecentTag))}`, color: getStatusColor(getMainStatus(mostRecentTag)), backgroundColor: 'transparent' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Cancel Order">
                              <span>
                                <IconButton
                                  className="cancel-button"
                                  onClick={() => handleStatusChange(order._id, 'Cancelled')}
                                  disabled={order.items.some((item) => item.status === 'Cancelled' || item.status === 'Delivered')}
                                  style={{ color: order.items.some((item) => item.status === 'Cancelled' || item.status === 'Delivered') ? 'grey' : 'red' }}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {order.items.some((item) => item.status === 'Pending') && (
                              <Tooltip title="Mark as Processing">
                                <span>
                                  <IconButton
                                    className="processing-button"
                                    onClick={() => handleStatusChange(order._id, 'Processing')}
                                    style={{ color: 'orange' }}
                                  >
                                    <BuildIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            {order.items.some((item) => item.status === 'Processing') && (
                              <Tooltip title="Mark as Shipped">
                                <span>
                                  <IconButton
                                    className="shipped-button"
                                    onClick={() => handleStatusChange(order._id, 'Shipped')}
                                    style={{ color: 'blue' }}
                                  >
                                    <LocalShippingIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            {order.items.some((item) => item.status === 'Shipped') && (
                              <Tooltip title="Mark as Delivered">
                                <span>
                                  <IconButton
                                    className="complete-button"
                                    onClick={() => handleStatusChange(order._id, 'Delivered')}
                                    style={{ color: 'green' }}
                                  >
                                    <DoneIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            {order.items.some((item) => item.status === 'Delivered') && (
                              <Tooltip title="Mark as Returned">
                                <span>
                                  <IconButton
                                    className="returned-button"
                                    onClick={() => handleStatusChange(order._id, 'Returned')}
                                    style={{ color: 'red' }}
                                  >
                                    <AssignmentReturnIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredOrders.length}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableContainer>

              {/* Modal for secondary details */}
              {selectedOrder && (
                <Modal open={openModal} onClose={handleCloseModal}>
                  <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 1
                  }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListIcon sx={{ marginRight: 1 }} /> Order #{selectedOrder._id}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ marginRight: 1, color: 'grey' }} /> <strong>Customer Name: </strong> {selectedOrder.userId?.firstname} {selectedOrder.userId?.lastname}
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ marginRight: 1, color: 'grey' }} /> <strong>Email: </strong> {selectedOrder.userId?.email}
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PaymentIcon sx={{ marginRight: 1, color: 'grey' }} /> <strong>Total Amount: </strong> Rs. {selectedOrder.total}
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PaymentIcon sx={{ marginRight: 1, color: 'grey' }} /> <strong>Payment Method: </strong> {selectedOrder.paymentMethod}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ListIcon sx={{ marginRight: 1, color: 'grey' }} /> <strong>Items: </strong>
                        </Typography>
                        <TableContainer component={Paper} className="items-table-container">
                          <Table className="orders-custom-table" aria-label="items table">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Color</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedOrder.items.map((item) => (
                                <TableRow key={item._id}>
                                  <TableCell>{item.productId.name}</TableCell>
                                  <TableCell>{item.variant.color}</TableCell>
                                  <TableCell>{item.variant.size}</TableCell>
                                  <TableCell>Rs. {item.price}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography variant="body1" sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <strong>Total: Rs. {selectedOrder.total}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
                      <Button onClick={handleCloseModal} variant="contained" color="primary">
                        Close
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default OrdersPage;
