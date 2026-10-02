# Crafty 部署到 1 GB Debian 单机

目标机器：KVM / 1 核 / 964 MiB 内存 / 9 GB 磁盘（约 5.8 GB 可用）/ Debian 11。

形态：**systemd 裸进程**（不装 Docker）、Caddy 做公网 HTTPS 边缘、Tailscale 作为主用接入路径。

目录约定：`/opt/crafty` 是运行根目录，三个服务都以它为 cwd。

```
/opt/crafty
├── src/prisma/contract.json     # Prisma contract，运行时按 cwd 解析
├── web/                          # Next.js standalone (server.js + .next + node_modules)
├── collab/                       # server.mjs / tldraw-server.mjs + 独立 node_modules
└── deploy/                       # 运维资产：systemd unit / Caddyfile / 备份脚本

运行时状态在别处：`/etc/crafty/*.env`（700，密钥）、`/var/backups/crafty`（转储暂存）。
```

---

## 0. 开工前必须知道的两件事

**① Debian 11 已于 2026-08-31 EOL，不再有安全更新。**
同时又要暴露公网 HTTPS（你选了"两者都要"）。这是当前风险最高的组合。缓解措施见第 10 节，务必逐条做完。如果之后改变主意，重装 Debian 12 是彻底解法。

**② tldraw 白板没有 License Key 不能上生产。**
无 Key 时画布会正常渲染 5 秒然后整块变空白——不是显示水印，是变空白。申请免费的 Hobby License 之前，请把 `NEXT_PUBLIC_TLDRAW_LICENSE_KEY` 留空并**不要**开放 sync 子域名给公网。详见 `docs/adr/0002-tldraw-license.md`。

---

## 1. 在构建机上打包（不要在这台机器上 build）

`next build` 峰值 2–4 GB，964 MiB 必 OOM。

```bash
npm ci
npm run contract:emit     # 生成 src/prisma/contract.json
npm run build             # 生成 .next/standalone
./deploy/package.sh       # 产出 crafty-deploy-<时间戳>.tar.gz
```

产物 scp 到目标机：

```bash
scp crafty-deploy-*.tar.gz root@<host>:/opt/
```

> 依赖全部是纯 JS（`@prisma/orm-postgres` 走 `pg` 驱动，无 `.node` 原生二进制），
> 所以跨平台构建无需 `binaryTargets`，也不需要 Docker 来做平台对齐。

---

## 2. 安装运行时

```bash
apt update && apt install -y postgresql caddy nginx-extras 2>/dev/null || apt install -y postgresql caddy
```

**Node 22** —— 优先 NodeSource；若 bullseye 源已下线，用官方 tarball（glibc 2.31 满足要求）：

```bash
cd /opt && curl -fsSLO https://nodejs.org/dist/v22.22.2/node-v22.22.2-linux-x64.tar.xz
tar -xJf node-v22.22.2-linux-x64.tar.xz && ln -sf /opt/node-v22.22.2-linux-x64/bin/node /usr/bin/node
node -v   # v22.22.2
```

---

## 3. 用户与目录

```bash
useradd --system --home /opt/crafty --shell /usr/sbin/nologin crafty
mkdir -p /opt/crafty /etc/crafty /var/log/caddy
cd /opt && tar -xzf crafty-deploy-*.tar.gz -C /opt/crafty
cd /opt/crafty/collab && npm install --omit=dev      # 只装协作进程所需，约 60 MB
chown -R crafty:crafty /opt/crafty
chmod 700 /etc/crafty
```

---

## 4. 数据库

```bash
su - postgres -c "psql" <<'SQL'
CREATE USER crafty_app WITH PASSWORD '<强密码>';
CREATE DATABASE crafty OWNER crafty_app;
SQL
```

把建好的连接串填进 `/etc/crafty/crafty.env`（模板见 `deploy/env.template`）。

迁移与 contract：schema 真源是 `prisma/schema.prisma`，迁移在**构建机**上执行 `prisma migrate deploy`，目标机只跑应用。

---

## 5. 环境变量

```bash
cp /opt/crafty/deploy/env.template /etc/crafty/crafty.env
chmod 600 /etc/crafty/crafty.env
$EDITOR /etc/crafty/crafty.env
```

`NEXTAUTH_SECRET` 与 `AUTH_SECRET` **必须填同一个值**——next-auth v5 和 collab token 校验器读的是不同名字的同一把钥匙。

三个密钥：`openssl rand -hex 32`。

---

## 6. systemd

```bash
cp /opt/crafty/deploy/systemd/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now crafty-web crafty-collab crafty-tldraw
journalctl -u crafty-web -u crafty-collab -u crafty-tldraw -f
```

三个服务都只监听 `127.0.0.1`，公网不可达。

内存上限已写进 unit（`MemoryMax`）。**先用默认值跑一周，再用 `systemd-cgtop -m` 实测**，不要凭感觉调。

---

## 7. Caddy

```bash
cp /opt/crafty/deploy/Caddyfile /etc/caddy/Caddyfile
$EDITOR /etc/caddy/Caddyfile          # 换成你的三个域名
systemctl enable --now caddy
```

三个域名都要解析到这台机器：

| 域名 | 后端 |
|---|---|
| `crafty.example.com` | 127.0.0.1:3000 |
| `collab.crafty.example.com` | 127.0.0.1:3001 |
| `sync.crafty.example.com` | 127.0.0.1:3002 |

**为什么用子域名而不是路径前缀**：Hocuspocus 客户端连的是 WS 根路径，用 `/collab` 做路径路由需要服务端接受它并不支持的子路径升级。子域名方案完全不用改代码。

---

## 8. 内存：开 zram

1 GB 物理内存 + 磁盘 swap 会让机器在压力下爬。改用压缩内存 swap：

```bash
apt install -y zram-tools
cat > /etc/default/zramswap <<'EOF'
ALGO=lzo-rle
PERCENT=50
PRIORITY=100
EOF
systemctl enable --now zramswap
swapon --show
```

同时把原来的磁盘 swap 优先级调低（`swapon --priority=1 /dev/...`），让 zram 先被用到。

---

## 9. PostgreSQL 调参

```bash
cp /opt/crafty/deploy/postgres/crafty.conf /etc/postgresql/13/main/conf.d/
systemctl restart postgresql
```

目标是让 PG 停在 110–150 MB，给另外三个 Node 进程和 Caddy 留位置。默认配置（shared_buffers=128MB）在开机那一刻就吃掉六分之一内存。

---

## 10. Debian 11 EOL 的缓解措施（公网暴露时必须做）

系统层面拿不到补丁了，只能把暴露面压到最小：

```bash
# 只放行 80/443 和 Tailscale；数据库与三个应用端口一律不外露
ufw default deny incoming
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 41641/udp          # Tailscale
ufw enable

# SSH 只允许密钥，禁密码
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart sshd

apt install -y fail2ban && systemctl enable --now fail2ban
```

另外：

- `apt` 已无安全更新源，但**应用层要持续更新**——定期 `npm audit` / 升级 Node 补丁版
- 需要系统级补丁可买 Freexian Extended LTS（付费，bullseye 支持到 2031-06-30）
- 主用路径走 Tailscale，公网域名只当备用入口，能显著降低被扫描命中的概率

---

## 11. 备份（本地加密 → CloudBase 云存储）

**这是 CloudBase 在本方案里唯一的用途。** 应用、collab、数据库全在本机，只有
`pg_dump` 的加密副本上传到云存储。

### 11.1 先想清楚成本

| 项 | 说明 |
|---|---|
| CloudBase 个人版订阅 | 备份存它所依赖的前提。环境到期未续费 → 存储可能随环境回收 |
| 若停掉续费 | 备份无处可去，需改道 rclone 同步到其他有免费额度的对象存储 |

也就是说**备份不是免费的，成本就是那份订阅费**。如果觉得不值，别把备份停掉——换目的地，别省这一步。

### 11.2 先确认一件事

如果这台 VPS 本身也在腾讯云上海，那"上传到 CloudBase 上海"**不算异地**。它能防误删和数据库损坏，防不了地域级故障。要真异地就得换一个地域或换一家。

### 11.3 安装 tcb CLI

装在独立目录，别污染全局：

```bash
mkdir -p /opt/tcb && cd /opt/tcb
npm init -y >/dev/null
npm i @cloudbase/cli
ln -sf /opt/tcb/node_modules/.bin/tcb /usr/local/bin/tcb
tcb --version          # 要求 >= 3.0.0
```

### 11.4 免浏览器登录（关键）

无头 VPS 上跑不了 `tcb login` 的设备码流程吗？其实可以——设备码允许在**另一台**机器
的浏览器里授权。但定时任务要的是**非交互**凭证，所以用环境 API Key：

```bash
tcb login --cloudbase-api-key <你的环境APIKey> -e <envId>
```

环境 API Key 在 CloudBase 控制台 → 环境设置里创建（需要管理员权限）。它和腾讯云
账号的 SecretId/SecretKey **不是一回事**，不要混用。

登录一次即可，凭证由 CLI 自己持久化，之后定时任务直接跑。

### 11.5 配置

```bash
cp /opt/crafty/deploy/backup/backup.env.example /etc/crafty/backup.env
chmod 600 /etc/crafty/backup.env
$EDITOR /etc/crafty/backup.env
```

`BACKUP_PASSPHRASE` **生成一次，存进密码管理器**：

```bash
openssl rand -base64 48
```

丢了这串字符，所有已上传的备份都是废数据。

### 11.6 启用定时任务

```bash
cp /opt/crafty/deploy/systemd/crafty-backup.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now crafty-backup.timer
systemctl list-timers crafty-backup.timer
```

用的是 systemd timer 而不是 cron：日志自动进 journal，漏跑会补跑，失败可被 `OnFailure` 捕获。

### 11.7 必须手动跑一次并验证

```bash
systemctl start crafty-backup.service
journalctl -u crafty-backup -n 50

tcb storage list crafty-backups/ -e <envId>     # 确认对象在
```

**然后必须做一次恢复演练**——没演练过的备份等于没有备份。恢复到临时库，别直接往生产库上试：

```bash
su - postgres -c "createdb -O crafty_app crafty_restore_test"
PGDATABASE=crafty_restore_test /opt/crafty/deploy/backup/crafty-restore.sh <对象名>.enc
su - postgres -c "psql -d crafty_restore_test -c 'SELECT count(*) FROM \"Document\";'"
```

### 11.8 真实恢复（生产）

```bash
/opt/crafty/deploy/backup/crafty-restore.sh crafty-20261001T040000Z.dump.enc
```

脚本会**先停掉三个服务再恢复**。这不是保守——collab 进程内存里还挂着 Yjs 房间，
会在 debounce 到期时把旧状态 flush 回数据库，把你刚恢复的内容覆盖掉。

恢复会 `--clean --if-exists` 重建所有表，并要求你手输数据库名确认。

### 11.9 云端轮转

脚本只轮转本地（默认 7 天），云端不做自动删除。定期手动清理：

```bash
tcb storage list crafty-backups/ -e <envId>
tcb storage rm "crafty-backups/crafty-20260*.enc" --dry-run -e <envId>   # 先预览
tcb storage rm "crafty-backups/crafty-20260*.enc" --force  -e <envId>    # 再执行
```

通配符**必须加引号**，否则会被本地 shell 展开。`--dry-run` 先看清楚再删。

### 11.10 关于加密

dump 用 `aes-256-cbc` + PBKDF2 在**本地**加密后才上传。云存储里放的是密文，
但**云端的对象名和时间戳是明文**——所以文件名里不要带文档标题之类的信息（当前没有）。

---

## 12. 验证清单

```bash
systemctl status crafty-web crafty-collab crafty-tldraw postgresql caddy
systemctl list-timers crafty-backup.timer
free -m && swapon --show
systemd-cgtop -m                      # 稳态内存占用
curl -fsS https://crafty.example.com/api/health
```

备份：

```bash
systemctl start crafty-backup.service && journalctl -u crafty-backup -n 50
tcb storage list crafty-backups/ -e <envId>
```

端到端：开两个设备编辑同一篇文档，确认秒级双向同步；断网重连后内容不丢。
按 11.7 做过一次恢复演练后再认为部署完成。

---

## 已知取舍

- 三个 Node 进程各占一份运行时基线（约 50 MB）。若内存紧张，把 `server.mjs` 与
  `tldraw-server.mjs` 合并成单进程可省回约 50 MB——代价是要改 `src/collab/`。
- `MemoryMax` 是粗估值，必须实测后再定。
- 派生镜像（`Document.content`）最多落后 5 秒，见 `docs/adr/0001-document-body-single-source-of-truth.md`。
