import React from 'react';
import './Footer.css'; // Assuming you have a CSS file for styling
import { IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';


const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer__container container">
                <h1 className="footer__title">DocuGenie</h1>

                <ul className="footer__list">
                    <li>
                        <a href="#MarkPolish" className="footer__link">MarkPolish</a>
                    </li>
                    <li>
                        <a href="#DevDocs" className="footer__link">DevDocs</a>
                    </li>
                    <li>
                        <a href="#DocuBuddy" className="footer__link">DocuBuddy</a>
                    </li>
                </ul>

                <ul className="footer__social">
                    <IconButton
                        href="https://github.com/imblackline/DocuGenie-UI"
                        target="_blank"
                        className="footer__social-link"
                    >
                        <GitHubIcon />
                    </IconButton>
                </ul>

                <span className="footer__copy">
                    &#169;All rights reserved
                </span>
            </div>
        </footer>
    );
};

export default Footer;
