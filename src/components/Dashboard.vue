<template>
  <BaseLayout>
    <div class="page">

      <!-- HEADER -->
      <div class="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Dashboard KPI</h5>

        <select class="form-select w-auto" v-model="selectedMonth">
          <option :value="6">6 tháng</option>
          <option :value="12">12 tháng</option>
        </select>
      </div>

      <!-- CONTENT -->
      <div class="p-4 bg-light">

        <!-- KPI CARDS -->
        <div class="row mb-4">
          <div class="col-md-3" v-for="card in kpiCards" :key="card.title">
            <div class="card shadow-sm border-0 hover-card">
              <div class="card-body text-center">
                <h6 class="text-muted">{{ card.title }}</h6>
                <h2 :class="card.color">{{ card.value }}%</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- CHART -->
        <div class="row mb-4">
          <div class="col-md-8">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5>📈 Xu hướng KPI</h5>
                <canvas ref="lineChart"></canvas>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5>📊 Trạng thái</h5>
                <canvas ref="pieChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- BAR -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5>🏢 So sánh đơn vị</h5>
            <canvas ref="barChart"></canvas>
          </div>
        </div>

        <!-- TABLE -->
        <div class="card shadow-sm">
          <div class="card-body">
            <h5>Danh sách đơn vị</h5>
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Đơn vị</th>
                  <th>%</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in units" :key="u.name">
                  <td>{{ u.name }}</td>
                  <td>{{ u.percent }}%</td>
                  <td>
                    <span :class="getStatusClass(u.percent)">
                      {{ getStatusText(u.percent) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </BaseLayout>
</template>

<script>
  import Chart from "chart.js/auto";
  import BaseLayout from "./BaseLayout.vue";

  export default {
    components: {
      BaseLayout
    },

    data() {
      return {
        selectedMonth: 6,
        lineChart: null,
        pieChart: null,
        barChart: null,

        kpiCards: [
          { title: "Hoàn thành", value: 78, color: "text-success" },
          { title: "Chưa đạt", value: 15, color: "text-warning" },
          { title: "Không đạt", value: 7, color: "text-danger" },
          { title: "Vượt", value: 25, color: "text-primary" }
        ],

        units: []
      };
    },

    mounted() {
      this.$nextTick(() => {
        this.loadData();
      });
    },

    watch: {
      selectedMonth() {
        this.loadData();
      }
    },

    methods: {
      generateData(months) {
        let labels = [];
        let data = [];

        for (let i = 1; i <= months; i++) {
          labels.push("T" + i);
          data.push(Math.floor(Math.random() * 50) + 50);
        }

        return { labels, data };
      },

      generateUnits() {
        const names = ["Phòng A", "Phòng B", "Phòng C", "Xã D"];
        return names.map(n => ({
          name: n,
          percent: Math.floor(Math.random() * 50) + 50
        }));
      },

      loadData() {
        const chartData = this.generateData(this.selectedMonth);
        this.units = this.generateUnits();

        this.renderCharts(chartData);
      },

      renderCharts(chartData) {
        if (this.lineChart) this.lineChart.destroy();
        if (this.pieChart) this.pieChart.destroy();
        if (this.barChart) this.barChart.destroy();

        this.lineChart = new Chart(this.$refs.lineChart, {
          type: "line",
          data: {
            labels: chartData.labels,
            datasets: [{
              label: "KPI (%)",
              data: chartData.data,
              borderColor: "#0d6efd",
              tension: 0.4
            }]
          }
        });

        let avg = Math.round(chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length);

        this.pieChart = new Chart(this.$refs.pieChart, {
          type: "pie",
          data: {
            labels: ["Đạt", "Chưa đạt", "Không đạt"],
            datasets: [{
              data: [avg, 100 - avg - 10, 10],
              backgroundColor: ["#198754", "#ffc107", "#dc3545"]
            }]
          }
        });

        this.barChart = new Chart(this.$refs.barChart, {
          type: "bar",
          data: {
            labels: this.units.map(u => u.name),
            datasets: [{
              label: "%",
              data: this.units.map(u => u.percent),
              backgroundColor: "#0d6efd"
            }]
          }
        });
      },

      getStatusText(p) {
        if (p >= 100) return "Vượt";
        if (p >= 80) return "Đạt";
        if (p >= 50) return "Trung bình";
        return "Không đạt";
      },

      getStatusClass(p) {
        if (p >= 100) return "badge bg-primary";
        if (p >= 80) return "badge bg-success";
        if (p >= 50) return "badge bg-warning";
        return "badge bg-danger";
      }
    }
  };
</script>

<style>
  .page {
    width: 100%;
  }

  .hover-card:hover {
    transform: translateY(-5px);
    transition: 0.3s;
  }

  canvas {
    height: 300px !important;
  }
</style>