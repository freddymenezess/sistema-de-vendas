import { Users } from "lucide-react";
import data from "@data/users.json";
import { getItem, setItem } from "@services/storage.js";
import Avatar from "@components/Avatar/Avatar";
import styles from "./OnStaff.module.css";

function OnStaff() {
  if (!getItem("users")) {
    setItem("users", data);
  }

  const team = getItem("users");

  return (
    <div className={styles.card}>
      <header className="flex">
        <Users />
        <h2>Funcionários online</h2>
      </header>
      <ul className={`${styles.list} list`}>
        {team.map((f) => (
          <li key={f.id} className={`${styles.member} flex`}>
            <div className={`flex ${styles.info}`}>
              <Avatar name={f.name} role={f.role} />
              <div className={`flex ${styles.desc}`}>
                <p>{f.name}</p>
                <p className={styles.role}>
                  Cargo:{" "}
                  <strong>
                    {
                      f.role === "admin"
                        ? "Administrador"
                        : f.role === "manager"
                          ? "Gerente"
                          : f.role === "seller"
                            ? "Vendedor"
                            : "Desconhecido"
                    }
                  </strong>
                </p>
              </div>
            </div>
            <span className={`${styles.status} ${styles.online}`} />
          </li>
        ))}
      </ul>
      <div className={`${styles.footer} flex`}>
        <a href="#">Cadastrar funcionários</a>
      </div>
    </div>
  );
}

export default OnStaff;
