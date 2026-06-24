// Stub for the `server-only` package so server modules can be unit-tested in
// the Vitest (node) environment. The real package throws when imported outside
// a React Server Component; in tests we just need it to be a no-op.
export {};
