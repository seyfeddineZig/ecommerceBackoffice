<template>
  <div class="col-12">
      <div v-for="(a,i) in selectedAttributes" :key="i">
          <q-chip color="transparent" text-color="grey-10" class="text-bold text-caption" :label="a.name + ' : '" />
          <q-chip v-for="v in a.values" class="q-mr-xs" size="sm" :key="a.values.indexOf(v)" color="grey-3" text-color="grey-10" :label="a.type !== 'COLOR' ? v.name : ''">
              <q-avatar v-if="a.type === 'COLOR'" size="20px" v-bind:style="{'background' : v.name}" />
              <q-btn flat round size="xs" icon="fas fa-times" @click="deleteValue(v.id)" />
          </q-chip>
      </div>
  </div>
</template>
<script>
export default {
  props: ['selectedValues', 'attributes'],
  data () {
    return {
    }
  },
  computed: {
    selectedAttributes () {
      const array = []
      this.selectedValues.forEach(el => {
        const i = array.findIndex(e => e.id === el.attribute_id)
        if (i === -1) {
          const attribute = this.attributes.find(e => e.id === el.attribute_id)
          array.push({
            ...attribute,
            values: [el]
          })
        } else {
          array[i].values.push(el)
        }
      })
      return array
    }
  },
  methods: {
    deleteValue (valueId) {
      const index = this.selectedValues.findIndex(el => valueId === el.id)
      this.selectedValues.splice(index, 1)
    }
  }
}
</script>
