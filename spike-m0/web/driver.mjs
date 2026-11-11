// Page-side driver: boots the runtime Worker, sends a prompt, streams events
// into window.__opencode for the test to assert against.
window.__opencode = { events: [], ready: false, error: null, done: false }

const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" })

worker.onerror = (error) => {
  window.__opencode.error = `worker error: ${error.message}`
}
worker.onmessage = (event) => {
  const message = event.data
  window.__opencode.events.push(message)
  if (message.type === "ready") window.__opencode.ready = true
  if (message.type === "done") window.__opencode.done = true
  if (message.type === "runtime.error") window.__opencode.error = message.data?.message ?? "runtime error"
}

worker.postMessage({ type: "prompt" })
