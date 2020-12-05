<template>
  <div class="q-gutter-sm">
    <div class="row q-mb-md">
      <div class="col-11 text-subtitle2 text-weight-bold">
        {{ ( row && row !== null ? 'Modifier ' : 'Nouveau ' ) +
        ( mod === 'paymentMode' ? 'mode de paiement' : mod === 'paymentDeadline' ? 'délai de paiement' : 'solde max') }}
      </div>
      <div class="col-1">
        <q-btn
          flat
          round
          class="bg-grey-2 float-right"
          color="grey-10"
          size="xs"
          icon="eva-close-outline"
          @click="$emit('closeDialog')"
        />
      </div>
    </div>

    <q-form ref="form" @submit="onSubmit" class="q-gutter-md q-mt-md">
      <q-input
        dense
        filled
        v-model="val"
        :type="mod === 'paymentMode' ? 'text' : 'number'"
        label
        :rules="[val => !!val || 'Ce champ est obligatoire']"
      />
      <q-btn size="sm" color="blue-10" label="Enregistrer" type="submit"/>
    </q-form>
  </div>
</template>

<script>
export default {
  name: 'CustomerContractItemComponent',
  props: ['mod', 'row'],
  data () {
    return {
      val: ''
    }
  },
  mounted () {
    if (this.isRow()) {
      if (this.mod === 'paymentMode') this.val = this.row.name
      if (this.mod === 'paymentDeadline') this.val = this.row.days
      if (this.mod === 'maxDebt') this.val = this.row.amount
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate().then(success => {
        if (success) {
          const data = {
            field: this.val
          }
          if (this.isRow()) {
            data._method = 'put'
          }
          this.$axios
            .post(
              '/' + this.mod + (this.isRow() ? '/' + this.row.id : ''),
              data
            )
            .then(res => {
              this.val = ''
              this.$emit('addRow', {
                mod: this.mod,
                ...res.data
              })
            })
        }
      })
    },
    isRow () {
      return this.row && this.row !== null
    }
  }
}
</script>
