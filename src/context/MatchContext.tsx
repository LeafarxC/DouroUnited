import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game, gamesApi, Team, teamsApi, goalsApi } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { usePlayers } from '@/context/PlayerContext';

interface MatchContextType {
  matches: Game[];
  addMatch: (match: Omit<Game, 'id' | 'created_at'>) => Promise<Game>;
  updateMatch: (id: string | number, match: Partial<Game>) => Promise<Game>;
  removeMatch: (id: string) => Promise<void>;
  togglePlayerConfirmation: (matchId: string, playerId: string) => Promise<Game>;
  generateTeams: (matchId: string) => Promise<void>;
  isLoading: boolean;
  setCurrentGame: (game: Game) => void;
  refreshMatches: () => Promise<void>;
  deleteMatch: (id: number) => Promise<void>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { players } = usePlayers();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const data = await gamesApi.list();
      console.log('Jogos carregados:', data);
      
      // Garantir que os arrays de equipas são arrays de números
      const formattedData = data.map(game => ({
        ...game,
        teamA: Array.isArray(game.teamA) ? game.teamA.map(Number) : [],
        teamB: Array.isArray(game.teamB) ? game.teamB.map(Number) : []
      }));
      
      console.log('Jogos formatados:', formattedData);
      setMatches(formattedData);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jogos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMatch = async (match: Omit<Game, 'id' | 'created_at'>): Promise<Game> => {
    try {
      const newMatchData = {
        ...match,
        selected_players: [], // Inicia sempre com array vazio
        is_confirmed: false
      };

      const data = await gamesApi.create(newMatchData);
      await loadMatches();
      return data as Game;
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      throw error;
    }
  };

  const updateMatch = async (id: string | number, match: Partial<Game>): Promise<Game> => {
    try {
      const numericMatchId = parseInt(id.toString());
      const currentMatch = matches.find(m => m.id === numericMatchId);
      if (!currentMatch) {
        throw new Error('Jogo não encontrado');
      }

      // Mantém todos os dados existentes e atualiza apenas os campos fornecidos
      const updateData: Partial<Game> = {
        ...currentMatch,
        ...match,
        selected_players: Array.isArray(match.selected_players) 
          ? match.selected_players.map(Number)
          : currentMatch.selected_players,
        teamA: Array.isArray(match.teamA) 
          ? match.teamA.map(Number)
          : currentMatch.teamA,
        teamB: Array.isArray(match.teamB) 
          ? match.teamB.map(Number)
          : currentMatch.teamB,
        scoreA: typeof match.scoreA === 'number' ? match.scoreA : currentMatch.scoreA,
        scoreB: typeof match.scoreB === 'number' ? match.scoreB : currentMatch.scoreB
      };

      // Atualiza o jogo no banco de dados
      const updatedGame = await gamesApi.update(id, updateData);

      // Cria o objeto atualizado mantendo todos os dados
      const fullUpdatedMatch: Game = {
        id: updatedGame.id,
        title: updatedGame.title || currentMatch.title,
        date: updatedGame.date || currentMatch.date,
        time: updatedGame.time || currentMatch.time,
        location: updatedGame.location || currentMatch.location,
        is_confirmed: updatedGame.is_confirmed ?? currentMatch.is_confirmed,
        selected_players: Array.isArray(updatedGame.selected_players) 
          ? updatedGame.selected_players.map(Number)
          : currentMatch.selected_players,
        teamA: Array.isArray(updatedGame.teamA) 
          ? updatedGame.teamA.map(Number)
          : currentMatch.teamA,
        teamB: Array.isArray(updatedGame.teamB) 
          ? updatedGame.teamB.map(Number)
          : currentMatch.teamB,
        scoreA: typeof updatedGame.scoreA === 'number' ? updatedGame.scoreA : currentMatch.scoreA,
        scoreB: typeof updatedGame.scoreB === 'number' ? updatedGame.scoreB : currentMatch.scoreB,
        created_at: updatedGame.created_at || currentMatch.created_at
      };

      // Atualiza o estado local imediatamente
      setMatches(prevMatches => 
        prevMatches.map(m => m.id === numericMatchId ? fullUpdatedMatch : m)
      );

      // Atualiza o jogo atual se necessário
      if (currentGame?.id === numericMatchId) {
        setCurrentGame(fullUpdatedMatch);
      }

      return fullUpdatedMatch;
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      throw error;
    }
  };

  const removeMatch = async (id: string): Promise<void> => {
    try {
      // Primeiro, deletar todos os golos associados ao jogo
      await goalsApi.deleteByGameId(parseInt(id));
      
      // Depois, deletar o jogo
      await gamesApi.delete(parseInt(id));
      
      // Atualizar o estado local
      setMatches(prevMatches => prevMatches.filter(match => match.id !== parseInt(id)));
      toast({
        title: 'Sucesso',
        description: 'Jogo removido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao remover jogo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o jogo'
      });
    }
  };

