// Typed request/response between a page and the background. Messages are
// objects with a `kind`; the older string protocol on the same channel ignores
// them, and this listener ignores strings.

type Handler<Req, Res> = (request: Req, sender: chrome.runtime.MessageSender) => Promise<Res>;

interface Envelope {
  kind: string;
  request: unknown;
}

const handlers = new Map<string, Handler<unknown, unknown>>();
let listening = false;

function listen(): void {
  if (listening) return;
  listening = true;
  chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    if (typeof message !== "object" || message === null || !("kind" in message)) return false;
    const handler = handlers.get((message as Envelope).kind);
    if (!handler) return false;
    handler((message as Envelope).request, sender).then(
      (response) => sendResponse({ response }),
      (error: unknown) => sendResponse({ error: String(error) }),
    );
    return true;
  });
}

export interface Message<Req, Res> {
  kind: string;
  send(request: Req): Promise<Res>;
  handle(handler: Handler<Req, Res>): void;
}

export function defineMessage<Req, Res>(kind: string): Message<Req, Res> {
  return {
    kind,
    async send(request) {
      const reply = (await chrome.runtime.sendMessage({ kind, request } satisfies Envelope)) as
        | { response: Res }
        | { error: string }
        | undefined;
      if (!reply) throw new Error(`no handler for ${kind}`);
      if ("error" in reply) throw new Error(reply.error);
      return reply.response;
    },
    handle(handler) {
      handlers.set(kind, handler as Handler<unknown, unknown>);
      listen();
    },
  };
}
