import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ExternalLink, Users, Shield, Wrench } from 'lucide-react';
import './Home.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState({ contact_link: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, rolesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/players`),
        axios.get(`${API}/roles`),
        axios.get(`${API}/settings`)
      ]);
      setPlayers(playersRes.data);
      setRoles(rolesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayersByRole = (roleId) => {
    const rolePlayers = players.filter(p => p.role_id === roleId);
    // Ordenar por status: ativo -> pendente -> inativo
    const statusOrder = { 'ativo': 1, 'pendente': 2, 'inativo': 3 };
    return rolePlayers.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return '#10B981';
      case 'pendente': return '#F59E0B';
      case 'inativo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'pendente': return 'Pendente';
      case 'inativo': return 'Inativo';
      default: return status;
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section with Parallax */}
      <section className="hero-section" data-testid="hero-section">
        <div className="parallax-bg"></div>
        <div className="hero-content">
          <img 
            src="https://customer-assets.emergentagent.com/job_6328b35b-1d2b-4262-8aa3-df4b45587865/artifacts/gca9i0bg_56f57b9e1b9e0408a0f2bedc89b1c153.webp" 
            alt="Heasy MC Logo" 
            className="hero-logo"
            data-testid="hero-logo"
          />
          <h1 className="hero-title" data-testid="hero-title">HEASY MC</h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">Servidor de Minecraft com a melhor equipe</p>
          {settings.contact_link && (
            <Button 
              className="contact-btn"
              onClick={() => window.open(settings.contact_link, '_blank')}
              data-testid="contact-button"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Entre em Contato
            </Button>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" data-testid="team-section">
        <div className="section-header">
          <Users className="section-icon" />
          <h2 className="section-title" data-testid="section-title">Nossa Equipe</h2>
        </div>

        {loading ? (
          <div className="loading" data-testid="loading-indicator">Carregando...</div>
        ) : (
          <div className="roles-container">
            {roles.map((role) => {
              const rolePlayers = getPlayersByRole(role.id);
              if (rolePlayers.length === 0) return null;

              return (
                <div key={role.id} className="role-group" data-testid={`role-group-${role.name.toLowerCase()}`}>
                  <div className="role-header">
                    <div 
                      className="role-badge"
                      style={{ backgroundColor: role.color }}
                      data-testid={`role-badge-${role.name.toLowerCase()}`}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 
                      className="role-name"
                      style={{ color: role.color }}
                      data-testid={`role-name-${role.name.toLowerCase()}`}
                    >
                      {role.name}
                    </h3>
                  </div>

                  <div className="players-grid">
                    {rolePlayers.map((player) => (
                      <div 
                        key={player.id} 
                        className="player-card"
                        data-testid={`player-card-${player.minecraft_username}`}
                      >
                        <div className="player-avatar-wrapper">
                          <img
                            src={`https://mc-heads.net/avatar/${player.minecraft_username}/100`}
                            alt={player.minecraft_username}
                            className="player-avatar"
                            data-testid={`player-avatar-${player.minecraft_username}`}
                            onError={(e) => {
                              e.target.src = 'https://mc-heads.net/avatar/Steve/100';
                            }}
                          />
                          <div 
                            className="status-indicator"
                            style={{ backgroundColor: getStatusColor(player.status) }}
                            data-testid={`status-indicator-${player.minecraft_username}`}
                          ></div>
                        </div>
                        <h4 
                          className="player-name"
                          data-testid={`player-name-${player.minecraft_username}`}
                        >
                          {player.minecraft_username}
                        </h4>
                        <span 
                          className="player-status"
                          style={{ color: getStatusColor(player.status) }}
                          data-testid={`player-status-${player.minecraft_username}`}
                        >
                          {getStatusLabel(player.status)}
                        </span>
                        {player.description && (
                          <p 
                            className="player-description"
                            data-testid={`player-description-${player.minecraft_username}`}
                          >
                            {player.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer" data-testid="footer">
        <div className="footer-content">
          <Wrench className="footer-icon" />
          <p>© 2025 Heasy MC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;