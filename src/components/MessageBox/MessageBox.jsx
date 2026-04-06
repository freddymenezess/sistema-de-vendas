import styles from "./MessageBox.module.css";

function MessageBox({ message, btnTxt, role, funcCancel, funcAgree }) {
  const btnColors = {
    "not": "#d31f22",
    "agree": "linear-gradient(135deg, #c89b6d, #b5835a)",
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.message}>{message}</div>
        <div className={styles.btns}>
          <button
            type="btn"
            className={styles.btnCancelar}
            onClick={funcCancel}
          >
            Cancelar
          </button>
          <button
            type="btn"
            style={{ background: btnColors[role] }}
            className={styles.btnConfirmar}
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
