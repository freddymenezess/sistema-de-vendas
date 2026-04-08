import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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
    <p>Tem a certeza que pretende eliminar <strong style={{ color: "#000" }}>{currentUser.name}</strong> do sistema? Esta accao e irreversivel.</p>
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
    <h2>Funcionarios</h2>
  );
}

export default Funcionarios;
