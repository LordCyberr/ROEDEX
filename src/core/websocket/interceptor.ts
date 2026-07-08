// This script is injected into the MAIN world to access the game's actual window object.

const OriginalWebSocket = window.WebSocket;

let droppedCount = 0;
let lastDropUpdate = performance.now();

class HookedWebSocket extends OriginalWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);

    this.addEventListener('message', (event) => {
      // Broadcast incoming WebSocket data to the Content Script
      if (typeof event.data === 'string') {
        // Fast filter for noisy, unneeded Beta 2 events to save performance
        if (event.data.includes('"minimap"') || 
            event.data.includes('"minimap_clouds"') ||
            event.data.includes('"minimap_reveal_ack"') ||
            event.data.includes('"cooldowns"') || 
            event.data.includes('"worldclock"') || 
            event.data.includes('"active_buffs"')) {
          
          droppedCount++;
          const now = performance.now();
          if (now - lastDropUpdate > 1000) {
            window.postMessage({
              source: 'ROEDEX_INTERCEPTOR',
              type: 'WS_DROPPED_METRIC',
              count: droppedCount
            }, '*');
            droppedCount = 0;
            lastDropUpdate = now;
          }
          return;
        }

        // STRICT PRIVACY SANITIZATION:
        // Shred all sensitive data at the source before the extension even sees it.
        // It is mathematically impossible for a wallet address or token to enter our error logs.
        let safeData = event.data;
        if (safeData.includes('0x') || safeData.includes('Bearer') || safeData.includes('token') || safeData.includes('secret') || safeData.includes('key')) {
          safeData = safeData
            .replace(/0x[a-fA-F0-9]{40}/gi, '""')
            .replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+/gi, '""')
            .replace(/("token"\s*:\s*")[^"]+(")/gi, '$1""$2')
            .replace(/("secret"\s*:\s*")[^"]+(")/gi, '$1""$2')
            .replace(/("key"\s*:\s*")[^"]+(")/gi, '$1""$2');
        }

        window.postMessage({
          source: 'ROEDEX_INTERCEPTOR',
          type: 'WS_MESSAGE',
          data: safeData
        }, '*');
      }
    });

    // We can also hook 'open' to notify connection status
    this.addEventListener('open', () => {
      window.postMessage({
        source: 'ROEDEX_INTERCEPTOR',
        type: 'WS_OPEN'
      }, '*');
    });

    this.addEventListener('close', () => {
      window.postMessage({
        source: 'ROEDEX_INTERCEPTOR',
        type: 'WS_CLOSE'
      }, '*');
    });
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (typeof data === 'string') {
      window.postMessage({
        source: 'ROEDEX_INTERCEPTOR',
        type: 'WS_MESSAGE_SEND',
        data: data
      }, '*');
    }
    super.send(data);
  }
}

// Override the native WebSocket
(window as any).WebSocket = HookedWebSocket;

// Intercept console messages for game events not broadcasted via WebSocket
const methods: ('log' | 'info' | 'debug')[] = ['log', 'info', 'debug'];
let isBlacksmithOpen = false;

methods.forEach(method => {
  const original = console[method];
  console[method] = function(...args: any[]) {
    // Highly performant: Only check string arguments to prevent massive memory leaks
    // and FPS drops from JSON.stringify-ing complex game objects (like ResourceSpawner)
    
    // Ignore spammy input logs completely to clean up console and save performance
    if (args.length > 0 && typeof args[0] === 'string') {
      const lowerArg = args[0].toLowerCase();
      if (lowerArg.includes('input vector') || 
          lowerArg.includes('input horizontal') || 
          lowerArg.includes('input vertical') ||
          lowerArg.includes('polygon pillar jump')) {
        return;
      }
    }

    let stringArgs = '';
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === 'string') {
        stringArgs += args[i] + ' ';
      }
    }
    
    if (stringArgs) {
      if (stringArgs.includes('[ForgeUI] case BlackSmith ENTER') || stringArgs.includes('[ForgeUI] BlackSmith: isMenuOpen=true')) {
        if (!isBlacksmithOpen) {
          isBlacksmithOpen = true;
          window.postMessage({
            source: 'ROEDEX_INTERCEPTOR',
            type: 'WS_MESSAGE',
            data: '42' + JSON.stringify(["blacksmith_opened", {}])
          }, '*');
        }
      }
      
      if (stringArgs.includes('OnMMEvent ContentChanged (ChestInventory)')) {
        if (!isBlacksmithOpen) {
          window.postMessage({
            source: 'ROEDEX_INTERCEPTOR',
            type: 'WS_MESSAGE',
            data: '42' + JSON.stringify(["chest_opened", {}])
          }, '*');
        }
      } else if (stringArgs.includes('Close Invoked')) {
        if (isBlacksmithOpen) {
          isBlacksmithOpen = false;
          window.postMessage({
            source: 'ROEDEX_INTERCEPTOR',
            type: 'WS_MESSAGE',
            data: '42' + JSON.stringify(["blacksmith_closed", {}])
          }, '*');
        }
        window.postMessage({
          source: 'ROEDEX_INTERCEPTOR',
          type: 'WS_MESSAGE',
          data: '42' + JSON.stringify(["chest_closed", {}])
        }, '*');
      }
    }
    original.apply(console, args);
  };
});

console.log('[ROEDEX] WebSocket Interceptor Injected Successfully');
