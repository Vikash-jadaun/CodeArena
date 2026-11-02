import { Code2, LogOut } from 'lucide-react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { ThemeToggle } from './ThemeProvider';

export default function AppHeader() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.firstName || 'Developer';
  const initial = firstName.slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      <NavLink className="brand" to="/">
        <span className="brand-mark"><Code2 size={17} /></span>
        <span>CodeArena</span>
      </NavLink>
      <nav className="topbar-nav" aria-label="Main navigation">
        <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">Problems</NavLink>
        {user?.role === 'admin' && <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin">Admin</NavLink>}
      </nav>
      <div className="topbar-actions">
        <ThemeToggle />
        <div className="user-chip"><span className="avatar">{initial}</span><span>{firstName}</span></div>
        <button className="icon-button" type="button" aria-label="Log out" title="Log out" onClick={() => dispatch(logoutUser())}><LogOut size={15} /></button>
      </div>
    </header>
  );
}
