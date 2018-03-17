<style lang="scss" scoped>
@import '../scss/global';
$PanelBodyHeight: calc(1em + 10px);
.panel {
  @include box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid $Concrete;
  &-header {
    margin: 0 10px;
    padding: 5px 0;
    border-bottom: 2px dashed $Midnightblue;
    height: $PanelBodyHeight;
    line-height: $PanelBodyHeight;
    text-align: center;
  }
  &-body {
    padding: 10px;
    height: calc(100% - #{$PanelBodyHeight});
  }
}
</style>

<template>  
  <div class="panel">
    <h3 class="panel-header">{{ this.header }}</h3>
    <div class="panel-body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      required: true
    },
  },
}
</script>