import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@auth/AuthContext.jsx";
import usersStorage from "@data/users.json";
import { getItem, setItem } from "@services/storage.js";
import mamev from "/mamev-icon.png";
import styles from "./Login.module.css";

function Login() {
  const [id, setId] = useState(0);
  const [password, setPassword] = useState("");
  const [correctData, setCorrectData] = useState(true);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "manager") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  function handleId(event) {
    setId(parseInt(event.target.value));
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!getItem("users")) setItem("users", usersStorage);

    const users = getItem("users");
    const foundUser = users.find(
      (u) => (u.nif === id || u.id === id) && u.password === password,
    );

    if (!foundUser) {
      setCorrectData(false);
      return;
    }

    login(foundUser);
  }

  function handleSetCorrectData() {
    setCorrectData(true);
  }

  return (
    <form className={`${styles.loginForm} flex`} onSubmit={handleSubmit}>
      <div className={styles.logoContainer}>
        <img src={mamev} alt="Logo MAMEV" />
      </div>
      <div className={styles.desc}>
        <p>
          <strong>MAMEV Cosméticos</strong>! Por favor, inicie sessão para
          continuar.
        </p>
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="username">NIF ou número de processo</label>
        <input
          type="text"
          id="username"
          name="username"
          onChange={handleId}
          onFocus={handleSetCorrectData}
          autoFocus
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Palavra-passe</label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={handlePasswordChange}
          onFocus={handleSetCorrectData}
          required
        />
      </div>
      <button type="submit" className={styles.loginButton}>
        Iniciar Sessão
      </button>
      {!correctData && (
        <p className={styles.errorMessage}>
          Dados inválidos. Em caso de perda ou esquecimento dos seus dados de
          acesso, contacte a direção da empresa.
        </p>
      )}
    </form>
  );
}

export default Login;
