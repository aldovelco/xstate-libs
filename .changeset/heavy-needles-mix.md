---
'@aldovelco/xstate-angular': patch
---

Adds `DestroyService`, it must be provided at the component's providers array.
Adds `injectMachine`, uses the `DestroyService` to automatically stop the interpreted machine when the component is destroyed.
