# Diagnóstico: Dados Vazios nos Candidatos

## Problema Reportado

O sistema está mostrando apenas a "máscara" (estrutura) dos dados dos candidatos, mas não está exibindo o conteúdo real.

## Possíveis Causas

### 1. ❌ Dados Não Estão na Planilha

**Sintoma**: Candidatos aparecem na lista mas campos estão vazios

**Verificar**:
- Abra a planilha do Google Sheets
- Confirme que as colunas têm dados preenchidos
- Verifique se os nomes das colunas estão corretos

**Colunas Essenciais**:
```
NOMECOMPLETO
CPF
AREAATUACAO
CARGOADMIN
CARGOASSIS
VAGAPCD
CURRICULOVITAE
COPIARG
COPIACPF
DIPLOMACERTIFICADO
DOCUMENTOSCONSELHO
```

### 2. ❌ Nomes de Colunas Incorretos

**Sintoma**: Google Apps Script retorna dados mas frontend não reconhece

**Verificar**:
- Os nomes das colunas no Google Sheets devem ser **EXATAMENTE** iguais aos esperados
- São case-sensitive (NOMECOMPLETO ≠ nomecompleto)
- Sem espaços extras

**Solução**: Renomeie as colunas na planilha para corresponder exatamente aos nomes esperados.

### 3. ❌ Google Apps Script Não Está Retornando Dados

**Sintoma**: Requisição é feita mas resposta vem vazia

**Como Testar**:

1. Abra o arquivo: `TESTE_DADOS_CANDIDATOS.html` no navegador
2. Clique em "▶️ Testar Conexão e Dados"
3. Veja os logs:

**Se der erro**:
- ❌ URL do script está incorreta
- ❌ Script não está implantado
- ❌ Permissões incorretas

**Se conectar mas não retornar candidatos**:
- ❌ Planilha vazia
- ❌ Nome da aba está incorreto no script
- ❌ SPREADSHEET_ID está incorreto

### 4. ❌ Paginação Não Implementada no Script

**Sintoma**: Timeout ou erro ao carregar muitos candidatos

**Verificar**:
- Se a planilha tem mais de 5 mil candidatos
- Se o Google Apps Script atual suporta paginação

**Solução**: Use o script otimizado em `google-apps-script-OTIMIZADO-5K.js`

### 5. ❌ Normalização de Dados no Frontend

**Sintoma**: Dados chegam mas não são exibidos corretamente

**Verificar Console do Navegador** (F12):

```
📊 [CandidateService] Exemplo de candidato: {...}
🔍 [CandidateService] Campos do candidato: [...]
⚠️ [CandidateService] Campos vazios no primeiro candidato: [...]
✅ [CandidateService] Campos preenchidos: [...]
```

Se os campos preenchidos estiverem vazios, o problema é nos dados da planilha.

### 6. ❌ Mapeamento de Campos no DetailView

**Sintoma**: Alguns campos aparecem, outros não

**Verificar** em `CandidateDetailView.tsx`:

```typescript
const labelMap: { [key: string]: string } = {
  NOMECOMPLETO: 'NOME COMPLETO',
  NOMESOCIAL: 'NOME SOCIAL',
  CPF: 'CPF',
  // ... outros campos
};
```

Se um campo não estiver no `labelMap`, ele não será exibido.

## Passo a Passo para Diagnóstico

### Passo 1: Verificar Planilha

1. Abra o Google Sheets
2. Vá para a aba "CANDIDATOS"
3. Confirme que há dados preenchidos nas colunas
4. Verifique os nomes das colunas (linha 1)
5. Anote os nomes EXATOS das colunas

### Passo 2: Testar Google Apps Script

1. Abra `TESTE_DADOS_CANDIDATOS.html` no navegador
2. Clique em "▶️ Testar Conexão e Dados"
3. Veja o resultado:
   - ✅ Conexão bem-sucedida?
   - ✅ Candidatos retornados?
   - ✅ Campos preenchidos?

### Passo 3: Verificar Console do Frontend

1. Abra o sistema no navegador
2. Pressione F12 para abrir o console
3. Faça login
4. Observe os logs:

```
📞 Chamando getCandidates do Google Sheets...
📄 Página: 1 PageSize: 1000
📥 Resultado completo recebido: {...}
📊 result.candidates: [...]
📦 [CandidateService] Total de candidatos carregados: X
👤 [CandidateService] Exemplo de candidato: {...}
🔍 [CandidateService] Campos do candidato: [...]
✅ [CandidateService] Campos preenchidos: [...]
```

