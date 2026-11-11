/**
 * Browser worker entry for the opencode web runtime (M1 spike).
 *
 * Boots the workerd-profile embedded SDK (web condition) with a fake DO
 * storage and a TestLLM override, then serves a minimal postMessage bridge:
 *   { type: "ready" }                 → { type: "ready", models }
 *   { type: "prompt", text }          → streamed events + { type: "done" }
 */
import { Effect, Exit, Fiber, Layer, Stream } from "effect"
import { LLMClient } from "@opencode/ai/effect"
import { TestLLM } from "@opencode/ai/testing"
import { llmClient } from "@opencode/core/effect/app-node-platform"
import { makeDurableObjectStorage } from "../packages/core/test/fixture/durable-object-storage"
import { WorkerdProfile } from "../packages/sdk/src/internal/workerd"
import { OpenCode, Location, AbsolutePath, Provider, Model } from "../packages/sdk/src/effect/opencode"
import { Plugin } from "@opencode/plugin/effect"

let opencode: OpenCode.Interface | undefined

const post = (message: unknown) => self.postMessage(message)

const boot = Effect.gen(function* () {
  const llm = yield* TestLLM.Test.pipe(Effect.provide(TestLLM.testLayer({ fallback: TestLLM.text("ready", "answer") })))
  const profile = WorkerdProfile.make({
    storage: makeDurableObjectStorage(),
    models: { fetch: false },
    config: { model: "custom/fictional-chat" },
  })
  const created = yield* OpenCode.create(
    {
      ...profile.options,
      plugins: [
        Plugin.define({
          id: "custom-models",
          effect: (ctx) =>
            Effect.gen(function* () {
              yield* ctx.provider.transform((providers) => {
                providers.update(Provider.ID.make("custom"), (provider) => {
                  provider.name = "Custom"
                  provider.activation = "enabled"
                  provider.package = "@opencode/ai/providers/openai-compatible"
                  provider.settings = { baseURL: "https://provider.example/v1", apiKey: "secret" }
                })
                providers.models.update(Provider.ID.make("custom"), Model.ID.make("fictional-chat"), () => {})
              })
            }).pipe(Effect.orDie),
        }),
      ],
    },
    { overrides: [...profile.replacements, llmClient.replace(Layer.succeed(LLMClient.Service, llm))] },
  )
  opencode = created

  const location = Location.Ref.make({ directory: AbsolutePath.make("/workspace") })
  let hasModel = false
  for (let i = 0; i < 200; i++) {
    const models = yield* created.model.list({ location })
    hasModel = models.data.some((model) => model.providerID === "custom" && model.id === "fictional-chat")
    if (hasModel) break
    yield* Effect.sleep("20 millis")
  }
  if (!hasModel) throw new Error("model custom/fictional-chat never loaded")

  const session = yield* created.sessions.create({ location })
  post({ type: "ready", sessionID: session.id })
})

const runPrompt = Effect.gen(function* () {
  if (!opencode) throw new Error("runtime not booted")
  const session = yield* opencode.sessions.create({
    location: Location.Ref.make({ directory: AbsolutePath.make("/workspace") }),
  })
  const eventStream = opencode.events.subscribe()
  const collector = yield* eventStream.pipe(
    Stream.filter((event) => (event as { type?: string }).type?.startsWith("session.") ?? false),
    Stream.runForEach((event) =>
      Effect.sync(() => {
        const { type } = event as { type: string }
        const data = (event as { data?: unknown }).data
        post({ type, data })
      }),
    ),
    Effect.ignore,
    Effect.forkScoped,
  )
  yield* opencode.sessions.prompt({ sessionID: session.id, text: "Say ready" })
  for (let i = 0; i < 100; i++) {
    const info = yield* opencode.sessions.get({ sessionID: session.id })
    const status = (info.data as { status?: { type?: string } | string })?.status
    const type = typeof status === "string" ? status : status?.type
    if (type === "idle" || type === "completed") break
    if (i === 99) post({ type: "runtime.error", data: { message: `turn did not finish (status ${JSON.stringify(status)})` } })
    yield* Effect.sleep("100 millis")
  }
  yield* Fiber.interrupt(collector)
  post({ type: "done" })
})

const main = Effect.gen(function* () {
  yield* boot
  for (;;) {
    const message: { type: string; text?: string } = yield* Effect.promise(
      () => new Promise((resolve) => self.onmessage = (event) => resolve(event.data)),
    )
    if (message.type === "prompt") yield* runPrompt.pipe(Effect.catchCause((cause) => Effect.sync(() => post({ type: "runtime.error", data: { message: JSON.stringify(cause).slice(0, 400) } }))))
  }
})

Effect.runPromiseExit(main.pipe(Effect.scoped)).then((exit) => {
  if (!Exit.isSuccess(exit)) {
    console.error("boot failed", exit.cause)
    post({ type: "runtime.error", data: { message: "boot failed: " + JSON.stringify(exit.cause).slice(0, 400) } })
  }
})
