import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage";
import FormNewUser from "@components/FormNewUser/FormNewUser";
import { showAlert } from "@components/Alerts";
import MessageBox from "@components/MessageBox/MessageBox";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "./Equipa.module.css";

function Equipa() {
  const [opend, setOpend] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [clickDelete, setClickDelete] = useState(false);
  const currentId = getItem("currentUser").id;
  const message = (
    <p>Tem a certeza que pretende eliminar <strong style={{ color: "#000" }}>{currentUser.name}</strong> do sistema? Esta acção é irreversível.</p>
  );

  useEffect(() => {
    const storedUsers = getItem("users") || [];
    const otherUsers = storedUsers.filter((user) => user.id !== currentId);
    setUsers(otherUsers);
  }, []);

  function handleNewUser(newUser) {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setItem("users", updatedUsers);

    showAlert("Novo usuário criado", "success");
  }

  function handleClick(user) {
    setCurrentUser(user);
    setClickDelete(true);
  }

  function handleRemoveUser() {
    const updatedUsers = users.filter((user) => user.id !== currentUser.id);
    setUsers(updatedUsers);
    setItem("users", updatedUsers);
    setClickDelete(false);

    showAlert("Usuário removido.", "success");
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
    if (role === "admin") return styles.admin;
    if (role === "manager") return styles.manager;
    return styles.seller;
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.head}>
        <div>
          <h2>Gestão de Equipa</h2>
          <div className={styles.subtitle}>
            Gerencie os membros da sua equipa
          </div>
        </div>

        <div className={styles.actionsArea}>
          <span className={styles.badgeCount}>
            {users.length} Funcionários
          </span>

          <button
            type="button"
            className={styles.btn}
            onClick={() => setOpend(true)}
          >
            <AddIcon fontSize="small" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
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
                  <div className={styles.avatarCell}>
                    <div className={styles.avatar}>
                      {getInitials(user.name)}
                    </div>
                    <span className={styles.userName}>
                      {user.name}
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    className={`${styles.roleBadge} ${getRoleClass(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                <td>{user.email}</td>
                <td>{user.phone}</td>

                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleClick(user)}
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

      {clickDelete &&
        currentUser && (
        <MessageBox
          message={message}
          btnTxt={"Eliminar"}
          role={"not"}
          funcCancel={() => setClickDelete(false)}
          funcAgree={handleRemoveUser}
        />
      )}
    </div>
  );
}

export default Equipa;
