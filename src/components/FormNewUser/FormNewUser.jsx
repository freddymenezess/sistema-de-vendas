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

    setOpend(false); // fecha modal
  }

  return createPortal(
    <div className={styles.container}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
          Cadastre um novo funcionário
        </h3>

        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome Completo</label>
          <input
            type="text"
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="role">Função</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="manager">Gerente</option>
            <option value="seller">Atendente de Caixa</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Palavra-passe</label>
          <input
            type="password"
            id="password"
            placeholder="Palavra-passe para o funcionário"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="nif">NIF</label>
          <input
            type="text"
            id="nif"
            placeholder="Digite o NIF"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            placeholder="(+244) 912 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.btn}>
          Cadastrar
        </button>
        <button
          style={{
            background: "#666",
          }}
          type="submit"
          className={styles.btn}
          onClick={() => setOpend(false)}
        >
          Fechar
        </button>
      </form>
    </div>,
    document.body,
  );
}

export default FormNewUser;
