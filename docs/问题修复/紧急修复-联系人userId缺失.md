# 紧急修复 - 联系人 userId 缺失

## 问题描述

**错误信息**:
```
Uncaught (in promise) TypeError: Cannot read properties of null (reading 'Q')
at SessionList.vue:40:13
```

**触发条件**: 点击联系人列表中的联系人时

**根本原因**: 后端返回的联系人数据中缺少 `userId` 字段，导致前端无法创建会话

## 问题分析

### 前端期望的数据格式

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "relation-uuid-123",
      "userId": "user-uuid-456",        // ⚠️ 必需字段
      "username": "lyh1",
      "showName": "在线",
      "avatar": "",
      "remark": null,
      "addedTime": "2024-02-27T10:00:00",
      "publicKey": "..."
    }
  ]
}
```

### 后端实际返回的数据（推测）

根据错误信息，后端可能返回了：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "relation-uuid-123",
      "userId": null,                   // ❌ 问题：userId 为 null
      "username": "lyh1",
      "showName": "在线",
      // ...
    }
  ]
}
```

或者：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "relation-uuid-123",
      // ❌ 问题：完全没有 userId 字段
      "username": "lyh1",
      "showName": "在线",
      // ...
    }
  ]
}
```

## 前端已做的修复

### 1. 添加了数据验证

```typescript
// 在映射联系人时验证 userId
.map((relation: any) => {
  const contact = {
    userId: relation.userId || relation.toUserId || relation.id || '',
    // ...
  }
  
  // 验证必需字段
  if (!contact.userId) {
    console.error('⚠️ 联系人缺少 userId:', relation)
  }
  
  return contact
})
.filter(c => c.userId) // 过滤掉没有 userId 的联系人
```

### 2. 在点击联系人时添加验证

```typescript
const handleSelectContact = async (contact: Contact): Promise<void> => {
  // 验证联系人数据
  if (!contact.userId) {
    console.error('❌ 联系人缺少 userId，无法创建会话:', contact)
    alert('联系人数据错误，无法创建会话')
    return
  }
  // ...
}
```

## 后端需要修复的内容

### 问题定位

检查 `ContactController.getContactList()` 或 `ContactService.getContactList()` 方法，确认返回的数据中是否包含 `userId` 字段。

### 修复方案

#### 方案1: 确保 ContactRelationVO 包含 userId

```java
public class ContactRelationVO {
    private String id;              // 关系ID
    private String userId;          // ⚠️ 必需：好友的用户ID
    private String username;        // 好友的用户名
    private String showName;        // 好友的昵称
    private String avatar;          // 好友的头像
    private String remark;          // 备注
    private LocalDateTime addedTime;
    private String publicKey;
}
```

#### 方案2: 修复 Service 层的映射逻辑

```java
public List<ContactRelationVO> getContactList(String userId) {
    // 查询当前用户的好友关系
    List<ContactRelation> relations = contactRelationRepository
        .findByUserIdAndStatus(userId, RelationStatus.ACCEPTED);
    
    return relations.stream()
        .map(relation -> {
            // 获取好友的用户ID（不是当前用户的ID）
            String friendUserId = relation.getFromUserId().equals(userId) 
                ? relation.getToUserId() 
                : relation.getFromUserId();
            
            // 查询好友的用户信息
            User friend = userRepository.findById(friendUserId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
            
            ContactRelationVO vo = new ContactRelationVO();
            vo.setId(relation.getId());
            vo.setUserId(friend.getId());          // ⚠️ 重要：设置好友的用户ID
            vo.setUsername(friend.getUsername());
            vo.setShowName(friend.getShowName());
            vo.setAvatar(friend.getAvatar());
            vo.setRemark(relation.getRemark());
            vo.setAddedTime(relation.getAddedTime());
            vo.setPublicKey(friend.getPublicKey());
            
            return vo;
        })
        .collect(Collectors.toList());
}
```

### 关键点

1. **userId 必须是好友的用户ID**，不是关系ID，也不是当前用户的ID
2. **好友关系是双向的**，需要判断当前用户是 `fromUserId` 还是 `toUserId`
3. **必须关联用户表**，获取好友的完整信息

## 测试步骤

### 1. 检查后端返回的数据

在后端添加日志：

```java
@GetMapping("/list")
public Result<List<ContactRelationVO>> getContactList() {
    String userId = SecurityUtils.getCurrentUserId();
    List<ContactRelationVO> contacts = contactService.getContactList(userId);
    
    // 添加日志
    log.info("返回联系人列表: {}", contacts);
    for (ContactRelationVO contact : contacts) {
        log.info("联系人: userId={}, username={}, showName={}", 
            contact.getUserId(), contact.getUsername(), contact.getShowName());
    }
    
    return Result.success(contacts);
}
```

### 2. 检查前端接收的数据

刷新页面，查看浏览器控制台：

```
📇 加载联系人列表...
✅ 后端返回的联系人关系: [
  {
    "id": "...",
    "userId": "user-uuid-456",  // ⚠️ 检查这个字段是否存在且不为 null
    "username": "lyh1",
    "showName": "在线",
    ...
  }
]
```

### 3. 测试点击联系人

1. 点击联系人列表中的联系人
2. 查看控制台日志：

**如果 userId 正确**:
```
📞 选择联系人，创建会话: {userId: "user-uuid-456", username: "lyh1", ...}
🔗 调用 sessionApi.createPrivate，参数: {targetUserId: "user-uuid-456"}
```

**如果 userId 缺失**:
```
⚠️ 联系人缺少 userId: {id: "...", username: "lyh1", ...}
❌ 联系人缺少 userId，无法创建会话
```

## 数据库检查

### 检查 contact_relation 表

```sql
SELECT * FROM contact_relation WHERE user_id = '当前用户ID';
```

确认：
- `from_user_id` 和 `to_user_id` 是否正确
- `status` 是否为 'ACCEPTED'

### 检查 user 表

```sql
SELECT id, username, show_name FROM user WHERE id IN (
  SELECT to_user_id FROM contact_relation WHERE from_user_id = '当前用户ID'
  UNION
  SELECT from_user_id FROM contact_relation WHERE to_user_id = '当前用户ID'
);
```

确认好友的用户信息是否存在。

## 临时解决方案（前端）

如果后端暂时无法修复，前端可以使用关系ID作为临时方案：

```typescript
// 临时方案：使用关系ID
userId: relation.id || relation.userId || relation.toUserId || ''
```

但这不是正确的解决方案，因为：
1. 关系ID不是用户ID，无法用于创建会话
2. 会导致后续的会话创建失败

## 总结

**问题**: 后端返回的联系人列表中 `userId` 字段为 `null` 或缺失

**影响**: 无法点击联系人创建会话

**解决方案**: 
1. ✅ 前端已添加验证和错误提示
2. ⚠️ **后端需要修复 `GET /api/contact/list` 接口，确保返回正确的 `userId`**

**优先级**: 🔴 高（阻塞核心功能）

---

**文档时间**: 2024-02-27  
**状态**: 待后端修复  
**影响**: 无法创建会话、无法聊天
