const IGNORED_EVENTS = new Set([
  'ping',
  'pong',
  'heartbeat',
  'player_ping'
]);

function processRawMessage(rawMessage: any) {
  let jsonString = rawMessage;
  
  if (typeof rawMessage === 'string' && rawMessage.includes('Hit rejected: Enemy is already dead')) {
    self.postMessage({ success: true, eventName: '__CHEAT_DETECTED__', payload: null, parsed: [] });
    // Still continue parsing just in case it's part of a valid packet
  }

  const bracketIndex = jsonString.indexOf('[');
  if (jsonString.startsWith('42') && bracketIndex !== -1) {
    jsonString = jsonString.slice(bracketIndex);
  } else {
    self.postMessage({ success: false, error: 'skip' });
    return;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed) || typeof parsed[0] !== 'string') {
       self.postMessage({ success: false, error: 'invalid_shape' });
       return;
    }
    
    const eventName = parsed[0];
    if (IGNORED_EVENTS.has(eventName)) {
       self.postMessage({ success: false, error: 'skip' });
       return;
    }
    
    // Pass the already parsed object back to the main thread
    self.postMessage({ 
       success: true, 
       parsed, 
       eventName, 
       payload: parsed[1] 
    });
  } catch (err) {
    self.postMessage({ success: false, error: 'parse_error' });
  }
}

self.onmessage = (e) => {
  if (e.data.type === 'INIT_PORT') {
    const port = e.ports[0];
    port.onmessage = (event) => {
      processRawMessage(event.data.rawMessage);
    };
    return;
  }

  if (e.data.rawMessage) {
    processRawMessage(e.data.rawMessage);
  }
};
