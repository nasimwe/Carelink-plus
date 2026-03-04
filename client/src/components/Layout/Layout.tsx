import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      }}
    >
      <Header />
      <main className="animate-fade-in">
        <div className="layout-container">
          {children}
        </div>
      </main>
      <style>{`
        .layout-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px;
        }
        @media (min-width: 640px) {
          .layout-container {
            padding: 24px 20px;
          }
        }
        @media (min-width: 1024px) {
          .layout-container {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
};
