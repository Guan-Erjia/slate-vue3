<template>
  <div v-bind="attrs" style="margin: 30px -20px 0;">
    <div style="font-size: 14px; padding: 5px 20px; color: #404040; border-top: 2px solid #eeeeee; background: #f8f8f8">
      Slate's value as text
    </div>
    <div style="color: #404040; font: 12px monospace; white-space: pre-wrap; padding: 10px 20px;"
      class="editor-value-div">
      {{ textLines }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, useAttrs } from 'vue';

const attrs = useAttrs()
const props = defineProps<{
  value: any
}>()

const textLines = computed(() => props.value.document.nodes
  .map((node: { text: any; }) => node.text)
  .toArray()
  .join('\n')) 
</script>
<style scoped>
.editor-value-div {
  margin: 0 0 0.5em;
}
</style>


<!-- 
export const EditorValue = React.forwardRef(
  (
    {
      className,
      value,
      ...props
    }: PropsWithChildren<
      {
        value: any
      } & BaseProps
    >,
    ref: Ref<OrNull<null>>
  ) => {
    const textLines = value.document.nodes
      .map(node => node.text)
      .toArray()
      .join('\n')
    return (
      <div
        ref={ref}
        {...props}
        className={cx(
          className,
          css`
            margin: 30px -20px 0;
          `
        )}
      >
        <div
          className={css`
            font-size: 14px;
            padding: 5px 20px;
            color: #404040;
            border-top: 2px solid #eeeeee;
            background: #f8f8f8;
          `}
        >
          Slate's value as text
        </div>
        <div
          className={css`
            color: #404040;
            font: 12px monospace;
            white-space: pre-wrap;
            padding: 10px 20px;
            div {
              margin: 0 0 0.5em;
            }
          `}
        >
          {textLines}
        </div>
      </div>
    )
  }
) -->