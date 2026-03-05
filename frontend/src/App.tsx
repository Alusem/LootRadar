import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import MyClaimsPage from './pages/MyClaimsPage';
import CookieBanner from './components/CookieBanner';

function ProtectedClaims({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  if (!user.userId) return <Navigate to="/entrar" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/registar" element={<RegisterPage />} />
          <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
          <Route
            path="/meus-resgates"
            element={
              <ProtectedClaims>
                <MyClaimsPage />
              </ProtectedClaims>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <CookieBanner />
    </div>
  );
}
