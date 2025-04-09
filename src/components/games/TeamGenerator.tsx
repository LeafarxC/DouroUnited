import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Player, Position } from '@/lib/supabase';
import { gamesApi, teamsApi } from '@/lib/supabase';
import { useMatches } from '@/context/MatchContext';

interface TeamGeneratorProps {
  confirmedPlayers: Player[];
  currentGame: any;
}

// Função para calcular a pontuação de um jogador
const calculatePlayerScore = (player: Player): number => {
  // Implemente sua lógica de pontuação aqui
  return Math.random(); // Simplificado para exemplo
};

// Função para gerar equipas balanceadas
const generateBalancedTeams = (players: Player[]) => {
  // Ordenar jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => calculatePlayerScore(b) - calculatePlayerScore(a));
  
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  
  // Distribuir jogadores alternadamente
  sortedPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }
  });
  
  return { teamA, teamB };
};

export default function TeamGenerator({ confirmedPlayers, currentGame }: TeamGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateMatch } = useMatches();

  const handleGenerateTeams = async () => {
    if (!currentGame) return;

    try {
      setIsGenerating(true);
      console.log('Gerando equipas para o jogo:', currentGame.id);

      // Gerar as equipas
      const { teamA, teamB } = generateBalancedTeams(confirmedPlayers);
      console.log('Equipas geradas:', { teamA, teamB });

      // Converter os jogadores em arrays de IDs
      const teamAIds = teamA.map(p => Number(p.id));
      const teamBIds = teamB.map(p => Number(p.id));
      console.log('IDs das equipas:', { teamAIds, teamBIds });

      // Criar as equipas no banco de dados
      const [createdTeamA, createdTeamB] = await Promise.all([
        teamsApi.create({
          game_id: currentGame.id,
          name: 'Equipa A',
          players: teamAIds,
          score: 0
        }),
        teamsApi.create({
          game_id: currentGame.id,
          name: 'Equipa B',
          players: teamBIds,
          score: 0
        })
      ]);

      console.log('Equipas criadas:', { createdTeamA, createdTeamB });

      // Atualizar o jogo com os IDs das equipas
      const updateData = {
        teamA: teamAIds,
        teamB: teamBIds
      };

      // Atualizar o jogo no banco de dados
      const updatedGame = await gamesApi.update(currentGame.id, updateData);
      console.log('Jogo atualizado:', updatedGame);

      // Atualizar o estado local
      updateMatch(currentGame.id, updateData);

      toast({
        title: "Sucesso",
        description: "Equipas geradas com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao gerar equipas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar as equipas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <Button
        onClick={handleGenerateTeams}
        disabled={isGenerating || confirmedPlayers.length < 2}
        className="bg-[#102e45] text-white hover:bg-[#1a4a6e]"
      >
        {isGenerating ? "Gerando..." : "Gerar Equipas"}
      </Button>
    </div>
  );
} 