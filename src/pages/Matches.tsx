import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { GameForm, GameFormData } from '@/components/games/GameForm';
import { GameDetails } from '@/components/games/GameDetails';
import { Game, Player, playersApi, gamesApi } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Pencil, Trash2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams } from "react-router-dom";
import { useMatches } from "@/context/MatchContext";
import { usePlayers } from "@/context/PlayerContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus as PlusIcon, Trash2 as TrashIcon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";
import { GameDetails as GameDetailsComponent } from "@/components/games/GameDetails";
import TeamGenerator from "@/components/teams/TeamGenerator";

export default function Matches() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { matches, addMatch, updateMatch, removeMatch, togglePlayerConfirmation } = useMatches();
  const { players } = usePlayers();
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [newGame, setNewGame] = useState<Omit<Game, "id" | "created_at">>({
    title: "",
    date: new Date().toISOString(),
    time: "",
    location: "",
    is_confirmed: false,
    selected_players: []
  });

  useEffect(() => {
    if (id) {
      const game = matches.find(match => match.id === id);
      if (game) {
        setSelectedGame(game);
      }
    }
  }, [id, matches]);

  const handleGameCreated = async (formData: GameFormData) => {
    try {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^\d{2}:\d{2}$/;
      
      if (!dateRegex.test(formData.date)) {
        throw new Error(`Data inválida: ${formData.date}. Use o formato YYYY-MM-DD`);
      }
      
      if (!timeRegex.test(formData.time)) {
        throw new Error(`Hora inválida: ${formData.time}. Use o formato HH:MM`);
      }

      const timeParts = formData.time.split(':');
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

      const newGameData = {
        title: formData.title.trim(),
        date: formData.date,
        time: formattedTime,
        location: formData.location.trim(),
        is_confirmed: false,
        selected_players: []
      };

      console.log('Dados do novo jogo antes de criar:', newGameData);

      try {
        const createdGame = await addMatch(newGameData);
        console.log('Jogo criado com sucesso:', createdGame);
        setShowForm(false);
        sonnerToast.success("Jogo criado com sucesso!");
      } catch (error) {
        console.error('Erro ao criar jogo no servidor:', error);
        sonnerToast.error("Erro ao criar jogo no servidor. Tente novamente.");
      }
    } catch (error) {
      console.error('Erro na validação dos dados:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar jogo";
      sonnerToast.error(errorMessage);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este jogo?')) {
      try {
        await removeMatch(id);
        sonnerToast.success("Jogo removido com sucesso!");
      } catch (error) {
        sonnerToast.error("Erro ao remover jogo");
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).toLowerCase();
    } catch (error) {
      return dateStr;
    }
  };

  const getSelectedPlayers = (selectedIds: number[] = []) => {
    return selectedIds.map(id => players.find(p => p.id === id)).filter(Boolean);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proximosJogos = matches.filter(game => new Date(game.date) >= today);
  const jogosAnteriores = matches.filter(game => new Date(game.date) < today);

  const renderGameCard = (game: Game) => {
    const selectedPlayers = players.filter(player => 
      game.selected_players?.includes(player.id.toString())
    );
    const isProximoJogo = new Date(game.date) >= today;
    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    return (
      <Card
        key={game.id}
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-[#b89333]"
        onClick={() => setSelectedGame(game)}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#b89333] transition-colors">
                  {game.title}
                </h3>
                <Badge 
                  variant={isProximoJogo ? "default" : "secondary"} 
                  className="bg-[#b89333] hover:bg-[#a07d2d]"
                >
                  {isProximoJogo ? "Próximo Jogo" : "Jogo Anterior"}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2 text-[#b89333]" />
                {formattedDate}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-2 text-[#b89333]" />
                {game.time}
              </div>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteGame(game.id)}
                className="h-8 w-8 text-destructive hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-[#b89333]" />
              <span className="text-sm">{game.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2 text-[#b89333]" />
              <span className="text-sm font-medium">{selectedPlayers.length} jogadores confirmados</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleAddGame = async () => {
    try {
      await addMatch({
        title: newGame.title,
        date: newGame.date,
        time: newGame.time,
        location: newGame.location,
        is_confirmed: false,
        selected_players: []
      });
      setNewGame({
        title: "",
        date: new Date().toISOString(),
        time: "",
        location: "",
        is_confirmed: false,
        selected_players: []
      });
      setIsAddingGame(false);
      sonnerToast("Jogo adicionado com sucesso!");
    } catch (error) {
      sonnerToast("Erro ao adicionar jogo");
    }
  };

  const handleRemoveGame = async (id: string) => {
    try {
      await removeMatch(id);
      sonnerToast("Jogo removido com sucesso!");
    } catch (error) {
      sonnerToast("Erro ao remover jogo");
    }
  };

  const handleTogglePlayerConfirmation = async (gameId: string, playerId: string) => {
    try {
      await togglePlayerConfirmation(gameId, playerId);
    } catch (error) {
      sonnerToast("Erro ao atualizar confirmação do jogador");
    }
  };

  const handleTeamsGenerated = () => {
    sonnerToast("Equipas geradas com sucesso!");
  };

  const handleCloseGameDetails = () => {
    setSelectedGame(null);
    navigate("/matches");
  };

  return (
    <Layout title="Gestão de Jogos">
      <div className="space-y-6">
        {/* Botão de Criação */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#b89333] hover:bg-[#a07d2d] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Jogo
          </Button>
        </div>

        {/* Lista de Jogos */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-900">Lista de Jogos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="proximos" className="w-full">
              <TabsList className="mb-6 bg-gray-50 p-1 rounded-lg">
                <TabsTrigger 
                  value="proximos" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#b89333] data-[state=active]:shadow-sm"
                >
                  Próximos Jogos
                </TabsTrigger>
                <TabsTrigger 
                  value="anteriores"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#b89333] data-[state=active]:shadow-sm"
                >
                  Jogos Anteriores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="proximos" className="mt-0">
                <div className="grid gap-4">
                  {proximosJogos.map(renderGameCard)}
                  {proximosJogos.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">Não há jogos agendados.</p>
                      <p className="text-sm mt-2">Clique em "Novo Jogo" para criar um novo jogo.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="anteriores" className="mt-0">
                <div className="grid gap-4">
                  {jogosAnteriores.map(renderGameCard)}
                  {jogosAnteriores.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">Não há jogos anteriores.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="new-game-description">
          <DialogHeader>
            <DialogTitle>Novo Jogo</DialogTitle>
            <p id="new-game-description" className="text-sm text-gray-500">
              Preencha os dados do novo jogo abaixo.
            </p>
          </DialogHeader>
          <GameForm
            onSubmit={handleGameCreated}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedGame.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseGameDetails}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <GameDetailsComponent
              game={matches.find(m => m.id === selectedGame.id) || selectedGame}
              players={players}
              onClose={handleCloseGameDetails}
            />
            {selectedGame.selected_players.length >= 10 && (
              <TeamGenerator
                game={selectedGame}
                players={players.filter(player =>
                  selectedGame.selected_players.includes(player.id.toString())
                )}
                onTeamsGenerated={handleTeamsGenerated}
              />
            )}
          </div>
        </div>
      )}

      {isAddingGame && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Novo Jogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newGame.title}
                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                placeholder="Ex: Jogo de Domingo"
              />
            </div>
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={newGame.location}
                onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
                placeholder="Ex: Campo Municipal"
              />
            </div>
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newGame.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newGame.date ? (
                      format(new Date(newGame.date), "PPP", { locale: ptBR })
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newGame.date)}
                    onSelect={(date) => date && setNewGame({ ...newGame, date: date.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={newGame.time}
                onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddingGame(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddGame}
              className="bg-[#102e45] text-white hover:bg-[#0a1f2e]"
            >
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
