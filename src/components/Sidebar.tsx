import React, { useState } from 'react';

import { Play, Square, ArrowRight, Save, LogOut, Diamond, Github, Mail, HelpCircle, MessageSquare } from 'lucide-react';
import { HelpModal } from './HelpModal';

const SidebarItem = ({ type, label, description, icon: Icon, color, helpContent, onHelp }: any) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', nodeLabel);
        event.dataTransfer.effectAllowed = 'move';
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
    const [modalContent, setModalContent] = useState('');

    const openHelp = (title: string, content: string) => {
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
                Drag and drop nodes to the editor.
            </div>

            <SidebarItem
                type="start"
                label="Start"
                description="Inizio del flusso"
                icon={Play}
                color="var(--node-start-bg)"
                helpContent="Il punto di partenza del tuo algoritmo. Ogni flowchart deve averne uno."
                onHelp={openHelp}
            />
            <SidebarItem
                type="process"
                label="Process"
                description="Esegue un'azione"
                icon={ArrowRight}
                color="var(--node-process-bg)"
                helpContent="Esegue calcoli o assegnazioni (es. x = x + 1)."
                onHelp={openHelp}
            />
            <SidebarItem
                type="decision"
                label="Decision"
                description="Controlla condizione"
                icon={Diamond}
                color="var(--node-decision-bg)"
                helpContent="Bivio logico. Se la condizione è vera va da una parte, altrimenti dall'altra."
                onHelp={openHelp}
            />
            <SidebarItem
                type="input"
                label="Input"
                description="Legge un valore"
                icon={Save}
                color="var(--node-input-bg)"
                helpContent="Chiede un dato all'utente e lo salva in una variabile."
                onHelp={openHelp}
            />
            <SidebarItem
                type="output"
                label="Output"
                description="Stampa un valore"
                icon={LogOut}
                color="var(--node-input-bg)"
                helpContent="Mostra un messaggio o il valore di una variabile a schermo."
                onHelp={openHelp}
            />
            <SidebarItem
                type="comment"
                label="Comment"
                description="Nota testuale"
                icon={MessageSquare}
                color="#fbbf24"
                helpContent="Aggiungi una nota o un commento che non influenza l'esecuzione del programma."
                onHelp={openHelp}
            />
            <SidebarItem
                type="end"
                label="End"
                description="Fine del flusso"
                icon={Square}
                color="var(--node-end-bg)"
                helpContent="Termina l'esecuzione del flowchart."
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
