<style lang="scss" scoped>
@import '../scss/global';
.controller {
  display: flex;
  flex-direction: column;
}
.btn-group {
  display: flex;
  margin-bottom: 10px;
}
.btn {
  flex: 1;
  margin: 0 5px;
  &:not(:disabled):hover {
    cursor: pointer;
  }
}
.info {
  margin: 0 5px;
  border-bottom: 1px solid $Concrete;
}
</style>

<template>  
  <div class="controller">
    <div class="btn-group">
      <button class="btn" id="chooser">SET TARGET STORAGE</button>
      <button class="btn" :disabled="!storage.token" @click="unset">UNSET</button>
      <button class="btn" :disabled="!storage.token" @click="save">PERSIST CONTENT</button>
    </div>
    <div class="info-group">
      <div class="info">folder name: {{ storage.folderName }}</div>
      <div class="info">folder id: {{ storage.folderId }}</div>
      <div class="info">file name: {{ storage.fileName }}</div>
      <div class="info">file id: {{ storage.fileId }}</div>
      <div class="info">account: {{ storage.account }}</div>
      <div class="info">token: {{ storage.token }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      explorer: {}
    };
  },
  props: {
    unset: {
      type: Function,
      required: true
    },
    storage: {
      type: Object,
      required: true
    },
    save: {
      type: Function,
      required: true
    },
  },
  mounted() {
    this.explorer = window.Kloudless.explorer({
      app_id: 'X9oaWHtuldy9Joik3mmv3gnGafF6fsQQAyTwVKo1R11CKl2B',
      types: ['folders'],
      services: ['gdrive'],
      display_backdrop: true,
      retrieve_token: true
    });
    this.explorer.on('success', files => {
      this.$emit('storageSet', files[0]);
    });
    this.explorer.choosify(document.getElementById('chooser'));
  }
}
</script>