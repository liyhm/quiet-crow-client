# 快速诊断 - WebSocket 连接失败

## 当前问题
发送消息时显示：`⚠️ WebSocket 未连接，消息加入队列`

## 诊断步骤

### 步骤 1：检查后端是否启动

打开浏览器，访问：
```
http://localhost:8080/ws/info
```

**期望结果**：
```json
{
  "entropy": 123456789,
  "origins": ["*:*"],
  "cookie_needed": true,
  "websocket": true
}
```

**如果返回 404 或无法访问**：
- ❌ 后端 WebSocket 服务没有启动或配置错误
- 需要检查后端代码

### 步骤 2：检查后端 WebSocket 配置

后端需要有以下配置：

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
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

**检查要点**：
- ✅ 端点路径是 `/ws`
- ✅ 启用了 SockJS：`.withSockJS()`
- ✅ 允许跨域：`.setAllowedOriginPatterns("*")`

### 步骤 3：检查后端依赖

确保 `pom.xml` 包含：

```xml
<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- SockJS -->
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>sockjs-client</artifactId>
    <version>1.5.1</version>
</dependency>

<!-- STOMP -->
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>stomp-websocket</artifactId>
    <version>2.3.4</version>
</dependency>
```

### 步骤 4：重启前端应用

**重要**：修改 `.env` 文件后必须重启！

```bash
# 1. 停止当前运行的服务
Ctrl + C

# 2. 重新启动
npm run dev
```

### 步骤 5：清除浏览器缓存

1. 关闭应用
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 重新打开应用
4. 重新登录

### 步骤 6：查看完整的控制台日志

打开开发者工具（F12），查看 Console 标签，应该看到：

**成功的日志**：
```
🔧 API 配置: {
  BASE_URL: "http://localhost:8080",
  WS_URL: "http://localhost:8080/ws"
}
🔌 初始化 WebSocket 客户端
📋 Token: 已设置
📋 WS URL: http://localhost:8080/ws
✅ WebSocket 客户端初始化完成
🔗 开始连接 WebSocket...
📡 激活 WebSocket 客户端
[STOMP Debug] Opening Web Socket...
[STOMP Debug] Web Socket Opened...
✅ WebSocket 连接成功！
📡 订阅私有消息队列: /user/queue/messages
✅ 私有消息队列订阅成功
```

**失败的日志**：
```
❌ WebSocket 错误: ...
❌ STOMP 错误: ...
❌ WebSocket 关闭
```

## 临时解决方案

如果后端 WebSocket 还没实现，可以先测试其他功能：

1. ✅ 登录/注册
2. ✅ 添加好友
3. ✅ 查看好友列表
4. ✅ 创建会话
5. ✅ 查看历史消息
6. ❌ 实时消息（需要 WebSocket）

## 后端需要实现的内容

### 1. WebSocket 配置类

文件：`src/main/java/com/chat/config/WebSocketConfig.java`

```java
package com.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 启用简单消息代理
        config.enableSimpleBroker("/topic", "/queue");
        
        // 设置应用目的地前缀
        config.setApplicationDestinationPrefixes("/app");
        
        // 设置用户目的地前缀
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 STOMP 端点
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")  // 允许所有来源
            .withSockJS();  // 启用 SockJS 降级选项
    }
}
```

### 2. 消息处理控制器

文件：`src/main/java/com/chat/controller/ChatController.java`

```java
package com.chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.List;

@Controller
public class ChatController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private MessageService messageService;
    
    /**
     * 处理聊天消息
     * 前端发送到: /app/chat/{sessionId}
     */
    @MessageMapping("/chat/{sessionId}")
    public void handleChatMessage(
        @DestinationVariable String sessionId,
        @Payload ChatMessageRequest request,
        Principal principal
    ) {
        String senderId = principal.getName();
        
        System.out.println("📨 收到消息 - 会话: " + sessionId + ", 发送者: " + senderId);
        
        // 1. 保存消息
        Message message = messageService.saveMessage(
            sessionId,
            senderId,
            request.getContent(),
            request.getMessageType()
        );
        
        // 2. 查询会话成员
        List<String> members = sessionService.getSessionMembers(sessionId);
        
        // 3. 转发给其他成员
        for (String memberId : members) {
            if (!memberId.equals(senderId)) {
                ChatMessageResponse response = new ChatMessageResponse();
                response.setId(message.getId());
                response.setSessionId(sessionId);
                response.setSendUser(senderId);
                response.setContent(request.getContent());
                response.setSendTime(message.getSendTime().toString());
                response.setMessageType(request.getMessageType());
                
                // 发送给特定用户
                messagingTemplate.convertAndSendToUser(
                    memberId,
                    "/queue/messages",
                    response
                );
                
                System.out.println("✅ 消息已转发给: " + memberId);
            }
        }
    }
}
```

### 3. 请求和响应对象

```java
// ChatMessageRequest.java
public class ChatMessageRequest {
    private String sessionId;
    private String content;
    private String messageType;
    private Boolean encrypted;
    
    // getters and setters
}

// ChatMessageResponse.java
public class ChatMessageResponse {
    private String id;
    private String sessionId;
    private String sendUser;
    private String content;
    private String sendTime;
    private String messageType;
    
    // getters and setters
}
```

## 测试后端 WebSocket

### 使用 curl 测试

```bash
# 测试 SockJS 端点
curl http://localhost:8080/ws/info

# 期望返回
{"entropy":123456789,"origins":["*:*"],"cookie_needed":true,"websocket":true}
```

### 使用浏览器测试

打开浏览器控制台，执行：

```javascript
const socket = new SockJS('http://localhost:8080/ws');
socket.onopen = () => console.log('✅ 连接成功');
socket.onerror = (e) => console.error('❌ 连接失败', e);
socket.onclose = () => console.log('连接关闭');
```

## 常见错误

### 错误 1：404 Not Found
**原因**：后端没有配置 WebSocket 端点

**解决**：添加 `WebSocketConfig` 类

### 错误 2：403 Forbidden
**原因**：CORS 或认证问题

**解决**：
1. 检查 `.setAllowedOriginPatterns("*")`
2. 检查 Token 是否正确

### 错误 3：连接后立即断开
**原因**：后端配置不完整

**解决**：确保配置了消息代理和应用前缀

## 下一步

1. **如果后端还没实现 WebSocket**：
   - 先实现 `WebSocketConfig`
   - 测试 `/ws/info` 端点
   - 再实现消息处理器

2. **如果后端已实现**：
   - 检查端点路径是否是 `/ws`
   - 检查是否启用了 SockJS
   - 查看后端日志是否有错误

3. **前端调试**：
   - 重启应用
   - 查看完整的控制台日志
   - 截图发给我

---

**更新时间**: 2024-02-27  
**优先级**: 🔴 高（阻塞实时消息功能）
