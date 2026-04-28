// Exemplo em qualquer componente de venda
import { useOnlineStatus } from "./useOnlineStatus";
import { salvarOffline, sincronizarComFirebase } from "../services/syncService";
import { useEffect } from "react";

export function NovaVenda() {
  const isOnline = useOnlineStatus();

  // Quando voltar online, sincroniza automaticamente
  useEffect(() => {
    if (isOnline) {
      sincronizarComFirebase();
    }
  }, [isOnline]);

  async function handleSubmit(dadosDaVenda) {
    if (isOnline) {
      // Salva direto no Firebase
      await addDoc(collection(db, "vendas"), dadosDaVenda);
    } else {
      // Salva no localStorage
      salvarOffline(dadosDaVenda);
      alert("Sem internet! Venda salva localmente e será enviada quando a conexão voltar.");
    }
  }

  return (
    <div>
      {!isOnline && (
        
      )}
      {/* seu formulário aqui */}
    </div>
  );
}