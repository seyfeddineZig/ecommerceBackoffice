<template>
  <q-dialog v-model="dialog" persistent>
    <q-card>
      <q-card-section class="row">
        <div class="col-12 text-subtitle2">Choisir une caractéristique</div>
        <div class="col-12">
          <q-select
            class="q-pa-sm"
            dense
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            v-model="model"
            :options="getAttributes"
            @input="values=null"
            label="Caractéristique"
            filled
          >
            <template v-slot:append>
              <q-btn round dense flat icon="add" @click="attributeDialog = true"/>
            </template>
          </q-select>
        </div>

        <div class="col-12">
          <q-select
            class="q-pa-sm"
            filled
            dense
            v-model="values"
            multiple
            :options="getAttributeValues"
            use-chips
            label="Valeurs"
          >
            <template v-slot:selected-item="selected">
              <q-avatar
                class="q-mt-xs q-ml-xs"
                v-if="values && model.type === 'COLOR'"
                v-bind:style="{'background': selected.opt.name}"
              />
              <q-badge
                class="bg-grey-4 text-grey-10 q-mt-xs q-ml-xs"
                v-else
              >{{ selected.opt.label }}</q-badge>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section v-if="model.type === 'COLOR'" avatar>
                  <q-avatar size="20px" v-bind:style="{'background': scope.opt.name}"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          dense
          label="Annuler"
          color="grey-10 q-pa-sm"
          size="sm"
          @click="$emit('closeDialog')"
        />
        <q-btn dense label="Ajouter" color="blue-10 q-pa-sm" size="sm" @click="addAttribute()"/>
      </q-card-actions>
    </q-card>
    <AttributeComponent
      v-if="hasRole('POST_ATTRIBUTE')"
      :dialog="attributeDialog"
      :oldAttributeValues="null"
      v-on:closeDialog="attributeDialog=false"
      v-on:updateTableRows="updateAttributeSelectOptions"
      :recordToEdit="null"
    ></AttributeComponent>
  </q-dialog>
</template>

<script>
import AttributeComponent from 'components/AttributeComponent'
export default {
  name: 'ProductAddAttribute',
  props: ['dialog', 'attributes', 'attributeValues', 'selectedValues'],
  data () {
    return {
      displayInputs: false,
      attributeDialog: false,
      model: null,
      values: null
    }
  },
  components: {
    AttributeComponent
  },
  computed: {
    getAttributes () {
      return this.attributes
        .filter(
          el =>
            this.selectedValues.findIndex(e => el.id === e.attribute_id) === -1
        )
        .map(obj => ({
          ...obj,
          label: obj.name
        }))
    },
    getAttributeValues () {
      if (this.model === null) return []
      const selectedLang = this.$store.getters['config/getSelectedLang']
      if (selectedLang) {
        return this.attributeValues
          .filter(
            el =>
              el.attribute_id === this.model.id &&
              el.lang_id === selectedLang.id
          )
          .map(obj => ({
            ...obj,
            label: obj.name
          }))
      } else {
        return []
      }
    }
  },
  methods: {
    addAttribute () {
      this.values.forEach(el => {
        this.selectedValues.push(el)
      })
      this.model = null
      this.values = null
      this.displayInputs = false
      this.$emit('closeDialog')
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },
    updateAttributeSelectOptions ({ data, attributeValues, deletedValues }) {
      this.$emit('updateAttributeSelectOptions', {
        data: data,
        attributeValues: attributeValues,
        deletedValues: deletedValues
      })
      this.attributeDialog = false
    }
  }
}
</script>
