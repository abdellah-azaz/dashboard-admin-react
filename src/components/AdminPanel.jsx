import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Key, FileText, Settings, Search, LogOut, 
  ChevronRight, ShieldAlert, UserCircle, Activity, Ban,
  Mail, Send, Phone, AtSign, Shield
} from 'lucide-react';

const AdminPanel = () => {
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/admin/all-data?email=${currentUser.email}`);
        setData(response.data);
        if (response.data.users && response.data.users.length > 0) {
          setSelectedUser(response.data.users[0]);
        }
      } catch (err) {
        setError('Accès refusé ou erreur serveur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.email]);

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter(u => 
      u.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (loading) return <div className="auth-container"><motion.h1 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }}>Chargement...</motion.h1></div>;
  if (error) return <div className="auth-container"><h1 className="error-msg">{error}</h1><button onClick={() => navigate('/dashboard')}>Retour</button></div>;

  const handleBanUser = async (userEmail) => {
    const reason = window.prompt("Raison du bannissement:");
    if (reason === null) return;
    try {
      await axios.post('http://localhost:8000/admin/users/ban', {
        user_email: userEmail,
        email: currentUser.email,
        reason: reason
      });
      const response = await axios.get(`http://localhost:8000/admin/all-data?email=${currentUser.email}`);
      setData(response.data);
    } catch (err) {
      alert("Erreur lors du bannissement");
    }
  };

  const handleUnbanUser = async (userEmail) => {
    try {
      await axios.post('http://localhost:8000/admin/users/unban', {
        user_email: userEmail,
        email: currentUser.email
      });
      const response = await axios.get(`http://localhost:8000/admin/all-data?email=${currentUser.email}`);
      setData(response.data);
    } catch (err) {
      alert("Erreur lors du débannissement");
    }
  };

  const renderMembersTable = (items) => {
    if (items.length === 0) return <div className="empty-state">Aucun membre trouvé</div>;
    return (
      <div className="data-table-container">
        <table>
          <thead><tr><th>ID</th><th>Nom complet</th><th>Email</th></tr></thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <td>{item.id}</td><td>{item.fullname}</td><td>{item.email}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  const renderPasswordsTable = (items) => {
    if (items.length === 0) return <div className="empty-state">Aucun mot de passe trouvé</div>;
    return (
      <div className="data-table-container">
        <table>
          <thead><tr><th>ID</th><th>Application/Site</th><th>Nom d'utilisateur</th></tr></thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <td>{item.id}</td><td>{item.website_url || '-'}</td><td>{item.username || '-'}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  const renderVaultTable = (items) => {
    if (items.length === 0) return <div className="empty-state">Aucun fichier trouvé</div>;
    return (
      <div className="data-table-container">
        <table>
          <thead><tr><th>ID</th><th>Nom du fichier</th><th>Taille / ID</th></tr></thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <td>{item.id}</td><td>{item.filename || '-'}</td><td>{item.file_id || '-'}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  const renderScanHistoryTable = (items) => {
    if (!items || items.length === 0) return <div className="empty-state">Aucun historique de scan trouvé.</div>;
    return (
      <div className="data-table-container">
        <table>
          <thead><tr><th>ID</th><th>Date</th><th>Cible</th><th>Résultat</th><th>C/H/M/L</th></tr></thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <td>{item.id}</td>
                  <td>{new Date(item.scan_date).toLocaleString()}</td>
                  <td title={item.target_path}>{item.target_path?.length > 30 ? (item.target_path.substring(0, 30) + '...') : item.target_path}</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: item.result === 'CLEAN' ? '#2ecc71' : '#e74c3c' }}>
                      {item.result}
                    </span>
                  </td>
                  <td>{`${item.critical_count}/${item.high_count}/${item.medium_count}/${item.low_count}`}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSettings = (settings) => {
    if (!settings || settings.length === 0) return <div className="empty-state">Aucun paramètre trouvé.</div>;
    const sets = settings[0];
    const labels = {
      random_password_enabled: "Mot de passe aléatoire",
      encrypted_result_visible: "Résultat chiffré visible",
      scan_history_cleanup_mode: "Nettoyage historique",
      use_custom_restore_path: "Chemin restauration personnalisé",
      custom_restore_path: "Chemin de restauration",
      is_ai_analysis_enabled: "Analyse IA activée",
      is_realtime_analysis_enabled: "Analyse temps réel",
      require_password_for_delete: "Mdp requis pour suppression",
      require_password_for_download: "Mdp requis pour téléchargement"
    };

    return (
      <div className="settings-grid">
        <AnimatePresence>
          {Object.entries(labels).map(([key, label], idx) => {
            const val = sets[key];
            const isBool = typeof val === 'boolean' || val === 1 || val === 0;
            const boolVal = val === true || val === 1;
            
            return (
              <motion.div 
                key={key} 
                className="setting-item"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className="setting-label">{label}</span>
                <span className={`setting-value ${isBool ? (boolVal ? 'text-success' : 'text-danger') : ''}`}>
                  {isBool ? (boolVal ? 'Activé' : 'Désactivé') : (val !== null && val !== undefined && val !== '' ? val : '-')}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  const tabs = [
    { id: 'profil', label: 'Profil', icon: UserCircle },
    { id: 'members', label: 'Membres', icon: Users },
    { id: 'passwords', label: 'Mots de passe', icon: Key },
    { id: 'vault_files', label: 'Coffre', icon: FileText },
    { id: 'av_history', label: 'Historique Scans', icon: Activity },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'contact', label: 'Contacter', icon: Mail }
  ];

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailStatus({ type: 'error', msg: 'Veuillez remplir le sujet et le message.' });
      return;
    }
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await axios.post('http://localhost:8000/admin/send-email', {
        email: currentUser.email,
        to_email: selectedUser.email,
        subject: emailSubject,
        body: emailBody
      });
      if (res.data.success) {
        setEmailStatus({ type: 'success', msg: `Email envoyé avec succès à ${selectedUser.email}` });
        setEmailSubject('');
        setEmailBody('');
      } else {
        setEmailStatus({ type: 'error', msg: res.data.message || 'Erreur lors de l\'envoi.' });
      }
    } catch (err) {
      setEmailStatus({ type: 'error', msg: 'Erreur serveur lors de l\'envoi de l\'email.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const renderEmailForm = () => (
    <div className="email-form-container">
      <div className="email-form-header">
        <Mail size={20} className="text-primary" />
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Envoyer un email à {selectedUser.fullname}</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Destinataire : {selectedUser.email}</p>
        </div>
      </div>
      <div className="email-form-body">
        <div className="email-field">
          <label>Sujet</label>
          <input
            type="text"
            placeholder="Objet du message..."
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="email-input"
          />
        </div>
        <div className="email-field">
          <label>Message</label>
          <textarea
            placeholder="Écrivez votre message ici..."
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="email-textarea"
            rows={8}
          />
        </div>
        {emailStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`email-status ${emailStatus.type}`}
          >
            {emailStatus.msg}
          </motion.div>
        )}
        <button
          className="email-send-btn"
          onClick={handleSendEmail}
          disabled={sendingEmail}
        >
          {sendingEmail ? (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>Envoi en cours...</motion.span>
          ) : (
            <><Send size={16} /> Envoyer l'email</>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar List */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <ShieldAlert size={26} className="text-primary" />
            <h2>Admin Hub</h2>
          </div>
          <button className="icon-btn logout-btn" onClick={() => navigate('/dashboard')} title="Quitter">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="user-list">
          <AnimatePresence>
            {filteredUsers.map((u) => (
              <motion.div
                key={u.id || u.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`user-card ${selectedUser?.email === u.email ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUser(u);
                  setActiveTab('members');
                }}
              >
                <div className="user-avatar-small">
                  <UserCircle size={36} />
                </div>
                <div className="user-info">
                  <h4>{u.fullname}</h4>
                  <p>{u.email}</p>
                </div>
                {data?.banned_users && data.banned_users.some(b => b.email === u.email) ? (
                  <span className="badge badge-banned">Banni</span>
                ) : u.is_superadmin ? (
                  <span className="badge badge-admin">Admin</span>
                ) : (
                  <ChevronRight size={16} className="nav-icon" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && (
            <div className="empty-state">Aucun utilisateur trouvé</div>
          )}
        </div>
      </aside>

      {/* Main Details Area */}
      <main className="admin-main">
        {selectedUser ? (
          <>
            <header className="main-header">
              <div className="header-top">
                <div className="selected-user-header">
                  <div className="user-avatar-large">
                    <UserCircle size={56} />
                  </div>
                  <div>
                    <h1>{selectedUser.fullname}</h1>
                    <p className="subtitle">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="header-stats">
                  <div className="stat-card">
                    <Activity size={16} />
                    <span>Actif</span>
                  </div>
                  {selectedUser.is_superadmin && (
                    <div className="stat-card admin-stat">
                      <ShieldAlert size={16} />
                      <span>Privilèges Admin</span>
                    </div>
                  )}
                  {data?.banned_users && data.banned_users.some(b => b.email === selectedUser.email) ? (
                    <button className="icon-btn unban-btn" onClick={() => handleUnbanUser(selectedUser.email)} title="Débannir l'utilisateur">
                       <Activity size={16} className="text-success" />
                       <span style={{marginLeft: '0.5rem', fontSize: '0.85rem'}}>Débannir</span>
                    </button>
                  ) : (
                    <button className="icon-btn ban-btn" onClick={() => handleBanUser(selectedUser.email)} title="Bannir l'utilisateur">
                       <Ban size={16} className="text-danger" />
                       <span style={{marginLeft: '0.5rem', fontSize: '0.85rem'}}>Bannir</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="tab-nav">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button 
                      key={tab.id} 
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div className="tab-indicator" layoutId="indicator" />
                      )}
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="tab-content-area">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="tab-pane"
                >
                  {activeTab === 'profil' && (() => {
                    const isBanned = data?.banned_users?.some(b => b.email === selectedUser.email);
                    const banInfo = data?.banned_users?.find(b => b.email === selectedUser.email);
                    return (
                      <div className="user-profile-view">
                        <div className="profile-hero">
                          <div className="profile-avatar-xl">
                            <UserCircle size={80} />
                          </div>
                          <h2>{selectedUser.fullname}</h2>
                          <p className="profile-email-xl">{selectedUser.email}</p>
                          <div className="profile-badges">
                            {selectedUser.is_superadmin && (
                              <span className="badge badge-admin"><Shield size={12} /> Administrateur</span>
                            )}
                            {isBanned ? (
                              <span className="badge badge-banned"><Ban size={12} /> Banni</span>
                            ) : (
                              <span className="badge badge-active"><Activity size={12} /> Actif</span>
                            )}
                          </div>
                        </div>
                        <div className="profile-details-grid">
                          <div className="profile-detail-card">
                            <div className="detail-icon"><UserCircle size={18} /></div>
                            <div className="detail-info">
                              <span className="detail-label">Nom complet</span>
                              <span className="detail-value">{selectedUser.fullname || '—'}</span>
                            </div>
                          </div>
                          <div className="profile-detail-card">
                            <div className="detail-icon"><AtSign size={18} /></div>
                            <div className="detail-info">
                              <span className="detail-label">Adresse email</span>
                              <span className="detail-value">{selectedUser.email || '—'}</span>
                            </div>
                          </div>
                          <div className="profile-detail-card">
                            <div className="detail-icon"><Phone size={18} /></div>
                            <div className="detail-info">
                              <span className="detail-label">Téléphone</span>
                              <span className="detail-value">{selectedUser.telephone || 'Non renseigné'}</span>
                            </div>
                          </div>
                          <div className="profile-detail-card">
                            <div className="detail-icon"><Shield size={18} /></div>
                            <div className="detail-info">
                              <span className="detail-label">Rôle</span>
                              <span className="detail-value">{selectedUser.is_superadmin ? 'Super Administrateur' : 'Utilisateur'}</span>
                            </div>
                          </div>
                          <div className="profile-detail-card">
                            <div className="detail-icon"><Key size={18} /></div>
                            <div className="detail-info">
                              <span className="detail-label">ID Utilisateur</span>
                              <span className="detail-value">#{selectedUser.id}</span>
                            </div>
                          </div>
                          {isBanned && banInfo && (
                            <div className="profile-detail-card banned-card">
                              <div className="detail-icon banned-icon"><Ban size={18} /></div>
                              <div className="detail-info">
                                <span className="detail-label">Raison du bannissement</span>
                                <span className="detail-value">{banInfo.reason || 'Aucune raison spécifiée'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {activeTab === 'members' && renderMembersTable(
                    data.members.filter(m => m.owner_email === selectedUser.email)
                  )}
                  {activeTab === 'passwords' && renderPasswordsTable(
                    data.passwords.filter(p => p.owner_email === selectedUser.email)
                  )}
                  {activeTab === 'vault_files' && renderVaultTable(
                    data.vault_files.filter(f => f.owner_email === selectedUser.email)
                  )}
                  {activeTab === 'av_history' && renderScanHistoryTable(
                    data.av_history ? data.av_history.filter(h => h.owner_email === selectedUser.email) : []
                  )}
                  {activeTab === 'settings' && renderSettings(
                    data.settings.filter(s => s.email === selectedUser.email)
                  )}
                  {activeTab === 'contact' && renderEmailForm()}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ type: "spring" }}
            >
              <Users size={64} className="text-secondary opacity-30" style={{ margin: '0 auto', marginBottom: '1rem', display: 'block' }} />
              <h2>Sélectionnez un utilisateur</h2>
              <p>Choisissez un utilisateur dans le panneau latéral pour inspecter ses données isolées.</p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
