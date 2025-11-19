# 🚨 DIAGNÓSTICO RÁPIDO - CANDIDATOS NÃO RETORNANDO

## ⚡ Teste Imediato

### Opção 1: Abrir Arquivo de Teste
1. Abra: `TESTE_GOOGLE_SHEETS.html` no navegador
2. Veja os resultados dos testes automáticos
3. Analise o que está sendo retornado

### Opção 2: Testar Direto no Google Apps Script

Cole e execute esta função no Google Apps Script Editor:

```javascript
function debugRapido() {
  Logger.log('🔍 INICIANDO DIAGNÓSTICO');

  // 1. Verificar aba
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_CANDIDATOS);

  if (!sh) {
    Logger.log('❌ ABA "' + SHEET_CANDIDATOS + '" NÃO EXISTE!');
    Logger.log('📋 Abas disponíveis:');
    ss.getSheets().forEach(s => Logger.log('   - ' + s.getName()));
    return;
  }

  // 2. Verificar dados
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  Logger.log('✅ Aba encontrada: ' + sh.getName());
  Logger.log('📊 Linhas: ' + lastRow + ' | Colunas: ' + lastCol);

  if (lastRow <= 1) {
    Logger.log('❌ PLANILHA VAZIA! (apenas cabeçalho)');
    return;
  }

  // 3. Testar getCandidates
  Logger.log('\n🔄 Executando getCandidates()...');
  const result = getCandidates({});

  Logger.log('📦 Resposta:');
  Logger.log('   success: ' + (result.success !== false));
  Logger.log('   candidates: ' + (result.candidates ? result.candidates.length : 0));

  if (result.candidates && result.candidates.length > 0) {
    Logger.log('\n✅ FUNCIONANDO! Primeiro candidato:');
    const primeiro = result.candidates[0];
    Logger.log('   NOMECOMPLETO: ' + primeiro.NOMECOMPLETO);
    Logger.log('   CPF: ' + primeiro.CPF);
    Logger.log('   CARGOADMIN: ' + primeiro.CARGOADMIN);
    Logger.log('   CARGOASSIS: ' + primeiro.CARGOASSIS);
  } else {
    Logger.log('\n❌ PROBLEMA: Nenhum candidato retornado');
    Logger.log('Verifique se:');
    Logger.log('1. Há dados na aba (além do cabeçalho)');
    Logger.log('2. A função _readSheetBlock_ está funcionando');
    Logger.log('3. HEADER_ROWS = ' + HEADER_ROWS);
  }
}
```

## 🎯 Causas Mais Comuns

### 1. Nome da Aba Errado
```javascript
// Verifique no script se está:
const SHEET_CANDIDATOS = 'CANDIDATOS';  // ← Nome EXATO da aba
```

### 2. Planilha Vazia
- Certifique-se que há dados além da linha de cabeçalho

### 3. SPREADSHEET_ID Errado
```javascript
// Verifique se o ID está correto:
const SPREADSHEET_ID = 'COLOQUE_O_ID_AQUI';
```

### 4. Função getCandidates com Erro
Deve retornar:
```javascript
return { candidates: out };  // ← Não esqueça "candidates"
```

## ✅ Correção Imediata

Se o `debugRapido()` mostrar que há dados mas não estão sendo retornados:

### No Google Apps Script, localize e corrija:

```javascript
function getCandidates(params) {
  try {
    const {sheet, headers, values} = _readSheetBlock_(SHEET_CANDIDATOS);

    // DEBUG
    Logger.log('getCandidates - sheet existe: ' + !!sheet);
    Logger.log('getCandidates - headers: ' + headers.length);
    Logger.log('getCandidates - values: ' + values.length);

    if (!sheet || !values.length) {
      Logger.log('⚠️ Retornando vazio');
      return { candidates: [] };
    }

    const out = values.map(row => {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      return obj;
    });

    Logger.log('✅ Retornando ' + out.length + ' candidatos');
    return { candidates: out };

  } catch (error) {
    Logger.log('❌ ERRO em getCandidates: ' + error);
    return { candidates: [], error: error.toString() };
  }
}
```

## 🔄 Após Correção

1. **Salvar** o Google Apps Script
2. **Deploy** → Manage deployments → Edit
3. **New version** → Deploy
4. **Testar** novamente o sistema

## 📞 Se Nada Funcionar

Execute `debugRapido()` e envie os logs completos do Logger.
