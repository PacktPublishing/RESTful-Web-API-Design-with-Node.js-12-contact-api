import { ServerConfig } from "./config";
import { contacts, groups } from "./routes";

async function main() {
  const PORT = process.env.PORT || 3000;
  const server = new ServerConfig({
    port: PORT,
    // middleware: [],
    routers: [contacts, groups]
  });

  server.listen();
}

main();
