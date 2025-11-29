# PostgreSQL Migration Guide

Since Render's free tier only supports PostgreSQL (not MySQL), you'll need to migrate your MySQL-based services (Auth Service and Student Service) to use PostgreSQL.

## 🔄 Quick Migration Steps

### 1. Update Dependencies

#### Auth Service (`backend/auth-service/pom.xml`)

Replace the MySQL dependency:

```xml
<!-- Remove this -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Add this -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

#### Student Service (`backend/student-service/pom.xml`)

Replace:

```xml
<!-- Remove this -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>

<!-- Add this -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. Update Application Configuration

#### Auth Service (`backend/auth-service/src/main/resources/application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:scholara_auth}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    properties:
      hibernate:
        format_sql: true
```

#### Student Service (`backend/student-service/src/main/resources/application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:scholara_students}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    properties:
      hibernate:
        format_sql: true
```

### 3. Update Entity Annotations (if needed)

PostgreSQL has different auto-increment syntax. Update any entities with ID generation:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Works for both MySQL and PostgreSQL
    private Long id;
    
    // ... other fields
}
```

### 4. Test Locally with PostgreSQL

#### Using Docker:

```bash
# Start PostgreSQL
docker run -d \
  --name postgres-local \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=scholara_students \
  -p 5432:5432 \
  postgres:15-alpine

# Test your services
cd backend/auth-service
mvn spring-boot:run

cd backend/student-service
mvn spring-boot:run
```

### 5. Common Migration Issues

#### Issue 1: Auto-increment Syntax
**MySQL**: `AUTO_INCREMENT`
**PostgreSQL**: `SERIAL` or `IDENTITY`

**Solution**: Use JPA's `@GeneratedValue(strategy = GenerationType.IDENTITY)`

#### Issue 2: Boolean Type
**MySQL**: `TINYINT(1)`
**PostgreSQL**: `BOOLEAN`

**Solution**: JPA handles this automatically

#### Issue 3: String Comparison
**MySQL**: Case-insensitive by default
**PostgreSQL**: Case-sensitive

**Solution**: Use `LOWER()` in queries or configure collation

```java
@Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
User findByEmail(@Param("email") String email);
```

#### Issue 4: Date/Time Functions
**MySQL**: `NOW()`
**PostgreSQL**: `NOW()` or `CURRENT_TIMESTAMP`

**Solution**: Use JPA's `@CreationTimestamp` and `@UpdateTimestamp`

```java
@CreationTimestamp
@Column(name = "created_at", updatable = false)
private LocalDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at")
private LocalDateTime updatedAt;
```

### 6. Data Migration (Optional)

If you have existing data in MySQL:

```bash
# Export from MySQL
mysqldump -u root -p scholara_students > mysql_dump.sql

# Convert to PostgreSQL format (use pgloader)
pgloader mysql://user:password@localhost/scholara_students \
         postgresql://postgres:postgres@localhost/scholara_students
```

## ✅ Verification Checklist

- [ ] Dependencies updated in `pom.xml`
- [ ] `application.yml` updated with PostgreSQL configuration
- [ ] Local PostgreSQL instance running
- [ ] Services start without errors
- [ ] Database tables created automatically
- [ ] CRUD operations working
- [ ] Tests passing (if any)

## 🚀 Alternative: Keep MySQL

If you prefer to keep MySQL, use an external MySQL provider:

### Option 1: PlanetScale (Free Tier Available)
- 5GB storage
- 1 billion row reads/month
- Serverless

### Option 2: Railway (Free Trial)
- $5 free credit/month
- MySQL support

### Option 3: Aiven (Free Trial)
- 30-day trial
- Managed MySQL

Update your Render environment variables to point to the external MySQL database.

---

**Recommendation**: PostgreSQL is the easier path for Render deployment and is fully compatible with your application with minimal changes.
