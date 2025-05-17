from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from ..database import Base

class YJComments(Base):
    __tablename__ = 'yj_comments'
    __table_args__ = {'schema': 'vibecoding'}

    seq = Column(Integer, primary_key=True, autoincrement=True)
    post_no = Column(Integer, ForeignKey('vibecoding.yj_posts.post_no'), nullable=False)
    author_usrid = Column(String(50), nullable=False)
    contents = Column(String(500), nullable=True)
    parent_cmmt_no = Column(Integer, default=0, nullable=False)
    is_delete = Column(String(1), default='N', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=True) 