// Módulo de logging — substitui console.log/error/warn diretos
// Em produção, os logs são silenciados. Em desenvolvimento, funcionam normalmente.

const isDev = process.env.NODE_ENV === 'development';

const logger = {
  error(message, ...args) {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn(message, ...args) {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info(message, ...args) {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
};

export default logger;
