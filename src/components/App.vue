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
  width: 50%;
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
          <Controller class="my-controller" :unset="unset" :save="save" :storage="storage" @storageSet="onStorageSet" v-show="!process" />
          <Editor class="my-editor" :disabled="!storage.token" :input="input" :update="update" v-show="!process" />
          <h1 v-show="process">{{ process }}</h1>
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
      explorer: {},
      process: false,
    };
  },
  methods: {
    update: debounce(function(e) {
      this.input = e.target.value;
    }, 300),
    unset() {
      this.storage = {};
      localStorage.removeItem('storage');
    },
    save() {
      const storage = this.storage;
      this.process = 'saving ...';
      axios({
        method: 'POST',
        url: `https://api.kloudless.com/v1/accounts/${storage.account}/storage/files/?overwrite=True`,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${storage.token}`,
          'X-Kloudless-Metadata': JSON.stringify({name: 'Kloudless-JS-Assessment.md', parent_id: storage.folderId}),
        },
        data: this.input
      }).then(res => {
        const data = res.data;
        this.storage = {
          ...storage,
          fileId: data.id,
          fileName: data.name
        };
        localStorage.setItem('storage', JSON.stringify(this.storage));
        this.process = '';
        // alert('saved');
      }).catch(err => {
        this.process = '';
        alert(`fail to save: ${JSON.stringify(err)}`);
      });
    },
    onStorageSet(storage) {
      this.storage = {
        folderName: storage.name,
        folderId: storage.id,
        account: storage.account,
        token: storage.bearer_token ? storage.bearer_token.key : ''
      };
    }
  },
  mounted() {
    const storage = JSON.parse(localStorage.getItem('storage'));
    if (storage && storage.fileId) {
      this.storage = storage;
      this.process = 'retrieving ...';
      const options = {
        method: 'GET',
        url: `https://api.kloudless.com/v1/accounts/${storage.account}/storage/files/${storage.fileId}/contents`,
        headers: {
          'Authorization': `Bearer ${storage.token}`,
        },
      };
      console.log('options', options);
      axios(options).then(res => {
        this.input = res.data;
        this.process = '';
        // alert('retrieved');
      }).catch(err => {
        this.process = '';
        alert(`fail to retrieve: ${JSON.stringify(err)}`);
      });
    }
  }
}
</script>