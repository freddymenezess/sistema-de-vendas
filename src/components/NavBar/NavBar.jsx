import {
  Home,
  LayoutDashboard,
  ClipboardPlus,
  UserRoundPlus,
  ShoppingCart,
  LogOut,
  X
} from 'lucide-react';
import { useMenu } from '@context/MenuProvider'
import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import logo_full from '/mamev-full.png';
import useAuth from '@hooks/useAuth';
import styles from './NavBar.module.css';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/register', label: 'Cadastrar', icon: UserRoundPlus },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Relatórios', icon: ClipboardPlus },
  { to: '/stock', label: 'Estoque', icon: ShoppingCart },
];

function NavBar({ className = '' }) {
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useMenu();

  return (
    <nav
      className={`${styles.navbar} ${!isOpen ? styles.close : ""} ${className}`}
    >
      <div className={`${styles.logoWrapper} flex`}>
        <img
          src={logo_full}
          alt="Mamev"
          className={styles.logoDesktop}
        />
        <X size={28} color="#6b7280" className={styles.btn} onClick={closeMenu} />
      </div>

      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} title={label} className={styles.navlink}>
          {({ isActive }) => (
            <div
              className={`${styles.navItem} ${isActive ? styles.active : ""} flex`}
            >
              <Icon
                size={24}
                color={isActive ? "#D4A373" : "#6b7280"}
                fill={isActive ? "#D4A373" : "none"}
              />
              <span className={styles.label}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
      <NavLink to="/logout" className={`${styles.logout} ${styles.navlink}`}>
        <div
          className={`${styles.navItem} flex`}
          onClick={() => logout()}
          title="Terminar sessão"
        >
          <LogOut size={24} color="red" />
          <span className={styles.label}>Terminar sessão</span>
        </div>
      </NavLink>
    </nav>
  );
}

export default NavBar;
