import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player, Game, playersApi, gamesApi } from '@/lib/supabase';
import { Users, Calendar, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [playersData, gamesData] = await Promise.all([
        playersApi.list(),
        gamesApi.list()
      ]);
      setPlayers(playersData || []);
      setGames(gamesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setPlayers([]);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activePlayers = players.filter(player => player.is_active).length;
  const totalPlayers = players.length;
  const scheduledGames = games.length;

  return (
    <Layout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jogadores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : activePlayers}</div>
            <p className="text-xs text-muted-foreground">
              de {isLoading ? '...' : totalPlayers} jogadores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos Jogos
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : scheduledGames}</div>
            <p className="text-xs text-muted-foreground">
              jogos agendados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipas Geradas
            </CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              equipas formadas
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 