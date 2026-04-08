import { X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./FormNewUser.module.css";

function FormNewUser({ setOpend, handleNewUser }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("manager");
  const [password, setPass] = useState("");
  const [nif, setNif] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const newUser = {
      id: Date.now(),
      name,
      role,
      password,
      nif,
      email,
      phone,
    };

    handleNewUser(newUser);

    // Reset campos
    setName("");
    setRole("manager");
    setPass("");
    setNif("");
    setEmail("");
    setPhone("");

    setOpend(false);
  }

  function handleClose() {
    setOpend(false);
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Novo Funcionario</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome Completo</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Funcao</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="manager">Gerente</option>
                  <option value="seller">Atendente de Caixa</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Palavra-passe</label>
                <input
                  type="password"
                  placeholder="Palavra-passe para o funcionario"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>NIF</label>
                  <input
                    type="text"
                    placeholder="Digite o NIF"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Telefone</label>
                  <input
                    type="tel"
                    placeholder="(+244) 912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default FormNewUser;
