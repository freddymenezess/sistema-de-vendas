import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@services/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuth from "@hooks/useAuth";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Heart } from "lucide-react";
import Spinner from "@components/Spinner/Spinner";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [correctData, setCorrectData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading, setLoading, login } = useAuth();

  if (user) {
    if (user.role === "admin" || user.role === "manager") {
      return <Navigate to="/painel" replace />;
    } else {
      return <Navigate to="/carrinho" replace />;
    }
  }

  if (loading) {
    return <Spinner />;
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

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      const essentialUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: data?.role || "",
        nome: data?.nome || "",
        tel: data?.tel || null,
      };

      login(essentialUser);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setCorrectData(false);
    }
  }

  function handleSetCorrectData() {
    setCorrectData(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Heart size={32} />
          </div>
          <h1 className={styles.title}>Mamev Cosmeticos</h1>
          <p className={styles.subtitle}>Sistema de Gestao</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!correctData && (
            <div className={styles.error}>
              Email ou senha incorretos. Em caso de perda ou esquecimento, contacte a direcao.
            </div>
          )}

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
