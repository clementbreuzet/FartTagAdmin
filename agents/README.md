# Repository Agents

Add one `.toml` file per custom agent in this directory. Codex discovers these
repository-local agent definitions automatically.

Start from [`agent.toml.example`](agent.toml.example), rename it to the role
name, and replace every `TODO`.

Keep shared repository instructions in the root [`AGENTS.md`](../../AGENTS.md).
Keep role-specific behavior in each agent definition.

