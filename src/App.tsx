import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar/index';
import Home from './components/Home';
import MarkPolish from './components/MarkPolish/MarkPolish';
import DevDocs from './components/DevDocs/DevDocs';
import DocuBuddy from './components/DocuBuddy/DocuBuddy';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './theme/themeContext';
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider>
        <LanguageProvider>
          <CssBaseline />
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mark-polish" element={<MarkPolish />} />
              <Route path="/mark-polish/:conversationId" element={<MarkPolish />} />
              <Route path="/dev-docs" element={<DevDocs />} />
              <Route path="/dev-docs/:conversationId" element={<DevDocs />} />
              <Route path="/docu-buddy" element={<DocuBuddy />} />
              <Route path="/docu-buddy/:conversationId" element={<DocuBuddy />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App; 