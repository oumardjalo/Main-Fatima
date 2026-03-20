// Storage layer using localStorage (adapted from window.storage spec)
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.warn('Storage get error:', key, e);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set error:', key, e);
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage delete error:', key, e);
    }
  },

  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (e) {
      console.warn('Storage list error:', prefix, e);
      return [];
    }
  },

  async clearAll() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('profile') || key.startsWith('daily:') ||
            key.startsWith('habit-definitions') || key.startsWith('achievements') ||
            key.startsWith('saved-foods') || key.startsWith('recipes') ||
            key.startsWith('lessons-read') || key.startsWith('theme')) {
          keys.push(key);
        }
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Storage clearAll error:', e);
    }
  }
};

export default storage;
