import React from 'react';

import { Play, Square, ArrowRight, Save, LogOut, Diamond, HelpCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import {
    StartNodePreview,
    EndNodePreview,
    ProcessNodePreview,
    DecisionNodePreview,
    InputNodePreview,
    OutputNodePreview,
    CommentNodePreview
} from './NodePreviews';

export interface HelpContent {
    description: string;
    usage: string;
    example: string;
    theory?: string;
    theoryDescription?: string;
    theoryFeatures?: Array<{ icon: string; title: string; description: string; color: string }>;
    theorySteps?: Array<{ number: number; title: string; description: string }>;
    theoryTips?: Array<{ text: string; type: 'success' | 'info' | 'warning' }>;
    image?: string;
    preview?: React.ReactNode;
    features?: Array<{ icon: string; title: string; description: string; color: string }>;
    steps?: Array<{ number: number; title: string; description: string }>;
    tips?: Array<{ text: string; type: 'success' | 'info' | 'warning' }>;
}

const SidebarItem = ({ type, label, description, icon: Icon, color, helpContent, onHelp }: any) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', nodeLabel);
        event.dataTransfer.effectAllowed = 'move';

        // Create better drag preview for input/output nodes
        if (nodeType === 'input' || nodeType === 'output') {
            // Create a DOM element as drag preview
            const dragPreview = document.createElement('div');
            dragPreview.style.cssText = `
                position: absolute;
                top: -1000px;
                left: -1000px;
                padding: 16px;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                border-radius: 8px;
                min-width: 160px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                font-weight: bold;
                font-size: 1.1rem;
                transform: skew(-10deg);
                pointer-events: none;
            `;
            dragPreview.innerHTML = `<div style="transform: skew(10deg)">${nodeLabel}</div>`;
            document.body.appendChild(dragPreview);

            // Set it as drag image
            event.dataTransfer.setDragImage(dragPreview, 80, 40);

            // Remove after drag starts
            setTimeout(() => {
                if (document.body.contains(dragPreview)) {
                    document.body.removeChild(dragPreview);
                }
            }, 0);
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

interface SidebarProps {
    onOpenHelp: (title: string, content: HelpContent | string) => void;
}

export const Sidebar = ({ onOpenHelp }: SidebarProps) => {
    const { t } = useTranslation();

    const openHelp = (title: string, content: HelpContent | string) => {
        console.log('🔍 openHelp chiamato:', title);
        console.log('📄 Contenuto:', content);
        onOpenHelp(title, content);
        console.log('✅ openHelp callback eseguita');
    };

    return (
        <aside className="glass-panel sidebar-container">
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {t('sidebar.instruction')}
            </div>

            <SidebarItem
                type="start"
                label={t('sidebar.nodes.start.label')}
                description={t('sidebar.nodes.start.description')}
                icon={Play}
                color="var(--node-start-bg)"
                helpContent={{
                    description: "Il blocco Start rappresenta il punto di partenza del tuo flowchart. Ogni diagramma di flusso deve iniziare con questo blocco.",
                    usage: "Trascina questo blocco nell'editor come primo elemento del tuo programma. Da qui partirà l'esecuzione del tuo algoritmo.",
                    example: "Ogni flowchart inizia sempre con Start:\n\nStart → Process → End",
                    preview: <StartNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="process"
                label={t('sidebar.nodes.process.label')}
                description={t('sidebar.nodes.process.description')}
                icon={ArrowRight}
                color="var(--node-process-bg)"
                helpContent={{
                    description: "Il blocco Process esegue operazioni, calcoli o assegnazioni di valori alle variabili. È il blocco più usato per elaborare i dati.",
                    usage: "Clicca sul blocco per aprire il pannello proprietà. Inserisci il nome della variabile e l'espressione da calcolare. Esempio: variabile 'x' con espressione 'x + 1' incrementa x di 1.",
                    example: "Assegnazione semplice:\nx = 5\n\nCalcolo:\nrisultato = (a + b) * 2\n\nIncremento:\ncontatore = contatore + 1",
                    preview: <ProcessNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="decision"
                label={t('sidebar.nodes.decision.label')}
                description={t('sidebar.nodes.decision.description')}
                icon={Diamond}
                color="var(--node-decision-bg)"
                helpContent={{
                    description: "Il blocco Decision crea un bivio nel programma. Valuta una condizione booleana (vera/falsa) e sceglie quale percorso seguire.",
                    usage: "Imposta una condizione logica nelle proprietà del blocco. Il ramo 'True' si esegue se la condizione è vera, il ramo 'False' se è falsa. Collega i connettori corretti ai blocchi successivi.",
                    example: "Esempi di condizioni:\n\nx > 10\neta >= 18\nnome == \"Mario\"\n(a > 5) && (b < 20)\nispari == true",
                    preview: <DecisionNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="input"
                label={t('sidebar.nodes.input.label')}
                description={t('sidebar.nodes.input.description')}
                icon={Save}
                color="var(--node-input-bg)"
                helpContent={{
                    description: "Il blocco Input permette di chiedere dati all'utente durante l'esecuzione. Il valore inserito viene salvato in una variabile.",
                    usage: "Specifica il nome della variabile dove salvare l'input e un messaggio opzionale da mostrare all'utente. Durante l'esecuzione, apparirà una finestra di input nella console.",
                    example: "Input semplice:\nVariabile: nome\nMessaggio: \"Inserisci il tuo nome\"\n\nInput numerico:\nVariabile: eta\nMessaggio: \"Quanti anni hai?\"",
                    preview: <InputNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="output"
                label={t('sidebar.nodes.output.label')}
                description={t('sidebar.nodes.output.description')}
                icon={LogOut}
                color="var(--node-input-bg)"
                helpContent={{
                    description: "Il blocco Output mostra messaggi o valori di variabili nella console. Utile per visualizzare risultati o informazioni durante l'esecuzione.",
                    usage: "Inserisci un'espressione o un testo tra virgolette. Puoi stampare variabili, calcoli o messaggi fissi. I risultati appariranno nella console in basso.",
                    example: "Stampa testo:\n\"Benvenuto!\"\n\nStampa variabile:\nx\n\nStampa combinata:\n\"Il risultato è: \" + risultato\n\nStampa calcolo:\nx * 2",
                    preview: <OutputNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="comment"
                label={t('sidebar.nodes.comment.label')}
                description={t('sidebar.nodes.comment.description')}
                icon={MessageSquare}
                color="#fbbf24"
                helpContent={{
                    description: "Il blocco Comment ti permette di aggiungere note e spiegazioni al tuo flowchart senza influenzare l'esecuzione del programma.",
                    usage: "Usa i commenti per documentare il codice, spiegare logiche complesse o lasciare promemoria. I commenti vengono ignorati durante l'esecuzione.",
                    example: "Esempi di commenti:\n\n\"Questo blocco calcola la media\"\n\n\"TODO: aggiungere controllo errori\"\n\n\"Algoritmo di ordinamento bubble sort\"",
                    preview: <CommentNodePreview />
                }}
                onHelp={openHelp}
            />
            <SidebarItem
                type="end"
                label={t('sidebar.nodes.end.label')}
                description={t('sidebar.nodes.end.description')}
                icon={Square}
                color="var(--node-end-bg)"
                helpContent={{
                    description: "Il blocco End rappresenta la fine del programma. Quando l'esecuzione raggiunge questo blocco, il flowchart termina.",
                    usage: "Posiziona questo blocco alla fine del tuo flowchart o alla fine di ogni percorso possibile. Ogni programma deve avere almeno un blocco End.",
                    example: "Struttura base:\nStart → Process → Output → End\n\nCon decisione:\nStart → Decision\n  ├─ True → Process → End\n  └─ False → End",
                    preview: <EndNodePreview />
                }}
                onHelp={openHelp}
            />

            {/* Footer con email */}
            <div style={{
                marginTop: 'auto',
                padding: '16px',
                borderTop: '1px solid var(--glass-border)',
                textAlign: 'center'
            }}>
                <a
                    href="mailto:info@nicolocarello.it"
                    style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    info@nicolocarello.it
                </a>
            </div>
        </aside>
    );
};
