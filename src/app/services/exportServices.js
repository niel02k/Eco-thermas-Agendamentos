import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ═══════════════════════════════════════════════════════════════
// EXPORTAÇÃO DE VOUCHERS COM EXCELJS (BORDAS E FORMATAÇÃO)
// ═══════════════════════════════════════════════════════════════

/**
 * Exporta vouchers de agendamento para Excel (.xlsx) com formatação completa
 * @param {Array} agendamentos - Lista de agendamentos
 * @param {string} fileName - Nome do arquivo
 */
export async function exportarVouchersExcel(agendamentos, fileName = 'vouchers_agendamento') {
  if (!agendamentos || agendamentos.length === 0) {
    alert('Não há agendamentos para gerar vouchers!');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Voucher', {
      views: [{ showGridLines: false }],
    });

    // ═══════ CONFIGURAR COLUNAS ═══════
    worksheet.columns = [
      { header: '', key: 'A', width: 3, hidden: true },
      { header: '', key: 'B', width: 18 },
      { header: '', key: 'C', width: 18 },
      { header: '', key: 'D', width: 18 },
      { header: '', key: 'E', width: 18 },
      { header: '', key: 'F', width: 18 },
    ];

    // ═══════ ORDENAR POR CÓDIGO ═══════
    const dados = [...agendamentos].sort((a, b) => {
      const codA = String(a.codigo || '').padStart(6, '0');
      const codB = String(b.codigo || '').padStart(6, '0');
      return codA.localeCompare(codB);
    });

    // ═══════ CRIAR VOUCHERS ═══════
    dados.forEach((agendamento, index) => {
      const startRow = index * 17 + 1; // Row 1-based no ExcelJS
      criarVoucherExcelJS(worksheet, agendamento, startRow);
    });

    // ═══════ GERAR E BAIXAR ARQUIVO ═══════
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);

  } catch (error) {
    console.error('Erro ao exportar vouchers:', error);
    alert('Erro ao gerar vouchers. Tente novamente.');
  }
}

/**
 * Cria um voucher individual usando ExcelJS
 */
function criarVoucherExcelJS(worksheet, agendamento, startRow) {
  const r = startRow; // Row number (1-based)
  const codigo = String(agendamento.codigo || '000000').padStart(6, '0');
  const data = formatarDataVoucher(agendamento.data_visita);
  const nome = agendamento.cliente?.nome || '';
  const idade = agendamento.cliente?.idade || '';
  const cidade = agendamento.cidade || '';
  const telefone = agendamento.cliente?.telefone || '';
  const dependentes = agendamento.dependentes || [];

  // ═══════ CONFIGURAR ALTURA DAS LINHAS ═══════
  for (let i = 0; i < 16; i++) {
    worksheet.getRow(r + i).height = 18;
  }

  // ═══════ ESTILOS PADRÃO ═══════
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const fontNormal = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };
  const fontBold = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
  const fontBold10 = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };

  const alignCenter = { horizontal: 'center', vertical: 'middle', wrapText: false };
  const alignLeft = { horizontal: 'left', vertical: 'middle', wrapText: false };

  // ═══════ LINHA 0: TÍTULO + CÓDIGO ═══════
  // B:F - merge para título
  worksheet.mergeCells(r, 2, r, 5); // B:F
  const titleCell = worksheet.getCell(r, 2);
  titleCell.value = 'Voucher Agendamento';
  titleCell.font = fontBold;
  titleCell.alignment = alignCenter;
  aplicarBorda(worksheet, r, 2, r, 5, thinBorder);

  // F - código
  const codigoCell = worksheet.getCell(r, 6);
  codigoCell.value = `#${codigo}`;
  codigoCell.font = fontBold;
  codigoCell.alignment = alignCenter;
  codigoCell.border = thinBorder;

  // ═══════ LINHA 1: VAZIA ═══════
  aplicarBorda(worksheet, r + 1, 2, r + 1, 6, thinBorder);

  // ═══════ LINHA 2: DATA | CIDADE ═══════
  // Data
  setCell(worksheet, r + 2, 2, 'Data', fontNormal, alignLeft);
  setCell(worksheet, r + 2, 3, data, fontNormal, alignLeft);
  // Cidade
  setCell(worksheet, r + 2, 4, 'Cidade', fontNormal, alignLeft);
  setCell(worksheet, r + 2, 5, cidade, fontNormal, alignLeft);
  aplicarBorda(worksheet, r + 2, 2, r + 2, 6, thinBorder);

  // ═══════ LINHA 3: NOME | TELEFONE ═══════
  setCell(worksheet, r + 3, 2, 'Nome', fontNormal, alignLeft);
  setCell(worksheet, r + 3, 3, nome, fontNormal, alignLeft);
  setCell(worksheet, r + 3, 4, 'Telefone', fontNormal, alignLeft);
  setCell(worksheet, r + 3, 5, telefone, fontNormal, alignLeft);
  aplicarBorda(worksheet, r + 3, 2, r + 3, 6, thinBorder);

  // ═══════ LINHA 4: IDADE | VAZIO ═══════
  setCell(worksheet, r + 4, 2, 'Idade', fontNormal, alignLeft);
  setCell(worksheet, r + 4, 3, idade, fontNormal, alignCenter);
  aplicarBorda(worksheet, r + 4, 2, r + 4, 6, thinBorder);

  // ═══════ LINHA 5: VAZIA ═══════
  aplicarBorda(worksheet, r + 5, 2, r + 5, 6, thinBorder);

  // ═══════ LINHA 6: TÍTULO DEPENDENTES ═══════
  worksheet.mergeCells(r + 6, 2, r + 6, 6);
  setCell(worksheet, r + 6, 2, 'Dependentes Agendamentos', fontBold, alignCenter);
  aplicarBorda(worksheet, r + 6, 2, r + 6, 6, thinBorder);

  // ═══════ LINHA 7: CABEÇALHO TABELA ═══════
  worksheet.mergeCells(r + 7, 2, r + 7, 3);
  setCell(worksheet, r + 7, 2, 'Nome', fontBold10, alignCenter);
  worksheet.mergeCells(r + 7, 4, r + 7, 5);
  setCell(worksheet, r + 7, 4, 'CPF', fontBold10, alignCenter);
  setCell(worksheet, r + 7, 6, 'Idade', fontBold10, alignCenter);
  aplicarBorda(worksheet, r + 7, 2, r + 7, 6, thinBorder);

  // ═══════ LINHAS 8-14: DEPENDENTES ═══════
  for (let i = 0; i < 7; i++) {
    const row = r + 8 + i;
    const dep = dependentes[i] || null;

    worksheet.mergeCells(row, 2, row, 3);
    worksheet.mergeCells(row, 4, row, 5);

    if (dep) {
      setCell(worksheet, row, 2, dep.nome || '', fontNormal, alignLeft);
      setCell(worksheet, row, 4, dep.cpf || '', fontNormal, alignCenter);
      setCell(worksheet, row, 6, dep.idade || '', fontNormal, alignCenter);
    }
    aplicarBorda(worksheet, row, 2, row, 6, thinBorder);
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES EXCELJS
// ═══════════════════════════════════════════════════════════════

function setCell(worksheet, row, col, value, font, alignment) {
  const cell = worksheet.getCell(row, col);
  cell.value = value ?? '';
  if (font) cell.font = font;
  if (alignment) cell.alignment = alignment;
}

function aplicarBorda(worksheet, startRow, startCol, endRow, endCol, border) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      worksheet.getCell(r, c).border = border;
    }
  }
}

