import React, { useState, useEffect } from 'react';
import { Player, Goal, goalsApi } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

interface GoalRegistrationProps {
  gameId: number;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  onGoalScored: (team: 'A' | 'B') => void;
}

export function GoalRegistration({ gameId, teamAPlayers, teamBPlayers, onGoalScored }: GoalRegistrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [minute, setMinute] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticação ao carregar o componente
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // Carregar golos existentes
    loadGoals();
  }, [gameId]);

  const loadGoals = async () => {
    try {
      const goalsData = await goalsApi.getByGameId(gameId);
      setGoals(goalsData);
    } catch (error) {
      console.error('Erro ao carregar golos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os golos.',
        variant: 'destructive',
      });
    }
  };

  const handleAddGoal = async () => {
    if (!selectedPlayer || !selectedTeam) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione o jogador e o time.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const playerId = parseInt(selectedPlayer);
      const selectedPlayers = selectedTeam === 'A' ? teamAPlayers : teamBPlayers;
      
      const player = selectedPlayers.find(p => p.id === playerId);

      if (!player) {
        toast({
          title: 'Erro',
          description: 'Jogador selecionado não encontrado na lista de jogadores.',
          variant: 'destructive',
        });
        return;
      }

      const goalData = {
        game_id: gameId,
        player_id: playerId,
        team: selectedTeam,
        minute: minute ? parseInt(minute) : undefined,
      };

      const result = await goalsApi.create(goalData);
      onGoalScored(selectedTeam);
      await loadGoals();
      
      setSelectedPlayer('');
      setMinute('');
      setIsOpen(false);

      toast({
        title: 'Golo Registrado!',
        description: `Golo marcado por ${player.nickname || player.name}!`,
      });
    } catch (error: any) {
      console.error('Erro ao registrar golo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível registrar o golo.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await goalsApi.delete(goalId);
      await loadGoals();
      toast({
        title: 'Golo Removido',
        description: 'O golo foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao remover golo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o golo.',
        variant: 'destructive',
      });
    }
  };

  const getPlayerName = (player: Player) => {
    return player.nickname || player.name;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Golos da Partida</h3>
        <Button onClick={() => setIsOpen(true)}>
          Registrar Golo
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                  goal.team === 'A' ? 'bg-[#b89333]' : 'bg-[#102e45]'
                }`}>
                  {goal.team}
                </div>
                <span className="font-medium">
                  {goal.player?.nickname || goal.player?.name || `Jogador ${goal.player_id}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {goal.minute && (
                  <span className="text-sm text-gray-500">{goal.minute}'</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Golo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select
                value={selectedTeam}
                onValueChange={(value: 'A' | 'B') => setSelectedTeam(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Time A</SelectItem>
                  <SelectItem value="B">Time B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jogador</label>
              <Select
                value={selectedPlayer}
                onValueChange={setSelectedPlayer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o jogador" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedTeam === 'A' ? teamAPlayers : teamBPlayers).map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {getPlayerName(player)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minuto do Golo (opcional)</label>
              <Input
                type="number"
                min="0"
                max="90"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="Ex: 23"
              />
            </div>

            <Button onClick={handleAddGoal} className="w-full">
              Registrar Golo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 