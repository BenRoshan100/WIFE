#!/bin/bash
# Stop hook — fires when Claude finishes a session
# Checks for learning signals and reminds Claude to update memory files

CONTEXT=$(cat)

# Strong signals — definitely learned something
STRONG_PATTERNS="fixed|workaround|gotcha|that's wrong|check again|we already|should have|discovered|realized|turns out|doesn't work|found out|the issue was|root cause"

# Weak signals — might have learned something
WEAK_PATTERNS="error|bug|issue|problem|fail|unexpected|surprising|odd"

if echo "$CONTEXT" | grep -qiE "$STRONG_PATTERNS"; then
    cat << 'EOF'
{
  "decision": "approve",
  "systemMessage": "MEMORY UPDATE REQUIRED: This session involved fixes, discoveries, or workarounds. Before closing: (1) Add entry to memory-sessions.md with what was discovered. (2) If an architectural decision was made, add to memory-decisions.md with today's date. (3) If you learned something new about Ben's preferences, update memory-preferences.md. Do this now."
}
EOF
elif echo "$CONTEXT" | grep -qiE "$WEAK_PATTERNS"; then
    cat << 'EOF'
{
  "decision": "approve",
  "systemMessage": "This session may have involved learning. If anything non-obvious was discovered, run /reflect or manually update memory-sessions.md before closing."
}
EOF
else
    echo '{"decision": "approve"}'
fi
