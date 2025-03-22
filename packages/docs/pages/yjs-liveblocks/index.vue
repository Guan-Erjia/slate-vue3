<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import YjsEditor from "./YjsEditor.vue";
import { createClient } from "@liveblocks/client";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { XmlText } from "yjs";
import { useRoute, useRouter } from "vue-router";

const route = useRoute()
const router = useRouter()

const publicApiKey = ref(route.params.publicApiKey as string || '')
const roomInfo = ref()
const yProvider = ref();
const sharedType = ref()
const connected = ref(false)

const connectchange = (e: boolean) => connected.value = e
const startConnect = () => {
  try {
    const info = createClient({
      publicApiKey: publicApiKey.value,
    }).enterRoom('my-room')
    const provider = getYjsProviderForRoom(info.room)
    provider.on('sync', connectchange)

    roomInfo.value = info
    yProvider.value = provider
    sharedType.value = provider.getYDoc().get("slate", XmlText)
  } catch (error) {
    alert(error)
    router.push({
      name: 'yjs-liveblocks',
      params: {
        publicApiKey: ''
      },
    })
  }
}

const deposeConnect = () => {
  roomInfo.value?.leave()
  yProvider.value.off('sync', connectchange)
  roomInfo.value = undefined
  yProvider.value = undefined
  sharedType.value = undefined
  connected.value = false
  publicApiKey.value = ''
}

onMounted(() => {
  if (publicApiKey.value) {
    startConnect()
  }
})
onUnmounted(() => {
  deposeConnect()
})
const onKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    router.push({
      name: 'yjs-liveblocks',
      params: {
        publicApiKey: publicApiKey.value
      },
    })
    startConnect()
  }
}
</script>

<template>
  <div style="font-size: 20px;color: red;margin-bottom: 12px;">This is not avaliable</div>
  <a href="https://liveblocks.io/dashboard" style="margin-bottom: 12px; display: block;" target="_blank">
    👉 Click it and get a publicApiKey from liveblocks</a>
  <div style="display: flex;width: 100%;">
    <input v-model="publicApiKey" @keyup="onKeyup"
      placeholder="paste your liveblocks publicApiKey, and press Enter to connect"
      style="width: 100%;margin-bottom: 10px;">
  </div>
  <YjsEditor v-if="sharedType && connected" :sharedType="sharedType" />
  <div v-if="sharedType && !connected" style="height: 300px;">
    Loading...
  </div>
</template>
