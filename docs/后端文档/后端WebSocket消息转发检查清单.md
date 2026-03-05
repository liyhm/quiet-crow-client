# 后端 WebSocket 消息转发检查清单

## 问题现象
双方发送消息，对方都收不到。

## 需要检查的后端代码

### 1. WebSocket 消息处理器

后端需要有一个 `@MessageMapping` 来接收消息：

```java
@Controller
public class ChatController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private MessageService messageService;
    
    /**
     * 接收客户端发送的消息
     * 前端发送到: /app/chat/{sessionId}
     */
    @MessageMapping("/chat/{sessionId}")
    public void handleChatMessage(
        @DestinationVariable String sessionId,
        @Payload ChatMessageRequest request,
        Principal principal
    ) {
        String senderId = principal.getName(); // 当前用户ID
        
        System.out.println("📨 收到消息:");
        System.out.println("  会话ID: " + sessionId);
        System.out.println("  发送者: " + senderId);
        System.out.println("  内容: " + request.getContent().substring(0, 20) + "...");
        
        // 1. 保存消息到数据库
        Message message = messageService.saveMessage(
            sessionId,
            senderId,
            request.getContent(),
            request.getMessageType()
        );
        
        System.out.println("✅ 消息已保存，ID: " + message.getId());
        
        // 2. 查询会话的所有成员
        List<String> members = sessionService.getSessionMembers(sessionId);
        System.out.println("📋 会话成员: " + members);
        
        // 3. 转发给其他在线成员
        for (String memberId : members) {
            if (!memberId.equals(senderId)) {
                System.out.println("📤 转发消息给用户: " + memberId);
                
                ChatMessageResponse response = new ChatMessageResponse();
                response.setId(message.getId());
                response.setSessionId(sessionId);
                response.setSendUser(senderId);
                response.setContent(request.getContent());
                response.setSendTime(message.getSendTime());
                response.setMessageType(request.getMessageType());
                
                // 发送给特定用户
                messagingTemplate.convertAndSendToUser(
                    memberId,
                    "/queue/messages",  // 前端订阅 /user/queue/messages
                    response
                );
                
                System.out.println("✅ 消息已转发给: " + memberId);
            }
        }
        
        System.out.println("✅ 消息处理完成");
    }
}
```

### 2. 请求和响应对象

```java
// 请求对象
public class ChatMessageRequest {
    private String sessionId;
    private String content;        // 加密的消息内容
    private String messageType;    // "1" 表示文本
    private Boolean encrypted;     // true
    
    // getters and setters
}

// 响应对象
public class ChatMessageResponse {
    private String id;            // 消息ID
    private String sessionId;     // 会话ID
    private String sendUser;      // 发送者ID
    private String content;       // 加密的消息内容
    private String sendTime;      // 发送时间
    private String messageType;   // 消息类型
    
    // getters and setters
}
```

### 3. SessionService 需要实现

```java
@Service
public class SessionService {
    
    @Autowired
    private SessionUserRepository sessionUserRepository;
    
    /**
     * 获取会话的所有成员ID
     */
    public List<String> getSessionMembers(String sessionId) {
        List<SessionUser> sessionUsers = sessionUserRepository
            .findBySessionId(sessionId);
        
        return sessionUsers.stream()
            .map(SessionUser::getUserId)
            .collect(Collectors.toList());
    }
}
```

### 4. MessageService 需要实现

```java
@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    /**
     * 保存消息到数据库
     */
    public Message saveMessage(
        String sessionId,
        String senderId,
        String content,
        String messageType
    ) {
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setSessionId(sessionId);
        message.setSendUser(senderId);
        message.setMessageContent(content);
        message.setMessageType(messageType);
        message.setSendTime(LocalDateTime.now());
        message.setIsRead(false);
        
        return messageRepository.save(message);
    }
}
```

## 检查步骤

### 步骤 1：检查后端是否收到消息

1. 启动后端，查看控制台
2. 在前端发送消息
3. 后端应该打印：
   ```
   📨 收到消息:
     会话ID: xxx
     发送者: xxx
     内容: xxx...
   ```

**如果没有打印**：
- 检查 `@MessageMapping("/chat/{sessionId}")` 是否存在
- 检查前端发送的路径是否正确：`/app/chat/${sessionId}`
- 检查 WebSocket 配置是否正确

### 步骤 2：检查消息是否保存

后端应该打印：
```
✅ 消息已保存，ID: xxx
```

