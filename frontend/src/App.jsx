import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TextAnalysis from './pages/TextAnalysis';
import MediaAnalysis from './pages/MediaAnalysis';

export default function App() {
  const [page, setPage] = useState('home');

  // Support direct anchor links
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'text', 'media'].includes(hash)) setPage(hash);
  }, []);

  const navigate = (p) => {
    setPage(p);
    window.location.hash = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar current={page} navigate={navigate} />
      <main>
        {page === 'home'  && <Home navigate={navigate} />}
        {page === 'text'  && <TextAnalysis />}
        {page === 'media' && <MediaAnalysis />}
      </main>
      <footer className="footer">
        <div className="container">
          AI-Powered Fake News &amp; Deepfake Detection System &nbsp;·&nbsp;
          Mitesh Panda | R322QRA05 &nbsp;·&nbsp; Lovely Professional University &nbsp;·&nbsp; CSE-435
        </div>
      </footer>
    </>
  );
}
