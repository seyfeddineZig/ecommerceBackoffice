<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <q-expansion-item expand-separator default-opened expand-icon-toggle label="Détail">
        <div class="row">
          <div class="col text-right q-mt-xs q-mb-xs">
            <q-btn v-if="recordToEdit.id !== 1" flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
              <q-icon name="fas fa-trash" color="grey-9"/>
            </q-btn>
            <q-btn
              flat
              round
              class="q-ml-xs bg-grey-2 q-pa-xs"
              color="grey-6"
              size="xs"
              @click="$emit('editRecord')"
            >
              <q-icon name="fas fa-pen" color="grey-9"/>
            </q-btn>
          </div>
        </div>

        <q-input
          filled
          class="q-mt-sm q-mb-sm"
          v-model="recordToEdit.name"
          label="Désignation"
          dense
          readonly
        />
        <q-input
          filled
          class="q-mt-sm q-mb-sm"
          v-model="recordToEdit.description"
          label="Description"
          type="textarea"
          dense
          readonly
        />
        <RolesCard :roles="roles" :disable="true"></RolesCard>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script>
import RolesCard from './Roles'

export default {
  name: 'UserGroupCard',
  props: ['recordToEdit', 'roles'],
  data () {
    return {}
  },
  components: { RolesCard }
}
</script>
