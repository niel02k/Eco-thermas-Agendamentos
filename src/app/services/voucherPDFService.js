import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Gera um Voucher de PÁGINA ÚNICA com design premium
 */
export async function gerarVoucherBase(agendamento) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const colors = {
    primary: [30, 110, 190],
    accent: [250, 100, 60],
    text: [30, 41, 59],
    muted: [100, 116, 139],
    bg: [248, 250, 252],
    white: [255, 255, 255]
  };

  const titular = agendamento.cliente?.nome || agendamento.titular_nome || 'Cliente';
  const dataCurta = formatarDataCurta(agendamento.data_visita);
  const horario = agendamento.horario_visita?.slice(0, 5) || '09:00';
  const codigo = agendamento.codigo || '000000';
  
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;

  // --- CABEÇALHO ---
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ECO', margin, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('THERMAS PARK', margin, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMACAO', pageWidth - margin, 23, { align: 'right' });

  return doc;
}

/**
 * Copia o Voucher como IMAGEM (PNG) em resolução A4 (1240x1754)
 * Layout corrigido: Data numérica (DD/MM/YY) e separação total do horário.
 */
export async function copiarVoucherComoImagem(agendamento) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Resolução A4
    canvas.width = 1240;
    canvas.height = 1754;
    
    const dataCurta = formatarDataCurta(agendamento.data_visita);
    const diaSemana = formatarDiaSemana(agendamento.data_visita);
    const horario = agendamento.horario_visita?.slice(0, 5) || '09:00';
    const titular = agendamento.cliente?.nome || agendamento.titular_nome || 'Cliente';
    const codigo = agendamento.codigo || '000000';
    
    // 1. Fundo Branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Cabeçalho Azul
    ctx.fillStyle = '#1E6EBE';
    ctx.fillRect(0, 0, canvas.width, 250);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Helvetica';
    ctx.fillText('ECO', 80, 130);
    ctx.font = '35px Helvetica';
    ctx.fillText('THERMAS PARK', 80, 185);
    
    ctx.textAlign = 'right';
    ctx.font = 'bold 60px Helvetica';
    ctx.fillText('CONFIRMAÇÃO', 1160, 150);
    
    // 3. Saudação
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 45px Helvetica';
    ctx.fillText(`Olá, ${titular}!`, 80, 360);
    
    ctx.fillStyle = '#64748B';
    ctx.font = '30px Helvetica';
    ctx.fillText('Sua visita está confirmada. Prepare-se para um dia inesquecível!', 80, 420);
    
    // 4. Card de Informações (Layout Corrigido e Espaçado)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(80, 480, 1080, 220, 25);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // DATA (Coluna 1)
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 25px Helvetica';
    ctx.fillText('DATA DA VISITA', 130, 550);
    ctx.fillStyle = '#1E6EBE';
    ctx.font = 'bold 55px Helvetica';
    ctx.fillText(dataCurta, 130, 630); // Formato 08/09/26
    ctx.font = '30px Helvetica';
    ctx.fillText(diaSemana, 130, 675);
    
    // HORÁRIO (Coluna 2 - Movida para a direita para evitar overlap)
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 25px Helvetica';
    ctx.fillText('HORÁRIO', 600, 550);
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 60px Helvetica';
    ctx.fillText(`${horario}h`, 600, 630);
    
    // VOUCHER (Coluna 3 - Box Laranja)
    ctx.fillStyle = '#FA643C';
    ctx.beginPath();
    ctx.roundRect(900, 515, 230, 150, 15);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 25px Helvetica';
    ctx.fillText('VOUCHER', 1015, 575);
    ctx.font = 'bold 55px Helvetica';
    ctx.fillText(codigo, 1015, 645);
    
    // 5. Detalhes da Reserva
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E6EBE';
    ctx.font = 'bold 40px Helvetica';
    ctx.fillText('DETALHES DA RESERVA', 80, 800);
    
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 30px Helvetica';
    ctx.fillText('Pessoas:', 80, 870);
    ctx.font = 'normal 30px Helvetica';
    ctx.fillText(`${agendamento.quantidade_pessoas || 1} Pessoa(s)`, 230, 870);
    
    ctx.font = 'bold 30px Helvetica';
    ctx.fillText('Origem:', 600, 870);
    ctx.font = 'normal 30px Helvetica';
    ctx.fillText(agendamento.cidade || 'Não informada', 730, 870);
    
    // 6. Regras
    ctx.fillStyle = '#1E6EBE';
    ctx.font = 'bold 40px Helvetica';
    ctx.fillText('INFORMAÇÕES IMPORTANTES', 80, 980);
    
    ctx.fillStyle = '#475569';
    ctx.font = '28px Helvetica';
    const rules = [
      '• DOCUMENTAÇÃO: Obrigatória apresentação de documento original com foto.',
      '• RECEPÇÃO: Funciona até as 12h00. Chegadas após 11h55 perdem o benefício.',
      '• ALIMENTAÇÃO: Proibida entrada de coolers, alimentos ou bebidas externas.',
      '• FAMÍLIA: Entrada permitida apenas com o grupo completo informado.',
      '• APRESENTAÇÃO: Sua visita inclui uma breve apresentação de 20 min.',
      '• CANCELAMENTO: Em caso de ausência, o benefício é cancelado automaticamente.',
      '• CRIANÇAS: Devem estar acompanhadas por um responsável legal.',
      '• SEGURANÇA: Siga sempre as orientações da nossa equipe no parque.'
    ];
    
    rules.forEach((r, i) => {
      ctx.fillText(r, 80, 1060 + (i * 60));
    });
    
    // 7. Rodapé
    ctx.fillStyle = '#1E6EBE';
    ctx.font = 'bold 45px Helvetica';
    ctx.textAlign = 'center';
    ctx.fillText('Esperamos por você no Eco Thermas! 🌴☀️', 620, 1650);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } catch (err) {
          console.error('Erro ao copiar imagem:', err);
          resolve(false);
        }
      });
    });
  } catch (err) {
    console.error('Erro geral:', err);
    return false;
  }
}

export function visualizarPDF(agendamento) {
  window.alert("Use o botão 'Copiar Voucher' para enviar ao cliente via WhatsApp.");
}

function formatarDataCurta(dataISO) {
  if (!dataISO) return '';
  const data = new Date(dataISO + 'T12:00:00');
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

function formatarDiaSemana(dataISO) {
  if (!dataISO) return '';
  const data = new Date(dataISO + 'T12:00:00');
  return data.toLocaleDateString('pt-BR', { weekday: 'long' });
}
