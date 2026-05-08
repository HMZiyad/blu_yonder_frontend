# API Requirements

To connect this frontend to the backend, the following API endpoints are required:

## 1. Authentication
*   **POST** `/api/auth/login`: Authenticate user with email and password.
*   **POST** `/api/auth/register`: Create a new user account.
*   **POST** `/api/auth/forgot-password`: Request a password reset code.
*   **POST** `/api/auth/verify-code`: Verify the 5-digit reset code.
*   **POST** `/api/auth/reset-password`: Set a new password using the verification code.

## 2. Dashboard Statistics
*   **GET** `/api/dashboard/stats`: Returns overview data (Total Images, To Be Processed, and Weekly Identification Chart data).

## 3. Aircraft Identification
*   **POST** `/api/aircraft/identify`: Upload aircraft images (multipart/form-data). Returns initial detection status.
*   **GET** `/api/aircraft/queue`: Returns the current status of the upload and processing queue.
*   **GET** `/api/aircraft/result/:id`: Fetch detailed AI analysis result for a specific identification.
*   **GET** `/api/aircraft/export/:id`: Export identification details for a specific aircraft.

## 4. Database Management
*   **GET** `/api/aircraft/records`: Fetch verified aircraft records. Supports query parameters for search and filtering (Registration, Name, Serial No., etc.).
*   **GET** `/api/aircraft/export-all`: Export the entire database of verified records.

## 5. User Profile & Settings
*   **GET** `/api/user/profile`: Fetch current user details.
*   **PUT** `/api/user/profile`: Update user profile information (Name, Email, Phone, Organization).
*   **PUT** `/api/user/change-password`: Update account password.
