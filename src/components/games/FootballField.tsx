import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Player, Position } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface FootballFieldProps {
  teamA: Player[];
  teamB: Player[];
  teamAScore: number;
  teamBScore: number;
  onScoreChange: (teamAScore: number, teamBScore: number) => void;
  fullWidth?: boolean;
  showScoreboard?: boolean;
}

const FootballField = ({ 
  teamA = [], 
  teamB = [], 
  teamAScore = 0, 
  teamBScore = 0, 
  onScoreChange,
  fullWidth = false,
  showScoreboard = true 
}: FootballFieldProps) => {
  const getTeamFormation = (team: Player[]) => {
    if (!team || team.length === 0) {
      return {
        goalkeeper: null,
        fieldPlayers: []
      };
    }
    
    const goalkeeper = team.find(p => {
      const positions = Array.isArray(p.position) ? p.position : [p.position];
      return positions.includes('Guarda-Redes');
    });

    const fieldPlayers = team.filter(p => {
      const positions = Array.isArray(p.position) ? p.position : [p.position];
      return !positions.includes('Guarda-Redes');
    });

    return {
      goalkeeper,
      fieldPlayers
    };
  };

  const teamAFormation = getTeamFormation(teamA);
  const teamBFormation = getTeamFormation(teamB);

  const PlayerAvatar = ({ player, isTeamA, className = '' }: { 
    player: Player; 
    isTeamA: boolean; 
    className?: string;
  }) => {
    const playerName = player.nickname || player.name.split(' ')[0];
    
    return (
      <div className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-center ${className}`}>
        <div className="relative flex flex-col items-center">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isTeamA ? 'bg-[#b89333]' : 'bg-[#102e45]'} text-white text-[10px] md:text-xs font-medium border-2 border-white shadow-md hover:scale-110 transition-transform`}>
            {playerName}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col md:flex-row items-start ${fullWidth ? 'w-full' : ''}`}>
      <Card className={`bg-[#ffffff] overflow-hidden ${fullWidth ? 'w-full' : 'w-full'}`}>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <div 
              className="absolute inset-0 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage: "url('/pngegg.png')",
                margin: '0'
              }}
            >
              {/* Time A */}
              {teamAFormation.goalkeeper && (
                <PlayerAvatar 
                  player={teamAFormation.goalkeeper}
                  isTeamA={true}
                  className="left-[10%] top-[50%]"
                />
              )}
              {/* Jogadores de campo do Time A */}
              {teamAFormation.fieldPlayers?.map((player, index) => {
                const positions = {
                  0: "left-[20%] top-[30%]",
                  1: "left-[20%] top-[50%]",
                  2: "left-[20%] top-[70%]",
                  3: "left-[35%] top-[30%]",
                  4: "left-[35%] top-[50%]",
                  5: "left-[35%] top-[70%]",
                  6: "left-[70%] top-[40%]",
                  7: "left-[70%] top-[60%]",
                  8: "left-[40%] top-[40%]",
                  9: "left-[40%] top-[60%]",
                  10: "left-[60%] top-[40%]",
                  11: "left-[60%] top-[60%]"
                }[index] || "";

                if (!positions) return null;

                return (
                  <PlayerAvatar
                    key={player.id}
                    player={player}
                    isTeamA={true}
                    className={positions}
                  />
                );
              })}

              {/* Time B */}
              {teamBFormation.goalkeeper && (
                <PlayerAvatar 
                  player={teamBFormation.goalkeeper}
                  isTeamA={false}
                  className="left-[90%] top-[50%]"
                />
              )}
              {/* Jogadores de campo do Time B */}
              {teamBFormation.fieldPlayers?.map((player, index) => {
                const positions = {
                  0: "left-[80%] top-[30%]",
                  1: "left-[80%] top-[50%]",
                  2: "left-[80%] top-[70%]",
                  3: "left-[65%] top-[30%]",
                  4: "left-[65%] top-[50%]",
                  5: "left-[65%] top-[70%]",
                  6: "left-[30%] top-[40%]",
                  7: "left-[30%] top-[60%]",
                  8: "left-[60%] top-[40%]",
                  9: "left-[60%] top-[60%]",
                  10: "left-[40%] top-[40%]",
                  11: "left-[40%] top-[60%]"
                }[index] || "";

                if (!positions) return null;

                return (
                  <PlayerAvatar
                    key={player.id}
                    player={player}
                    isTeamA={false}
                    className={positions}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showScoreboard && (
        <Card className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] w-full md:w-auto shadow-xl mt-4 md:mt-0 md:ml-4">
          <CardContent className="p-2 md:p-4">
            <div className="flex items-center justify-between md:gap-6">
              {/* Time A */}
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#b89333] to-[#8b6b1f] rounded-lg flex items-center justify-center shadow-inner">
                    <span className="text-white font-bold text-sm md:text-xl">A</span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Time</span>
                  <span className="text-white font-bold">Time A</span>
                </div>
              </div>

              {/* Placar */}
              <div className="flex items-center gap-2 md:gap-3 bg-[#0f172a] px-2 md:px-4 py-1 md:py-2 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-xl md:text-3xl font-bold text-white tabular-nums">{teamAScore}</span>
                  <div className="flex gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 md:h-5 md:w-5 p-0 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                      onClick={() => onScoreChange(teamAScore - 1, teamBScore)}
                      disabled={teamAScore <= 0}
                    >
                      -
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 md:h-5 md:w-5 p-0 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                      onClick={() => onScoreChange(teamAScore + 1, teamBScore)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <span className="text-gray-600 font-medium text-lg md:text-2xl px-1 md:px-2">:</span>
                
                <div className="flex flex-col items-center">
                  <span className="text-xl md:text-3xl font-bold text-white tabular-nums">{teamBScore}</span>
                  <div className="flex gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 md:h-5 md:w-5 p-0 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                      onClick={() => onScoreChange(teamAScore, teamBScore - 1)}
                      disabled={teamBScore <= 0}
                    >
                      -
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 md:h-5 md:w-5 p-0 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                      onClick={() => onScoreChange(teamAScore, teamBScore + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Time B */}
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Time</span>
                  <span className="text-white font-bold">Time B</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#102e45] to-[#0c1f2e] rounded-lg flex items-center justify-center border-2 border-white/20 shadow-inner">
                    <span className="text-white font-bold text-sm md:text-xl">B</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FootballField; 