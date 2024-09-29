import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from firebase_admin.firestore import DocumentSnapshot

from config.firestore_db import db

from .user import User
from .user_mapper import UserMapper

class UserRepository:
  def __init__(self) -> None:
    self.collection = db.collection(u"users")
    self.mapper = UserMapper()

  def get_all(self) -> list[User]:
    return [self.mapper.to_user(ud) for ud in self.collection.get()]
  
  def get_one(self, user_uid: str) -> User:
    user = self.collection.document(user_uid).get()

    if not user.exists:
      raise ValueError(f"user with uid {user_uid} doesn't exists")
    
    return self.mapper.to_user(user)
  
  def create_user(self, user: User) -> User:
    _, user_ref = self.collection.add(self.mapper.to_firestore_dict(user))
    user.uid = user_ref.id
    return user
  
  def get_user_by_email(self, email: str) -> list[User]:
    return [self.mapper.to_user(d) for d in self.collection.where("email", "==", email).get()]