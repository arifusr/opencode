#!/usr/bin/env bun
/**
 * M0 boot spike: boots the workerd runtime profile of the embedded SDK on a
 * fake Durable Object storage, overrides the LLM client with TestLLM, and runs
 * a full session prompt turn — the closest Bun-runnable analogue of the
 * browser runtime (no real FS worktree, no process execution, in-memory-only
 * local services).
 *
 * Mirrors packages/sdk/test/embedded.test.ts wiring, as a standalone demo.
 */
import { Effect, Exit, Fiber, Layer, Stream } from "effect"
import { LLMClient } from "@opencode/ai/effect"
import { TestLLM } from "@opencode/ai/testing"
import { llmClient } from "@opencode/core/effect/app-node-platform"
import { makeDurableObjectStorage } from "../core/test/fixture/durable-object-storage"
import { WorkerdProfile } from "./src/internal/workerd"
import { OpenCode } from "./src/effect/opencode"
import { Plugin } from "@opencode/plugin/effect"
import { Location, AbsolutePath, Provider, Model } from "@opencode/sdk/effect"

const program = Effect.gen(function* () {
  const llm = yield* TestLLM.Test.pipe(Effect.provide(TestLLM.testLayer({ fallback: TestLLM.text("ready", "answer") })))

  const profile = WorkerdProfile.make({
    storage: makeDurableObjectStorage(),
    models: { fetch: false },
    config: { model: "custom/fictional-chat" },
  })
  const opencode = yield* OpenCode.create(
    { ...profile.options, plugins: [
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
    ] },
    { overrides: [...profile.replacements, llmClient.replace(Layer.succeed(LLMClient.Service, llm))] },
  )

  // Model resolution through the injected provider config.
  // Plugin/provider activation is async; poll like the SDK tests do.
  const location = Location.Ref.make({ directory: AbsolutePath.make("/workspace") })
  let hasModel = false
  for (let i = 0; i < 200; i++) {
    const models = yield* opencode.model.list({ location })
    hasModel = models.data.some((model) => model.providerID === "custom" && model.id === "fictional-chat")
    if (hasModel) break
    yield* Effect.sleep("20 millis")
  }
  console.log(`model.list: ${hasModel ? "OK (custom/fictional-chat present)" : "MISSING"}`)
  if (!hasModel) process.exit(1)

  // Full session prompt turn
  const session = yield* opencode.sessions.create({
    location: Location.Ref.make({ directory: AbsolutePath.make("/workspace") }),
  })
  console.log(`session created: ${session.id}`)

  const collected: Array<unknown> = []
  const eventStream = opencode.events.subscribe()
  const collectFiber = yield* eventStream.pipe(
    Stream.runForEach((event) =>
      Effect.sync(() => {
        collected.push(event)
      }),
    ),
    Effect.ignore,
    Effect.forkScoped,
  )

  yield* opencode.sessions.prompt({
    sessionID: session.id,
    text: "Say ready",
  })
  console.log("prompt accepted")

  // Wait for the turn to finish: poll session status until idle
  for (let i = 0; i < 100; i++) {
    const info = yield* opencode.sessions.get({ sessionID: session.id })
    const status = (info.data as { status?: { type?: string } | string })?.status
    const type = typeof status === "string" ? status : status?.type
    if (type === "idle" || type === "completed") {
      console.log(`session status: ${type}`)
      break
    }
    if (i === 99) console.log(`session status: ${JSON.stringify(status)} (timeout)`)
    yield* Effect.sleep("100 millis")
  }

  yield* Fiber.interrupt(collectFiber)
  console.log(`events collected: ${collected.length}`)
  for (const event of collected) {
    const type = (event as { type?: string }).type
    console.log(`  ${type}: ${JSON.stringify(event)?.slice(0, 900)}`)
  }
})

Effect.runPromiseExit(
  program.pipe(
    Effect.provide(TestLLM.testLayer({ fallback: TestLLM.text("ready", "answer") })),
    Effect.scoped,
  ),
).then((exit) => {
  if (Exit.isSuccess(exit)) console.log("BOOT SPIKE OK")
  else console.error("BOOT SPIKE FAILED:", exit.cause)
}, (err) => console.error("BOOT SPIKE REJECTED:", err))