function formatarDataVoucher(dataISO) {
  if (!dataISO) return '';
  try {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch {
    return dataISO;
  }
}
// ═══════════════════════════════════════════════════════════════
// FUNÇÕES EXISTENTES (MANTIDAS)
// ═══════════════════════════════════════════════════════════════

export function formatDataForExport(data, type) {
  if (!data || data.length === 0) return [];
  
  return data.map(item => ({
    'Código': item.codigo || item.id || '-',
    'Módulo': item.module || item.tipo || item.plano || '-',
    'Cliente': item.titular_nome || item.cliente?.nome || item.cliente || '-',
    'Consultor': getConsultorNome(item),
    'Valor': formatCurrency(item.valor_total || item.value || 0),
    'Status': item.status || '-',
    'Data': formatDate(item.data_criacao || item.data_inicio || item.data_visita || item.date)
  }));
}

function getConsultorNome(item) {
  if (item.vendedor?.nome) return item.vendedor.nome;
  if (item.seller && typeof item.seller === 'string') return item.seller;
  if (item.vendedor_id) {
    if (item.vendedor && item.vendedor.nome) return item.vendedor.nome;
    return item.vendedor_id;
  }
  return '-';
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

function formatDate(date) {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
}

export function exportToExcel(data, fileName = 'relatorio') {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar!');
    return;
  }

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length * 2, 15)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    alert('Erro ao exportar para Excel. Tente novamente.');
  }
}

export function exportToPDF(data, title = 'Relatório', columns = null) {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar!');
    return;
  }

  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    doc.text(`Total de registros: ${data.length}`, 14, 36);
    
    const defaultColumns = ['Código', 'Módulo', 'Cliente', 'Consultor', 'Valor', 'Status', 'Data'];
    const headers = columns || defaultColumns;
    
    const rows = data.map(item => {
      return headers.map(key => String(item[key] || ''));
    });
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
      headStyles: {
        fillColor: [30, 110, 190],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [240, 245, 250] },
      margin: { top: 40, left: 10, right: 10 },
      tableWidth: 'auto',
    });
      
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      doc.text('Eco Thermas Tupã - Relatório', 14, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert('Erro ao exportar para PDF. Tente novamente.');
  }
}