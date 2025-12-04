import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/contexts/QuizContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Play } from 'lucide-react';
import SpinWheel, { SpinWheelRef } from '@/components/SpinWheel';

const Roulette = () => {
    const navigate = useNavigate();
    const { teams, quizData } = useQuiz();
    const { theme } = useTheme();
    const [activeWheel, setActiveWheel] = useState<string | null>(null);

    const teamWheelRef = useRef<SpinWheelRef>(null);
    const categoryWheelRef = useRef<SpinWheelRef>(null);
    const difficultyWheelRef = useRef<SpinWheelRef>(null);

    if (!quizData) {
        navigate('/');
        return null;
    }

    // Prepare data for wheels
    const teamItems = teams.map(team => ({
        label: team.name,
        color: `hsl(var(--${team.color}))`,
        id: team.id
    }));

    const categoryItems = quizData.categories.map((cat, index) => ({
        label: cat,
        id: index
    }));

    // Extract unique difficulty values
    const difficultyValues = Array.from(new Set(
        quizData.questions.flat().map(q => q.value)
    )).sort((a, b) => a - b);

    const difficultyItems = difficultyValues.map(val => ({
        label: val.toString(),
        id: val
    }));

    const handleSpinAll = () => {
        setActiveWheel('all');
        teamWheelRef.current?.spin();
        categoryWheelRef.current?.spin();
        difficultyWheelRef.current?.spin();
    };

    return (
        <div className={`h-screen flex flex-col p-4 ${theme === 'lcars' ? 'bg-black' : 'bg-gradient-to-b from-slate-900 to-slate-800'} overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2 relative z-50 shrink-0">
                <Button variant="ghost" onClick={() => navigate('/game')} className="text-white hover:text-white/80">
                    <ArrowLeft className="mr-2 h-6 w-6" />
                    Torna al Gioco
                </Button>
                {/* Title removed as per user request */}
                <div className="w-[100px]" /> {/* Spacer for centering */}
            </div>

            {/* Main Container - Triangle Layout */}
            <div className="relative flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">

                {/* Top Row: Team and Category */}
                <div className="flex justify-center gap-8 md:gap-32 w-full mb-12 md:mb-24 items-center">
                    <div onClick={() => setActiveWheel('team')} className="relative">
                        <SpinWheel
                            ref={teamWheelRef}
                            title="SQUADRA"
                            items={teamItems}
                            onSpinEnd={(res) => console.log('Team selected:', res)}
                            isActive={activeWheel === 'team'}
                            isSpinningAll={activeWheel === 'all' || activeWheel === null}
                        />
                    </div>
                    <div onClick={() => setActiveWheel('category')} className="relative">
                        <SpinWheel
                            ref={categoryWheelRef}
                            title="CATEGORIA"
                            items={categoryItems}
                            onSpinEnd={(res) => console.log('Category selected:', res)}
                            isActive={activeWheel === 'category'}
                            isSpinningAll={activeWheel === 'all' || activeWheel === null}
                        />
                    </div>
                </div>

                {/* Center Button - Absolute */}
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                    <Button
                        className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white shadow-[0_0_30px_rgba(255,0,0,0.5)] text-white font-bold text-lg animate-pulse hover:scale-110 transition-transform"
                        onClick={handleSpinAll}
                    >
                        <div className="flex flex-col items-center">
                            <Play className="h-8 w-8 mb-1 fill-current" />
                            <span>SPIN</span>
                        </div>
                    </Button>
                </div>

                {/* Bottom Row: Difficulty */}
                <div className="flex justify-center w-full">
                    <div onClick={() => setActiveWheel('difficulty')} className="relative">
                        <SpinWheel
                            ref={difficultyWheelRef}
                            title="DIFFICOLTÀ"
                            items={difficultyItems}
                            onSpinEnd={(res) => console.log('Difficulty selected:', res)}
                            isActive={activeWheel === 'difficulty'}
                            isSpinningAll={activeWheel === 'all' || activeWheel === null}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Roulette;
