import swaggerUi from "swagger-ui-express";

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "TeenUp Mini LMS API",
    version: "1.0.0",
    description: "Backend API documentation for Product Builder test"
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local server"
    }
  ],
  tags: [
    { name: "Parents" },
    { name: "Students" },
    { name: "Classes" },
    { name: "Registrations" },
    { name: "Subscriptions" }
  ],
  components: {
    schemas: {
      ParentInput: {
        type: "object",
        required: ["name", "phone", "email"],
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" }
        }
      },
      StudentInput: {
        type: "object",
        required: ["name", "dob", "gender", "current_grade", "parent_id"],
        properties: {
          name: { type: "string" },
          dob: { type: "string", format: "date" },
          gender: { type: "string" },
          current_grade: { type: "string" },
          parent_id: { type: "integer" }
        }
      },
      ClassInput: {
        type: "object",
        required: ["name", "subject", "day_of_week", "time_slot", "teacher_name", "max_students"],
        properties: {
          name: { type: "string" },
          subject: { type: "string" },
          day_of_week: { type: "string", example: "MONDAY" },
          time_slot: { type: "string", example: "18:00-19:30" },
          teacher_name: { type: "string" },
          max_students: { type: "integer", minimum: 1 }
        }
      },
      SubscriptionInput: {
        type: "object",
        required: ["student_id", "package_name", "start_date", "end_date", "total_sessions"],
        properties: {
          student_id: { type: "integer" },
          package_name: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          total_sessions: { type: "integer", minimum: 1 },
          used_sessions: { type: "integer", minimum: 0 }
        }
      },
      RegisterInput: {
        type: "object",
        required: ["student_id"],
        properties: {
          student_id: { type: "integer" }
        }
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Parents"],
        summary: "Health check",
        responses: { 200: { description: "API is healthy" } }
      }
    },
    "/api/parents": {
      post: {
        tags: ["Parents"],
        summary: "Create a parent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParentInput" }
            }
          }
        },
        responses: { 201: { description: "Parent created" } }
      }
    },
    "/api/parents/{id}": {
      get: {
        tags: ["Parents"],
        summary: "Get parent detail",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Parent detail" }, 404: { description: "Not found" } }
      }
    },
    "/api/students": {
      post: {
        tags: ["Students"],
        summary: "Create a student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentInput" }
            }
          }
        },
        responses: { 201: { description: "Student created" } }
      }
    },
    "/api/students/{id}": {
      get: {
        tags: ["Students"],
        summary: "Get student detail with parent",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Student detail" }, 404: { description: "Not found" } }
      }
    },
    "/api/classes": {
      post: {
        tags: ["Classes"],
        summary: "Create class",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClassInput" }
            }
          }
        },
        responses: { 201: { description: "Class created" } }
      },
      get: {
        tags: ["Classes"],
        summary: "List classes, optionally by day",
        parameters: [{ name: "day", in: "query", required: false, schema: { type: "string" } }],
        responses: { 200: { description: "Class list" } }
      }
    },
    "/api/classes/{class_id}/register": {
      post: {
        tags: ["Registrations"],
        summary: "Register student to class",
        parameters: [{ name: "class_id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" }
            }
          }
        },
        responses: {
          201: { description: "Registered successfully" },
          400: { description: "Validation failed" },
          404: { description: "Class not found" }
        }
      }
    },
    "/api/registrations/{id}": {
      delete: {
        tags: ["Registrations"],
        summary: "Cancel registration with refund policy",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Cancelled" }, 404: { description: "Not found" } }
      }
    },
    "/api/subscriptions": {
      post: {
        tags: ["Subscriptions"],
        summary: "Create subscription",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubscriptionInput" }
            }
          }
        },
        responses: { 201: { description: "Subscription created" } }
      }
    },
    "/api/subscriptions/{id}": {
      get: {
        tags: ["Subscriptions"],
        summary: "Get subscription status",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Subscription detail" }, 404: { description: "Not found" } }
      }
    },
    "/api/subscriptions/{id}/use": {
      patch: {
        tags: ["Subscriptions"],
        summary: "Mark one session as used",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Updated" }, 400: { description: "No remaining sessions" } }
      }
    }
  }
};

export const swaggerUiHandlers = [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];
