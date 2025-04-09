import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Player, playersApi, Position } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Trash2, Pencil, Search, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayerForm } from '@/components/players/PlayerForm';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import type { PlayerFormData } from '@/components/players/PlayerForm';
import { PlayerCard } from '@/components/players/PlayerCard';

const positionColors: Record<Position, string> = {
  'Guarda-Redes': 'bg-blue-500',
  'Defesa': 'bg-green-500',
  'Meio-campo': 'bg-yellow-500',
  'Avançado': 'bg-red-500'
};

const positionBgColors: Record<string, string> = {
  'Guarda-Redes': 'bg-green-50 hover:bg-green-100',
  'Defesa': 'bg-blue-50 hover:bg-blue-100',
  'Meio-campo': 'bg-yellow-50 hover:bg-yellow-100',
  'Avançado': 'bg-red-50 hover:bg-red-100',
};

const positionAbbreviations: Record<Position, string> = {
  'Guarda-Redes': 'GR',
  'Defesa': 'DEF',
  'Meio-campo': 'MED',
  'Avançado': 'AVA'
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const data = await playersApi.list();
      setPlayers(data || []);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os jogadores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este jogador?')) {
      try {
        await playersApi.delete(id);
        loadPlayers();
        toast({
          title: 'Sucesso',
          description: 'Jogador removido com sucesso.',
        });
      } catch (error) {
        console.error('Erro ao remover jogador:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível remover o jogador.',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const positions = Array.isArray(player.position) ? player.position : [];
    const matchesPosition = positionFilter === 'all' || positions.includes(positionFilter as Position);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && player.is_active) || 
      (statusFilter === 'inactive' && !player.is_active);
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handlePlayerCreated = async (data: PlayerFormData) => {
    try {
      const newPlayer = {
        name: data.name,
        nickname: data.nickname,
        position: data.position as Position[],
        is_active: data.is_active
      };
      await playersApi.create(newPlayer);
      setIsDialogOpen(false);
      await loadPlayers();
      toast({
        title: 'Sucesso',
        description: 'Jogador criado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o jogador.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPlayer = (player: Player) => {
    console.log('Editando jogador:', player);
    // Garante que as posições estejam no formato correto
    const positions = typeof player.position === 'string'
      ? player.position.split(',') as Position[]
      : Array.isArray(player.position)
        ? player.position
        : ['Defesa'];
    
    setSelectedPlayer({
      ...player,
      position: positions
    });
    setIsEditDialogOpen(true);
  };

  const handlePlayerUpdated = async (data: PlayerFormData) => {
    try {
      if (selectedPlayer) {
        console.log('Dados recebidos para atualização:', data);
        
        const updatedPlayer = {
          id: selectedPlayer.id,
          name: data.name,
          nickname: data.nickname || null,
          position: data.position,
          is_active: data.is_active,
          photo_url: data.photo_url
        };
        
        console.log('Dados a serem salvos:', updatedPlayer);
        await playersApi.update(selectedPlayer.id, updatedPlayer);
        
        setIsEditDialogOpen(false);
        setSelectedPlayer(null);
        await loadPlayers();
        
        toast({
          title: 'Sucesso',
          description: 'Jogador atualizado com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o jogador.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout title="Gestão de Jogadores">
      <div className="space-y-6">
        {/* Barra de Ferramentas */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Procurar jogador por nome ou apelido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={positionFilter}
                onValueChange={setPositionFilter}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Todas as posições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as posições</SelectItem>
                  <SelectItem value="Guarda-Redes">Guarda-Redes</SelectItem>
                  <SelectItem value="Defesa">Defesa</SelectItem>
                  <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="bg-[#b89333] hover:bg-[#a07d2d] text-white ml-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Jogador
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Jogadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={handleEditPlayer}
              onRemovePlayer={() => handleDeletePlayer(player.id)}
            />
          ))}
        </div>

        {/* Estado Vazio */}
        {filteredPlayers.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">Nenhum jogador encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Clique em "Novo Jogador" para começar'}
            </p>
          </div>
        )}

        {/* Modal de Criação de Jogador */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]" aria-describedby="new-player-description">
            <DialogHeader>
              <DialogTitle>Novo Jogador</DialogTitle>
              <p id="new-player-description" className="text-sm text-gray-500">
                Preencha os dados do novo jogador abaixo.
              </p>
            </DialogHeader>
            <PlayerForm 
              onSubmit={handlePlayerCreated}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Jogador */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]" aria-describedby="edit-player-description">
            <DialogHeader>
              <DialogTitle>Editar Jogador</DialogTitle>
              <p id="edit-player-description" className="text-sm text-gray-500">
                Atualize os dados do jogador abaixo.
              </p>
            </DialogHeader>
            {selectedPlayer && (
              <PlayerForm 
                onSubmit={handlePlayerUpdated}
                onCancel={() => setIsEditDialogOpen(false)}
                player={selectedPlayer}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
