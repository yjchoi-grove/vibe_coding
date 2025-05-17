from sqlalchemy.orm import Session
from ..models.yj_users import YJUsers
from ..routers.auth import get_password_hash

def migrate_passwords(db: Session):
    """기존 사용자들의 비밀번호를 해시화합니다."""
    users = db.query(YJUsers).all()
    for user in users:
        # 이미 해시화된 비밀번호인지 확인 (bcrypt 해시는 $2b$로 시작)
        if not user.pwd.startswith('$2b$'):
            user.pwd = get_password_hash(user.pwd)
    
    db.commit()
    print("비밀번호 마이그레이션이 완료되었습니다.") 