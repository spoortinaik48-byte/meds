# MedVault Security Specification

## Data Invariants
1. A Medical Record must belong to a valid Patient.
2. A Medical Record can only be created by the Patient who owns it.
3. A Patient's profile can only be modified by the Patient themselves.
4. A Doctor can only view a Patient's records and profile if `isSharingEnabled` is true for that patient.
5. All users must be authenticated to access any data.

## The "Dirty Dozen" Payloads (Denial Tests)
1. User A trying to update User B's profile.
2. User A trying to upload a record for User B (patientId poisoning).
3. Doctor trying to update a Patient's profile data.
4. Patient trying to update their own `role` field after creation.
5. Unauthenticated user trying to read any user profile.
6. Doctor trying to read a Patient's records when `isSharingEnabled` is false.
7. Patient trying to delete another patient's records.
8. Malicious user injecting a 1MB string into the `name` field.
9. Malicious user injecting a script as `bloodGroup`.
10. Creating a Medical Record with a future `createdAt` timestamp (not using server timestamp).
11. Updating a Medical Record after it has been created (records should be immutable).
12. Doctor trying to list all patients in a collection (blanket read).

## Access Control Logic
- **Patient**: Owns their `users/{uid}` doc and `records` where `patientId == uid`.
- **Doctor**: Can `get` patient profile and `list` records for a patient IF `isSharingEnabled == true` on the patient doc.
- **Admin**: Not implemented for MVP.
