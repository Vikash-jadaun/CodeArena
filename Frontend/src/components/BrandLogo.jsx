import { NavLink } from 'react-router';

export default function BrandLogo({ className = '', imageClassName = '', showName = true, variant = 'compact', to = '/' }) {
  const image = variant === 'full' ? '/assets/codearena-logo.png' : '/assets/codearena-icon.png';
  return (
    <NavLink className={`brand ${className}`} to={to} aria-label="CodeArena home">
      <img className={`brand-logo brand-logo-${variant} ${imageClassName}`} src={image} alt="" />
      {showName && <span>CodeArena</span>}
    </NavLink>
  );
}
