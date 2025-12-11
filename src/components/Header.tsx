import { Menu, Play, Square, Terminal, Sun, Moon, Github, Mail } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

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

  const toggleLanguage = () => {
    changeLanguage(language === 'it' ? 'en' : 'it');
  };

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
          <h1 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Flow Chart</span>
            <span style={{
              fontSize: '0.4em',
              padding: '3px 8px',
              borderRadius: '4px',
              background: '#ef4444',
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
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

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="btn btn-icon"
          title={t('header.switchLanguage')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
            {language.toUpperCase()}
          </span>
        </button>

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

        {/* Email Link */}
        <a
          href="mailto:info@nicolocarello.it"
          className="btn btn-icon header-link"
          title={t('header.email')}
        >
          <Mail size={20} />
        </a>
      </div>
    </header>
  );
};
