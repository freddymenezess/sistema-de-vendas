# Guia de Alertas com SweetAlert2

Este guia descreve como usar os novos alertas da aplicação MAMEV, que foram padronizados usando a biblioteca **SweetAlert2** com um design consistente com o restante da app.

## 📚 Importação

```javascript
import {
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
} from "@utils/sweetAlert";
```

## 🎨 Tipos de Alertas

### 1. **Sucesso** - Confirmação de ação realizada

```javascript
showSuccess("Sucesso!", "Operação concluída com êxito.");
// ou com timer padrão (2s)
showSuccess("Salvo!", "", 2000);
```

**Quando usar:** Após salvar dados, deletar, atualizar, enviar formulários.

---

### 2. **Erro** - Indicar falha na operação

```javascript
showError("Erro!", "Não foi possível processar sua requisição.");
```

**Quando usar:** Quando uma operação falha, dados inválidos, erros do servidor.

---

### 3. **Aviso** - Alertar sobre algo importante

```javascript
showWarning("Atenção!", "Por favor, preencha todos os campos obrigatórios.");
```

**Quando usar:** Validações, alertas de restrições, informações importantes.

---

### 4. **Informação** - Apenas informar

```javascript
showInfo("Informação", "Seu carrinho está vazio.");
```

**Quando usar:** Mensagens informativas que não são erros nem sucesso.

---

### 5. **Confirmação** - Ação que precisa ser confirmada

```javascript
const result = await showConfirm(
  "Tem certeza?",
  "Esta ação não pode ser desfeita.",
  "Sim, confirmar",
);

if (result.isConfirmed) {
  // Executar ação
}
```

**Quando usar:** Ações importantes que precisam de confirmação do usuário.

---

### 6. **Confirmação de Exclusão** - Padrão para deletar

```javascript
const result = await showDeleteConfirm(
  "Esta ação não pode ser desfeita. O item será removido permanentemente."
);

if (result.isConfirmed) {
  // Executar exclusão
  await deleteDoc(...);
}
```

**Quando usar:** Sempre que um usuário quer deletar algo. Já vem com estilos específicos para exclusão.

---

### 7. **Input de Texto** - Solicitar entrada do usuário

```javascript
const result = await showInput(
  "Digite um nome",
  "Nome do cliente...",
  "Confirmar",
);

if (result.value) {
  console.log(result.value); // Valor digitado
}
```

**Quando usar:** Solicitar um input simples do usuário.

---

### 8. **Loading/Carregamento** - Mostrar operação em andamento

```javascript
showLoading("Processando...", "Por favor, aguarde.");

// Após completar:
updateToSuccess("Pronto!", "Operação finalizada com sucesso.");
// ou
updateToError("Erro!", "Algo deu errado. Tente novamente.");
```

**Quando usar:** Para operações longas (upload, sincronização, processamento).

---

## 🎯 Exemplos Práticos

### Upload de Arquivo

```javascript
import {
  showWarning,
  showError,
  showLoading,
  updateToSuccess,
} from "@utils/sweetAlert";

const handleImageUpload = async (file) => {
  if (!file.type.startsWith("image/")) {
    showWarning("Arquivo inválido", "Por favor, selecione uma imagem.");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    showWarning("Arquivo muito grande", "A imagem deve ter no máximo 2MB.");
    return;
  }

  showLoading("Enviando imagem...");

  try {
    const url = await uploadFile(file);
    updateToSuccess("Sucesso!", "Imagem enviada com êxito.");
    return url;
  } catch (error) {
    updateToError("Erro no upload", "Não foi possível enviar a imagem.");
  }
};
```

### Formulário com Validação

```javascript
import { showWarning, showSuccess, showError } from "@utils/sweetAlert";

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email) {
    showWarning("Campo obrigatório", "Por favor, preencha o email.");
    return;
  }

  try {
    await saveData(formData);
    showSuccess("Sucesso!", "Dados salvos com êxito!");
  } catch (error) {
    showError("Erro", "Não foi possível salvar os dados: " + error.message);
  }
};
```

### Deletar com Confirmação

```javascript
import { showDeleteConfirm, showSuccess, showError } from "@utils/sweetAlert";

const handleDelete = async (id) => {
  const result = await showDeleteConfirm("Esta ação não pode ser desfeita.");

  if (!result.isConfirmed) return;

  try {
    await deleteDoc(doc(db, "colecao", id));
    showSuccess("Sucesso!", "Item excluído com êxito.");
    loadData();
  } catch (error) {
    showError("Erro", "Não foi possível deletar o item.");
  }
};
```

---

## 🎨 Cores Personalizadas

Os alertas utilizam a paleta de cores da aplicação:

| Tipo    | Cor                  | Uso                 |
| ------- | -------------------- | ------------------- |
| Success | Verde (#059669)      | Ações bem-sucedidas |
| Error   | Vermelho (#dc2626)   | Erros e falhas      |
| Warning | Laranja (#d97706)    | Avisos e validações |
| Info    | Azul Claro (#0ea5e9) | Informações gerais  |
| Primary | Azul (#3b82f6)       | Confirmações padrão |

---

## ⚙️ Customização

Caso precise customizar um alerta além do padrão, você pode utilizar diretamente o SweetAlert2:

```javascript
import Swal from "sweetalert2";

Swal.fire({
  title: "Título",
  text: "Mensagem",
  icon: "info",
  confirmButtonColor: "#3b82f6",
  // mais opções...
});
```

Consulte a [documentação do SweetAlert2](https://sweetalert2.github.io/) para mais opções.

---

## 📋 Checklist de Migração

Ao atualizar alertas nativos para SweetAlert2:

- [ ] Remover `alert()` e substituir por `show*()` apropriado
- [ ] Remover `confirm()` e substituir por `showConfirm()` ou `showDeleteConfirm()`
- [ ] Adicionar import do utilitário
- [ ] Testar a visualização em diferentes dispositivos
- [ ] Verificar mensagens para consistência de linguagem (pt-BR)

---

## 🚫 NÃO USE

❌ Evite usar `alert()` nativo do navegador
❌ Evite usar `confirm()` nativo do navegador
❌ Não misture `showAlert()` antigo com os novos alertas

---

## 📞 Suporte

Para dúvidas ou sugestões sobre os alertas, consulte a documentação ou o desenvolvedor responsável pela manutenção.
