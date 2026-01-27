import { AuthContext } from "@auth/AuthContext";
import { useContext } from "react";
import NavBar from "@components/NavBar/NavBar";
import styles from "./Home.module.css";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Bem-vindo(a), {user.name}!</h1>
      <p>Página em desenvolvimnto</p>
    </>
  );
}

export default Home;
