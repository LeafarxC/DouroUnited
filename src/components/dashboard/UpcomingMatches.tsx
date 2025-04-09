import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMatches } from '@/context/MatchContext';
import { usePlayers } from '@/context/PlayerContext';
import { Game, Player, Position } from '@/lib/supabase';

const UpcomingMatches: React.FC = () => {
  const { matches } = useMatches();
  const { players } = usePlayers();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today;
  });

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const getPlayerNames = (playerIds: number[]) => {
    const confirmedPlayers = players.filter(p => playerIds.includes(p.id));
    if (confirmedPlayers.length === 0) return 'Nenhum jogador confirmado';
    if (confirmedPlayers.length === 1) return confirmedPlayers[0].name;
    if (confirmedPlayers.length === 2) return `${confirmedPlayers[0].name} e ${confirmedPlayers[1].name}`;
    return `${confirmedPlayers[0].name}, ${confirmedPlayers[1].name} e mais ${confirmedPlayers.length - 2}`;
  };

  // Obter detalhes das equipes
  const getTeamDetails = (match: Game) => {
    if (!match.teamA?.length || !match.teamB?.length) return null;

    const teamAPlayers = players.filter(p => match.teamA.includes(p.id));
    const teamBPlayers = players.filter(p => match.teamB.includes(p.id));

    const teamAGoalkeepers = teamAPlayers.filter(p => 
      Array.isArray(p.position) && p.position.includes('Guarda-Redes')
    ).length;
    const teamBGoalkeepers = teamBPlayers.filter(p => 
      Array.isArray(p.position) && p.position.includes('Guarda-Redes')
    ).length;

    return {
      teamA: {
        total: teamAPlayers.length,
        goalkeepers: teamAGoalkeepers,
        fieldPlayers: teamAPlayers.length - teamAGoalkeepers,
        score: match.scoreA || 0
      },
      teamB: {
        total: teamBPlayers.length,
        goalkeepers: teamBGoalkeepers,
        fieldPlayers: teamBPlayers.length - teamBGoalkeepers,
        score: match.scoreB || 0
      }
    };
  };

  if (upcomingMatches.length === 0) {
    return (
      <Card className="bg-[#ffffff]">
        <CardHeader>
          <CardTitle className="text-[#102e45]">Próximos Jogos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Não há jogos agendados.</p>
            <Link to="/matches">
              <Button>Agendar um Jogo</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#ffffff]">
      <CardHeader>
        <CardTitle className="text-[#102e45]">Próximos Jogos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMatches.map(match => {
          const validPlayerIds = match.selected_players?.map(Number) || [];
          const teamDetails = getTeamDetails(match);
          
          return (
            <Link 
              key={match.id} 
              to={`/matches/${match.id}`}
              className="block hover:no-underline"
            >
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-lg mb-2 text-[#102e45]">{match.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#b89333]" />
                    <span>{formatDateTime(match.date, match.time)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-[#b89333]" />
                    <span>{match.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-[#b89333]" />
                    <span>
                      {validPlayerIds.length > 0 
                        ? getPlayerNames(validPlayerIds)
                        : 'Nenhum jogador confirmado'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="bg-[#102e45]/10 px-3 py-1 rounded-full text-xs text-[#102e45]">
                    {validPlayerIds.length} {validPlayerIds.length === 1 ? 'jogador' : 'jogadores'} confirmados
                  </div>
                  
                  {teamDetails && (
                    <div className="flex gap-2">
                      <div className="bg-[#b89333]/20 text-[#b89333] px-3 py-1 rounded-full text-xs flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        Equipa A ({teamDetails.teamA.total})
                        {typeof teamDetails.teamA.score === 'number' && (
                          <span className="ml-1 font-bold">{teamDetails.teamA.score}</span>
                        )}
                      </div>
                      <div className="bg-[#102e45]/20 text-[#102e45] px-3 py-1 rounded-full text-xs flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        Equipa B ({teamDetails.teamB.total})
                        {typeof teamDetails.teamB.score === 'number' && (
                          <span className="ml-1 font-bold">{teamDetails.teamB.score}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        
        <div className="text-center pt-2">
          <Link to="/matches">
            <Button variant="outline">Ver Todos os Jogos</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatches;
