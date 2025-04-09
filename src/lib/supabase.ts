import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '***' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL e/ou chave não encontrados nas variáveis de ambiente. Verifique o arquivo .env');
}

// Validar a URL
try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error(`URL do Supabase inválida: ${supabaseUrl}`);
}

// Criar uma única instância do cliente Supabase
let supabaseInstance: ReturnType<typeof createClient>;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      },
      global: {
        headers: {
          'apikey': supabaseKey
        }
      }
    });
  }
  return supabaseInstance;
})();

export type Position = "Guarda-Redes" | "Defesa" | "Meio-campo" | "Avançado";

export interface Player {
  id: number;
  created_at: string;
  name: string;
  nickname: string | null;
  position: Position[];
  photo_url?: string | null;
  is_active: boolean;
  goals_count?: number;
}

export interface Game {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  is_confirmed: boolean;
  selected_players: number[];
  teamA: number[];
  teamB: number[];
  scoreA: number;
  scoreB: number;
  created_at: string;
}

export interface Team {
  id: number;
  game_id: number;
  name: string;
  players: number[];
  score: number;
  created_at?: string;
}

interface SupabasePlayer {
  id: number;
  created_at: string;
  name: string;
  nickname: string | null;
  position: string | Position[];
  is_active: boolean;
  photo_url: string | null;
  goals_count?: number;
}

interface SupabaseGame {
  id: number;
  created_at: string;
  title: string;
  date: string;
  time: string;
  location: string;
  is_confirmed: boolean;
  selected_players: number[];
  teamA: number[];
  teamB: number[];
  scoreA: number | null;
  scoreB: number | null;
}

export interface SupabaseTeam {
  id: number;
  game_id: number;
  name: string;
  players: number[];
  score: number;
  created_at: string;
}

export interface Goal {
  id: number;
  game_id: number;
  player_id: number;
  team: 'A' | 'B';
  minute?: number;
  created_at?: string;
  player?: {
    id: number;
    name: string;
    nickname?: string | null;
  };
}

export interface SupabaseGoal extends Omit<Goal, 'id' | 'player'> {
  id?: number;
}

