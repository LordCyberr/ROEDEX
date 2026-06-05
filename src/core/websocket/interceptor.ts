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

console.log('[ROEDEX] WebSocket Interceptor Injected Successfully');
