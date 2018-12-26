<template>
  <v-container fluid fill-height pt-0>
    <v-layout wrap>
      <v-flex xs6>
        <v-select :items="services" v-model="selectedService" @change="changeService"></v-select>
      </v-flex>
      <v-flex xs6>
        <v-select :items="operations" v-model="selectedOperation" @change="changeOperation"></v-select>
      </v-flex>
      <v-flex xs12>
        <v-data-table :headers="headers" :items="items" hide-actions :loading="loading">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
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
      loading: true,
      services: [],
      operations: [],
      selectedService: "",
      selectedOperation: "",
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
    this.getAllService();
  },
  methods: {
    async getAllService() {
      let res = await this.$store.dispatch("allservice", {});
      this.services = res;
      this.selectedService = this.services[0];
      this.changeService(this.selectedService);
    },
    async changeService(e) {
      let res = await this.$store.dispatch("serviceOperation", {
        serviceName: this.selectedService
      });
      this.operations = res;
      this.selectedOperation = this.operations[0];
      this.changeOperation();
    },
    async changeOperation() {
      let res = await this.$store.dispatch("operationSpan", {
        serviceName: this.selectedService,
        operationName: this.selectedOperation
      });
      this.items = res;
      this.loading = false;
    }
  }
};
</script>

