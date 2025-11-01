import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { LogIn, Users, Shield, Settings, Trash2, Edit, Plus, LogOut } from 'lucide-react';
import './AdminPanel.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState({ contact_link: '' });
  
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  
  const [playerForm, setPlayerForm] = useState({
    minecraft_username: '',
    role_id: '',
    status: 'pendente',
    description: ''
  });
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    color: '#8B5CF6',
    order: 1
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchAllData();
    }
  }, [token]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      setIsLoggedIn(true);
      toast.success('Login realizado com sucesso!');
      fetchAllData();
    } catch (error) {
      toast.error('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    toast.info('Logout realizado');
  };

  const fetchAllData = async () => {
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
    }
  };

  // Player CRUD
  const handleCreatePlayer = async () => {
    try {
      await axios.post(`${API}/players`, playerForm, getAuthHeaders());
      toast.success('Player criado com sucesso!');
      fetchAllData();
      setIsPlayerDialogOpen(false);
      resetPlayerForm();
    } catch (error) {
      toast.error('Erro ao criar player');
    }
  };

  const handleUpdatePlayer = async () => {
    try {
      await axios.put(`${API}/players/${editingPlayer.id}`, playerForm, getAuthHeaders());
      toast.success('Player atualizado com sucesso!');
      fetchAllData();
      setIsPlayerDialogOpen(false);
      resetPlayerForm();
    } catch (error) {
      toast.error('Erro ao atualizar player');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Tem certeza que deseja deletar este player?')) return;
    try {
      await axios.delete(`${API}/players/${playerId}`, getAuthHeaders());
      toast.success('Player deletado com sucesso!');
      fetchAllData();
    } catch (error) {
      toast.error('Erro ao deletar player');
    }
  };

  const openPlayerDialog = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        minecraft_username: player.minecraft_username,
        role_id: player.role_id,
        status: player.status,
        description: player.description
      });
    } else {
      setEditingPlayer(null);
      resetPlayerForm();
    }
    setIsPlayerDialogOpen(true);
  };

  const resetPlayerForm = () => {
    setPlayerForm({
      minecraft_username: '',
      role_id: '',
      status: 'pendente',
      description: ''
    });
    setEditingPlayer(null);
  };

  // Role CRUD
  const handleCreateRole = async () => {
    try {
      await axios.post(`${API}/roles`, roleForm, getAuthHeaders());
      toast.success('Cargo criado com sucesso!');
      fetchAllData();
      setIsRoleDialogOpen(false);
      resetRoleForm();
    } catch (error) {
      toast.error('Erro ao criar cargo');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await axios.put(`${API}/roles/${editingRole.id}`, roleForm, getAuthHeaders());
      toast.success('Cargo atualizado com sucesso!');
      fetchAllData();
      setIsRoleDialogOpen(false);
      resetRoleForm();
    } catch (error) {
      toast.error('Erro ao atualizar cargo');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Tem certeza que deseja deletar este cargo?')) return;
    try {
      await axios.delete(`${API}/roles/${roleId}`, getAuthHeaders());
      toast.success('Cargo deletado com sucesso!');
      fetchAllData();
    } catch (error) {
      toast.error('Erro ao deletar cargo');
    }
  };

  const openRoleDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        color: role.color,
        order: role.order
      });
    } else {
      setEditingRole(null);
      resetRoleForm();
    }
    setIsRoleDialogOpen(true);
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      color: '#8B5CF6',
      order: roles.length + 1
    });
    setEditingRole(null);
  };

  // Settings
  const handleUpdateSettings = async () => {
    try {
      await axios.put(`${API}/settings`, { contact_link: settings.contact_link }, getAuthHeaders());
      toast.success('Configurações atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login" data-testid="admin-login">
        <Card className="login-card">
          <CardHeader>
            <CardTitle className="login-title" data-testid="login-title">
              <Shield className="w-8 h-8" />
              Painel Administrativo
            </CardTitle>
            <CardDescription>Faça login para gerenciar a equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="password-input"
                />
              </div>
              <Button type="submit" className="login-btn" data-testid="login-button">
                <LogIn className="w-5 h-5 mr-2" />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-panel" data-testid="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title" data-testid="admin-title">
          <Shield className="w-8 h-8" />
          Painel Administrativo
        </h1>
        <Button onClick={handleLogout} variant="outline" data-testid="logout-button">
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="players" className="admin-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="players" data-testid="players-tab">
            <Users className="w-5 h-5 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="roles" data-testid="roles-tab">
            <Shield className="w-5 h-5 mr-2" />
            Cargos
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="settings-tab">
            <Settings className="w-5 h-5 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Players Tab */}
        <TabsContent value="players" className="tab-content">
          <div className="tab-header">
            <h2>Gerenciar Players</h2>
            <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openPlayerDialog()} data-testid="add-player-button">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Player
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>{editingPlayer ? 'Editar Player' : 'Novo Player'}</DialogTitle>
                  <DialogDescription>Preencha os dados do player</DialogDescription>
                </DialogHeader>
                <div className="dialog-form">
                  <div className="form-group">
                    <Label htmlFor="minecraft_username">Username do Minecraft</Label>
                    <Input
                      id="minecraft_username"
                      value={playerForm.minecraft_username}
                      onChange={(e) => setPlayerForm({...playerForm, minecraft_username: e.target.value})}
                      data-testid="player-username-input"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="role">Cargo</Label>
                    <Select value={playerForm.role_id} onValueChange={(value) => setPlayerForm({...playerForm, role_id: value})}>
                      <SelectTrigger data-testid="player-role-select">
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group">
                    <Label htmlFor="status">Status</Label>
                    <Select value={playerForm.status} onValueChange={(value) => setPlayerForm({...playerForm, status: value})}>
                      <SelectTrigger data-testid="player-status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={playerForm.description}
                      onChange={(e) => setPlayerForm({...playerForm, description: e.target.value})}
                      rows={3}
                      data-testid="player-description-input"
                    />
                  </div>
                  <Button 
                    onClick={editingPlayer ? handleUpdatePlayer : handleCreatePlayer}
                    className="w-full"
                    data-testid="save-player-button"
                  >
                    {editingPlayer ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="items-grid">
            {players.map(player => {
              const role = roles.find(r => r.id === player.role_id);
              return (
                <Card key={player.id} className="item-card" data-testid={`player-card-admin-${player.minecraft_username}`}>
                  <CardContent className="card-content">
                    <img
                      src={`https://mc-heads.net/avatar/${player.minecraft_username}/80`}
                      alt={player.minecraft_username}
                      className="item-avatar"
                      onError={(e) => e.target.src = 'https://mc-heads.net/avatar/Steve/80'}
                    />
                    <div className="item-info">
                      <h3 className="item-name">{player.minecraft_username}</h3>
                      <p className="item-role" style={{color: role?.color}}>{role?.name || 'N/A'}</p>
                      <p className="item-status">{player.status}</p>
                      <p className="item-description">{player.description}</p>
                    </div>
                    <div className="item-actions">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openPlayerDialog(player)}
                        data-testid={`edit-player-${player.minecraft_username}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeletePlayer(player.id)}
                        data-testid={`delete-player-${player.minecraft_username}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="tab-content">
          <div className="tab-header">
            <h2>Gerenciar Cargos</h2>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openRoleDialog()} data-testid="add-role-button">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Cargo
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>{editingRole ? 'Editar Cargo' : 'Novo Cargo'}</DialogTitle>
                  <DialogDescription>Preencha os dados do cargo</DialogDescription>
                </DialogHeader>
                <div className="dialog-form">
                  <div className="form-group">
                    <Label htmlFor="role_name">Nome do Cargo</Label>
                    <Input
                      id="role_name"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                      data-testid="role-name-input"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="role_color">Cor (Hex)</Label>
                    <div className="color-picker">
                      <Input
                        id="role_color"
                        type="color"
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
                        className="color-input"
                        data-testid="role-color-input"
                      />
                      <Input
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
                        className="color-text"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <Label htmlFor="role_order">Ordem de Exibição</Label>
                    <Input
                      id="role_order"
                      type="number"
                      value={roleForm.order}
                      onChange={(e) => setRoleForm({...roleForm, order: parseInt(e.target.value)})}
                      data-testid="role-order-input"
                    />
                  </div>
                  <Button 
                    onClick={editingRole ? handleUpdateRole : handleCreateRole}
                    className="w-full"
                    data-testid="save-role-button"
                  >
                    {editingRole ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="items-grid">
            {roles.map(role => (
              <Card key={role.id} className="item-card" data-testid={`role-card-admin-${role.name.toLowerCase()}`}>
                <CardContent className="card-content">
                  <div 
                    className="role-color-preview"
                    style={{backgroundColor: role.color}}
                  ></div>
                  <div className="item-info">
                    <h3 className="item-name" style={{color: role.color}}>{role.name}</h3>
                    <p className="item-description">Ordem: {role.order}</p>
                    <p className="item-description">{role.color}</p>
                  </div>
                  <div className="item-actions">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openRoleDialog(role)}
                      data-testid={`edit-role-${role.name.toLowerCase()}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteRole(role.id)}
                      data-testid={`delete-role-${role.name.toLowerCase()}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="tab-content">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>Configurações do Site</CardTitle>
              <CardDescription>Gerencie as configurações gerais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="form-group">
                <Label htmlFor="contact_link">Link de Contato</Label>
                <Input
                  id="contact_link"
                  value={settings.contact_link}
                  onChange={(e) => setSettings({...settings, contact_link: e.target.value})}
                  placeholder="https://discord.gg/..."
                  data-testid="contact-link-input"
                />
                <p className="form-help">Cole aqui o link da sua rede social (Discord, Instagram, etc.)</p>
              </div>
              <Button onClick={handleUpdateSettings} data-testid="save-settings-button">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;