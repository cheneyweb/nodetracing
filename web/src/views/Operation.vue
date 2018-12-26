<template>
  <v-container fluid fill-height pt-0>
    <v-layout wrap>
      <v-flex xs6>
        <v-select :items="services" v-model="selectService"></v-select>
      </v-flex>
      <v-flex xs6>
        <v-select :items="names" v-model="selectName"></v-select>
      </v-flex>
      <v-flex xs12>
        <v-data-table :headers="headers" :items="items" hide-actions>
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.operationName }}</td>
            <td>
              <v-layout>
                <v-flex xs11>
                  <v-progress-linear color="error" height="20" value="75"></v-progress-linear>
                </v-flex>
                <v-flex xs1 align-self-center>{{ props.item.duration }}ms</v-flex>
              </v-layout>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      services: ["service-demo"],
      names: ["HelloWorld"],
      selectService: "service-demo",
      selectName: "HelloWorld",
      headers: [
        {
          text: "Operation",
          align: "left",
          sortable: false,
          value: "operationName",
          width: "300"
        },
        { text: "Duration", value: "duration" }
      ],
      items: []
    };
  },
  created() {
    this.getOperation();
  },
  methods: {
    async getOperation() {
      let res = await this.$store.dispatch("operation", {
        serviceName: "server-demo",
        operationName: "parent_span"
      });
      this.items = res;
    }
  }
};
</script>

