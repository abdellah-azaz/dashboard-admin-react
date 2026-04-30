import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Loader2, RefreshCcw, Search, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../api/axiosClient';

const StatsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/stats/scans');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      setShowAnalysis(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  const getAnalysis = () => {
    return data.map(user => {
      const count = user.daily_scan_count;
      if (count > 30) return { ...user, status: 'DANGER', label: 'Quota Excédé', icon: AlertCircle, color: '#ef4444' };
      if (count >= 10) return { ...user, status: 'WARNING', label: 'Prudent', icon: AlertTriangle, color: '#f59e0b' };
      return { ...user, status: 'SUCCESS', label: 'Normale', icon: CheckCircle2, color: '#10b981' };
    });
  };

  const analyzedData = getAnalysis();

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="stats-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ maxWidth: showAnalysis ? '1100px' : '900px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="stats-modal-header">
            <div className="header-title">
              <BarChart2 size={24} className="title-icon" />
              <div>
                <h2>Statistiques des Scans</h2>
                <p>Analyse de l'activité quotidienne par utilisateur</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className={`analysis-toggle-btn ${showAnalysis ? 'active' : ''}`}
                onClick={() => setShowAnalysis(!showAnalysis)}
                disabled={loading || data.length === 0}
              >
                <Search size={18} />
                <span>Analyse</span>
              </button>
              <button className="refresh-btn" onClick={fetchStats} disabled={loading}>
                <RefreshCcw size={18} className={loading ? 'spinning' : ''} />
              </button>
              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="stats-modal-content">
            {loading ? (
              <div className="stats-loading">
                <Loader2 size={40} className="spinning" />
                <span>Chargement des données...</span>
              </div>
            ) : error ? (
              <div className="stats-error">
                <p>{error}</p>
                <button onClick={fetchStats}>Réessayer</button>
              </div>
            ) : data.length === 0 ? (
              <div className="stats-empty">
                <BarChart2 size={48} />
                <p>Aucune donnée de scan pour aujourd'hui.</p>
              </div>
            ) : (
              <div className={`stats-display-area ${showAnalysis ? 'with-analysis' : ''}`}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis 
                        dataKey="fullname" 
                        angle={-45} 
                        textAnchor="end" 
                        interval={0} 
                        height={60} 
                        stroke="#94a3b8"
                        fontSize={12}
                      />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#f1f5f9'
                        }}
                        itemStyle={{ color: '#6366f1' }}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar 
                        dataKey="daily_scan_count" 
                        name="Scans" 
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {showAnalysis && (
                  <motion.div 
                    className="analysis-results-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3>Rapport d'Analyse</h3>
                    <div className="analysis-list">
                      {analyzedData.map((user, i) => {
                        const Icon = user.icon;
                        return (
                          <div key={i} className={`analysis-item ${user.status.toLowerCase()}`}>
                            <div className="analysis-item-left">
                              <Icon size={18} style={{ color: user.color }} />
                              <div className="user-info">
                                <span className="fullname">{user.fullname}</span>
                                <span className="scan-count">{user.daily_scan_count} scans</span>
                              </div>
                            </div>
                            <span className="analysis-badge" style={{ background: `${user.color}15`, color: user.color }}>
                              {user.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="analysis-summary">
                      <div className="summary-item">
                        <span className="dot danger" />
                        <span>&gt; 30 Scans (Alerte)</span>
                      </div>
                      <div className="summary-item">
                        <span className="dot warning" />
                        <span>10-30 Scans (Prudence)</span>
                      </div>
                      <div className="summary-item">
                        <span className="dot success" />
                        <span>&lt; 10 Scans (Normal)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="stats-modal-footer">
            <p>Crypton Security Audit • Analyse des comportements de scan v1.0</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StatsModal;

