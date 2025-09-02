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
    query: initialFilters.query || '',
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

  // Effect to trigger search
  useEffect(() => {
    debouncedSearch(filters);
    updateActiveFilters(filters);
    if (onFiltersChange) onFiltersChange(filters);
  }, [filters, debouncedSearch, onFiltersChange]);

  // Update active filters display
  const updateActiveFilters = (filterData) => {
    const active = [];
    if (filterData.query) {
      active.push({ 
        key: 'query', 
        label: `Search: "${filterData.query}"`,
        value: filterData.query 
      });
    }
    if (filterData.ageGroup && filterData.ageGroup !== 'all') {
      active.push({ 
        key: 'ageGroup', 
        label: `Age: ${filterData.ageGroup}`,
        value: filterData.ageGroup 
      });
    }
    setActiveFilters(active);
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      query: '',
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
      case 'query':
        updateFilter('query', '');
        break;
      case 'ageGroup':
        updateFilter('ageGroup', 'all');
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
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
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
                endAdornment: filters.query && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => updateFilter('query', '')}
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