import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import UpcomingMatches from '../components/dashboard/UpcomingMatches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayers } from '../context/PlayerContext';
import { useMatches } from '../context/MatchContext';
import { Users, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { teamsApi } from '@/lib/supabase';

const Index = () => {
  const { players, isLoading: playersLoading } = usePlayers();
  const { matches, isLoading: matchesLoading } = useMatches();
  const [teams, setTeams] = useState<Record<number, any>>({});
  
  // Carregar equipas para cada jogo
  useEffect(() => {
    const loadTeams = async () => {
      const teamsData: Record<number, any> = {};
      for (const match of matches) {
        try {
          const matchTeams = await teamsApi.getByGameId(match.id);
          teamsData[match.id] = matchTeams;
        } catch (error) {
          console.error(`Erro ao carregar equipas do jogo ${match.id}:`, error);
        }
      }
      setTeams(teamsData);
    };

    loadTeams();
  }, [matches]);
  
  // Estatísticas dos jogadores
  const activePlayers = players.filter(player => player.is_active).length;
  const goalkeepers = players.filter(player => player.position === 'Guarda-Redes').length;
  const fieldPlayers = players.filter(player => player.position === 'Campo').length;
  
  // Estatísticas dos jogos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today;
  });

  const completedMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate < today;
  });

  // Estatísticas das equipes
  const gamesWithTeams = matches.filter(match => {
    const matchTeams = teams[match.id] || [];
    return matchTeams.length > 0;
  });

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM", { locale: ptBR });
  };

  if (playersLoading || matchesLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-lg text-gray-500">Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Estatísticas dos Jogadores */}
        <Card className="bg-[#ffffff]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#102e45]">Jogadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-[#b89333] mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-[#102e45]">{players.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{activePlayers} ativos</p>
                  <p className="text-sm font-medium text-gray-600">{players.length - activePlayers} inativos</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{goalkeepers} guarda-redes</span>
                <span>{fieldPlayers} jogadores de campo</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Estatísticas dos Jogos */}
        <Card className="bg-[#ffffff]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#102e45]">Jogos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-[#b89333] mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-[#102e45]">{matches.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{upcomingMatches.length} agendados</p>
                  <p className="text-sm font-medium text-gray-600">{completedMatches.length} realizados</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {upcomingMatches[0] && (
                    <Link 
                      to={`/matches/${upcomingMatches[0].id}`}
                      className="hover:text-[#b89333] transition-colors"
                    >
                      Próximo: {formatDate(upcomingMatches[0].date)}
                    </Link>
                  )}
                </span>
                <span>
                  {upcomingMatches[0] && (
                    <span>
                      {upcomingMatches[0].selected_players?.length || 0} jogadores confirmados
                    </span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Estatísticas das Equipas */}
        <Card className="bg-[#ffffff]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#102e45]">Equipas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-[#b89333] mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-[#102e45]">{gamesWithTeams.length}</p>
                    <p className="text-sm text-gray-600">Equipas Formadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#b89333]">
                    {gamesWithTeams.length > 0 ? `${gamesWithTeams.length} jogos com equipas` : 'Nenhuma equipa formada'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {gamesWithTeams.length > 0 && (
                    <Link 
                      to={`/matches/${gamesWithTeams[gamesWithTeams.length - 1].id}`}
                      className="hover:text-[#b89333] transition-colors"
                    >
                      Último jogo com equipas: {formatDate(gamesWithTeams[gamesWithTeams.length - 1].date)}
                    </Link>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UpcomingMatches />
        </div>
        
        <div>
          <Card className="bg-[#ffffff]">
            <CardHeader>
              <CardTitle className="text-[#102e45]">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/players" className="block">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#b89333]" />
                    <h3 className="font-medium text-[#102e45]">Gerir Jogadores</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Adicionar ou editar jogadores</p>
                </div>
              </Link>
              
              <Link to="/matches" className="block">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-[#b89333]" />
                    <h3 className="font-medium text-[#102e45]">Agendar Jogo</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Criar um novo jogo</p>
                </div>
              </Link>
              
              <Link to="/team-builder" className="block">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-[#b89333]" />
                    <h3 className="font-medium text-[#102e45]">Gerar Equipas</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Criar equipas aleatórias</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
