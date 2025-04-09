import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FootballField from '@/components/games/FootballField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatches } from '@/context/MatchContext';
import { usePlayers } from '@/context/PlayerContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, Users, Clock, Trophy, ChevronLeft } from 'lucide-react';
import { Position, Game, Player, Team } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { gamesApi, teamsApi } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import TeamGenerator from '@/components/games/TeamGenerator';
import { GoalRegistration } from '@/components/games/GoalRegistration';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Ordem de prioridade das posições para cada equipa
const teamAPriority: Position[] = ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'];
const teamBPriority: Position[] = ['Guarda-Redes', 'Avançado', 'Meio-campo', 'Defesa'];

// Função para determinar a posição principal do jogador baseado na equipa
const getMainPosition = (positions: Position[], isTeamA: boolean): Position => {
  const priority = isTeamA ? teamAPriority : teamBPriority;
  for (const pos of priority) {
    if (positions.includes(pos)) {
      return pos;
    }
  }
  return positions[0];
};

// Abreviações das posições
const positionAbbr: Record<Position, string> = {
  'Guarda-Redes': 'GR',
  'Defesa': 'DEF',
  'Meio-campo': 'MED',
  'Avançado': 'AV'
};

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches } = useMatches();
  const { players } = usePlayers();
  const [match, setMatch] = useState<Game | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [showTeamGenerator, setShowTeamGenerator] = useState(false);

  useEffect(() => {
    if (id) {
      const foundMatch = matches.find(m => m.id === parseInt(id));
      if (foundMatch) {
        setMatch(foundMatch);
        loadTeams(foundMatch.id);
      }
    }
  }, [id, matches]);

  const loadTeams = async (gameId: number) => {
    try {
      const teams = await teamsApi.getByGameId(gameId);
      if (teams && teams.length >= 2) {
        setTeamA(teams[0]);
        setTeamB(teams[1]);
      }
    } catch (error) {
      console.error('Erro ao carregar equipas:', error);
    }
  };

  if (!match) {
    return (
      <Layout title="Detalhes do Jogo">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-lg text-gray-500">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhes do Jogo">
      <div className="space-y-4 md:space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-[#102e45] hover:text-[#b89333]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Badge variant="outline" className="bg-[#b89333]/10 text-[#b89333] border-[#b89333]">
            {format(new Date(match.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </Badge>
        </div>

        {/* Informações do Jogo */}
        <Card className="bg-[#ffffff]">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-[#102e45]">{match.title}</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(match.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {match.time}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {match.location}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="field" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="field">Campo</TabsTrigger>
            <TabsTrigger value="teams">Equipas</TabsTrigger>
            <TabsTrigger value="goals">Golos</TabsTrigger>
          </TabsList>

          <TabsContent value="field">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="overflow-x-auto">
                  <FootballField
                    teamA={teamA?.players || []}
                    teamB={teamB?.players || []}
                    teamAScore={teamA?.score || 0}
                    teamBScore={teamB?.score || 0}
                    onScoreChange={async (scoreA, scoreB) => {
                      try {
                        await gamesApi.update(match.id, { scoreA, scoreB });
                        setMatch({ ...match, scoreA, scoreB });
                        toast({
                          title: "Placar atualizado",
                          description: "O placar do jogo foi atualizado com sucesso.",
                        });
                      } catch (error) {
                        toast({
                          title: "Erro",
                          description: "Não foi possível atualizar o placar.",
                          variant: "destructive",
                        });
                      }
                    }}
                    fullWidth
                    showScoreboard
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setShowTeamGenerator(true)}
                      className="bg-[#b89333] hover:bg-[#a5822d] text-white w-full sm:w-auto"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gerar Equipas
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Equipa A</h3>
                      <div className="space-y-2">
                        {teamA?.players.map(playerId => {
                          const player = players.find(p => p.id === playerId);
                          return player ? (
                            <div key={player.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <Avatar>
                                <AvatarImage src={player.photo_url || ''} alt={player.name} />
                                <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                                  {player.name[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                {player.nickname && (
                                  <div className="text-sm text-gray-500">{player.nickname}</div>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Equipa B</h3>
                      <div className="space-y-2">
                        {teamB?.players.map(playerId => {
                          const player = players.find(p => p.id === playerId);
                          return player ? (
                            <div key={player.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <Avatar>
                                <AvatarImage src={player.photo_url || ''} alt={player.name} />
                                <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                                  {player.name[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                {player.nickname && (
                                  <div className="text-sm text-gray-500">{player.nickname}</div>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardContent className="p-4 md:p-6">
                <GoalRegistration 
                  gameId={match.id} 
                  teamAPlayers={teamA?.players.map(playerId => players.find(p => p.id === playerId)).filter(Boolean) as Player[] || []}
                  teamBPlayers={teamB?.players.map(playerId => players.find(p => p.id === playerId)).filter(Boolean) as Player[] || []}
                  onGoalScored={() => loadTeams(match.id)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Geração de Equipas */}
        <Dialog open={showTeamGenerator} onOpenChange={setShowTeamGenerator}>
          <DialogContent className="sm:max-w-[600px] w-[90%]">
            <DialogHeader>
              <DialogTitle>Gerar Equipas</DialogTitle>
              <DialogDescription>
                Selecione os jogadores e gere as equipas automaticamente.
              </DialogDescription>
            </DialogHeader>
            <TeamGenerator
              gameId={match.id}
              onTeamsGenerated={() => {
                setShowTeamGenerator(false);
                loadTeams(match.id);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 