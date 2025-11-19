# MUDANÇA DE COLUNAS DE CARGO

## Resumo das Alterações

A coluna **CARGOPRETENDIDO** foi substituída por duas novas colunas:
- **CARGOADMIN** - Cargo Administrativo
- **CARGOASSIS** - Cargo Assistencial

## Arquivos Modificados

### 1. Tipos e Interfaces

**src/types/candidate.ts**
- Removido: `CARGOPRETENDIDO?: string;`
- Adicionado: `CARGOADMIN?: string;` e `CARGOASSIS?: string;`

### 2. Serviços

**src/services/candidateService.ts**
- Interface `Candidate`: Atualizado de `CARGOPRETENDIDO` para `CARGOADMIN` e `CARGOASSIS`
- Interface `CandidateFilters`: Adicionado filtros para ambas colunas
- Função `filterData()`: Atualizada lógica de filtro para considerar ambas colunas
- Função `searchCandidates()`: Atualizada busca para incluir ambas colunas
- Função `getCargos()`: Dividida em `getCargosAdmin()` e `getCargosAssis()`

**src/services/reportService.ts**
- Função `getCandidateCargo()`: Atualizada para buscar em `CARGOADMIN` e `CARGOASSIS`

### 3. Componentes React

**src/components/CandidateDetailView.tsx**
- Label atualizado: "CARGO ADMINISTRATIVO" e "CARGO ASSISTENCIAL"
- Campo exibe ambas colunas na aba "Área e Cargo"

**src/components/CandidateList.tsx**
- Filtro por cargo atualizado para incluir ambas colunas
- Lista de cargos únicos combina ambas colunas
- Exibição de cargo mostra CARGOADMIN ou CARGOASSIS

**src/components/ActionPanel.tsx**
- Colunas atualizadas: `['AREAATUACAO', 'CARGOADMIN', 'CARGOASSIS']`

**src/components/ClassifiedCandidatesList.tsx**
- Exibição: `candidate.CARGOADMIN || candidate.CARGOASSIS`

**src/components/CsvImportTool.tsx**
- Importação atualizada para reconhecer ambas colunas
- Documentação atualizada para mostrar `CARGOADMIN` e `CARGOASSIS`

**src/components/DisqualifiedCandidatesList.tsx**
- Interface atualizada com ambas colunas
- Função `getCargo()` atualizada

**src/components/DocumentViewer.tsx**
- Exibição atualizada para `CARGOADMIN || CARGOASSIS`

**src/components/ImportTool.tsx**
- Exibição de informações do candidato atualizada

**src/components/InterviewCandidatesList.tsx**
- Lista de candidatos para entrevista atualizada

**src/components/InterviewEvaluationForm.tsx**
- Formulário de avaliação atualizado para exibir ambos cargos

**src/components/InterviewerDashboard.tsx**
- Dashboard do entrevistador atualizado

**src/components/PaginatedDashboard.tsx**
- Interface do candidato atualizada
- Exibição paginada atualizada

**src/components/ReportsPage.tsx**
- Geração de relatórios atualizada para incluir ambas colunas

**src/components/ScreeningModal.tsx**
- Interface e exibição atualizadas

### 4. Google Apps Script

**google-apps-script-COMPLETO-FINAL.js**
- Função `_applyTemplate_()`: Atualizada para priorizar CARGOADMIN, depois CARGOASSIS
```javascript
const cargo = candidate.CARGOADMIN || candidate.CARGOASSIS || '';
```

## Compatibilidade

O sistema agora suporta:
- ✅ Exibição de cargo administrativo (CARGOADMIN)
- ✅ Exibição de cargo assistencial (CARGOASSIS)
- ✅ Fallback para manter compatibilidade com dados antigos
- ✅ Filtros funcionando para ambas colunas
- ✅ Busca incluindo ambas colunas
- ✅ Templates de mensagem usando qualquer um dos cargos

## Próximos Passos

1. Atualizar a planilha Google Sheets:
   - Adicionar coluna `CARGOADMIN`
   - Adicionar coluna `CARGOASSIS`
   - Migrar dados de `CARGOPRETENDIDO` (se existir)

2. Atualizar formulário JotForm:
   - Adicionar campo para Cargo Administrativo
   - Adicionar campo para Cargo Assistencial
   - Configurar webhook com novos campos

3. Testar sistema completamente após deploy

## Build

✅ Projeto compilado com sucesso
- Sem erros de TypeScript
- Todos os componentes atualizados
- Build gerado em `dist/`
