import { createPortal } from "react-dom";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export default function SimpleAlert({
  message,
  severity = "success",
  open,
  onClose,
  top = "",
  bottom = 20,
  right = 20,
  left = ""
}) {
  if (!open) return null;

  return createPortal(
    <Stack
      sx={{
        position: "fixed",
        top,
        bottom,
        right,
        left,
        width: "auto",
        zIndex: 9999,
      }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Stack>,
    document.body,
  );
}
