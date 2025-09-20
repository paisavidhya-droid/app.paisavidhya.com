import React, { useState } from 'react';

const items = [
  { id: 'home',     label: 'Home',     href: '#', icon: 'M3 12h18M12 3v18' },
  { id: 'search',   label: 'Search',   href: '#', icon: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 9.5 16l.3.3v.8l5 5 1.5-1.5-5-5z' },
  { id: 'create',   label: 'Create',   href: '#', icon: 'M12 5v14M5 12h14' }, // center action
  { id: 'inbox',    label: 'Inbox',    href: '#', icon: 'M3 8l9-5 9 5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'profile',  label: 'Profile',  href: '#', icon: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm7 9H5a7 7 0 0 1 14 0z' },
];

export default function BottomNav() {
  const [active, setActive] = useState('home');

  return (
    <nav className="bottomnav" role="navigation" aria-label="Bottom">
      <ul className="bottomnav__list">
        {items.map((it, idx) => {
          const isActive = active === it.id;
          const isPrimary = it.id === 'create';
          return (
            <li key={it.id} className="bottomnav__item">
              <a
                href={it.href}
                className={`bottomnav__link ${isPrimary ? 'bottomnav__link--primary' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); setActive(it.id); }}
              >
                <svg
                  className="bottomnav__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={it.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="bottomnav__label">{it.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
