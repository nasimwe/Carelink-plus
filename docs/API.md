# CareLink+ API Documentation

Complete API reference for the CareLink+ healthcare platform.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5001/api` |
| Production | `https://api.carelinkplus.rw/api` |

---

## Authentication

### Overview

CareLink+ uses JWT (JSON Web Token) based authentication. After successful login, include the token in all subsequent requests.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Token Expiration

Tokens expire after **7 days**. After expiration, users must log in again.

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### Health Check

#### `GET /health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### Login

#### `POST /api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "doctor@hospital.rw",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "doctor@hospital.rw",
    "firstName": "Jean",
    "lastName": "Uwimana",
    "role": "specialist",
    "specialty": "Cardiology",
    "phone": "+250788123456",
    "facility": {
      "id": 1,
      "name": "King Faisal Hospital",
      "type": "referral_hospital",
      "district": "Gasabo",
      "province": "Kigali City"
    }
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Get Profile

#### `GET /api/auth/profile`

Get the current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "doctor@hospital.rw",
    "firstName": "Jean",
    "lastName": "Uwimana",
    "role": "specialist",
    "specialty": "Cardiology",
    "phone": "+250788123456",
    "isActive": true,
    "lastLogin": "2024-01-15T08:00:00.000Z",
    "facility": {
      "id": 1,
      "name": "King Faisal Hospital",
      "type": "referral_hospital"
    }
  }
}
```

---

### Change Password

#### `PUT /api/auth/change-password`

Change the authenticated user's password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newsecurepassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Current password is incorrect"
}
```

---

## Patient Endpoints

### Search Patients

#### `GET /api/patients/search`

Search for patients by patient code.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Patient code to search for |

**Example Request:**
```
GET /api/patients/search?code=RW-17052
```

**Success Response (200):**
```json
{
  "patients": [
    {
      "id": 1,
      "patientCode": "RW-1705234567-8901",
      "diagnosisSummary": "Type 2 Diabetes Mellitus",
      "treatmentSummary": "Metformin 500mg BID",
      "specialty": "Internal Medicine",
      "dischargeDate": "2024-01-10",
      "createdAt": "2024-01-10T14:30:00.000Z",
      "specialist": {
        "id": 2,
        "firstName": "Marie",
        "lastName": "Mukamana"
      },
      "facility": {
        "id": 1,
        "name": "CHUK",
        "district": "Nyarugenge"
      }
    }
  ]
}
```

---

### Get Patient by Code

#### `GET /api/patients/code/:code`

Retrieve a specific patient's complete discharge profile by patient code.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| code | string | Unique patient code |

**Example Request:**
```
GET /api/patients/code/RW-1705234567-8901
```

**Success Response (200):**
```json
{
  "patient": {
    "id": 1,
    "patientCode": "RW-1705234567-8901",
    "diagnosisSummary": "Type 2 Diabetes Mellitus with peripheral neuropathy",
    "treatmentSummary": "Metformin 500mg twice daily with meals. Gabapentin 300mg at bedtime for neuropathy.",
    "expectedSideEffects": "Metformin may cause GI upset initially. Gabapentin may cause drowsiness.",
    "warningSigns": "Severe hypoglycemia (shakiness, confusion, sweating), signs of lactic acidosis (unusual fatigue, breathing difficulty), worsening numbness or pain",
    "followUpInstructions": "Check fasting blood glucose daily. Return if glucose consistently above 180mg/dL or below 70mg/dL. Follow up in 4 weeks.",
    "dischargeDate": "2024-01-10",
    "specialty": "Internal Medicine",
    "isActive": true,
    "createdAt": "2024-01-10T14:30:00.000Z",
    "updatedAt": "2024-01-10T14:30:00.000Z",
    "specialist": {
      "id": 2,
      "firstName": "Marie",
      "lastName": "Mukamana",
      "specialty": "Internal Medicine"
    },
    "facility": {
      "id": 1,
      "name": "CHUK",
      "type": "referral_hospital",
      "district": "Nyarugenge",
      "province": "Kigali City"
    }
  }
}
```

**Error Response (404):**
```json
{
  "message": "Patient not found"
}
```

---

### Get Patient by ID

#### `GET /api/patients/:id`

Retrieve a patient's complete profile by ID.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Patient ID |

**Response:** Same as Get Patient by Code

---

### Get My Patients (Specialist)

#### `GET /api/patients/my-patients`

