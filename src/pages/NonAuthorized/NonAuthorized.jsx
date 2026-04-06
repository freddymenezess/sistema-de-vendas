import { useNavigate } from "react-router-dom";
import styles from "./NonAuthorized.module.css";

function NonAuthorized() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>Acesso Negado!</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <button className={styles.btn} onClick={() => navigate("/")}>
        Ir para página inicial
      </button>
    </div>
  );
}

export default NonAuthorized;
