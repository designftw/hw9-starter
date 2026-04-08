import { createApp, computed } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiDecentralized } from "@graffiti-garden/implementation-decentralized";
import {
  GraffitiPlugin,
  useGraffiti,
  useGraffitiSession,
  useGraffitiDiscover,
} from "@graffiti-garden/wrapper-vue";

function setup() {
  const graffiti = useGraffiti();
  const session = useGraffitiSession();

  // Store the tracker entries in my "tracker" folder
  const trackerChannels = computed(() => {
    return session.value ? [session.value.actor + "/tracker"] : [];
  });

  // This is an artificial delay for local testing async tasks
  async function delay() {
    await new Promise((r) => setTimeout(r, 1000));
  }

  async function addEntry(content) {
    await delay();
    await graffiti.post(
      {
        // The object's "value" can be any JSON,
        // feel free to change these properties
        // and add new ones as needed based on your
        // tracker's needs
        value: {
          activity: "Update",

          // Generate a unique ID for the entry
          // to identifies it across updates
          id: crypto.randomUUID(),

          // Timestamps for when the tracked entry "happened"
          // (published) and when the tracked entry was modified (updated)
          published: Date.now(),
          updated: Date.now(),

          // Content includes any notes for the tracker entry
          content,
        },
        // Empty allowed list => only you can see the data
        allowed: [],

        channels: trackerChannels.value,
      },
      session.value,
    );
  }

  async function saveEntry(entry) {
    await delay();
    entry.value.updated = Date.now();
    await graffiti.post(entry, session.value);
  }

  // Discover for objects like those produced by addEntry and saveEntry
  const { objects: updates, isFirstPoll: areUpdatesLoading } =
    useGraffitiDiscover(
      trackerChannels,
      // This is a JSONSchema
      // https://json-schema.org/docs
      {
        properties: {
          value: {
            required: ["activity", "id", "content", "published", "updated"],
            properties: {
              activity: { const: "Update" },
              id: { type: "string" },
              content: { type: "string" },
              published: { type: "number" },
              updated: { type: "number" },
            },
          },
        },
      },
      session,
    );

  // Merge updates activities together to only
  // take the most recent one for each ID
  // (this makes it possible "edit" entries
  //  even though Graffiti only allows you to modify
  //  objects via "post" and "delete")
  const entries = computed(() => {
    return Object.values(
      updates.value.reduce((acc, object) => {
        const { id, updated } = object.value;
        if (!acc[id] || acc[id].value.updated < updated) {
          acc[id] = object;
        }
        return acc;
      }, {}),
    );
  });

  // Delete will delete all the updates for a given id
  async function deleteEntry(entry) {
    await delay();
    await Promise.all(
      updates.value
        .filter((o) => o.value.id === entry.value.id)
        .map((o) => graffiti.delete(o, session.value)),
    );
  }

  return {
    areUpdatesLoading,
    entries,
    addEntry,
    deleteEntry,
    saveEntry,
  };
}

createApp({ template: "#template", setup })
  .use(GraffitiPlugin, {
    // Use this version of Graffiti for testing/developement
    graffiti: new GraffitiLocal(),

    // Use this version for production
    // You will actually login and your data will be stored remotely
    // which will allow it to sync across devices
    //
    // graffiti: new GraffitiDecentralized(),
  })
  .mount("#app");
