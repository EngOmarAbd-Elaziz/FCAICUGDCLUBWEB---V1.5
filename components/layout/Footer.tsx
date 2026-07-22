import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="container">
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} FCAI CUGD Club. All rights reserved.</p>
          <div className="footer-signature">
            <span>Made By</span>
            <strong><a href="https://engomarabd-elaziz.github.io/My-Portofolio/" target="_blank" rel="noopener noreferrer">Eng. Omar Abdelaziz</a></strong>
          </div>
        </div>
      </div>
    </footer>
  );
}

