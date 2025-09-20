import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__grid">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="navbar__logo" aria-hidden="true"></span>
            <strong>Paisavidhya</strong>
          </div>
          <p style={{ color: 'var(--pv-dim)', marginTop: 8 }}>
            Simplifying Finance for Every Indian.
          </p>
        </div>

        <div>
          <div className="footer__title">Product</div>
          <ul style={{ display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
            <li><a href="#">Features</a></li>
            <li><a href="#">Integrations</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Roadmap</a></li>
          </ul>
        </div>

        <div>
          <div className="footer__title">Company</div>
          <ul style={{ display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <div className="footer__title">Resources</div>
          <ul style={{ display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
            <li><a href="#">Docs</a></li>
            <li><a href="#">API</a></li>
            <li><a href="#">Guides</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <small style={{ color: 'var(--pv-dim)' }}>© {new Date().getFullYear()} Paisavidhya, Inc.</small>
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Status</a>
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
