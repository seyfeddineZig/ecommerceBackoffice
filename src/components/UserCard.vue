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

        <div class="row q-pa-sm">
          <div class="col-12">
            <div class="row">
              <div class="col-12 q-pa-sm">
                <q-input
                  filled
                  v-model="recordToEdit.last_name"
                  label="Nom"
                  dense
                  readonly
                />
              </div>
              <div class="col-12 q-pa-sm">
                <q-input
                  filled
                  v-model="recordToEdit.first_name"
                  label="Prénom"
                  dense
                  readonly
                />
              </div>
              <div class="col-12 q-pa-sm">
                <q-input
                  filled
                  v-model="recordToEdit.email"
                  label="Email"
                  type="email"
                  hint="Nom d'utilisateur"
                  dense
                  readonly
                />
              </div>
              <div class="col-12 q-pa-sm">
                <q-input
                  filled
                  v-model="groupName"
                  label="Groupe"
                  type="text"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script>

export default {
  name: 'UserGroupCard',
  props: ['recordToEdit', 'groupName'],
  data () {
    return {}
  }
}
</script>
