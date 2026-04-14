import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@services/firebase";
import useAuth from "@hooks/useAuth";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Heart } from "lucide-react";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading, setLoading } = useAuth();

  if (user) {
    if (user.cargo === "admin" || user.cargo === "manager") {
      return <Navigate to="/painel" replace />;
    } else {
      return <Navigate to="/meu-caixa" replace />;
    }
  }

  function handleSetEmail(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(true);

      switch (err.code) {
      case "auth/network-request-failed":
        setMessage("Sem conexão. Verifique sua internet e tente novamente.");
        break;
      case "auth/user-not-found":
      case "auth/invalid-credential":
        setMessage(
          "Email ou senha incorretos. Em caso de dúvida, contacte a direcção.",
        );
        break;
      case "auth/wrong-password":
        setMessage(
          "Senha incorreta. Em caso de dúvida, contacte a direcção.",
        );
        break;
      case "auth/too-many-requests":
        setMessage(
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        );
        break;
      default:
        setMessage("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSetCorrectData() {
    setError(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Heart size={32} />
          </div>
          <h1 className={styles.title}>Mamev Cosmetics</h1>
          <p className={styles.subtitle}>Sistema de Vendas</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{message}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={20} className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={handleSetEmail}
                onFocus={handleSetCorrectData}
                className={styles.input}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onFocus={handleSetCorrectData}
                className={styles.input}
                placeholder="********"
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            <LogIn size={20} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
