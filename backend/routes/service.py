import hashlib
import random
import string

from .models import User, Subscription
from .repository import UserRepository, SubscriptionRepository
from .mapper import UserMapper, SubscriptionMapper

class UserService:
  def __init__(self) -> None:
    self.repository = UserRepository()
    self.mapper = UserMapper()

  def get_all(self) -> list[User]:
    return self.repository.get_all()
  
  def get_one(self, user_uid: str) -> User:
    return self.repository.get_one(user_uid)
  
  def create_user(self, user: User) -> User:
    user_with_email: list[User] = self.repository.get_user_by_email(user.email)
    if len(user_with_email) > 0:
      raise ValueError(f"user with email {user.email} already exists")
    
    salt: str = "".join(random.choices(string.ascii_letters + string.digits, k=10))
    h_pwd = hashlib.sha256((salt + user.password).encode()).hexdigest()

    user.salt = salt
    user.password = h_pwd
    return self.repository.create_user(user)
  
  def login(self, email: str, password: str) -> User:
    user_with_email: list[User] = self.repository.get_user_by_email(email)
    if len(user_with_email) == 0:
      raise ValueError(f"user with email {email} does not exist")
    
    user = user_with_email[0]
    h_pwd = hashlib.sha256((user.salt + password).encode()).hexdigest()
    if h_pwd != user.password:
      raise ValueError("wrong password")
    return user

# # # Subscription Service # # #
class SubscriptionService:
  def __init__(self) -> None:
    self.repository = SubscriptionRepository()
    self.mapper = SubscriptionMapper()

  def get_all(self, user_uid: str) -> list[Subscription]:
      subscriptions = self.repository.get_all(user_uid)
      if not subscriptions:
          raise ValueError(f"No subscriptions found for user with ID {user_uid}")
      return subscriptions

  def get_one(self, subscription_id: str) -> Subscription:
    return self.repository.get_one(subscription_id)
  
  def create_subscription(self, subscription: Subscription) -> Subscription:
    return self.repository.create_subscription(subscription)

  def update_subscription(self, subscription: Subscription) -> Subscription:
    return self.repository.update_subscription(subscription)