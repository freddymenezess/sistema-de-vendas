import * as React from "react";
import { Menu, Box, IconButton, Badge, Typography, Chip } from "@mui/material";
import {
  Bell,
  Package,
  TrendingUp,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { products, salesChart } from "../../data";
import { getItem, setItem } from "../../services/storage";
import styles from "./Notifications.module.css";

const NOTIFICATIONS_KEY = "app_notifications_read";

// Gera notificações baseadas nos dados reais
function generateNotifications() {
  const notifications = [];
  let id = 1;

  // 1. Notificações de BAIXO ESTOQUE (stock < minStock)
  const lowStockProducts = products.filter((p) => p.stock < p.minStock);
  lowStockProducts.forEach((product) => {
    const isCritical = product.stock <= 2;
    notifications.push({
      id: id++,
      type: "low-stock",
      title: isCritical ? "Estoque Crítico" : "Estoque Baixo",
      message: `${product.name} está com apenas ${product.stock} unidades (mínimo: ${product.minStock})`,
      productCode: product.code,
      priority: isCritical ? 1 : 2,
    });
  });

  // 2. Notificação de RECORDE DE VENDAS
  const salesData = [...salesChart];
  const maxSales = Math.max(...salesData.map((s) => s.vendas));
  const recordMonth = salesData.find((s) => s.vendas === maxSales);
  if (recordMonth) {
    const monthNames = {
      Jan: "Janeiro",
      Feb: "Fevereiro",
      Mar: "Março",
      Apr: "Abril",
      May: "Maio",
      Jun: "Junho",
      Jul: "Julho",
      Aug: "Agosto",
      Sep: "Setembro",
      Oct: "Outubro",
      Nov: "Novembro",
      Dec: "Dezembro",
    };
    notifications.push({
      id: id++,
      type: "sales-record",
      title: "Recorde de Vendas",
      message: `${monthNames[recordMonth.month]} registrou o maior faturamento: ${maxSales.toLocaleString("pt-AO")} KZ`,
      priority: 3,
    });
  }

  // 3. Notificações de NOVOS LOTES (produtos adicionados recentemente)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentProducts = products
    .filter((p) => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  recentProducts.forEach((product) => {
    const createdDate = new Date(product.createdAt);
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const timeAgo =
      diffDays === 0
        ? "Hoje"
        : diffDays === 1
          ? "Ontem"
          : `Há ${diffDays} dias`;

    notifications.push({
      id: id++,
      type: "new-batch",
      title: "Novo Lote Registrado",
      message: `${product.name} (${product.code}) foi adicionado ao sistema`,
      timeAgo,
      createdAt: product.createdAt,
      priority: 4,
    });
  });

  // Ordena por prioridade (críticos primeiro)
  return notifications.sort((a, b) => a.priority - b.priority);
}

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

const getTimeDisplay = (notification) => {
  if (notification.timeAgo) return notification.timeAgo;
  if (notification.type === "sales-record") return "Resumo anual";
  return "Agora";
};

export default function Notifications() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [readIds, setReadIds] = React.useState(() => {
    return getItem(NOTIFICATIONS_KEY) || [];
  });

  const generatedNotifications = React.useMemo(
    () => generateNotifications(),
    [],
  );

  const notifications = generatedNotifications.map((n) => ({
    ...n,
    read: readIds.includes(n.id),
  }));

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    setItem(NOTIFICATIONS_KEY, newReadIds);
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    setItem(NOTIFICATIONS_KEY, allIds);
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    handleMarkAsRead(id);
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
              backgroundColor: unreadCount > 0 ? "var(--main)" : "transparent",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              minWidth: "18px",
              height: "18px",
              borderRadius: "50%",
              border: unreadCount > 0 ? "2px solid #fff" : "none",
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
                      {getTimeDisplay(notification)}
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
