import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, playersApi } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface PlayerContextType {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id' | 'created_at'>) => Promise<void>;
  updatePlayer: (id: number, player: Partial<Player>) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
  togglePlayerStatus: (id: number) => Promise<void>;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar jogadores ao iniciar
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await playersApi.list();
      setPlayers(data);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os jogadores',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPlayer = async (player: Omit<Player, 'id' | 'created_at'>) => {
    try {
      const newPlayer = await playersApi.create(player);
      setPlayers(prev => [...prev, newPlayer]);
      toast({
        title: 'Sucesso',
        description: 'Jogador adicionado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o jogador',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePlayer = async (id: number, playerUpdates: Partial<Player>) => {
    try {
      const updatedPlayer = await playersApi.update(id, playerUpdates);
      setPlayers(prev =>
        prev.map(player =>
          player.id === id ? { ...player, ...updatedPlayer } : player
        )
      );
      toast({
        title: 'Sucesso',
        description: 'Jogador atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o jogador',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removePlayer = async (id: number) => {
    try {
      await playersApi.delete(id);
      setPlayers(prev => prev.filter(player => player.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Jogador removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o jogador',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const togglePlayerStatus = async (id: number) => {
    try {
      const player = players.find(p => p.id === id);
      if (!player) throw new Error('Jogador não encontrado');
      
      const updatedPlayer = await playersApi.update(id, { is_active: !player.is_active });
      setPlayers(prev =>
        prev.map(p =>
          p.id === id ? { ...p, ...updatedPlayer } : p
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status do jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do jogador',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <PlayerContext.Provider
      value={{ 
        players, 
        addPlayer, 
        updatePlayer, 
        removePlayer, 
        togglePlayerStatus,
        isLoading
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
};
