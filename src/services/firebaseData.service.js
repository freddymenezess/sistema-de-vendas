import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

const PRODUCTS_COLLECTION = "products";
const VENDAS_COLLECTION = "vendas";
const FORNECEDORES_COLLECTION = "fornecedores";

/**
 * Inicializa produtos padrão na Firestore se a coleção estiver vazia
 */
export async function initializeDefaultProducts(defaultProducts) {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (querySnapshot.empty) {
      const batch = writeBatch(db);
      defaultProducts.forEach((product) => {
        const docRef = doc(collection(db, PRODUCTS_COLLECTION), String(product.id));
        batch.set(docRef, product);
      });
      await batch.commit();
      console.log("[v0] Produtos padrão inicializados no Firestore");
    }
  } catch (error) {
    console.error("[v0] Erro ao inicializar produtos padrão:", error);
  }
}

/**
 * Obtém todos os produtos da Firestore
 */
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: parseInt(doc.id), ...doc.data() });
    });
    return products.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("[v0] Erro ao obter produtos:", error);
    return [];
  }
}

/**
 * Atualiza um produto na Firestore
 */
export async function updateProduct(productId, productData) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(productId));
    await updateDoc(docRef, productData);
    console.log("[v0] Produto atualizado:", productId);
  } catch (error) {
    console.error("[v0] Erro ao atualizar produto:", error);
  }
}

/**
 * Atualiza múltiplos produtos na Firestore
 */
export async function updateProducts(products) {
  try {
    const batch = writeBatch(db);
    products.forEach((product) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, String(product.id));
      batch.set(docRef, product, { merge: true });
    });
    await batch.commit();
    console.log("[v0] Produtos atualizados em lote");
  } catch (error) {
    console.error("[v0] Erro ao atualizar produtos em lote:", error);
  }
}

/**
 * Obtém todas as vendas/compras da Firestore
 */
export async function getVendas() {
  try {
    const querySnapshot = await getDocs(collection(db, VENDAS_COLLECTION));
    const vendas = [];
    querySnapshot.forEach((doc) => {
      vendas.push({ docId: doc.id, ...doc.data() });
    });
    return vendas.sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    );
  } catch (error) {
    console.error("[v0] Erro ao obter vendas:", error);
    return [];
  }
}

/**
 * Adiciona uma nova venda/compra na Firestore
 */
export async function addVenda(vendaData) {
  try {
    const docRef = doc(collection(db, VENDAS_COLLECTION));
    await setDoc(docRef, {
      ...vendaData,
      docId: docRef.id,
    });
    console.log("[v0] Venda adicionada:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[v0] Erro ao adicionar venda:", error);
  }
}

/**
 * Deleta uma venda/compra da Firestore
 */
export async function deleteVenda(docId) {
  try {
    await deleteDoc(doc(db, VENDAS_COLLECTION, docId));
    console.log("[v0] Venda deletada:", docId);
  } catch (error) {
    console.error("[v0] Erro ao deletar venda:", error);
  }
}

/**
 * Obtém todos os fornecedores da Firestore
 */
export async function getFornecedores() {
  try {
    const querySnapshot = await getDocs(collection(db, FORNECEDORES_COLLECTION));
    const fornecedores = [];
    querySnapshot.forEach((doc) => {
      fornecedores.push({ id: doc.id, ...doc.data() });
    });
    return fornecedores;
  } catch (error) {
    console.error("[v0] Erro ao obter fornecedores:", error);
    return [];
  }
}

/**
 * Inicializa fornecedores padrão na Firestore
 */
export async function initializeFornecedores(defaultFornecedores) {
  try {
    const querySnapshot = await getDocs(collection(db, FORNECEDORES_COLLECTION));
    if (querySnapshot.empty) {
      const batch = writeBatch(db);
      defaultFornecedores.forEach((fornecedor) => {
        const docRef = doc(collection(db, FORNECEDORES_COLLECTION));
        batch.set(docRef, fornecedor);
      });
      await batch.commit();
      console.log("[v0] Fornecedores padrão inicializados no Firestore");
    }
  } catch (error) {
    console.error("[v0] Erro ao inicializar fornecedores padrão:", error);
  }
}

/**
 * Adiciona um novo fornecedor na Firestore
 */
export async function addFornecedor(fornecedorData) {
  try {
    const docRef = doc(collection(db, FORNECEDORES_COLLECTION));
    await setDoc(docRef, {
      ...fornecedorData,
      id: docRef.id,
    });
    console.log("[v0] Fornecedor adicionado:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[v0] Erro ao adicionar fornecedor:", error);
  }
}

/**
 * Atualiza um fornecedor na Firestore
 */
export async function updateFornecedor(fornecedorId, fornecedorData) {
  try {
    const docRef = doc(db, FORNECEDORES_COLLECTION, fornecedorId);
    await updateDoc(docRef, fornecedorData);
    console.log("[v0] Fornecedor atualizado:", fornecedorId);
  } catch (error) {
    console.error("[v0] Erro ao atualizar fornecedor:", error);
  }
}

/**
 * Deleta um fornecedor da Firestore
 */
export async function deleteFornecedor(fornecedorId) {
  try {
    await deleteDoc(doc(db, FORNECEDORES_COLLECTION, fornecedorId));
    console.log("[v0] Fornecedor deletado:", fornecedorId);
  } catch (error) {
    console.error("[v0] Erro ao deletar fornecedor:", error);
  }
}
