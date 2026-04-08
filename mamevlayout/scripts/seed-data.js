/**
 * Script para criar dados iniciais no Firebase
 * Execute este script uma vez para criar o usuário admin inicial
 * 
 * Para usar:
 * 1. Acesse o Console do Firebase (https://console.firebase.google.com)
 * 2. Vá para Authentication > Users > Add User
 * 3. Crie um usuário com email: admin@mamev.com e uma senha segura
 * 4. Copie o UID do usuário criado
 * 5. Vá para Firestore Database > Start Collection
 * 6. Crie a collection "usuarios" com o seguinte documento:
 * 
 * Document ID: (cole o UID do usuário)
 * Campos:
 *   - uid: (mesmo UID)
 *   - nome: "Administrador"
 *   - email: "admin@mamev.com"
 *   - cargo: "admin"
 *   - telefone: ""
 *   - createdAt: (timestamp atual)
 *   - ativo: true
 * 
 * 7. Crie também a collection "produtos" com alguns produtos de exemplo:
 * 
 * Exemplo de produto:
 *   - nome: "Batom Matte Rosa"
 *   - categoria: "Maquiagem"
 *   - preco: 29.90
 *   - precoCusto: 15.00
 *   - quantidade: 50
 *   - codigoBarras: "7891234567890"
 *   - descricao: "Batom de longa duração com acabamento matte"
 *   - createdAt: (timestamp atual)
 * 
 * Categorias disponíveis:
 *   - Maquiagem
 *   - Skincare
 *   - Cabelos
 *   - Perfumaria
 *   - Corpo e Banho
 *   - Unhas
 *   - Acessórios
 */

console.log(`
===========================================
INSTRUÇÕES DE CONFIGURAÇÃO DO FIREBASE
===========================================

1. Acesse: https://console.firebase.google.com

2. CRIAR USUÁRIO ADMIN:
   - Authentication > Users > Add User
   - Email: admin@mamev.com
   - Senha: sua-senha-segura
   - Copie o UID gerado

3. CRIAR DOCUMENTO DO USUÁRIO:
   - Firestore Database > usuarios (nova collection)
   - Adicione documento com os campos:
     * uid: [UID copiado]
     * nome: "Administrador"
     * email: "admin@mamev.com"
     * cargo: "admin"
     * ativo: true
     * createdAt: [timestamp]

4. CRIAR PRODUTOS DE EXEMPLO (opcional):
   - Firestore Database > produtos (nova collection)
   - Adicione produtos com os campos:
     * nome, categoria, preco, precoCusto, quantidade, codigoBarras

5. REGRAS DO FIRESTORE:
   Adicione estas regras em Firestore Database > Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

===========================================
`)
