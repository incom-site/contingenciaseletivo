# Debug: Dados no Frontend

## Situação Atual

✅ Teste externo (`TESTE_DADOS_CANDIDATOS.html`) retorna todos os dados corretamente
❓ Sistema não mostra os dados na interface

## Logs para Verificar

Quando você abrir o sistema e fizer login, procure estes logs no console (F12):

### 1. Carregamento Inicial

```javascript
📊 [CandidateService] Buscando candidatos...
📄 Página: 1 PageSize: 100
📞 Chamando getCandidates do Google Sheets...
📥 Resultado completo recebido: {...}
📦 [CandidateService] Total de candidatos carregados: X
```

**O que verificar:**
- Total de candidatos carregados é > 0?
- Se for 0, o problema está no carregamento

### 2. Estrutura dos Dados

```javascript
👤 [CandidateService] Exemplo de candidato: {...}
🔍 [CandidateService] Campos do candidato: ["CPF", "NOMECOMPLETO", ...]
✅ [CandidateService] Campos preenchidos: ["NOMECOMPLETO", "CPF", ...]
⚠️ [CandidateService] Campos vazios no primeiro candidato: []
```

**O que verificar:**
- Campos preenchidos incluem: NOMECOMPLETO, CPF, AREAATUACAO?
- Lista de campos vazios está vazia?
- Se houver campos vazios importantes, o problema é nos dados

### 3. Lista de Candidatos

```javascript
📋 [CandidateList] Total de candidatos recebidos: X
👤 [CandidateList] Primeiro candidato: {...}
📊 [CandidateList] Campos do primeiro: [...]
```

**O que verificar:**
- Total recebido é > 0?
- Primeiro candidato tem os campos esperados?

### 4. Detalhes do Candidato (ao clicar)

```javascript
🔍 [CandidateDetailView] Dados recebidos: {...}
🔍 [CandidateDetailView] Campos disponíveis: [...]
📋 [CandidateDetailView] Valores dos campos importantes:
  ✅ NOMECOMPLETO: "João Silva" (string)
  ✅ CPF: "123.456.789-00" (string)
  ✅ AREAATUACAO: "Administrativa" (string)
  ...
```

**O que verificar:**
- Todos os campos têm ✅?
- Se tiver ❌, ver o valor exibido (undefined, null, ""?)

### 5. Campos Processados

```javascript
📋 [createOrderedFields] Total campos: 5, Com valor: 5
🔍 [getFieldValue] NOMECOMPLETO: "João Silva" string
🔍 [getFieldValue] CPF: "123.456.789-00" string
```

**O que verificar:**
- Total de campos = Com valor?
- Se "Com valor" for 0, os campos estão sendo filtrados incorretamente

## Cenários Possíveis

### Cenário A: Nenhum candidato carregado (Total = 0)

**Sintoma:**
```
📦 [CandidateService] Total de candidatos carregados: 0
```

**Causa:** Filtro por usuário está removendo todos os candidatos

**Solução:** Verificar se o `Analista` ou `assigned_to` na planilha corresponde ao email/ID do usuário logado

### Cenário B: Candidatos carregados mas campos vazios

**Sintoma:**
```
⚠️ [CandidateService] Campos vazios: ["NOMECOMPLETO", "CPF", ...]
❌ NOMECOMPLETO: "undefined" (string)
❌ CPF: "" (string)
```

**Causa:** Nomes das colunas no Google Sheets não correspondem aos esperados

**Solução:**
1. Abra o teste externo novamente
2. Veja no JSON exibido quais são os nomes EXATOS das colunas
3. Compare com os esperados: NOMECOMPLETO, CPF, etc.
4. Renomeie na planilha OU ajuste o código

### Cenário C: Dados chegam mas não são exibidos

**Sintoma:**
```
✅ [CandidateService] Campos preenchidos: ["NOMECOMPLETO", "CPF", ...]
✅ NOMECOMPLETO: "João Silva" (string)
📋 [createOrderedFields] Total campos: 5, Com valor: 0
```

**Causa:** Função `getFieldValue` está filtrando os valores incorretamente

**Solução:** Já corrigida no código atualizado

### Cenário D: Valores com espaços ou formatação estranha

**Sintoma:**
```
❌ NOMECOMPLETO: "   " (string)
❌ CPF: " " (string)
```

**Causa:** Células da planilha têm espaços mas sem texto

**Solução:** Limpar dados na planilha (remover espaços, quebras de linha)

## Ações Imediatas

### 1. Abra o Console (F12)

Vá para: **Console** (não Elements, não Network)

### 2. Limpe o Console

Clique no ícone 🚫 para limpar mensagens antigas

### 3. Faça Login

Entre com suas credenciais

### 4. Copie TODOS os Logs

Pressione Ctrl+A no console, Ctrl+C para copiar

### 5. Cole Aqui ou em um Arquivo

Para análise completa

## Comandos Úteis no Console

Para ver os dados diretamente no console do navegador:

```javascript
// Ver todos os candidatos carregados
localStorage.getItem('candidates')

// Ver estrutura de um candidato (substitua 0 pelo índice)
JSON.parse(localStorage.getItem('candidates'))[0]
```

## Teste Rápido no Console

Cole este código no console do navegador após fazer login:

```javascript
// Teste direto no console
(async () => {
  const url = 'https://script.google.com/macros/s/AKfycbxyU62K8MHdXsl1AD50TTtxBP27cs3wzSwyClo9N_uEe39PXiYEdu3IwzcicUEeApP8qQ/exec?action=getCandidates&page=1&pageSize=5';

  const response = await fetch(url);
  const data = await response.json();

  console.log('✅ Total de candidatos:', data.candidates?.length || 0);

  if (data.candidates?.[0]) {
    const primeiro = data.candidates[0];
    console.log('👤 Primeiro candidato:', primeiro);
    console.log('📋 Campos:', Object.keys(primeiro));

    console.log('\n📊 Valores importantes:');
    ['NOMECOMPLETO', 'CPF', 'AREAATUACAO', 'CARGOADMIN'].forEach(campo => {
      console.log(`  ${campo}:`, primeiro[campo]);
    });
  }
})();
```

Este teste vai mostrar EXATAMENTE quais dados estão sendo retornados pelo Google Apps Script.

## Próximo Passo

Com os logs do console, podemos identificar exatamente onde está o problema:
- Dados não chegam?
- Dados chegam vazios?
- Dados chegam mas são filtrados?
- Dados chegam mas não são exibidos?
