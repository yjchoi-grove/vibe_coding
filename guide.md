# 프로젝트 실행 가이드
이 문서는 백엔드와 프론트엔드 서버를 실행하고 테스트하는 방법을 설명합니다.

## 요구 사항
- Python 3.x
- Node.js 및 npm
- PowerShell

## 설치 및 실행

1. **가상 환경 생성 및 활성화**
   ```powershell
   cd backend
   python -m venv .venv
   & .\.venv\Scripts\Activate
   ```

2. **백엔드 종속성 설치**
   ```powershell
   pip install -r requirements.txt
   ```

3. **프론트엔드 종속성 설치**
   ```powershell
   cd ../frontend
   npm install
   ```

4. **서버 동시 실행**
   ```powershell
   powershell -ExecutionPolicy Bypass -File run_servers.ps1
   ```

   이 명령어를 사용하면 백엔드와 프론트엔드 서버가 동시에 실행됩니다.

## 서버 주소
- **백엔드 Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **프론트엔드 애플리케이션**: [http://localhost:3000](http://localhost:3000)

이 문서를 통해 프로젝트를 쉽게 실행하고 테스트할 수 있습니다. 

