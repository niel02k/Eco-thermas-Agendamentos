// src/app/Components/ModalContrato/ContractsInsights.jsx
export default function ContractsInsights({ 
  rankingVendedores = [], 
  rankingCidades = [], 
  total = 0, 
  resumoGeral = {} 
}) {
  // ✅ SEMPRE garanta que é um array
  const vendedores = Array.isArray(rankingVendedores) ? rankingVendedores : [];
  const cidades = Array.isArray(rankingCidades) ? rankingCidades : [];

  const rankingCidadesMock = [
  { cidade: 'Ecolândia', quantidade: 10, receita: 50000 },

];

  return (
    <div className={styles.insightsGrid}>
      {/* Top Vendedores */}
      <div className={styles.insightCard}>
        <h3>🏆 Top Consultores</h3>
        {vendedores.slice(0, 5).map((v, i) => (
          <div key={i} className={styles.rankItem}>
            <span className={styles.rankPos}>{i + 1}º</span>
            <span className={styles.rankName}>{v.nome || '—'}</span>
            <span className={styles.rankValue}>
              {formatCurrency(v.receita || 0)} ({v.quantidade || 0})
            </span>
          </div>
        ))}
        {vendedores.length === 0 && (
          <p className={styles.emptyText}>Nenhum consultor com vendas no período</p>
        )}
      </div>

      {/* Top Cidades */}
      <div className={styles.insightCard}>
        <h3>📍 Cidades com Mais Contratos</h3>
        {cidades.slice(0, 5).map((c, i) => (
          <div key={i} className={styles.rankItem}>
            <span className={styles.rankPos}>{i + 1}º</span>
            <span className={styles.rankName}>{c.cidade || '—'}</span>
            <span className={styles.rankValue}>
              {c.quantidade || 0} contratos
              {c.receita && ` • ${formatCurrency(c.receita)}`}
            </span>
          </div>
        ))}
        {cidades.length === 0 && (
          <p className={styles.emptyText}>Nenhuma cidade com contratos</p>
        )}
      </div>

      {/* Métricas Gerais */}
      <div className={styles.insightCard}>
        <h3>📊 Métricas Gerais</h3>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total Contratos</span>
            <span className={styles.metricValue}>{formatNumber(total)}</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Consultores</span>
            <span className={styles.metricValue}>{vendedores.length}</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Cidades</span>
            <span className={styles.metricValue}>{cidades.length}</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Ticket Médio</span>
            <span className={styles.metricValue}>
              {formatCurrency(resumoGeral?.ticket_medio || 0)}
            </span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Contratos Ativos</span>
            <span className={styles.metricValue}>
              {formatNumber(resumoGeral?.contratos_ativos || 0)}
            </span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Dependentes</span>
            <span className={styles.metricValue}>
              {formatNumber(resumoGeral?.total_dependentes || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}