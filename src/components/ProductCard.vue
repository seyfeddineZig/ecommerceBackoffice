<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs">
      <q-expansion-item expand-separator default-opened expand-icon-toggle label="Détail">
        <div class="row">
          <q-input
            class="col-12 q-pa-sm"
            filled
            v-model="selectedRow.fields[0].name"
            label="Désignation"
            dense
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            dense
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.code"
            type="text"
            label="Code"
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            dense
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.reference"
            type="text"
            label="Réference"
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.category_name"
            label="Catégorie"
            dense
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.sub_category_name"
            label="sous catégorie"
            dense
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.brand"
            label="Marque"
            dense
            readonly
          />
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            dense
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.bar_code"
            type="text"
            label="Code barre"
            readonly
          >
            <template v-slot:prepend>
              <q-icon size="15px" name="fas fa-barcode"/>
            </template>
          </q-input>
          <q-input
            v-if="selectedRow.type === 'PRODUCT'"
            dense
            filled
            class="col-6 q-pa-sm"
            v-model="selectedRow.alert_qty"
            type="number"
            label="Qté d'alerte"
            readonly
          >
            <template v-slot:prepend>
              <q-icon size="15px" name="fas fa-exclamation-triangle"/>
            </template>
          </q-input>
          <q-input
            class="col-12 q-pa-sm"
            filled
            v-model="selectedRow.fields[0].description"
            label="Description"
            type="textarea"
            dense
            readonly
          />
          <div class="col-12 q-pa-sm text-subtitle2">Description detaillée</div>
          <q-editor
            class="col-12 q-pa-md"
            v-model="selectedRow.fields[0].detailed_description"
            :toolbar="[]"
            dense
            readonly
          />

          <q-input
            class="col-12 q-pa-sm"
            filled
            dense
            readonly
            v-model="selectedRow.note"
            type="text"
            label="Note"
            autogrow
          />
          <div
            v-if="selectedRow.type === 'PRODUCT'"
            class="text-caption q-mt-sm q-mb-sm"
          >Afficher sur le site ?</div>
          <div v-if="selectedRow.type === 'PRODUCT'">
            <q-icon v-if="selectedRow.is_activated === 1" name="fas fa-eye" color="teal-13"/>
            <q-icon v-else name="fas fa-eye-slash" color="grey-6"/>
          </div>
        </div>
        <div v-if="selectedRow.type === 'PRODUCT'">
          <div class="text-subtitle1">Caracteristiques</div>
          <div v-if="selectedRow.productValues.length > 0">
            <div v-for="a in productValues" :key="a.id">
              <q-chip
                color="transparent"
                text-color="grey-10"
                class="text-bold text-caption"
                :label="a.name + ' : '"
              />
              <q-chip
                v-for="v in a.values"
                class="q-mr-xs"
                size="sm"
                :key="a.values.indexOf(v)"
                color="grey-3"
                text-color="grey-10"
                :label="a.type !== 'COLOR' ? v.name : ''"
              >
                <q-avatar
                  v-if="a.type === 'COLOR'"
                  size="20px"
                  v-bind:style="{'background' : v.name}"
                />
              </q-chip>
            </div>
          </div>
          <div v-else class="text-caption text-grey-7">Aucune caracteristique n'a été trouvé</div>
        </div>

        <div v-if="selectedRow.type === 'PRODUCT'" class="row q-mt-md">
          <div class="col-12">
            <div class="text-subtitle1 q-mb-sm">Colis</div>
            <PackageTable :pricing="pricing" :productPackages="selectedRow.productPackages" :actions="false"></PackageTable>
          </div>
        </div>
        <div v-if="selectedRow.type === 'KIT'">
          <KitContentTable :kitContent="selectedRow.kitContent"></KitContentTable>
        </div>
      </q-expansion-item>

    </q-card-section>
    <q-separator/>
    <q-card-section>
          <q-expansion-item
        expand-separator
        label="Images"
        default-opened
        expand-icon-toggle
      >
                <div v-if="selectedRow.default_image">
          <q-img
            class="rounded-borders q-mt-sm q-mb-sm"
            :src="$axios.defaults.baseURL.replace('api', 'images')+selectedRow.default_image"
          >
            <div class="absolute-bottom-right bg-transparent">
              <q-btn
                color="grey-1"
                class="text-grey-10"
                icon="fas fa-trash"
                label="Supprimer l'image"
                size="xs"
                @click="$emit('deleteImage')"
              />
            </div>
          </q-img>
        </div>
        <div v-else class="text-caption text-center">
          Aucune image
        </div>

        <div
          class="row"
          v-if="selectedRow.images !== undefined && selectedRow.images !== null && selectedRow.images !== ''"
        >
          <div
            class="col-2 q-pa-sm"
            v-for="(img, i) in selectedRow.images.split(',').filter( el => el !== '')"
            :key="i"
          >
            <q-img
              class="rounded-borders q-mt-sm q-mb-sm"
              :src="$axios.defaults.baseURL.replace('api', 'images')+img"
            >
              <div class="absolute-bottom-left bg-transparent">
                <q-btn
                  flat
                  round
                  color="grey-1"
                  class="bg-white text-grey-10"
                  size="xs"
                  @click="$emit('deleteImage', img)"
                >
                  <q-icon name="fas fa-trash" size="12px"/>
                </q-btn>
              </div>
            </q-img>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
    <q-separator/>
    <CardSEOInfo :selectedRow="selectedRow"></CardSEOInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
import CardSEOInfo from './CardSEOInfo'
import PackageTable from './PackageTable'
import KitContentTable from './KitContentTable'
export default {
  name: 'ProductCard',
  props: ['selectedRow', 'pricing'],
  components: { CardUserUpdatesInfo, CardSEOInfo, PackageTable, KitContentTable },
  computed: {
    productValues () {
      const data = []
      if (this.selectedRow !== null) {
        this.selectedRow.productValues.forEach(element => {
          const i = data.findIndex(
            el => el.attribute_id === element.attribute_id
          )
          if (i !== -1) {
            data[i].values.push(element)
          } else {
            data.push({
              attribute_id: element.attribute_id,
              name: element.attribute,
              values: [element]
            })
          }
        })
      }
      return data
    }
  }
}
</script>
