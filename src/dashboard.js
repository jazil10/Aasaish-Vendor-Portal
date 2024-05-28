import React from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardPage = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <TopBar />
        <Box sx={{ padding: '20px' }}>
          <Typography variant="h4" gutterBottom>
            Analytics
          </Typography>
          {/* Embed your PowerBI dashboard here */}
          <Box sx={{ height: '500px', bgcolor: '#e0e0e0', borderRadius: '10px' }}>
            {/* Placeholder for PowerBI dashboard */}
            <Typography variant="body1" sx={{ padding: '20px' }}>
              PowerBI Dashboard will be embedded here.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
