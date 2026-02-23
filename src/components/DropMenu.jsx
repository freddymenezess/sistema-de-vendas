import * as React from "react";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Logout from "@mui/icons-material/Logout";
import Avatar from "@components/Avatar/Avatar";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useAuth from "@hooks/useAuth";

export default function DropMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useAuth();

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: "#000",
          gap: "6px",

          "&:hover": {
            backgroundColor: "var(--desfoque)",
          },
        }}
      >
        <Avatar name={user.name} />

        <Box
          sx={{
            display: {
              xs: "none", // mobile
              sm: "flex",
            },
            flexDirection: "column",
            alignItems: "flex-start",
            lineHeight: 1.2,
          }}
        >
          <span style={{ fontWeight: "bolder" }}>{user.name}</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{user.role}</span>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          },
        }}
      >
        <MenuItem
          onClick={logout}
          sx={{
            backgroundColor: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "error.main",
            fontWeight: 500,

            "&:hover": {
              opacity: "0.8",
            },

            "& svg": {
              color: "error.main",
              mr: 1,
            },
          }}
        >
          <Logout />
          Terminar sessão
        </MenuItem>
      </Menu>
    </>
  );
}
