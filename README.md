# 📊 FlowChart Learning Studio

Un'applicazione web interattiva per imparare i fondamenti della programmazione attraverso flow chart e pseudocodice.

## ✨ Caratteristiche

### 🎨 Editor Flow Chart Drag & Drop
- Interfaccia visuale intuitiva con drag & drop
- Blocchi colorati per ogni costrutto di programmazione
- Collegamento facile tra i blocchi
- Modifica tramite doppio click

### 🔄 Conversione Real-Time a Pseudocodice
- Conversione automatica 1:1 da flow chart a pseudocodice
- Aggiornamento in tempo reale mentre costruisci
- Sintassi pseudocodice in italiano chiara e leggibile
- Evidenziazione del blocco in esecuzione

### ▶️ Simulatore di Esecuzione
- Esegui i tuoi algoritmi passo dopo passo
- Console di output interattiva
- Visualizzazione delle variabili in tempo reale
- Controlli per esecuzione, pausa e stop
- Input interattivo durante l'esecuzione
- Protezione contro loop infiniti

### 💾 Salva e Carica
- Salva i tuoi progetti in formato JSON
- Carica progetti salvati in precedenza
- Condividi i tuoi flow chart con altri studenti

## 🧩 Costrutti Supportati

| Blocco | Descrizione | Pseudocodice |
|--------|-------------|--------------|
| **Inizio** | Punto di partenza del programma | `INIZIO` |
| **Fine** | Punto di fine del programma | `FINE` |
| **Input** | Leggi un valore dall'utente | `LEGGI variabile` |
| **Output** | Mostra un valore all'utente | `SCRIVI espressione` |
| **Assegnazione** | Assegna un valore a una variabile | `variabile = espressione` |
| **Decisione** | Condizione if-else | `SE condizione ALLORA ... ALTRIMENTI ... FINE_SE` |
| **Ciclo Mentre** | Loop while | `MENTRE condizione ESEGUI ... FINE_MENTRE` |
| **Ciclo Per** | Loop for | `PER var DA inizio A fine PASSO step ESEGUI ... FINE_PER` |

## 🚀 Come Usare

### Installazione

```bash
npm install
```

### Avvio in Modalità Sviluppo

```bash
npm run dev
```

### Build per Produzione

```bash
npm run build
```

### Anteprima Build

```bash
npm run preview
```

## 📚 Guida Rapida

### 1. Creare un Flow Chart

1. Trascina il blocco **Inizio** dalla sidebar al canvas
2. Aggiungi i blocchi necessari per il tuo algoritmo
3. Collega i blocchi trascinando dalle maniglie (cerchietti)
4. Fai doppio click su un blocco per modificarne i parametri
5. Termina con un blocco **Fine**

### 2. Modificare i Blocchi

- **Doppio click** su qualsiasi blocco per modificarlo
- Inserisci i parametri richiesti (variabili, espressioni, condizioni)
- Il pseudocodice si aggiorna automaticamente in tempo reale

### 3. Eseguire il Programma

1. Clicca sul pulsante **Esegui** nella console
2. Inserisci i valori richiesti quando richiesto
3. Osserva l'esecuzione e l'output nella console
4. Visualizza le variabili in tempo reale

### 4. Esempi

Clicca sul pulsante **Esempi** nell'header per vedere esempi guidati:
- Somma di due numeri
- Conta fino a 10
- E molto altro...

## 🎯 Esempi di Utilizzo

### Esempio 1: Somma di Due Numeri

```
INIZIO
  LEGGI a
  LEGGI b
  somma = a + b
  SCRIVI somma
FINE
```

### Esempio 2: Numero Pari o Dispari

```
INIZIO
  LEGGI numero
  SE numero % 2 == 0 ALLORA
    SCRIVI "Pari"
  ALTRIMENTI
    SCRIVI "Dispari"
  FINE_SE
FINE
```

### Esempio 3: Conta fino a N

```
INIZIO
  LEGGI n
  PER i DA 1 A n PASSO 1 ESEGUI
    SCRIVI i
  FINE_PER
FINE
```

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI moderno
- **TypeScript** - Type safety e autocompletamento
- **Vite** - Build tool veloce e moderno
- **React Flow** - Libreria per editor flow chart
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icone moderne

## 🎓 Obiettivi Didattici

Questa applicazione è progettata per:

1. **Introdurre la logica di programmazione** senza la complessità della sintassi
2. **Visualizzare il flusso di esecuzione** in modo chiaro e intuitivo
3. **Collegare flow chart e pseudocodice** con mapping 1:1
4. **Permettere sperimentazione** con feedback immediato
5. **Preparare gli studenti** al passaggio a linguaggi di programmazione reali

## 📖 Per gli Insegnanti

### Suggerimenti per l'Uso in Classe

- Iniziate con esempi semplici (input/output)
- Introducete gradualmente le condizioni
- Fate esercitare con i cicli
- Incoraggiate gli studenti a sperimentare
- Usate la funzione Salva/Carica per raccogliere i compiti

### Progressione Suggerita

1. **Settimana 1-2**: Sequenze lineari (input, output, assegnazione)
2. **Settimana 3-4**: Condizioni (if-else)
3. **Settimana 5-6**: Cicli (while e for)
4. **Settimana 7-8**: Algoritmi complessi combinando tutti i costrutti

## 🤝 Contribuire

Questo progetto è aperto a contributi! Se hai idee per miglioramenti:

1. Fork il repository
2. Crea un branch per la tua feature
3. Commit le tue modifiche
4. Push al branch
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è distribuito sotto licenza MIT.

## 👨‍💻 Autore

Creato con ❤️ per rendere la programmazione accessibile a tutti gli studenti.

---

**Buon apprendimento! 🚀**
