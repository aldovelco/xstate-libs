---
'@aldovelco/xstate-rxjs': patch
---

Removes `stop$` from use machine options.
Interpreter will no longer be automatically stopped when unsubscribing from `state$`.
