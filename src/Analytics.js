import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const AnalyticsPage = () => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#FFFFFF' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#FFFFFF' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    },
    plugins: { legend: { labels: { color: '#FFFFFF' } } }
  };

  const ScoreCard = ({ title, value }) => (
    <div style={styles.scorecard}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );

  // Dummy data for the charts
  const topProductsData = {
    labels: ['Kurtas', 'Pants', 'Scarves', 'Bags', 'Shawls'],
    datasets: [{
      label: 'Sales',
      data: [5000, 3000, 2000, 1500, 1000],
      backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
      borderColor: ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
      borderWidth: 1,
    }]
  };

  const topCategoriesData = {
    labels: ['Women', 'Men', 'Kids'],
    datasets: [{
      data: [15000, 5000, 2500],
      backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      borderColor: ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1,
    }]
  };

  const salesTrendsData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
      label: 'Monthly Sales',
      data: [12000, 19000, 17000, 22000, 15000, 20000],
      fill: false,
      borderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
    }]
  };

  const customerSatisfactionData = {
    labels: ['Satisfied', 'Neutral', 'Dissatisfied'],
    datasets: [{
      data: [80, 15, 5],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255,99,132,1)'],
      borderWidth: 1,
    }]
  };    

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Khaadi Analytics Dashboard</h1>
      <div style={styles.scorecardsContainer}>
        <ScoreCard title="Total Sales This Month" value="PKR 2.5M" />
        <ScoreCard title="Average Rating" value="4.8 Stars" />
      </div>
      <div style={styles.chartsContainer}>
        <div style={styles.chart}>
          <Bar data={topProductsData} options={commonOptions} />
        </div>
        <div style={styles.chart}>
          <Pie data={topCategoriesData} options={commonOptions} />
        </div>
        <div style={styles.chart}>
          <Line data={salesTrendsData} options={commonOptions} />
        </div>
        <div style={styles.chart}>
          <Pie data={customerSatisfactionData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '20px'
  },
  header: {
    textAlign: 'center', color: '#ecf0f1', marginBottom: '20px'
  },
  scorecardsContainer: {
    display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px'
  },
  scorecard: {
    background: '#455A64', // Non-transparent background
    padding: '10px 15px', // Reduced size
    borderRadius: '8px', 
    color: '#FFA500',
    width: '180px', // Reduced width for smaller size
    textAlign: 'center'
  },
  chartsContainer: {
    display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px'
  },
  chart: {
    width: '100%', 
    maxWidth: '600px', // Increased size for better visibility
    height: '400px', // Increased height
    padding: '10px',
    background: '#37474F', // Adding a slight background to charts for distinction
    borderRadius: '8px'
  }
};

export default AnalyticsPage;
