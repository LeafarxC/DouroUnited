import React, { useState } from 'react';
import { usePlayers } from '../../context/PlayerContext';
import { useMatches } from '../../context/MatchContext';
import { PlayerCard } from './PlayerCard';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

const PlayersList: React.FC = () => {
  const { players, addPlayer, togglePlayerStatus, removePlayer } = usePlayers();
  const { matches } = useMatches();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterPosition, setFilterPosition] = useState<Position | 'all'>('all');
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: ['Midfielder'] as Position[],
    skill: 3,
    is_active: true,
    nickname: ''
  });

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = filterActive === null || player.is_active === filterActive;
    const matchesPosition = filterPosition === 'all' || player.position.includes(filterPosition);
    
    return matchesSearch && matchesActive && matchesPosition;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlayer({
      ...newPlayer,
      [e.target.name]: e.target.value
    });
  };

  const handlePositionChange = (value: Position) => {
    setNewPlayer({
      ...newPlayer,
      position: [value]
    });
  };

  const handleSkillChange = (value: number[]) => {
    setNewPlayer({
      ...newPlayer,
      skill: value[0]
    });
  };

  const handleAddPlayer = () => {
    if (newPlayer.name.trim() === '') return;
    
    addPlayer(newPlayer);
    setNewPlayer({
      name: '',
      position: ['Midfielder'],
      skill: 3,
      is_active: true,
      nickname: ''
    });
    setIsDialogOpen(false);
  };

  const handleRemovePlayer = (playerId: number) => {
    const playerInMatches = matches.some(match => 
      match.teamA?.includes(playerId) || 
      match.teamB?.includes(playerId)
    );

    if (playerInMatches) {
      toast({
        title: "Não é possível remover",
        description: "Este jogador está registrado em um ou mais jogos. Remova-o dos jogos primeiro.",
        variant: "destructive"
      });
      return;
    }

    setPlayerToDelete(playerId);
  };

  const confirmRemovePlayer = () => {
    if (playerToDelete) {
      removePlayer(playerToDelete);
      toast({
        title: "Jogador removido",
        description: "O jogador foi removido com sucesso."
      });
      setPlayerToDelete(null);
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Jogadores</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">{filteredPlayers.length} jogadores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">{players.filter(p => p.is_active).length} ativos</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" /> Adicionar Novo Jogador
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm backdrop-blur-xl p-4 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-[200px] md:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  className="pl-9 h-10 md:h-11 bg-gray-50/50 border-gray-200/50 rounded-lg"
                  placeholder="Procurar jogador por nome..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select 
              value={filterPosition} 
              onValueChange={(value) => setFilterPosition(value as Position | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-10 md:h-11 bg-gray-50/50 border-gray-200/50 rounded-lg">
                <SelectValue placeholder="Todas as posições" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as posições</SelectItem>
                <SelectItem value="Goalkeeper">Guarda-redes</SelectItem>
                <SelectItem value="Defender">Defesa</SelectItem>
                <SelectItem value="Midfielder">Médio</SelectItem>
                <SelectItem value="Forward">Avançado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filterActive === null ? "all" : filterActive ? "active" : "inactive"} 
              onValueChange={(val) => {
                if (val === "all") setFilterActive(null);
                else setFilterActive(val === "active");
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-10 md:h-11 bg-gray-50/50 border-gray-200/50 rounded-lg">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de jogadores */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {filteredPlayers.map(player => (
              <div key={player.id} className="group">
                <PlayerCard 
                  player={player} 
                  onToggleStatus={togglePlayerStatus}
                  onRemovePlayer={handleRemovePlayer}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/50 p-8 md:p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Nenhum jogador encontrado</h3>
            <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>

      {/* Modal de novo jogador */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[90%] md:w-full" aria-describedby="new-player-description">
          <DialogHeader>
            <DialogTitle>Novo Jogador</DialogTitle>
            <p id="new-player-description" className="text-sm text-gray-500">
              Preencha os dados do novo jogador abaixo.
            </p>
          </DialogHeader>
          <PlayerForm 
            onSubmit={handlePlayerCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Jogador */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[90%] md:w-full" aria-describedby="edit-player-description">
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <p id="edit-player-description" className="text-sm text-gray-500">
              Atualize os dados do jogador abaixo.
            </p>
          </DialogHeader>
          {selectedPlayer && (
            <PlayerForm 
              onSubmit={handlePlayerUpdated}
              onCancel={() => setIsEditDialogOpen(false)}
              player={selectedPlayer}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação */}
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Remover jogador?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Esta ação não pode ser desfeita. Todos os dados do jogador serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-11 border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemovePlayer} 
              className="h-11 bg-red-600 hover:bg-red-700"
            >
              Remover Jogador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlayersList;
