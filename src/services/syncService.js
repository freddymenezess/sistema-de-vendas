// src/services/syncService.js
import { db } from "./firebase"; // seu arquivo de config do Firebase
import { collection, addDoc } from "firebase/firestore";

const STORAGE_KEY = "vendas_offline";

// Salva venda no localStorage quando offline
export function salvarOffline(dados) {
  const existentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  existentes.push({ ...dados, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
}

// Sincroniza tudo que está no localStorage com o Firebase
export async function sincronizarComFirebase() {
  const pendentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (pendentes.length === 0) return;

  for (const item of pendentes) {
    try {
      await addDoc(collection(db, "vendas"), item);
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      return; // Para se der erro, tenta de novo depois
    }
  }

  // Limpa o localStorage após sincronizar tudo
  localStorage.removeItem(STORAGE_KEY);
  console.log(`${pendentes.length} venda(s) sincronizada(s)!`);
}