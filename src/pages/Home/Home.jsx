import { getItem } from "@services/storage.js";
import styles from "./Home.module.css";

function Home() {
  const user = getItem("currentUser");

  return (
    <h1>Bem-vindo(a), {user.name}!</h1>
  );
}

export default Home;
