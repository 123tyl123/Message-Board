<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 定义响应式数据
const messageList = ref([]);
const inputContent = ref("");

// 后端地址
const API_URL = "http://localhost:3000/api/messages";

// 1. 获取留言列表的函数
const fetchMessages = async () => {
  try {
    const res = await axios.get(API_URL);
    // 对应后端返回的结构: { code: 0, data: [...] }
    messageList.value = res.data.data; 
  } catch (error) {
    console.error("获取失败", error);
  }
};

// 2. 提交留言的函数
const submitMessage = async () => {
  if (!inputContent.value.trim()) return alert("写点东西再发吧！");

  try {
    // 发送 POST 请求
    await axios.post(API_URL, {
      content: inputContent.value
    });
    
    // 发送成功后：清空输入框，并重新拉取最新列表
    inputContent.value = "";
    await fetchMessages(); 
    
  } catch (error) {
    console.error("发送失败", error);
  }
};
const deleteMessage = async (id) => { 
  try {
    await axios.delete(`${API_URL}/${id}`);
    // 删除成功后，重新拉取留言列表
    await fetchMessages();
  } catch (error) {
    console.error("删除失败", error);
  }
   console.log("前端准备删除 ID:", id);
};
// 组件挂载时，自动拉取一次数据
onMounted(() => {
  fetchMessages();
});
</script>

<template>
  <div class="container">
    <h1>📝 极简全栈留言板</h1>

    <!-- 输入区域 -->
    <div class="input-box">
      <input 
        v-model="inputContent" 
        type="text" 
        placeholder="说点什么..." 
        @keyup.enter="submitMessage"
      />
      <button @click="submitMessage">发送</button>
    
    </div>

    <!-- 列表区域 -->
    <div class="list">
      <div v-for="item in messageList" :key="item.id" class="card">
        <p class="content">{{ item.content }}</p>
        <span class="time">{{ item.time }}</span>
        <button @click="deleteMessage(item.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 简单写点样式，让它好看一点 */
.container { width: 400px; margin: 50px auto; font-family: sans-serif; }
h1 { text-align: center; color: #42b883; }

.input-box { display: flex; gap: 10px; margin-bottom: 20px; }
input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
button { padding: 8px 16px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;}
button:hover { background: #33a06f; }

.card { background: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #42b883; }
.content { margin: 0 0 5px 0; font-size: 16px; }
.time { font-size: 12px; color: #999; }
.list button {  padding: 4px 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; float: right; }
.list button:hover { background: #c0392b; }

</style>