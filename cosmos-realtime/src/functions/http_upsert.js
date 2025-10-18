const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

const COSMOS_CONN = process.env.CosmosDBConnectionString;
const DB  = process.env.COSMOS_DATABASE;
const COL = process.env.COSMOS_CONTAINER;

// Cliente lazy (se crea la 1ª vez)
let container;
function getContainer() {
  if (!container) {
    const client = new CosmosClient(COSMOS_CONN);
    container = client.database(DB).container(COL);
  }
  return container;
}

app.http("http_upsert", {
  methods: ["POST", "GET"],
  authLevel: "anonymous",
  route: "http_upsert",
  handler: async (req, ctx) => {
    try {
      // Permite GET de prueba
      if (req.method === "GET") {
        return { status: 200, jsonBody: { ok: true, msg: "http_upsert vivo" } };
      }

      const body = await req.json();               // espera JSON
      if (!body?.id) return { status: 400, body: "Falta 'id' en el JSON" };

      body.updatedAt = Date.now();                 // LWW simple
      await getContainer().items.upsert(body);

      return { status: 200, jsonBody: { ok: true, id: body.id } };
    } catch (err) {
      ctx.log.error(err);
      return { status: 500, body: "Error al guardar" };
    }
  }
});
