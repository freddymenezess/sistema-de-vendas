import useAuth from "../../hooks/useAuth";
import usersStorage from "../../data/users.json";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItem, setItem } from "../../services/storage";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import mamev from "/mamev-icon.png";
import loginImage from "/login-image.jpg";
import Spinner from "../../components/Spinner/Spinner";
import styles from "./Login.module.css";

function Login() {
  const [id, setId] = useState(0);
  const [password, setPassword] = useState("");
  const [correctData, setCorrectData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading, login, handleSetActiveUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "manager") {
        navigate("/painel", { replace: true });
      } else {
        navigate("/carrinho", { replace: true });
      }
    }
  }, [user, navigate]);

  if (loading) {
    return <Spinner />;
  }

  function handleId(event) {
    setId(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!getItem("users")) setItem("users", usersStorage);

    const users = getItem("users");
    const foundUser = users.find(
      (u) => (u.nif === id || u.email === id) && u.password === password,
    );

    if (!foundUser) {
      setCorrectData(false);
      return;
    }
    login(foundUser);
    handleSetActiveUser(foundUser.id);
  }

  function handleSetCorrectData() {
    setCorrectData(true);
  }

  return (
    <>
      <div className={styles.loginWrapper}>
        <div className={styles.imageContainer}>
          <img src={loginImage} alt="Cosmetics" className={styles.loginImage} />
        </div>
        <div className={styles.formContainer}>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.logoContainer}>
              <img src={mamev} alt="Logo MAMEV" />
            </div>
            <div className={styles.desc}>
              <p>
                Bem-vindo ao sistema de gestão da <strong>MAMEV Cosméticos</strong>!
                Por favor, inicie sessão para continuar.
              </p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Informe o seu NIF ou email</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="NIF ou email"
                  onChange={handleId}
                  onFocus={handleSetCorrectData}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Palavra-passe</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Palavra-passe"
                  onChange={handlePasswordChange}
                  onFocus={handleSetCorrectData}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className={styles.loginButton}>
              <LogIn size={20} />
              <span>Iniciar Sessao</span>
            </button>
            {!correctData && (
              <p className={styles.errorMessage}>
                Dados inválidos. Em caso de perda ou esquecimento dos seus dados de
                acesso, contacte a direção da empresa.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
