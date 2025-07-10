import swaggerJsdoc from "swagger-jsdoc";
 
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lenzoo",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.BASE_URL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};
 
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
 