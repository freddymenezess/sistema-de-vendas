import {
  Home,
  LayoutDashboard,
  ClipboardPlus,
  UserRoundPlus,
  ShoppingCart,
  LogOut
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom';
import logo from '/mamev-icon.png';
import logo_full from '/mamev-full.png';
import useAuth from "@hooks/useAuth";
import styles from './NavBar.module.css';


const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/register', label: 'Cadastrar', icon: UserRoundPlus },
  { to: '/dashboard', label: 'Projetos', icon: LayoutDashboard },
  { to: '/reports', label: 'Relatórios', icon: ClipboardPlus },
  { to: '/products', label: 'Produtos', icon: ShoppingCart },
];

function NavBar({ className = '' }) {
  const { logout } = useAuth();

  return (
    <nav className={`${styles.navbar} ${className}`}>
      <Link className={styles.logoWrapper} to="/">
        <img src={logo} alt="Mamev" className={styles.logoMobile} />
        <img src={logo_full} alt="Mamev" className={styles.logoDesktop} />
      </Link>

      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} title={label} className={styles.navlink}>
          {({ isActive }) => (
            <div className={`${styles.navItem} flex`}>
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
