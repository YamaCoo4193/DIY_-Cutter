# Issues And Projects

公開後の改善項目を GitHub Issue と Project に整理するための下書きです。

## Recommended Project

Project name:
`DIY Cutter Post-Launch`

Suggested columns:

1. `Inbox`
2. `Ready`
3. `In Progress`
4. `Review`
5. `Done`

Suggested custom fields:

- `Priority`
  - `High`
  - `Medium`
  - `Low`
- `Area`
  - `UX`
  - `Storage`
  - `Testing`
  - `Optimization`
  - `Docs`

## Issue 1

Title:
`Add data export/import guidance and recovery flow polish`

Body:
```md
## Summary

Improve the backup and restore experience for end users.

## Background

The app already supports backup JSON export/import, but the recovery flow still depends on the user understanding LocalStorage limitations.

## Tasks

- make backup/import guidance more visible in the saved data area
- add success and failure messaging with clearer next actions
- review copy for non-technical users
- confirm mobile usability for backup import

## Acceptance Criteria

- users can understand that data is device-local
- backup and restore actions are clearly explained
- import errors show actionable messages
```

Labels:
`enhancement`, `ux`, `documentation`

Priority:
`Medium`

Area:
`UX`

## Issue 2

Title:
`Add broader E2E coverage for print and restore workflows`

Body:
```md
## Summary

Expand Playwright coverage for the highest-risk user flows after launch.

## Background

Desktop and mobile E2E tests exist for the main estimation flow, saved panel toggle, backup export, and print button placement. Print output behavior and restore workflows still need stronger coverage.

## Tasks

- add E2E for backup import
- add E2E for saved estimate load/delete flow
- add E2E for print-preview related UI expectations
- review mobile-only interactions for regressions

## Acceptance Criteria

- import flow is covered by Playwright
- saved estimate restore/delete flow is covered
- print-related UI regressions are easier to catch
```

Labels:
`testing`, `e2e`

Priority:
`High`

Area:
`Testing`

## Issue 3

Title:
`Improve post-launch mobile usability and small-screen layout details`

Body:
```md
## Summary

Refine small-screen interactions after initial public release.

## Background

The app works on mobile, but some flows still rely on dense panels and long vertical movement. Post-launch feedback should be incorporated into a focused mobile polish pass.

## Tasks

- review spacing and tap target sizes on small screens
- improve visibility of key actions near the top of the screen
- validate saved data and custom spec panels on narrow widths
- review cut diagram readability on mobile

## Acceptance Criteria

- key actions remain easy to find on mobile
- no layout breakage on common phone widths
- small-screen operation feels intentional rather than desktop-shrunk
```

Labels:
`enhancement`, `mobile`, `ux`

Priority:
`Medium`

Area:
`UX`

## Issue 4

Title:
`Review storage versioning and long-term migration strategy`

Body:
```md
## Summary

Formalize the persistence compatibility strategy for future releases.

## Background

The app now supports migration of older material spec formats and defensive loading. Future schema changes should follow a documented versioning strategy.

## Tasks

- document storage version policy
- define migration rules for material specs and saved snapshots
- add tests for future-version and unsupported-version handling
- review whether backup payload versioning should diverge from LocalStorage versioning

## Acceptance Criteria

- storage migration policy is documented
- versioning expectations are test-backed
- future schema updates have a clear upgrade path
```

Labels:
`technical-debt`, `storage`

Priority:
`Medium`

Area:
`Storage`

## Issue 5

Title:
`Evaluate stronger cut optimization strategy for larger workloads`

Body:
```md
## Summary

Review whether the current heuristic remains sufficient as usage expands.

## Background

The current optimization is intentionally lightweight and suitable for MVP usage. If larger or more varied cutting patterns become common, a stronger search strategy may be needed.

## Tasks

- gather real-world sample inputs after launch
- compare current results with stronger optimization approaches
- document tradeoffs between speed and waste reduction
- decide whether an advanced mode is needed

## Acceptance Criteria

- sample workloads are collected
- current heuristic limitations are documented
- next optimization step is clearly defined
```

Labels:
`enhancement`, `optimization`

Priority:
`Low`

Area:
`Optimization`
