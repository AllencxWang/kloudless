<style lang="scss" scoped>
@import '../scss/global';
* {
  box-sizing: border-box;
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.container {
  display: flex;
  height: 100vh;
}
.my-panel {
  flex: 1;
}
.my-panel-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.my-editor {
  flex: 1;
}
</style>

<template>
  <div class="container">
    <Panel class="my-panel" header="EDIT">
      <template slot="body">
        <div class="my-panel-body">
          <Controller class="my-controller" :unset="unset" :save="save" :storage="storage" @storageSet="onStorageSet" />
          <Editor class="my-editor" :disabled="!storage.token" :input="input" :update="update" />
        </div>
      </template>
    </Panel>
    <Panel class="my-panel" header="PREVIEW">
      <template slot="body">
        <div class="preview" v-html="compiledMarkdown"></div>
      </template>
    </Panel>
    
  </div>
</template>

<script>
import marked from 'marked';
import debounce from 'lodash.debounce';
import axios from 'axios';
import Panel from './Panel.vue';
import Controller from './Controller.vue';
import Editor from './Editor.vue';

export default {
  components: {
    Panel,
    Controller,
    Editor
  },
  computed: {
    compiledMarkdown() {
      return marked(this.input, { sanitize: true });
    },
  },
  data() {
    return {
      input: '',
      storage: {},
      explorer: {}
    };
  },
  methods: {
    update: debounce(function(e) {
      this.input = e.target.value;
    }, 300),
    unset() {
      this.storage = {};
    },
    save() {
      const storage = this.storage;
      axios({
        method: 'POST',
        url: `https://api.kloudless.com/v1/accounts/${storage.account}/storage/files/?overwrite=True`,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${storage.token}`,
          'X-Kloudless-Metadata': JSON.stringify({name: 'Kloudless-JS-Assessment', parent_id: storage.id}),
        },
        data: this.input
      }).then(data => {
        localStorage.setItem('storage', JSON.stringify(storage));
        console.log('PASS', data);
      }).catch(err => {
        console.log('FAIL', err);
      });
    },
    onStorageSet(storage) {
      this.storage = {
        name: storage.name,
        id: storage.id,
        account: storage.account,
        token: storage.bearer_token ? storage.bearer_token.key : ''
      };
    }
  },
  mounted() {
    // const storage = JSON.parse(localStorage.getItem('storage'));
    // if (storage) {
    //   console.log('get storeage', storage);
    //   axios({
    //     method: 'GET',
    //     url: `https://api.kloudless.com/v1/accounts/${storage.account}/storage/files/${storage.id}/contents`,
    //     headers: {
    //       'Authorization': `Bearer ${storage.token}`,
    //     },
    //   }).then(data => {
    //     this.storage = storage;
    //   }).catch(err => {
    //     console.log('not loadded', err);
    //   });
    // }
  }
}
</script>