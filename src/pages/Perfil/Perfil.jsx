import { useState, useContext, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@services/firebase";
import { uploadImagem } from "@services/supabase";
import { AuthContext } from "@auth/AuthContext";
import { Camera, Save, User } from "lucide-react";
import { showError, showSuccess, showWarning } from "@utils/sweetAlert";
import styles from "./Perfil.module.css";

function Perfil() {
  const { user, userData } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || "",
    telefone: user?.telefone || "",
    endereco: user?.endereco || "",
    dataNascimento: user?.dataNascimento || "",
    src: user?.fotoUrl || "",
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showWarning("Arquivo inválido", "Por favor, selecione uma imagem.");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showWarning("Arquivo muito grande", "A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);

    try {
      const url = await uploadImagem(file, "perfil");

      setFormData({ ...formData, src: url });

      await updateDoc(doc(db, "usuarios", userData.uid), {
        fotoUrl: url,
      });

      showSuccess("Sucesso!", "Foto atualizada com êxito!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      showError("Erro no upload", "Não foi possível fazer upload da foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDoc(doc(db, "usuarios", userData.uid), {
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco,
        dataNascimento: formData.dataNascimento,
        updatedAt: new Date(),
      });

      showSuccess("Sucesso!", "Perfil atualizado com êxito!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showError("Erro", "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (cargo) => {
    switch (cargo) {
    case "admin":
      return "Administrador";
    case "manager":
      return "Gerente";
    default:
      return "Vendedor";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.photoSection}>
          <div className={styles.photoWrapper} onClick={handlePhotoClick}>
            {formData.src ? (
              <img
                src={formData.src}
                alt="Foto de perfil"
                className={styles.photo}
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <User size={48} />
              </div>
            )}
            <div className={styles.photoOverlay}>
              <Camera size={24} />
              <span>{uploading ? "Enviando..." : "Alterar foto"}</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className={styles.fileInput}
          />
          <h2 className={styles.userName}>{user?.nome || "Utilizador"}</h2>
          <span className={styles.userRole}>{getRoleLabel(user?.cargo)}</span>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.sectionTitle}>Informações Pessoais</h3>

          <div className={styles.field}>
            <label className={styles.label}>Nome Completo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              className={styles.input}
              required
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className={styles.input}
                placeholder="(+244) 912 345 678"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Data de Nascimento</label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  setFormData({ ...formData, dataNascimento: e.target.value })
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
              className={styles.input}
              placeholder="Endereço completo"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
