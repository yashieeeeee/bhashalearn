import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import AiTutor from './components/AiTutor';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import Daily from './pages/Daily';
import Achievements from './pages/Achievements';
import Analytics from './pages/Analytics';
import Pronunciation from './pages/Pronunciation';
import LearningPath from './pages/LearningPath';
import Bookmarks from './pages/Bookmarks';
import './index.css';

function AppLayout() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>
          Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
        </div>
        <div style={{ fontSize: 14, color: '#7A6552', marginTop: 8 }}>Loading...</div>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  const bg = dark ? '#0F0A06' : '#FAF6F0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bg }}>
      <Sidebar />
      <main className="app-main" style={{ flex: 1, minHeight: '100vh', background: bg, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 780 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pronunciation" element={<Pronunciation />} />
            <Route path="/path" element={<LearningPath />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      <AiTutor />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}