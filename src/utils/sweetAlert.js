import Swal from "sweetalert2";

// Cores da paleta do design
const colors = {
  primary: "#3b82f6",
  primaryDark: "#1d4ed8",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0ea5e9",
  textPrimary: "#0f172a",
  border: "#e2e8f0",
};

// Configuração base do Swal
const swalConfig = {
  customClass: {
    container: "swal2-custom-container",
    popup: "swal2-custom-popup",
    title: "swal2-custom-title",
    closeButton: "swal2-custom-close",
    input: "swal2-custom-input",
    confirmButton: "swal2-custom-confirm-btn",
    denyButton: "swal2-custom-deny-btn",
    cancelButton: "swal2-custom-cancel-btn",
  },
  allowOutsideClick: false,
  allowEscapeKey: true,
};

/**
 * Alerta de sucesso
 */
export function showSuccess(title = "Sucesso!", message = "", timer = 2000) {
  return Swal.fire({
    ...swalConfig,
    icon: "success",
    title,
    html: message || undefined,
    iconColor: colors.success,
    confirmButtonColor: colors.success,
    confirmButtonText: "OK",
    // ✅ timer só entra se for > 0
    ...(timer > 0 && { timer, timerProgressBar: true }),
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.success}`;
      const bar = modal.querySelector(".swal2-timer-progress-bar");
      if (bar) bar.style.background = colors.success;
    },
  });
}

/**
 * Alerta de erro
 */
export function showError(title = "Erro!", message = "") {
  return Swal.fire({
    ...swalConfig,
    icon: "error",
    title,
    html: message || undefined,
    iconColor: colors.error,
    confirmButtonColor: colors.error,
    confirmButtonText: "OK",
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.error}`;
    },
  });
}

/**
 * Alerta de aviso
 */
export function showWarning(title = "Aviso!", message = "") {
  return Swal.fire({
    ...swalConfig,
    icon: "warning",
    title,
    html: message || undefined,
    iconColor: colors.warning,
    confirmButtonColor: colors.warning,
    confirmButtonText: "OK",
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.warning}`;
    },
  });
}

/**
 * Alerta de informação
 */
export function showInfo(title = "Informação", message = "") {
  return Swal.fire({
    ...swalConfig,
    icon: "info",
    title,
    html: message || undefined,
    iconColor: colors.info,
    confirmButtonColor: colors.info,
    confirmButtonText: "OK",
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.info}`;
    },
  });
}

/**
 * Confirmação simples (OK/Cancelar)
 */
export function showConfirm(
  title = "Confirmação",
  message = "",
  confirmText = "Confirmar",
) {
  return Swal.fire({
    ...swalConfig,
    icon: "question",
    title,
    html: message || undefined,
    iconColor: colors.primary,
    showCancelButton: true,
    confirmButtonColor: colors.primary,
    cancelButtonColor: colors.border,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.primary}`;
      const cancelBtn = modal.querySelector(".swal2-cancel");
      if (cancelBtn) {
        cancelBtn.style.color = colors.textPrimary;
      }
    },
  });
}

/**
 * Confirmação de exclusão (Deletar/Cancelar)
 */
export function showDeleteConfirm(
  message = "Esta ação não pode ser desfeita!",
) {
  return Swal.fire({
    ...swalConfig,
    icon: "warning",
    title: "Tem certeza?",
    html: message,
    iconColor: colors.error,
    showCancelButton: true,
    confirmButtonColor: colors.error,
    cancelButtonColor: colors.border,
    confirmButtonText: "Sim, deletar",
    cancelButtonText: "Cancelar",
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.error}`;
      const cancelBtn = modal.querySelector(".swal2-cancel");
      if (cancelBtn) {
        cancelBtn.style.color = colors.textPrimary;
      }
    },
  });
}

/**
 * Modal com input de texto
 */
export function showInput(
  title = "Digite algo",
  placeholder = "",
  confirmText = "Confirmar",
) {
  return Swal.fire({
    ...swalConfig,
    title,
    input: "text",
    inputPlaceholder: placeholder,
    iconColor: colors.primary,
    showCancelButton: true,
    confirmButtonColor: colors.primary,
    cancelButtonColor: colors.border,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value) {
        return "Campo obrigatório";
      }
    },
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.primary}`;
      const input = modal.querySelector("input");
      if (input) {
        input.style.borderColor = colors.border;
        input.style.borderRadius = "0.5rem";
      }
    },
  });
}

/**
 * Modal de carregamento
 */
export function showLoading(title = "Carregando...", message = "") {
  return Swal.fire({
    ...swalConfig,
    title,
    html: message || undefined,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: async (modal) => {
      await Swal.showLoading();
      modal.style.borderLeft = `4px solid ${colors.info}`;
    },
  });
}

/**
 * Atualizar modal de carregamento para sucesso
 */
export function updateToSuccess(
  title = "Sucesso!",
  message = "",
  timer = 2000,
) {
  Swal.update({
    icon: "success",
    title,
    html: message || undefined,
    allowOutsideClick: true,
    allowEscapeKey: true,
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.success}`;
      const bar = modal.querySelector(".swal2-timer-progress-bar");
      if (bar) bar.style.background = colors.success;
    },
    timer,
    timerProgressBar: timer > 0,
  });
  Swal.hideLoading();
}

/**
 * Atualizar modal de carregamento para erro
 */
export function updateToError(title = "Erro!", message = "", timer = 3000) {
  Swal.update({
    icon: "error",
    title,
    html: message || undefined,
    allowOutsideClick: true,
    allowEscapeKey: true,
    didOpen: (modal) => {
      modal.style.borderLeft = `4px solid ${colors.error}`;
      const bar = modal.querySelector(".swal2-timer-progress-bar");
      if (bar) bar.style.background = colors.error;
    },
    timer,
    timerProgressBar: timer > 0,
  });
  Swal.hideLoading();
}

/**
 * Fechar o modal atual
 */
export function closeSwal() {
  Swal.close();
}

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showDeleteConfirm,
  showInput,
  showLoading,
  updateToSuccess,
  updateToError,
  closeSwal,
};
