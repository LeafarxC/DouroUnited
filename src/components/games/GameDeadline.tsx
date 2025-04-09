import React from 'react';
import { Game } from '@/lib/supabase';
import { format, parse, isPast, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface GameDeadlineProps {
  game: Game;
}

export function GameDeadline({ game }: GameDeadlineProps) {
  const deadlineDate = parse(
    `${game.deadline} ${game.deadlineTime}`, 
    'yyyy-MM-dd HH:mm', 
    new Date()
  );
  
  const isExpired = isPast(deadlineDate);
  const formattedDeadline = format(deadlineDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  const timeLeft = !isExpired ? formatDistanceToNow(deadlineDate, { locale: ptBR, addSuffix: true }) : null;

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-gray-500" />
      <div>
        <div className="text-sm text-gray-600">
          Prazo para confirmação: {formattedDeadline}
        </div>
        {isExpired ? (
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <Badge variant="destructive" className="text-xs">
              Prazo encerrado
            </Badge>
          </div>
        ) : (
          <Badge variant="secondary" className="text-xs mt-1">
            Encerra {timeLeft}
          </Badge>
        )}
      </div>
    </div>
  );
} 