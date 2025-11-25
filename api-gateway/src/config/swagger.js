import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Paragon API Gateway",
            version: "1.0.0",
            description: "API Gateway documentation for Layout Optimization System. This API provides endpoints for managing delivery orders, shipments, route optimization, box layouting, and user management.",
            contact: {
                name: "API Support",
                email: "support@paragon.com"
            }
        },
        servers: [
            {
                url: process.env.REACT_APP_BACKEND_URL || "http://85.209.163.202:28080",
                description: "Development server",
            },
        ],
        tags: [
            {
                name: "Public",
                description: "Public endpoints that don't require authentication"
            },
            {
                name: "Auth",
                description: "Authentication and authorization endpoints"
            },
            {
                name: "User",
                description: "User management endpoints"
            },
            {
                name: "Dashboard",
                description: "Dashboard data endpoints"
            },
            {
                name: "Delivery Order",
                description: "Delivery order management endpoints"
            },
            {
                name: "Location",
                description: "Location management endpoints"
            },
            {
                name: "Truck",
                description: "Truck management endpoints"
            },
            {
                name: "Role",
                description: "Role management endpoints"
            },
            {
                name: "Distribution Center",
                description: "Distribution center endpoints"
            },
            {
                name: "Product",
                description: "Product management endpoints"
            },
            {
                name: "Product Line",
                description: "Product line management endpoints"
            },
            {
                name: "Shipment",
                description: "Shipment management and tracking endpoints"
            },
            {
                name: "Customer",
                description: "Customer management endpoints"
            },
            {
                name: "Box",
                description: "Box management and dimension calculation endpoints"
            },
            {
                name: "Optimization",
                description: "Route and layout optimization endpoints"
            },
            {
                name: "Health",
                description: "Health check endpoints"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token obtained from login endpoint"
                },
                apiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                    description: "API key for machine learning service integration"
                },
            },
            schemas: {
                HTTPResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            description: "Indicates if the request was successful"
                        },
                        status: {
                            type: "integer",
                            description: "HTTP status code"
                        },
                        message: {
                            type: "string",
                            description: "Response message"
                        },
                        data: {
                            type: "object",
                            description: "Response data payload"
                        },
                        error: {
                            type: "string",
                            nullable: true,
                            description: "Error message if any"
                        }
                    }
                }
            }
        },
    },
    apis: ["./src/routes/*.js"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