// API functions
export const playersApi = {
  async list() {
    try {
      console.log('Iniciando busca de jogadores...');
      
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao listar jogadores:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!players) {
        console.error('Nenhum dado retornado da consulta');
        throw new Error('Nenhum dado retornado da consulta');
      }

      console.log('Jogadores encontrados:', players.length);
      
      return players.map((player: SupabasePlayer) => {
        console.log('Processando jogador:', player.name);
        return {
          id: player.id,
          created_at: player.created_at,
          name: player.name,
          nickname: player.nickname,
          position: typeof player.position === 'string' 
            ? player.position.split(',') as Position[]
            : Array.isArray(player.position) 
              ? player.position as Position[]
              : ['Defesa'],
          is_active: player.is_active,
          photo_url: player.photo_url,
          goals_count: player.goals_count
        };
      }) as Player[];
    } catch (error) {
      console.error('Erro inesperado ao listar jogadores:', error);
      throw error;
    }
  },

  async create(player: Omit<Player, 'id' | 'created_at'>) {
    console.log('Dados recebidos para criação:', player);
    
    try {
      // Garante que position seja um array válido de Position
      let positions: Position[] = [];
      
      if (player.position) {
        if (Array.isArray(player.position)) {
          positions = player.position.filter(pos => 
            ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
          ) as Position[];
        } else if (typeof player.position === 'string') {
          positions = player.position.split(',').filter(pos => 
            ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
          ) as Position[];
        }
      }

      // Validar se há pelo menos uma posição
      if (positions.length === 0) {
        throw new Error('É necessário selecionar pelo menos uma posição');
      }

      console.log('Posições normalizadas:', positions);
      
      const createData = {
        name: player.name,
        nickname: player.nickname,
        position: positions.join(','),
        is_active: player.is_active,
        goals_count: player.goals_count
      };
      
      console.log('Dados formatados para criação:', createData);
      
      const { data: newPlayer, error } = await supabase
        .from('players')
        .insert(createData)
        .select('*')
        .single();

      if (error) {
        console.error('Erro na API:', error);
        throw error;
      }

      if (!newPlayer) {
        throw new Error('Nenhum dado retornado após a criação');
      }

      // Converte a string de posições de volta para array
      const createdPlayer: Player = {
        id: newPlayer.id,
        created_at: newPlayer.created_at,
        name: newPlayer.name,
        nickname: newPlayer.nickname,
        position: newPlayer.position.split(',') as Position[],
        is_active: newPlayer.is_active,
        photo_url: newPlayer.photo_url,
        goals_count: newPlayer.goals_count
      };

      console.log('Jogador criado na API:', createdPlayer);
      return createdPlayer;
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      throw error;
    }
  },

  async update(id: number, player: Partial<Player>) {
    console.log('Dados recebidos na API:', player);
    
    try {
      // Garante que position seja um array válido de Position
      let positions: Position[] = [];
      
      if (player.position) {
        if (Array.isArray(player.position)) {
          positions = player.position.filter(pos => 
            ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
          ) as Position[];
        } else if (typeof player.position === 'string') {
          positions = player.position.split(',').filter(pos => 
            ['Guarda-Redes', 'Defesa', 'Meio-campo', 'Avançado'].includes(pos)
          ) as Position[];
        }
      }

      // Garante que há pelo menos uma posição
      if (positions.length === 0) {
        positions = ['Defesa'];
      }

      console.log('Posições normalizadas:', positions);
      
      const updateData = {
        name: player.name,
        nickname: player.nickname,
        position: positions.join(','),
        is_active: player.is_active,
        photo_url: player.photo_url,
        goals_count: player.goals_count
      };
      
      console.log('Dados formatados para atualização:', updateData);
      
      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Erro na API:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após a atualização');
      }

      // Converte a string de posições de volta para array
      const updatedPlayer: Player = {
        id: data.id,
        created_at: data.created_at,
        name: data.name,
        nickname: data.nickname,
        position: data.position.split(','),
        is_active: data.is_active,
        photo_url: data.photo_url,
        goals_count: data.goals_count
      };

      console.log('Jogador atualizado na API:', updatedPlayer);
      return updatedPlayer;
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadPhoto(file: File) {
    try {
      console.log('Iniciando upload da foto:', file.name);
      
      // Gera um nome único para o arquivo usando timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `players/${fileName}`;

      console.log('Caminho do arquivo:', filePath);

      // Faz o upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('players')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload concluído com sucesso');

      // Obtém a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('players')
        .getPublicUrl(filePath);

      console.log('URL pública da foto:', publicUrl);
      return { publicUrl };
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    }
  },

  async deletePhoto(url: string) {
    try {
      // Extrai o caminho do arquivo da URL
      const filePath = url.split('/').pop();
      if (!filePath) throw new Error('URL inválida');

      // Remove o arquivo do bucket
      const { error } = await supabase.storage
        .from('players')
        .remove([`players/${filePath}`]);

      if (error) {
        console.error('Erro ao deletar foto:', error);
        throw error;
      }

      console.log('Foto deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      throw error;
    }
  }
};

export const gamesApi = {
  async list() {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!games) throw new Error('Nenhum jogo encontrado');

      console.log('Jogos carregados da API:', games.map(g => ({
        id: g.id,
        jogadoresConfirmados: g.selected_players
      })));

      return games.map(game => ({
        ...game,
        selected_players: Array.isArray(game.selected_players) 
          ? [...new Set(game.selected_players.map(id => id.toString()))]
          : []
      })) as Game[];
    } catch (error) {
      console.error('Erro ao listar jogos:', error);
      throw error;
    }
  },

  async create(game: Omit<Game, 'id' | 'created_at'>): Promise<Game> {
    try {
      const createData = {
        title: game.title,
        date: game.date,
        time: game.time,
        location: game.location,
        is_confirmed: false,
        selected_players: Array.isArray(game.selected_players) ? game.selected_players : []
      };

      const { data, error } = await supabase
        .from('games')
        .insert(createData)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar jogo');

      return {
        id: data.id,
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        is_confirmed: data.is_confirmed || false,
        selected_players: Array.isArray(data.selected_players) ? data.selected_players : [],
        created_at: data.created_at
      } as Game;
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      throw error;
    }
  },

  async update(id: string | number, game: Partial<Game>) {
    console.log('Atualizando jogo:', { id, game });
    
    try {
      // Garante que os campos numéricos sejam números
      const updateData: Partial<SupabaseGame> = {
        title: game.title,
        date: game.date,
        time: game.time,
        location: game.location,
        is_confirmed: game.is_confirmed,
        selected_players: Array.isArray(game.selected_players) 
          ? game.selected_players.map(Number)
          : [],
        teamA: Array.isArray(game.teamA) 
          ? game.teamA.map(Number)
          : [],
        teamB: Array.isArray(game.teamB) 
          ? game.teamB.map(Number)
          : [],
        scorea: typeof game.scoreA === 'number' ? game.scoreA : 0,
        scoreb: typeof game.scoreB === 'number' ? game.scoreB : 0
      };

      // Remove campos undefined ou null
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === null) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('Dados formatados para atualização:', updateData);

      const numericId = typeof id === 'string' ? parseInt(id) : id;

      const { data: updatedGame, error } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', numericId)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao atualizar jogo:', error);
        throw error;
      }

      if (!updatedGame) {
        throw new Error('Nenhum dado retornado após a atualização');
      }

      const result: Game = {
        id: updatedGame.id,
        title: updatedGame.title || '',
        date: updatedGame.date || '',
        time: updatedGame.time || '',
        location: updatedGame.location || '',
        is_confirmed: updatedGame.is_confirmed || false,
        selected_players: Array.isArray(updatedGame.selected_players) 
          ? updatedGame.selected_players.map(Number)
          : [],
        teamA: Array.isArray(updatedGame.teamA) 
          ? updatedGame.teamA.map(Number)
          : [],
        teamB: Array.isArray(updatedGame.teamB) 
          ? updatedGame.teamB.map(Number)
          : [],
        scoreA: typeof updatedGame.scorea === 'number' ? updatedGame.scorea : 0,
        scoreB: typeof updatedGame.scoreb === 'number' ? updatedGame.scoreb : 0,
        created_at: updatedGame.created_at || new Date().toISOString()
      };

      console.log('Jogo atualizado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar jogo:', error);
      throw error;
    }
  }
};

