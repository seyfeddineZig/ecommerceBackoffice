<template>
  <q-expansion-item
    expand-separator
    label="Informations multilingues"
    default-opened
    header-class="bg-grey-1"
  >
    <div class="col-12">
      <div class="row">
        <div v-for="l in langs" :key="l.id" :name="l.short_name" class="col-6">
          <q-card class="q-pa-xs no-shadow">
            <q-card-section>
              <div>
                <div class="text-caption q-pb-sm" :dir="l.dir">{{ l.full_name }}</div>

                <q-input
                  :dir="l.dir"
                  filled
                  dense
                  v-model="fields[l.id].name"
                  type="text"
                  :label="shipping !== undefined ? 'Region *' : 'Désignation *'"
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
                <q-input
                  v-if="fields[l.id].description !== undefined"
                  :dir="l.dir"
                  filled
                  dense
                  v-model="fields[l.id].description"
                  type="textarea"
                  label="Description"
                />
                <div v-if="fields[l.id].detailed_description !== undefined" class="q-mt-md">
                  <div class="text-body2">Description détaillée</div>
                  <q-editor
                    v-model="fields[l.id].detailed_description"
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
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-expansion-item>
</template>
<script>
export default {
  props: ['fields', 'langs', 'shipping']
}
</script>
