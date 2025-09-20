import React, { useEffect, useRef } from 'react';

export default function Sidebar({
  collapsed,
  // setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const panelRef = useRef(null);

  // Close on ESC for mobile
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMobileOpen]);

  // focus trap on mobile open (simple)
  useEffect(() => {
    if (!mobileOpen) return;
    const first = panelRef.current?.querySelector('button, a, input, select');
    first?.focus();
  }, [mobileOpen]);

  const menu = [
    { label: 'Overview',   href: '#', current: true,  tip: 'Overview' },
    { label: 'Analytics',  href: '#', current: false, tip: 'Analytics' },
    { label: 'Billing',    href: '#', current: false, tip: 'Billing' },
    { label: 'Settings',   href: '#', current: false, tip: 'Settings' },
  ];

  const Section = () => (
    <div className="sidebar__section" role="menu" aria-label="Main">
      {menu.map(item => (
        <a
          key={item.label}
          className="sidebar__item"
          href={item.href}
          role="menuitem"
          aria-current={item.current ? 'page' : undefined}
          data-tooltip={item.tip}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="currentColor" opacity=".15" />
            <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="sidebar__label">{item.label}</span>
        </a>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
        aria-label="Sidebar"
      >
        <div className="sidebar__header">
          <strong className="sidebar__label">Navigation</strong>
          <button
            className="sidebar__toggle"
            // onClick={() => setCollapsed(!collapsed)}
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}/>
            </svg>
          </button>
        </div>
        <Section />
      </aside>

      {/* Mobile off-canvas */}
      <div
        className={`offcanvas ${mobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        onClick={() => setMobileOpen(false)}
        style={{ zIndex: 60 }}
      >
        <div
          className="offcanvas__panel"
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Menu</strong>
            <button className="sidebar__toggle" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <Section />
        </div>
      </div>
    </>
  );
}
