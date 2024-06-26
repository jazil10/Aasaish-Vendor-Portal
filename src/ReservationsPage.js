import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationsPage.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Container, CircularProgress, TablePagination, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import Sidebar from './Sidebar';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

function ReservationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Reservation/vendor`);
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId, itemId) => {
    try {
      await axios.put(`${BASE_URL}/Reservation/cancel/vendor/${reservationId}/${itemId}`);
      fetchReservations();
      enqueueSnackbar('Reservation item cancelled successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to cancel reservation item', { variant: 'error' });
    }
  };

  const handleCompleteReservation = async (reservationId, itemId) => {
    try {
      await axios.put(`${BASE_URL}/Reservation/complete/vendor/${reservationId}/${itemId}`);
      fetchReservations();
      enqueueSnackbar('Reservation item completed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to complete reservation item', { variant: 'error' });
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

  const getTagStyle = (status) => {
    switch (status) {
      case 'Active':
        return { borderColor: '#388e3c', color: '#388e3c' }; // Bright Green
      case 'Expired':
        return { borderColor: '#d32f2f', color: '#d32f2f' }; // Bright Red
      case 'Cancelled by Vendor':
      case 'Cancelled by Customer':
        return { borderColor: '#f57c00', color: '#f57c00' }; // Bright Orange
      case 'Completed':
        return { borderColor: '#0288d1', color: '#0288d1' }; // Bright Blue
      default:
        return { borderColor: '#757575', color: '#757575' }; // Bright Grey
    }
  };

  const calculateHoursUntilExpiration = (expiresAt) => {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const differenceInMilliseconds = expirationDate - now;
    return Math.max(0, Math.floor(differenceInMilliseconds / (1000 * 60 * 60)));
  };

  const filteredReservations = reservations.filter((reservation) => {
    return reservation.items.some((item) => {
      const matchesSearchQuery = 
        (!searchQuery ||
        (item.productId?.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variant.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variant.size.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearchQuery && matchesStatus;
    });
  });

  const paginatedReservations = filteredReservations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", ml: -7 }}> {/* Move layout towards left */}
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="reservation-main-content">
        <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1e90ff' }}>
Reservations 
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
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Cancelled by Vendor">Cancelled by Vendor</MenuItem>
                <MenuItem value="Cancelled by Customer">Cancelled by Customer</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} className="reservation-table-container">
                <Table className="reservation-custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Reservation ID</TableCell>
                      <TableCell align="center">Product Code</TableCell>
                      <TableCell align="center">Product Name</TableCell>
                      <TableCell align="center">Variant</TableCell>
                      <TableCell align="center">Expires In</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedReservations.map((reservation) => (
                      reservation.items.map((item) => {
                        if ((searchQuery && 
                            !item.productId?.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                            !item.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                            !reservation._id.toLowerCase().includes(searchQuery.toLowerCase()) &&
                            !item.variant.color.toLowerCase().includes(searchQuery.toLowerCase()) &&
                            !item.variant.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (filterStatus && item.status !== filterStatus)) {
                          return null;
                        }
                        const isDisabled = item.status !== 'Active';
                        const tooltipMessage = item.status === 'Expired' ? 
                          'Action not available: Reservation is expired' : 
                          item.status === 'Cancelled by Vendor' || item.status === 'Cancelled by Customer' ? 
                          'Action not available: Reservation is cancelled' : 
                          item.status === 'Completed' ? 
                          'Action not available: Reservation is completed' : '';

                        return (
                          <TableRow key={item._id}>
                            <TableCell align="center">{reservation._id}</TableCell>
                            <TableCell align="center">{item.productId ? item.productId.productCode : 'N/A'}</TableCell>
                            <TableCell align="center">{item.productId ? item.productId.name : 'N/A'}</TableCell>
                            <TableCell align="center">{`Color: ${item.variant.color}, Size: ${item.variant.size}`}</TableCell>
                            <TableCell align="center">{calculateHoursUntilExpiration(item.expiresAt)} hours</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status}
                                style={{
                                  border: `1px solid ${getTagStyle(item.status).borderColor}`,
                                  color: getTagStyle(item.status).color,
                                  backgroundColor: 'transparent'
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" className="reservation-action-buttons">
                              <Tooltip title={tooltipMessage} disableHoverListener={!isDisabled}>
                                <span>
                                  <IconButton
                                    className="reservation-cancel-button"
                                    onClick={() => handleDeleteReservation(reservation._id, item._id)}
                                    disabled={isDisabled}
                                    style={{ color: isDisabled ? 'grey' : 'red' }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={tooltipMessage} disableHoverListener={!isDisabled}>
                                <span>
                                  <IconButton
                                    className="reservation-complete-button"
                                    onClick={() => handleCompleteReservation(reservation._id, item._id)}
                                    disabled={isDisabled}
                                    style={{ color: isDisabled ? 'grey' : 'green' }}
                                  >
                                    <DoneIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredReservations.length}
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

export default ReservationsPage;
