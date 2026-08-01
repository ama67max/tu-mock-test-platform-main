import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * StudentLayout - Redesigned with Theme Support
 * Main layout for public and student pages
 * Uses CSS custom properties for theme-aware background
 */

function StudentLayout() {
  return (
    <div 
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}
    >
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default StudentLayout;
