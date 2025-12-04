import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { QuizProvider } from "./contexts/QuizContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import Upload from "./pages/Upload";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Roulette from "./pages/Roulette";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <QuizProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/game" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/roulette" element={<Roulette />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </QuizProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
