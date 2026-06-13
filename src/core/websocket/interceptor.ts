// This script is injected into the MAIN world to access the game's actual window object.

const OriginalWebSocket = window.WebSocket;

class HookedWebSocket extends OriginalWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);

    this.addEventListener('message', (event) => {
      // Broadcast incoming WebSocket data to the Content Script
      if (typeof event.data === 'string') {
        window.postMessage({
          source: 'ROEDEX_INTERCEPTOR',
          type: 'WS_MESSAGE',
          data: event.data
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
    if (args.length > 0) {
      // FPS OPTIMIZATION: Instead of full args.map().join() which is heavy for games that spam console.log,
      // we only stringify the first argument if it's a string, which covers 99% of our targeted logs.
      let fullMsg = '';
      if (typeof args[0] === 'string') {
         fullMsg = args[0];
      } else {
         try { fullMsg = String(args[0]); } catch(e) {}
      }
      
      if (fullMsg) {
        if (fullMsg.includes('[ForgeUI] case BlackSmith ENTER') || fullMsg.includes('[ForgeUI] BlackSmith: isMenuOpen=true')) {
          isBlacksmithOpen = true;
        }
        
        if (fullMsg.includes('OnMMEvent ContentChanged (ChestInventory)')) {
          if (!isBlacksmithOpen) {
            window.postMessage({
              source: 'ROEDEX_INTERCEPTOR',
              type: 'WS_MESSAGE',
              data: '42' + JSON.stringify(["chest_opened", {}])
            }, '*');
          }
        } else if (fullMsg.includes('Close Invoked')) {
          isBlacksmithOpen = false;
          window.postMessage({
            source: 'ROEDEX_INTERCEPTOR',
            type: 'WS_MESSAGE',
            data: '42' + JSON.stringify(["chest_closed", {}])
          }, '*');
        }
      }
    }
    original.apply(console, args);
  };
});

console.log('[ROEDEX] WebSocket Interceptor Injected Successfully');
