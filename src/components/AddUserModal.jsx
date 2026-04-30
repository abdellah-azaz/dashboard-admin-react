import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Lock, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/axiosClient';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    telephone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await api.post('/admin/create-user', formData);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Utilisateur créé avec succès !' });
        setFormData({ fullname: '', email: '', telephone: '', password: '' });
        if (onUserAdded) onUserAdded();
        setTimeout(() => {
          onClose();
          setStatus(null);
        }, 2000);
      } else {
        setStatus({ type: 'error', message: response.data.message || 'Erreur lors de la création.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur serveur lors de la création.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">
              <UserPlus size={20} className="text-primary" />
              <span>Ajouter un nouvel utilisateur</span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-field">
              <label><User size={14} /> Nom complet</label>
              <input 
                type="text" 
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>

            <div className="modal-field">
              <label><Mail size={14} /> Email Professionnel</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean@example.com"
                required
              />
            </div>

            <div className="modal-field">
              <label><Phone size={14} /> Téléphone (Optionnel)</label>
              <input 
                type="tel" 
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+33 6 00 00 00 00"
              />
            </div>

            <div className="modal-field">
              <label><Lock size={14} /> Mot de passe</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {status && (
              <motion.div 
                className={`modal-status ${status.type}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span>{status.message}</span>
              </motion.div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer l\'utilisateur'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddUserModal;
