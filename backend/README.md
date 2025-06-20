# Karangue221 Backend

## Default Users

The system comes with two default users:

1. **Owner User**
   - Email: admin@karangue221.com
   - Password: karangue_owner_2025
   - Role: owner
   - This user has full access to all system features

2. **Admin User**
   - Email: manager@karangue221.com
   - Password: karangue_admin_2025
   - Role: admin
   - This user has administrative access to most system features

## How to Run the Migration Scripts

To add the default users to the database, execute the following SQL script:

```bash
mysql -u [username] -p [database_name] < migrations/add_default_users.sql
```

or from within MySQL:

```sql
SOURCE migrations/add_default_users.sql;
```

For security reasons, it's recommended to change these default passwords after the first login.
