# ADR 001 — State management: Angular Signals vs NgRx

**Status**: Accepted  
**Date**: 2026-05-24  
**Author**: Erlyn Pino  
**Context**: LATAM Airlines user-management frontend challenge

---

## Context

The application manages a single resource (Users) with CRUD operations.
The state that needs to be shared across components is:

- The user list (with pagination metadata: `total`, `skip`, `limit`)
- A loading flag and an error message
- Cache invalidation after mutations

We needed to decide between **Angular Signals + plain service** and **NgRx** (Store + Effects + Selectors).

---

## Options considered

### Option A — Angular Signals in a singleton service (chosen)

The `UserService` exposes reactive state exclusively through Signals:

```ts
// Internal writable signal
private readonly _usersState = signal<RemoteData<PaginatedResponse<User>>>({ status: 'idle' });

// Public read-only derived signals
readonly users    = computed(() => /* ... */);
readonly loading  = computed(() => this._usersState().status === 'loading');
readonly total    = computed(() => /* ... */);
readonly error    = computed(() => /* ... */);
```

Cache coherence is maintained with two lightweight flags:

```ts
private _cacheStale    = false;   // set to true after any mutation
private _lastParamsKey = '';      // key = `${skip}:${limit}`
```

Components call `loadUsers(params)` and the service short-circuits if
`alreadyLoading || cacheHit`.

### Option B — NgRx Store + Effects + Selectors

Would have introduced: `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`,
`createAction`, `createReducer`, `createEffect`, `createSelector`.

---

## Decision

**Option A** was chosen.

| Criterion | Signals | NgRx |
|---|---|---|
| Bundle size overhead | ~0 KB (built-in) | ~30–50 KB |
| Boilerplate per feature | ~50 lines | ~200–300 lines |
| Learning curve for reviewers | Low | High |
| DevTools / time-travel debugging | Not available | Available |
| Fits 1-resource CRUD app | ✅ Yes | Overkill |
| Fits 10+ resource enterprise app | Needs scaling strategy | ✅ Yes |
| Angular 21 compatibility | Native (`signal()`, `computed()`) | Requires adapter layer |

For a single-resource application with straightforward async flows,
the overhead of NgRx violates YAGNI. Signals achieve the same
unidirectional data flow guarantee with zero dependencies and
full type inference.

---

## Consequences

**Positive**:
- `ChangeDetectionStrategy.OnPush` works natively with Signals — no
  `markForCheck()` / `async` pipe boilerplate.
- The `RemoteData<T>` discriminated union (`idle | loading | success | error`)
  makes impossible states unrepresentable at the type level.
- `takeUntilDestroyed(destroyRef)` handles subscription cleanup idiomatically
  without `Subject` + `takeUntil` ceremony.

**Negative / trade-offs**:
- No Redux DevTools for time-travel debugging.
- If the app grows to 5+ resources with cross-resource derived state,
  the service layer will need a clear coordination strategy
  (e.g., a facade pattern or migration to NgRx Signal Store).

---

## Migration path (if needed)

Angular's `@ngrx/signals` (Signal Store) offers a lightweight bridge:
it keeps the Signal API surface while adding DevTools support and
a structured feature composition model. Migrating from a plain Signal
service to NgRx Signal Store is a mechanical refactor with no breaking
changes to the component layer.
