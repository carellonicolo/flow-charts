import { Menu, Play, Square, Terminal, Sun, Moon, Github, Globe, ChevronDown, HelpCircle, Library, Trash2, BookOpen, Star, Brain, Trophy } from 'lucide-react';
import { useTranslation, type Language } from '../i18n/i18nContext';
import { useState, useRef, useEffect } from 'react';
import { HelpModal } from './HelpModal';
import { exercises, type Exercise } from '../data/exercises';
import { ExerciseViewModal } from './ExerciseViewModal';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isExecuting: boolean;
  onRun: () => void;
  onClear?: () => void;
  onToggleSidebar: () => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  onLoadExample: (example: string) => void;
  onStartExercise: (description: string) => void;
}

export const Header = ({
  theme,
  onToggleTheme,
  isExecuting,
  onRun,
  onClear,
  onToggleSidebar,
  isConsoleOpen,
  onToggleConsole,
  onLoadExample,
  onStartExercise,
}: HeaderProps) => {
  const { t, language, changeLanguage } = useTranslation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isExampleDropdownOpen, setIsExampleDropdownOpen] = useState(false);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const exampleDropdownRef = useRef<HTMLDivElement>(null);
  const exerciseDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const handleLanguageSelect = (lang: Language) => {
    changeLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (exampleDropdownRef.current && !exampleDropdownRef.current.contains(target)) {
        setIsExampleDropdownOpen(false);
      }
      if (exerciseDropdownRef.current && !exerciseDropdownRef.current.contains(target)) {
        setIsExerciseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="glass-panel header-container">
      {/* Left Section: Logo + Title + Subtitle */}
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Logo"
          className="header-logo"
        />
        <div className="header-title-section">
          <h1 style={{
            margin: 0,
            fontSize: '1.25rem',
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Flow Chart</span>
            <span className="beta-badge" style={{
              fontSize: '0.5rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 'bold',
              letterSpacing: '1px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
              lineHeight: '1'
            }}>
              BETA
            </span>
          </h1>
          <span className="header-subtitle">Powered by prof. Carello</span>
        </div>
      </div>

      {/* Center Section: Controls */}
      <div className="header-controls">
        {/* Mobile Menu Toggle */}
        <button
          className="btn btn-icon mobile-only"
          onClick={onToggleSidebar}
          title={t('header.toggleMenu')}
        >
          <Menu size={20} />
        </button>

        {/* Center Section: Command Capsule */}
        <div className="command-capsule-wrapper">
          <div className="command-capsule">
            <div className={`status-led ${isExecuting ? 'active' : ''}`} />

            <button
              className={`capsule-btn primary ${isExecuting ? 'executing' : ''}`}
              onClick={onRun}
              title={isExecuting ? t('header.stopFlowTitle') : t('header.runFlowTitle')}
            >
              {isExecuting ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              <span className="btn-label">{isExecuting ? t('header.stopFlow') : t('header.runFlow')}</span>
            </button>

            <div className="capsule-divider" />

            <button
              className="capsule-btn secondary"
              onClick={onClear}
              title={t('sidebar.clear')}
              disabled={isExecuting}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Console Toggle */}
        <button
          className={`btn btn-icon mobile-only ${isConsoleOpen ? 'active' : ''}`}
          onClick={onToggleConsole}
          title={t('header.toggleConsole')}
          style={{ color: isConsoleOpen ? 'var(--primary-color)' : 'inherit' }}
        >
          <Terminal size={20} />
        </button>
      </div>

      {/* Right Section: Theme Toggle + Language Toggle + Footer Links */}
      <div className="header-right">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-icon"
          title={t('header.toggleTheme')}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Examples Dropdown */}
        <div ref={exampleDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsExampleDropdownOpen(!isExampleDropdownOpen)}
            className={`btn btn-icon ${isExampleDropdownOpen ? 'active' : ''}`}
            title={t('header.loadExample')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Library size={20} color={isExampleDropdownOpen ? 'var(--primary-color)' : 'currentColor'} />
            <ChevronDown size={14} style={{
              transition: 'transform 0.2s',
              transform: isExampleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} />
          </button>

          {isExampleDropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '220px',
                padding: '8px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                animation: 'slideInDown 0.2s ease-out'
              }}
            >
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('header.loadExample')}
              </div>
              {[
                { id: 'hello', label: t('header.examples.hello') },
                { id: 'counter', label: t('header.examples.counter') },
                { id: 'sum', label: t('header.examples.sum') },
                { id: 'evenodd', label: t('header.examples.evenodd') },
                { id: 'max3', label: t('header.examples.max3') },
                { id: 'factorial', label: t('header.examples.factorial') }
              ].map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onLoadExample(ex.id);
                    setIsExampleDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '12px';
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exercises Library Dropdown */}
        <div ref={exerciseDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsExerciseDropdownOpen(!isExerciseDropdownOpen)}
            className={`btn btn-icon ${isExerciseDropdownOpen ? 'active' : ''}`}
            title={language === 'it' ? 'Libreria Esercizi (100+)' : 'Exercises Library (100+)'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <BookOpen size={20} color={isExerciseDropdownOpen ? 'var(--primary-color)' : 'currentColor'} />
            <ChevronDown size={14} style={{
              transition: 'transform 0.2s',
              transform: isExerciseDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} />
          </button>

          {isExerciseDropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '12px',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                animation: 'slideInDown 0.2s ease-out'
              }}
            >
              <div style={{ padding: '4px 8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                {language === 'it' ? '100 Esercizi di Logica' : '100 Logic Exercises'}
              </div>

              {(['beginner', 'intermediate', 'advanced'] as const).map((cat) => (
                <div key={cat} style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: cat === 'beginner' ? '#10b981' : cat === 'intermediate' ? '#f59e0b' : '#ef4444',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px',
                    marginBottom: '6px'
                  }}>
                    {cat === 'beginner' ? <Star size={12} /> : cat === 'intermediate' ? <Brain size={12} /> : <Trophy size={12} />}
                    {cat === 'beginner' ? (language === 'it' ? 'PRINCIPIANTE' : 'BEGINNER') :
                      cat === 'intermediate' ? (language === 'it' ? 'INTERMEDIO' : 'INTERMEDIATE') :
                        (language === 'it' ? 'AVANZATO' : 'ADVANCED')}
                  </div>
                  <div style={{ display: 'grid', gap: '2px' }}>
                    {exercises.filter(ex => ex.category === cat).map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          setSelectedExercise(ex);
                          setIsExerciseDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text-color)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ opacity: 0.5, fontSize: '0.7rem', fontFamily: 'monospace' }}>#{ex.id}</span>
                        {language === 'it' ? ex.title.it : ex.title.en}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Button */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="btn btn-icon"
          title={t('header.help')}
        >
          <HelpCircle size={20} />
        </button>

        {/* Language Dropdown */}
        <div ref={languageDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="btn btn-icon"
            title={t('header.switchLanguage')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Globe size={18} />
            <ChevronDown size={14} style={{
              transition: 'transform 0.2s',
              transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} />
          </button>

          {isLanguageDropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '160px',
                padding: '8px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: language === lang.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <span style={{ fontWeight: language === lang.code ? 'bold' : 'normal' }}>
                    {lang.label}
                  </span>
                  {language === lang.code && (
                    <span style={{ marginLeft: 'auto', color: 'var(--primary-color)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/nicolocarello/flow-charts"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-icon header-link"
          title={t('header.githubRepo')}
        >
          <Github size={20} />
        </a>
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title={t('help.title')}
        content={{
          description: t('help.description'),
          usage: t('help.usage'),
          example: t('help.example'),
          theoryDescription: language === 'it'
            ? "I diagrammi di flusso (flowchart) sono uno strumento universale per la rappresentazione grafica di algoritmi, processi e flussi di lavoro. Inventati da Frank Gilbreth nel 1921 e successivamente standardizzati da ANSI e ISO, questi diagrammi permettono di scomporre problemi complessi in passi elementari comprensibili a chiunque.\n\nIn informatica, sono il ponte fondamentale tra l'idea logica e la scrittura del codice sorgente. Utilizzare un flowchart permette di analizzare la correttezza di un algoritmo, identificare potenziali bug strutturali e documentare procedure in modo che siano indipendenti dal linguaggio di programmazione utilizzato."
            : "Flowcharts are a universal tool for the graphical representation of algorithms, processes, and workflows. Invented by Frank Gilbreth in 1921 and later standardized by ANSI and ISO, these diagrams allow complex problems to be broken down into elementary steps understandable by anyone.\n\nIn computer science, they are the fundamental bridge between a logical idea and writing source code. Using a flowchart allows you to analyze the correctness of an algorithm, identify potential structural bugs, and document procedures so they are independent of the programming language used.",
          theoryFeatures: [
            {
              image: '/help_start_end.png',
              title: language === 'it' ? 'Terminatori (Start/End)' : 'Terminators (Start/End)',
              description: language === 'it'
                ? 'Rappresentati da una forma a capsula. Ogni flowchart deve avere esattamente un "Inizio" e almeno una "Fine". Definiscono i confini del campo di esecuzione.'
                : 'Represented by a capsule shape. Every flowchart must have exactly one "Start" and at least one "End". They define the boundaries of the execution field.',
              color: '#10b981'
            },
            {
              image: '/help_process.png',
              title: language === 'it' ? 'Processo / Azione' : 'Process / Action',
              description: language === 'it'
                ? 'Il classico rettangolo indica un\'operazione interna: calcoli matematici, assegnazioni di variabili o manipolazione di dati (es. x = a + b).'
                : 'The classic rectangle indicates an internal operation: mathematical calculations, variable assignments, or data manipulation (e.g., x = a + b).',
              color: '#3b82f6'
            },
            {
              image: '/help_decision.png',
              title: language === 'it' ? 'Decisione (Bivio)' : 'Decision (Fork)',
              description: language === 'it'
                ? 'Il rombo rappresenta un bivio logico basato su una condizione booleana (Vero/Falso). È l\'elemento che permette all\'algoritmo di "ragionare".'
                : 'The rhombus represents a logical fork based on a boolean condition (True/False). It is the element that allows the algorithm to "reason".',
              color: '#f59e0b'
            },
            {
              image: '/help_io.png',
              title: language === 'it' ? 'Input / Output' : 'Input / Output',
              description: language === 'it'
                ? 'Il parallelogramma gestisce l\'interazione con l\'esterno: leggere dati inseriti dall\'utente o mostrare i risultati finali sulla console.'
                : 'The parallelogram handles interaction with the outside: reading data entered by the user or displaying final results on the console.',
              color: '#8b5cf6'
            }
          ],
          theorySteps: [
            {
              number: 1,
              title: language === 'it' ? 'Struttura Sequenziale' : 'Sequential Structure',
              description: language === 'it'
                ? 'È la forma più semplice: le istruzioni vengono eseguite linearmente dall\'alto verso il basso, una dopo l\'altra, senza deviazioni.'
                : 'It is the simplest form: instructions are executed linearly from top to bottom, one after the other, without deviations.'
            },
            {
              number: 2,
              title: language === 'it' ? 'La Selezione (If-Then-Else)' : 'Selection (If-Then-Else)',
              description: language === 'it'
                ? 'Consente di eseguire blocchi di istruzioni differenti in base al verificarsi di una condizione logica. Fondamentale per la gestione dei casi.'
                : 'Allows executing different blocks of instructions based on whether a logical condition is met. Fundamental for case management.'
            },
            {
              number: 3,
              title: language === 'it' ? 'L\'Iterazione (Cicli/Loop)' : 'Iteration (Cycles/Loops)',
              description: language === 'it'
                ? 'Permette di ripetere un set di istruzioni finché una condizione rimane vera. È il cuore della potenza di calcolo degli elaboratori.'
                : 'Allows repeating a set of instructions as long as a condition remains true. It is the heart of computers\' processing power.'
            }
          ],
          theoryTips: [
            {
              text: language === 'it'
                ? 'Dichiarazione Variabili: Usa sempre nomi che spieghino il contenuto (es. "somma" invece di "s").'
                : 'Variable Declaration: Always use names that explain the content (e.g., "sum" instead of "s").',
              type: 'info'
            },
            {
              text: language === 'it'
                ? 'Tracciabilità: Un buon flowchart non deve mai avere linee che si incrociano o frecce che non portano a nulla.'
                : 'Traceability: A good flowchart should never have crossing lines or arrows that lead to nowhere.',
              type: 'success'
            },
            {
              text: language === 'it'
                ? 'Atomicità: Ogni blocco "Processo" dovrebbe contenere idealmente un\'unica operazione per massimizzare la chiarezza.'
                : 'Atomicity: Each "Process" block should ideally contain a single operation to maximize clarity.',
              type: 'warning'
            },
            {
              text: language === 'it'
                ? 'Validazione: Testa sempre il tuo diagramma con i "casi limite" (es. input zero o numeri negativi).'
                : 'Validation: Always test your diagram with "edge cases" (e.g., zero input or negative numbers).',
              type: 'info'
            }
          ],
          features: [
            {
              icon: '🎨',
              title: language === 'it' ? 'Interfaccia Drag & Drop' : 'Drag & Drop Interface',
              description: language === 'it'
                ? 'Crea flowchart trascinando blocchi colorati. Facile come un gioco!'
                : 'Create flowcharts by dragging colored blocks. Easy as a game!',
              color: '#6366f1'
            },
            {
              icon: '⚡',
              title: language === 'it' ? 'Esecuzione Istantanea' : 'Instant Execution',
              description: language === 'it'
                ? 'Premi Play e guarda il tuo algoritmo prendere vita in tempo reale'
                : 'Press Play and watch your algorithm come to life in real time',
              color: '#10b981'
            },
            {
              icon: '🔍',
              title: language === 'it' ? 'Debug Visuale' : 'Visual Debugging',
              description: language === 'it'
                ? 'Vedi esattamente dove va il tuo programma, passo dopo passo'
                : 'See exactly where your program goes, step by step',
              color: '#f59e0b'
            },
            {
              icon: '🌍',
              title: language === 'it' ? 'Multilingua IT/EN' : 'Multilingual IT/EN',
              description: language === 'it'
                ? 'Studia nella tua lingua preferita con un click'
                : 'Study in your preferred language with one click',
              color: '#8b5cf6'
            },
            {
              icon: '💾',
              title: language === 'it' ? 'Salva & Condividi' : 'Save & Share',
              description: language === 'it'
                ? 'Esporta i tuoi flowchart come immagini o JSON'
                : 'Export your flowcharts as images or JSON',
              color: '#3b82f6'
            },
            {
              icon: '📚',
              title: language === 'it' ? 'Esempi Pronti' : 'Ready Examples',
              description: language === 'it'
                ? 'Impara da 6+ esempi già pronti: loop, condizioni, calcoli'
                : 'Learn from 6+ ready examples: loops, conditions, calculations',
              color: '#ef4444'
            }
          ],
          steps: [
            {
              number: 1,
              title: language === 'it' ? 'Scegli i Blocchi' : 'Choose Blocks',
              description: language === 'it'
                ? 'Dalla sidebar a sinistra, trascina i blocchi colorati nel canvas centrale. Ogni colore ha un significato: verde=inizio, blu=azione, arancione=decisione!'
                : 'From the left sidebar, drag the colored blocks into the central canvas. Each color has meaning: green=start, blue=action, orange=decision!'
            },
            {
              number: 2,
              title: language === 'it' ? 'Collega il Flusso' : 'Connect the Flow',
              description: language === 'it'
                ? 'Clicca e trascina dai punti di connessione (pallini bianchi) per creare frecce che collegano i blocchi. Il flusso va sempre dall\'alto verso il basso!'
                : 'Click and drag from connection points (white dots) to create arrows connecting blocks. Flow always goes top to bottom!'
            },
            {
              number: 3,
              title: language === 'it' ? 'Configura le Proprietà' : 'Configure Properties',
              description: language === 'it'
                ? 'Fai doppio click su un blocco per aprire il pannello proprietà. Qui scrivi espressioni (x=5), condizioni (x>10) o variabili!'
                : 'Double-click a block to open the properties panel. Here write expressions (x=5), conditions (x>10) or variables!'
            },
            {
              number: 4,
              title: language === 'it' ? 'Premi Play!' : 'Press Play!',
              description: language === 'it'
                ? 'Clicca il pulsante ▶️ Esegui Flusso nell\'header. La console in basso mostrerà l\'output. Se ci sono blocchi Input, ti chiederà di inserire valori!'
                : 'Click the ▶️ Run Flow button in the header. The console below will show output. If there are Input blocks, it will ask for values!'
            }
          ],
          tips: [
            {
              text: language === 'it'
                ? 'Ogni flowchart DEVE iniziare con un blocco Start (verde) e finire con End (rosso)!'
                : 'Every flowchart MUST start with a Start block (green) and end with End (red)!',
              type: 'success'
            },
            {
              text: language === 'it'
                ? 'Usa i blocchi Comment (gialli) per documentare il tuo codice. Gli insegnanti lo adorano! 📝'
                : 'Use Comment blocks (yellow) to document your code. Teachers love it! 📝',
              type: 'info'
            },
            {
              text: language === 'it'
                ? 'Il blocco Decision ha 2 uscite: una per Vero (verde) e una per Falso (rossa). Collega entrambe!'
                : 'Decision block has 2 outputs: one for True (green) and one for False (red). Connect both!',
              type: 'warning'
            },
            {
              text: language === 'it'
                ? 'Prova gli esempi dal menu "Carica esempio" per capire meglio come funziona! 🚀'
                : 'Try examples from "Load Example" menu to better understand how it works! 🚀',
              type: 'info'
            }
          ]
        }}
      />

      {/* Exercise Detail Modal */}
      <ExerciseViewModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
        onConfirm={(desc: string) => {
          onStartExercise(desc);
          setSelectedExercise(null);
        }}
      />
    </header>
  );
};
