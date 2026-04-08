import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";

// função global que será exportada
let externalShowAlert;

export function showAlert(message, severity = "success") {
  externalShowAlert?.(message, severity);
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const internalShowAlert = useCallback((message, severity) => {
    const id = crypto.randomUUID();

    setAlerts((prev) => [...prev, { id, message, severity }]);

    // auto-remove após 3s
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 3000);
  }, []);

  externalShowAlert = internalShowAlert;

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  if (!alerts.length) return null;

  // cores baseadas na paleta do seu site
  const colors = {
    success: "##188038", // cor principal suave
    error: "#f33d3dd3", // vermelho suave
    warning: "var(--main)", // tom de destaque
    info: "#F9F9F9", // neutro
  };

  return createPortal(
    <Stack
      sx={{
        position: "fixed",
        bottom: 20,
        left: 20,
        flexDirection: "column-reverse",
        gap: 1,
        maxWidth: "80vw",
        zIndex: 1300,
      }}
    >
      {alerts.map((alert) => (
        <Collapse key={alert.id} in={true}>
          <Alert
            severity={alert.severity}
            variant="filled"
            onClose={() => removeAlert(alert.id)}
            sx={{
              maxWidth: "400px",
              backgroundColor: colors[alert.severity] || colors.info,
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              fontWeight: 500,
              transition: "all 0.3s ease-in-out",
              "& .MuiAlert-action": {
                color: "#fff",
              },
            }}
          >
            {alert.message}
          </Alert>
        </Collapse>
      ))}
    </Stack>,
    document.body,
  );
}
