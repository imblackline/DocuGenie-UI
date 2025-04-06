import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GitHubIcon from '@mui/icons-material/GitHub';
import MouseIcon from '@mui/icons-material/Mouse';
import { useTranslation } from 'react-i18next';
import '../styles/Home.css';
import FirstHomeSVG from './SVG/firstHomeSVG';
import SecondHomeSVG from './SVG/secondHomeSVG';
import ThirdHomeSVG from './SVG/thirdHomeSVG';
import FourthHomeSVG from './SVG/fourthHomeSVG';
import Footer from './Footer';
import { useTheme } from '@mui/material/styles';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const [activeLink, setActiveLink] = useState<string>('home');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, options);

    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <Box className="main">
      <main>
        <Box component="section" id="home" className="section">
          <Container className="home__container">
            <Box className="home__data">
              <Typography variant="h6" className="home__greeting" gutterBottom>
                {t('home.greeting')}
              </Typography>
              <Typography variant="h2" component="h1" className="home__name" gutterBottom>
                {t('home.name')}
              </Typography>
              <Typography variant="h4" className="home__education">
                {t('home.education')}
              </Typography>
            </Box>

            <Box className="home__handle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FirstHomeSVG width="100%" height="auto" />
            </Box>
            <Box className="home__social">
              <IconButton
                href="https://github.com/imblackline/DocuGenie-UI"
                target="_blank"
                className="home__social-link"
              >
                <GitHubIcon />
              </IconButton>
            </Box>
            <Box className="home__scroll">
              <IconButton onClick={() => scrollToSection('MarkPolish')} className="home__scroll-icon">
                <MouseIcon />
              </IconButton>
              <Typography variant="body2" className="home__scroll-name">
                {t('home.scrollDown')}
              </Typography>
            </Box>
          </Container>
        </Box>
        <Box component="section" id="DocuBuddy" className="section">
          <Container>
            <Typography variant="h2" component="h2" className="section__title" gutterBottom>
              {t('docuBuddy.title')}
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" paragraph>
                    {t('docuBuddy.description')}
                  </Typography>
                  <Button
                    variant="contained"
                    className="button"
                    onClick={() => navigate('/docu-buddy')}
                  >
                    {t('docuBuddy.button')}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="home__handle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FourthHomeSVG width="100%" height="auto" />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>


        <Box component="section" id="DevDocs" className="section">
          <Container>
            <Typography variant="h2" component="h2" className="section__title" gutterBottom>
              {t('devDocs.title')}
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box className="home__handle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ThirdHomeSVG width="100%" height="auto" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" paragraph>
                    {t('devDocs.description')}
                  </Typography>
                  <Button
                    variant="contained"
                    className="button"
                    onClick={() => navigate('/dev-docs')}
                  >
                    {t('devDocs.button')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box component="section" id="MarkPolish" className="section">
          <Container>
            <Typography variant="h2" component="h2" className="section__title" gutterBottom>
              {t('markPolish.title')}
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" paragraph>
                    {t('markPolish.description')}
                  </Typography>
                  <Button
                    variant="contained"
                    className="button"
                    onClick={() => navigate('/mark-polish')}
                  >
                    {t('markPolish.button')}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="home__handle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <SecondHomeSVG width="100%" height="auto" />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <div className={`nav__menu ${theme.palette.mode === 'light' ? 'light' : 'dark'}`}>
          <ul className="nav__list">
            <li className="nav_item">
              <a
                href="#home"
                className={`nav__link ${theme.palette.mode === 'light' ? 'light' : 'dark'} ${activeLink === 'home' ? 'active-link' : ''}`}
                onClick={() => scrollToSection('home')}
              >
                <i className='bx bx-home-alt'></i>
              </a>
            </li>
            <li className="nav_item">
              <a
                href="#MarkPolish"
                className={`nav__link ${theme.palette.mode === 'light' ? 'light' : 'dark'} ${activeLink === 'MarkPolish' ? 'active-link' : ''}`}
                onClick={() => scrollToSection('MarkPolish')}
              >
                <i className='bx bxs-edit'></i>
              </a>
            </li>
            <li className="nav_item">
              <a
                href="#DevDocs"
                className={`nav__link ${theme.palette.mode === 'light' ? 'light' : 'dark'} ${activeLink === 'DevDocs' ? 'active-link' : ''}`}
                onClick={() => scrollToSection('DevDocs')}
              >
                <i className='bx bx-code-alt'></i>
              </a>
            </li>
            <li className="nav_item">
              <a
                href="#DocuBuddy"
                className={`nav__link ${theme.palette.mode === 'light' ? 'light' : 'dark'} ${activeLink === 'DocuBuddy' ? 'active-link' : ''}`}
                onClick={() => scrollToSection('DocuBuddy')}
              >
                <i className='bx bx-bot'></i>
              </a>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </Box>
  );
};

export default Home;