<template>
  <q-page padding>
    <q-card class="no-shadow">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey text-weight-bold text-h6"
        active-color="blue-19"
        indicator-color="blue-10"
        align="left"
        narrow-indicator
      >
        <q-tab name="entreprise" label="Entreprise"/>
        <q-tab name="contract" label="Contrat du client"/>
        <q-tab name="movies" label="Movies"/>
      </q-tabs>

      <q-separator/>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="entreprise">
          <EntrepriseComponent></EntrepriseComponent>
        </q-tab-panel>

        <q-tab-panel name="contract">
          <div class="row">
            <div class="col-md-4 q-pa-sm">
              <q-list bordered>
                <q-item header>
                  <q-item-section>
                    <div class="text-weight-bold">Modes de paiement</div>
                  </q-item-section>
                  <q-item-section>
                    <div class="text-right">
                      <q-btn
                        round
                        flat
                        size="md"
                        color="grey-10"
                        class="bg-grey-2"
                        icon="eva-plus-outline"
                        @click="mod = 'paymentMode', row = null, dialog = true"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-for="(e,i) in paymentModes" :key="i" clickable v-ripple>
                  <q-item-section>
                    <div class="text-subtitle2">
                      {{ e.name }}
                      <q-btn
                        flat
                        round
                        size="xs"
                        color="grey-8"
                        class="bg-grey-2"
                        icon="eva-edit-outline"
                        @click="editRow(e, 'paymentMode')"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-4 q-pa-sm">
              <q-list bordered>
                <q-item header>
                  <q-item-section>
                    <div class="text-weight-bold">Délai de paiement</div>
                  </q-item-section>
                  <q-item-section>
                    <div class="text-right">
                      <q-btn
                        round
                        flat
                        size="md"
                        color="grey-10"
                        class="bg-grey-2"
                        icon="eva-plus-outline"
                        @click="mod = 'paymentDeadline', row = null, dialog = true"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-for="(e,i) in paymentDeadlines" :key="i" clickable v-ripple>
                  <q-item-section>
                    <div class="text-subtitle2">
                      <span class="text-weight-bold">{{ e.days }}</span> jours aprés la recéption
                      <q-btn
                        flat
                        round
                        size="xs"
                        color="grey-8"
                        class="bg-grey-2"
                        icon="eva-edit-outline"
                        @click="editRow(e, 'paymentDeadline')"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-4 q-pa-sm">
              <q-list bordered>
                <q-item header>
                  <q-item-section>
                    <div class="text-weight-bold">Soldes max</div>
                  </q-item-section>
                  <q-item-section>
                    <div class="text-right">
                      <q-btn
                        round
                        flat
                        size="md"
                        color="grey-10"
                        class="bg-grey-2"
                        icon="eva-plus-outline"
                        @click="mod = 'maxDebt', row = null, dialog = true"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-for="(e,i) in maxDebts" :key="i" clickable v-ripple>
                  <q-item-section>
                    <div class="text-subtitle2">
                      <span class="text-weight-bold">{{ parseFloat(e.amount).toFixed(2) }}</span> DZD
                      <q-btn
                        flat
                        round
                        size="xs"
                        color="grey-8"
                        class="bg-grey-2"
                        icon="eva-edit-outline"
                        @click="editRow(e, 'maxDebt')"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-for="(p ,i) in pages" :key="i" class="col-md-6 q-pa-sm bordered">
              <div class="text-subtitle1 text-weight-bold q-pa-md">{{ p.name }}</div>
              <q-editor
                v-model="p.description"
                dense
                :toolbar="[
        [
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify']
          },
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            options: ['left', 'center', 'right', 'justify']
          }
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            label: $q.lang.editor.fontSize,
            icon: $q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          {
            label: $q.lang.editor.defaultFont,
            icon: $q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana'
            ]
          },
          'removeFormat'
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

        ['undo', 'redo'],
        ['viewsource']
      ]"
                :fonts="{
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }"
              />
            </div>
            <div class="col-12 text-right q-pa-sm">
              <q-btn color="blue-10" size="sm" class="q-pa-sm" label="Enregistrer" @click="savePages"/>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="Autres">
          <div class="text-h6">Publicités</div>

        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <q-dialog v-model="dialog" persistent>
      <q-card class="no-shadow" style="width: 500px">
        <q-card-section class="row items-center">
          <div class="col-12">
            <CustomerContractItemComponent
              :mod="mod"
              :row="row"
              v-on:addRow="addRow"
              v-on:closeDialog="dialog=false"
            ></CustomerContractItemComponent>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import EntrepriseComponent from 'components/EntrepriseComponent'
import CustomerContractItemComponent from 'components/CustomerContractItemComponent'
export default {
  name: 'ConfigurationPage',
  data () {
    return {
      dialog: false,
      tab: 'entreprise',
      paymentModes: [],
      paymentDeadlines: [],
      maxDebts: [],
      mod: '',
      row: null,
      pages: []
    }
  },
  components: {
    EntrepriseComponent,
    CustomerContractItemComponent
  },
  mounted () {
    this.getPaymentModes()
    this.getPaymentDeadlines()
    this.getMaxDebts()
    this.getContractItems()
  },
  methods: {
    savePages () {
      this.$axios
        .post('saveContractItems', {
          pages: this.pages.map(obj => ({
            id: obj.id,
            lang_id: obj.lang_id,
            description: obj.description
          }))
        })
        .then(res => {
          this.$q.notify({
            color: 'blue-10',
            message: 'Les pages ont été modifié avec succés'
          })
        })
    },
    getContractItems () {
      this.$axios.get('getContractItems').then(res => {
        this.pages = res.data
      })
    },
    getPaymentModes () {
      this.$axios.get('/paymentMode').then(res => {
        this.paymentModes = res.data
      })
    },
    getPaymentDeadlines () {
      this.$axios.get('/paymentDeadline').then(res => {
        this.paymentDeadlines = res.data
      })
    },
    getMaxDebts () {
      this.$axios.get('/maxDebt').then(res => {
        this.maxDebts = res.data
      })
    },
    addRow (data) {
      if (this.row === null) {
        if (data.mod === 'paymentMode') {
          this.paymentModes.push(data)
        }
        if (data.mod === 'paymentDeadline') {
          this.paymentDeadlines.push(data)
        }
        if (data.mod === 'maxDebt') {
          this.maxDebts.push(data)
        }
      } else {
        if (data.mod === 'paymentMode') {
          const i = this.paymentModes.findIndex(el => el.id === data.id)
          if (i !== -1) {
            this.paymentModes.splice(i, 1, data)
          }
        }
        if (data.mod === 'paymentDeadline') {
          const i = this.paymentDeadlines.findIndex(el => el.id === data.id)
          if (i !== -1) {
            this.paymentDeadlines.splice(i, 1, data)
          }
        }
        if (data.mod === 'maxDebt') {
          const i = this.maxDebts.findIndex(el => el.id === data.id)
          if (i !== -1) {
            this.maxDebts.splice(i, 1, data)
          }
        }
        this.row = null
      }
      this.dialog = false
    },
    editRow (e, mod) {
      this.mod = mod
      this.row = e
      this.dialog = true
    }
  }
}
</script>
