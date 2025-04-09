import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { playersApi } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type Position = "Guarda-Redes" | "Defesa" | "Meio-campo" | "Avançado";

export interface Player {
  id: number;
  created_at: string;
  name: string;
  nickname?: string;
  position: Position[];
  photo_url?: string | null;
  is_active: boolean;
}

const playerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  nickname: z.string().nullable().optional(),
  position: z.array(z.enum(['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'])).min(1, 'Selecione pelo menos uma posição'),
  photo_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true)
});

export type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  onCancel?: () => void;
}

const positionOptions = [
  { value: 'Guarda-Redes', label: 'Guarda-Redes' },
  { value: 'Defesa', label: 'Defesa' },
  { value: 'Meio-campo', label: 'Meio-campo' },
  { value: 'Avançado', label: 'Avançado' }
] as const;

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(player?.photo_url || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Inicializa as posições do jogador
  const initialPositions = React.useMemo(() => {
    if (!player) return [] as Position[]; // Novo jogador começa sem posições
    
    if (typeof player.position === 'string') {
      return player.position.split(',').filter(pos => 
        ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
      ) as Position[];
    }
    
    if (Array.isArray(player.position)) {
      return player.position.filter(pos => 
        ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
      ) as Position[];
    }
    
    return [] as Position[];
  }, [player]);

  const [selectedPositions, setSelectedPositions] = useState<Position[]>(initialPositions);

  console.log('Posições iniciais:', initialPositions);
  console.log('Posições selecionadas:', selectedPositions);

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || '',
      nickname: player?.nickname || '',
      position: selectedPositions,
      is_active: player?.is_active ?? true
    },
    mode: 'onChange'
  });

  const handlePositionToggle = (position: Position) => {
    let newPositions: Position[];
    
    if (selectedPositions.includes(position)) {
      // Remove a posição se não for a última
      if (selectedPositions.length > 1) {
        newPositions = selectedPositions.filter(p => p !== position);
      } else {
        return; // Não permite remover a última posição
      }
    } else {
      // Adiciona a nova posição
      newPositions = [...selectedPositions, position];
    }
    
    console.log('Novas posições:', newPositions);
    setSelectedPositions(newPositions);
    form.setValue('position', newPositions, { shouldValidate: true });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { publicUrl } = await playersApi.uploadPhoto(file);
      setPhotoUrl(publicUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível fazer upload da foto.',
      });
    }
  };

  const onSubmitForm = async (data: PlayerFormData) => {
    try {
      // Validar se pelo menos uma posição foi selecionada
      if (selectedPositions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Selecione pelo menos uma posição.',
        });
        return;
      }

      setIsLoading(true);
      console.log('Dados do formulário antes do envio:', data);
      
      const formData: PlayerFormData = {
        name: data.name,
        nickname: data.nickname || null,
        position: selectedPositions,
        is_active: data.is_active,
        photo_url: photoUrl
      };
      
      console.log('Dados formatados para envio:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o jogador.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="flex justify-center mb-6">
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handlePhotoClick}
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Foto do jogador" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o nome do jogador"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alcunha</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite a alcunha do jogador"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Posições</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {positionOptions.map((pos) => {
              const isSelected = selectedPositions.includes(pos.value);
              return (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => handlePositionToggle(pos.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#b89333] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.position && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.position.message}</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Jogador Ativo</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 