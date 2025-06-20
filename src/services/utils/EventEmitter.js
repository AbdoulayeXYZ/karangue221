// src/services/utils/EventEmitter.js

class EventEmitter {
  constructor() {
    this.events = {};
    this.maxListeners = 10;
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    if (this.events[event].length >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event '${event}'`);
    }
    
    this.events[event].push(listener);
    return this;
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    
    return this.on(event, onceWrapper);
  }

  off(event, listenerToRemove) {
    if (!this.events[event]) {
      return this;
    }

    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
    
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) {
      return false;
    }

    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
    
    return true;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this.maxListeners;
  }

  eventNames() {
    return Object.keys(this.events);
  }
}

export { EventEmitter };