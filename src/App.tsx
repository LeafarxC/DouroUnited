import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { MatchProvider } from "./context/MatchContext";
import Index from "./pages/Index";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import TeamBuilder from "./pages/TeamBuilder";
import MatchDetails from "./pages/MatchDetails";
import NotFound from "./pages/NotFound";
import History from './pages/History';
import PlayerStats from './pages/PlayerStats';

const queryClient = new QueryClient();

const App = () => (
  <div className="min-h-screen bg-white">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <MatchProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/players" element={<Players />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/matches/:id" element={<MatchDetails />} />
                <Route path="/team-builder" element={<TeamBuilder />} />
                <Route path="/history" element={<History />} />
                <Route path="/stats" element={<PlayerStats />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MatchProvider>
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;
