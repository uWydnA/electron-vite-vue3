<script setup lang="ts">
import { onMounted } from "vue";
import { db } from "../../../db/database";
import ChatBoard from "./Chat/ChatBoard.vue";
import MessageBoard from "./Chat/MessageBoard.vue";
onMounted(() => {
  console.log(db, "db");
});
onMounted;
</script>
<template>
  <ChatBoard></ChatBoard>
  <MessageBoard></MessageBoard>
</template>
<style scoped lang="scss"></style>