export const teamsApi = {
  async list() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Team[];
    } catch (error) {
      console.error('Erro ao listar equipas:', error);
      throw error;
    }
  },

  async create(team: Omit<Team, "id" | "created_at">) {
    console.log('Criando equipa:', team);
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select('*')
      .single();

    if (error) throw error;
    return data as Team;
  },

  async getByGameId(gameId: number) {
    console.log('Buscando equipas do jogo:', gameId);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('game_id', gameId);

    if (error) throw error;
    return data as Team[];
  },

  async update(id: number, team: Partial<Team>) {
    console.log('Atualizando equipa:', { id, team });
    const { data, error } = await supabase
      .from('teams')
      .update(team)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Team;
  },

  async delete(id: number) {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar equipa:', error);
      throw error;
    }
  },

  async getByGame(gameId: number) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Team[];
    } catch (error) {
      console.error('Erro ao buscar equipas do jogo:', error);
      throw error;
    }
  }
};

export const goalsApi = {
  create: async (goal: SupabaseGoal): Promise<Goal> => {
    try {
      console.log('Iniciando criação do gol com dados:', goal);

      // Validar dados antes de enviar
      if (!goal.game_id || !goal.player_id || !goal.team) {
        throw new Error('Dados obrigatórios faltando: game_id, player_id e team são obrigatórios');
      }

      // Garantir que os tipos estejam corretos
      const goalData = {
        game_id: Number(goal.game_id),
        player_id: Number(goal.player_id),
        team: goal.team,
        minute: goal.minute ? Number(goal.minute) : null
      };

      console.log('Dados formatados para criação:', goalData);

      // Primeiro, verificar se o jogador existe
      const { data: playerExists, error: playerError } = await supabase
        .from('players')
        .select('id, name, nickname, goals_count')
        .eq('id', goalData.player_id)
        .single();

      console.log('Resultado da busca do jogador:', { playerExists, playerError });

      if (playerError) {
        console.error('Erro ao buscar jogador:', playerError);
        throw new Error(`Erro ao buscar jogador: ${playerError.message}`);
      }

      if (!playerExists) {
        console.error('Jogador não encontrado:', goalData.player_id);
        throw new Error(`Jogador com ID ${goalData.player_id} não encontrado`);
      }

      // Depois, verificar se o jogo existe
      const { data: gameExists, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('id', goalData.game_id)
        .single();

      if (gameError || !gameExists) {
        console.error('Jogo não encontrado:', gameError);
        throw new Error(`Jogo com ID ${goalData.game_id} não encontrado`);
      }

      // Criar o gol
      const { data: newGoal, error: createError } = await supabase
        .from('goals')
        .insert([{
          game_id: goalData.game_id,
          player_id: goalData.player_id,
          team: goalData.team,
          minute: goalData.minute
        }])
        .select('id, game_id, player_id, team, minute, created_at')
        .single();

      if (createError) {
        console.error('Erro ao criar gol:', {
          error: createError,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code
        });
        throw new Error(`Erro ao criar gol: ${createError.message}`);
      }

      if (!newGoal) {
        throw new Error('Nenhum dado retornado após criar o gol');
      }

      console.log('Gol criado com sucesso:', newGoal);

      // Atualizar contagem de gols do jogador
      const newGoalsCount = (playerExists.goals_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('players')
        .update({ goals_count: newGoalsCount })
        .eq('id', goalData.player_id);

      if (updateError) {
        console.error('Erro ao atualizar contagem de gols do jogador:', updateError);
      }

      const goalWithPlayer: Goal = {
        ...newGoal,
        player: {
          id: playerExists.id,
          name: playerExists.name,
          nickname: playerExists.nickname,
          goals_count: newGoalsCount
        }
      };

      console.log('Retornando gol com dados do jogador:', goalWithPlayer);
      return goalWithPlayer;

    } catch (error: any) {
      console.error('Erro ao criar gol:', {
        error,
        message: error?.message || 'Erro desconhecido',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack
      });
      throw error;
    }
  },

  getByGameId: async (gameId: number): Promise<Goal[]> => {
    console.log('Buscando gols do jogo:', gameId);
    
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar gols:', error);
      throw error;
    }

    // Buscar informações dos jogadores
    if (goals && goals.length > 0) {
      const playerIds = [...new Set(goals.map(g => g.player_id))];
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name, nickname')
        .in('id', playerIds);

      if (playersError) {
        console.error('Erro ao buscar jogadores:', playersError);
        throw playersError;
      }

      // Adicionar informações dos jogadores aos gols
      const goalsWithPlayers = goals.map(goal => {
        const player = players?.find(p => p.id === goal.player_id);
        return {
          ...goal,
          player: player ? {
            id: player.id,
            name: player.name,
            nickname: player.nickname
          } : undefined
        };
      });

      console.log('Gols encontrados com jogadores:', goalsWithPlayers);
      return goalsWithPlayers;
    }

    return goals;
  },

  delete: async (goalId: number): Promise<void> => {
    try {
      // Primeiro, buscar o gol para obter o player_id
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('player_id')
        .eq('id', goalId)
        .single();

      if (fetchError) {
        throw new Error(`Erro ao buscar gol: ${fetchError.message}`);
      }

      if (!goal) {
        throw new Error('Gol não encontrado');
      }

      // Deletar o gol
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (deleteError) {
        throw new Error(`Erro ao deletar gol: ${deleteError.message}`);
      }

      // Atualizar a contagem de gols do jogador
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('goals_count')
        .eq('id', goal.player_id)
        .single();

      if (playerError) {
        console.error('Erro ao buscar jogador:', playerError);
        return;
      }

      if (player) {
        const newGoalsCount = Math.max(0, (player.goals_count || 0) - 1);
        const { error: updateError } = await supabase
          .from('players')
          .update({ goals_count: newGoalsCount })
          .eq('id', goal.player_id);

        if (updateError) {
          console.error('Erro ao atualizar contagem de gols:', updateError);
        }
      }
    } catch (error: any) {
      console.error('Erro ao deletar gol:', error);
      throw error;
    }
  },

  deleteByGameId: async (gameId: number): Promise<void> => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('game_id', gameId);

    if (error) {
      console.error('Erro ao deletar gols:', error);
      throw error;
    }
  }
}; 