import * as React from "react";
import { Menu, MenuItem, Divider, ListItemIcon, Box } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import Settings from "@mui/icons-material/Settings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Avatar from "@components/Avatar/Avatar";
import useAuth from "@hooks/useAuth";
import { showConfirm } from "@utils/sweetAlert";

export default function DropMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await showConfirm(
      "Terminar sessão?",
      "Tem certeza que deseja sair do sistema?",
      "Sim, sair",
    );
    if (result.isConfirmed) {
      setAnchorEl(null);
      logout();
    }
  };

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          padding: "6px 12px",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "0.2s",
          "&:hover": {
            backgroundColor: "#f9fafb",
          },
        }}
      >
        <Avatar
          style={{
            flex: "0 1 40px",
            aspectRatio: "1/1",
          }}
          name={user.name}
        />

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            lineHeight: 1.2,
          }}
        >
          <span className={{ fontSize: "0.80rem", fontWeight: 600 }}>
            {user.name}
          </span>
          <span
            className={{
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            {user.role}
          </span>
        </Box>

        <KeyboardArrowDownIcon sx={{ color: "#9ca3af" }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            padding: "0 8px",
            minWidth: "200px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          },
        }}
        handleL
      >
        <MenuItem style={{ borderRadius: "4px" }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configurações
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={logout}
          style={{ borderRadius: "4px" }}
          sx={{
            color: "error.main",
            "& svg": {
              color: "error.main",
            },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Terminar sessão
        </MenuItem>
      </Menu>
    </>
  );
}
