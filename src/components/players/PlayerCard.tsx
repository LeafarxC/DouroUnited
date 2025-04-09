import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Pencil, Trash2, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    nickname?: string;
    position: 'Guarda-Redes' | 'Campo' | string;
    photo_url?: string;
    is_active: boolean;
    total_games: number;
    games_attended: number;
    last_games: {
      id: number;
      date: string;
      attended: boolean;
    }[];
  };
  onEdit?: (player: any) => void;
  onToggleStatus?: () => void;
  onRemovePlayer?: () => void;
  matchView?: boolean;
  isConfirmed?: boolean;
  onToggleConfirmation?: () => void;
  teamColor?: 'A' | 'B';
}

export function PlayerCard({ 
  player, 
  onEdit, 
  onToggleStatus, 
  onRemovePlayer,
  matchView = false,
  isConfirmed,
  onToggleConfirmation,
  teamColor
}: PlayerCardProps) {
  const attendanceRate = player.total_games > 0 
    ? Math.round((player.games_attended / player.total_games) * 100) 
    : 0;

  // Converte a string de posições para array
  const positions = typeof player.position === 'string' 
    ? player.position.split(',') 
    : Array.isArray(player.position) 
      ? player.position 
      : [player.position];

  const getTeamColor = () => {
    if (!teamColor) return '';
    return teamColor === 'A' 
      ? 'border-l-4 border-[#b89333]' 
      : 'border-l-4 border-[#102e45]';
  };

  const getStatusColor = () => {
    if (!player.is_active) return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  const getAttendanceColor = () => {
    if (attendanceRate >= 75) return 'text-green-600';
    if (attendanceRate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const positionAbbreviations: Record<string, { abbr: string, color: string }> = {
    'Guarda-Redes': { abbr: 'GR', color: 'bg-blue-500 text-white' },
    'Defesa': { abbr: 'DEF', color: 'bg-green-500 text-white' },
    'Meio-campo': { abbr: 'MED', color: 'bg-yellow-500 text-white' },
    'Avançado': { abbr: 'AV', color: 'bg-red-500 text-white' }
  };

  return (
    <Card className={`bg-white hover:shadow-md transition-all duration-300 overflow-hidden group ${getTeamColor()}`}>
      <div className="relative flex p-5">
        {/* Coluna da foto */}
        <div className="relative shrink-0">
          <Avatar className="h-[120px] w-[120px] rounded-lg ring-1 ring-black/5">
            <AvatarImage 
              src={player.photo_url || ''} 
              alt={player.name}
              className="object-cover rounded-lg"
            />
            <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white text-3xl font-semibold rounded-lg">
              {player.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {player.photo_url && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onEdit?.({ ...player, photo_url: null })}
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover foto"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Coluna das informações */}
        <div className="flex-1 min-w-0 ml-4 md:ml-8">
          {/* Cabeçalho com nome */}
          <div className="mb-2 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-none mb-1">
              {player.name}
            </h3>
            {player.nickname && (
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                "{player.nickname}"
              </p>
            )}
          </div>

          {/* Status e Posições */}
          <div className="flex items-center gap-1.5 md:gap-2.5 mb-2 md:mb-4">
            <div className="flex gap-1 flex-wrap">
              {positions.map((pos, index) => (
                <Badge 
                  key={index}
                  className={`${positionAbbreviations[pos]?.color || 'bg-gray-500'} 
                    text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-full`}
                >
                  {positionAbbreviations[pos]?.abbr || pos}
                </Badge>
              ))}
            </div>
            <Badge 
              variant="secondary" 
              className={`text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor()}`}
            >
              {player.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-gray-50 rounded-xl p-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs uppercase tracking-wider font-medium text-gray-500">Jogos</p>
                <p className="text-sm font-bold text-gray-900">{player.total_games}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs uppercase tracking-wider font-medium text-gray-500">Presença</p>
                <p className={`text-sm font-bold ${getAttendanceColor()} ${attendanceRate === 0 ? 'text-gray-500' : ''}`}>{attendanceRate}%</p>
              </div>
            </div>
          </div>

          {/* Histórico de presença */}
          {player.last_games && player.last_games.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Histórico</p>
              <div className="flex items-center gap-1.5">
                {player.last_games.slice(-5).map((game) => (
                  <div
                    key={game.id}
                    className="flex-1"
                    title={`${game.attended ? 'Presente' : 'Ausente'} em ${format(
                      new Date(game.date),
                      'dd/MM/yyyy',
                      { locale: ptBR }
                    )}`}
                  >
                    <div className={`h-6 rounded-lg ${
                      game.attended 
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-500' 
                        : 'bg-gradient-to-t from-rose-600 to-rose-500'
                    }`}>
                      <div className={`h-1/3 rounded-t-lg bg-white/20`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação sempre visíveis */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-gray-200 hover:bg-gray-100"
            onClick={() => onEdit?.(player)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={() => onRemovePlayer?.()}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
