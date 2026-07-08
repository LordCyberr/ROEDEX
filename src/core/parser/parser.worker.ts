// Web Worker for offloading heavy JSON parsing
self.onmessage = (e) => {
  const { rawMessage } = e.data;
  
  let jsonString = rawMessage;
  if (jsonString.startsWith('42["')) {
    jsonString = jsonString.slice(2);
  } else if (jsonString.startsWith('42/game,[')) {
    jsonString = jsonString.slice(8);
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
    
    if (parsed[0] === 'town:move') {
       self.postMessage({ success: false, error: 'skip' });
       return;
    }
    
    // Pass the already parsed object back to the main thread
    self.postMessage({ 
       success: true, 
       parsed, 
       eventName: parsed[0], 
       payload: parsed[1] 
    });
  } catch (err) {
    self.postMessage({ success: false, error: 'parse_error' });
  }
};
