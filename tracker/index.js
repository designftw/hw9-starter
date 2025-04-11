import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

createApp({
  data() {
    return {
      entries: [],
    };
  },

  methods: {
    async addEntry(content) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.$graffiti.put(
        {
          value: {
            published: Date.now(),
            content,
            // Feel free to add more properties here
            // based on your personal tracker's needs!
          },
          allowed: [],
          channels: [this.$graffitiSession.value],
        },
        this.$graffitiSession.value,
      );
    },

    async saveEntry(entry) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.$graffiti.put(entry, this.$graffitiSession.value);
    },

    async deleteEntry(entry) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.$graffiti.delete(entry, this.$graffitiSession.value);
    },

    async refreshEntries() {
      const entriesIterator = this.$graffiti.discover(
        [this.$graffitiSession.value],
        {
          properties: {
            value: {
              content: { type: "string" },
              published: { type: "number" },
            },
          },
        },
        this.$graffitiSession.value,
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.entries = [];
      for await (const { object } of entriesIterator) {
        this.entries.push(object);
      }

      // Do any processing here like sorting...
    },
  },
})
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    // graffiti: new GraffitiRemote(),
  })
  .mount("#app");
