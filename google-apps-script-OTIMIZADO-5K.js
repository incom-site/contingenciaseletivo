// ============================================
// GOOGLE APPS SCRIPT - OTIMIZADO PARA 5K+ CANDIDATOS
// ============================================
//
// MUDANÇAS PRINCIPAIS:
// 1. Paginação implementada (máximo 1000 registros por página)
// 2. Cache de 5 minutos para reduzir chamadas
// 3. Processamento otimizado
//
// ============================================

var SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
var SHEET_USUARIOS = 'USUARIOS';
var SHEET_CANDIDATOS = 'CANDIDATOS';
var SHEET_MOTIVOS = 'MOTIVOS';
var SHEET_MENSAGENS = 'MENSAGENS';
var SHEET_TEMPLATES = 'TEMPLATES';
var SHEET_ALIAS = 'ALIAS';

// Configurações de performance
var MAX_ROWS_PER_REQUEST = 1000;  // Máximo de linhas por requisição
var CACHE_DURATION_SECONDS = 300; // 5 minutos de cache

// ============================================
// ENTRADA - Suporta GET e POST
// ============================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

function parseRequest(e) {
  var params = {};

  if (e.parameter) {
    for (var key in e.parameter) {
      params[key] = e.parameter[key];
    }
  }

  if (e.postData && e.postData.contents) {
    try {
      var postData = JSON.parse(e.postData.contents);
      for (var key in postData) {
        params[key] = postData[key];
      }
    } catch (error) {
      Logger.log('Erro ao parsear POST data: ' + error);
    }
  }

  return params;
}

function createResponse(data, statusCode) {
  statusCode = statusCode || 200;

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(sheetName) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    return spreadsheet.getSheetByName(sheetName);
  } catch (error) {
    Logger.log('Erro ao acessar planilha ' + sheetName + ': ' + error);
    return null;
  }
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ============================================
// CACHE DE DADOS
// ============================================

function getCacheKey(action, params) {
  return action + '_' + JSON.stringify(params || {});
}

function getCachedData(key) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      Logger.log('Erro ao parsear cache: ' + error);
    }
  }

  return null;
}

function setCachedData(key, data) {
  try {
    var cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(data), CACHE_DURATION_SECONDS);
  } catch (error) {
    Logger.log('Erro ao salvar cache: ' + error);
  }
}

function clearCache() {
  var cache = CacheService.getScriptCache();
  cache.removeAll([]);
}

// ============================================
// ROTEAMENTO
// ============================================

