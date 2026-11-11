/**
 * The `web` runtime variant. Reuses the workerd stub: the Claude Agent SDK has
 * no browser execution plane; provider plugin paths report the same typed
 * unavailability as workerd.
 */
export * as AgentSdkWeb from "./agent-sdk.web"

export * from "./agent-sdk.workerd"
