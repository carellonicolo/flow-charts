// Tipi per il custom element <carello-shell> (web component, vedi public/carello-shell.js).
// Solo dichiarazioni di tipo: nessun impatto a runtime. Rimuovi per rollback.
// React 19 espone il namespace JSX come React.JSX: si augmenta il modulo 'react'.
import 'react';

type CarelloShellProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  'app-name'?: string;
  'app-icon'?: string;
  accent?: string;
  user?: string;
  'data-hub-url'?: string;
  'data-auth-url'?: string;
  'data-hide-theme'?: boolean | string;
  'data-dash-url'?: string;
  'data-dash-label'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'carello-shell': CarelloShellProps;
    }
  }
}
