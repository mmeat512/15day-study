# PM2 백그라운드 실행 가이드

## 개요

이 프로젝트는 PM2를 사용하여 백그라운드에서 실행되며, 모든 로그를 자동으로 파일로 저장합니다.

## 빠른 시작

### 1. 백그라운드로 애플리케이션 시작

```bash
npm run pm2:start
```

애플리케이션이 백그라운드에서 시작되고, 터미널을 닫아도 계속 실행됩니다.

### 2. 상태 확인

```bash
npm run pm2:status
```

**출력 예시:**
```
┌────┬────────────────────┬─────────┬─────────┬──────────┬────────┬───────────┬──────────┐
│ id │ name               │ mode    │ pid     │ uptime   │ ↺      │ status    │ mem      │
├────┼────────────────────┼─────────┼─────────┼──────────┼────────┼───────────┼──────────┤
│ 0  │ stock-study-web    │ cluster │ 11534   │ 1m       │ 0      │ online    │ 46.2mb   │
└────┴────────────────────┴─────────┴─────────┴──────────┴────────┴───────────┴──────────┘
```

### 3. 실시간 로그 확인

```bash
npm run pm2:logs
```

실시간으로 애플리케이션의 로그를 확인할 수 있습니다. Ctrl+C로 종료합니다.

### 4. 애플리케이션 중지

```bash
npm run pm2:stop
```

### 5. 애플리케이션 재시작

```bash
npm run pm2:restart
```

## 로그 관리

### 로그 파일 위치

모든 로그는 `logs/` 디렉토리에 저장됩니다:

```
logs/
├── out.log         # 표준 출력 (stdout)
├── error.log       # 에러 로그 (stderr)
└── combined.log    # 통합 로그 (모든 로그)
```

### 로그 보기

#### 실시간 로그 (tail -f 방식)

```bash
npm run pm2:logs
```

#### 파일로 저장된 로그 보기

```bash
# 표준 출력 로그
cat logs/out.log

# 에러 로그
cat logs/error.log

# 통합 로그 (JSON 형식)
cat logs/combined.log

# 마지막 100줄 보기
tail -100 logs/combined.log

# 실시간으로 로그 따라가기
tail -f logs/combined.log
```

### 로그 형식

로그는 JSON 형식으로 저장되며, 다음 정보를 포함합니다:

```json
{
  "message": "애플리케이션 메시지",
  "timestamp": "2025-12-10 00:46:19 +09:00",
  "type": "out",
  "process_id": 0,
  "app_name": "stock-study-web"
}
```

### 로그 삭제

```bash
npm run pm2:logs:clear
```

## 프로세스 모니터링

### 실시간 모니터링 대시보드

```bash
npm run pm2:monitor
```

CPU, 메모리 사용량, 프로세스 상태 등을 실시간으로 모니터링할 수 있습니다.

## PM2 명령어 전체 목록

| 명령어 | 설명 |
|--------|------|
| `npm run pm2:start` | 애플리케이션 시작 |
| `npm run pm2:stop` | 애플리케이션 중지 |
| `npm run pm2:restart` | 애플리케이션 재시작 |
| `npm run pm2:delete` | PM2에서 애플리케이션 제거 |
| `npm run pm2:logs` | 실시간 로그 보기 |
| `npm run pm2:logs:clear` | 모든 로그 삭제 |
| `npm run pm2:monitor` | 실시간 모니터링 대시보드 |
| `npm run pm2:status` | 프로세스 상태 확인 |

## 고급 설정

### ecosystem.config.js

PM2 설정은 `ecosystem.config.js` 파일에서 관리됩니다:

```javascript
module.exports = {
  apps: [
    {
      name: 'stock-study-web',
      script: 'npm',
      args: 'run dev',
      instances: 1,              // 실행할 인스턴스 수
      autorestart: true,         // 자동 재시작
      max_memory_restart: '1G',  // 메모리 제한
      output: './logs/out.log',
      error: './logs/error.log',
      log: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

### 환경 변수 추가

`ecosystem.config.js`의 `env` 섹션에 환경 변수를 추가할 수 있습니다:

```javascript
env: {
  NODE_ENV: 'development',
  PORT: 3090,
  // 추가 환경 변수
  CUSTOM_VAR: 'value',
}
```

## 문제 해결

### 애플리케이션이 시작되지 않을 때

```bash
# PM2 로그 확인
npm run pm2:logs

# 프로세스 완전히 삭제 후 재시작
npm run pm2:delete
npm run pm2:start
```

### 포트가 이미 사용 중일 때

```bash
# 프로세스 중지
npm run pm2:stop

# 포트 사용 중인 프로세스 확인 (macOS/Linux)
lsof -i :3090

# 해당 프로세스 종료
kill -9 <PID>
```

### PM2 데몬 재시작

```bash
pm2 kill
npm run pm2:start
```

## 서버 재시작 시 자동 실행 (선택사항)

서버가 재부팅될 때 자동으로 애플리케이션을 시작하려면:

```bash
# PM2 startup 스크립트 생성
pm2 startup

# 현재 실행 중인 프로세스 저장
pm2 save
```

## 팁

1. **개발 중**: 코드 변경 시 자동으로 재시작하려면 `npm run dev`를 직접 사용하세요.
2. **백그라운드 실행**: 장시간 실행이 필요할 때 PM2를 사용하세요.
3. **로그 모니터링**: 문제 발생 시 로그를 먼저 확인하세요.
4. **메모리 관리**: 메모리 사용량이 1GB를 초과하면 자동으로 재시작됩니다.

## 참고 자료

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 로그 관리](https://pm2.keymetrics.io/docs/usage/log-management/)
- [PM2 프로세스 관리](https://pm2.keymetrics.io/docs/usage/process-management/)