  const togglePlayerConfirmation = async (matchId: string, playerId: string): Promise<Game> => {
    try {
      const numericMatchId = parseInt(matchId);
      const match = matches.find(m => m.id === numericMatchId);
      if (!match) {
        throw new Error('Jogo não encontrado');
      }

      // Garante que selected_players seja sempre um array de números
      const currentSelected = Array.isArray(match.selected_players) 
        ? match.selected_players.map(Number)
        : [];

      const playerIdNumber = parseInt(playerId);
      const isPlayerConfirmed = currentSelected.includes(playerIdNumber);
      
      console.log('Estado atual:', {
        jogo: numericMatchId,
        jogadoresConfirmados: currentSelected,
        jogadorSelecionado: playerIdNumber,
        estaConfirmado: isPlayerConfirmed
      });

      // Remove ou adiciona o jogador
      const updatedPlayers = isPlayerConfirmed
        ? currentSelected.filter(id => id !== playerIdNumber)
        : [...currentSelected, playerIdNumber];

      console.log('Novo estado:', {
        jogo: numericMatchId,
        jogadoresConfirmados: updatedPlayers
      });

      // Atualiza o jogo no banco de dados
      const updatedGame = await gamesApi.update(numericMatchId, {
        selected_players: updatedPlayers
      });

      // Atualiza o estado local imediatamente
      setMatches(prevMatches => {
        const newMatches = prevMatches.map(m => 
          m.id === numericMatchId ? updatedGame : m
        );
        console.log('Estado dos jogos atualizado:', {
          jogo: numericMatchId,
          jogadoresConfirmados: updatedGame.selected_players
        });
        return newMatches;
      });

      // Atualiza o jogo atual se necessário
      if (currentGame?.id === numericMatchId) {
        setCurrentGame(updatedGame);
      }

      return updatedGame;
    } catch (error) {
      console.error('Erro ao confirmar/remover jogador:', error);
      throw error;
    }
  };

  const generateTeams = async (matchId: string): Promise<void> => {
    try {
      const match = matches.find(m => m.id === parseInt(matchId));
      if (!match) {
        throw new Error('Jogo não encontrado');
      }

      // Obter jogadores confirmados e converter para números
      const confirmedPlayerIds = Array.isArray(match.selected_players) 
        ? match.selected_players.map(Number)
        : [];

      if (confirmedPlayerIds.length < 4) {
        throw new Error('É necessário pelo menos 4 jogadores confirmados para gerar as equipas.');
      }

      const confirmedPlayers = players.filter(p => confirmedPlayerIds.includes(p.id));

      if (confirmedPlayers.length < 4) {
        throw new Error('Não foi possível encontrar todos os jogadores confirmados.');
      }

      // Separar goleiros e jogadores de campo
      const goalkeepers = confirmedPlayers.filter((player) => 
        Array.isArray(player.position) 
          ? player.position.includes('Guarda-Redes')
          : player.position === 'Guarda-Redes'
      );

      const fieldPlayers = confirmedPlayers.filter((player) => 
        Array.isArray(player.position) 
          ? !player.position.includes('Guarda-Redes')
          : player.position !== 'Guarda-Redes'
      );

      // Distribuir goleiros
      const teamA: number[] = [];
      const teamB: number[] = [];

      if (goalkeepers.length >= 2) {
        teamA.push(goalkeepers[0].id);
        teamB.push(goalkeepers[1].id);
      } else if (goalkeepers.length === 1) {
        teamA.push(goalkeepers[0].id);
      }

      // Distribuir jogadores de campo
      const shuffledFieldPlayers = [...fieldPlayers].sort(() => Math.random() - 0.5);
      const halfFieldPlayers = Math.floor(shuffledFieldPlayers.length / 2);

      shuffledFieldPlayers.forEach((player, index) => {
        if (index < halfFieldPlayers) {
          teamA.push(player.id);
        } else {
          teamB.push(player.id);
        }
      });

      // Atualizar o jogo no banco de dados primeiro
      const updateData = {
        teamA,
        teamB
      };

      const updatedGame = await gamesApi.update(matchId, updateData);
      
      // Criar as equipas no banco de dados
      const teamAData = {
        game_id: parseInt(matchId),
        name: 'Equipa A',
        players: teamA,
        score: 0,
        is_winner: false
      };

      const teamBData = {
        game_id: parseInt(matchId),
        name: 'Equipa B',
        players: teamB,
        score: 0,
        is_winner: false
      };

      try {
        // Criar as equipas
        await teamsApi.create(teamAData);
        await teamsApi.create(teamBData);
      } catch (error) {
        console.error('Erro ao criar equipas:', error);
        // Se houver erro ao criar as equipas, ainda mantemos a atualização do jogo
        // e lançamos um erro mais específico
        throw new Error('Erro ao salvar as equipas no banco de dados. O jogo foi atualizado, mas as equipas não foram salvas.');
      }

      // Atualizar o estado local
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === parseInt(matchId) 
            ? { ...m, teamA, teamB }
            : m
        )
      );

      console.log('Times gerados:', {
        teamA: teamA.map(id => players.find(p => p.id === id)?.name),
        teamB: teamB.map(id => players.find(p => p.id === id)?.name)
      });
    } catch (error) {
      console.error('Erro ao gerar times:', error);
      throw error;
    }
  };

  const deleteMatch = async (id: number) => {
    try {
      await gamesApi.delete(id);
      setMatches(prevMatches => prevMatches.filter(match => match.id !== id));
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      throw error;
    }
  };

  const value: MatchContextType = {
    matches,
    addMatch,
    updateMatch,
    removeMatch,
    togglePlayerConfirmation,
    generateTeams,
    isLoading,
    setCurrentGame: (game: Game) => setCurrentGame(game),
    refreshMatches: loadMatches,
    deleteMatch
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
}

export const useMatches = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
};
