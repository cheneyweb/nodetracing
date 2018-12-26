<template>
  <v-container fluid fill-height pt-0>
    <v-layout wrap>
      <v-flex xs6>
        <v-select :items="services" v-model="selectedService" @change="getServiceOperations"></v-select>
      </v-flex>
      <v-flex xs6>
        <v-select :items="operations" v-model="selectedOperation" @change="getOperationSpans"></v-select>
      </v-flex>
      <v-flex xs12>
        <v-data-table :headers="headers" :items="spans" hide-actions :loading="loading">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="items" slot-scope="props">
            <td
              @click="spanDetail(props.item.uuid)"
              class="text-xs-left"
            >{{ props.item.operationName }}</td>
            <td @click="spanDetail(props.item.uuid)">{{ props.item.uuid }}</td>
            <td @click="spanDetail(props.item.uuid)">
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
    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title
          class="headline grey darken-2"
          primary-title
        >{{selectedOperation}}:{{dialogTitle}}</v-card-title>
        <v-card-text>Hello World</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="dialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      services: [],
      operations: [],
      spans: [],
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
        { text: "Id", value: "id", sortable: false, width: "100" },
        { text: "Duration", value: "duration" }
      ],
      dialog: false,
      dialogTitle: ""
    };
  },
  created() {
    this.getServices();
  },
  methods: {
    // 获取所有服务节点
    async getServices() {
      this.loading = true;
      let res = await this.$store.dispatch("getServices", {});
      this.services = res;
      // 默认选中第一个服务节点
      this.selectedService = this.services[0];
      this.getServiceOperations(this.selectedService);
    },
    // 获取单个服务节点的所有操作
    async getServiceOperations(e) {
      this.loading = true;
      let res = await this.$store.dispatch("getServiceOperations", {
        serviceName: this.selectedService
      });
      this.operations = res;
      // 默认选中第一个操作
      this.selectedOperation = this.operations[0];
      this.getOperationSpans();
    },
    // 获取单个操作的所有根Span
    async getOperationSpans() {
      let res = await this.$store.dispatch("getOperationSpans", {
        serviceName: this.selectedService,
        operationName: this.selectedOperation
      });
      this.spans = res;
      this.loading = false;
    },
    spanDetail(spanId) {
      this.dialogTitle = spanId;
      this.dialog = true;
    }
  }
};
</script>

