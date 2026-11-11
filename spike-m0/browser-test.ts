#!/usr/bin/env bun
/**
 * Headless-Chromium boot test for the opencode web runtime bundle.
 * Serves spike-m0/web, opens the page, and waits for a full turn:
 * ready → session.* events → done, with no runtime.error.
 */
import { chromium } from "@playwright/test"
import { serve } from "bun"

const port = 4517
const server = serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)
    const file = url.pathname === "/" ? "/index.html" : url.pathname
    try {
      const path = `${import.meta.dir}/web${file}`
      const f = Bun.file(path)
      if (!(await f.exists())) return new Response("not found", { status: 404 })
      return new Response(f)
    } catch (error) {
      return new Response(String(error), { status: 500 })
    }
  },
})

const browser = await chromium.launch()
const page = await browser.newPage()
page.on("pageerror", (error) => console.error(`[pageerror] ${error.message}`))
page.on("console", (message) => console.log(`[console.${message.type()}] ${message.text()}`))

await page.goto(`http://localhost:${port}/`)

const deadline = Date.now() + 60_000
while (Date.now() < deadline) {
  const state = await page.evaluate(() => ({
    ready: window.__opencode?.ready ?? false,
    done: window.__opencode?.done ?? false,
    error: window.__opencode?.error ?? null,
    events: (window.__opencode?.events ?? []).length,
  }))
  if (state.error) {
    console.error("RUNTIME ERROR:", state.error)
    process.exit(1)
  }
  if (state.ready && state.done) {
    const events = await page.evaluate(() => window.__opencode.events.map((e) => e.type))
    console.log("BROWSER BOOT OK — events:", JSON.stringify(events))
    const deltas = await page.evaluate(() =>
      window.__opencode.events.filter((e) => e.type === "session.text.delta").map((e) => e.data?.delta).join(""),
    )
    console.log("assistant streamed:", JSON.stringify(deltas))
    await browser.close()
    server.stop(true)
    process.exit(0)
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}
const final = await page.evaluate(() => window.__opencode)
console.error("TIMEOUT. state:", JSON.stringify(final).slice(0, 800))
await browser.close()
server.stop(true)
process.exit(1)
