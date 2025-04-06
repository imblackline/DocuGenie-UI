import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme as useCustomTheme } from '../../theme/themeContext';
import './NavbarStyle.css'
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState<null | HTMLElement>(null);
  const { currentLanguage, setLanguage } = useLanguage('en');
  const { isDarkMode, toggleTheme } = useCustomTheme();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    handleLanguageMenuClose();
  };

  const navItems = [
    { path: '/', label: t('nav.home'), icon: <HomeIcon /> },
    { path: '/mark-polish', label: t('nav.markPolish'), icon: <EditIcon /> },
    { path: '/dev-docs', label: t('nav.devDocs'), icon: <CodeIcon /> },
    { path: '/docu-buddy', label: t('nav.docuBuddy'), icon: <SmartToyIcon /> },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
  ];

  const renderNavItems = () => (
    <>
      <Tooltip title={currentLanguage === 'en' ? 'English' : 'Italiano'}>
        <IconButton
        className='lang_change'
          color="inherit"
          onClick={handleLanguageMenuOpen}
          sx={{
            ml: 1,
            color: isDarkMode ? 'grey.400' : 'grey.700',
            '&:hover': {
              color: isDarkMode ? '#fff' : 'primary.main',
            },
          }}
          size="small"
        >
          {currentLanguage === 'en' ? 'en' : '🇮🇹'}
        </IconButton>
      </Tooltip>
      <Tooltip title={isDarkMode ? t('Light Mode') : t('Dark Mode')}>
        <i className={`bx ${isDarkMode ? 'bx-moon' : 'bx-sun'} change-theme`} onClick={toggleTheme}></i>
      </Tooltip>

      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageMenuClose}
        disableScrollLock
        sx={{
          mt: 1,
          '& .MuiPaper-root': {
            position: 'absolute',
            right: 0,
            left: 'auto',
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage === lang.code}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  return (
    <AppBar position="static" sx={{ bgcolor: isDarkMode ? 'grey.900' : 'white' }}>
      <Toolbar>
        <Typography
          variant="h4"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            color: isDarkMode ? '#fff' : 'primary.main',
            '&:hover': {
              color: isDarkMode ? 'primary.light' : 'primary.dark',
            },
          }}
          onClick={() => navigate('/')}
        >
          DocuGenie
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              edge="end"
              size="large"
              sx={{
                color: isDarkMode ? 'grey.400' : 'grey.700',
                '&:hover': {
                  color: isDarkMode ? '#fff' : 'primary.main',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    handleMobileMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <MenuItem onClick={toggleTheme}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    {isDarkMode ? t('nav.lightMode') : t('nav.darkMode')}
                  </Box>
                </MenuItem>
                {languages.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    selected={currentLanguage === lang.code}
                  >
                    {lang.label}
                  </MenuItem>
                ))}
              </Box>
            </Menu>
          </>
        ) : (
          renderNavItems()
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 