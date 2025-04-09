import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlayerCard } from '@/components/players/PlayerCard';
import { useToast } from '@/hooks/use-toast';
import { gamesApi } from '@/lib/supabase';
import { Game, Player, Position } from '@/lib/supabase';
import { useMatches } from '@/context/MatchContext';
import { usePlayers } from '@/context/PlayerContext';
import { useNavigate } from 'react-router-dom';

interface TeamGeneratorProps {
  onTeamsGenerated?: () => void;
}

interface PlayerWithStats extends Player {
  total_games: number;
  games_attended: number;
  last_games: {
    id: number;
    date: string;
    attended: boolean;
  }[];
}

export default function TeamGenerator({ onTeamsGenerated }: TeamGeneratorProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null);
  const [teamA, setTeamA] = React.useState<PlayerWithStats[]>([]);
  const [teamB, setTeamB] = React.useState<PlayerWithStats[]>([]);
  const [teamsGenerated, setTeamsGenerated] = React.useState(false);
  
  const { matches, updateMatch, generateTeams } = useMatches();
  const { players } = usePlayers();

  const handleGenerateTeams = async () => {
    if (!selectedGame) {
      toast({
        title: 'Selecione um jogo',
        description: 'Por favor, selecione um jogo para gerar as equipas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Verificar se o jogo tem jogadores suficientes
      const game = matches.find(g => g.id.toString() === selectedGame);
      if (!game) {
        throw new Error('Jogo não encontrado');
      }

      if ((game.selected_players?.length || 0) < 4) {
        toast({
          title: 'Jogadores insuficientes',
          description: 'É necessário pelo menos 4 jogadores confirmados para gerar as equipas.',
          variant: 'destructive',
        });
        return;
      }

      // Gerar as equipes
      await generateTeams(selectedGame);
      
      // Buscar o jogo atualizado
      const updatedGame = matches.find(g => g.id.toString() === selectedGame);
      if (!updatedGame) {
        throw new Error('Jogo não encontrado após geração das equipas');
      }

      // Converter IDs para números antes de comparar, garantindo que são arrays
      const teamAIds = Array.isArray(updatedGame.teamA) ? updatedGame.teamA.map(Number) : [];
      const teamBIds = Array.isArray(updatedGame.teamB) ? updatedGame.teamB.map(Number) : [];

      // Obter os jogadores das equipes
      const teamAPlayers = players.filter(p => teamAIds.includes(p.id));
      const teamBPlayers = players.filter(p => teamBIds.includes(p.id));

      console.log('Times gerados:', {
        teamA: teamAPlayers.map(p => p.name),
        teamB: teamBPlayers.map(p => p.name)
      });

      // Atualizar o estado local com os jogadores
      setTeamA(teamAPlayers.map(player => ({
        ...player,
        total_games: 0,
        games_attended: 0,
        last_games: []
      })));

      setTeamB(teamBPlayers.map(player => ({
        ...player,
        total_games: 0,
        games_attended: 0,
        last_games: []
      })));

      setTeamsGenerated(true);
      toast({
        title: 'Equipas geradas',
        description: 'As equipas foram geradas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao gerar equipas:', error);
      toast({
        title: 'Erro ao gerar equipas',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao gerar as equipas.',
        variant: 'destructive',
      });
    }
  };

  // Adicionar useEffect para atualizar os times quando o jogo selecionado mudar
  React.useEffect(() => {
    if (selectedGame) {
      const game = matches.find(g => g.id.toString() === selectedGame);
      if (game) {
        // Converter IDs para números antes de comparar, garantindo que são arrays
        const teamAIds = Array.isArray(game.teamA) ? game.teamA.map(Number) : [];
        const teamBIds = Array.isArray(game.teamB) ? game.teamB.map(Number) : [];
        
        // Só atualizar os times se houver jogadores
        if (teamAIds.length > 0 || teamBIds.length > 0) {
          const teamAPlayers = players.filter(p => teamAIds.includes(p.id));
          const teamBPlayers = players.filter(p => teamBIds.includes(p.id));

          setTeamA(teamAPlayers.map(player => ({
            ...player,
            total_games: 0,
            games_attended: 0,
            last_games: []
          })));

          setTeamB(teamBPlayers.map(player => ({
            ...player,
            total_games: 0,
            games_attended: 0,
            last_games: []
          })));

          setTeamsGenerated(true);
        }
      }
    }
  }, [selectedGame, matches, players]);

  const handleConfirmTeams = async () => {
    if (!selectedGame || !teamA.length || !teamB.length) return;

    try {
      const game = matches.find(g => g.id.toString() === selectedGame);
      if (!game) throw new Error('Jogo não encontrado');

      const updateData = {
        title: game.title,
        date: game.date,
        time: game.time,
        location: game.location,
        is_confirmed: true,
        selected_players: game.selected_players,
        teamA: teamA.map(player => player.id),
        teamB: teamB.map(player => player.id)
      };
      
      // Atualizar no banco de dados
      await gamesApi.update(parseInt(selectedGame), updateData);
      
      // Atualizar o estado global dos jogos
      await updateMatch(selectedGame, updateData);
      
      toast({
        title: 'Equipas confirmadas!',
        description: 'As equipas foram salvas com sucesso.',
      });

      // Resetar o estado local
      setSelectedGame(null);
      setTeamA([]);
      setTeamB([]);
      setTeamsGenerated(false);

      // Chamar o callback se existir
      onTeamsGenerated?.();

      // Redirecionar para a página de detalhes do jogo
      navigate(`/matches/${selectedGame}`);
    } catch (error) {
      console.error('Erro ao salvar equipas:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as equipas. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateTeams = async () => {
    if (!selectedGame) return;

    try {
      // Verificar se o jogo tem jogadores suficientes
      const game = matches.find(g => g.id.toString() === selectedGame);
      if (!game) {
        throw new Error('Jogo não encontrado');
      }

      if ((game.selected_players?.length || 0) < 4) {
        toast({
          title: 'Jogadores insuficientes',
          description: 'É necessário pelo menos 4 jogadores confirmados para gerar as equipas.',
          variant: 'destructive',
        });
        return;
      }

      // Gerar as equipes novamente
      await generateTeams(selectedGame);
      
      // Buscar o jogo atualizado
      const updatedGame = matches.find(g => g.id.toString() === selectedGame);
      if (!updatedGame) {
        throw new Error('Jogo não encontrado após geração das equipas');
      }

      // Obter os jogadores das equipes
      const teamAIds = Array.isArray(updatedGame.teamA) ? updatedGame.teamA.map(Number) : [];
      const teamBIds = Array.isArray(updatedGame.teamB) ? updatedGame.teamB.map(Number) : [];
      
      const teamAPlayers = players.filter(p => teamAIds.includes(p.id));
      const teamBPlayers = players.filter(p => teamBIds.includes(p.id));

      console.log('Times regenerados:', {
        teamA: teamAPlayers.map(p => p.name),
        teamB: teamBPlayers.map(p => p.name)
      });

      // Atualizar o estado local com os jogadores
      setTeamA(teamAPlayers.map(player => ({
        ...player,
        total_games: 0,
        games_attended: 0,
        last_games: []
      })));

      setTeamB(teamBPlayers.map(player => ({
        ...player,
        total_games: 0,
        games_attended: 0,
        last_games: []
      })));

      setTeamsGenerated(true);
      toast({
        title: 'Equipas regeneradas',
        description: 'As equipas foram geradas novamente com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao regenerar equipas:', error);
      toast({
        title: 'Erro ao regenerar equipas',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao regenerar as equipas.',
        variant: 'destructive',
      });
    }
  };

  // Formatar data para exibição
  const formatGameDate = (date: string, time: string) => {
    const gameDate = new Date(`${date}T${time}`);
    return format(gameDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  // Filtrar jogos futuros que têm jogadores confirmados
  const availableGames = matches
    .filter(game => {
      // Verificar se o jogo tem jogadores confirmados
      const hasConfirmedPlayers = (game.selected_players?.length || 0) >= 4;
      
      // Verificar se o jogo é no futuro
      const gameDate = new Date(game.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFutureGame = gameDate >= today;
      
      return hasConfirmedPlayers && isFutureGame;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <Card className="bg-[#ffffff]">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#102e45] mb-4">Gerar Equipas</h3>
              <p className="text-lg text-gray-600">
                Selecione um jogo para gerar as equipas automaticamente.
              </p>
            </div>

            <div className="space-y-4">
              <Select
                value={selectedGame || ''}
                onValueChange={(value) => {
                  setSelectedGame(value);
                  setTeamsGenerated(false);
                  setTeamA([]);
                  setTeamB([]);
                }}
                disabled={false}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Selecione um jogo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableGames.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{game.title}</span>
                        <span className="text-sm text-gray-500">
                          {formatGameDate(game.date, game.time)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {game.selected_players?.length || 0} jogadores confirmados
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!teamsGenerated ? (
                <Button 
                  onClick={handleGenerateTeams}
                  disabled={!selectedGame}
                  className="w-full h-12 text-lg"
                >
                  Gerar Equipas
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button 
                    onClick={handleRegenerateTeams}
                    variant="outline"
                    className="flex-1 h-12 text-lg"
                  >
                    Gerar Novamente
                  </Button>
                  <Button 
                    onClick={handleConfirmTeams}
                    className="flex-1 h-12 text-lg"
                  >
                    Confirmar Equipas
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {teamsGenerated && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Time A */}
          <Card className="bg-[#ffffff]">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-[#b89333] mb-4">Equipa A</h4>
              <div className="space-y-4">
                {teamA.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 rounded-lg border border-[#b89333]/20 bg-[#b89333]/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#b89333]">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time B */}
          <Card className="bg-[#ffffff]">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-[#102e45] mb-4">Equipa B</h4>
              <div className="space-y-4">
                {teamB.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 rounded-lg border border-[#102e45]/20 bg-[#102e45]/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#102e45]">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
