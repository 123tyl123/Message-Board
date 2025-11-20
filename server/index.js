const express = require('express');
const cors = require('cors');
// 1. 引入 mysql2 的 promise 版本，这样可以用 await
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// 2. 创建数据库连接池 (配置成你自己的 MySQL 密码)
// 连接池的意思是：准备好一堆连接等着复用，比每次请求都重新连接要快得多。
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',           // 你的 MySQL 用户名
    password: '123456',   // ⚠️改成你的 MySQL 密码！！
    database: 'message_board' // 刚才创建的数据库名
});

// API 1: 获取所有留言 (GET)
app.get('/api/messages', async (req, res) => {
    try {
        // SQL: 查所有，按 id 倒序排列 (最新的在最上面)
        const sql = 'SELECT * FROM messages ORDER BY id DESC';

        // 执行 SQL，返回结果是一个数组，第一项是行数据(rows)
        const [rows] = await db.query(sql);

        res.json({
            code: 0,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: -1, msg: "数据库读取失败" });
    }
});

// API 2: 提交新留言 (POST)
app.post('/api/messages', async (req, res) => {
    const { content } = req.body; // 从前端拿数据
    const time = new Date().toLocaleString();

    try {
        // SQL: 插入数据
        // ⚠️ 注意：这里使用了 '?' 占位符，这是防止 SQL 注入攻击的关键！
        const sql = 'INSERT INTO messages (content, time) VALUES (?, ?)';

        // execute 的第二个参数是一个数组，对应上面的两个 ?
        const [result] = await db.execute(sql, [content, time]);

        // result.insertId 就是数据库刚才自动生成的 id
        res.json({
            code: 0,
            msg: "发送成功",
            data: {
                id: result.insertId, // 返回生成的 ID 给前端
                content,
                time
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: -1, msg: "数据库写入失败" });
    }
});

// API 3: 删除留言 (DELETE)
app.delete('/api/messages/:id', async (req, res) => {
    const msgId = parseInt(req.params.id);

    try {
        // SQL: 根据 ID 删除
        const sql = 'DELETE FROM messages WHERE id = ?';

        await db.execute(sql, [msgId]);

        res.json({
            code: 0,
            msg: "删除成功"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: -1, msg: "数据库删除失败" });
    }
});

app.listen(3000, () => {
    console.log('MySQL版服务器已启动: http://localhost:3000');
});