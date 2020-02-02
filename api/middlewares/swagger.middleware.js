import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export default class SwaggerMiddleware {
  #specs;

  constructor(version, servers, apis) {
    // Swagger set up
    const options = {
      swaggerDefinition: {
        openapi: "3.0.0",
        info: {
          title: "Contacts API",
          version,
          description:
            "The Contacts API is a prototype API for applying REST architecture best practices",
          license: {
            name: "MIT",
            url: "https://choosealicense.com/licenses/mit/"
          },
          contact: {
            name: "Swagger",
            url: "https://swagger.io",
            email: "Info@SmartBear.com"
          }
        },
        servers
      },
      apis
    };

    this.#specs = swaggerJsdoc(options);
  }

  get swaggerUiHandlers() {
    return swaggerUi.serve;
  }

  get swaggerUiMiddleware() {
    return swaggerUi.setup(this.#specs, {
      explorer: true
    });
  }
}
