
import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function resetGame() {
    try {
        console.log("Resetting game state...");
        await setDoc(doc(db, "games", "current"), {
            status: 'WAITING',
            scores: [],
            currentQuestion: null,
            buzzedTeam: null,
            timer: 0,
            gridState: [], // Clear grid
            lastEvent: null
        });
        console.log("Game state hard reset complete.");
        process.exit(0);
    } catch (e) {
        console.error("Reset failed:", e);
        process.exit(1);
    }
}

resetGame();
