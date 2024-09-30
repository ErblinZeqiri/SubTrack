import hashlib
import random
import string

from .models import User
from .repository import UserRepository
from .mapper import UserMapper

class UserService:
  def __init__(self) -> None:
    self.repository = UserRepository()
    self.mapper = UserMapper()

  def get_all(self) -> list[User]:
    return self.repository.get_all()
  
  def create_user(self, user: User) -> User:
    user_with_email: list[User] = self.repository.get_user_by_email(user.email)
    if len(user_with_email) > 0:
      raise ValueError(f"user with email {user.email} already exists")
    
    salt: str = "".join(random.choices(string.ascii_letters + string.digits, k=10))
    h_pwd = hashlib.sha256((salt + user.password).encode()).hexdigest()

    user.salt = salt
    user.password = h_pwd

    return self.repository.create_user(user)