Get all patients created by the authenticated specialist.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `specialist`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Success Response (200):**
```json
{
  "patients": [
    {
      "id": 1,
      "patientCode": "RW-1705234567-8901",
      "diagnosisSummary": "Type 2 Diabetes Mellitus",
      "specialty": "Internal Medicine",
      "dischargeDate": "2024-01-10",
      "createdAt": "2024-01-10T14:30:00.000Z",
      "facility": {
        "id": 1,
        "name": "CHUK"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Create Discharge Profile

#### `POST /api/patients/discharge`

Create a new patient discharge profile.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `specialist`

**Request Body:**
```json
{
  "diagnosisSummary": "Type 2 Diabetes Mellitus with peripheral neuropathy",
  "treatmentSummary": "Metformin 500mg twice daily with meals. Gabapentin 300mg at bedtime.",
  "expectedSideEffects": "Metformin may cause GI upset. Gabapentin may cause drowsiness.",
  "warningSigns": "Severe hypoglycemia, signs of lactic acidosis, worsening numbness",
  "followUpInstructions": "Check fasting glucose daily. Follow up in 4 weeks.",
  "dischargeDate": "2024-01-15",
  "specialty": "Internal Medicine",
  "patientPhone": "+250788123456"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| diagnosisSummary | string | Yes | Summary of patient diagnosis |
| treatmentSummary | string | Yes | Treatment plan and medications |
| expectedSideEffects | string | No | Potential side effects to watch for |
| warningSigns | string | Yes | Critical warning signs requiring immediate attention |
| followUpInstructions | string | Yes | Follow-up care instructions |
| dischargeDate | string | Yes | Discharge date (YYYY-MM-DD format) |
| specialty | string | Yes | Medical specialty |
| patientPhone | string | No | Patient phone for SMS notification |

**Success Response (201):**
```json
{
  "message": "Discharge profile created successfully",
  "patient": {
    "id": 15,
    "patientCode": "RW-1705234567-8901",
    "diagnosisSummary": "Type 2 Diabetes Mellitus with peripheral neuropathy",
    "treatmentSummary": "Metformin 500mg twice daily with meals. Gabapentin 300mg at bedtime.",
    "expectedSideEffects": "Metformin may cause GI upset. Gabapentin may cause drowsiness.",
    "warningSigns": "Severe hypoglycemia, signs of lactic acidosis, worsening numbness",
    "followUpInstructions": "Check fasting glucose daily. Follow up in 4 weeks.",
    "dischargeDate": "2024-01-15",
    "specialty": "Internal Medicine",
    "createdById": 2,
    "facilityId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "smsSent": true
}
```

---

## Consultation Endpoints

### List Consultations

#### `GET /api/consultations`

Get consultations based on user role.
- **Specialists**: See consultations for their patients
- **Clinicians**: See their submitted consultations
- **Admins**: See all consultations

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status: `pending`, `responded`, `closed` |
| urgencyLevel | string | - | Filter by urgency: `routine`, `urgent`, `emergency` |
| limit | number | 20 | Items per page |
| offset | number | 0 | Number of items to skip |

**Example Request:**
```
GET /api/consultations?status=pending&limit=10
```

**Success Response (200):**
```json
{
  "consultations": [
    {
      "id": 1,
      "symptoms": ["fatigue", "frequent urination", "blurred vision"],
      "symptomDescription": "Symptoms worsening over past week",
      "vitalSigns": {
        "temperature": 37.2,
        "bloodPressureSystolic": 145,
        "bloodPressureDiastolic": 92,
        "pulseRate": 88,
        "respiratoryRate": 18
      },
      "clinicalQuestion": "Blood glucose consistently above 200mg/dL. Adjust medication?",
      "urgencyLevel": "urgent",
      "status": "pending",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "patient": {
        "id": 1,
        "patientCode": "RW-1705234567-8901",
        "diagnosisSummary": "Type 2 Diabetes Mellitus"
      },
      "clinician": {
        "id": 3,
        "firstName": "Pierre",
        "lastName": "Habimana"
      },
      "facility": {
        "id": 5,
        "name": "Remera Health Center"
      }
    }
  ],
  "total": 25
}
```

---

### Get Consultation Details

#### `GET /api/consultations/:id`

Get detailed information about a specific consultation.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Consultation ID |

**Success Response (200):**
```json
{
  "consultation": {
    "id": 1,
    "symptoms": ["fatigue", "frequent urination", "blurred vision"],
    "symptomDescription": "Patient reports increased fatigue and thirst over the past week",
    "vitalSigns": {
      "temperature": 37.2,
      "bloodPressureSystolic": 145,
      "bloodPressureDiastolic": 92,
      "pulseRate": 88,
      "respiratoryRate": 18
    },
    "clinicalQuestion": "Blood glucose readings consistently above 200mg/dL despite current medication. Should we adjust dosage or consider adding insulin?",
    "urgencyLevel": "urgent",
    "status": "responded",
    "carePathway": "local_clinic",
    "recommendations": "Increase Metformin to 1000mg twice daily. Add Glimepiride 2mg before breakfast. Continue BP medication unchanged.",
    "medicationInstructions": "Take Metformin with meals to reduce GI side effects. Monitor for signs of hypoglycemia with new medication.",
    "followUpTimeframe": "Review in 2 weeks with repeat glucose measurements",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "respondedAt": "2024-01-15T14:30:00.000Z",
    "patient": {
      "id": 1,
      "patientCode": "RW-1705234567-8901",
      "diagnosisSummary": "Type 2 Diabetes Mellitus with peripheral neuropathy",
      "treatmentSummary": "Metformin 500mg BID, Gabapentin 300mg QHS",
      "warningSigns": "Severe hypoglycemia, lactic acidosis signs",
      "specialty": "Internal Medicine"
    },
    "clinician": {
      "id": 3,
      "firstName": "Pierre",
      "lastName": "Habimana",
      "phone": "+250788111222"
    },
    "respondedBy": {
      "id": 2,
      "firstName": "Marie",
      "lastName": "Mukamana",
      "specialty": "Internal Medicine"
    },
    "facility": {
      "id": 5,
      "name": "Remera Health Center",
      "district": "Gasabo",
      "province": "Kigali City"
    }
  }
}
```

---

### Get Consultation Statistics

#### `GET /api/consultations/stats`

Get dashboard statistics for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

For **Clinicians:**
```json
{
  "stats": {
    "pending": 5,
    "responded": 12,
    "closedThisWeek": 8,
    "totalPatients": 45
  }
}
```

For **Specialists:**
```json
{
  "stats": {
    "pending": 8,
    "respondedToday": 3,
    "totalPatients": 120,
    "avgResponseTime": 4.5
  }
}
```

---

### Create Consultation

#### `POST /api/consultations`

Create a new consultation request.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `clinician`

**Request Body:**
```json
{
  "patientId": 1,
  "symptoms": ["fatigue", "frequent urination", "blurred vision"],
  "symptomDescription": "Patient reports increased fatigue and excessive thirst over the past week. Reports urinating more frequently, especially at night.",
  "vitalSigns": {
    "temperature": 37.2,
    "bloodPressureSystolic": 145,
    "bloodPressureDiastolic": 92,
    "pulseRate": 88,
    "respiratoryRate": 18
  },
  "clinicalQuestion": "Blood glucose readings consistently above 200mg/dL despite current Metformin 500mg BID. Should we adjust dosage or consider adding insulin therapy?",
  "urgencyLevel": "urgent"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | number | Yes | ID of the patient |
| symptoms | string[] | Yes | List of symptoms |
| symptomDescription | string | No | Detailed symptom description |
| vitalSigns | object | Yes | Vital signs measurements |
| vitalSigns.temperature | number | Yes | Temperature in Celsius |
| vitalSigns.bloodPressureSystolic | number | Yes | Systolic BP in mmHg |
| vitalSigns.bloodPressureDiastolic | number | Yes | Diastolic BP in mmHg |
| vitalSigns.pulseRate | number | Yes | Pulse rate in bpm |
| vitalSigns.respiratoryRate | number | Yes | Respiratory rate per minute |
| clinicalQuestion | string | Yes | Specific question for specialist |
| urgencyLevel | string | Yes | `routine`, `urgent`, or `emergency` |

**Success Response (201):**
```json
{
  "message": "Consultation created successfully",
  "consultation": {
    "id": 25,
    "patientId": 1,
    "clinicianId": 3,
    "facilityId": 5,
    "symptoms": ["fatigue", "frequent urination", "blurred vision"],
    "clinicalQuestion": "Blood glucose readings consistently above 200mg/dL...",
    "urgencyLevel": "urgent",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Respond to Consultation

#### `PUT /api/consultations/:id/respond`

Respond to a pending consultation.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `specialist`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Consultation ID |

**Request Body:**
```json
{
  "carePathway": "local_clinic",
  "recommendations": "Increase Metformin to 1000mg twice daily. Add Glimepiride 2mg before breakfast. Continue current BP medication. Patient should continue monitoring at local clinic.",
  "medicationInstructions": "Take Metformin with meals to minimize GI side effects. Take Glimepiride 30 minutes before breakfast. Monitor for signs of hypoglycemia (shakiness, sweating, confusion).",
  "followUpTimeframe": "Review in 2 weeks with fasting glucose and HbA1c if available"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| carePathway | string | Yes | `home_care`, `local_clinic`, `district_referral`, `urgent_transfer` |
| recommendations | string | Yes | Detailed care recommendations |
| medicationInstructions | string | No | Specific medication guidance |
| followUpTimeframe | string | No | When to follow up |

**Care Pathway Options:**
| Value | Description |
|-------|-------------|
| `home_care` | Patient can manage at home with provided instructions |
| `local_clinic` | Continue care at local health center |
| `district_referral` | Refer to district hospital |
| `urgent_transfer` | Immediate transfer to referral hospital |

**Success Response (200):**
```json
{
  "message": "Consultation response submitted successfully",
  "consultation": {
    "id": 25,
    "status": "responded",
    "carePathway": "local_clinic",
    "recommendations": "Increase Metformin to 1000mg twice daily...",
    "medicationInstructions": "Take Metformin with meals...",
    "followUpTimeframe": "Review in 2 weeks...",
    "respondedById": 2,
    "respondedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

### Close Consultation

#### `PUT /api/consultations/:id/close`

Close a consultation after completing the care pathway.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Consultation ID |

**Success Response (200):**
```json
{
  "message": "Consultation closed successfully",
  "consultation": {
    "id": 25,
    "status": "closed",
    "closedAt": "2024-01-20T11:00:00.000Z"
  }
}
```

---

## Notification Endpoints

### List Notifications

#### `GET /api/notifications`

Get notifications for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Maximum notifications to return |
| unreadOnly | boolean | false | Only return unread notifications |

**Success Response (200):**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "new_consultation",
      "title": "New Consultation Request",
      "message": "New urgent consultation for patient RW-1705234567-8901",
      "data": {
        "consultationId": 25,
        "patientCode": "RW-1705234567-8901",
        "urgencyLevel": "urgent"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "type": "consultation_response",
      "title": "Consultation Response Received",
      "message": "Dr. Marie Mukamana responded to your consultation",
      "data": {
        "consultationId": 20,
        "carePathway": "local_clinic"
      },
      "isRead": true,
      "readAt": "2024-01-14T16:00:00.000Z",
      "createdAt": "2024-01-14T14:30:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

**Notification Types:**
| Type | Description |
|------|-------------|
| `new_consultation` | New consultation request (for specialists) |
| `consultation_response` | Specialist response received (for clinicians) |
| `patient_assigned` | New patient assigned |
| `system_alert` | System notification |

---

### Mark Notification as Read

#### `PUT /api/notifications/:id/read`

Mark a specific notification as read.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Notification ID |

**Success Response (200):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": 1,
    "isRead": true,
    "readAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Mark All Notifications as Read

#### `PUT /api/notifications/read-all`

Mark all notifications as read for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### Delete Notification

#### `DELETE /api/notifications/:id`

Delete a notification.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Notification ID |

**Success Response (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Admin Endpoints

All admin endpoints require `administrator` role.

### List Users

#### `GET /api/admin/users`

Get all users with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name or email |
| role | string | Filter by role |
| facilityId | number | Filter by facility |
| isActive | boolean | Filter by active status |
| limit | number | Items per page (default: 50) |
| offset | number | Pagination offset |

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@hospital.rw",
      "firstName": "Admin",
      "lastName": "User",
      "role": "administrator",
      "specialty": null,
      "phone": "+250788000000",
      "isActive": true,
      "lastLogin": "2024-01-15T08:00:00.000Z",
      "facility": {
        "id": 1,
        "name": "King Faisal Hospital"
      }
    }
  ],
  "total": 50
}
```

---

### Create User

#### `POST /api/admin/users`

Create a new user.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Request Body:**
```json
{
  "email": "newdoctor@hospital.rw",
  "password": "securepassword123",
  "firstName": "Jean",
  "lastName": "Uwimana",
  "role": "specialist",
  "facilityId": 1,
  "specialty": "Cardiology",
  "phone": "+250788123456"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 25,
    "email": "newdoctor@hospital.rw",
    "firstName": "Jean",
    "lastName": "Uwimana",
    "role": "specialist",
    "facilityId": 1,
    "specialty": "Cardiology",
    "isActive": true
  }
}
```

---

### Update User

#### `PUT /api/admin/users/:id`

Update an existing user.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Request Body:**
```json
{
  "firstName": "Jean-Pierre",
  "lastName": "Uwimana",
  "role": "specialist",
  "facilityId": 2,
  "specialty": "Internal Medicine",
  "phone": "+250788123457"
}
```

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 25,
    "firstName": "Jean-Pierre",
    "lastName": "Uwimana",
    "role": "specialist",
    "facilityId": 2
  }
}
```

---

### Toggle User Status

#### `PATCH /api/admin/users/:id/toggle-status`

Activate or deactivate a user.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Success Response (200):**
```json
{
  "message": "User deactivated successfully",
  "user": {
    "id": 25,
    "isActive": false
  }
}
```

---

### List Facilities

#### `GET /api/admin/facilities`

Get all healthcare facilities.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name |
| type | string | Filter by type |
| province | string | Filter by province |
| isActive | boolean | Filter by active status |
| limit | number | Items per page |

**Success Response (200):**
```json
{
  "facilities": [
    {
      "id": 1,
      "name": "King Faisal Hospital",
      "type": "referral_hospital",
      "district": "Gasabo",
      "province": "Kigali City",
      "address": "KG 544 St, Kigali",
      "phone": "+250788000001",
      "email": "info@kfh.rw",
      "isActive": true
    }
  ],
  "total": 25
}
```

---

### Create Facility

#### `POST /api/admin/facilities`

Create a new facility.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Request Body:**
```json
{
  "name": "Muhanga District Hospital",
  "type": "district_hospital",
  "district": "Muhanga",
  "province": "Southern Province",
  "address": "Main Road, Muhanga",
  "phone": "+250788000010",
  "email": "info@muhanga-hospital.rw"
}
```

**Facility Types:**
| Value | Description |
|-------|-------------|
| `referral_hospital` | National referral hospital |
| `district_hospital` | District-level hospital |
| `health_center` | Local health center/clinic |

**Success Response (201):**
```json
{
  "message": "Facility created successfully",
  "facility": {
    "id": 26,
    "name": "Muhanga District Hospital",
    "type": "district_hospital",
    "district": "Muhanga",
    "province": "Southern Province",
    "isActive": true
  }
}
```

---

### Update Facility

#### `PUT /api/admin/facilities/:id`

Update an existing facility.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Request Body:**
```json
{
  "name": "Muhanga District Hospital",
  "phone": "+250788000011",
  "email": "contact@muhanga-hospital.rw"
}
```

**Success Response (200):**
```json
{
  "message": "Facility updated successfully",
  "facility": {
    "id": 26,
    "name": "Muhanga District Hospital",
    "phone": "+250788000011",
    "email": "contact@muhanga-hospital.rw"
  }
}
```

---

### Get Analytics

#### `GET /api/admin/analytics`

Get system-wide analytics.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `administrator`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (YYYY-MM-DD) |
| endDate | string | End date (YYYY-MM-DD) |

**Success Response (200):**
```json
{
  "overview": {
    "totalUsers": 150,
    "totalFacilities": 25,
    "totalPatients": 1250,
    "totalConsultations": 3500,
    "pendingConsultations": 45,
    "respondedConsultations": 3200
  },
  "usersByRole": [
    { "role": "specialist", "count": "45" },
    { "role": "clinician", "count": "100" },
    { "role": "administrator", "count": "5" }
  ],
  "usersByProvince": {
    "Kigali City": 60,
    "Northern Province": 25,
    "Southern Province": 30,
    "Eastern Province": 20,
    "Western Province": 15
  },
  "consultationsByUrgency": [
    { "urgencyLevel": "routine", "count": "2000" },
    { "urgencyLevel": "urgent", "count": "1200" },
    { "urgencyLevel": "emergency", "count": "300" }
  ],
  "consultationsByCarePathway": [
    { "carePathway": "home_care", "count": "800" },
    { "carePathway": "local_clinic", "count": "1500" },
    { "carePathway": "district_referral", "count": "700" },
    { "carePathway": "urgent_transfer", "count": "200" }
  ],
  "monthlyTrend": [
    { "month": "2024-01", "count": "450" },
    { "month": "2023-12", "count": "420" },
    { "month": "2023-11", "count": "380" }
  ]
}
```

