export default function Navbar({ current, navigate }) {
  return (
    <nav className="navbar">
      <div className="container">
        <a className="navbar-logo" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">🛡️</div>
          <span>TruthLens AI</span>
        </a>
        <ul className="navbar-links">
          <li>
            <button
              className={`nav-link ${current === 'home' ? 'active' : ''}`}
              onClick={() => navigate('home')}
            >🏠 Home</button>
          </li>
          <li>
            <button
              className={`nav-link ${current === 'text' ? 'active' : ''}`}
              onClick={() => navigate('text')}
            >📰 Fake News</button>
          </li>
          <li>
            <button
              className={`nav-link ${current === 'media' ? 'active' : ''}`}
              onClick={() => navigate('media')}
            >🎬 Media Analysis</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
