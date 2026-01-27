import styles from "./Avatar.module.css";

function Avatar({ name, className = "" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 2);

  return <div className={`${styles.avatar} ${className}`}>{initials}</div>;
}

export default Avatar;