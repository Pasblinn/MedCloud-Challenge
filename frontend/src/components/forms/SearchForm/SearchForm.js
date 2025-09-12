import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Collapse,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const SearchForm = ({ 
  onSearch, 
  onFiltersChange, 
  initialFilters = {},
  loading = false 
}) => {
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filters, setFilters] = useState({
    search: initialFilters.search || initialFilters.query || '',
    sortBy: initialFilters.sortBy || 'createdAt',
    sortOrder: initialFilters.sortOrder || 'desc',
    ageGroup: initialFilters.ageGroup || 'all',
    minAge: initialFilters.minAge || '',
    maxAge: initialFilters.maxAge || ''
  });

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchData) => {
      if (onSearch) onSearch(searchData);
    }, 300),
    [onSearch]
  );

  // Convert ageGroup to minAge/maxAge
  const convertFiltersForBackend = (filterData) => {
    const backendFilters = { ...filterData };
    
    // Convert ageGroup to minAge/maxAge
    if (filterData.ageGroup && filterData.ageGroup !== 'all') {
      switch (filterData.ageGroup) {
        case 'minor':
          backendFilters.minAge = 0;
          backendFilters.maxAge = 17;
          break;
        case 'adult':
          backendFilters.minAge = 18;
          backendFilters.maxAge = 64;
          break;
        case 'senior':
          backendFilters.minAge = 65;
          backendFilters.maxAge = 150;
          break;
        default:
          break;
      }
    }
    
    // Remove ageGroup as it's not used by backend
    delete backendFilters.ageGroup;
    
    // Convert string ages to numbers
    if (backendFilters.minAge && typeof backendFilters.minAge === 'string') {
      backendFilters.minAge = parseInt(backendFilters.minAge) || undefined;
    }
    if (backendFilters.maxAge && typeof backendFilters.maxAge === 'string') {
      backendFilters.maxAge = parseInt(backendFilters.maxAge) || undefined;
    }
    
    return backendFilters;
  };

  // Effect to trigger search
  useEffect(() => {
    const backendFilters = convertFiltersForBackend(filters);
    debouncedSearch(backendFilters);
    updateActiveFilters(filters);
    if (onFiltersChange) onFiltersChange(backendFilters);
  }, [filters, debouncedSearch, onFiltersChange]);

  // Update active filters display
  const updateActiveFilters = (filterData) => {
    const active = [];
    if (filterData.search) {
      active.push({ 
        key: 'search', 
        label: `Search: "${filterData.search}"`,
        value: filterData.search 
      });
    }
    if (filterData.ageGroup && filterData.ageGroup !== 'all') {
      active.push({ 
        key: 'ageGroup', 
        label: `Age: ${filterData.ageGroup}`,
        value: filterData.ageGroup 
      });
    }
    if (filterData.minAge) {
      active.push({ 
        key: 'minAge', 
        label: `Min Age: ${filterData.minAge}`,
        value: filterData.minAge 
      });
    }
    if (filterData.maxAge) {
      active.push({ 
        key: 'maxAge', 
        label: `Max Age: ${filterData.maxAge}`,
        value: filterData.maxAge 
      });
    }
    setActiveFilters(active);
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Clear manual age filters when ageGroup is selected
      if (key === 'ageGroup' && value !== 'all') {
        newFilters.minAge = '';
        newFilters.maxAge = '';
      }
      
      // Clear ageGroup when manual age filters are used
      if ((key === 'minAge' || key === 'maxAge') && value !== '') {
        newFilters.ageGroup = 'all';
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ageGroup: 'all',
      minAge: '',
      maxAge: ''
    });
  };

  // Remove specific filter
  const handleRemoveFilter = (filterKey) => {
    switch (filterKey) {
      case 'search':
        updateFilter('search', '');
        break;
      case 'ageGroup':
        updateFilter('ageGroup', 'all');
        break;
      case 'minAge':
        updateFilter('minAge', '');
        break;
      case 'maxAge':
        updateFilter('maxAge', '');
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Main search */}
          <Grid item xs={12} md={6}>
            <TextField
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              label="Search patients"
              fullWidth
              placeholder="Search by name, email..."
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => updateFilter('search', '')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Sort */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select 
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                label="Sort by" 
                disabled={loading}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="birthDate">Age</MenuItem>
                <MenuItem value="createdAt">Created Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filters toggle */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => setExpandedFilters(!expandedFilters)}
              startIcon={<FilterIcon />}
              fullWidth
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        {/* Advanced filters */}
        <Collapse in={expandedFilters}>
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Age Group</InputLabel>
                  <Select 
                    value={filters.ageGroup}
                    onChange={(e) => updateFilter('ageGroup', e.target.value)}
                    label="Age Group"
                  >
                    <MenuItem value="all">All Ages</MenuItem>
                    <MenuItem value="minor">Minors (0-17)</MenuItem>
                    <MenuItem value="adult">Adults (18-64)</MenuItem>
                    <MenuItem value="senior">Seniors (65+)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  value={filters.minAge}
                  onChange={(e) => updateFilter('minAge', e.target.value)}
                  label="Min Age"
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, max: 150 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  value={filters.maxAge}
                  onChange={(e) => updateFilter('maxAge', e.target.value)}
                  label="Max Age"
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, max: 150 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" mb={1}>
              Active filters:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  size="small"
                  onDelete={() => handleRemoveFilter(filter.key)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              <Button
                size="small"
                onClick={handleClearAll}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchForm;