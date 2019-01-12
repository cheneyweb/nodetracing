<template>
  <v-container fluid fill-height pt-2>
    <v-layout wrap>
      <v-flex xs6>
        <v-select
          :items="services"
          v-model="selectedService"
          @change="getServiceOperations"
          label="Select service"
        ></v-select>
      </v-flex>
      <v-flex xs6>
        <v-select
          :items="operations"
          v-model="selectedOperation"
          @change="getOperationSpans"
          label="Select operation"
        ></v-select>
      </v-flex>
      <v-flex xs12>
        <v-data-table
          :headers="headers"
          :items="spans"
          hide-actions
          :loading="loading"
          :disable-initial-sort="disableInitialSort"
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="items" slot-scope="props">
            <td
              @click="openSpan(props.item.id)"
              class="text-xs-left"
            >{{ props.item.operationName }}：{{ props.item.id }}</td>
            <td @click="openSpan(props.item.id)">{{ props.item.startMs | formatDate}}</td>
            <td @click="openSpan(props.item.id)">
              <v-layout>
                <v-flex xs11>
                  <v-progress-linear
                    :color="props.item.percent == 100 ? 'error' : 'blue-grey'"
                    height="20"
                    :value="props.item.percent"
                  ></v-progress-linear>
                </v-flex>
                <v-flex xs1 align-self-center>{{ props.item.duration }}ms</v-flex>
              </v-layout>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <Span :selectedOperation="selectedOperation" :spanId="spanId"/>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
import Span from "../components/Span";
export default {
  components: {
    Span
  },
  data() {
    return {
      loading: true,
      services: [],
      operations: [],
      spans: [],
      selectedService: "",
      selectedOperation: "",
      disableInitialSort: true,
      headers: [
        {
          text: "Operation",
          align: "left",
          sortable: false,
          value: "operationName",
          width: "300"
        },
        { text: "Start", value: "startMs", width: "200" },
        { text: "Duration", value: "duration" }
      ],
      spanId: null
    };
  },
  filters: {
    formatDate(timestamp) {
      return dayjs(timestamp).format("YY/MM/DD HH:mm:ss");
    }
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
    // 获取单个根Span追踪甘特图
    openSpan(spanId) {
      this.spanId = spanId;
      this.$store.commit("openSpan", !this.$store.state.openSpan);
    }
  }
};
</script>

