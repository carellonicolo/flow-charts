# Flow Charts

> Editor e esecutore di diagrammi di flusso per la visualizzazione algoritmica

[![Licenza MIT](https://img.shields.io/badge/Licenza-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-ff0072)](https://reactflow.dev/)
[![GitHub stars](https://img.shields.io/github/stars/carellonicolo/flow-charts?style=social)](https://github.com/carellonicolo/flow-charts)
[![GitHub issues](https://img.shields.io/github/issues/carellonicolo/flow-charts)](https://github.com/carellonicolo/flow-charts/issues)

## Panoramica

Flow Charts e un editor web interattivo per la creazione e l'esecuzione di diagrammi di flusso algoritmici. Consente di costruire visualmente un flowchart con blocchi di inizio, fine, processo, decisione e input/output, e di eseguirlo passo-passo osservando il flusso di esecuzione e l'output nella console integrata.

Lo strumento e pensato per studenti di programmazione e informatica che studiano la progettazione algoritmica attraverso i diagrammi di flusso, e per docenti che necessitano di uno strumento visuale per le lezioni.

## Funzionalita Principali

- **Editor drag-and-drop** — Costruzione visuale di flowchart con React Flow
- **Esecuzione passo-passo** — Simulazione del flusso con evidenziazione del blocco corrente
- **Validazione sintattica** — Verifica della correttezza del diagramma prima dell'esecuzione
- **Console integrata** — Output dell'esecuzione e gestione input/output
- **Esportazione** — Export del diagramma in PNG, JPEG e PDF
- **Personalizzazione** — Temi di colore e modalita chiaro/scuro
- **Responsive** — Pannello laterale e console adattabili su mobile

## Tech Stack

| Tecnologia | Utilizzo |
|:--|:--|
| ![React](https://img.shields.io/badge/React_19-61dafb?logo=react&logoColor=white) | Framework UI |
| ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?logo=typescript&logoColor=white) | Linguaggio tipizzato |
| ![Vite](https://img.shields.io/badge/Vite_5-646cff?logo=vite&logoColor=white) | Build tool |
| ![React Flow](https://img.shields.io/badge/React_Flow-ff0072) | Diagrammi interattivi |
| ![jsPDF](https://img.shields.io/badge/jsPDF-f44336) | Esportazione PDF |

## Requisiti

- **Node.js** >= 18
- **npm** >= 9 (oppure bun)

## Installazione

```bash
git clone https://github.com/carellonicolo/flow-charts.git
cd flow-charts
npm install
npm run dev
```

L'applicazione sara disponibile su `http://localhost:5173`.

## Utilizzo

1. Trascina i blocchi dalla toolbar nella canvas
2. Collega i blocchi per definire il flusso
3. Configura le condizioni nei blocchi di decisione
4. Esegui il diagramma e osserva l'output nella console

## Struttura del Progetto

```
flow-charts/
├── src/
│   ├── components/     # Componenti React (editor, nodi, console)
│   ├── lib/            # Motore di esecuzione flowchart
│   ├── pages/          # Pagine dell'applicazione
│   └── hooks/          # Custom hooks
├── public/             # Asset statici
├── index.html          # Entry point HTML
└── vite.config.ts      # Configurazione Vite
```

## Deploy

```bash
npm run build
```

La cartella `dist/` e deployabile su Cloudflare Pages, Netlify, Vercel o qualsiasi hosting statico.

## Contribuire

I contributi sono benvenuti! Consulta le [linee guida per contribuire](CONTRIBUTING.md) per maggiori dettagli.

## Licenza

Distribuito con licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli completi.

## Autore

**Nicolo Carello**
- GitHub: [@carellonicolo](https://github.com/carellonicolo)
- Website: [nicolocarello.it](https://nicolocarello.it)

---

<sub>Sviluppato con l'ausilio dell'intelligenza artificiale.</sub>

## Progetti Correlati

Questo progetto fa parte di una collezione di strumenti didattici e applicazioni open-source:

| Progetto | Descrizione |
|:--|:--|
| [DFA Visual Editor](https://github.com/carellonicolo/AFS) | Editor visuale per automi DFA |
| [Turing Machine](https://github.com/carellonicolo/Turing-Machine) | Simulatore di Macchina di Turing |
| [Scheduler](https://github.com/carellonicolo/Scheduler) | Simulatore di scheduling CPU |
| [Subnet Calculator](https://github.com/carellonicolo/Subnet) | Calcolatore subnet IPv4/IPv6 |
| [Base Converter](https://github.com/carellonicolo/base-converter) | Suite di conversione multi-funzionale |
| [Gioco del Lotto](https://github.com/carellonicolo/giocodellotto) | Simulatore Lotto e SuperEnalotto |
| [MicroASM](https://github.com/carellonicolo/microasm) | Simulatore assembly |
| [Cypher](https://github.com/carellonicolo/cypher) | Toolkit di crittografia |
| [Snake](https://github.com/carellonicolo/snake) | Snake game retro |
| [Pong](https://github.com/carellonicolo/pongcarello) | Pong game |
| [Calculator](https://github.com/carellonicolo/calculator-carello) | Calcolatrice scientifica |
| [IPSC Score](https://github.com/carellonicolo/IPSC) | Calcolatore punteggi IPSC |
| [Quiz](https://github.com/carellonicolo/quiz) | Piattaforma quiz scolastici |
| [Carello Hub](https://github.com/carellonicolo/carello-hub) | Dashboard educativa |
| [Prof Carello](https://github.com/carellonicolo/prof-carello) | Gestionale lezioni private |
| [DOCSITE](https://github.com/carellonicolo/DOCSITE) | Piattaforma documentale |
