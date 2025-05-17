from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime
from ..database import Base

class YJUsers(Base):
    __tablename__ = 'yj_users'
    __table_args__ = {'schema': 'vibecoding'}

    usr_id = Column(String(50), primary_key=True)
    usr_nm = Column(String(200), nullable=False)
    pwd = Column(String(255), nullable=False)
    is_active = Column(String(1), default='Y', nullable=False)
    login_fail_cnt = Column(Integer, default=0, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True) 