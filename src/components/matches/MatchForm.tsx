
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useMatches, Match } from '../../context/MatchContext';
import { useToast } from '@/hooks/use-toast';

interface MatchFormProps {
  editingMatchId?: string | null;
  onCancelEdit?: () => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ editingMatchId, onCancelEdit }) => {
  const { addMatch, matches, updateMatch } = useMatches();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');

  // If editing, load match data
  useEffect(() => {
    if (editingMatchId) {
      const matchToEdit = matches.find(m => m.id === editingMatchId);
      if (matchToEdit) {
        setDate(matchToEdit.date);
        setTime(format(matchToEdit.date, 'HH:mm'));
        setLocation(matchToEdit.location);
        setTitle(matchToEdit.title);
      }
    } else {
      // Reset form when not editing
      setDate(undefined);
      setTime('19:00');
      setLocation('');
      setTitle('');
    }
  }, [editingMatchId, matches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !location || !title) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create a new date with the selected date and time
    const [hours, minutes] = time.split(':').map(Number);
    const matchDate = new Date(date);
    matchDate.setHours(hours, minutes);
    
    if (editingMatchId) {
      // Update existing match
      updateMatch(editingMatchId, {
        date: matchDate,
        location,
        title,
      });
      
      toast({
        title: 'Jogo atualizado',
        description: 'O jogo foi atualizado com sucesso.',
      });
      
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      // Add new match
      addMatch({
        date: matchDate,
        location,
        title,
      });
      
      // Reset form for new matches
      setDate(undefined);
      setTime('19:00');
      setLocation('');
      setTitle('');
      
      toast({
        title: 'Jogo criado',
        description: 'O jogo foi agendado com sucesso.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Nome do Jogo</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Jogo semanal"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Data e Hora</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <div className="relative w-1/3">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Campo Municipal"
        />
      </div>
      
      <div className="pt-2 flex gap-2">
        {editingMatchId ? (
          <>
            <Button type="submit" className="flex-1">Guardar Alterações</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancelEdit} 
              className="flex-1"
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Button type="submit" className="w-full">Criar Jogo</Button>
        )}
      </div>
    </form>
  );
};

export default MatchForm;
