import { AlertTriangle } from "lucide-react";
import styles from "./MessageBox.module.css";

function MessageBox({ message, btnTxt, role, funcCancel, funcAgree }) {
  const isDanger = role === "not";

  return (
    <div className={styles.overlay} onClick={funcCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <AlertTriangle 
            size={32} 
            className={isDanger ? styles.iconDanger : styles.iconWarning} 
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>
            {isDanger ? "Confirmar Exclusao" : "Confirmacao"}
          </h3>
          <div className={styles.message}>{message}</div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={funcCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={isDanger ? styles.dangerButton : styles.confirmButton}
            onClick={funcAgree}
          >
            {btnTxt}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageBox;
