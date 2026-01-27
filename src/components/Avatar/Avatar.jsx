import styles from "./Avatar.module.css";

function Avatar({ name, role, className }) {
  const initials = name
    .split(" ")
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 2);

  return <div className={`${styles.avatar} ${styles[role]} ${className}`}>{initials}</div>;
}

export default Avatar;