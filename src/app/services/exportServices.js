// src/app/services/exportServices.js

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const VOUCHER_HEIGHT = 19;
const VOUCHER_GAP = 4;

export async function exportarVouchersExcel(agendamentos, fileName = 'vouchers') {
  if (!agendamentos || agendamentos.length === 0) {
    alert('Não há agendamentos para gerar vouchers!');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vouchers', {
      views: [{ showGridLines: false }],
    });

    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.2, right: 0.2, top: 0.3, bottom: 0.3,
        header: 0.1, footer: 0.1,
      },
    };

    worksheet.columns = [
      { width: 18 }, { width: 18 }, { width: 18 },
      { width: 18 }, { width: 18 }, { width: 18 },
    ];

    const dados = [...agendamentos].sort((a, b) =>
      String(a.codigo || '').localeCompare(String(b.codigo || ''))
    );

    dados.forEach((ag, index) => {
      const startRow = index * (VOUCHER_HEIGHT + VOUCHER_GAP) + 1;
      criarVoucher(worksheet, ag, startRow);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${fileName}.xlsx`);

  } catch (error) {
    console.error('Erro ao exportar vouchers:', error);
    alert('Erro ao gerar vouchers. Tente novamente.');
  }
}

function criarVoucher(worksheet, ag, r) {
  const codigo = String(ag.codigo || '').padStart(6, '0');
  const data = formatarData(ag.data_visita);
  const cidade = ag.cidade || '';
  const origem = ag.origem || 'OUTRO';
  const cliente = ag.cliente || {};
  const nome = cliente.nome || ag.titular_nome || '';
  const cpf = formatarCPF(cliente.cpf || ag.titular_cpf || '');
  const idade = cliente.idade || ag.titular_idade || '';
  const telefone = formatarTelefone(cliente.telefone || ag.titular_telefone || '');
  const dependentes = ag.dependentes || [];

  for (let i = 0; i < VOUCHER_HEIGHT; i++) {
    worksheet.getRow(r + i).height = 18;
  }
  for (let i = 0; i < 7; i++) {
    worksheet.getRow(r + 7 + i).height = 22;
  }

  // ═══════════ LINHA 1: TÍTULO (B-E) | CÓDIGO (F) ═══════════
  merge(worksheet, r, 2, r, 5);
  setCell(worksheet, r, 2, 'Agendamento Visita Cortesia', { bold: true, size: 11, align: 'center', border: true });
  setCell(worksheet, r, 1, '', { border: true });
  setCell(worksheet, r, 6, `#${codigo}`, { bold: true, size: 11, align: 'right', border: true });

  // ═══════════ LINHA 2: DATA | CIDADE ═══════════
  setCell(worksheet, r + 1, 1, 'Data:', { bold: true, size: 10, align: 'left', border: true });
  merge(worksheet, r + 1, 2, r + 1, 3);
  setCell(worksheet, r + 1, 2, data, { size: 10, align: 'left', border: true });
  setCell(worksheet, r + 1, 4, 'Cidade:', { bold: true, size: 10, align: 'left', border: true });
  setCell(worksheet, r + 1, 5, cidade, { size: 10, align: 'left', border: true });

  // ═══════════ LINHA 3: NOME | IDADE ═══════════
  setCell(worksheet, r + 2, 1, 'Nome:', { bold: true, size: 10, align: 'left', border: true });
  merge(worksheet, r + 2, 2, r + 2, 3);
  setCell(worksheet, r + 2, 2, nome, { size: 10, align: 'left', border: true });
  setCell(worksheet, r + 2, 4, 'Idade:', { bold: true, size: 10, align: 'left', border: true });
  setCell(worksheet, r + 2, 5, idade, { size: 10, align: 'center', border: true });

  // ═══════════ LINHA 4: CPF | TELEFONE ═══════════
  setCell(worksheet, r + 3, 1, 'CPF:', { bold: true, size: 10, align: 'left', border: true });
  merge(worksheet, r + 3, 2, r + 3, 3);
  setCell(worksheet, r + 3, 2, cpf, { size: 10, align: 'left', border: true });
  setCell(worksheet, r + 3, 4, 'Telefone:', { bold: true, size: 10, align: 'left', border: true });
  merge(worksheet, r + 3, 5, r + 3, 6);
  setCell(worksheet, r + 3, 5, telefone, { size: 10, align: 'left', border: true });

  // ═══════════ LINHA 5: CAPTAÇÃO ═══════════
  setCell(worksheet, r + 4, 1, '', { border: true });
  merge(worksheet, r + 4, 2, r + 4, 3);
  setCell(worksheet, r + 4, 2, '', { border: true });
  setCell(worksheet, r + 4, 4, 'Captação:', { bold: true, size: 10, align: 'left', border: true });
  merge(worksheet, r + 4, 5, r + 4, 6);
  setCell(worksheet, r + 4, 5, origem, { size: 10, align: 'left', border: true, color: 'FF15803D' });

  // ═══════════ LINHA 6: ACOMPANHANTES ═══════════
  merge(worksheet, r + 5, 1, r + 5, 6);
  setCell(worksheet, r + 5, 1, 'ACOMPANHANTES', { bold: true, size: 11, align: 'center', border: true });

  // ═══════════ LINHA 7: CABEÇALHO TABELA ═══════════
  // CPF sem merge (D) | Idade com merge (E-F)
  setCell(worksheet, r + 6, 1, 'Nº', { bold: true, size: 10, align: 'center', border: true });
  merge(worksheet, r + 6, 2, r + 6, 3);
  setCell(worksheet, r + 6, 2, 'Nome', { bold: true, size: 10, align: 'center', border: true });
  merge(worksheet, r + 6, 4, r + 6, 5); // CPF: D-E
  setCell(worksheet, r + 6, 4, 'CPF', { bold: true, size: 10, align: 'center', border: true });
  setCell(worksheet, r + 6, 6, 'Idade', { bold: true, size: 10, align: 'center', border: true }); // Idade: F

  // ═══════════ LINHAS 8-14: DEPENDENTES ═══════════
  for (let i = 0; i < 7; i++) {
    const row = r + 7 + i;
    const dep = dependentes[i] || null;

    setCell(worksheet, row, 1, i + 1, { size: 10, align: 'center', border: true });
    merge(worksheet, row, 2, row, 3);
    setCell(worksheet, row, 2, dep?.nome || '', { size: 10, align: 'left', border: true });
    merge(worksheet, row, 4, row, 5); // CPF: D-E
    setCell(worksheet, row, 4, dep?.cpf ? formatarCPF(dep.cpf) : '', { size: 10, align: 'center', border: true });
    setCell(worksheet, row, 6, dep?.idade || '', { size: 10, align: 'center', border: true }); // Idade: F
  }

  // ═══════════ LINHA 15: CONSULTOR | STATUS ═══════════
  merge(worksheet, r + 14, 1, r + 14, 3);
  setCell(worksheet, r + 14, 1, 'Consultor: ___________________', { size: 10, align: 'left', border: true });
  merge(worksheet, r + 14, 4, r + 14, 6);
  setCell(worksheet, r + 14, 4, 'Status: ______________________', { size: 10, align: 'left', border: true });

  // ═══════════ LINHAS 16-19: OBSERVAÇÕES (alinhado no topo) ═══════════
  merge(worksheet, r + 15, 1, r + 18, 6);
  setCell(worksheet, r + 15, 1, 'Observações:', { 
    bold: true, size: 10, align: 'left', vertical: 'top', border: true 
  });

  // ═══════════ BORDA EXTERNA ═══════════
  aplicarBordaExterna(worksheet, r, 1, r + 18, 6);
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function setCell(worksheet, row, col, value, options = {}) {
  const cell = worksheet.getCell(row, col);
  cell.value = value ?? '';
  cell.font = {
    name: 'Arial',
    size: options.size || 10,
    bold: options.bold || false,
    color: { argb: options.color || 'FF000000' },
  };
  cell.alignment = {
    horizontal: options.align || 'left',
    vertical: options.vertical || 'middle',
    wrapText: false,
  };
  if (options.border) {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
  }
}

function merge(worksheet, startRow, startCol, endRow, endCol) {
  worksheet.mergeCells(startRow, startCol, endRow, endCol);
}

function aplicarBordaExterna(worksheet, startRow, startCol, endRow, endCol) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = {
        top: { style: r === startRow ? 'medium' : 'thin', color: { argb: 'FF000000' } },
        bottom: { style: r === endRow ? 'medium' : 'thin', color: { argb: 'FF000000' } },
        left: { style: c === startCol ? 'medium' : 'thin', color: { argb: 'FF000000' } },
        right: { style: c === endCol ? 'medium' : 'thin', color: { argb: 'FF000000' } },
      };
    }
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarCPF(cpf) {
  if (!cpf) return '';
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return cpf;
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefone(tel) {
  if (!tel) return '';
  const nums = tel.replace(/\D/g, '');
  if (nums.length === 11) return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (nums.length === 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return tel;
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