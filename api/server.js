import { ServerConfig } from "./config";
import { contactsV1, groupsV1, redirectRouter, contactsV2 } from "./routes";

async function main() {
  const PORT = process.env.PORT || 3000;
  const server = new ServerConfig({
    port: PORT,
    // middleware: [],
    routers: [redirectRouter, contactsV2, contactsV1, groupsV1]
  });

  server.listen();
}

main();
