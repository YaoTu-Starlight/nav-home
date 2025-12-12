const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const publicDir = path.join(rootDir, 'public');
const staticDir = path.join(nextDir, 'static');
const distDir = path.join(rootDir, 'dist');
const distServerPath = path.join(distDir, 'server.js');

console.log('📦 生成 dist...');
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir);

console.log('- 复制 standalone...');
fs.cpSync(standaloneDir, distDir, { recursive: true });

console.log('- 复制 public...');
const distPublic = path.join(distDir, 'public');
if (fs.existsSync(publicDir)) fs.cpSync(publicDir, distPublic, { recursive: true });

console.log('- 复制 static...');
const distNextStatic = path.join(distDir, '.next', 'static');
fs.mkdirSync(path.join(distDir, '.next'), { recursive: true });
if (fs.existsSync(staticDir)) fs.cpSync(staticDir, distNextStatic, { recursive: true });

console.log('- 复制 data...');
const sourceDataDir = path.join(rootDir, 'src', 'data');
const distDataDir = path.join(distDir, 'src', 'data');
fs.mkdirSync(distDataDir, { recursive: true });
if (fs.existsSync(sourceDataDir)) {
    fs.cpSync(sourceDataDir, distDataDir, { recursive: true });
} else {
    fs.writeFileSync(path.join(distDataDir, 'data.json'), '[]');
}

console.log('🔧 锁定端口(3300)和IP(0.0.0.0)...');
if (fs.existsSync(distServerPath)) {
  let content = fs.readFileSync(distServerPath, 'utf8');
  content = content.replace(/const currentPort = parseInt\(process\.env\.PORT, 10\) \|\| \d+/, "const currentPort = parseInt(process.env.PORT, 10) || 3300");
  content = content.replace(/const hostname = process\.env\.HOSTNAME \|\| '0\.0\.0\.0'/, "const hostname = '0.0.0.0'");
  fs.writeFileSync(distServerPath, content);
}
console.log('✅ 构建完成！');