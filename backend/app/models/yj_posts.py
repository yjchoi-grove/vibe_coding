from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from datetime import datetime
from ..database import Base
import pytz

# 한국 시간대 설정
seoul_tz = pytz.timezone('Asia/Seoul')

class YJPosts(Base):
    __tablename__ = 'yj_posts'
    __table_args__ = {'schema': 'vibecoding'}

    post_no = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    contents = Column(Text, nullable=True)
    img_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    author_usrid = Column(String(50), nullable=False)
    view_cnt = Column(Integer, default=0, nullable=False)
    is_delete = Column(String(1), default='N', nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(seoul_tz), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(seoul_tz), nullable=True) 