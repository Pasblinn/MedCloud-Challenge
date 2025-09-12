import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, url: 'https://github.com/Pasblinn', label: 'GitHub' },
    { icon: <LinkedIn />, url: 'https://www.linkedin.com/in/pablotadinisoto/', label: 'LinkedIn' },
    { icon: <Instagram />, url: 'https://www.instagram.com/pablo_tadini/', label: 'Instagram' },
  ];

  const quickLinks = [
    { text: 'Home', href: '/' },
    { text: 'Patients', href: '/patients' },
    { text: 'Statistics', href: '/statistics' },
    { text: 'Help', href: '/help' }
  ];

  const contactInfo = [
    { icon: <Email />, text: 'pablosotomaior@live.com', type: 'email' },
    { icon: <Phone />, text: '+55 (17) 99182-5283', type: 'phone' },
    { icon: <LocationOn />, text: 'São Paulo, SP - Brazil', type: 'address' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: { xs: 2, md: 3 }
      }}
    >
      <Container maxWidth="lg">
        {!isMobile ? (
          // Desktop footer
          <Grid container spacing={4}>
            {/* Company info */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary" gutterBottom>
                Patient Management System
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Complete healthcare management solution with modern interface and robust features.
              </Typography>
              
              {/* Social links */}
              <Box>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component={Link}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Quick links */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Quick Links
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    variant="body2"
                    sx={{
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact info */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Contact Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {contactInfo.map((contact, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Box color="primary.main">{contact.icon}</Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component={contact.type === 'email' ? 'a' : 'span'}
                      href={contact.type === 'email' ? `mailto:${contact.text}` : 
                            contact.type === 'phone' ? `tel:${contact.text}` : undefined}
                      sx={{
                        textDecoration: 'none',
                        '&:hover': contact.type !== 'address' ? {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        } : {}
                      }}
                    >
                      {contact.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          // Mobile footer - simplified
          <Box textAlign="center">
            <Typography variant="h6" color="primary" gutterBottom>
              Patient Management System
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Healthcare management solution
            </Typography>
            
            {/* Social links */}
            <Box mb={2}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component={Link}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  size="small"
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>
        )}

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Bottom section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Patient Management System. All rights reserved.
          </Typography>
          
          <Box display="flex" gap={2}>
            <Link
              href="/privacy"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              Terms of Service
            </Link>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;