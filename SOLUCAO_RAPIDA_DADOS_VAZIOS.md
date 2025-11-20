# 🔧 Solução Rápida: Dados Vazios

## Problema

Sistema mostra a estrutura dos candidatos mas não exibe os dados.

## Causa Mais Comum

**Nomes das colunas no Google Sheets estão diferentes dos esperados pelo sistema.**

## Solução em 3 Passos

### 1️⃣ Verificar Nomes das Colunas

Abra sua planilha do Google Sheets e verifique se a **primeira linha** (cabeçalho) tem EXATAMENTE estes nomes:

```
✅ Nomes CORRETOS (copie e cole):

NOMECOMPLETO
NOMESOCIAL
CPF
VAGAPCD
LAUDOMEDICO
AREAATUACAO
CARGOADMIN
CARGOASSIS
CURRICULOVITAE
COPIARG
COPIACPF
DIPLOMACERTIFICADO
DOCUMENTOSCONSELHO
EXPERIENCIAPROFISSIONAL
Status
DataCadastro
Analista
```

⚠️ **ATENÇÃO**:
- Case-sensitive (letras maiúsculas/minúsculas importam)
- Sem espaços extras
- Sem acentos em colunas do sistema

### 2️⃣ Testar Conexão

1. Abra no navegador: `TESTE_DADOS_CANDIDATOS.html`
2. Clique em **"▶️ Testar Conexão e Dados"**
3. Verifique:
   - ✅ Conexão bem-sucedida?
   - ✅ Campos preenchidos > 0?
   - ✅ Campos vazios = 0?

Se ainda houver campos vazios, verifique se há dados nas células da planilha.

### 3️⃣ Verificar Console do Navegador

1. Abra o sistema
2. Pressione **F12** (ou clique com botão direito > Inspecionar)
3. Vá para a aba **Console**
4. Faça login
5. Procure por:

```
✅ BOM (dados corretos):
✅ [CandidateService] Campos preenchidos: ["NOMECOMPLETO", "CPF", "AREAATUACAO", ...]
🔍 [CandidateDetailView] NOMECOMPLETO: "João Silva"

❌ RUIM (dados vazios):
⚠️ [CandidateService] Campos vazios no primeiro candidato: ["NOMECOMPLETO", "CPF", ...]
🔍 [CandidateDetailView] NOMECOMPLETO: undefined
```

## Outras Causas Possíveis

### A) Planilha Vazia

**Sintoma**: Teste retorna 0 candidatos

**Solução**: Adicione dados na planilha (linhas 2+)

### B) SPREADSHEET_ID Incorreto

**Sintoma**: Erro ao conectar

**Solução**:
1. Copie o ID da URL da sua planilha:
   ```
   https://docs.google.com/spreadsheets/d/[COPIE_ESTE_ID]/edit
   ```
2. Cole no Google Apps Script (linha 16):
   ```javascript
   var SPREADSHEET_ID = 'COLE_AQUI';
   ```
3. Reimplante: Implantar > Gerenciar implantações > Nova versão

### C) Nome da Aba Incorreto

**Sintoma**: Erro "Planilha não encontrada"

**Solução**:
1. Verifique o nome da aba (deve ser "CANDIDATOS")
2. Se diferente, altere no script (linha 18):
   ```javascript
   var SHEET_CANDIDATOS = 'SEU_NOME_DA_ABA';
   ```
3. Reimplante

### D) Dados com Espaços ou Formatação

**Sintoma**: Alguns campos aparecem, outros não

**Solução**:
1. Remova espaços extras antes/depois dos valores
2. Verifique se há quebras de linha inesperadas
3. Use formato "Texto simples" nas células

## Checklist Rápido

- [ ] Nomes das colunas estão corretos?
- [ ] Há dados nas células (linha 2+)?
- [ ] SPREADSHEET_ID está correto?
- [ ] Nome da aba é "CANDIDATOS"?
- [ ] Teste de conexão passa?
- [ ] Console mostra campos preenchidos?

## Ainda Não Resolveu?

Consulte o guia completo: `DIAGNOSTICO_DADOS_VAZIOS.md`

## Exemplo de Planilha Correta

```
| NOMECOMPLETO | CPF           | AREAATUACAO     | CARGOADMIN       | VAGAPCD |
|--------------|---------------|-----------------|------------------|---------|
| João Silva   | 123.456.789-00| Administrativa  | Analista RH      | Não     |
| Maria Santos | 987.654.321-00| Assistencial    |                  | Sim     |
```

⚠️ Primeira linha = nomes das colunas (exatamente como especificado)
⚠️ Linhas 2+ = dados dos candidatos
