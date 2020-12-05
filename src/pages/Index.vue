<template>
  <q-page>
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Tableau de bord</div>
          </q-toolbar-title>
          <div class="text-caption text-red" v-if="filterError !== ''">{{ filterError }}</div>

          <div class="q-pa-sm">
            <q-input dense filled stack-label v-model="dateFrom" type="date" label="de"></q-input>
          </div>

          <div class="q-pa-sm">
            <q-input dense filled stack-label v-model="dateTo" type="date" label="à"></q-input>
          </div>
          <q-btn
            label="Filtrer"
            class="float-right q-pa-xs"
            color="blue-10"
            icon="eva-funnel-outline"
            size="sm"
            @click="getDashboardData"
          />
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page class>
          <div class="row">
            <div class="col-md-3 col-xs-12 col-sm-12 q-pa-md">
              <q-list>
                <q-item class="bg-blue-1 rounded-borders q-pa-md" clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon color="black" size="xl" name="eva-people-outline"/>
                  </q-item-section>
                  <q-item-section>
                    <div class="row">
                      <div class="col-12 q-mb-sm">
                        <div class="full-width text-subtitle2 text-weight-bold">Nouveaux clients</div>
                      </div>
                      <div class="col-4">
                        <div class="text-h4 text-weight-bold text-blue-10">{{ customerCount }}</div>
                      </div>
                      <div class="col-8">
                        <div class="text-caption text-grey-10"><span class="text-weight-bold text-blue-10"> {{ customers[5] }} </span>  confirmés</div>
                        <div class="text-caption text-grey-10"><span class="text-weight-bold text-blue-10"> {{ customers[3] }} </span> en attente </div>
                        <div class="text-caption text-grey-10"><span class="text-weight-bold text-blue-10"> {{ customers[4] }} </span> bloqués </div>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-3 col-xs-12 col-sm-12 q-pa-md">
              <q-list>
                <q-item class="bg-blue-1 rounded-borders q-pa-md" clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon color="black" size="xl" name="eva-shopping-bag-outline"/>
                  </q-item-section>
                  <q-item-section>
                    <div class="full-width text-subtitle2 text-weight-bold">Commandes</div>
                    <div class="text-h4 text-weight-bold text-blue-10">{{ orderCount }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-3 col-xs-12 col-sm-12 q-pa-md">
              <q-list>
                <q-item class="bg-blue-1 rounded-borders q-pa-md" clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon color="black" size="xl" name="eva-credit-card-outline"/>
                  </q-item-section>
                  <q-item-section>
                    <div class="full-width text-subtitle2 text-weight-bold">Ventes</div>
                    <div class="text-h4 text-weight-bold text-blue-10">
                      {{ sales }}
                      <span class="text-h6 text-black text-weight-bold">DZD</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      dateFrom: '',
      dateTo: '',
      filterError: '',
      customers: {
        5: 0,
        4: 0,
        3: 0
      },
      orderCount: 0,
      sales: 0.0
    }
  },
  computed: {
    customerCount () {
      return this.customers[5] + this.customers[4] + this.customers[3]
    }
  },
  components: {},
  mounted () {
    const days = 7
    const date = new Date()
    const last = new Date(date.getTime() - days * 24 * 60 * 60 * 1000)

    const FromDay = last.getDate() < 10 ? '0' + last.getDate() : last.getDate()
    const FromMonth =
      last.getMonth() + 1 < 10
        ? '0' + last.getMonth() + 1
        : last.getMonth() + 1
    const FromYear = last.getFullYear()

    const ToDay = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const ToMonth =
      date.getMonth() + 1 < 10
        ? '0' + date.getMonth() + 1
        : date.getMonth() + 1
    const ToYear = date.getFullYear()

    this.dateFrom = FromYear + '-' + FromMonth + '-' + FromDay
    this.dateTo = ToYear + '-' + ToMonth + '-' + ToDay

    this.getDashboardData()
  },
  methods: {
    getDashboardData () {
      this.filterError = ''
      if (!this.dateTo || !this.dateFrom) {
        this.filterError = 'Veuillez choisir les dates de filtre'
      } else {
        this.$axios
          .post('/getDashboardData', {
            from: this.dateFrom,
            to: this.dateTo
          })
          .then(res => {
            res.data.customers.forEach(el => {
              this.customers[el.state] = el.count
            })
          })
      }
    }
  }
}
</script>
