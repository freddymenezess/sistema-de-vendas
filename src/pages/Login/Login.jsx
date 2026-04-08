import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@services/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuth from "@hooks/useAuth";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import mamev from "/mamev-icon.png";
import loginImage from "/login-image.jpg";
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
      // 1️⃣ Login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // 2️⃣ Pegar dados extras do Firestore
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      const essentialUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: data?.role || "", // default caso não exista
        nome: data?.nome || "",
        tel: data?.tel || null,
      };

      // Guardar no contexto
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
                Bem-vindo ao sistema de gestão da{" "}
                <strong>MAMEV Cosméticos</strong>! Por favor, inicie sessão para
                continuar.
              </p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Digite o seu email</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@gmail.com"
                  onChange={handleSetEmail}
                  onFocus={handleSetCorrectData}
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
                Dados inválidos. Em caso de perda ou esquecimento dos seus dados
                de acesso, contacte a direção da empresa.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
