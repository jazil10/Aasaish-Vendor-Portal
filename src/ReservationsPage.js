import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationsPage.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Container, CircularProgress, TablePagination, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem
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
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Vendor Reservations
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
              <TableContainer component={Paper} className="table-container">
                <Table className="custom-table" aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reservation ID</TableCell>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
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
                            <TableCell>{reservation._id}</TableCell>
                            <TableCell>{item.productId ? item.productId.productCode : 'N/A'}</TableCell>
                            <TableCell>{item.productId ? item.productId.name : 'N/A'}</TableCell>
                            <TableCell>{`Color: ${item.variant.color}, Size: ${item.variant.size}`}</TableCell>
                            <TableCell>{item.status}</TableCell>
                            <TableCell className="action-buttons">
                              <Tooltip title={tooltipMessage} disableHoverListener={!isDisabled}>
                                <span>
                                  <IconButton
                                    className="cancel-button"
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
                                    className="complete-button"
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
