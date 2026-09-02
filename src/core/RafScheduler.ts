/**
 * RafScheduler — Singleton shared requestAnimationFrame scheduler.
 *
 * Consolidates multiple independent RAF loops (MatrixRain, ParticleGlobe, etc.)
 * into a single shared tick, reducing browser scheduling overhead from N callbacks
 * down to 1. Each consumer receives dt (seconds since last frame) and the raw
 * DOMHighResTimeStamp for time-based throttling.
 *
 * The scheduler auto-starts when the first callback registers and auto-stops
 * when the last one deregisters — zero RAF overhead when nothing needs rendering.
 *
 * NOTE: MapRenderEngine is intentionally NOT using this scheduler because its
 * sophisticated dirty-flag + idle-halt pattern is incompatible with a fixed-cadence
 * tick. All other canvas animation components should use this.
 */

type TickFn = (dt: number, time: number) => void;

class RafScheduler {
  private callbacks = new Set<TickFn>();
  private rafId: number | null = null;
  private lastTime = 0;

  /**
   * Register a tick callback. Returns an unsubscribe function.
   * Call the returned function in your useEffect cleanup to deregister.
   *
   * @example
   * useEffect(() => {
   *   const unsubscribe = rafScheduler.register((dt, time) => { ... });
   *   return unsubscribe;
   * }, []);
   */
  register(fn: TickFn): () => void {
    this.callbacks.add(fn);
    if (this.callbacks.size === 1) {
      // First subscriber — start the loop
      this.start();
    }
    return () => {
      this.callbacks.delete(fn);
      if (this.callbacks.size === 0) {
        // Last subscriber gone — stop the loop entirely
        this.stop();
      }
    };
  }

  private start() {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1); // cap at 100ms to handle tab focus recovery
      this.lastTime = time;

      this.callbacks.forEach(fn => {
        try {
          fn(dt, time);
        } catch (e) {
          // Isolate callback errors — a bad widget should never kill the shared scheduler
          console.error('[RafScheduler] Callback error:', e);
        }
      });

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/** Singleton instance — import this directly, do not construct new instances. */
export const rafScheduler = new RafScheduler();
