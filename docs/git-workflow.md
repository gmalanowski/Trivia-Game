\# Git Workflow



This document defines the Git workflow used in the project.



\## Main branch



The repository uses one main branch:



\* \*\*main\*\* – stable version of the project



\## Feature branches



All new work should be done in separate feature branches created from `main`.



Branch naming convention:



```text

feature/<short-description>

```



Examples:



\* `feature/backend-setup`

\* `feature/react-start-screen`

\* `feature/prisma-schema`



\## Commit messages



Commits should use task-related prefixes to make history easier to understand.



Examples:



\* `BE-01 setup backend project with Bun and Hono`

\* `FE-02 create start screen`

\* `DB-01 design database schema`

\* `DOC-03 analyze existing solutions`

\* `PM-02 configure git workflow`



\## Pull Requests



All changes must be merged through \*\*Pull Requests\*\*.



Rules:



\* changes should not be pushed directly to `main`

\* work should be merged from feature branches

\* each Pull Request should have a clear title and short description

\* at least one reviewer is required before merging

\* closing a PR may also close a related GitHub Issue



\## Branch protection



The `main` branch should be protected.



Rules:



\* require a pull request before merging

\* require at least one approval

\* prevent direct pushes to `main`



\## General workflow



1\. Create a new branch from `main`

2\. Implement the assigned task

3\. Commit changes with proper prefix

4\. Push the branch to GitHub

5\. Open a Pull Request

6\. Request review

7\. Merge after approval



\## Task tracking



Tasks are managed through:



\* \*\*GitHub Issues\*\*

\* \*\*GitHub Projects (Kanban board)\*\*

\* \*\*Milestones\*\*



Each task should be linked to an Issue whenever possible.



\## Notes



This workflow is intended to keep development organized, readable and consistent for the entire team.



