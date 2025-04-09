import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const gameSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  date: z.string().min(1, 'A data é obrigatória'),
  time: z.string().min(1, 'O horário é obrigatório'),
  location: z.string().min(1, 'O local é obrigatório'),
});

export type GameFormData = z.infer<typeof gameSchema>;

interface GameFormProps {
  onSubmit: (data: GameFormData) => Promise<void>;
  onCancel?: () => void;
}

export function GameForm({ onSubmit, onCancel }: GameFormProps) {
  const form = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      location: '',
    },
  });

  const onSubmitForm = async (data: GameFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Jogo Amigável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Campo Municipal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Salvar
          </Button>
          {onCancel && (
            <Button
              type="button"
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
} 