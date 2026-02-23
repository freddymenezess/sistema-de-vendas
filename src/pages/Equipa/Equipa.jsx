import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage";
import FormNewUser from "@components/FormNewUser/FormNewUser";
import SimpleAlert from "@components/SimpleAlert";
import styles from "@components/Table/Table.module.css";
import stylesComponent from "./Equipa.module.css";

function Equipa() {
  const [opend, setOpend] = useState(false);
  const [users, setUsers] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const titles = ["Nome", "Cargo", "Email", "Telefone", "Ações"];

  useEffect(() => {
    const storedUsers = getItem("users") || [];
    setUsers(storedUsers);
  }, []);

  function handleNewUser(newUser) {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setItem("users", updatedUsers);

    setAlert({
      open: true,
      message: "Usuário criado com sucesso!",
      severity: "success",
    });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, open: false }));
    }, 3000);
  }

  function handleRemoveUser(id) {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setItem("users", updatedUsers);

    setAlert({
      open: true,
      message: "Usuário removido com sucesso!",
      severity: "success",
    });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, open: false }));
    }, 3000);
  }

  return (
    <div
      style={{
        background: "transparent",
        boxShadow: "none",
      }}
      className={styles.container}
    >
      <div className={stylesComponent.head}>
        <h2>Gestão de Equipa</h2>
        <button
          type="button"
          className={stylesComponent.btn}
          onClick={() => setOpend(true)}
        >
          + Novo Funcionário
        </button>
      </div>

      <div className={styles.users}>
        <table
          style={{
            background: "#fff",
            marginTop: "0",
            overflow: "hidden",
          }}
          className={`${styles.table} ${stylesComponent.table}`}
        >
          <thead>
            <tr style={{ color: "#000" }}>
              {titles.map((title, index) => (
                <th key={index}>{title}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  {user.role === "admin"
                    ? "Administrador"
                    : user.role === "manager"
                      ? "Gerente"
                      : user.role === "seller"
                        ? "Caixa"
                        : null}
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    style={{
                      background: "red",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {opend && (
        <FormNewUser setOpend={setOpend} handleNewUser={handleNewUser} />
      )}

      <SimpleAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

export default Equipa;
