const { app } = require("@azure/functions");
const { WebPubSubServiceClient } = require("@azure/web-pubsub");

app.http("negotiate", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "negotiate",
  handler: async (_req, _ctx) => {
    const conn = process.env.WEBPUBSUB_CONNECTION_STRING;
    const hub  = process.env.WEBPUBSUB_HUB || "tasks";
    if (!conn) return { status: 500, body: "WEBPUBSUB_CONNECTION_STRING no configurada" };

    const service = new WebPubSubServiceClient(conn, hub);
    const token = await service.getClientAccessToken(); // { url, accessToken, expiresOn }
    return { status: 200, jsonBody: token };
  }
});
