import * as React from "react";
import { Menu, Box, IconButton, Badge, Typography, Chip } from "@mui/material";
import { Bell, Package, TrendingUp, AlertTriangle, X, Check } from "lucide-react";
import styles from "./Notifications.module.css";

const initialNotifications = [
  {
    id: 1,
    type: "low-stock",
    title: "Estoque Baixo",
    message: "Café Premium está com apenas 5 unidades em estoque",
    time: "Há 10 min",
    read: false,
  },
  {
    id: 2,
    type: "sales-record",
    title: "Recorde de Vendas",
    message: "Parabéns! Você bateu o recorde de vendas do mês anterior",
    time: "Há 1 hora",
    read: false,
  },
  {
    id: 3,
    type: "new-batch",
    title: "Novo Lote Registrado",
    message: "Lote #2847 de Açúcar Refinado foi adicionado ao sistema",
    time: "Há 2 horas",
    read: false,
  },
  {
    id: 4,
    type: "low-stock",
    title: "Estoque Crítico",
    message: "Farinha de Trigo está com apenas 2 unidades - reposição urgente",
    time: "Há 3 horas",
    read: true,
  },
  {
    id: 5,
    type: "new-batch",
    title: "Novo Lote Registrado",
    message: "Lote #2846 de Óleo de Soja foi adicionado ao sistema",
    time: "Há 5 horas",
    read: true,
  },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case "low-stock":
      return <AlertTriangle size={18} />;
    case "sales-record":
      return <TrendingUp size={18} />;
    case "new-batch":
      return <Package size={18} />;
    default:
      return <Bell size={18} />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "low-stock":
      return { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" };
    case "sales-record":
      return { bg: "#f0fdf4", color: "#22c55e", border: "#bbf7d0" };
    case "new-batch":
      return { bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe" };
    default:
      return { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" };
  }
};

export default function Notifications() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className={styles.bellButton}
        sx={{
          position: "relative",
          color: "#6b7280",
          padding: "10px",
          borderRadius: "10px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "var(--m-desfoque)",
            color: "var(--sec)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "var(--main)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              minWidth: "18px",
              height: "18px",
              borderRadius: "50%",
              border: "2px solid #fff",
            },
          }}
        >
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            minWidth: "360px",
            maxWidth: "400px",
            maxHeight: "480px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        <Box className={styles.header}>
          <Typography className={styles.headerTitle}>Notificações</Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} novas`}
              size="small"
              sx={{
                backgroundColor: "var(--m-desfoque)",
                color: "var(--sec)",
                fontWeight: 600,
                fontSize: "11px",
                height: "24px",
              }}
            />
          )}
        </Box>

        {unreadCount > 0 && (
          <Box className={styles.actions}>
            <button onClick={handleMarkAllAsRead} className={styles.markAllBtn}>
              <Check size={14} />
              Marcar todas como lidas
            </button>
          </Box>
        )}

        <Box className={styles.notificationList}>
          {notifications.length === 0 ? (
            <Box className={styles.emptyState}>
              <Bell size={32} className={styles.emptyIcon} />
              <Typography className={styles.emptyText}>
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => {
              const colors = getNotificationColor(notification.type);
              return (
                <Box
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <Box
                    className={styles.iconWrapper}
                    sx={{
                      backgroundColor: colors.bg,
                      color: colors.color,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box className={styles.content}>
                    <Typography className={styles.title}>
                      {notification.title}
                    </Typography>
                    <Typography className={styles.message}>
                      {notification.message}
                    </Typography>
                    <Typography className={styles.time}>
                      {notification.time}
                    </Typography>
                  </Box>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => handleRemove(notification.id, e)}
                    aria-label="Remover notificação"
                  >
                    <X size={14} />
                  </button>
                </Box>
              );
            })
          )}
        </Box>
      </Menu>
    </>
  );
}
