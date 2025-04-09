import React, { useEffect, useState } from 'react';
import { usePlayers } from '@/context/PlayerContext';
import { useMatches } from '@/context/MatchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';

interface PlayerStats {
  id: number;
  name: string;
  nickname?: string;
  position: string;
  goals: number;
  appearances: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  photo_url?: string;
}

export default function PlayerStats() {
  const { players } = usePlayers();
  const { matches } = useMatches();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  useEffect(() => {
    const calculateStats = () => {
      const stats: PlayerStats[] = players.map(player => {
        const playerMatches = matches.filter(match => 
          match.selected_players?.includes(player.id)
        );

        const completedMatches = playerMatches.filter(match => 
          match.scoreA !== null && match.scoreB !== null
        );

        const wins = completedMatches.filter(match => {
          const isTeamA = match.teamA?.includes(player.id);
          return (isTeamA && match.scoreA! > match.scoreB!) || 
                 (!isTeamA && match.scoreB! > match.scoreA!);
        }).length;

        const draws = completedMatches.filter(match => 
          match.scoreA === match.scoreB
        ).length;

        const losses = completedMatches.length - wins - draws;

        return {
          id: player.id,
          name: player.name,
          nickname: player.nickname,
          position: player.position[0],
          goals: player.goals_count || 0,
          appearances: playerMatches.length,
          wins,
          draws,
          losses,
          winRate: completedMatches.length > 0 
            ? Math.round((wins / completedMatches.length) * 100) 
            : 0,
          photo_url: player.photo_url || undefined
        };
      });

      setPlayerStats(stats);
    };

    calculateStats();
  }, [players, matches]);

  const sortedByGoals = [...playerStats].sort((a, b) => b.goals - a.goals);
  const sortedByAppearances = [...playerStats].sort((a, b) => b.appearances - a.appearances);
  const sortedByWinRate = [...playerStats].sort((a, b) => b.winRate - a.winRate);

  return (
    <Layout title="Estatísticas dos Jogadores">
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Artilheiros</TabsTrigger>
          <TabsTrigger value="appearances">Presenças</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Artilheiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="hidden sm:table-cell">Posição</TableHead>
                      <TableHead>Golos</TableHead>
                      <TableHead className="hidden sm:table-cell">Presenças</TableHead>
                      <TableHead className="hidden md:table-cell">Média de Golos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedByGoals.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={player.photo_url || ''} alt={player.name} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                                {player.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              {player.nickname && (
                                <div className="text-sm text-muted-foreground">{player.nickname}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">{player.goals}</TableCell>
                        <TableCell className="hidden sm:table-cell">{player.appearances}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {player.appearances > 0 
                            ? (player.goals / player.appearances).toFixed(2)
                            : '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearances">
          <Card>
            <CardHeader>
              <CardTitle>Presenças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="hidden sm:table-cell">Posição</TableHead>
                      <TableHead>Presenças</TableHead>
                      <TableHead className="hidden md:table-cell">Vitórias</TableHead>
                      <TableHead className="hidden md:table-cell">Empates</TableHead>
                      <TableHead className="hidden md:table-cell">Derrotas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedByAppearances.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={player.photo_url || ''} alt={player.name} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                                {player.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              {player.nickname && (
                                <div className="text-sm text-muted-foreground">{player.nickname}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">{player.appearances}</TableCell>
                        <TableCell className="hidden md:table-cell text-green-600">{player.wins}</TableCell>
                        <TableCell className="hidden md:table-cell text-yellow-600">{player.draws}</TableCell>
                        <TableCell className="hidden md:table-cell text-red-600">{player.losses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="hidden sm:table-cell">Posição</TableHead>
                      <TableHead>Taxa de Vitórias</TableHead>
                      <TableHead className="hidden md:table-cell">Vitórias</TableHead>
                      <TableHead className="hidden md:table-cell">Empates</TableHead>
                      <TableHead className="hidden md:table-cell">Derrotas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedByWinRate.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={player.photo_url || ''} alt={player.name} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                                {player.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              {player.nickname && (
                                <div className="text-sm text-muted-foreground">{player.nickname}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {player.winRate}%
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-green-600">{player.wins}</TableCell>
                        <TableCell className="hidden md:table-cell text-yellow-600">{player.draws}</TableCell>
                        <TableCell className="hidden md:table-cell text-red-600">{player.losses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
} 