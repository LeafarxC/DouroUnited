import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatches } from '@/context/MatchContext';
import { usePlayers } from '@/context/PlayerContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '@/components/layout/Layout';
import { Position } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { teamsApi, goalsApi } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Abreviações das posições
const positionAbbr: Record<Position, string> = {
  'Guarda-Redes': 'GR',
  'Defesa': 'DEF',
  'Meio-campo': 'MED',
  'Avançado': 'AV'
};

export default function History() {
  const { matches, deleteMatch } = useMatches();
  const { players } = usePlayers();
  const [teams, setTeams] = useState<Record<number, any>>({});
  const [goals, setGoals] = useState<Record<number, any[]>>({});

  // Carregar equipas e golos para cada jogo
  useEffect(() => {
    const loadData = async () => {
      const teamsData: Record<number, any> = {};
      const goalsData: Record<number, any[]> = {};
      
      for (const match of matches) {
        try {
          // Carregar equipas
          const matchTeams = await teamsApi.getByGameId(match.id);
          teamsData[match.id] = matchTeams;

          // Carregar golos
          const matchGoals = await goalsApi.getByGameId(match.id);
          goalsData[match.id] = matchGoals;
        } catch (error) {
          console.error(`Erro ao carregar dados do jogo ${match.id}:`, error);
        }
      }
      
      setTeams(teamsData);
      setGoals(goalsData);
    };

    loadData();
  }, [matches]);

  // Filtrar apenas jogos com resultado
  const completedMatches = matches.filter(match => 
    typeof match.scoreA === 'number' && 
    typeof match.scoreB === 'number' &&
    match.scoreA >= 0 &&
    match.scoreB >= 0
  ).sort((a, b) => {
    // Ordenar por data mais recente primeiro
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getTeamPlayers = (teamIds: number[]) => {
    if (!teamIds || teamIds.length === 0) return [];
    return players.filter(p => teamIds.includes(Number(p.id)));
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const handleDeleteMatch = async (id: number) => {
    try {
      await deleteMatch(id);
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
    }
  };

  return (
    <Layout title="Histórico de Jogos">
      <div className="space-y-6">
        {completedMatches.length === 0 ? (
          <Card className="bg-[#ffffff]">
            <CardContent className="flex items-center justify-center h-[calc(100vh-200px)]">
              <p className="text-lg text-gray-500">Nenhum jogo concluído encontrado</p>
            </CardContent>
          </Card>
        ) : (
          completedMatches.map(match => {
            const matchTeams = teams[match.id] || [];
            const matchGoals = goals[match.id] || [];
            const teamA = matchTeams.find((t: any) => t.name === 'Equipa A');
            const teamB = matchTeams.find((t: any) => t.name === 'Equipa B');
            
            const teamAPlayers = teamA ? getTeamPlayers(teamA.players) : [];
            const teamBPlayers = teamB ? getTeamPlayers(teamB.players) : [];

            const teamAGoals = matchGoals.filter((g: any) => g.team === 'A');
            const teamBGoals = matchGoals.filter((g: any) => g.team === 'B');

            return (
              <Card key={match.id} className="bg-[#ffffff]">
                <CardHeader className="relative">
                  <div className="absolute right-4 top-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Jogo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteMatch(match.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardTitle className="text-xl font-bold text-[#102e45]">
                    {match.title}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(match.date, match.time)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    {/* Placar */}
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-[#b89333]">Equipa A</span>
                        <div className="text-3xl font-bold text-[#b89333]">{match.scoreA}</div>
                      </div>
                      <div className="text-xl text-gray-500">x</div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-[#102e45]">Equipa B</span>
                        <div className="text-3xl font-bold text-[#102e45]">{match.scoreB}</div>
                      </div>
                    </div>

                    {/* Golos */}
                    {(teamAGoals.length > 0 || teamBGoals.length > 0) && (
                      <div className="w-full space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Golos Marcados</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Golos da Equipa A */}
                          <div className="space-y-2">
                            {teamAGoals.map((goal: any) => (
                              <div key={goal.id} className="flex items-center gap-2 p-2 bg-[#b89333]/5 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-[#b89333] flex items-center justify-center text-white text-sm">
                                  A
                                </div>
                                <span className="text-sm">
                                  {goal.player?.nickname || goal.player?.name || `Jogador ${goal.player_id}`}
                                </span>
                                {goal.minute && (
                                  <span className="text-sm text-gray-500 ml-auto">{goal.minute}'</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Golos da Equipa B */}
                          <div className="space-y-2">
                            {teamBGoals.map((goal: any) => (
                              <div key={goal.id} className="flex items-center gap-2 p-2 bg-[#102e45]/5 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-[#102e45] flex items-center justify-center text-white text-sm">
                                  B
                                </div>
                                <span className="text-sm">
                                  {goal.player?.nickname || goal.player?.name || `Jogador ${goal.player_id}`}
                                </span>
                                {goal.minute && (
                                  <span className="text-sm text-gray-500 ml-auto">{goal.minute}'</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Jogadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                      {/* Equipa A */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-[#b89333]">Jogadores da Equipa A</h3>
                        <div className="space-y-1">
                          {teamAPlayers.length > 0 ? (
                            teamAPlayers.map(player => (
                              <div key={player.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#b89333]/10 flex items-center justify-center text-xs font-medium text-[#b89333]">
                                  {positionAbbr[Array.isArray(player.position) ? player.position[0] : player.position]}
                                </div>
                                <span className="text-sm">{player.nickname || player.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum jogador registado</p>
                          )}
                        </div>
                      </div>

                      {/* Equipa B */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-[#102e45]">Jogadores da Equipa B</h3>
                        <div className="space-y-1">
                          {teamBPlayers.length > 0 ? (
                            teamBPlayers.map(player => (
                              <div key={player.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#102e45]/10 flex items-center justify-center text-xs font-medium text-[#102e45]">
                                  {positionAbbr[Array.isArray(player.position) ? player.position[0] : player.position]}
                                </div>
                                <span className="text-sm">{player.nickname || player.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum jogador registado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </Layout>
  );
} 