### Passo 4: Verificar DetailView

1. Clique em um candidato para abrir os detalhes
2. Veja os logs no console:

```
🔍 [CandidateDetailView] Dados recebidos: {...}
🔍 [CandidateDetailView] Campos disponíveis: [...]
🔍 [CandidateDetailView] NOMECOMPLETO: "João Silva"
🔍 [CandidateDetailView] CPF: "123.456.789-00"
```

Se aparecer "undefined" ou "" (vazio), o problema é que os dados não estão chegando.

## Soluções por Cenário

### Cenário A: Planilha Vazia ou Sem Dados

**Solução**:
1. Preencha a planilha com dados reais
2. Certifique-se de que a linha 1 tem os nomes das colunas
3. Certifique-se de que as linhas 2+ têm dados dos candidatos

### Cenário B: Nomes de Colunas Incorretos

**Solução**:
1. Renomeie as colunas na planilha para corresponder aos nomes esperados
2. Use EXATAMENTE estes nomes (case-sensitive):

```
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

### Cenário C: Google Apps Script Desatualizado

**Solução**:
1. Copie o código de `google-apps-script-OTIMIZADO-5K.js`
2. Cole no Google Apps Script (substituindo tudo)
3. Configure o `SPREADSHEET_ID`
4. Reimplante o script

### Cenário D: SPREADSHEET_ID Incorreto

**Solução**:
1. Abra sua planilha no Google Sheets
2. Copie o ID da URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
   ```
3. Cole no Google Apps Script (linha 16):
   ```javascript
   var SPREADSHEET_ID = 'SEU_ID_AQUI';
   ```
4. Reimplante

### Cenário E: Nome da Aba Incorreto

**Solução**:
1. Verifique o nome da aba na planilha (deve ser exatamente "CANDIDATOS")
2. Se for diferente, altere no Google Apps Script:
   ```javascript
   var SHEET_CANDIDATOS = 'SEU_NOME_DA_ABA';
   ```
3. Reimplante

## Checklist de Verificação

- [ ] Planilha tem dados preenchidos?
- [ ] Nomes das colunas estão corretos?
- [ ] SPREADSHEET_ID está correto no script?
- [ ] Nome da aba "CANDIDATOS" está correto?
- [ ] Google Apps Script está implantado?
- [ ] URL do script está no arquivo .env?
- [ ] Teste de conexão funciona? (TESTE_DADOS_CANDIDATOS.html)
- [ ] Console mostra candidatos carregados?
- [ ] Console mostra campos preenchidos?
- [ ] DetailView mostra os dados corretamente?

## Logs Esperados (Normal)

```
📞 Chamando getCandidates do Google Sheets...
📄 Página: 1 PageSize: 1000
📥 Resultado completo recebido: {success: true, candidates: Array(50), pagination: {...}}
📊 result.candidates: (50) [{...}, {...}, ...]
📦 [CandidateService] Total de candidatos carregados: 50
👤 [CandidateService] Exemplo de candidato: {NOMECOMPLETO: "João Silva", CPF: "123..."}
🔍 [CandidateService] Campos do candidato: ["NOMECOMPLETO", "CPF", "AREAATUACAO", ...]
✅ [CandidateService] Campos preenchidos: ["NOMECOMPLETO", "CPF", "AREAATUACAO", "CARGOADMIN"]
🔍 [CandidateDetailView] NOMECOMPLETO: "João Silva"
🔍 [CandidateDetailView] CPF: "123.456.789-00"
```

## Logs de Erro (Problema)

```
❌ [CandidateService] Erro ao buscar candidatos: Error: HTTP 500
```
OU
```
⚠️ [CandidateService] Campos vazios no primeiro candidato: ["NOMECOMPLETO", "CPF", ...]
🔍 [CandidateDetailView] NOMECOMPLETO: undefined
🔍 [CandidateDetailView] CPF: undefined
```

## Contato para Suporte

Se após seguir todos os passos o problema persistir, forneça:

1. Screenshot da planilha (primeiras 5 linhas)
2. Logs do console do navegador (F12)
3. Resultado do teste `TESTE_DADOS_CANDIDATOS.html`
4. Versão do Google Apps Script em uso
