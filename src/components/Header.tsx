import { Menu, Play, Square, Terminal, Sun, Moon, Github, Globe, ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation, type Language } from '../i18n/i18nContext';
import { useState, useRef, useEffect } from 'react';
import { HelpModal } from './HelpModal';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isExecuting: boolean;
  onRun: () => void;
  onToggleSidebar: () => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  onLoadExample: (example: string) => void;
}

export const Header = ({
  theme,
  onToggleTheme,
  isExecuting,
  onRun,
  onToggleSidebar,
  isConsoleOpen,
  onToggleConsole,
  onLoadExample,
}: HeaderProps) => {
  const { t, language, changeLanguage } = useTranslation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const handleLanguageSelect = (lang: Language) => {
    changeLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
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

        {/* Load Example Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) onLoadExample(e.target.value);
          }}
          className="example-select"
          defaultValue=""
        >
          <option value="" disabled>{t('header.loadExample')}</option>
          <option value="hello">{t('header.examples.hello')}</option>
          <option value="counter">{t('header.examples.counter')}</option>
          <option value="sum">{t('header.examples.sum')}</option>
          <option value="evenodd">{t('header.examples.evenodd')}</option>
          <option value="max3">{t('header.examples.max3')}</option>
          <option value="factorial">{t('header.examples.factorial')}</option>
        </select>

        {/* Run/Stop Button */}
        <button
          className="btn btn-primary"
          onClick={onRun}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isExecuting ? '#ef4444' : 'var(--primary-color)',
            transition: 'background 0.3s ease'
          }}
          title={isExecuting ? t('header.stopFlowTitle') : t('header.runFlowTitle')}
        >
          {isExecuting ? <Square size={16} /> : <Play size={16} />}
          <span className="desktop-only">{isExecuting ? t('header.stopFlow') : t('header.runFlow')}</span>
        </button>

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
          theory: t('help.theory'),
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
    </header>
  );
};
