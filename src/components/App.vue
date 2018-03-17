<style lang="scss" scoped>

</style>


<template>
  <h1>{{ title }}</h1>
</template>

<script>
export default {
  data() {
    return {
      title: ''
    };
  },
  methods: {
    showTitle() {
      this.title = 'Hello World';
    }
  },
  mounted() {
    this.showTitle();
  }
}
</script>