import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage";
import FormNewUser from "@components/FormNewUser/FormNewUser";
import { showAlert } from "@components/Alerts";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import styles from "@components/Table/Table.module.css";
import stylesComponent from "./Equipa.module.css";

function Equipa() {
  const [opend, setOpend] = useState(false);
  const [users, setUsers] = useState([]);
  const currentId = getItem("currentUser").id;

  useEffect(() => {
    const storedUsers = getItem("users") || [];
    const otherUsers = storedUsers.filter((user) => user.id !== currentId);
    setUsers(otherUsers);
  }, []);

  function handleNewUser(newUser) {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setItem("users", updatedUsers);

    showAlert("Usuário criado com sucesso", "success");
  }

  function handleRemoveUser(id) {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setItem("users", updatedUsers);

    showAlert("Usuário removido com sucesso!", "success");
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  function getRoleLabel(role) {
    if (role === "admin") return "Administrador";
    if (role === "manager") return "Gerente";
    return "Caixa";
  }

  function getRoleClass(role) {
    if (role === "admin") return stylesComponent.admin;
    if (role === "manager") return stylesComponent.manager;
    return stylesComponent.seller;
  }

  return (
    <div className={`${styles.container} ${stylesComponent.page}`}>
      {/* HEADER */}
      <div className={stylesComponent.head}>
        <div>
          <h2>Gestão de Equipa</h2>
          <div className={stylesComponent.subtitle}>
            Gerencie os membros da sua equipa
          </div>
        </div>

        <div className={stylesComponent.actionsArea}>
          <span className={stylesComponent.badgeCount}>
            {users.length} Funcionários
          </span>

          <button
            type="button"
            className={stylesComponent.btn}
            onClick={() => setOpend(true)}
          >
            <AddIcon fontSize="small" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className={stylesComponent.tableWrapper}>
        <table className={stylesComponent.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Email</th>
              <th>Telefone</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={stylesComponent.avatarCell}>
                    <div className={stylesComponent.avatar}>
                      {getInitials(user.name)}
                    </div>
                    <span className={stylesComponent.userName}>
                      {user.name}
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    className={`${stylesComponent.roleBadge} ${getRoleClass(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                <td>{user.email}</td>
                <td>{user.phone}</td>

                <td>
                  <button
                    className={stylesComponent.actionBtn}
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
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
    </div>
  );
}

export default Equipa;
