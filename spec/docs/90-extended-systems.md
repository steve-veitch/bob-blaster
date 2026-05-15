# Extended Systems (Interfaces Only)

Many systems are updated each frame if present (AI, quests, multiplayer, etc.). In the provided file set, these are placeholders.

## Common system interface
A system should:
- be safe to call even if not initialized
- expose `init()` or `initialize()` optionally
- expose `update(deltaTime, ...context)`
- optionally expose `reset()`

This supports the "graceful degradation" runtime approach.
