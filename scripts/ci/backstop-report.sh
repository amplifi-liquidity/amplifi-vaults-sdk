#!/usr/bin/env bash
# Post-merge backstop report: keeps exactly one open "main is red" issue while
# `yarn verify` on main fails, and closes it when main is green again. A run for
# a commit that is no longer main's head does nothing: the newer run decides, so
# out-of-order runs cannot reopen or close the issue.
#
# Env: GH_TOKEN, GH_REPO, SHA (the run's commit), RUN_URL, RESULTS (job results).
set -euo pipefail

LABEL=ci-red
HEAD=$(gh api "repos/$GH_REPO/commits/main" --jq .sha)
if [ "$HEAD" != "$SHA" ]; then
  echo "main moved on (${HEAD:0:7}); the run for that commit reports instead"
  exit 0
fi

OPEN=$(gh issue list --state open --label "$LABEL" --json number --jq '.[0].number // empty')
case " $RESULTS " in
  *" failure "*|*" cancelled "*|*" timed_out "*)
    BODY="The post-merge CI run (\`yarn verify\`) failed on ${SHA:0:7}: $RUN_URL"
    if [ -n "$OPEN" ]; then
      gh issue comment "$OPEN" --body "$BODY"
    else
      gh label create "$LABEL" --color B60205 --description "Post-merge backstop failing on main" 2>/dev/null || true
      gh issue create --title "main is red" --label "$LABEL" --body "$BODY

main failed after merge (for example two pull requests that each passed alone).
Fix forward or revert; this issue closes itself on the next green run."
    fi
    ;;
  *)
    if [ -n "$OPEN" ]; then
      gh issue close "$OPEN" --comment "main is green again on ${SHA:0:7}: $RUN_URL"
    fi
    ;;
esac
