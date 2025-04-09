import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, X, Check, Share2, MessageSquare } from 'lucide-react';
import { Game, Player, gamesApi, Team, teamsApi } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useMatches } from '@/context/MatchContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GameForm, GameFormData } from './GameForm';

interface GameDetailsProps {
  game: Game;
  players: Player[];
  onClose: () => void;
}

const positionColors: Record<string, string> = {
  'Guarda-Redes': 'bg-green-100',
  'Defesa': 'bg-blue-100',
  'Meio-campo': 'bg-yellow-100',
  'Avançado': 'bg-red-100',
};

const positionAbbreviations: Record<string, string> = {
  'Guarda-Redes': 'GR',
  'Defesa': 'DEF',
  'Meio-campo': 'MED',
  'Avançado': 'ATA',
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).toLowerCase();
  } catch (error) {
    return dateStr;
  }
};

export function GameDetails({ game, players, onClose }: GameDetailsProps) {
  const { toast } = useToast();
  const { updateMatch, togglePlayerConfirmation, matches, setCurrentGame, refreshMatches } = useMatches();
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editedGame, setEditedGame] = useState({
    title: game.title,
    date: game.date,
    time: game.time,
    location: game.location,
    selected_players: game.selected_players || []
  });
  
  // Link fixo do grupo do WhatsApp
  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/D47IQw1tgryCfPR0raAnLt";

  // Busca o jogo mais atualizado do contexto
  const currentGame = matches.find(m => m.id === game.id) || game;
  
  // Calcula o número de jogadores confirmados
  const confirmedPlayersCount = Array.isArray(currentGame.selected_players) 
    ? currentGame.selected_players.length 
    : 0;

  // Função para verificar se um jogador está confirmado
  const isPlayerConfirmed = (playerId: string | number) => {
    const playerIdNumber = Number(playerId);
    const isConfirmed = Array.isArray(currentGame.selected_players) && 
                       currentGame.selected_players.map(Number).includes(playerIdNumber);
    console.log('Verificando confirmação:', {
      jogador: playerIdNumber,
      confirmado: isConfirmed,
      jogadoresConfirmados: currentGame.selected_players
    });
    return isConfirmed;
  };

  const handlePlayerSelection = async (playerId: string) => {
    try {
      const playerIdNumber = Number(playerId);
      const playerName = players.find(p => p.id === playerIdNumber)?.name;
      const wasConfirmed = isPlayerConfirmed(playerIdNumber);

      await togglePlayerConfirmation(game.id.toString(), playerIdNumber);

      toast({
        title: wasConfirmed ? 'Jogador removido' : 'Jogador confirmado',
        description: wasConfirmed 
          ? `${playerName} foi removido do jogo.` 
          : `${playerName} foi confirmado para o jogo.`,
      });
    } catch (error) {
      console.error('Erro ao confirmar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar o jogador. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Atualiza os dados quando o componente é montado
  useEffect(() => {
    const loadInitialData = async () => {
      await refreshMatches();
      const updatedGame = matches.find(m => m.id === game.id);
      if (updatedGame) {
        console.log('Jogo atualizado:', {
          id: updatedGame.id,
          jogadoresConfirmados: updatedGame.selected_players
        });
        setCurrentGame(updatedGame);
      }
    };
    loadInitialData();
  }, []);

  // Atualiza o estado local quando o jogo muda
  useEffect(() => {
    if (currentGame) {
      console.log('Estado atual do jogo:', {
        id: currentGame.id,
        jogadoresConfirmados: currentGame.selected_players
      });
      setEditedGame({
        title: currentGame.title,
        date: currentGame.date,
        time: currentGame.time,
        location: currentGame.location,
        selected_players: Array.isArray(currentGame.selected_players) 
          ? [...currentGame.selected_players]
          : []
      });
    }
  }, [currentGame]);

  // Carregar as equipas do jogo
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const gameTeams = await teamsApi.getByGame(game.id);
        setTeams(gameTeams);
      } catch (error) {
        console.error('Erro ao carregar equipas:', error);
      }
    };

    loadTeams();
  }, [game.id]);

  // Estilos para jogadores confirmados
  const playerCardStyles = (isSelected: boolean) => `
    flex items-center justify-between p-4 rounded-lg border transition-all duration-200
    ${isSelected 
      ? 'border-green-500 bg-green-50 shadow-sm' 
      : 'border-gray-200 bg-white hover:border-gray-300'
    }
  `;

  const playerAvatarStyles = (isSelected: boolean) => `
    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
    ${isSelected 
      ? 'bg-green-500 text-white' 
      : 'bg-gray-100 text-gray-600'
    }
  `;

  const playerNameStyles = (isSelected: boolean) => `
    font-medium transition-colors ${isSelected ? 'text-green-700' : 'text-gray-900'}
  `;

  const confirmButtonStyles = (isSelected: boolean) => `
    transition-all duration-200
    ${isSelected 
      ? 'bg-green-500 text-white hover:bg-green-600 cursor-not-allowed' 
      : 'hover:border-green-500 hover:text-green-500'
    }
  `;

  const handleSaveEdit = async (data: GameFormData) => {
    try {
      const gameId = game.id.toString();
      const updatedGame = await updateMatch(gameId, {
        ...data,
        selected_players: currentGame.selected_players || []
      });

      setEditedGame({
        title: updatedGame.title,
        date: updatedGame.date,
        time: updatedGame.time,
        location: updatedGame.location,
        selected_players: updatedGame.selected_players || []
      });

      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Jogo atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jogo.",
        variant: "destructive"
      });
    }
  };

  const formatMessage = () => {
    const selectedPlayers = players.filter(player => currentGame.selected_players?.includes(player.id.toString()));
    const goalkeepers = selectedPlayers.filter(p => p.position.includes('Guarda-Redes'));
    const fieldPlayers = selectedPlayers.filter(p => !p.position.includes('Guarda-Redes'));
    
    return `*${currentGame.title}*\n\n` +
      `Data: ${formatDate(currentGame.date)}\n` +
      `Hora: ${currentGame.time}\n` +
      `Local: ${currentGame.location}\n\n` +
      `*Jogadores Confirmados (${selectedPlayers.length})*\n\n` +
      `*Guarda-Redes (${goalkeepers.length})*\n` +
      goalkeepers.map(p => `• ${p.name}`).join('\n') + '\n\n' +
      `*Jogadores de Campo (${fieldPlayers.length})*\n` +
      fieldPlayers.map(p => `• ${p.name}`).join('\n');
  };

  const handleShareWhatsApp = () => {
    const selectedPlayers = players.filter(player => currentGame.selected_players?.includes(player.id.toString()));
    const message = `${currentGame.title}\n\n` +
      `Data: ${format(new Date(currentGame.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}\n` +
      `Hora: ${currentGame.time}\n` +
      `Local: ${currentGame.location}\n\n` +
      `Jogadores confirmados: ${selectedPlayers.length}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              {currentGame.title}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
              Partilhar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações do Jogo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(currentGame.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{currentGame.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{currentGame.location}</span>
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">
                Jogadores ({players.filter(p => p.is_active).length}) - Confirmados: {confirmedPlayersCount}
              </h3>
              {confirmedPlayersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const updatedGame = await updateMatch(currentGame.id.toString(), {
                        is_confirmed: true,
                        selected_players: currentGame.selected_players
                      });
                      setCurrentGame(updatedGame);

                      toast({
                        title: "Sucesso",
                        description: `Jogo confirmado com ${confirmedPlayersCount} jogadores!`
                      });
                      onClose();
                    } catch (error) {
                      console.error('Erro ao confirmar jogo:', error);
                      toast({
                        title: "Erro",
                        description: "Não foi possível confirmar o jogo.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirmar Jogo
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.filter(p => p.is_active).map(player => {
                const isSelected = isPlayerConfirmed(player.id);
                console.log('Renderizando jogador:', {
                  id: player.id,
                  nome: player.name,
                  confirmado: isSelected
                });
                
                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                      isSelected 
                        ? "border-green-500 bg-green-50 shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        isSelected 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {Array.isArray(player.position) && player.position.length > 0 
                          ? positionAbbreviations[player.position[0]]
                          : ''}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected ? "text-green-700" : "text-gray-900"
                        )}>
                          {player.name}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {Array.isArray(player.position) && player.position.map((pos) => (
                            <span 
                              key={pos} 
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs",
                                isSelected ? "bg-green-100 text-green-800" : positionColors[pos]
                              )}
                            >
                              {positionAbbreviations[pos]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlayerSelection(player.id.toString())}
                      className={cn(
                        "transition-all duration-200",
                        isSelected 
                          ? "bg-green-500 text-white hover:bg-red-500" 
                          : "hover:border-green-500 hover:text-green-500"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          <span className="text-xs">Remover</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          <span className="text-xs">Confirmar</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção de Equipas */}
          {teams.length > 0 && (
            <Card className="bg-[#ffffff]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#102e45]">Equipas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <div key={team.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{team.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium">Pontuação: {team.score}</span>
                          {team.is_winner && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              Vencedor
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {team.players.map((playerId) => {
                          const player = players.find(p => p.id === playerId);
                          if (!player) return null;
                          return (
                            <div key={playerId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                                positionColors[player.position[0]]
                              )}>
                                {positionAbbreviations[player.position[0]]}
                              </div>
                              <span className="font-medium">{player.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isEditing && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-game-description">
                <DialogHeader>
                  <DialogTitle>Editar Jogo</DialogTitle>
                  <p id="edit-game-description" className="text-sm text-gray-500">
                    Atualize os dados do jogo abaixo.
                  </p>
                </DialogHeader>
                <GameForm
                  onSubmit={handleSaveEdit}
                  onCancel={() => setIsEditing(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 