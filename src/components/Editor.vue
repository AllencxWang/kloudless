<style lang="scss" scoped>
@import '../scss/global';
.editor {
  padding: 10px;
}
textarea {
  width: 100%;
  height: 100%;
  resize: none;
  &:disabled {
    background-color: #eee; 
  }
}
</style>

<template>  
  <div class="editor">
    <textarea :disabled="disabled" :value="input" @input="update"></textarea>
  </div>
</template>

<script>
export default {
  props: {
    input: {
      type: String,
      required: true
    },
    update: {
      type: Function,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
  },
}
</script>