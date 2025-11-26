/**
 * Animazioni riutilizzabili Apple-like
 * Smooth, naturali e performanti
 */

import { theme } from './theme';

/**
 * Keyframes CSS per animazioni
 */
export const keyframes = {
  // Fade in/out
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,

  fadeOut: `
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `,

  // Slide animations
  slideInFromTop: `
    @keyframes slideInFromTop {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  slideInFromBottom: `
    @keyframes slideInFromBottom {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  slideInFromLeft: `
    @keyframes slideInFromLeft {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  slideInFromRight: `
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,

  scaleOut: `
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.95);
        opacity: 0;
      }
    }
  `,

  // Pulse animation (per nodo corrente in esecuzione)
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05);
      }
    }
  `,

  // Glow effect (per nodo corrente)
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(0, 122, 255, 0.5),
                    0 0 10px rgba(0, 122, 255, 0.3);
      }
      50% {
        box-shadow: 0 0 10px rgba(0, 122, 255, 0.8),
                    0 0 20px rgba(0, 122, 255, 0.5),
                    0 0 30px rgba(0, 122, 255, 0.3);
      }
    }
  `,

  // Ripple effect (per button clicks)
  ripple: `
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
  `,

  // Shimmer loading effect
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,

  // Spin animation (per loading)
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  // Bounce animation (subtle)
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
};

/**
 * Classi CSS per animazioni pronte all'uso
 */
export const animations = {
  // Modal backdrop
  modalBackdrop: {
    enter: `
      animation: fadeIn ${theme.transitions.duration.base} ${theme.transitions.easing.default};
      backdrop-filter: blur(20px);
    `,
    exit: `
      animation: fadeOut ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
    `,
  },

  // Modal content
  modalContent: {
    enter: `
      animation: scaleIn ${theme.transitions.duration.base} ${theme.transitions.easing.default};
    `,
    exit: `
      animation: scaleOut ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
    `,
  },

  // Toolbar slide in
  toolbar: {
    enter: `
      animation: slideInFromTop ${theme.transitions.duration.base} ${theme.transitions.easing.default};
    `,
  },

  // Sidebar slide
  sidebar: {
    enterFromLeft: `
      animation: slideInFromLeft ${theme.transitions.duration.base} ${theme.transitions.easing.default};
    `,
    enterFromRight: `
      animation: slideInFromRight ${theme.transitions.duration.base} ${theme.transitions.easing.default};
    `,
  },

  // Bottom sheet (mobile)
  bottomSheet: {
    enter: `
      animation: slideInFromBottom ${theme.transitions.duration.base} ${theme.transitions.easing.default};
    `,
    exit: `
      animation: slideInFromBottom ${theme.transitions.duration.fast} ${theme.transitions.easing.default} reverse;
    `,
  },

  // Nodo corrente in esecuzione
  executingNode: `
    animation: pulse 1.5s ${theme.transitions.easing.inOut} infinite,
               glow 1.5s ${theme.transitions.easing.inOut} infinite;
  `,

  // Hover subtle
  hoverScale: `
    transition: transform ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
    &:hover {
      transform: scale(1.02);
    }
    &:active {
      transform: scale(0.98);
    }
  `,

  // Button ripple
  buttonRipple: `
    position: relative;
    overflow: hidden;
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    &:active::after {
      width: 300px;
      height: 300px;
    }
  `,

  // Loading spinner
  spinner: `
    animation: spin 1s linear infinite;
  `,

  // Fade transition
  fade: `
    transition: opacity ${theme.transitions.duration.base} ${theme.transitions.easing.default};
  `,

  // Smooth all transitions
  smoothAll: `
    transition: all ${theme.transitions.duration.base} ${theme.transitions.easing.default};
  `,
};

/**
 * Genera tutto il CSS delle animazioni
 */
export const getAnimationCSS = () => {
  return Object.values(keyframes).join('\n');
};

/**
 * Transition presets
 */
export const transitions = {
  // Transition per colori e background
  colors: `transition: background-color ${theme.transitions.duration.base} ${theme.transitions.easing.default},
           color ${theme.transitions.duration.base} ${theme.transitions.easing.default};`,

  // Transition per transform
  transform: `transition: transform ${theme.transitions.duration.base} ${theme.transitions.easing.default};`,

  // Transition per opacity
  opacity: `transition: opacity ${theme.transitions.duration.base} ${theme.transitions.easing.default};`,

  // Transition per box-shadow
  shadow: `transition: box-shadow ${theme.transitions.duration.base} ${theme.transitions.easing.default};`,

  // Transition smooth per theme change
  theme: `transition: background-color ${theme.transitions.duration.slow} ${theme.transitions.easing.default},
          color ${theme.transitions.duration.slow} ${theme.transitions.easing.default},
          border-color ${theme.transitions.duration.slow} ${theme.transitions.easing.default};`,
};
