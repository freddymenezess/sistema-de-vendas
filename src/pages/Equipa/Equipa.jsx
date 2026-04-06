import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { getItem, setItem } from "@services/storage";
import FormNewUser from "@components/FormNewUser/FormNewUser";
import { showAlert } from "@components/Alerts";
import MessageBox from "@components/MessageBox/MessageBox";
import styles from "./Equipa.module.css";

function Equipa() {
  const [opend, setOpend] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [clickDelete, setClickDelete] = useState(false);
  const currentId = getItem("currentUser").id;
  const message = (
    <p>
      Tem a certeza que pretende eliminar{" "}
      <strong style={{ color: "#000" }}>{currentUser.name}</strong> do sistema?
      Esta accao e irreversivel.
    </p>
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

    showAlert("Novo usuario criado", "success");
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

    showAlert("Usuario removido.", "success");
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <div className={styles.iconWrapper}>
              <Users size={24} />
            </div>
            <div>
              <h1>Gestao de Equipa</h1>
              <p>Gerencie os membros da sua equipa</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.badge}>{users.length} Funcionarios</span>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => setOpend(true)}
            >
              <UserPlus size={18} />
              Novo Funcionario
            </button>
          </div>
        </div>
      </header>

      {/* Table Section */}
      <section className={styles.tableSection}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={64} />
            <h3>Nenhum funcionario encontrado</h3>
            <p>Adicione funcionarios para comecar a gerenciar sua equipa</p>
          </div>
        ) : (
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
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {getInitials(user.name)}
                        </div>
                        <span className={styles.userName}>{user.name}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.roleBadge} ${getRoleClass(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td className={styles.emailCell}>{user.email}</td>
                    <td>{user.phone}</td>

                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleClick(user)}
                        title="Remover funcionario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {opend && (
        <FormNewUser setOpend={setOpend} handleNewUser={handleNewUser} />
      )}

      {clickDelete && currentUser && (
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
