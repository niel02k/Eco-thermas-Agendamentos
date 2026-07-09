// src/app/services/exportServices.js

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// Importação correta para o jspdf-autotable
import autoTable from 'jspdf-autotable';

// Função para formatar dados antes da exportação
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

// Função para buscar o nome do consultor
function getConsultorNome(item) {
  if (item.vendedor?.nome) {
    return item.vendedor.nome;
  }
  if (item.seller && typeof item.seller === 'string') {
    return item.seller;
  }
  if (item.vendedor_id) {
    if (item.vendedor && item.vendedor.nome) {
      return item.vendedor.nome;
    }
    return item.vendedor_id;
  }
  return '-';
}

// Função auxiliar para formatar moeda
function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

// Função auxiliar para formatar data
function formatDate(date) {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
}

// Função para exportar para Excel
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

// Função para exportar para PDF
export function exportToPDF(data, title = 'Relatório', columns = null) {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar!');
    return;
  }

  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Subtítulo com data
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    doc.text(`Total de registros: ${data.length}`, 14, 36);
    
    // Configurar colunas
    const defaultColumns = ['Código', 'Módulo', 'Cliente', 'Consultor', 'Valor', 'Status', 'Data'];
    const headers = columns || defaultColumns;
    
    // Mapear os dados para as colunas corretas
    const rows = data.map(item => {
      return headers.map(key => {
        return String(item[key] || '');
      });
    });
    
    // Adicionar tabela usando autoTable (importado diretamente)
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [30, 110, 190],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 245, 250],
      },
      margin: { top: 40, left: 10, right: 10 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' }
      }
    });
      
    // Adicionar rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        'Eco Thermas Tupã - Relatório',
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert('Erro ao exportar para PDF. Tente novamente.');
  }
}