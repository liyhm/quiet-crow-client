# 后端 CORS 配置指南

## 🔍 问题确认

### 问题 1: 本地开发环境连接本地后端

根据错误信息：

```
Access to XMLHttpRequest at 'http://localhost:8080/api/session/my' from origin 'http://localhost:5173'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**确认**：这是后端 CORS 配置问题，需要在后端添加 CORS 配置。

### 问题 2: 本地开发环境连接正式环境后端（当前问题）

根据错误信息：

```
Access to XMLHttpRequest at 'http://159.75.182.85:8081/api/auth/login' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**确认**：正式环境后端的 CORS 配置只允许了特定的源，没有包括开发环境的 `http://localhost:5173`。

**解决方案**：在正式环境后端的 CORS 配置中添加开发环境的源。

## 📋 后端配置步骤

### 推荐配置：支持开发环境连接正式环境

**适用场景**：开发人员需要在本地开发环境（localhost:5173）连接正式环境后端（159.75.182.85:8081）进行测试。

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 允许本地开发环境的所有端口
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("http://127.0.0.1:*");
        
        // 如果需要支持生产环境前端，添加具体域名
        // config.addAllowedOrigin("https://your-domain.com");

        // 允许的方法
        config.addAllowedMethod("*");

        // 允许的请求头
        config.addAllowedHeader("*");

        // 允许携带凭证
        config.setAllowCredentials(true);

        // 预检请求的有效期
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

**重要说明**：
- 使用 `allowedOriginPattern` 而不是 `allowedOrigin`，因为需要支持通配符
- `http://localhost:*` 允许所有本地端口（5173, 3000, 8080 等）
- 这个配置适用于开发和测试环境，生产环境应该使用更严格的配置

---

### 方案 1: 使用 @CrossOrigin 注解（快速测试）

在 Controller 类上添加注解：

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class YourController {
    // ...
}
```

### 方案 2: 全局 CORS 配置（推荐）

创建配置类 `CorsConfig.java`：

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 允许的源
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        
        // 如果需要允许开发环境连接正式环境，添加：
        // config.addAllowedOriginPattern("http://localhost:*");
        // config.addAllowedOriginPattern("http://127.0.0.1:*");

        // 允许的方法
        config.addAllowedMethod("*");

        // 允许的请求头
        config.addAllowedHeader("*");

        // 允许携带凭证
        config.setAllowCredentials(true);

        // 预检请求的有效期
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 方案 3: WebMvcConfigurer 方式

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## 🔧 WebSocket CORS 配置

如果使用 WebSocket，还需要配置：

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

## ✅ 验证配置

### 1. 重启后端

```bash
# 停止后端
# 重新启动
./mvnw spring-boot:run
```

### 2. 检查后端日志

启动后应该看到类似日志：

```
Mapped "{[/**],methods=[GET || POST || PUT || DELETE]}" onto ...
```

### 3. 测试 CORS

使用 curl 测试：

```bash
curl -X OPTIONS http://localhost:8080/api/session/my \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

应该看到响应头包含：

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
```

### 4. 重启前端测试

```bash
npm run dev
```

## 🐛 常见问题

### Q1: 配置后还是有 CORS 错误？

**检查**:

1. 确认后端已重启
2. 确认配置类在正确的包下
3. 确认配置类有 `@Configuration` 注解
4. 检查是否有其他 CORS 配置冲突

### Q2: OPTIONS 请求失败？

**原因**: 预检请求被拦截器拦截

**解决**: 在 Security 配置中允许 OPTIONS 请求：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .cors().and()
        .csrf().disable()
        .authorizeRequests()
        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        // ...
}
```

### Q3: 带 Token 的请求失败？

**检查**:

1. `allowCredentials` 必须为 `true`
2. `allowedOrigins` 不能使用 `*`，必须指定具体域名
3. 前端请求必须设置 `withCredentials: true`（axios 已配置）

## 📝 完整配置示例

### Spring Boot 2.x

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### Spring Boot 3.x（推荐用于正式环境）

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 使用 allowedOriginPattern 支持通配符（Spring Boot 3.x 推荐）
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("http://127.0.0.1:*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

**说明**：使用 `allowedOriginPattern` 可以支持任意端口，这样开发环境无论使用什么端口都能连接。

## 🔒 生产环境配置

生产环境应该限制允许的源：

```java
@Configuration
@Profile("prod")
public class ProdCorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 只允许生产环境域名
        config.addAllowedOrigin("https://your-domain.com");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## ✅ 检查清单

配置完成后检查：

- [ ] 创建了 CORS 配置类
- [ ] 添加了 `@Configuration` 注解
- [ ] 配置了允许的源（`http://localhost:5173`）
- [ ] 配置了允许的方法
- [ ] 配置了 `allowCredentials(true)`
- [ ] 重启了后端服务
- [ ] 测试了 OPTIONS 请求
- [ ] 前端可以正常请求

---

**配置完成后，前端应该能正常连接后端了！**
