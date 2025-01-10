import { defineComponent, renderSlot } from "vue";


export const Slate = defineComponent({
  name: 'slate-editor',
  props: {
    initialValue: {
      type: Array,
      default: () => [{ type: "paragraph", children: [{ text: "" }] }]
    },
  },
  setup(props: {
  }, { slots, }) {

    return () => renderSlot(slots, 'default')
  },
})




