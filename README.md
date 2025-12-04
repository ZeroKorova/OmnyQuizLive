# Omniquiz

Un'applicazione web per gestire quiz a squadre con tabellone interattivo, punteggi e temi personalizzabili (incluso tema LCARS stile Star Trek).

## Funzionalità
- **Gestione Squadre**: Supporta fino a 30 squadre con colori personalizzati.
- **Tabellone Dinamico**: Carica le domande da un file Excel.
- **Punteggi**: Assegnazione punti, malus e penalità.
- **Temi**: Tema Chiaro e Tema LCARS (Star Trek).
- **Mobile Friendly**: Ottimizzato per tablet e smartphone.

## Come Iniziare

### Prerequisiti
- [Node.js](https://nodejs.org/) installato sul computer.

### Installazione
1. Apri il terminale nella cartella del progetto.
2. Esegui `npm install` per scaricare le dipendenze.

### Avvio
1. Esegui `npm run dev` per avviare l'app.
2. Apri il browser all'indirizzo indicato (solitamente `http://localhost:5173` o `http://localhost:8080`).

## Formato File Excel
Il file Excel deve avere le seguenti colonne (in ordine):
1. **Categoria**: La categoria della domanda (es. "Storia", "Scienza").
2. **Punteggio**: Il valore della domanda (es. 100, 200).
3. **Domanda**: Il testo della domanda.
4. **Risposta**: La risposta corretta.

Esempio:
| Categoria | Punteggio | Domanda | Risposta |
|-----------|-----------|---------|----------|
| Storia    | 100       | Anno scoperta America? | 1492 |
| Scienza   | 200       | Simbolo ossigeno? | O |

## Comandi Utili
- `npm run dev`: Avvia il server di sviluppo.
- `npm run build`: Compila l'app per la produzione.
