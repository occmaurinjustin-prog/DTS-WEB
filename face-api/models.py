from database import db
from datetime import datetime

class FaceRegistration(db.Model):
    __tablename__ = 'face_registrations'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, nullable=False)
    face_encoding = db.Column(db.Text(length=4294967295), nullable=False) # LONGTEXT
    registered_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
