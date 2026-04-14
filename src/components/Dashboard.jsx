import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Shield, ShieldCheck, ShieldAlert, Activity, Users, Lock,
  FileText, LogOut, Settings, ChevronRight, Zap, Eye,
  Clock, AlertTriangle, CheckCircle, TrendingUp, Server,
  Wifi, WifiOff, Cpu, HardDrive
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay, subtitle }) => (
  <motion.div
    className="dash-stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, type: 'spring' }}
    whileHover={{ y: -4, scale: 1.02 }}
    style={{ '--card-accent': color }}
  >
    <div className="dash-stat-icon" style={{ background: `${color}15`, color }}>
      <Icon size={22} />
    </div>
    <div className="dash-stat-info">
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-label">{label}</span>
      {subtitle && <span className="dash-stat-subtitle">{subtitle}</span>}
    </div>
    <div className="dash-stat-glow" style={{ background: color }} />
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, onClick, color, delay }) => (
  <motion.button
    className="dash-quick-action"
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring' }}
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.98 }}
    style={{ '--action-color': color }}
  >
    <div className="action-icon-wrap" style={{ background: `${color}18`, color }}>
      <Icon size={20} />
    </div>
    <span>{label}</span>
    <ChevronRight size={16} className="action-arrow" />
  </motion.button>
);

const RealtimeEvent = ({ event, index }) => {
  const isClean = event.result === 'CLEAN';
  return (
    <motion.div
      className="dash-event-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className={`event-status-dot ${isClean ? 'clean' : 'threat'}`} />
      <div className="event-info">
        <span className="event-file">{event.filename || event.file || 'Fichier inconnu'}</span>
        <span className="event-time">{event.timestamp || ''}</span>
      </div>
      <span className={`event-badge ${isClean ? 'clean' : 'threat'}`}>
        {isClean ? 'Sûr' : 'Menace'}
      </span>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, rtRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/av/stats`).catch(() => null),
          axios.get(`${import.meta.env.VITE_API_URL}/api/realtime-events`).catch(() => null)
        ]);
        if (statsRes) setStats(statsRes.data);
        if (rtRes) setRealtimeData(rtRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const monitorActive = realtimeData?.status === 'ACTIVE';
  const recentEvents = realtimeData?.events?.slice(-5).reverse() || [];

  return (
    <div className="dash-layout">
      {/* Ambient background orbs */}
      <div className="dash-bg-orb dash-bg-orb-1" />
      <div className="dash-bg-orb dash-bg-orb-2" />
      <div className="dash-bg-orb dash-bg-orb-3" />

      {/* Top Navigation Bar */}
      <motion.nav
        className="dash-navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dash-nav-left">
          <div className="dash-logo">
            <Shield size={24} />
            <span>Crypton</span>
          </div>
        </div>
        <div className="dash-nav-right">
          <div className="dash-time">
            <Clock size={14} />
            <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className={`dash-monitor-status ${monitorActive ? 'active' : 'inactive'}`}>
            {monitorActive ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{monitorActive ? 'Moniteur actif' : 'Moniteur inactif'}</span>
          </div>
          <button className="dash-nav-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="dash-content">
        {/* Welcome Section */}
        <motion.section
          className="dash-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="dash-welcome-text">
            <h1>{greeting()}, <span className="dash-name-gradient">{user.fullname}</span></h1>
            <p>Voici un aperçu de votre système de sécurité Crypton & AV-Shield.</p>
          </div>
          <div className="dash-welcome-badge">
            <ShieldCheck size={20} />
            <span>Super Administrateur</span>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <section className="dash-stats-grid">
          <StatCard
            icon={Shield}
            label="Scans totaux"
            value={stats?.total_scans ?? '—'}
            color="#6366f1"
            delay={0.2}
            subtitle="Analyses effectuées"
          />
          <StatCard
            icon={CheckCircle}
            label="Fichiers sains"
            value={stats?.total_clean ?? '—'}
            color="#10b981"
            delay={0.3}
            subtitle="Aucune menace"
          />
          <StatCard
            icon={AlertTriangle}
            label="Menaces détectées"
            value={(stats?.total_malware ?? 0) + (stats?.total_suspicious ?? 0) || '—'}
            color="#f59e0b"
            delay={0.4}
            subtitle="Fichiers suspects"
          />
          <StatCard
            icon={Zap}
            label="Événements aujourd'hui"
            value={realtimeData?.today_count ?? '—'}
            color="#ec4899"
            delay={0.5}
            subtitle="Activité temps réel"
          />
        </section>

        {/* Two Column Layout */}
        <div className="dash-two-col">
          {/* Left: Quick Actions */}
          <motion.section
            className="dash-panel dash-actions-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="dash-panel-header">
              <h2><Zap size={18} /> Actions rapides</h2>
            </div>
            <div className="dash-actions-list">
              {user.is_superadmin && (
                <QuickAction
                  icon={Users}
                  label="Panneau d'Administration"
                  onClick={() => navigate('/admin')}
                  color="#8b5cf6"
                  delay={0.5}
                />
              )}
              <QuickAction
                icon={ShieldAlert}
                label="Historique des scans"
                onClick={() => navigate('/admin')}
                color="#6366f1"
                delay={0.55}
              />
              <QuickAction
                icon={Lock}
                label="Coffre-fort sécurisé"
                onClick={() => navigate('/admin')}
                color="#10b981"
                delay={0.6}
              />
              <QuickAction
                icon={Settings}
                label="Paramètres système"
                onClick={() => navigate('/admin')}
                color="#f59e0b"
                delay={0.65}
              />
            </div>
          </motion.section>

          {/* Right: Realtime Events */}
          <motion.section
            className="dash-panel dash-events-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <div className="dash-panel-header">
              <h2><Activity size={18} /> Activité récente</h2>
              <div className={`dash-live-indicator ${monitorActive ? 'active' : ''}`}>
                <span className="live-dot" />
                LIVE
              </div>
            </div>
            <div className="dash-events-list">
              <AnimatePresence>
                {recentEvents.length > 0 ? (
                  recentEvents.map((evt, i) => (
                    <RealtimeEvent key={i} event={evt} index={i} />
                  ))
                ) : (
                  <motion.div
                    className="dash-empty-events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Eye size={32} />
                    <span>Aucun événement récent</span>
                    <p>Le moniteur surveille vos répertoires en temps réel.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        {/* System Status Bar */}
        <motion.section
          className="dash-system-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="sys-item">
            <Server size={16} />
            <span>API</span>
            <span className="sys-status online">En ligne</span>
          </div>
          <div className="sys-divider" />
          <div className="sys-item">
            <Cpu size={16} />
            <span>AV-Shield</span>
            <span className="sys-status online">Opérationnel</span>
          </div>
          <div className="sys-divider" />
          <div className="sys-item">
            <HardDrive size={16} />
            <span>Base de données</span>
            <span className="sys-status online">Connectée</span>
          </div>
          <div className="sys-divider" />
          <div className="sys-item">
            <Activity size={16} />
            <span>Moniteur</span>
            <span className={`sys-status ${monitorActive ? 'online' : 'offline'}`}>
              {monitorActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </motion.section>

        <div className="dash-footer">
          <p>Crypton Security Platform • {user.email} • Connecté en tant que Super Administrateur</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
