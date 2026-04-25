# Security Specification for GomaWallet

## 1. Data Invariants
- A user can only read and write their own profile document in `/users/{userId}`.
- `createdAt` is immutable after creation.
- `email` must be a valid format.
- `id` must match the document ID.

## 2. The "Dirty Dozen" Payloads (Red Team)
1. Write to `/users/other-user-id` as `user-1`.
2. Update `email` to another user's email.
3. Update `id` field to mismatch the document ID.
4. Modify `createdAt` after initial creation.
5. Create a user without an email.
6. Create a user with a 2MB display name (Resource exhaustion).
7. List all users in `/users`.
8. Delete another user's profile.
9. Injection of scripts in `displayName`.
10. Anonymous write to `/users`.
11. Update `isNewUser` from `false` to `true` to re-trigger onboarding (if sensitive).
12. Bulk read of `/users` collection.

## 3. Test Plan
- Verify all "Dirty Dozen" return `PERMISSION_DENIED`.
- Verify owner can read/write their own document.
