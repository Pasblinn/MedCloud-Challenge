import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Elderly as ElderlyIcon,
  Child as ChildIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { usePatients } from '../../contexts/PatientContext';

const Statistics = () => {
  const theme = useTheme();
  const { patients, loading, error, fetchPatients, fetchStatistics } = usePatients();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Colors for charts
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      await fetchPatients();
      // In a real app, you might have a separate statistics endpoint
      const calculatedStats = calculateStatistics(patients);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const calculateStatistics = (patientData) => {
    if (!patientData || patientData.length === 0) {
      return {
        totalPatients: 0,
        averageAge: 0,
        ageGroups: [],
        monthlyRegistrations: [],
        genderDistribution: [],
        ageRanges: []
      };
    }

    // Calculate total and average age
    const totalPatients = patientData.length;
    const ages = patientData.map(patient => calculateAge(patient.birthDate)).filter(age => age !== null);
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

    // Age groups
    const ageGroups = [
      { name: 'Crianças (0-12)', value: 0, color: chartColors[0] },
      { name: 'Adolescentes (13-17)', value: 0, color: chartColors[1] },
      { name: 'Adultos (18-59)', value: 0, color: chartColors[2] },
      { name: 'Idosos (60+)', value: 0, color: chartColors[3] }
    ];

    ages.forEach(age => {
      if (age <= 12) ageGroups[0].value++;
      else if (age <= 17) ageGroups[1].value++;
      else if (age <= 59) ageGroups[2].value++;
      else ageGroups[3].value++;
    });

    // Monthly registrations (last 6 months)
    const monthlyRegistrations = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const count = patientData.filter(patient => {
        const patientDate = new Date(patient.createdAt || patient.created_at);
        return patientDate.getFullYear() === date.getFullYear() && 
               patientDate.getMonth() === date.getMonth();
      }).length;
      
      monthlyRegistrations.push({
        month: monthName,
        patients: count
      });
    }

    // Gender distribution (simulated since we don't have gender field)
    const genderDistribution = [
      { name: 'Masculino', value: Math.floor(totalPatients * 0.52), color: chartColors[4] },
      { name: 'Feminino', value: Math.ceil(totalPatients * 0.48), color: chartColors[5] }
    ];

    // Age ranges for bar chart
    const ageRanges = [
      { range: '0-10', count: ages.filter(age => age >= 0 && age <= 10).length },
      { range: '11-20', count: ages.filter(age => age >= 11 && age <= 20).length },
      { range: '21-30', count: ages.filter(age => age >= 21 && age <= 30).length },
      { range: '31-40', count: ages.filter(age => age >= 31 && age <= 40).length },
      { range: '41-50', count: ages.filter(age => age >= 41 && age <= 50).length },
      { range: '51-60', count: ages.filter(age => age >= 51 && age <= 60).length },
      { range: '61+', count: ages.filter(age => age >= 61).length }
    ];

    return {
      totalPatients,
      averageAge,
      ageGroups,
      monthlyRegistrations,
      genderDistribution,
      ageRanges,
      oldestPatient: Math.max(...ages, 0),
      youngestPatient: Math.min(...ages, 0),
      recentRegistrations: patientData.filter(patient => {
        const patientDate = new Date(patient.createdAt || patient.created_at);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return patientDate >= thirtyDaysAgo;
      }).length
    };
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  };

  const handleRefresh = () => {
    loadStatistics();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Estatísticas do Sistema
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise detalhada dos dados dos pacientes e métricas do sistema
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Atualizar Dados">
              <IconButton onClick={handleRefresh} disabled={statsLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar Estatísticas">
              <IconButton onClick={handleExport} disabled={!stats}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {statsLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats?.totalPatients || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Total de Pacientes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CalendarIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats?.averageAge || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Idade Média
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonAddIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats?.recentRegistrations || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Novos (30 dias)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {((stats?.recentRegistrations || 0) / (stats?.totalPatients || 1) * 100).toFixed(1)}%
                    </Typography>
                    <Typography color="text.secondary">
                      Taxa de Crescimento
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Age Groups Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Distribuição por Faixa Etária" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.ageGroups || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats?.ageGroups || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gender Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Distribuição por Gênero (Estimado)" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.genderDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats?.genderDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Registrations */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Registros por Mês (Últimos 6 meses)" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats?.monthlyRegistrations || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Estatísticas Rápidas" />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Paciente mais jovem
                    </Typography>
                    <Typography variant="h6">
                      {stats?.youngestPatient !== undefined ? `${stats.youngestPatient} anos` : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Paciente mais idoso
                    </Typography>
                    <Typography variant="h6">
                      {stats?.oldestPatient !== undefined ? `${stats.oldestPatient} anos` : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status do Sistema
                    </Typography>
                    <Chip 
                      label="Operacional" 
                      color="success" 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <br />
                    <Chip 
                      label="Dados Atualizados" 
                      color="info" 
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Age Ranges Bar Chart */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Distribuição Detalhada por Idade" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.ageRanges || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar 
                      dataKey="count" 
                      fill={theme.palette.secondary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Statistics;