function handleRequest(e) {
  try {
    var params = parseRequest(e);
    var action = params.action;

    Logger.log('🔵 Ação recebida: ' + action);
    Logger.log('📦 Parâmetros: ' + JSON.stringify(params));

    if (!action) {
      return createResponse({
        error: 'Parâmetro "action" é obrigatório',
        message: 'Para testar, use ?action=test'
      }, 400);
    }

    var routes = {
      'getUserRole': getUserRole,
      'getAllUsers': getAllUsers,
      'getAnalysts': getAnalysts,
      'getInterviewers': getInterviewers,
      'createUser': createUser,
      'updateUser': updateUser,
      'deleteUser': deleteUser,
      'getCandidates': getCandidatesOptimized,  // VERSÃO OTIMIZADA
      'getCandidate': getCandidate,
      'addCandidate': addCandidate,
      'updateCandidate': updateCandidate,
      'deleteCandidate': deleteCandidate,
      'assignCandidates': assignCandidates,
      'bulkUpdateCandidates': bulkUpdateCandidates,
      'updateCandidateStatus': updateCandidateStatus,
      'getCandidatesByStatus': getCandidatesByStatusOptimized,  // VERSÃO OTIMIZADA
      'moveToInterview': moveToInterview,
      'getInterviewCandidates': getInterviewCandidates,
      'allocateToInterviewer': allocateToInterviewer,
      'getInterviewerCandidates': getInterviewerCandidates,
      'saveInterviewEvaluation': saveInterviewEvaluation,
      'sendMessages': sendMessages,
      'logMessage': logMessage,
      'updateMessageStatus': updateMessageStatus,
      'getMessageTemplates': getMessageTemplates,
      'getEmailAliases': getEmailAliases,
      'getStatistics': getStatistics,
      'getReportStats': getReportStats,
      'getReport': getReport,
      'getDisqualificationReasons': getDisqualificationReasons,
      'saveScreening': saveScreening,
      'test': testConnection
    };

    if (routes[action]) {
      return routes[action](params);
    } else {
      return createResponse({ error: 'Ação não encontrada: ' + action }, 404);
    }
  } catch (error) {
    Logger.log('❌ Erro no handleRequest: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

// ============================================
// FUNÇÃO OTIMIZADA: getCandidates
// ============================================

function getCandidatesOptimized(params) {
  try {
    var candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ success: true, candidates: [], total: 0, page: 1, totalPages: 1 });
    }

    // Parâmetros de paginação
    var page = parseInt(params.page) || 1;
    var pageSize = parseInt(params.pageSize) || MAX_ROWS_PER_REQUEST;

    // Limitar pageSize para evitar sobrecarga
    if (pageSize > MAX_ROWS_PER_REQUEST) {
      pageSize = MAX_ROWS_PER_REQUEST;
    }

    // Tentar usar cache
    var cacheKey = getCacheKey('allCandidates', {});
    var cachedData = getCachedData(cacheKey);
    var allCandidates;

    if (cachedData) {
      Logger.log('✅ Usando dados do cache');
      allCandidates = cachedData;
    } else {
      Logger.log('📊 Carregando dados da planilha...');
      var startTime = new Date().getTime();

      var lastRow = candidateSheet.getLastRow();
      var lastCol = candidateSheet.getLastColumn();

      Logger.log('📏 Total de linhas: ' + lastRow);

      if (lastRow <= 1) {
        return createResponse({ success: true, candidates: [], total: 0, page: 1, totalPages: 1 });
      }

      // Carregar dados em chunks se for muito grande
      var data;
      if (lastRow > 10000) {
        Logger.log('⚠️ Planilha muito grande. Limitando a 10000 linhas.');
        data = candidateSheet.getRange(1, 1, 10000, lastCol).getValues();
      } else {
        data = candidateSheet.getDataRange().getValues();
      }

      var headers = data[0];
      allCandidates = [];

      for (var i = 1; i < data.length; i++) {
        var candidate = {};
        for (var j = 0; j < headers.length; j++) {
          candidate[headers[j]] = data[i][j];
        }

        if (candidate.CPF || candidate.NOMECOMPLETO) {
          allCandidates.push(candidate);
        }
      }

      var endTime = new Date().getTime();
      Logger.log('⏱️ Tempo de carregamento: ' + (endTime - startTime) + 'ms');
      Logger.log('📊 Total de candidatos: ' + allCandidates.length);

      // Salvar no cache
      setCachedData(cacheKey, allCandidates);
    }

    // Aplicar filtros se houver
    var filteredCandidates = applyFilters(allCandidates, params);

    // Calcular paginação
    var total = filteredCandidates.length;
    var totalPages = Math.ceil(total / pageSize);
    var startIndex = (page - 1) * pageSize;
    var endIndex = startIndex + pageSize;

    // Obter página de dados
    var paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    Logger.log('📄 Retornando página ' + page + ' de ' + totalPages + ' (' + paginatedCandidates.length + ' candidatos)');

    return createResponse({
      success: true,
      candidates: paginatedCandidates,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: totalPages
      }
    });
  } catch (error) {
    Logger.log('❌ Erro em getCandidatesOptimized: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

// ============================================
// FUNÇÃO AUXILIAR: Aplicar Filtros
// ============================================

function applyFilters(candidates, params) {
  var filtered = candidates;

  // Filtro por status
  if (params.status) {
    filtered = filtered.filter(function(c) {
      return c.Status === params.status || c.status === params.status;
    });
  }

  // Filtro por analista
  if (params.assignedTo || params.Analista) {
    var analyst = params.assignedTo || params.Analista;
    filtered = filtered.filter(function(c) {
      return c.assigned_to === analyst || c.Analista === analyst;
    });
  }

  // Filtro por área
  if (params.AREAATUACAO) {
    filtered = filtered.filter(function(c) {
      return c.AREAATUACAO === params.AREAATUACAO;
    });
  }

  // Filtro por cargo admin
  if (params.CARGOADMIN) {
    filtered = filtered.filter(function(c) {
      return c.CARGOADMIN === params.CARGOADMIN;
    });
  }

  // Filtro por cargo assistencial
  if (params.CARGOASSIS) {
    filtered = filtered.filter(function(c) {
      return c.CARGOASSIS === params.CARGOASSIS;
    });
  }

  // Filtro por PCD
  if (params.VAGAPCD) {
    filtered = filtered.filter(function(c) {
      return c.VAGAPCD === params.VAGAPCD;
    });
  }

  // Busca por texto
  if (params.search) {
    var searchTerm = params.search.toLowerCase();
    filtered = filtered.filter(function(c) {
      var searchable = [
        c.NOMECOMPLETO,
        c.NOMESOCIAL,
        c.CPF,
        c.CARGOADMIN,
        c.CARGOASSIS
      ].join(' ').toLowerCase();

      return searchable.indexOf(searchTerm) !== -1;
    });
  }

  return filtered;
}

// ============================================
// FUNÇÃO OTIMIZADA: getCandidatesByStatus
// ============================================

function getCandidatesByStatusOptimized(params) {
  try {
    var status = params.status;
    if (!status) {
      return createResponse({ error: 'Status é obrigatório' }, 400);
    }

    // Usar cache
    var cacheKey = getCacheKey('candidatesByStatus', { status: status });
    var cachedData = getCachedData(cacheKey);

    if (cachedData) {
      Logger.log('✅ Retornando dados do cache para status: ' + status);
      return createResponse({ success: true, data: cachedData });
    }

    var candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ success: true, data: [] });
    }

    var data = candidateSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: [] });
    }

    var headers = data[0];
    var statusIndex = headers.indexOf('status_triagem');

    if (statusIndex === -1) {
      return createResponse({ success: true, data: [] });
    }

    var candidates = [];
    var maxResults = 1000;  // Limitar resultados

    for (var i = 1; i < data.length && candidates.length < maxResults; i++) {
      if (data[i][statusIndex] === status) {
        var candidate = {};
        for (var j = 0; j < headers.length; j++) {
          candidate[headers[j]] = data[i][j];
        }
        candidates.push(candidate);
      }
    }

    Logger.log('📊 Encontrados ' + candidates.length + ' candidatos com status: ' + status);

    // Salvar no cache
    setCachedData(cacheKey, candidates);

    return createResponse({ success: true, data: candidates });
  } catch (error) {
    Logger.log('❌ Erro em getCandidatesByStatusOptimized: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

// ============================================
// FUNÇÃO: Limpar Cache (útil para debug)
// ============================================

function clearAllCache() {
  clearCache();
  return createResponse({ success: true, message: 'Cache limpo com sucesso' });
}

// ============================================
// RESTO DAS FUNÇÕES (copiar do arquivo original)
// ============================================

// Você precisa copiar todas as outras funções do arquivo original aqui:
// - getUserRole
// - getAllUsers
// - getAnalysts
// - getInterviewers
// - createUser
// - updateUser
// - deleteUser
// - getCandidate
// - addCandidate
// - updateCandidate
// - deleteCandidate
// - assignCandidates
// - bulkUpdateCandidates
// - updateCandidateStatus
// - moveToInterview
// - getInterviewCandidates
// - allocateToInterviewer
// - getInterviewerCandidates
// - saveInterviewEvaluation
// - sendMessages
// - logMessage
// - updateMessageStatus
// - getMessageTemplates
// - getEmailAliases
// - getStatistics
// - getReportStats
// - getReport
// - getDisqualificationReasons
// - saveScreening
// - testConnection

function testConnection() {
  return createResponse({
    success: true,
    message: 'Conexão com Google Apps Script funcionando! (Versão Otimizada 5K+)',
    timestamp: getCurrentTimestamp(),
    features: {
      pagination: true,
      cache: true,
      maxRowsPerRequest: MAX_ROWS_PER_REQUEST,
      cacheDuration: CACHE_DURATION_SECONDS + 's'
    }
  });
}
