const { app } = require("@azure/functions");
const { WebPubSubServiceClient } = require("@azure/web-pubsub");

const WPS = process.env.WEBPUBSUB_CONNECTION_STRING;
const HUB = process.env.WEBPUBSUB_HUB;
const service = new WebPubSubServiceClient(WPS, HUB);

app.cosmosDB("onCosmosChange", {
  connection: "CosmosDBConnectionString",
  databaseName: "%COSMOS_DATABASE%",
  containerName: "%COSMOS_CONTAINER%",
  createLeaseContainerIfNotExists: true,
  leaseContainerName: "%COSMOS_LEASES_CONTAINER%",
  handler: async (docs, context) => {
    if (!docs || !docs.length) return;

    try {
      await service.sendToAll({
        type: "text",
        data: JSON.stringify({
          type: "UPSERT_BATCH",
          items: docs
        })
      });
      context.log(`✅ Publicados ${docs.length} cambios a WebPubSub`);
    } catch (err) {
      context.error("Error enviando a WebPubSub:", err);
    }
  }
});

