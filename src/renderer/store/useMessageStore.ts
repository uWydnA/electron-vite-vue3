import { defineStore } from "pinia";
import { ref } from "vue";
import { ModelChat } from "./../../model/ModelChat";
import { ModelMessage } from "./../../model/ModelMessage";

export const useMessageStore = defineStore("message", () => {
  let data = ref<ModelMessage[]>([]);
  let msg1 = `接下来我们就从“如何为工程引入 Pinia，如何创建 Store，如何创建数据模型，如何使用 Store，如何订阅 Store，如何完成 Store 间的互访”等几个方面讲解如何使用 Pinia 管控应用的数据状态。`;
  let msg2 = `我们使用defineStore(name,function)的形式创建 Store，这种形式的 Store 叫作Setup Stores。Pinia 还提供了另一种形式的 Store ：Option Stores，具体可以参阅 Pinia 的官方文档。你如果也像我一样倾向于使用 Vue 组件的 Setup API（这也是 Vue 作者推荐的方式），那么使用 Pinia 的Setup Stores会更方便，编码风格也一致。`;
  let initData = (chat: ModelChat) => {
    let result = [];
    for (let i = 0; i < 10; i++) {
      let model = new ModelMessage();
      model.createTime = Date.now();
      model.isInMsg = i % 2 === 0;
      model.messageContent = model.isInMsg ? msg1 : msg2;
      model.fromName = model.isInMsg ? chat.fromName : "我";
      model.avatar = chat.avatar;
      model.chatId = chat.id;
      result.push(model);
    }
    data.value = result;
  };
  return { data, initData };
});
