import React, { useState } from 'react';

import { Play, Square, ArrowRight, Save, LogOut, Diamond, Github, Mail, HelpCircle, MessageSquare } from 'lucide-react';
import { HelpModal } from './HelpModal';

interface HelpContent {
    description: string;
    usage: string;
    example: string;
    image?: string;
}

const SidebarItem = ({ type, label, description, icon: Icon, color, helpContent, onHelp }: any) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', nodeLabel);
        event.dataTransfer.effectAllowed = 'move';

        // Fix white background for input/output nodes during drag
        if (nodeType === 'input' || nodeType === 'output') {
            // Create a transparent canvas as drag image
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw the node content without white background
                ctx.fillStyle = '#8b5cf6';
                ctx.beginPath();
                // Draw a simple rectangle (skew is visual only, not in drag image)
                ctx.roundRect(10, 10, 140, 60, 8);
                ctx.fill();

                // Set as drag image
                event.dataTransfer.setDragImage(canvas, 80, 40);
            }
        }
    };

    return (
        <div
            className="dndnode"
            onDragStart={(event) => onDragStart(event, type, label)}
            draggable
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '8px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                cursor: 'grab',
                color: 'var(--text-color)',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
        >
            <Icon size={18} color={color} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontWeight: 500, lineHeight: '1.2' }}>{label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{description}</span>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onHelp(label, helpContent);
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
                <HelpCircle size={16} />
            </button>
        </div>
    );
};

export const Sidebar = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState<HelpContent | string>('');

    const openHelp = (title: string, content: HelpContent | string) => {
        setModalTitle(title);
        setModalContent(content);
        setModalOpen(true);
    };

    return (
        <aside className="glass-panel sidebar-container">
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flow Chart</h2>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic', marginLeft: '42px' }}>
                    Powered by prof. Carello
                </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Trascina e rilascia i blocchi nell'editor.
            </div>

            <SidebarItem
                type="start"
                label="Start"
                description="Inizio del flusso"
                icon={Play}
                color="var(--node-start-bg)"
                helpContent={{
                    description: "Il blocco Start rappresenta il punto di partenza del tuo flowchart. Ogni diagramma di flusso deve iniziare con questo blocco.",
                    usage: "Trascina questo blocco nell'editor come primo elemento del tuo programma. Da qui partirà l'esecuzione del tuo algoritmo.",
                    example: "Ogni flowchart inizia sempre con Start:\n\nStart → Process → End"
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="process"
                label="Process"
                description="Esegue un'azione"
                icon={ArrowRight}
                color="var(--node-process-bg)"
                helpContent={{
                    description: "Il blocco Process esegue operazioni, calcoli o assegnazioni di valori alle variabili. È il blocco più usato per elaborare i dati.",
                    usage: "Clicca sul blocco per aprire il pannello proprietà. Inserisci il nome della variabile e l'espressione da calcolare. Esempio: variabile 'x' con espressione 'x + 1' incrementa x di 1.",
                    example: "Assegnazione semplice:\nx = 5\n\nCalcolo:\nrisultato = (a + b) * 2\n\nIncremento:\ncontatore = contatore + 1"
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="decision"
                label="Decision"
                description="Controlla condizione"
                icon={Diamond}
                color="var(--node-decision-bg)"
                helpContent={{
                    description: "Il blocco Decision crea un bivio nel programma. Valuta una condizione booleana (vera/falsa) e sceglie quale percorso seguire.",
                    usage: "Imposta una condizione logica nelle proprietà del blocco. Il ramo 'True' si esegue se la condizione è vera, il ramo 'False' se è falsa. Collega i connettori corretti ai blocchi successivi.",
                    example: "Esempi di condizioni:\n\nx > 10\neta >= 18\nnome == \"Mario\"\n(a > 5) && (b < 20)\nispari == true"
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="input"
                label="Input"
                description="Legge un valore"
                icon={Save}
                color="var(--node-input-bg)"
                helpContent={{
                    description: "Il blocco Input permette di chiedere dati all'utente durante l'esecuzione. Il valore inserito viene salvato in una variabile.",
                    usage: "Specifica il nome della variabile dove salvare l'input e un messaggio opzionale da mostrare all'utente. Durante l'esecuzione, apparirà una finestra di input nella console.",
                    example: "Input semplice:\nVariabile: nome\nMessaggio: \"Inserisci il tuo nome\"\n\nInput numerico:\nVariabile: eta\nMessaggio: \"Quanti anni hai?\""
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="output"
                label="Output"
                description="Stampa un valore"
                icon={LogOut}
                color="var(--node-input-bg)"
                helpContent={{
                    description: "Il blocco Output mostra messaggi o valori di variabili nella console. Utile per visualizzare risultati o informazioni durante l'esecuzione.",
                    usage: "Inserisci un'espressione o un testo tra virgolette. Puoi stampare variabili, calcoli o messaggi fissi. I risultati appariranno nella console in basso.",
                    example: "Stampa testo:\n\"Benvenuto!\"\n\nStampa variabile:\nx\n\nStampa combinata:\n\"Il risultato è: \" + risultato\n\nStampa calcolo:\nx * 2"
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="comment"
                label="Comment"
                description="Nota testuale"
                icon={MessageSquare}
                color="#fbbf24"
                helpContent={{
                    description: "Il blocco Comment ti permette di aggiungere note e spiegazioni al tuo flowchart senza influenzare l'esecuzione del programma.",
                    usage: "Usa i commenti per documentare il codice, spiegare logiche complesse o lasciare promemoria. I commenti vengono ignorati durante l'esecuzione.",
                    example: "Esempi di commenti:\n\n\"Questo blocco calcola la media\"\n\n\"TODO: aggiungere controllo errori\"\n\n\"Algoritmo di ordinamento bubble sort\""
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="end"
                label="End"
                description="Fine del flusso"
                icon={Square}
                color="var(--node-end-bg)"
                helpContent={{
                    description: "Il blocco End rappresenta la fine del programma. Quando l'esecuzione raggiunge questo blocco, il flowchart termina.",
                    usage: "Posiziona questo blocco alla fine del tuo flowchart o alla fine di ogni percorso possibile. Ogni programma deve avere almeno un blocco End.",
                    example: "Struttura base:\nStart → Process → Output → End\n\nCon decisione:\nStart → Decision\n  ├─ True → Process → End\n  └─ False → End"
                }}
                onHelp={openHelp}
            />

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#24292e',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.9rem'
                    }}
                >
                    <Github size={16} />
                    GitHub Repo
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', justifyContent: 'center' }}>
                    <Mail size={14} />
                    <a href="mailto:info@nicolocarello.it" style={{ color: 'inherit', textDecoration: 'none' }}>info@nicolocarello.it</a>
                </div>
            </div>

            <HelpModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                content={modalContent}
            />
        </aside>
    );
};