**如果没有保存**：
- 检查 `MessageService.saveMessage()` 方法
- 检查数据库连接
- 查看是否有异常抛出

### 步骤 3：检查会话成员查询

后端应该打印：
```
📋 会话成员: [user1-id, user2-id]
```

**如果成员列表为空**：
- 检查 `session_user` 表是否有数据
- 检查 `SessionService.getSessionMembers()` 方法
- 确认会话ID正确

### 步骤 4：检查消息转发

后端应该打印：
```
📤 转发消息给用户: user2-id
✅ 消息已转发给: user2-id
```

**如果没有转发**：
- 检查 `messagingTemplate.convertAndSendToUser()` 调用
- 确认路径是 `/queue/messages`（不包含 `/user` 前缀）
- 检查接收者ID是否正确

## 常见问题

### Q1: 后端收不到消息

**原因**：`@MessageMapping` 路径不匹配

**解决**：
- 前端发送到：`/app/chat/${sessionId}`
- 后端映射：`@MessageMapping("/chat/{sessionId}")`
- 确保路径一致

### Q2: 消息保存失败

**原因**：数据库字段不匹配或约束问题

**解决**：
- 检查 `message` 表结构
- 确保所有必需字段都有值
- 查看数据库错误日志

### Q3: 查询不到会话成员

**原因**：`session_user` 表数据问题

**解决**：
```sql
-- 检查会话成员
SELECT * FROM session_user WHERE session_id = 'xxx';

-- 应该返回两条记录（私聊）
```

### Q4: 消息转发失败

**原因**：用户ID不正确或路径错误

**解决**：
- 确认用户ID是字符串类型
- 路径必须是 `/queue/messages`
- 检查 WebSocket 配置中的用户目的地前缀

## WebSocket 配置检查

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 启用简单消息代理
        config.enableSimpleBroker("/topic", "/queue");
        
        // 设置应用目的地前缀
        config.setApplicationDestinationPrefixes("/app");
        
        // 设置用户目的地前缀（重要！）
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

## 完整的消息流程

1. **前端发送**：
   ```javascript
   websocketService.sendMessage(sessionId, {
     sessionId: sessionId,
     content: "加密内容",
     messageType: "1",
     encrypted: true
   })
   ```
   发送到：`/app/chat/${sessionId}`

2. **后端接收**：
   ```java
   @MessageMapping("/chat/{sessionId}")
   public void handleChatMessage(...)
   ```

3. **后端保存**：
   ```java
   Message message = messageService.saveMessage(...)
   ```

4. **后端转发**：
   ```java
   messagingTemplate.convertAndSendToUser(
     memberId,
     "/queue/messages",
     response
   )
   ```
   实际发送到：`/user/${memberId}/queue/messages`

5. **前端接收**：
   ```javascript
   client.subscribe("/user/queue/messages", (message) => {
     // 处理消息
   })
   ```

## 测试方法

### 方法 1：使用两个浏览器标签

1. 标签1：登录用户A
2. 标签2：登录用户B
3. 用户A发送消息
4. 查看用户B是否收到

### 方法 2：使用 Electron 应用 + 浏览器

1. Electron：登录用户A
2. 浏览器：登录用户B
3. 互相发送消息
4. 查看双方是否都能收到

### 方法 3：查看后端日志

发送消息后，后端应该打印完整的处理流程：
```
📨 收到消息: ...
✅ 消息已保存，ID: ...
📋 会话成员: [...]
📤 转发消息给用户: ...
✅ 消息已转发给: ...
✅ 消息处理完成
```

## 前端调试

打开浏览器开发者工具（F12），发送消息后应该看到：

**发送方**：
```
📤 发送消息到 WebSocket: ...
✅ 消息已发送
```

**接收方**：
```
📬 收到私有消息: {...}
📨 收到 WebSocket 消息: {...}
📩 处理接收到的消息: {...}
🔓 消息解密成功: 你好
✅ 消息已添加到 store
✅ 消息已处理，会话列表已更新
```

## 如果还是不行

1. **检查防火墙**：确保 WebSocket 端口（8080）没有被阻止
2. **检查代理**：如果使用代理，可能会阻止 WebSocket
3. **检查 CORS**：确保后端允许跨域
4. **重启服务**：重启后端和前端应用
5. **清除缓存**：清除浏览器缓存和应用缓存

---

**更新时间**: 2024-02-27  
**版本**: 1.0
