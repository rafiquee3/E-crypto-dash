// jest.setup.polyfills.ts
// Purpose: provide minimal, well-documented polyfills required for running MSW (v2) and
// fetch-related interceptors under Jest. MSW pulls in ESM/browser-focused modules that
// expect a handful of Web platform globals at module initialization time (BroadcastChannel,
// streams, Response, Headers, etc.). We provide small, safety-first shims here to avoid
// loading failures during test setup.
//
// Keep this file minimal and only add globals that are strictly required by failing tests
// or by MSW internals. When upgrading MSW or changing the fetch implementation, re-check
// whether any shim can be removed.

// Provide minimal TextEncoder/TextDecoder polyfills for Jest environment
// Provide minimal TransformStream stub (some interceptors expect this)
if (typeof (global as any).TransformStream === 'undefined') {
  (global as any).TransformStream = class TransformStream {
    constructor() {}
  } as any;
}

// Provide minimal Readable/Writable streams stubs used by some msw internals
if (typeof (global as any).ReadableStream === 'undefined') {
  (global as any).ReadableStream = class ReadableStream {
    constructor() {}
  } as any;
}

if (typeof (global as any).WritableStream === 'undefined') {
  (global as any).WritableStream = class WritableStream {
    constructor() {}
  } as any;
}


// Minimal BroadcastChannel stub for msw v2 (used for worker messaging)
if (typeof (global as any).BroadcastChannel === 'undefined') {
  class BroadcastChannel {
    private listeners: ((ev: any) => void)[] = [];
    constructor(public name?: string) {}
    postMessage(_msg: any) {
      // no-op: tests rarely rely on cross-tab messaging
    }
    addEventListener(_type: string, cb: (ev: any) => void) {
      this.listeners.push(cb);
    }
    removeEventListener(_type: string, cb: (ev: any) => void) {
      this.listeners = this.listeners.filter((l) => l !== cb);
    }
    close() {
      this.listeners = [];
    }
  }

  (global as any).BroadcastChannel = BroadcastChannel as any;
}

// Request/Response/Headers are provided by the chosen fetch implementation (undici or node-fetch)
// However some modules import them at init time, so provide minimal stubs if missing.
if (typeof (global as any).Request === 'undefined') {
  (global as any).Request = class Request {
    constructor(public input?: any, public init?: any) {}
  } as any;
}

if (typeof (global as any).Response === 'undefined') {
  (global as any).Response = class Response {
    body: any;
    status: number;
    headers: any;
    constructor(body?: any, init?: any) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }
    clone() { return this; }
    text() { return Promise.resolve(String(this.body ?? '')); }
    json() { return Promise.resolve(this.body); }
    get ok() { return this.status >= 200 && this.status < 300; }
  } as any;
}

if (typeof (global as any).Headers === 'undefined') {
  (global as any).Headers = class Headers {
    private map = new Map<string, string>();
    constructor(init?: any) { if (init) Object.entries(init).forEach(([k,v]) => this.map.set(k, String(v))); }
    get(k: string) { return this.map.get(k.toLowerCase()) ?? null; }
    append(k: string, v: string) { this.map.set(k.toLowerCase(), v); }
    all() { return Object.fromEntries(this.map); }
  } as any;
}

if (typeof (global as any).TextEncoder === 'undefined') {
  class PolyTextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(String(input), 'utf8'));
    }
  }
  (global as any).TextEncoder = PolyTextEncoder as any;
}

if (typeof (global as any).TextDecoder === 'undefined') {
  class PolyTextDecoder {
    private encoding: BufferEncoding;
    constructor(encoding: BufferEncoding = 'utf-8') {
      this.encoding = encoding;
    }
    decode(input?: ArrayBuffer | Uint8Array): string {
      if (!input) return '';
      const u8 = input instanceof ArrayBuffer ? new Uint8Array(input) : input as Uint8Array;
      return Buffer.from(u8).toString(this.encoding);
    }
  }
  (global as any).TextDecoder = PolyTextDecoder as any;
}
