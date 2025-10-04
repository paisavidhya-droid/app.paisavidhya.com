import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__grid">
         <div className="footer__brand">
          <div className="footer__brandRow">
            <span className="navbar__logo" aria-hidden="true"></span>
            <strong>Paisavidhya</strong>
          </div>
          <p style={{ color: 'var(--pv-dim)', marginTop: 8 }}>
            Simplifying Finance for Every Indian.
          </p>
        </div>

        <div>
          <div className="footer__title">Product</div>
          <ul className="footer__list">
            <li><a className="footer__link" href="#">Features</a></li>
            <li><a className="footer__link" href="#">Integrations</a></li>
            <li><a className="footer__link" href="#">Changelog</a></li>
            <li><a className="footer__link" href="#">Roadmap</a></li>
          </ul>
        </div>

        <div>
          <div className="footer__title">Company</div>
          <ul className="footer__list">
            <li><a className="footer__link" href="#">About</a></li>
            <li><a className="footer__link" href="#">Careers</a></li>
            <li><a className="footer__link" href="#">Press</a></li>
            <li><a className="footer__link" href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <div className="footer__title">Resources</div>
          <ul className="footer__list">
            <li><a className="footer__link" href="#">Docs</a></li>
            <li><a className="footer__link" href="#">API</a></li>
            <li><a className="footer__link" href="#">Guides</a></li>
            <li><a className="footer__link" href="#">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <small style={{ color: 'var(--pv-dim)' }}>© {new Date().getFullYear()} Paisavidhya, Inc.</small>
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
          <a className="footer__link" href="#">Privacy</a>
          <a className="footer__link" href="#">Terms</a>
          <a className="footer__link" href="#">Status</a>
          <select
            aria-label="Region"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid var(--pv-border)`,
              background: 'var(--pv-surface)',
              color: 'var(--pv-text)'
            }}
          >
            <option>EN</option>
            <option>ES</option>
          </select>
        </div>
      </div>
    </footer>
  );
}
