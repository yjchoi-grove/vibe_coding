from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from ..database import Base
import pytz

# 한국 시간대 설정
seoul_tz = pytz.timezone('Asia/Seoul')

class YJAttachments(Base):
    __tablename__ = 'yj_attachments'
    __table_args__ = {'schema': 'vibecoding'}

    seq = Column(Integer, primary_key=True, autoincrement=True)
    post_no = Column(Integer, ForeignKey('vibecoding.yj_posts.post_no'), nullable=False)
    file_nm = Column(String(255), nullable=False)
    org_file_nm = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    is_delete = Column(String(1), default='N', nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(seoul_tz), nullable=True) 